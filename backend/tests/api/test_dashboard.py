"""Integration tests for composite Dashboard API and Health Score API."""

from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import FinancialProfile, Goal, User


def test_dashboard_composite_payload(client: TestClient, db_session: Session):
    """Test GET /api/v1/dashboard returns all home screen blocks in single call."""
    user = User(name="Dashboard Earner", persona="student", language_pref="hinglish")
    db_session.add(user)
    db_session.commit()

    profile = FinancialProfile(
        user_id=user.id,
        monthly_income=Decimal("15000.00"),
        income_type="fixed",
        emergency_fund_saved=Decimal("5000.00"),
    )
    goal = Goal(
        user_id=user.id,
        name="Study Table",
        target_amount=Decimal("10000.00"),
        current_saved=Decimal("3000.00"),
        status="active",
    )
    db_session.add_all([profile, goal])
    db_session.commit()

    headers = {"X-User-Id": str(user.id)}
    resp = client.get("/api/v1/dashboard", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["user_id"] == user.id
    assert data["persona"] == "student"
    assert data["profile"] is not None
    assert data["budget_summary"] is not None
    assert data["health_score"] is not None
    assert len(data["active_goals"]) == 1
    assert "college stipend" in data["coach_starter_prompt"].lower()


def test_health_score_endpoint(client: TestClient, db_session: Session):
    """Test GET /api/v1/health-score returns 0-100 score and factor breakdown."""
    user = User(name="Score User", persona="first_job", language_pref="en")
    db_session.add(user)
    db_session.commit()

    headers = {"X-User-Id": str(user.id)}
    resp = client.get("/api/v1/health-score", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert 0 <= data["score"] <= 100
    assert data["band"] in ["Needs attention", "Building", "Healthy", "Strong"]
    assert len(data["factors"]) == 5
