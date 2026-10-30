"""Tests for the health check and system error handling."""

from fastapi.testclient import TestClient


def test_health_check_returns_200(client: TestClient):
    """Confirm GET /api/v1/health returns 200 with healthy database."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] is True
    assert isinstance(data["ai_configured"], bool)
    assert data["environment"] in ["development", "test", "production"]


def test_health_check_boots_without_groq_key(client: TestClient, monkeypatch):
    """Confirm the app functions without GROQ_API_KEY, gracefully reporting ai_configured=False."""
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    from app.core.config import get_settings

    get_settings.cache_clear()

    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ai_configured"] is False

    get_settings.cache_clear()


def test_not_found_returns_standard_error_shape(client: TestClient):
    """Confirm an invalid route returns 404 with standardized error envelope."""
    response = client.get("/api/v1/non-existent-endpoint")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "message" in data["error"]
