/**
 * FinWise API Client
 * Manages HTTP communication, Cryptographic JWT Authentication, and domain endpoints.
 */

let activeUserId = 1;
let activeAuthToken = localStorage.getItem("finwise_auth_token") || null;
let activeUser = null;

try {
  const storedUser = localStorage.getItem("finwise_user");
  if (storedUser) {
    activeUser = JSON.parse(storedUser);
  }
} catch {
  activeUser = null;
}

export const PERSONAS = [
  { id: 1, name: "Aarav Sharma", role: "College Student", tier: "Student", stipend: "₹18,000/mo", email: "aarav@finwise.ai" },
  { id: 2, name: "Priya Patel", role: "Software Engineer", tier: "First Jobber", stipend: "₹65,000/mo", email: "priya@finwise.ai" },
  { id: 3, name: "Rohan Verma", role: "Freelance Designer", tier: "Gig Worker", stipend: "₹48,000/mo", email: "rohan@finwise.ai" },
];

export const getAuthToken = () => {
  return localStorage.getItem("finwise_auth_token") || activeAuthToken;
};

export const getAuthUser = () => {
  if (activeUser) return activeUser;
  try {
    const stored = localStorage.getItem("finwise_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setAuthSession = (token, user) => {
  activeAuthToken = token;
  activeUser = user;
  activeUserId = user?.id || 1;
  if (token) {
    localStorage.setItem("finwise_auth_token", token);
  } else {
    localStorage.removeItem("finwise_auth_token");
  }
  if (user) {
    localStorage.setItem("finwise_user", JSON.stringify(user));
    localStorage.setItem("finwise_user_id", String(user.id));
  } else {
    localStorage.removeItem("finwise_user");
  }
  window.dispatchEvent(new CustomEvent("finwise_auth_changed", { detail: { user, token } }));
  window.dispatchEvent(new CustomEvent("finwise_persona_changed", { detail: activeUserId }));
};

export const setActiveUserId = async (id) => {
  activeUserId = Number(id);
  localStorage.setItem("finwise_user_id", String(activeUserId));

  // Request authentic signed JWT for the selected demo persona
  try {
    const res = await apiFetch(`/api/v1/auth/demo-login/${activeUserId}`, { method: "POST" });
    if (res?.access_token) {
      setAuthSession(res.access_token, res.user);
      return res;
    }
  } catch (err) {
    console.warn("Fallback to persona header mode:", err.message);
  }

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
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": String(getActiveUserId()),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

// ================= Authentication =================
export const registerUser = async (payload) => {
  const res = await apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res?.access_token) {
    setAuthSession(res.access_token, res.user);
  }
  return res;
};

export const loginUser = async (payload) => {
  const res = await apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res?.access_token) {
    setAuthSession(res.access_token, res.user);
  }
  return res;
};

export const demoLogin = async (personaId) => {
  const res = await apiFetch(`/api/v1/auth/demo-login/${personaId}`, {
    method: "POST",
  });
  if (res?.access_token) {
    setAuthSession(res.access_token, res.user);
  }
  return res;
};

export const logoutUser = async () => {
  try {
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
  } catch {
    // Ignore error on logout endpoint
  } finally {
    setAuthSession(null, null);
  }
};

export const getCurrentUser = () => apiFetch("/api/v1/auth/me");

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

// ================= Market Intelligence & Free APIs =================
export const getMarketOverview = () => apiFetch("/api/v1/market/overview");

export const searchStocks = (query) =>
  apiFetch(`/api/v1/market/search?q=${encodeURIComponent(query || "")}`);

export const getStockQuote = (symbol) =>
  apiFetch(`/api/v1/market/stocks/${encodeURIComponent(symbol)}/quote`);

export const getStockHistory = (symbol, timeframe = "1M") =>
  apiFetch(`/api/v1/market/stocks/${encodeURIComponent(symbol)}/history?timeframe=${encodeURIComponent(timeframe)}`);

export const getStockFundamentals = (symbol) =>
  apiFetch(`/api/v1/market/stocks/${encodeURIComponent(symbol)}/fundamentals`);

export const analyzeStockWithAi = (symbol) =>
  apiFetch(`/api/v1/market/stocks/${encodeURIComponent(symbol)}/ai-analyze`, {
    method: "POST",
  });

export const getMarketNews = (symbol = null) =>
  apiFetch(symbol ? `/api/v1/market/news?symbol=${encodeURIComponent(symbol)}` : "/api/v1/market/news");

export const getWatchlist = () => apiFetch("/api/v1/market/watchlist");

export const addToWatchlist = (payload) =>
  apiFetch("/api/v1/market/watchlist", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const removeFromWatchlist = (symbol) =>
  apiFetch(`/api/v1/market/watchlist/${encodeURIComponent(symbol)}`, {
    method: "DELETE",
  });

// ================= Loans & Debt Management =================
export const getLoans = () => apiFetch("/api/v1/loans");

export const getLoanDetail = (loanId) => apiFetch(`/api/v1/loans/${loanId}`);

export const createLoan = (payload) =>
  apiFetch("/api/v1/loans", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const recordLoanRepayment = (loanId, payload) =>
  apiFetch(`/api/v1/loans/${loanId}/repayments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const simulateLoanPrepayment = (loanId, extraMonthlyAmount) =>
  apiFetch(`/api/v1/loans/${loanId}/simulate-extra`, {
    method: "POST",
    body: JSON.stringify({ extra_monthly_amount: extraMonthlyAmount }),
  });

export const getLoanPrioritization = () =>
  apiFetch("/api/v1/loans/strategy/prioritization");

export const deleteLoan = (loanId) =>
  apiFetch(`/api/v1/loans/${loanId}`, {
    method: "DELETE",
  });
