"""Integration tests for profile, income, and expense APIs."""

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import User


def test_profile_get_and_update(client: TestClient, db_session: Session):
    """Test retrieving and updating user financial profile."""
    user = User(name="Test Earner", persona="first_job", language_pref="en")
    db_session.add(user)
    db_session.commit()

    headers = {"X-User-Id": str(user.id)}

    # GET Profile
    resp = client.get("/api/v1/profile", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["monthly_income"] is not None

    # PUT Profile update
    update_payload = {
        "monthly_income": 55000.00,
        "income_type": "fixed",
        "emergency_fund_saved": 110000.00,
    }
    resp = client.put("/api/v1/profile", json=update_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert Decimal(str(data["monthly_income"])) == Decimal("55000.00")
    assert Decimal(str(data["emergency_fund_saved"])) == Decimal("110000.00")


def test_income_crud_cycle(client: TestClient, db_session: Session):
    """Test income recording, listing, and deletion."""
    user = User(name="Income Earner", persona="student", language_pref="hinglish")
    db_session.add(user)
    db_session.commit()

    headers = {"X-User-Id": str(user.id)}

    # POST Income
    payload = {
        "amount": 18000.00,
        "source": "Software Internship Stipend",
        "received_on": str(date.today()),
        "is_recurring": True,
    }
    resp = client.post("/api/v1/income", json=payload, headers=headers)
    assert resp.status_code == 201
    inc_data = resp.json()
    income_id = inc_data["id"]
    assert inc_data["source"] == "Software Internship Stipend"

    # GET Incomes
    list_resp = client.get("/api/v1/income", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # DELETE Income
    del_resp = client.delete(f"/api/v1/income/{income_id}", headers=headers)
    assert del_resp.status_code == 204


def test_expense_crud_and_auto_bucket(client: TestClient, db_session: Session):
    """Test expense creation with automatic bucket resolution and update."""
    user = User(name="Expense Tester", persona="gig_worker", language_pref="en")
    db_session.add(user)
    db_session.commit()

    headers = {"X-User-Id": str(user.id)}

    # POST Expense without bucket (should auto-resolve "Groceries" -> "needs")
    payload = {
        "amount": 2450.50,
        "category": "Supermarket Groceries",
        "description": "Weekly pantry items",
        "spent_on": str(date.today()),
        "is_impulsive": False,
    }
    resp = client.post("/api/v1/expenses", json=payload, headers=headers)
    assert resp.status_code == 201
    exp_data = resp.json()
    exp_id = exp_data["id"]
    assert exp_data["bucket"] == "needs"

    # PATCH Expense
    patch_payload = {
        "amount": 2600.00,
        "is_impulsive": True,
    }
    patch_resp = client.patch(f"/api/v1/expenses/{exp_id}", json=patch_payload, headers=headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["is_impulsive"] is True

    # DELETE Expense
    del_resp = client.delete(f"/api/v1/expenses/{exp_id}", headers=headers)
    assert del_resp.status_code == 204
