from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_analyze_requires_api_key():
    payload = {"text": "hello"}
    response = client.post("/api/v1/moderation/analyze", json=payload)
    assert response.status_code == 401

