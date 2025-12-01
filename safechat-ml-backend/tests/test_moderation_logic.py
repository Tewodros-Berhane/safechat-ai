import asyncio

import pytest

from app.services.moderation_logic import ModerationEngine, ModerationDecision


class DummyModel:
    def __init__(self, label="safe", score=0.1):
        self.label = label
        self.score = score

    async def predict(self, text: str):
        return {"label": self.label, "score": self.score}

    async def predict_batch(self, texts):
        return [{"label": self.label, "score": self.score} for _ in texts]


@pytest.mark.asyncio
async def test_safe_message_allows():
    model = DummyModel(label="safe", score=0.05)
    engine = ModerationEngine(model, toxic_threshold=0.6, high_risk_threshold=0.85)
    decision = await engine.moderate("hello world", user_id=1, chat_id=1)
    assert isinstance(decision, ModerationDecision)
    assert decision.action == "allow"
    assert decision.label == "safe"
    assert decision.sanitized_text == "hello world"


@pytest.mark.asyncio
async def test_toxic_blocks():
    model = DummyModel(label="toxic", score=0.7)
    engine = ModerationEngine(model, toxic_threshold=0.6, high_risk_threshold=0.85)
    decision = await engine.moderate("bad message", user_id=1, chat_id=1)
    assert decision.action == "block"
    assert decision.label == "toxic"
    assert decision.sanitized_text == "[message removed]"


@pytest.mark.asyncio
async def test_high_risk_escalates():
    model = DummyModel(label="toxic", score=0.9)
    engine = ModerationEngine(model, toxic_threshold=0.6, high_risk_threshold=0.85)
    decision = await engine.moderate("extremely bad", user_id=1, chat_id=1)
    assert decision.action == "escalate"
    assert decision.label == "high_risk"
    assert decision.moderator_reason.startswith("High-risk")


@pytest.mark.asyncio
async def test_batch_decisions_match_single():
    model = DummyModel(label="toxic", score=0.95)
    engine = ModerationEngine(model, toxic_threshold=0.6, high_risk_threshold=0.85)
    decisions = await engine.moderate_batch(
        ["one", "two"], user_ids=[1, 2], chat_ids=[10, 20]
    )
    assert len(decisions) == 2
    assert all(d.action == "escalate" for d in decisions)

