import os
from functools import lru_cache
from typing import List, Optional

from dotenv import load_dotenv
from pydantic import BaseSettings, AnyHttpUrl

# Load environment variables from .env in development environments.
load_dotenv()


class Settings(BaseSettings):
    APP_ENV: str = "dev"
    APP_NAME: str = "SafeChat.AI ML Backend"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    CORS_ORIGINS: str = "http://localhost:3000"

    # Hugging Face configuration
    HF_MODEL_ID: Optional[str] = None
    HF_API_URL: Optional[AnyHttpUrl] = None
    HF_API_TOKEN: Optional[str] = None

    INTERNAL_API_KEY: str = "supersecret_internal_key"

    # Moderation thresholds
    TOXIC_THRESHOLD: float = 0.60
    HIGH_RISK_THRESHOLD: float = 0.85

    # Callback to Next.js backend (for escalations/blocks)
    NEXT_API_BASE_URL: Optional[AnyHttpUrl] = None
    NEXT_API_KEY: Optional[str] = None

    # Caching/cooldown
    MODERATION_CACHE_TTL_SECONDS: int = 10
    MODERATION_COOLDOWN_SECONDS: float = 0.2

    # Websocket batching
    WS_BATCH_SIZE: int = 32
    WS_BATCH_WAIT_SECONDS: float = 0.01

    class Config:
        case_sensitive = True

    @property
    def cors_origin_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return []

    @property
    def use_hf_api(self) -> bool:
        return bool(self.HF_API_URL and self.HF_API_TOKEN)

    @property
    def use_local_model(self) -> bool:
        return not self.use_hf_api and bool(self.HF_MODEL_ID)


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
