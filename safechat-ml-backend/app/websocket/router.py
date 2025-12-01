import asyncio
import contextlib
import json
from typing import Any, Dict, Tuple

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.schemas.moderation import ModerationEvent
from app.services.moderation_logic import ModerationEngine

router = APIRouter()


def get_engine(websocket: WebSocket) -> ModerationEngine:
    engine = getattr(websocket.app.state, "moderation_engine", None)
    if not engine:
        raise RuntimeError("Moderation engine not ready")
    return engine


class ModerationBatcher:
    """
    Collects websocket messages and moderates them in batches to reduce GPU overhead.
    """

    def __init__(self, engine: ModerationEngine, batch_size: int = 32, max_wait: float = 0.01):
        self.engine = engine
        self.batch_size = batch_size
        self.max_wait = max_wait
        self.queue: asyncio.Queue[Tuple[Dict[str, Any], asyncio.Future]] = asyncio.Queue()
        self.task = asyncio.create_task(self._worker())

    async def _worker(self):
        while True:
            payloads: Tuple[Dict[str, Any], asyncio.Future] = await self.queue.get()
            items = [payloads]
            try:
                while len(items) < self.batch_size:
                    try:
                        next_item = await asyncio.wait_for(self.queue.get(), timeout=self.max_wait)
                        items.append(next_item)
                    except asyncio.TimeoutError:
                        break

                texts = [item[0]["text"] for item in items]
                user_ids = [item[0].get("user_id") for item in items]
                chat_ids = [item[0].get("chat_id") for item in items]
                message_ids = [item[0].get("message_id") for item in items]

                decisions = await self.engine.moderate_batch(
                    texts, user_ids, chat_ids, message_ids
                )
                for (payload, future), decision in zip(items, decisions):
                    if not future.done():
                        future.set_result(decision)
            except Exception as exc:
                for _, future in items:
                    if not future.done():
                        future.set_exception(exc)

    async def submit(self, payload: Dict[str, Any]):
        loop = asyncio.get_running_loop()
        future: asyncio.Future = loop.create_future()
        await self.queue.put((payload, future))
        return await future

    async def shutdown(self):
        self.task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await self.task


@router.websocket("/ws/moderation")
async def moderation_ws(websocket: WebSocket, engine: ModerationEngine = Depends(get_engine)):
    await websocket.accept()
    batch_size = getattr(websocket.app.state, "ws_batch_size", 32)
    batch_wait = getattr(websocket.app.state, "ws_batch_wait", 0.01)
    batcher = ModerationBatcher(engine, batch_size=batch_size, max_wait=batch_wait)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            decision = await batcher.submit(data)
            event = ModerationEvent(
                event="moderation_result",
                action=decision.action,
                label=decision.label,
                score=decision.score,
                sanitized_text=decision.sanitized_text,
                user_id=data.get("user_id"),
                chat_id=data.get("chat_id"),
                reason=decision.moderator_reason,
            )
            await websocket.send_json(event.dict())
            if decision.action == "escalate":
                await websocket.send_json(
                    ModerationEvent(
                        event="escalate",
                        action=decision.action,
                        label=decision.label,
                        score=decision.score,
                        reason=decision.moderator_reason,
                        user_id=data.get("user_id"),
                        chat_id=data.get("chat_id"),
                        message_id=data.get("message_id"),
                    ).dict()
                )
    except WebSocketDisconnect:
        return
    finally:
        await batcher.shutdown()
