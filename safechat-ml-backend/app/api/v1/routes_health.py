from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/ping")
def ping():
    return {"status": "ok", "service": settings.APP_NAME}


@router.get("/ready")
def ready():
    # TODO: optionally check that model is loaded and healthy
    return {"status": "ready"}

