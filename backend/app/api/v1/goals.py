"""Savings goals endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.goal import GoalCreate, GoalPlanResponse, GoalResponse, GoalUpdate
from app.services.goal_service import (
    create_goal,
    delete_goal,
    get_goal,
    get_goal_plan,
    list_goals,
    update_goal,
)

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("", response_model=list[GoalResponse])
def get_user_goals(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> list[GoalResponse]:
    """List all financial goals for current user."""
    goals = list_goals(db, user_id)
    return [GoalResponse.model_validate(g) for g in goals]


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def add_user_goal(
    payload: GoalCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> GoalResponse:
    """Create a new savings goal."""
    goal = create_goal(db, user_id, payload)
    return GoalResponse.model_validate(goal)


@router.get("/{goal_id}", response_model=GoalResponse)
def get_user_goal(
    goal_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> GoalResponse:
    """Retrieve details of a specific goal."""
    goal = get_goal(db, user_id, goal_id)
    return GoalResponse.model_validate(goal)


@router.patch("/{goal_id}", response_model=GoalResponse)
def modify_user_goal(
    goal_id: int,
    payload: GoalUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> GoalResponse:
    """Update a goal's parameters or recorded progress."""
    goal = update_goal(db, user_id, goal_id, payload)
    return GoalResponse.model_validate(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_goal(
    goal_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Delete a savings goal."""
    delete_goal(db, user_id, goal_id)


@router.get("/{goal_id}/plan", response_model=GoalPlanResponse)
def get_goal_contribution_plan(
    goal_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> GoalPlanResponse:
    """Calculate required monthly savings and estimated completion for a goal."""
    return get_goal_plan(db, user_id, goal_id)
