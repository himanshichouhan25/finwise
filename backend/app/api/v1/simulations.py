"""Financial simulation endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.simulation import (
    GoalDelayRequest,
    GoalDelayResponse,
    GoalWhatIfRequest,
    GoalWhatIfResponse,
    SipRequest,
    SipResponse,
)
from app.services.simulation_service import (
    run_goal_delay_simulation,
    run_goal_what_if,
    run_sip_simulation,
)

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post("/sip", response_model=SipResponse)
def simulate_sip_projection(payload: SipRequest) -> SipResponse:
    """Project wealth accumulation via SIP compound growth with step-up and inflation."""
    return run_sip_simulation(payload)


@router.post("/goal-whatif", response_model=GoalWhatIfResponse)
def simulate_goal_scenario(payload: GoalWhatIfRequest) -> GoalWhatIfResponse:
    """Simulate comparative outcome between baseline and adjusted goal parameters."""
    return run_goal_what_if(payload)


@router.post("/goal-delay", response_model=GoalDelayResponse)
def simulate_goal_delay(
    payload: GoalDelayRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> GoalDelayResponse:
    """Calculate the timeline delay on a savings goal caused by an unnecessary purchase."""
    return run_goal_delay_simulation(db, user_id, payload)
