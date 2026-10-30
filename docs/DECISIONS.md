# FinWise AI — Architecture Decision Records (ADR)

This document logs all key architectural decisions made during the design and development of FinWise AI.

---

## ADR 001: Modular Monolith Architecture
- **Date:** 2026-10-30
- **Status:** Accepted
- **Context:** MNIT Jaipur 24-Hour Hackathon requires maximum reliability, speed of development, and maintainability. Distributed microservices introduce deployment overhead, network complexity, and failure modes that risk hackathon delivery.
- **Decision:** Build FinWise AI as a clean modular monolith:
  - Single FastAPI backend (`backend/`)
  - Single React SPA with Vite (`frontend/`)
  - Local SQLite database (`finwise.db`)
  - Clear layer isolation: Routers (`api/`) $\rightarrow$ Services (`services/`) $\rightarrow$ Engine (`engine/`) / ORM (`models/`) / AI (`ai/`).
- **Consequences:** Simplifies deployment, guarantees atomic database access, and provides fast local development.

---

## ADR 002: Pure Python Financial Engine (Zero External Dependencies)
- **Date:** 2026-10-30
- **Status:** Accepted
- **Context:** AI models hallucinate calculations, and mixing database or HTTP dependencies into calculation logic makes testing difficult.
- **Decision:** All financial formulas are implemented as pure Python functions inside `backend/app/engine/`:
  - No database access
  - No network or HTTP access
  - No external state or randomness
  - Clock values (dates/timestamps) are passed as explicit arguments
  - Every function returns a typed result object containing an explicit list of `assumptions`
  - The LLM explains and summarizes numbers; it never calculates them.
- **Consequences:** 100% deterministic, robust unit testing, zero hallucinated math.

---

## ADR 003: Synchronous SQLAlchemy 2.x & Sync Route Handlers
- **Date:** 2026-10-30
- **Status:** Accepted
- **Context:** SQLite does not support true concurrent async write operations and async drivers with SQLite frequently introduce concurrency locking bugs in hackathon environments.
- **Decision:** Use synchronous SQLAlchemy 2.x with standard `def` (sync) route functions in FastAPI. FastAPI automatically runs sync route handlers in an external threadpool. Synchronous Groq SDK calls will also execute cleanly in threadpools without blocking the asyncio event loop.
- **Consequences:** Safe SQLite interaction, straightforward debugging, and no event loop locking.

---

## ADR 004: Money Representation and Precision
- **Date:** 2026-10-30
- **Status:** Accepted
- **Context:** Floating-point arithmetic introduces rounding inaccuracies in currency calculations.
- **Decision:**
  - Database: Store money amounts as `Numeric(12, 2)`.
  - Core Logic: Use Python `Decimal` for all budget, transaction, goal tracking, and score computations.
  - Multi-year Projections: SIP projections are long-range compounding estimates, so standard `float` calculation with explicit rounding at the API boundary is acceptable.
  - Currency: Indian Rupee (INR / ₹) formatted using Indian number grouping (`en-IN`, e.g., ₹1,25,000) on the frontend.
- **Consequences:** Zero financial rounding errors, exact rupee reconciliation.

---

## ADR 005: Authentication Strategy for Hackathon MVP
- **Date:** 2026-10-30
- **Status:** Accepted
- **Context:** Full authentication (OAuth, JWT, password resets) consumes significant development time with low hackathon judging value compared to financial intelligence and AI capabilities.
- **Decision:** Defer JWT/OAuth. Use predefined persona demo users (`student`, `first_job`, `gig_worker`). The frontend sends an `X-User-Id` header with each request, validated via an `api/deps.py` dependency (`get_current_user_id`).
- **Consequences:** Instant switching between personas during demonstrations; clean code paths that easily integrate real JWT auth post-hackathon.

---

## ADR 006: API Versioning and Standard Error Envelope
- **Date:** 2026-10-30
- **Status:** Accepted
- **Context:** Consistent API contracts reduce frontend integration issues and prevent leaking internal stack traces.
- **Decision:**
  - All endpoints are prefixed under `/api/v1`.
  - Standard error envelope:
    ```json
    {
      "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable description"
      }
    }
    ```
  - Domain exceptions (`NotFoundError`, `ValidationFailure`, `AIUnavailableError`) map cleanly to HTTP status codes (404, 422, 503).
- **Consequences:** Frontends handle errors predictably without brittle parsing.

---

## ADR 007: Pluggable AI Client with Graceful Degradation
- **Date:** 2026-10-30
- **Status:** Accepted
- **Context:** External LLM APIs can face rate limits, network outages, or missing API keys.
- **Decision:**
  - Define an `LLMClient` protocol in `backend/app/ai/client.py` implemented via Groq SDK (`llama-3.3-70b-versatile`).
  - The application must boot even if `GROQ_API_KEY` is missing or invalid.
  - If Groq fails or times out, return HTTP 503 with error code `AI_UNAVAILABLE` along with a deterministic fallback payload (e.g., pure math summary for budget/claims).
- **Consequences:** System remains resilient and fully functional as a financial calculator even if AI is offline.
