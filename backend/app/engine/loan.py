"""Loan Financial Calculation Engine.

Implements pure Python amortization, EMI calculations, prepayment simulations,
and loan prioritization strategies (Avalanche & Snowball) using Decimal precision.

Formulas:
1. Reducing Balance EMI (Equated Monthly Installment):
   r = annual_interest_rate / 12 / 100
   EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
   If r == 0: EMI = P / n

2. Flat Rate EMI:
   Total Interest = P * (annual_interest_rate / 100) * (n / 12)
   Total Repayment = P + Total Interest
   EMI = Total Repayment / n

3. Prepayment Impact:
   With an additional monthly payment delta_E:
   Solves for new effective tenure n_new with EMI_new = EMI + delta_E.
"""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from typing import Literal


def _quantize_currency(val: Decimal) -> Decimal:
    """Round to 2 decimal places using standard financial round-half-up."""
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class AmortizationScheduleRow:
    """Single month row in an amortization schedule."""

    month: int
    opening_balance: Decimal
    emi: Decimal
    principal_paid: Decimal
    interest_paid: Decimal
    closing_balance: Decimal


@dataclass(frozen=True)
class LoanMetrics:
    """Core calculated metrics for a loan."""

    principal: Decimal
    annual_rate_pct: Decimal
    tenure_months: int
    interest_type: str  # "reducing_balance" | "flat"
    emi: Decimal
    total_repayment: Decimal
    total_interest: Decimal
    effective_cagr_pct: Decimal


@dataclass(frozen=True)
class PrepaymentSimulationResult:
    """Result of simulating extra monthly prepayments."""

    original_tenure_months: int
    new_tenure_months: int
    months_saved: int
    original_total_interest: Decimal
    new_total_interest: Decimal
    interest_saved: Decimal
    extra_monthly_amount: Decimal


@dataclass(frozen=True)
class LoanPriorityItem:
    """Prioritized loan entry for debt payoff strategies."""

    loan_id: int
    name: str
    lender: str
    outstanding_principal: Decimal
    interest_rate_pct: Decimal
    monthly_emi: Decimal
    rank: int
    strategy: str  # "avalanche" | "snowball"
    rationale: str


def calculate_emi(
    principal: Decimal,
    annual_rate_pct: Decimal,
    tenure_months: int,
    interest_type: Literal["reducing_balance", "flat"] = "reducing_balance",
) -> Decimal:
    """Calculate the monthly EMI for a loan.

    Args:
        principal: Principal loan amount (> 0).
        annual_rate_pct: Annual interest percentage (>= 0).
        tenure_months: Loan tenure in months (> 0).
        interest_type: 'reducing_balance' or 'flat'.

    Returns:
        Monthly EMI rounded to 2 decimal places.
    """
    if principal <= Decimal("0"):
        return Decimal("0.00")
    if tenure_months <= 0:
        return _quantize_currency(principal)

    if interest_type == "flat":
        # Flat interest: Total Interest = P * r * (t / 12)
        total_interest = principal * (annual_rate_pct / Decimal("100")) * (Decimal(tenure_months) / Decimal("12"))
        total_amount = principal + total_interest
        emi = total_amount / Decimal(tenure_months)
        return _quantize_currency(emi)

    # Reducing balance (standard EMI formula)
    if annual_rate_pct <= Decimal("0"):
        return _quantize_currency(principal / Decimal(tenure_months))

    monthly_rate = (annual_rate_pct / Decimal("100")) / Decimal("12")
    # (1 + r)^n using float conversion for power, then back to Decimal for precision
    one_plus_r = float(Decimal("1") + monthly_rate)
    compound_factor = Decimal(str(one_plus_r ** tenure_months))

    if compound_factor <= Decimal("1"):
        return _quantize_currency(principal / Decimal(tenure_months))

    numerator = principal * monthly_rate * compound_factor
    denominator = compound_factor - Decimal("1")
    emi = numerator / denominator
    return _quantize_currency(emi)


