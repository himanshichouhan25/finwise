"""Integration tests for Finfluencer Claim Reality Check and Impulse Decision Journal APIs."""

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User


@pytest.fixture
def test_user(db_session: Session) -> User:
    """Ensure baseline user exists in test SQLite database."""
    user = db_session.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="Test Investor", persona="first_job", language_pref="en")
        db_session.add(user)
        db_session.commit()
    return user


def test_claim_reality_check_api_scam_detection(client: TestClient, test_user: User):
    """Verify claim audit endpoint extracts metrics, flags scams, and persists records."""
    claim_payload = {
        "claim_text": "Turn ₹10,000 into 1 Crore in 3 years with this secret guaranteed trading trick! Limited slots!"
    }

    response = client.post(
        "/api/v1/claims/analyze",
        json=claim_payload,
        headers={"X-User-Id": str(test_user.id)},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "extreme"
    assert data["is_guaranteed"] is True
    assert Decimal(str(data["annualized_cagr_pct"])) > Decimal("500.0")
    assert len(data["benchmarks"]) > 0
    assert len(data["red_flags"]) >= 2
    assert "SEBI" in data["verdict"] or "Ponzi" in data["verdict"] or "absurd" in data["verdict"]

    # Verify history endpoint
    hist_resp = client.get("/api/v1/claims/history", headers={"X-User-Id": str(test_user.id)})
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) >= 1
    assert any(h["id"] == data["id"] for h in history)


def test_journal_entry_lifecycle_and_cooling_off(client: TestClient, test_user: User):
    """Verify decision journal cooling-off enforcement and gratification blocking."""
    # 1. Create impulse purchase entry with 24h cooling off
    entry_payload = {
        "title": "Designer Luxury Leather Jacket",
        "decision_type": "purchase",
        "amount": 15000.0,
        "rationale": "Saw a flash sale on Instagram and felt sudden FOMO.",
        "emotional_state": "fomo",
        "cooling_off_hours": 24,
        "is_urgent": True,
    }

    create_resp = client.post(
        "/api/v1/journal/entries",
        json=entry_payload,
        headers={"X-User-Id": str(test_user.id)},
    )

    assert create_resp.status_code == 200
    entry_data = create_resp.json()
    entry_id = entry_data["id"]
    assert entry_data["is_cooling_active"] is True
    assert entry_data["cooling_remaining_seconds"] > 0
    assert entry_data["status"] == "pending_review"

    # 2. Attempting to finalize while cooling is active must fail with 422
    decide_resp = client.post(
        f"/api/v1/journal/entries/{entry_id}/decide",
        json={"decision": "proceeded", "outcome_note": "I bought it anyway"},
        headers={"X-User-Id": str(test_user.id)},
    )
    assert decide_resp.status_code == 422
    err_data = decide_resp.json()
    assert "cooling-off period is still active" in err_data["error"]["message"].lower()


def test_journal_decision_immediate_and_summary(client: TestClient, test_user: User):
    """Verify immediate decision (cooling=0) and aggregate money saved summary."""
    # 1. Create entry with 0 cooling hours
    create_resp = client.post(
        "/api/v1/journal/entries",
        json={
            "title": "Gaming Console Bundle",
            "decision_type": "purchase",
            "amount": 40000.0,
            "rationale": "Friends are playing online",
            "emotional_state": "excited",
            "cooling_off_hours": 0,
            "is_urgent": False,
        },
        headers={"X-User-Id": str(test_user.id)},
    )
    assert create_resp.status_code == 200
    entry_id = create_resp.json()["id"]

    # 2. Finalize decision as 'dropped' (avoided impulse purchase)
    decide_resp = client.post(
        f"/api/v1/journal/entries/{entry_id}/decide",
        json={
            "decision": "dropped",
            "outcome_note": "Decided to invest the ₹40,000 in Nifty 50 index fund instead!",
        },
        headers={"X-User-Id": str(test_user.id)},
    )
    assert decide_resp.status_code == 200
    updated_entry = decide_resp.json()
    assert updated_entry["status"] == "dropped"
    assert "invest" in updated_entry["outcome_note"]

    # 3. Verify summary metrics
    sum_resp = client.get("/api/v1/journal/summary", headers={"X-User-Id": str(test_user.id)})
    assert sum_resp.status_code == 200
    summary = sum_resp.json()
    assert summary["avoided_count"] >= 1
    assert Decimal(str(summary["total_saved_amount"])) >= Decimal("40000.00")
