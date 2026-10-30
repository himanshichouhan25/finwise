"""SIP (Systematic Investment Plan) Compound Growth Engine.

Calculates start-of-month (annuity due) compound wealth accumulation with optional
annual step-up and inflation discounting.

Formulas:
- Effective monthly interest rate: i = (1 + R/100)^(1/12) - 1
- Zero return (R = 0): FV = P * n
- Fixed return (R > 0): FV = P * ((1+i)^n - 1) / i * (1+i)
- Inflation adjustment: FV_real = FV / (1 + inflation_rate/100)^Y
"""

from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class SipYearPoint:
    """Year-by-year milestone data point for charts."""

    year: int
    total_invested: Decimal
    estimated_value: Decimal


@dataclass(frozen=True)
class SipScenario:
    """Simulation scenario at a specific assumed return rate."""

    label: str
    annual_return_pct: Decimal
    total_invested: Decimal
    estimated_value: Decimal
    estimated_gain: Decimal


@dataclass(frozen=True)
class SipCalculationResult:
    """Complete SIP compound growth simulation output."""

    monthly_investment: Decimal
    duration_years: int
    annual_return_pct: Decimal
    annual_step_up_pct: Decimal
    annual_inflation_pct: Decimal
    total_invested: Decimal
    estimated_value: Decimal
    estimated_gain: Decimal
    inflation_adjusted_value: Decimal
    yearly_series: list[SipYearPoint]
    scenarios: list[SipScenario]
    assumptions: list[str] = field(
        default_factory=lambda: [
            "Assumed return rate is a user-chosen projection, not a guarantee or prediction.",
            "Market investments fluctuate and carry risk of capital loss.",
            "Contributions occur at the start of each month (annuity due).",
            "Returns compound monthly using effective rate i = (1 + R)^(1/12) - 1.",
        ]
    )


def calculate_sip(
    monthly_investment: Decimal,
    duration_years: int,
    annual_return_pct: Decimal,
    annual_step_up_pct: Decimal = Decimal("0.00"),
    annual_inflation_pct: Decimal = Decimal("0.00"),
) -> SipCalculationResult:
    """Calculate SIP wealth growth with optional step-up and inflation adjustments.

    Guarantees no negative outputs and validates boundary parameters.
    """
    two_dec = Decimal("0.01")
    p_init = max(Decimal("0.00"), monthly_investment)
    years = max(1, min(50, duration_years))
    r_pct = max(Decimal("0.00"), min(Decimal("50.00"), annual_return_pct))
    step_up_pct = max(Decimal("0.00"), min(Decimal("50.00"), annual_step_up_pct))
    inflation_pct = max(Decimal("0.00"), min(Decimal("30.00"), annual_inflation_pct))

    # Float is mathematically standard for fractional compounding powers,
    # converted cleanly to Decimal at boundary.
    r_float = float(r_pct) / 100.0
    i_monthly = (1.0 + r_float) ** (1.0 / 12.0) - 1.0 if r_float > 0 else 0.0

    current_p = float(p_init)
    current_fv = 0.0
    cumulative_invested = 0.0
    yearly_series: list[SipYearPoint] = []

    for year in range(1, years + 1):
        for _month in range(12):
            cumulative_invested += current_p
            if i_monthly > 0:
                current_fv = (current_fv + current_p) * (1.0 + i_monthly)
            else:
                current_fv += current_p

        yearly_series.append(
            SipYearPoint(
                year=year,
                total_invested=Decimal(str(round(cumulative_invested, 2))).quantize(two_dec, rounding=ROUND_HALF_UP),
                estimated_value=Decimal(str(round(current_fv, 2))).quantize(two_dec, rounding=ROUND_HALF_UP),
            )
        )

        # Apply annual step-up for subsequent years
        if step_up_pct > Decimal("0.00"):
            current_p *= 1.0 + (float(step_up_pct) / 100.0)

    total_invested = Decimal(str(round(cumulative_invested, 2))).quantize(two_dec, rounding=ROUND_HALF_UP)
    estimated_value = Decimal(str(round(current_fv, 2))).quantize(two_dec, rounding=ROUND_HALF_UP)
    estimated_gain = max(Decimal("0.00"), (estimated_value - total_invested).quantize(two_dec, rounding=ROUND_HALF_UP))

    # Inflation adjustment
    if inflation_pct > Decimal("0.00"):
        inf_factor = (1.0 + float(inflation_pct) / 100.0) ** years
        real_val = float(estimated_value) / inf_factor
        inflation_adjusted_value = Decimal(str(round(real_val, 2))).quantize(two_dec, rounding=ROUND_HALF_UP)
    else:
        inflation_adjusted_value = estimated_value

    # Generate low/base/high scenarios
    scenarios: list[SipScenario] = []
    scenario_rates = [
        ("Conservative (-3%)", max(Decimal("0.00"), r_pct - Decimal("3.00"))),
        ("Base Case", r_pct),
        ("Optimistic (+3%)", r_pct + Decimal("3.00")),
    ]

    for label, s_rate in scenario_rates:
        s_res = _compute_simple_sip(p_init, years, s_rate, step_up_pct)
        scenarios.append(
            SipScenario(
                label=label,
                annual_return_pct=s_rate,
                total_invested=s_res[0],
                estimated_value=s_res[1],
                estimated_gain=s_res[2],
            )
        )

    return SipCalculationResult(
        monthly_investment=p_init.quantize(two_dec, rounding=ROUND_HALF_UP),
        duration_years=years,
        annual_return_pct=r_pct.quantize(two_dec, rounding=ROUND_HALF_UP),
        annual_step_up_pct=step_up_pct.quantize(two_dec, rounding=ROUND_HALF_UP),
        annual_inflation_pct=inflation_pct.quantize(two_dec, rounding=ROUND_HALF_UP),
        total_invested=total_invested,
        estimated_value=estimated_value,
        estimated_gain=estimated_gain,
        inflation_adjusted_value=inflation_adjusted_value,
        yearly_series=yearly_series,
        scenarios=scenarios,
    )


def _compute_simple_sip(
    monthly_p: Decimal, years: int, rate_pct: Decimal, step_up: Decimal
) -> tuple[Decimal, Decimal, Decimal]:
    """Helper to compute aggregate totals for scenarios."""
    two_dec = Decimal("0.01")
    r_float = float(rate_pct) / 100.0
    i_monthly = (1.0 + r_float) ** (1.0 / 12.0) - 1.0 if r_float > 0 else 0.0
    current_p = float(monthly_p)
    current_fv = 0.0
    invested = 0.0

    for _y in range(1, years + 1):
        for _m in range(12):
            invested += current_p
            if i_monthly > 0:
                current_fv = (current_fv + current_p) * (1.0 + i_monthly)
            else:
                current_fv += current_p
        if step_up > Decimal("0.00"):
            current_p *= 1.0 + (float(step_up) / 100.0)

    dec_invested = Decimal(str(round(invested, 2))).quantize(two_dec, rounding=ROUND_HALF_UP)
    dec_val = Decimal(str(round(current_fv, 2))).quantize(two_dec, rounding=ROUND_HALF_UP)
    dec_gain = max(Decimal("0.00"), dec_val - dec_invested)
    return dec_invested, dec_val, dec_gain
