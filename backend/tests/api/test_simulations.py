"""Integration tests for simulation APIs (SIP, Goal What-If, Goal Delay)."""

from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Goal, User


def test_sip_simulation_api(client: TestClient):
    """Test POST /api/v1/simulations/sip returns projection and scenarios."""
    payload = {
        "monthly_investment": 5000.00,
        "duration_years": 5,
        "annual_return_pct": 12.00,
        "annual_step_up_pct": 10.00,
        "annual_inflation_pct": 6.00,
    }
    resp = client.post("/api/v1/simulations/sip", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert Decimal(str(data["total_invested"])) > Decimal("300000.00")  # step-up increases total
    assert Decimal(str(data["estimated_value"])) > Decimal(str(data["total_invested"]))
    assert len(data["yearly_series"]) == 5
    assert len(data["scenarios"]) == 3


def test_goal_what_if_api(client: TestClient):
    """Test POST /api/v1/simulations/goal-whatif compares timeline adjustments."""
    payload = {
        "target_amount": 100000.00,
        "current_saved": 20000.00,
        "baseline_months": 16,
        "scenario_months": 8,
    }
    resp = client.post("/api/v1/simulations/goal-whatif", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["months_difference"] == -8
    assert Decimal(str(data["scenario_required"])) > Decimal(str(data["baseline_required"]))


def test_goal_delay_api_with_user_goal(client: TestClient, db_session: Session):
    """Test POST /api/v1/simulations/goal-delay resolves user goal contribution."""
    user = User(name="Delay Tester", persona="first_job", language_pref="en")
    db_session.add(user)
    db_session.commit()

    goal = Goal(
        user_id=user.id,
        name="Emergency Reserve",
        target_amount=Decimal("100000.00"),
        current_saved=Decimal("20000.00"),
        planned_monthly_contribution=Decimal("6000.00"),
    )
    db_session.add(goal)
    db_session.commit()

    headers = {"X-User-Id": str(user.id)}
    payload = {
        "spend_amount": 3000.00,
        "goal_id": goal.id,
    }
    resp = client.post("/api/v1/simulations/goal-delay", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_valid"] is True
    # 3,000 / (6,000/30) = 15.0 days
    assert Decimal(str(data["days_delayed"])) == Decimal("15.0")
    assert "Emergency Reserve" in data["goal_name"]
