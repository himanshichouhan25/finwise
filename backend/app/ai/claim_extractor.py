"""AI and regex-based parameter extractor for finfluencer investment claims."""

import json
import logging
import re
from dataclasses import dataclass
from decimal import Decimal

from app.ai.client import get_llm_client

logger = logging.getLogger("finwise.ai.claim_extractor")


@dataclass(frozen=True)
class ExtractedClaimParameters:
    """Structured financial parameters extracted from a social media claim."""

    initial_amount: Decimal | None
    claimed_amount: Decimal | None
    claimed_return_pct: Decimal | None
    timeframe_months: Decimal | None
    is_guaranteed: bool
    asset_class: str


def _parse_indian_currency_text(text: str) -> Decimal | None:
    """Parse text representations of Indian currency like '1 Crore', '5 Lakh', '10k', '₹50,000'."""
    text_clean = text.lower().replace(",", "").replace("₹", "").replace("rs.", "").replace("rs", "").strip()

    try:
        # Check Crore
        crore_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)", text_clean)
        if crore_match:
            return Decimal(crore_match.group(1)) * Decimal("10000000")

        # Check Lakh
        lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lacs|lac|lakhs)", text_clean)
        if lakh_match:
            return Decimal(lakh_match.group(1)) * Decimal("100000")

        # Check K (thousands)
        k_match = re.search(r"(\d+(?:\.\d+)?)\s*k\b", text_clean)
        if k_match:
            return Decimal(k_match.group(1)) * Decimal("1000")

        # Direct number
        num_match = re.search(r"(\d+(?:\.\d+)?)", text_clean)
        if num_match:
            return Decimal(num_match.group(1))
    except Exception:
        pass
    return None


def extract_with_regex(claim_text: str) -> ExtractedClaimParameters:
    """Deterministic fallback parser using regex when LLM is unavailable."""
    text_lower = claim_text.lower()

    # 1. Guarantee check
    is_guaranteed = bool(
        re.search(r"\b(?:guaranteed|assured|risk-free|zero\s*risk|100%\s*safe|pakka)\b", text_lower)
    )

    # 2. Asset class
    asset_class = "general"
    if re.search(r"\b(?:crypto|bitcoin|eth|token)\b", text_lower):
        asset_class = "crypto"
    elif re.search(r"\b(?:options?|f&o|futures?|nifty\s*call|put)\b", text_lower):
        asset_class = "derivatives"
    elif re.search(r"\b(?:forex|currency|usd)\b", text_lower):
        asset_class = "forex"
    elif re.search(r"\b(?:stocks?|equity|shares?)\b", text_lower):
        asset_class = "stocks"
    elif re.search(r"\b(?:mutual\s*funds?|sip|index\s*fund)\b", text_lower):
        asset_class = "mutual_funds"

    # 3. Timeframe check
    timeframe_months = Decimal("12.0")
    yr_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:years?|yrs?|saal)\b", text_lower)
    mo_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:months?|mahine)\b", text_lower)
    day_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:days?|din)\b", text_lower)

    if yr_match:
        timeframe_months = Decimal(yr_match.group(1)) * Decimal("12.0")
    elif mo_match:
        timeframe_months = Decimal(mo_match.group(1))
    elif day_match:
        timeframe_months = Decimal(day_match.group(1)) / Decimal("30.0")
    elif "monthly" in text_lower or "har mahine" in text_lower or "per month" in text_lower:
        timeframe_months = Decimal("1.0")

    # 4. Percentage check
    claimed_return_pct: Decimal | None = None
    pct_match = re.search(r"(\d+(?:\.\d+)?)\s*%", text_lower)
    if pct_match:
        claimed_return_pct = Decimal(pct_match.group(1))

    # 5. Amounts check ("turn X into Y" or "X to Y")
    initial_amount: Decimal | None = None
    claimed_amount: Decimal | None = None

    pair_match = re.search(
        r"(?:turn|invest|from)?\s*([₹$]?\s*\d+[,\d]*(?:\s*(?:k|lakh|crore|cr))?)\s*(?:in(?:to)?|to|banaye)\s*([₹$]?\s*\d+[,\d]*(?:\s*(?:k|lakh|crore|cr))?)",
        text_lower,
    )
    if pair_match:
        initial_amount = _parse_indian_currency_text(pair_match.group(1))
        claimed_amount = _parse_indian_currency_text(pair_match.group(2))

    return ExtractedClaimParameters(
        initial_amount=initial_amount,
        claimed_amount=claimed_amount,
        claimed_return_pct=claimed_return_pct,
        timeframe_months=timeframe_months,
        is_guaranteed=is_guaranteed,
        asset_class=asset_class,
    )


def extract_claim_parameters(claim_text: str) -> ExtractedClaimParameters:
    """Extract financial metrics from freeform claim text using LLM or regex fallback."""
    client = get_llm_client()

    if not client.keys:
        return extract_with_regex(claim_text)

    prompt = f"""You are a financial entity extraction engine. Extract quantitative investment parameters from this social media claim:
"{claim_text}"

Return ONLY a JSON object with these exact keys:
{{
  "initial_amount": number or null (e.g. 10000 for ₹10,000),
  "claimed_amount": number or null (e.g. 10000000 for 1 crore),
  "claimed_return_pct": number or null (e.g. 20.0 for 20%),
  "timeframe_months": number or null (e.g. 36 for 3 years, 1 for monthly),
  "is_guaranteed": boolean (true if guaranteed, assured, risk-free, or pakka return),
  "asset_class": string (one of: stocks, crypto, derivatives, forex, mutual_funds, general)
}}"""

    try:
        response = client.complete(
            messages=[{"role": "user", "content": prompt}],
            json_mode=True,
            temperature=0.0,
        )
        if response.content:
            data = json.loads(response.content)
            init_amt = Decimal(str(data["initial_amount"])) if data.get("initial_amount") is not None else None
            claim_amt = Decimal(str(data["claimed_amount"])) if data.get("claimed_amount") is not None else None
            ret_pct = Decimal(str(data["claimed_return_pct"])) if data.get("claimed_return_pct") is not None else None
            tf_mo = (
                Decimal(str(data["timeframe_months"]))
                if data.get("timeframe_months") is not None
                else Decimal("12.0")
            )
            is_guar = bool(data.get("is_guaranteed", False))
            asset_cls = str(data.get("asset_class", "general"))

            return ExtractedClaimParameters(
                initial_amount=init_amt,
                claimed_amount=claim_amt,
                claimed_return_pct=ret_pct,
                timeframe_months=tf_mo,
                is_guaranteed=is_guar,
                asset_class=asset_cls,
            )
    except Exception as e:
        logger.warning("LLM extraction failed (%s). Falling back to regex parser.", str(e))

    return extract_with_regex(claim_text)