def generate_amortization_schedule(
    principal: Decimal,
    annual_rate_pct: Decimal,
    tenure_months: int,
    interest_type: Literal["reducing_balance", "flat"] = "reducing_balance",
    extra_monthly_payment: Decimal = Decimal("0.00"),
) -> list[AmortizationScheduleRow]:
    """Generate a complete month-by-month loan amortization schedule.

    Supports optional extra monthly principal prepayments.
    """
    if principal <= Decimal("0") or tenure_months <= 0:
        return []

    emi = calculate_emi(principal, annual_rate_pct, tenure_months, interest_type)
    effective_emi = emi + max(Decimal("0.00"), extra_monthly_payment)

    schedule: list[AmortizationScheduleRow] = []
    balance = principal
    monthly_rate = (annual_rate_pct / Decimal("100")) / Decimal("12")

    # Flat rate has fixed monthly interest component
    flat_monthly_interest = Decimal("0.00")
    if interest_type == "flat":
        total_interest = principal * (annual_rate_pct / Decimal("100")) * (Decimal(tenure_months) / Decimal("12"))
        flat_monthly_interest = _quantize_currency(total_interest / Decimal(tenure_months))

    for month in range(1, tenure_months + 120):  # safety cap
        if balance <= Decimal("0.01"):
            break

        opening_balance = balance

        if interest_type == "reducing_balance":
            interest_paid = _quantize_currency(opening_balance * monthly_rate)
        else:
            interest_paid = flat_monthly_interest

        # If this is the last month of tenure or remaining balance is within 1 EMI, adjust for rounding
        is_last_period = (month == tenure_months) or (opening_balance + interest_paid <= effective_emi + Decimal("1.00"))

        if is_last_period:
            actual_emi = opening_balance + interest_paid
            principal_paid = opening_balance
            closing_balance = Decimal("0.00")
        else:
            actual_emi = effective_emi
            principal_paid = actual_emi - interest_paid
            if principal_paid > opening_balance:
                principal_paid = opening_balance
                actual_emi = principal_paid + interest_paid
            closing_balance = opening_balance - principal_paid

        balance = closing_balance
        schedule.append(
            AmortizationScheduleRow(
                month=month,
                opening_balance=_quantize_currency(opening_balance),
                emi=_quantize_currency(actual_emi),
                principal_paid=_quantize_currency(principal_paid),
                interest_paid=_quantize_currency(interest_paid),
                closing_balance=_quantize_currency(closing_balance),
            )
        )

    return schedule


def compute_loan_metrics(
    principal: Decimal,
    annual_rate_pct: Decimal,
    tenure_months: int,
    interest_type: Literal["reducing_balance", "flat"] = "reducing_balance",
) -> LoanMetrics:
    """Compute aggregate loan parameters including total repayment and interest."""
    emi = calculate_emi(principal, annual_rate_pct, tenure_months, interest_type)
    schedule = generate_amortization_schedule(principal, annual_rate_pct, tenure_months, interest_type)

    total_interest = sum((row.interest_paid for row in schedule), Decimal("0.00"))
    total_repayment = sum((row.emi for row in schedule), Decimal("0.00"))

    # For flat loans, effective reducing rate is roughly ~1.75 - 1.9x the flat rate
    effective_rate = annual_rate_pct
    if interest_type == "flat" and tenure_months > 0 and principal > Decimal("0"):
        # Approximate APR
        effective_rate = _quantize_currency(
            (total_interest / principal) / (Decimal(tenure_months) / Decimal("12")) * Decimal("100") * Decimal("1.85")
        )

    return LoanMetrics(
        principal=_quantize_currency(principal),
        annual_rate_pct=_quantize_currency(annual_rate_pct),
        tenure_months=tenure_months,
        interest_type=interest_type,
        emi=_quantize_currency(emi),
        total_repayment=_quantize_currency(total_repayment),
        total_interest=_quantize_currency(total_interest),
        effective_cagr_pct=_quantize_currency(effective_rate),
    )


