"""Unit and integration tests for Loan Management API and service."""

from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models.user import User
from app.schemas.loan import LoanCreate, LoanRepaymentCreate
from app.services.loan_service import (
    create_loan,
    delete_loan,
    get_loan_detail,
    get_loans,
    get_prioritization_strategy,
    record_repayment,
    simulate_loan_prepayment,
)


@pytest.fixture
def test_db():
    """In-memory SQLite test database."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    # Create dummy user
    user = User(
        id=1,
        name="Test User",
        email="test@finwise.ai",
        persona="student",
        language_pref="en",
    )
    session.add(user)
    session.commit()

    yield session
    session.close()


def test_create_and_retrieve_loan(test_db: Session):
    """Test creating a new loan calculates EMI and saves to database."""
    payload = LoanCreate(
        name="SBI Education Loan",
        lender="State Bank of India",
        loan_type="education",
        principal_amount=Decimal("200000.00"),
        interest_rate_pct=Decimal("9.00"),
        interest_type="reducing_balance",
        start_date=date(2026, 1, 1),
        tenure_months=24,
    )

    created = create_loan(test_db, user_id=1, payload=payload)
    assert created.id is not None
    assert created.name == "SBI Education Loan"
    assert created.emi_amount > Decimal("0.00")
    assert created.remaining_installments == 24
    assert created.outstanding_principal == Decimal("200000.00")

    summary = get_loans(test_db, user_id=1)
    assert summary.active_loans_count == 1
    assert summary.total_outstanding_principal == Decimal("200000.00")
    assert summary.total_monthly_emi == created.emi_amount


def test_loan_detail_schedule_and_repayment(test_db: Session):
    """Test retrieving amortization schedule and recording an EMI payment."""
    payload = LoanCreate(
        name="Two Wheeler Loan",
        lender="HDFC Bank",
        loan_type="vehicle",
        principal_amount=Decimal("80000.00"),
        interest_rate_pct=Decimal("12.00"),
        interest_type="reducing_balance",
        start_date=date(2026, 1, 1),
        tenure_months=12,
    )
    loan = create_loan(test_db, user_id=1, payload=payload)

    detail = get_loan_detail(test_db, user_id=1, loan_id=loan.id)
    assert len(detail.schedule) == 12
    assert detail.schedule[0].month == 1

    # Record first EMI payment
    rep_payload = LoanRepaymentCreate(
        payment_date=date(2026, 2, 1),
        amount_paid=loan.emi_amount,
        payment_type="emi",
        notes="First month installment",
    )
    rep = record_repayment(test_db, user_id=1, loan_id=loan.id, payload=rep_payload)
    assert rep.installment_number == 1
    assert rep.principal_component > Decimal("0.00")
    assert rep.interest_component > Decimal("0.00")

    # Refresh detail
    updated_detail = get_loan_detail(test_db, user_id=1, loan_id=loan.id)
    assert updated_detail.installments_paid == 1
    assert updated_detail.remaining_installments == 11
    assert updated_detail.outstanding_principal < Decimal("80000.00")
    assert len(updated_detail.repayments) == 1


def test_simulate_loan_prepayment_service(test_db: Session):
    """Test prepayment simulation on created loan."""
    payload = LoanCreate(
        name="Laptop Loan",
        lender="Bajaj Finserv",
        loan_type="personal",
        principal_amount=Decimal("50000.00"),
        interest_rate_pct=Decimal("14.00"),
        interest_type="reducing_balance",
        start_date=date(2026, 1, 1),
        tenure_months=18,
    )
    loan = create_loan(test_db, user_id=1, payload=payload)

    sim = simulate_loan_prepayment(
        db=test_db,
        user_id=1,
        loan_id=loan.id,
        extra_monthly_amount=Decimal("1000.00"),
    )
    assert sim.months_saved > 0
    assert sim.interest_saved > Decimal("0.00")
    assert sim.new_tenure_months < 18


def test_prioritization_avalanche_and_snowball(test_db: Session):
    """Test Avalanche & Snowball strategies with multiple active loans."""
    create_loan(
        test_db,
        user_id=1,
        payload=LoanCreate(
            name="Education Loan",
            lender="SBI",
            loan_type="education",
            principal_amount=Decimal("300000.00"),
            interest_rate_pct=Decimal("8.50"),
            interest_type="reducing_balance",
            start_date=date(2026, 1, 1),
            tenure_months=36,
        ),
    )
    create_loan(
        test_db,
        user_id=1,
        payload=LoanCreate(
            name="Credit Card Balance",
            lender="ICICI Bank",
            loan_type="credit",
            principal_amount=Decimal("30000.00"),
            interest_rate_pct=Decimal("42.00"),
            interest_type="reducing_balance",
            start_date=date(2026, 1, 1),
            tenure_months=12,
        ),
    )

    prio = get_prioritization_strategy(test_db, user_id=1)
    assert len(prio.avalanche_strategy) == 2
    # Avalanche: 42% comes first
    assert prio.avalanche_strategy[0].name == "Credit Card Balance"
    # Snowball: 30,000 comes first
    assert prio.snowball_strategy[0].name == "Credit Card Balance"


def test_delete_loan_service(test_db: Session):
    """Test deleting a loan."""
    payload = LoanCreate(
        name="Temporary Loan",
        lender="Friend",
        loan_type="personal",
        principal_amount=Decimal("10000.00"),
        interest_rate_pct=Decimal("0.00"),
        interest_type="reducing_balance",
        start_date=date(2026, 1, 1),
        tenure_months=5,
    )
    loan = create_loan(test_db, user_id=1, payload=payload)
    delete_loan(test_db, user_id=1, loan_id=loan.id)

    summary = get_loans(test_db, user_id=1)
    assert summary.active_loans_count == 0
