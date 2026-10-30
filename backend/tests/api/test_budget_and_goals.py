"""Integration tests for budget summary and savings goals APIs."""

from datetime import date, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import ExpenseRecord, FinancialProfile, User


def test_budget_summary_endpoint(client: TestClient, db_session: Session):
    """Test GET /api/v1/budget/summary returns accurate 50/30/20 breakdown."""
    user = User(name="Budget User", persona="first_job", language_pref="en")
    db_session.add(user)
    db_session.commit()

    profile = FinancialProfile(user_id=user.id, monthly_income=Decimal("50000.00"), income_type="fixed")
    exp1 = ExpenseRecord(
        user_id=user.id,
        amount=Decimal("20000.00"),
        category="Rent",
        bucket="needs",
        spent_on=date.today(),
    )
    exp2 = ExpenseRecord(
        user_id=user.id,
        amount=Decimal("12000.00"),
        category="Dining Out",
        bucket="wants",
        spent_on=date.today(),
    )
    db_session.add_all([profile, exp1, exp2])
    db_session.commit()

    headers = {"X-User-Id": str(user.id)}
    resp = client.get("/api/v1/budget/summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert Decimal(str(data["net_income"])) == Decimal("50000.00")
    assert Decimal(str(data["needs"]["actual_amount"])) == Decimal("20000.00")
    assert Decimal(str(data["wants"]["actual_amount"])) == Decimal("12000.00")
    assert data["needs"]["status"] == "within"
    assert len(data["suggestions"]) > 0


def test_goals_lifecycle_and_plan(client: TestClient, db_session: Session):
    """Test creating a goal, calculating its plan, and retrieving it."""
    user = User(name="Goal Achiever", persona="student", language_pref="hinglish")
    db_session.add(user)
    db_session.commit()

    headers = {"X-User-Id": str(user.id)}

    target_date = str(date.today() + timedelta(days=365))
    create_payload = {
        "name": "Electric Scooter",
        "target_amount": 80000.00,
        "current_saved": 20000.00,
        "target_date": target_date,
        "planned_monthly_contribution": 5000.00,
        "expected_annual_return_pct": 0.00,
    }
    resp = client.post("/api/v1/goals", json=create_payload, headers=headers)
    assert resp.status_code == 201
    goal_id = resp.json()["id"]

    # GET Goal plan
    plan_resp = client.get(f"/api/v1/goals/{goal_id}/plan", headers=headers)
    assert plan_resp.status_code == 200
    plan_data = plan_resp.json()
    assert plan_data["goal_id"] == goal_id
    assert Decimal(str(plan_data["remaining_amount"])) == Decimal("60000.00")
    assert plan_data["required_monthly_savings"] is not None
