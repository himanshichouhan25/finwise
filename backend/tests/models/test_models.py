"""Unit tests for SQLAlchemy ORM models, relationships, and cascading deletes."""

from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    ChatMessage,
    ChatSession,
    ExpenseRecord,
    FinancialProfile,
    Goal,
    IncomeRecord,
    User,
)


def test_user_creation_and_profile_relationship(db_session: Session):
    """Test creating a user with a 1:1 financial profile."""
    user = User(name="Test User", persona="student", language_pref="en")
    db_session.add(user)
    db_session.flush()

    profile = FinancialProfile(
        user_id=user.id,
        monthly_income=Decimal("20000.00"),
        income_type="fixed",
        emergency_fund_saved=Decimal("5000.00"),
    )
    db_session.add(profile)
    db_session.commit()

    # Query user and verify profile relationship
    fetched_user = db_session.execute(select(User).where(User.id == user.id)).scalar_one()
    assert fetched_user.profile is not None
    assert fetched_user.profile.monthly_income == Decimal("20000.00")
    assert fetched_user.profile.emergency_fund_saved == Decimal("5000.00")


def test_expense_and_goal_records_with_decimal_precision(db_session: Session):
    """Verify numeric decimal precision for expenses and goals."""
    user = User(name="Worker User", persona="first_job", language_pref="hinglish")
    db_session.add(user)
    db_session.flush()

    expense = ExpenseRecord(
        user_id=user.id,
        amount=Decimal("1250.75"),
        category="Groceries",
        bucket="needs",
        description="Fresh vegetables and fruits",
        spent_on=date.today(),
        is_impulsive=False,
    )
    goal = Goal(
        user_id=user.id,
        name="Emergency Reserve",
        target_amount=Decimal("100000.00"),
        current_saved=Decimal("25000.50"),
        status="active",
    )
    db_session.add_all([expense, goal])
    db_session.commit()

    fetched_user = db_session.execute(select(User).where(User.id == user.id)).scalar_one()
    assert len(fetched_user.expenses) == 1
    assert fetched_user.expenses[0].amount == Decimal("1250.75")
    assert len(fetched_user.goals) == 1
    assert fetched_user.goals[0].current_saved == Decimal("25000.50")


def test_cascade_delete_from_user(db_session: Session):
    """Verify that deleting a user cascades and deletes all related child records."""
    user = User(name="To Delete", persona="gig_worker", language_pref="en")
    db_session.add(user)
    db_session.flush()

    profile = FinancialProfile(
        user_id=user.id,
        monthly_income=Decimal("30000.00"),
        income_type="irregular",
    )
    income = IncomeRecord(
        user_id=user.id,
        amount=Decimal("30000.00"),
        source="Freelance Contract",
        received_on=date.today(),
    )
    session = ChatSession(user_id=user.id, title="Test Chat")
    db_session.add_all([profile, income, session])
    db_session.flush()

    message = ChatMessage(session_id=session.id, role="user", content="Hello Coach")
    db_session.add(message)
    db_session.commit()

    # Now delete user
    db_session.delete(user)
    db_session.commit()

    # Verify all child records are deleted
    assert db_session.execute(select(FinancialProfile).where(FinancialProfile.user_id == user.id)).scalar_one_or_none() is None
    assert db_session.execute(select(IncomeRecord).where(IncomeRecord.user_id == user.id)).scalar_one_or_none() is None
    assert db_session.execute(select(ChatSession).where(ChatSession.user_id == user.id)).scalar_one_or_none() is None
    assert db_session.execute(select(ChatMessage).where(ChatMessage.session_id == session.id)).scalar_one_or_none() is None
