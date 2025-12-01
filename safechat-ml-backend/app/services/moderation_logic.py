import asyncio
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import httpx
from loguru import logger

from app.services.ai_model import AIModel


@dataclass
class ModerationDecision:
    label: str
    score: float
    action: str
    sanitized_text: str
    moderator_reason: Optional[str] = None
    raw: Optional[Dict[str, Any]] = None

    def to_payload(self) -> Dict[str, Any]:
        return {
            "label": self.label,
            "score": self.score,
            "action": self.action,
            "sanitized_text": self.sanitized_text,
            "moderator_reason": self.moderator_reason,
        }


class NextJSClient:
    def __init__(self, base_url: Optional[str], api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/") if base_url else None
        self.api_key = api_key

    async def send_event(self, payload: Dict[str, Any]) -> None:
        if not self.base_url:
            logger.debug("Next.js base URL not configured; skipping callback")
            return
        url = f"{self.base_url}/api/moderation/event"
        headers = {"X-API-Key": self.api_key} if self.api_key else {}
        async with httpx.AsyncClient(timeout=5) as client:
            try:
                await client.post(url, json=payload, headers=headers)
                logger.info("Forwarded moderation event to Next.js {}", url)
            except Exception:
                logger.exception("Failed to forward moderation event to {}", url)


class ModerationEngine:
    def __init__(
        self,
        model: AIModel,
        toxic_threshold: float,
        high_risk_threshold: float,
        next_client: Optional[NextJSClient] = None,
    ):
        self.model = model
        self.toxic_threshold = toxic_threshold
        self.high_risk_threshold = high_risk_threshold
        self.next_client = next_client or NextJSClient(None)

    def _label_from_score(self, score: float) -> str:
        if score >= self.high_risk_threshold:
            return "high_risk"
        if score >= self.toxic_threshold:
            return "toxic"
        return "safe"

    def _action_from_label(self, label: str) -> str:
        if label == "high_risk":
            return "escalate"
        if label == "toxic":
            return "block"
        return "allow"

    def _sanitize(self, text: str, action: str) -> str:
        if action in {"block", "escalate"}:
            return "[message removed]"
        return text

    def _moderator_reason(self, label: str, score: float) -> str:
        if label == "high_risk":
            return f"High-risk content detected (score={score:.2f})"
        if label == "toxic":
            return f"Toxic content detected (score={score:.2f})"
        return "Content allowed"

    def build_decision(
        self, text: str, prediction: Dict[str, Any], user_id: Any, chat_id: Any
    ) -> ModerationDecision:
        score = float(prediction.get("score", 0.0))
        raw_label = prediction.get("label", "").lower()

        # Some models return "LABEL_1"/"LABEL_0"; map to toxic/safe if needed.
        label_map = {"label_1": "toxic", "label_0": "safe"}
        raw_label = label_map.get(raw_label, raw_label)

        label = self._label_from_score(score) if raw_label == "toxic" else "safe"
        if raw_label == "toxic" and score >= self.high_risk_threshold:
            label = "high_risk"
        elif raw_label == "toxic" and score >= self.toxic_threshold:
            label = "toxic"
        elif raw_label != "toxic":
            label = "safe"

        action = self._action_from_label(label)
        sanitized_text = self._sanitize(text, action)
        moderator_reason = self._moderator_reason(label, score)

        return ModerationDecision(
            label=label,
            score=score,
            action=action,
            sanitized_text=sanitized_text,
            moderator_reason=moderator_reason,
            raw={"model_label": raw_label},
        )

    async def moderate(
        self, text: str, user_id: Any, chat_id: Any, message_id: Any = None
    ) -> ModerationDecision:
        prediction = await self.model.predict(text)
        decision = self.build_decision(text, prediction, user_id, chat_id)
        await self._emit_side_effects(decision, user_id, chat_id, text, message_id)
        return decision

    async def moderate_batch(
        self,
        texts: List[str],
        user_ids: List[Any],
        chat_ids: List[Any],
        message_ids: Optional[List[Any]] = None,
    ) -> List[ModerationDecision]:
        predictions = await self.model.predict_batch(texts)
        decisions: List[ModerationDecision] = []
        tasks: List[asyncio.Task] = []
        for idx, (text, prediction, user_id, chat_id) in enumerate(
            zip(texts, predictions, user_ids, chat_ids)
        ):
            message_id = message_ids[idx] if message_ids else None
            decision = self.build_decision(text, prediction, user_id, chat_id)
            decisions.append(decision)
            tasks.append(
                asyncio.create_task(
                    self._emit_side_effects(decision, user_id, chat_id, text, message_id)
                )
            )
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        return decisions

    async def _emit_side_effects(
        self,
        decision: ModerationDecision,
        user_id: Any,
        chat_id: Any,
        text: str,
        message_id: Any = None,
    ) -> None:
        """
        Pushes moderation events to Next.js for logging/escalation.
        """
        if decision.action == "allow":
            return

        payload = {
            "chat_id": chat_id,
            "user_id": user_id,
            "action": decision.action,
            "reason": decision.moderator_reason,
            "label": decision.label,
            "score": decision.score,
            "original_text": text,
            "sanitized_text": decision.sanitized_text,
            "toxicity_category": decision.label,
            "confidence": decision.score,
            "message_id": message_id,
        }
        await self.next_client.send_event(payload)
