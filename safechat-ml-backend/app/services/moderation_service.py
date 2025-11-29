from typing import Any, Dict, List

from loguru import logger

from app.services.hf_client import HFClient
from app.utils.timing import measure_latency_ms


class ModerationService:
    def __init__(self, hf_client: HFClient, threshold: float = 0.5):
        self.hf_client = hf_client
        self.threshold = threshold
        self.model_version = "v1"

    def set_threshold(self, value: float) -> None:
        self.threshold = value

    async def analyze(self, text: str) -> Dict[str, Any]:
        logger.info("Running moderation for text length={}", len(text))

        async def _run():
            raw = await self.hf_client.analyze_text(text)
            labels: List[str] = raw.get("labels", [])
            scores: List[float] = raw.get("scores", [])

            if not labels or not scores:
                raise ValueError("Model returned empty predictions")

            # Determine toxicity score and label
            toxicity_score = 0.0
            toxicity_label = "safe"

            if "toxic" in [label.lower() for label in labels]:
                toxic_index = [label.lower() for label in labels].index("toxic")
                toxicity_score = float(scores[toxic_index])
                toxicity_label = "toxic" if toxicity_score >= self.threshold else "safe"
            else:
                # Fallback: use the highest scored class
                max_index = max(range(len(scores)), key=lambda i: scores[i])
                toxicity_score = float(scores[max_index])
                toxicity_label = labels[max_index]

            categories = [
                {"label": label, "score": float(score)}
                for label, score in zip(labels, scores)
            ]

            return {
                "toxicity_score": toxicity_score,
                "toxicity_label": toxicity_label,
                "categories": categories,
                "raw": {"labels": labels, "scores": scores},
            }

        result, latency = await measure_latency_ms(_run)
        result["latency_ms"] = latency
        result["model_version"] = self.model_version
        return result

