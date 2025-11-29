from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.v1.routes_analyze import router as analyze_router
from app.api.v1.routes_health import router as health_router
from app.api.v1.routes_models import router as models_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.services.hf_client import HFClient
from app.services.moderation_service import ModerationService

# Setup logging sinks
setup_logging()

hf_client = HFClient(
    model_id=settings.HF_MODEL_ID or "distilbert-base-uncased",
    use_api=settings.use_hf_api,
    api_url=settings.HF_API_URL,
    api_token=settings.HF_API_TOKEN,
)
moderation_service = ModerationService(hf_client=hf_client, threshold=0.5)

# Attach services to routers for dependency access
analyze_router.moderation_service = moderation_service
models_router.moderation_service = moderation_service

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1/health", tags=["health"])
app.include_router(analyze_router, prefix="/api/v1/moderation", tags=["moderation"])
app.include_router(models_router, prefix="/api/v1/models", tags=["models"])


@app.on_event("startup")
async def startup_event():
    logger.info("Starting {} on {}:{}", settings.APP_NAME, settings.APP_HOST, settings.APP_PORT)

