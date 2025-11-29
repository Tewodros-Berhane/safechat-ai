from pathlib import Path

from loguru import logger


def setup_logging(log_path: str = "logs/safechat_ml_backend.log") -> None:
    Path(log_path).parent.mkdir(parents=True, exist_ok=True)
    logger.add(log_path, rotation="10 MB", retention="7 days")

