from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.config import settings
from app.models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    BatchAnalyzeRequest,
    BatchAnalyzeResponse,
    BatchAnalyzeResponseItem,
)
from app.services.moderation_service import ModerationService

router = APIRouter()


def verify_internal_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key"
        )


def get_moderation_service() -> ModerationService:
    # Attached in app.main during startup.
    return router.moderation_service


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    dependencies=[Depends(verify_internal_api_key)],
)
async def analyze_message(
    payload: AnalyzeRequest, service: ModerationService = Depends(get_moderation_service)
):
    """
    Analyze a single message for toxicity.
    Called by Next.js backend when user sends a message.
    """
    result = await service.analyze(payload.text)
    return AnalyzeResponse(**result)


@router.post(
    "/analyze/batch",
    response_model=BatchAnalyzeResponse,
    dependencies=[Depends(verify_internal_api_key)],
)
async def analyze_batch(
    payload: BatchAnalyzeRequest,
    service: ModerationService = Depends(get_moderation_service),
):
    """
    Analyze multiple messages at once (for backfill, analytics).
    """
    items = []
    for item in payload.items:
        result = await service.analyze(item.text)
        items.append(
            BatchAnalyzeResponseItem(
                id=item.id,
                toxicity_score=result["toxicity_score"],
                toxicity_label=result["toxicity_label"],
                model_version=result["model_version"],
            )
        )
    return BatchAnalyzeResponse(items=items)