def simulate_prepayment(
    principal: Decimal,
    annual_rate_pct: Decimal,
    remaining_tenure_months: int,
    extra_monthly_amount: Decimal,
    interest_type: Literal["reducing_balance", "flat"] = "reducing_balance",
) -> PrepaymentSimulationResult:
    """Simulate the financial impact of paying an extra amount each month."""
    base_schedule = generate_amortization_schedule(
        principal=principal,
        annual_rate_pct=annual_rate_pct,
        tenure_months=remaining_tenure_months,
        interest_type=interest_type,
        extra_monthly_payment=Decimal("0.00"),
    )
    base_total_interest = sum((r.interest_paid for r in base_schedule), Decimal("0.00"))

    if extra_monthly_amount <= Decimal("0.00"):
        return PrepaymentSimulationResult(
            original_tenure_months=remaining_tenure_months,
            new_tenure_months=len(base_schedule),
            months_saved=0,
            original_total_interest=_quantize_currency(base_total_interest),
            new_total_interest=_quantize_currency(base_total_interest),
            interest_saved=Decimal("0.00"),
            extra_monthly_amount=Decimal("0.00"),
        )

    accelerated_schedule = generate_amortization_schedule(
        principal=principal,
        annual_rate_pct=annual_rate_pct,
        tenure_months=remaining_tenure_months,
        interest_type=interest_type,
        extra_monthly_payment=extra_monthly_amount,
    )
    new_total_interest = sum((r.interest_paid for r in accelerated_schedule), Decimal("0.00"))
    new_tenure = len(accelerated_schedule)
    months_saved = max(0, remaining_tenure_months - new_tenure)
    interest_saved = max(Decimal("0.00"), base_total_interest - new_total_interest)

    return PrepaymentSimulationResult(
        original_tenure_months=remaining_tenure_months,
        new_tenure_months=new_tenure,
        months_saved=months_saved,
        original_total_interest=_quantize_currency(base_total_interest),
        new_total_interest=_quantize_currency(new_total_interest),
        interest_saved=_quantize_currency(interest_saved),
        extra_monthly_amount=_quantize_currency(extra_monthly_amount),
    )


def prioritize_loans(
    loans: list[dict],
    strategy: Literal["avalanche", "snowball"] = "avalanche",
) -> list[LoanPriorityItem]:
    """Rank multiple loans by debt-payoff strategies.

    Strategies:
    - Avalanche: Rank highest interest rate first (minimizes lifetime interest paid).
    - Snowball: Rank lowest outstanding balance first (fastest psychological wins).
    """
    if not loans:
        return []

    sorted_loans = list(loans)
    if strategy == "avalanche":
        # Sort by interest_rate_pct descending
        sorted_loans.sort(key=lambda x: Decimal(str(x.get("interest_rate_pct", 0))), reverse=True)
    else:
        # Snowball: sort by outstanding_principal ascending
        sorted_loans.sort(key=lambda x: Decimal(str(x.get("outstanding_principal", 0))))

    prioritized: list[LoanPriorityItem] = []
    for rank, loan in enumerate(sorted_loans, start=1):
        rate = Decimal(str(loan.get("interest_rate_pct", 0)))
        balance = Decimal(str(loan.get("outstanding_principal", 0)))
        emi = Decimal(str(loan.get("emi", 0)))

        if strategy == "avalanche":
            rationale = (
                f"Rank #{rank}: High interest rate ({rate:.2f}%). Paying extra here eliminates expensive debt fastest."
            )
        else:
            rationale = (
                f"Rank #{rank}: Lowest balance (₹{balance:,.2f}). Pay off completely to free up cash flow quickly."
            )

        prioritized.append(
            LoanPriorityItem(
                loan_id=loan.get("id", 0),
                name=loan.get("name", "Unknown Loan"),
                lender=loan.get("lender", "Unknown Lender"),
                outstanding_principal=_quantize_currency(balance),
                interest_rate_pct=_quantize_currency(rate),
                monthly_emi=_quantize_currency(emi),
                rank=rank,
                strategy=strategy,
                rationale=rationale,
            )
        )

    return prioritized
