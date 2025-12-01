from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.schemas.moderation import (
    BatchModerateRequest,
    BatchModerateResponse,
    ModerateRequest,
    ModerateResponse,
)
from app.services.moderation_logic import ModerationEngine

router = APIRouter()


def get_engine(request: Request) -> ModerationEngine:
    engine = getattr(request.app.state, "moderation_engine", None)
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Moderation engine not ready",
        )
    return engine


@router.post("/moderate", response_model=ModerateResponse)
async def moderate(payload: ModerateRequest, engine: ModerationEngine = Depends(get_engine)):
    decision = await engine.moderate(
        payload.text, payload.user_id, payload.chat_id, payload.message_id
    )
    return ModerateResponse(
        label=decision.label,
        score=decision.score,
        action=decision.action,
        sanitized_text=decision.sanitized_text,
        moderator_reason=decision.moderator_reason,
    )


@router.post("/moderate/batch", response_model=BatchModerateResponse)
async def moderate_batch(
    payload: BatchModerateRequest, engine: ModerationEngine = Depends(get_engine)
):
    if len(payload.items) > 200:
        raise HTTPException(status_code=400, detail="Batch limit is 200 messages")

    texts = [item.text for item in payload.items]
    user_ids = [item.user_id for item in payload.items]
    chat_ids = [item.chat_id for item in payload.items]
    message_ids = [item.message_id for item in payload.items]

    decisions = await engine.moderate_batch(texts, user_ids, chat_ids, message_ids)
    results = [
        ModerateResponse(
            label=decision.label,
            score=decision.score,
            action=decision.action,
            sanitized_text=decision.sanitized_text,
            moderator_reason=decision.moderator_reason,
        )
        for decision in decisions
    ]
    return BatchModerateResponse(results=results)
