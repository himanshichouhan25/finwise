"""Financial Snapshot Service.

Builds a consolidated, real-time FinancialSnapshot for a user and target month.
Central source of truth for Dashboard, AI Coach, and Health Score analytics.
"""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import extract, func, select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.engine.budget import BudgetSummaryResult, calculate_budget_summary
from app.engine.goals import GoalPlanResult, calculate_required_monthly_savings
from app.engine.health_score import HealthScoreResult, compute_health_score
from app.models import (
    ExpenseRecord,
    FinancialProfile,
    Goal,
    IncomeRecord,
    JournalEntry,
    User,
)


@dataclass
class GoalWithPlan:
    """Active goal entity coupled with its engine-calculated plan."""

    goal: Goal
    plan: GoalPlanResult


@dataclass
class FinancialSnapshot:
    """Unified financial intelligence state for a user."""

    user: User
    profile: FinancialProfile | None
    month_str: str  # YYYY-MM
    net_income: Decimal
    income_source_summary: list[dict]
    expenses_by_bucket: dict[str, Decimal]  # needs, wants, savings
    budget_summary: BudgetSummaryResult
    goals_with_plans: list[GoalWithPlan]
    health_score: HealthScoreResult
    pending_journal_reviews_count: int


def build_financial_snapshot(db: Session, user_id: int, target_month: str | None = None) -> FinancialSnapshot:
    """Build fresh FinancialSnapshot directly from persistent SQLite state.

    If target_month is None, defaults to current calendar month (YYYY-MM).
    """
    # 1. Load User & Profile
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")

    profile = db.execute(select(FinancialProfile).where(FinancialProfile.user_id == user_id)).scalar_one_or_none()

    # Determine target year and month
    today = date.today()
    if target_month and len(target_month) == 7 and "-" in target_month:
        try:
            year, month = map(int, target_month.split("-"))
            month_str = target_month
        except ValueError:
            year, month = today.year, today.month
            month_str = f"{year:04d}-{month:02d}"
    else:
        year, month = today.year, today.month
        month_str = f"{year:04d}-{month:02d}"

    # 2. Query monthly income
    income_stmt = select(IncomeRecord).where(
        IncomeRecord.user_id == user_id,
        extract("year", IncomeRecord.received_on) == year,
        extract("month", IncomeRecord.received_on) == month,
    )
    incomes = db.execute(income_stmt).scalars().all()

    income_total = sum((inc.amount for inc in incomes), Decimal("0.00"))
    # If no income entries recorded for month, fallback to profile expected monthly income
    if income_total <= Decimal("0.00") and profile:
        effective_income = profile.monthly_income
    else:
        effective_income = income_total

    income_source_summary = [{"source": inc.source, "amount": inc.amount} for inc in incomes]

    # 3. Query monthly expenses by bucket
    expense_stmt = select(ExpenseRecord).where(
        ExpenseRecord.user_id == user_id,
        extract("year", ExpenseRecord.spent_on) == year,
        extract("month", ExpenseRecord.spent_on) == month,
    )
    expenses = db.execute(expense_stmt).scalars().all()

    needs_spent = Decimal("0.00")
    wants_spent = Decimal("0.00")
    savings_spent = Decimal("0.00")

    for exp in expenses:
        b = exp.bucket.lower()
        if b == "needs":
            needs_spent += exp.amount
        elif b == "wants":
            wants_spent += exp.amount
        elif b == "savings":
            savings_spent += exp.amount
        else:
            wants_spent += exp.amount

    expenses_by_bucket = {
        "needs": needs_spent,
        "wants": wants_spent,
        "savings": savings_spent,
    }

    # 4. Calculate Budget Summary via Engine
    budget_result = calculate_budget_summary(
        net_income=effective_income,
        needs_spent=needs_spent,
        wants_spent=wants_spent,
        savings_spent=savings_spent,
        persona=user.persona,
    )

    # 5. Query active goals and compute plans
    goals_stmt = select(Goal).where(Goal.user_id == user_id, Goal.status != "archived")
    goals = db.execute(goals_stmt).scalars().all()

    goals_with_plans: list[GoalWithPlan] = []
    goals_on_track_count = 0

    for g in goals:
        # Calculate months to deadline if target_date exists
        if g.target_date:
            days_diff = (g.target_date - today).days
            months_diff = max(1, days_diff // 30)
        else:
            months_diff = 12

        plan = calculate_required_monthly_savings(
            target_amount=g.target_amount,
            current_saved=g.current_saved,
            months_to_deadline=months_diff,
            annual_return_pct=g.expected_annual_return_pct,
        )

        # Check if on track (if planned monthly contribution >= required)
        is_on_track = bool(
            g.planned_monthly_contribution and g.planned_monthly_contribution >= plan.required_monthly_savings
        ) or plan.is_achieved

        if is_on_track:
            goals_on_track_count += 1

        goals_with_plans.append(GoalWithPlan(goal=g, plan=plan))

    # 6. Compute Health Score via Engine
    emergency_saved = profile.emergency_fund_saved if profile else Decimal("0.00")
    is_fixed = profile.income_type == "fixed" if profile else True

    health_score_result = compute_health_score(
        net_income=effective_income,
        needs_spent=needs_spent,
        wants_spent=wants_spent,
        savings_spent=savings_spent,
        emergency_fund_saved=emergency_saved,
        active_goals_count=len(goals),
        goals_on_track_count=goals_on_track_count,
        is_fixed_income=is_fixed,
    )

    # 7. Query pending decision journal reviews
    journal_stmt = select(func.count(JournalEntry.id)).where(
        JournalEntry.user_id == user_id,
        JournalEntry.status == "pending_review",
    )
    pending_reviews_count = db.execute(journal_stmt).scalar() or 0

    return FinancialSnapshot(
        user=user,
        profile=profile,
        month_str=month_str,
        net_income=effective_income,
        income_source_summary=income_source_summary,
        expenses_by_bucket=expenses_by_bucket,
        budget_summary=budget_result,
        goals_with_plans=goals_with_plans,
        health_score=health_score_result,
        pending_journal_reviews_count=pending_reviews_count,
    )
