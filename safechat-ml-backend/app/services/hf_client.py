import asyncio
from typing import Any, Dict, List, Optional

import httpx
import torch
from loguru import logger
from transformers import AutoModelForSequenceClassification, AutoTokenizer


class HFClient:
    def __init__(self, model_id: str, use_api: bool = False, api_url: Optional[str] = None, api_token: Optional[str] = None):
        self.model_id = model_id
        self.use_api = use_api
        self.api_url = api_url
        self.api_token = api_token

        self._tokenizer: Optional[AutoTokenizer] = None
        self._model: Optional[AutoModelForSequenceClassification] = None
        self._http_client: Optional[httpx.AsyncClient] = None

    async def _load_local_model(self) -> None:
        if self._tokenizer and self._model:
            return
        logger.info("Loading local Hugging Face model {}", self.model_id)
        self._tokenizer = AutoTokenizer.from_pretrained(self.model_id)
        self._model = AutoModelForSequenceClassification.from_pretrained(self.model_id)
        self._model.eval()

    def _predict_local(self, text: str) -> Dict[str, Any]:
        assert self._tokenizer and self._model, "Model must be loaded before prediction"
        inputs = self._tokenizer(text, return_tensors="pt", truncation=True)
        with torch.no_grad():
            outputs = self._model(**inputs)
            scores_tensor = torch.softmax(outputs.logits, dim=1).squeeze()
        scores: List[float] = scores_tensor.tolist() if isinstance(scores_tensor.tolist(), list) else [float(scores_tensor)]
        labels = [self._model.config.id2label[i] for i in range(len(scores))]
        return {"labels": labels, "scores": scores}

    async def _predict_local_async(self, text: str) -> Dict[str, Any]:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._predict_local, text)

    async def _predict_remote(self, text: str) -> Dict[str, Any]:
        if not self._http_client:
            self._http_client = httpx.AsyncClient(timeout=15)
        headers = {"Authorization": f"Bearer {self.api_token}"} if self.api_token else {}
        payload = {"inputs": text}
        response = await self._http_client.post(self.api_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        # HF Inference API returns list of dicts for classification: [[{label, score}, ...]]
        predictions = data[0] if isinstance(data, list) else data
        labels = [item["label"] for item in predictions]
        scores = [item["score"] for item in predictions]
        return {"labels": labels, "scores": scores}

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        if self.use_api:
            if not self.api_url:
                raise ValueError("HF_API_URL is required when using Hugging Face Inference API")
            logger.info("Analyzing text via HF Inference API")
            return await self._predict_remote(text)

        await self._load_local_model()
        logger.info("Analyzing text via local model")
        return await self._predict_local_async(text)

