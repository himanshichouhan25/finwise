# FinWise AI — API Specification

All backend endpoints are served under the versioned prefix `/api/v1`.

## 1. Conventions and Headers

- **Content-Type**: `application/json`
- **User Identification**: MVP uses the `X-User-Id` request header (integer user ID).
- **Date Format**: ISO 8601 strings (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`).
- **Monetary Amounts**: Decimal numbers rounded to 2 decimal places.
- **Percentages**: Given as numerical percentages (e.g., `12.5` represents 12.5%).

---

## 2. Standard Error Format

All error responses return HTTP status codes with a consistent JSON envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed."
  }
}
```

### Common Error Codes:
- `NOT_FOUND` (HTTP 404): Requested entity does not exist.
- `VALIDATION_ERROR` (HTTP 422): Input violates range, type, or constraint limits.
- `UNAUTHORIZED` (HTTP 401 / 400): Missing or invalid `X-User-Id`.
- `AI_UNAVAILABLE` (HTTP 503): Groq/LLM service is unreachable or rate-limited; returns deterministic calculation fallback.
- `RATE_LIMITED` (HTTP 429): In-memory user rate limit exceeded.

---

## 3. Endpoints Overview

### System & Personas
- `GET /api/v1/health` — Service health check, database connectivity, and AI status.
- `GET /api/v1/personas` — Predefined persona presets (`student`, `first_job`, `gig_worker`).
- `GET /api/v1/users` — List existing demo users.
- `POST /api/v1/users` — Create demo user.

### Financial Profile & Records
- `GET /api/v1/profile` — Get current user's profile and emergency fund status.
- `PUT /api/v1/profile` — Update expected monthly income, income type, and emergency fund.
- `GET /api/v1/income` — List recorded income entries.
- `POST /api/v1/income` — Add income record.
- `DELETE /api/v1/income/{id}` — Delete income record.
- `GET /api/v1/expenses?month=YYYY-MM` — List monthly expenses.
- `POST /api/v1/expenses` — Create expense (with category and 50/30/20 bucket tag).
- `PATCH /api/v1/expenses/{id}` — Update expense details.
- `DELETE /api/v1/expenses/{id}` — Delete expense.

### Budget & Financial Health
- `GET /api/v1/budget/summary?month=YYYY-MM` — Monthly totals, 50/30/20 bucket variance, category breakdown, and deterministic suggestions.
- `GET /api/v1/health-score` — Compute and snapshot the 0–100 Financial Health Score with factor breakdowns.

### Goals & Simulations
- `GET /api/v1/goals` — List user savings goals.
- `POST /api/v1/goals` — Create savings goal.
- `PATCH /api/v1/goals/{id}` — Update goal progress or target.
- `DELETE /api/v1/goals/{id}` — Delete goal.
- `GET /api/v1/goals/{id}/plan` — Calculate required monthly savings and estimated completion date.
- `POST /api/v1/simulations/goal-whatif` — Compare baseline vs scenario adjustments.
- `POST /api/v1/simulations/sip` — SIP compound growth projection with inflation adjustment.
- `POST /api/v1/simulations/goal-delay` — Calculate goal days delayed for an unnecessary purchase.

### AI Financial Coach
- `POST /api/v1/coach/chat` — Send user message, load user snapshot, execute tool calls, return validated response.
- `GET /api/v1/coach/sessions` — List user conversation sessions.
- `GET /api/v1/coach/sessions/{id}` — Retrieve conversation history.

### Claim Reality Check & Decision Journal
- `POST /api/v1/claims/check` — Analyze finfluencer return claims with deterministic math and red-flag rules.
- `GET /api/v1/claims` — History of analyzed claims.
- `GET /api/v1/journal` — List decision journal entries.
- `POST /api/v1/journal` — Log purchase/investment decision with cooling-off calculation.
- `PATCH /api/v1/journal/{id}` — Review or update decision outcome.
- `GET /api/v1/journal/pending-reviews` — Retrieve entries whose cooling-off period has elapsed.

### Aggregated View
- `GET /api/v1/dashboard` — Single composite payload for the application home screen.
