# SafeChat.AI ML Backend

FastAPI service dedicated to AI moderation and toxicity detection. It only handles inference and logging; persistence lives in the Next.js/Prisma layer.

## Getting started
```bash
cd safechat-ml-backend
python3 -m venv .venv && source .venv/bin/activate  # optional
pip install -r requirements.txt
cp .env.example .env  # update values
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Environment
- `.env` controls runtime values; see `.env.example` for defaults.
- `CORS_ORIGINS` accepts a comma-delimited list.
- Configure either a local HF model via `HF_MODEL_ID` or the Hugging Face Inference API with `HF_API_URL` + `HF_API_TOKEN`.

## API
- `GET /api/v1/health/ping` readiness probe.
- `POST /api/v1/moderation/analyze` – analyze single message (requires `X-API-Key`).
- `POST /api/v1/moderation/analyze/batch` – batch messages.
- `GET /api/v1/models/current` – current model strategy/config.

## Testing
```bash
pytest
```

## Notes
- Inference strategy is abstracted via `HFClient` to allow swapping between local Transformers and HF Inference API.
- Logging via Loguru writes to `logs/safechat_ml_backend.log` with rotation/retention defaults.
