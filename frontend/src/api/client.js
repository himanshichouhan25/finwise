/**
 * FinWise API Client
 * Manages HTTP communication, Persona headers (X-User-Id), and domain endpoints.
 */

let activeUserId = 1;

export const PERSONAS = [
  { id: 1, name: "Aarav Sharma", role: "College Student", tier: "Student", stipend: "₹18,000/mo" },
  { id: 2, name: "Priya Patel", role: "Software Engineer", tier: "First Jobber", stipend: "₹65,000/mo" },
  { id: 3, name: "Rohan Verma", role: "Freelance Designer", tier: "Gig Worker", stipend: "₹48,000/mo" },
];

export const setActiveUserId = (id) => {
  activeUserId = Number(id);
  localStorage.setItem("finwise_user_id", String(activeUserId));
  window.dispatchEvent(new CustomEvent("finwise_persona_changed", { detail: activeUserId }));
};

export const getActiveUserId = () => {
  const stored = localStorage.getItem("finwise_user_id");
  if (stored) {
    activeUserId = Number(stored);
  }
  return activeUserId;
};

// Initialize from storage if present
getActiveUserId();

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": String(getActiveUserId()),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const data = contentType && contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error?.message || `API request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = data?.error?.code || "HTTP_ERROR";
    err.details = data?.error?.details;
    throw err;
  }

  return data;
}

// ================= Dashboard & Profile =================
export const getDashboardData = () => apiFetch("/api/v1/dashboard");
export const getProfile = () => apiFetch("/api/v1/profile");
export const updateProfile = (profileData) =>
  apiFetch("/api/v1/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });

// ================= Budget, Income & Expenses =================
export const getBudgetSummary = (month) =>
  apiFetch(month ? `/api/v1/budget/summary?month=${month}` : "/api/v1/budget/summary");

export const getIncomeRecords = () => apiFetch("/api/v1/income");
export const addIncomeRecord = (income) =>
  apiFetch("/api/v1/income", {
    method: "POST",
    body: JSON.stringify(income),
  });
export const deleteIncomeRecord = (id) =>
  apiFetch(`/api/v1/income/${id}`, {
    method: "DELETE",
  });

export const getExpenseRecords = () => apiFetch("/api/v1/expenses");
export const addExpenseRecord = (expense) =>
  apiFetch("/api/v1/expenses", {
    method: "POST",
    body: JSON.stringify(expense),
  });
export const deleteExpenseRecord = (id) =>
  apiFetch(`/api/v1/expenses/${id}`, {
    method: "DELETE",
  });

// ================= Goals & Simulations =================
export const getGoals = () => apiFetch("/api/v1/goals");
export const createGoal = (goal) =>
  apiFetch("/api/v1/goals", {
    method: "POST",
    body: JSON.stringify(goal),
  });
export const getGoalPlan = (goalId) => apiFetch(`/api/v1/goals/${goalId}/plan`);

export const runSipSimulation = (payload) =>
  apiFetch("/api/v1/simulations/sip", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const runGoalWhatIf = (payload) =>
  apiFetch("/api/v1/simulations/goal-what-if", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const runGoalDelaySimulation = (payload) =>
  apiFetch("/api/v1/simulations/goal-delay", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ================= Financial Health Score =================
export const getHealthScore = () => apiFetch("/api/v1/health-score");

// ================= AI Financial Coach =================
export const sendCoachMessage = (message, sessionId = null) =>
  apiFetch("/api/v1/coach/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId }),
  });

export const getCoachSessions = () => apiFetch("/api/v1/coach/sessions");
export const getCoachSessionDetail = (sessionId) => apiFetch(`/api/v1/coach/sessions/${sessionId}`);

// ================= Finfluencer Claim Reality Check =================
export const analyzeClaim = (claimText) =>
  apiFetch("/api/v1/claims/analyze", {
    method: "POST",
    body: JSON.stringify({ claim_text: claimText }),
  });

export const getClaimHistory = () => apiFetch("/api/v1/claims/history");

// ================= Impulse Decision Journal =================
export const getJournalEntries = (status = null) =>
  apiFetch(status ? `/api/v1/journal/entries?status=${status}` : "/api/v1/journal/entries");

export const createJournalEntry = (entry) =>
  apiFetch("/api/v1/journal/entries", {
    method: "POST",
    body: JSON.stringify(entry),
  });

export const decideJournalEntry = (entryId, decision, outcomeNote = "") =>
  apiFetch(`/api/v1/journal/entries/${entryId}/decide`, {
    method: "POST",
    body: JSON.stringify({ decision, outcome_note: outcomeNote }),
  });

export const getJournalSummary = () => apiFetch("/api/v1/journal/summary");
