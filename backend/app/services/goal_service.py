"""Savings Goals Service.

Handles goal CRUD, progress updates, and timeline plan computations.
"""

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.engine.goals import calculate_required_monthly_savings
from app.models import Goal, User
from app.schemas.goal import GoalCreate, GoalPlanResponse, GoalUpdate


def create_goal(db: Session, user_id: int, payload: GoalCreate) -> Goal:
    """Create a new savings goal for a user."""
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")

    goal = Goal(
        user_id=user_id,
        name=payload.name,
        target_amount=payload.target_amount,
        current_saved=payload.current_saved,
        target_date=payload.target_date,
        planned_monthly_contribution=payload.planned_monthly_contribution,
        expected_annual_return_pct=payload.expected_annual_return_pct,
        status="active",
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def list_goals(db: Session, user_id: int) -> list[Goal]:
    """List all goals for a user."""
    stmt = select(Goal).where(Goal.user_id == user_id).order_by(Goal.created_at.desc())
    return list(db.execute(stmt).scalars().all())


def get_goal(db: Session, user_id: int, goal_id: int) -> Goal:
    """Get single goal by ID owned by user."""
    stmt = select(Goal).where(Goal.id == goal_id, Goal.user_id == user_id)
    goal = db.execute(stmt).scalar_one_or_none()
    if not goal:
        raise NotFoundError(f"Goal {goal_id} not found")
    return goal


def update_goal(db: Session, user_id: int, goal_id: int, payload: GoalUpdate) -> Goal:
    """Update goal parameters or status."""
    goal = get_goal(db, user_id, goal_id)

    if payload.name is not None:
        goal.name = payload.name
    if payload.target_amount is not None:
        goal.target_amount = payload.target_amount
    if payload.current_saved is not None:
        goal.current_saved = payload.current_saved
        # Automatically mark achieved if current saved >= target amount
        if goal.current_saved >= goal.target_amount:
            goal.status = "achieved"
    if payload.target_date is not None:
        goal.target_date = payload.target_date
    if payload.planned_monthly_contribution is not None:
        goal.planned_monthly_contribution = payload.planned_monthly_contribution
    if payload.expected_annual_return_pct is not None:
        goal.expected_annual_return_pct = payload.expected_annual_return_pct
    if payload.status is not None:
        goal.status = payload.status

    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, user_id: int, goal_id: int) -> bool:
    """Delete a goal owned by user."""
    goal = get_goal(db, user_id, goal_id)
    db.delete(goal)
    db.commit()
    return True


def get_goal_plan(db: Session, user_id: int, goal_id: int) -> GoalPlanResponse:
    """Calculate required monthly savings and estimated completion for a goal."""
    goal = get_goal(db, user_id, goal_id)
    today = date.today()

    if goal.target_date:
        days_diff = (goal.target_date - today).days
        months_diff = max(1, days_diff // 30)
    else:
        months_diff = 12

    plan = calculate_required_monthly_savings(
        target_amount=goal.target_amount,
        current_saved=goal.current_saved,
        months_to_deadline=months_diff,
        annual_return_pct=goal.expected_annual_return_pct,
    )

    is_on_track = bool(
        goal.planned_monthly_contribution and goal.planned_monthly_contribution >= plan.required_monthly_savings
    ) or plan.is_achieved

    return GoalPlanResponse(
        goal_id=goal.id,
        goal_name=goal.name,
        target_amount=plan.target_amount,
        current_saved=plan.current_saved,
        remaining_amount=plan.remaining_amount,
        target_months=plan.target_months,
        annual_return_pct=plan.annual_return_pct,
        required_monthly_savings=plan.required_monthly_savings,
        is_achieved=plan.is_achieved,
        is_on_track=is_on_track,
        assumptions=plan.assumptions,
    )
