from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.services.moderation_service import ModerationService

router = APIRouter()


class ModelConfigResponse(BaseModel):
    model_id: str
    version: str
    threshold: float
    strategy: str  # "local" or "hf_api"


def get_moderation_service() -> ModerationService:
    return router.moderation_service


@router.get("/current", response_model=ModelConfigResponse)
async def get_current_model_config(
    service: ModerationService = Depends(get_moderation_service),
):
    strategy = "hf_api" if settings.use_hf_api else "local"
    return ModelConfigResponse(
        model_id=settings.HF_MODEL_ID or settings.HF_API_URL or "unknown",
        version=service.model_version,
        threshold=service.threshold,
        strategy=strategy,
    )

