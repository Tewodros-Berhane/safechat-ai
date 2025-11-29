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
