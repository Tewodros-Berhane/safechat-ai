from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Raw user message to analyze")
    metadata: Optional[Dict[str, str]] = Field(
        default=None, description="Optional metadata like chatId, userId, etc."
    )


class BatchAnalyzeItem(BaseModel):
    id: str = Field(..., description="Client-side identifier for this message")
    text: str


class BatchAnalyzeRequest(BaseModel):
    items: List[BatchAnalyzeItem]


class CategoryScore(BaseModel):
    label: str
    score: float


class AnalyzeResponse(BaseModel):
    toxicity_score: float
    toxicity_label: str
    categories: List[CategoryScore] = []
    raw: Dict[str, float] = {}
    model_version: str
    latency_ms: float


class BatchAnalyzeResponseItem(BaseModel):
    id: str
    toxicity_score: float
    toxicity_label: str
    model_version: str


class BatchAnalyzeResponse(BaseModel):
    items: List[BatchAnalyzeResponseItem]

