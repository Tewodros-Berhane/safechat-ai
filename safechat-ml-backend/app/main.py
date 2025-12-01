from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.v1.routes_analyze import router as analyze_router
from app.api.v1.routes_health import router as health_router
from app.api.v1.routes_models import router as models_router
from app.api.moderation import router as moderation_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.services.ai_model import AIModel
from app.services.moderation_logic import ModerationEngine, NextJSClient
from app.websocket.router import router as ws_router

# Setup logging sinks
setup_logging()

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

# Legacy routers (kept for compatibility)
app.include_router(health_router, prefix="/api/v1/health", tags=["health"])
app.include_router(analyze_router, prefix="/api/v1/moderation", tags=["moderation"])
app.include_router(models_router, prefix="/api/v1/models", tags=["models"])

# New moderation API
app.include_router(moderation_router, tags=["moderation"])
app.include_router(ws_router)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting {} on {}:{}", settings.APP_NAME, settings.APP_HOST, settings.APP_PORT)

    # Initialize HF model and moderation engine once.
    model_name = settings.HF_MODEL_ID or "Tewodros-Berhane/safechat-distilroberta-toxic-v1"
    ai_model = AIModel(
        model_name=model_name,
        toxic_threshold=settings.TOXIC_THRESHOLD,
        high_risk_threshold=settings.HIGH_RISK_THRESHOLD,
        cache_ttl_seconds=settings.MODERATION_CACHE_TTL_SECONDS,
        cooldown_seconds=settings.MODERATION_COOLDOWN_SECONDS,
    )
    await ai_model.load()
    await ai_model.warmup()

    next_client = NextJSClient(
        base_url=settings.NEXT_API_BASE_URL, api_key=settings.NEXT_API_KEY
    )
    moderation_engine = ModerationEngine(
        model=ai_model,
        toxic_threshold=settings.TOXIC_THRESHOLD,
        high_risk_threshold=settings.HIGH_RISK_THRESHOLD,
        next_client=next_client,
    )

    # Stash shared instances in app state
    app.state.ai_model = ai_model
    app.state.moderation_engine = moderation_engine
    app.state.ws_batch_size = settings.WS_BATCH_SIZE
    app.state.ws_batch_wait = settings.WS_BATCH_WAIT_SECONDS

    # Backward compatibility for existing v1 routes
    class LegacyModerationAdapter:
        def __init__(self, engine: ModerationEngine):
            self.engine = engine
            self.threshold = engine.toxic_threshold
            self.model_version = "v1"

        async def analyze(self, text: str):
            decision = await self.engine.moderate(text, user_id=None, chat_id=None)
            return {
                "toxicity_score": decision.score,
                "toxicity_label": decision.label,
                "categories": [{"label": decision.label, "score": decision.score}],
                "raw": decision.raw or {},
                "latency_ms": 0.0,
                "model_version": self.model_version,
            }

    analyze_router.moderation_service = LegacyModerationAdapter(moderation_engine)
    models_router.moderation_service = analyze_router.moderation_service
