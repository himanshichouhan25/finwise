"""Budget, Income, and Expense Service.

Handles persistence and orchestration for incomes, expenses, profile updates,
and 50/30/20 budget calculations.
"""

from decimal import Decimal

from sqlalchemy import extract, select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.engine.budget import resolve_bucket
from app.models import ExpenseRecord, FinancialProfile, IncomeRecord, User
from app.schemas.dashboard import BudgetBucketSummarySchema, BudgetSummaryResponse
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.schemas.income import IncomeCreate
from app.schemas.profile import ProfileUpdate
from app.services.snapshot_service import build_financial_snapshot


def get_or_create_profile(db: Session, user_id: int) -> FinancialProfile:
    """Retrieve user financial profile or create a default one if absent."""
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")

    profile = db.execute(select(FinancialProfile).where(FinancialProfile.user_id == user_id)).scalar_one_or_none()
    if not profile:
        profile = FinancialProfile(
            user_id=user_id,
            monthly_income=Decimal("25000.00"),
            income_type="fixed",
            emergency_fund_saved=Decimal("0.00"),
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


def update_profile(db: Session, user_id: int, payload: ProfileUpdate) -> FinancialProfile:
    """Update user financial profile."""
    profile = get_or_create_profile(db, user_id)
    profile.monthly_income = payload.monthly_income
    profile.income_type = payload.income_type
    profile.emergency_fund_saved = payload.emergency_fund_saved
    db.commit()
    db.refresh(profile)
    return profile


def create_income(db: Session, user_id: int, payload: IncomeCreate) -> IncomeRecord:
    """Record a new income entry."""
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")

    income = IncomeRecord(
        user_id=user_id,
        amount=payload.amount,
        source=payload.source,
        received_on=payload.received_on,
        is_recurring=payload.is_recurring,
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


def list_incomes(db: Session, user_id: int) -> list[IncomeRecord]:
    """List all income records for a user ordered by date descending."""
    stmt = select(IncomeRecord).where(IncomeRecord.user_id == user_id).order_by(IncomeRecord.received_on.desc())
    return list(db.execute(stmt).scalars().all())


def delete_income(db: Session, user_id: int, income_id: int) -> bool:
    """Delete an income record owned by user."""
    stmt = select(IncomeRecord).where(IncomeRecord.id == income_id, IncomeRecord.user_id == user_id)
    record = db.execute(stmt).scalar_one_or_none()
    if not record:
        raise NotFoundError(f"Income record {income_id} not found")
    db.delete(record)
    db.commit()
    return True


def create_expense(db: Session, user_id: int, payload: ExpenseCreate) -> ExpenseRecord:
    """Record a new expense entry, resolving 50/30/20 bucket automatically if omitted."""
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")

    resolved_bucket = resolve_bucket(payload.category, payload.bucket)

    expense = ExpenseRecord(
        user_id=user_id,
        amount=payload.amount,
        category=payload.category,
        bucket=resolved_bucket,
        description=payload.description,
        spent_on=payload.spent_on,
        is_impulsive=payload.is_impulsive,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def list_expenses(db: Session, user_id: int, month_str: str | None = None) -> list[ExpenseRecord]:
    """List expense records for a user, optionally filtered by month (YYYY-MM)."""
    stmt = select(ExpenseRecord).where(ExpenseRecord.user_id == user_id)
    if month_str and len(month_str) == 7 and "-" in month_str:
        try:
            year, month = map(int, month_str.split("-"))
            stmt = stmt.where(
                extract("year", ExpenseRecord.spent_on) == year,
                extract("month", ExpenseRecord.spent_on) == month,
            )
        except ValueError:
            pass

    stmt = stmt.order_by(ExpenseRecord.spent_on.desc())
    return list(db.execute(stmt).scalars().all())


def update_expense(db: Session, user_id: int, expense_id: int, payload: ExpenseUpdate) -> ExpenseRecord:
    """Update an existing expense record."""
    stmt = select(ExpenseRecord).where(ExpenseRecord.id == expense_id, ExpenseRecord.user_id == user_id)
    record = db.execute(stmt).scalar_one_or_none()
    if not record:
        raise NotFoundError(f"Expense record {expense_id} not found")

    if payload.amount is not None:
        record.amount = payload.amount
    if payload.category is not None:
        record.category = payload.category
        if payload.bucket is None:
            record.bucket = resolve_bucket(payload.category)
    if payload.bucket is not None:
        record.bucket = payload.bucket
    if payload.description is not None:
        record.description = payload.description
    if payload.spent_on is not None:
        record.spent_on = payload.spent_on
    if payload.is_impulsive is not None:
        record.is_impulsive = payload.is_impulsive

    db.commit()
    db.refresh(record)
    return record


def delete_expense(db: Session, user_id: int, expense_id: int) -> bool:
    """Delete an expense record owned by user."""
    stmt = select(ExpenseRecord).where(ExpenseRecord.id == expense_id, ExpenseRecord.user_id == user_id)
    record = db.execute(stmt).scalar_one_or_none()
    if not record:
        raise NotFoundError(f"Expense record {expense_id} not found")
    db.delete(record)
    db.commit()
    return True


def get_budget_summary(db: Session, user_id: int, month_str: str | None = None) -> BudgetSummaryResponse:
    """Generate 50/30/20 budget summary from user snapshot."""
    snapshot = build_financial_snapshot(db, user_id, month_str)
    b = snapshot.budget_summary

    return BudgetSummaryResponse(
        month=snapshot.month_str,
        net_income=b.net_income,
        total_expenses=b.total_expenses,
        net_savings=b.net_savings,
        needs=BudgetBucketSummarySchema(
            bucket=b.needs.bucket,
            target_pct=b.needs.target_pct,
            target_amount=b.needs.target_amount,
            actual_amount=b.needs.actual_amount,
            variance=b.needs.variance,
            percent_of_income=b.needs.percent_of_income,
            status=b.needs.status,
        ),
        wants=BudgetBucketSummarySchema(
            bucket=b.wants.bucket,
            target_pct=b.wants.target_pct,
            target_amount=b.wants.target_amount,
            actual_amount=b.wants.actual_amount,
            variance=b.wants.variance,
            percent_of_income=b.wants.percent_of_income,
            status=b.wants.status,
        ),
        savings=BudgetBucketSummarySchema(
            bucket=b.savings.bucket,
            target_pct=b.savings.target_pct,
            target_amount=b.savings.target_amount,
            actual_amount=b.savings.actual_amount,
            variance=b.savings.variance,
            percent_of_income=b.savings.percent_of_income,
            status=b.savings.status,
        ),
        suggestions=b.suggestions,
        assumptions=b.assumptions,
    )
