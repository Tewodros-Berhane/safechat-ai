import asyncio
import time
from typing import Dict, List, Optional

import torch
from loguru import logger
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline


class AIModel:
    """
    Thin wrapper around a HuggingFace text-classification pipeline.
    Loads the model/tokenizer once and exposes async predict helpers with caching.
    """

    def __init__(
        self,
        model_name: str,
        toxic_threshold: float = 0.6,
        high_risk_threshold: float = 0.85,
        cache_ttl_seconds: int = 10,
        cooldown_seconds: float = 0.2,
    ):
        self.model_name = model_name
        self.device = 0 if torch.cuda.is_available() else -1
        self.toxic_threshold = toxic_threshold
        self.high_risk_threshold = high_risk_threshold
        self.cache_ttl_seconds = cache_ttl_seconds
        self.cooldown_seconds = cooldown_seconds

        self._tokenizer: Optional[AutoTokenizer] = None
        self._model: Optional[AutoModelForSequenceClassification] = None
        self._classifier = None
        self._last_inference_ts: float = 0.0
        self._cache: Dict[str, Dict] = {}

    def _expired(self, created_ts: float) -> bool:
        return (time.time() - created_ts) > self.cache_ttl_seconds

    def _get_cache(self, text: str) -> Optional[Dict]:
        cached = self._cache.get(text)
        if cached and not self._expired(cached["ts"]):
            return cached["result"]
        return None

    def _set_cache(self, text: str, result: Dict) -> None:
        self._cache[text] = {"result": result, "ts": time.time()}

    def _load_sync(self) -> None:
        if self._classifier:
            return
        logger.info("Loading HF model {} (device={})", self.model_name, self.device)
        self._tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self._model = AutoModelForSequenceClassification.from_pretrained(
            self.model_name
        )
        self._classifier = pipeline(
            "text-classification",
            model=self._model,
            tokenizer=self._tokenizer,
            device=self.device,
            truncation=True,
            max_length=256,
        )

    async def load(self) -> None:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, self._load_sync)

    async def warmup(self) -> None:
        """
        Runs a single inference to ensure weights are on device and pipeline is ready.
        """
        try:
            await self.predict("warmup message")
            logger.info("Warmup inference completed")
        except Exception:
            logger.exception("Warmup inference failed")

    async def _predict_sync(self, text: str) -> Dict:
        result = self._classifier(text)[0]
        return {"label": result["label"], "score": float(result["score"])}

    async def predict(self, text: str) -> Dict:
        if not self._classifier:
            await self.load()

        cached = self._get_cache(text)
        if cached:
            return cached

        # Cooldown to avoid overloading GPU/CPU if spammed
        delta = time.time() - self._last_inference_ts
        if delta < self.cooldown_seconds:
            await asyncio.sleep(self.cooldown_seconds - delta)

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, lambda: self._classifier(text)[0])
        parsed = {"label": result["label"], "score": float(result["score"])}
        self._last_inference_ts = time.time()
        self._set_cache(text, parsed)
        return parsed

    async def predict_batch(self, texts: List[str]) -> List[Dict]:
        if not self._classifier:
            await self.load()

        # Separate cached and uncached to minimize compute.
        pending_indices: List[int] = []
        outputs: List[Optional[Dict]] = [None] * len(texts)
        to_infer: List[str] = []

        for idx, text in enumerate(texts):
            cached = self._get_cache(text)
            if cached:
                outputs[idx] = cached
            else:
                pending_indices.append(idx)
                to_infer.append(text)

        if to_infer:
            loop = asyncio.get_running_loop()
            batched_results = await loop.run_in_executor(
                None, lambda: self._classifier(to_infer)
            )
            for idx, res in zip(pending_indices, batched_results):
                parsed = {"label": res["label"], "score": float(res["score"])}
                outputs[idx] = parsed
                self._set_cache(texts[idx], parsed)

        # Fill any None slots (should not happen but avoid mypy complaints).
        return [out or {"label": "unknown", "score": 0.0} for out in outputs]

