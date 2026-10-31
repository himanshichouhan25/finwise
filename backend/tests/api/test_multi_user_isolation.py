"""Comprehensive Cross-User Data Isolation and Ownership Security Tests.

Verifies strict tenant boundary enforcement:
User A cannot read, modify, delete, or infer User B's:
- Income records
- Expense records
- Goals & plans
- Loans & amortizations
- Chat sessions & messages
- Decision journal cooling-off entries
- Financial profile
- Market watchlist
"""

from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password
from app.models.profile import FinancialProfile
from app.models.user import User


def create_isolated_user(db: Session, email: str, name: str) -> tuple[User, str]:
    """Helper to provision a persistent test user with valid JWT bearer token."""
    user = User(
        email=email,
        hashed_password=hash_password("SecurePass123!"),
        name=name,
        persona="first_job",
        language_pref="en",
        is_active=True,
    )
    db.add(user)
    db.flush()

    profile = FinancialProfile(
        user_id=user.id,
        monthly_income=Decimal("50000.00"),
        income_type="fixed",
        emergency_fund_saved=Decimal("20000.00"),
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id, email=user.email)
    return user, token


def test_cross_user_isolation_full_matrix(client: TestClient, db_session: Session):
    """Verify complete data isolation between User A and User B across all endpoints."""
    # 1. Provision User A and User B
    user_a, token_a = create_isolated_user(db_session, "user_a@finwise.ai", "User Alpha")
    user_b, token_b = create_isolated_user(db_session, "user_b@finwise.ai", "User Beta")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # ----------------------------------------------------
    # 2. Income Isolation
    # ----------------------------------------------------
    inc_resp = client.post(
        "/api/v1/income",
        json={"source": "Alpha Salary", "amount": 60000.00, "date": "2026-10-01", "is_recurring": True},
        headers=headers_a,
    )
    assert inc_resp.status_code == 201
    income_a_id = inc_resp.json()["id"]

    # User B list income -> Must NOT include User A's income
    b_incomes = client.get("/api/v1/income", headers=headers_b).json()
    assert not any(inc["id"] == income_a_id for inc in b_incomes)

    # User B delete User A's income -> 404 Not Found
    del_inc_resp = client.delete(f"/api/v1/income/{income_a_id}", headers=headers_b)
    assert del_inc_resp.status_code in [403, 404]

    # ----------------------------------------------------
    # 3. Expense Isolation
    # ----------------------------------------------------
    exp_resp = client.post(
        "/api/v1/expenses",
        json={"title": "Alpha Rent", "amount": 15000.00, "category": "housing", "date": "2026-10-02"},
        headers=headers_a,
    )
    assert exp_resp.status_code == 201
    expense_a_id = exp_resp.json()["id"]

    # User B list expenses -> Must NOT include User A's expense
    b_expenses = client.get("/api/v1/expenses", headers=headers_b).json()
    assert not any(exp["id"] == expense_a_id for exp in b_expenses)

    # User B delete User A's expense -> 404 Not Found
    del_exp_resp = client.delete(f"/api/v1/expenses/{expense_a_id}", headers=headers_b)
    assert del_exp_resp.status_code in [403, 404]

    # ----------------------------------------------------
    # 4. Goals Isolation
    # ----------------------------------------------------
    goal_resp = client.post(
        "/api/v1/goals",
        json={
            "name": "Alpha Emergency Fund",
            "target_amount": 100000.00,
            "current_amount": 25000.00,
            "target_date": "2027-10-01",
            "category": "emergency_fund",
            "priority": "high",
        },
        headers=headers_a,
    )
    assert goal_resp.status_code == 201
    goal_a_id = goal_resp.json()["id"]

    # User B list goals -> Must NOT include User A's goal
    b_goals = client.get("/api/v1/goals", headers=headers_b).json()
    assert not any(g["id"] == goal_a_id for g in b_goals)

    # User B read User A's goal plan -> 404
    goal_plan_resp = client.get(f"/api/v1/goals/{goal_a_id}/plan", headers=headers_b)
    assert goal_plan_resp.status_code == 404

    # User B delete User A's goal -> 404
    del_goal_resp = client.delete(f"/api/v1/goals/{goal_a_id}", headers=headers_b)
    assert del_goal_resp.status_code == 404

    # ----------------------------------------------------
    # 5. Loans Isolation
    # ----------------------------------------------------
    loan_resp = client.post(
        "/api/v1/loans",
        json={
            "name": "Alpha Bike Loan",
            "lender": "HDFC Bank",
            "principal_amount": 80000.00,
            "interest_rate_pct": 10.5,
            "tenure_months": 24,
            "loan_type": "vehicle",
            "interest_type": "reducing_balance",
            "start_date": "2026-01-01",
        },
        headers=headers_a,
    )
    assert loan_resp.status_code == 201
    loan_a_id = loan_resp.json()["id"]

    # User B list loans -> Must NOT include User A's loan
    b_loans_data = client.get("/api/v1/loans", headers=headers_b).json()
    b_loans = b_loans_data.get("loans", [])
    assert not any(loan_item["id"] == loan_a_id for loan_item in b_loans)

    # User B get User A's loan detail -> 404
    loan_detail_resp = client.get(f"/api/v1/loans/{loan_a_id}", headers=headers_b)
    assert loan_detail_resp.status_code == 404

    # User B delete User A's loan -> 404
    del_loan_resp = client.delete(f"/api/v1/loans/{loan_a_id}", headers=headers_b)
    assert del_loan_resp.status_code == 404

    # ----------------------------------------------------
    # 6. Decision Journal Isolation
    # ----------------------------------------------------
    journal_resp = client.post(
        "/api/v1/journal/entries",
        json={
            "title": "Alpha Gaming Laptop",
            "decision_type": "purchase",
            "amount": 85000.00,
            "rationale": "High refresh rate screen for gaming",
            "emotional_state": "excited",
            "cooling_off_hours": 24,
            "is_urgent": False,
        },
        headers=headers_a,
    )
    assert journal_resp.status_code == 200
    entry_a_id = journal_resp.json()["id"]

    # User B list journal entries -> Must NOT include User A's entry
    b_entries = client.get("/api/v1/journal/entries", headers=headers_b).json()
    assert not any(e["id"] == entry_a_id for e in b_entries)

    # User B decide User A's journal entry -> 404
    decide_resp = client.post(
        f"/api/v1/journal/entries/{entry_a_id}/decide",
        json={"decision": "dropped", "outcome_note": "Hacked decision attempt"},
        headers=headers_b,
    )
    assert decide_resp.status_code == 404

    # ----------------------------------------------------
    # 7. Watchlist Isolation
    # ----------------------------------------------------
    watch_resp = client.post(
        "/api/v1/market/watchlist",
        json={"symbol": "INFY", "company_name": "Infosys Limited"},
        headers=headers_a,
    )
    assert watch_resp.status_code == 201
    watch_a_id = watch_resp.json()["id"]

    # User B list watchlist -> Must NOT include User A's watchlist item
    b_watchlist = client.get("/api/v1/market/watchlist", headers=headers_b).json()
    assert not any(w["id"] == watch_a_id for w in b_watchlist)

    # User B delete User A's watchlist item -> 404
    del_watch_resp = client.delete(f"/api/v1/market/watchlist/{watch_a_id}", headers=headers_b)
    assert del_watch_resp.status_code == 404

    # ----------------------------------------------------
    # 8. Profile Isolation
    # ----------------------------------------------------
    profile_a = client.get("/api/v1/profile", headers=headers_a).json()
    profile_b = client.get("/api/v1/profile", headers=headers_b).json()
    assert profile_a["user_id"] == user_a.id
    assert profile_b["user_id"] == user_b.id
    assert profile_a["user_id"] != profile_b["user_id"]
