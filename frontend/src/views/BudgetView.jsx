import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  PieChart, 
  Wallet, 
  ShoppingBag, 
  Lightbulb 
} from 'lucide-react';
import { 
  getBudgetSummary, 
  getIncomeRecords, 
  addIncomeRecord, 
  deleteIncomeRecord, 
  getExpenseRecords, 
  addExpenseRecord, 
  deleteExpenseRecord 
} from '../api/client';

export default function BudgetView() {
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form states
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('Stipend / Salary');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Groceries');
  const [expenseDescription, setExpenseDescription] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, incRes, expRes] = await Promise.all([
        getBudgetSummary(),
        getIncomeRecords(),
        getExpenseRecords(),
      ]);
      setSummary(sumRes);
      setIncomes(incRes);
      setExpenses(expRes);
    } catch (err) {
      console.error('Failed to load budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handlePersonaChange = () => loadData();
    window.addEventListener('finwise_persona_changed', handlePersonaChange);
    return () => window.removeEventListener('finwise_persona_changed', handlePersonaChange);
  }, []);

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!incomeAmount || Number(incomeAmount) <= 0) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await addIncomeRecord({
        amount: Number(incomeAmount),
        source: incomeSource,
        received_on: todayStr,
        date: todayStr,
      });
      setIncomeAmount('');
      setShowAddIncome(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to add income');
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    try {
      await deleteIncomeRecord(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete income');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await addExpenseRecord({
        amount: Number(expenseAmount),
        category: expenseCategory,
        description: expenseDescription || expenseCategory,
        spent_on: todayStr,
        date: todayStr,
      });
      setExpenseAmount('');
      setExpenseDescription('');
      setShowAddExpense(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      await deleteExpenseRecord(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  if (loading) {
    return <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading budget intelligence...</div>;
  }

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* 50/30/20 Metric Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Needs */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>50% NEEDS</span>
              <span className={`badge ${summary.needs.status === 'within_budget' ? 'badge-teal' : 'badge-crimson'}`}>
                {summary.needs.percent_of_income}% of Income
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
              ₹{Number(summary.needs.actual_amount).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Target: ₹{Number(summary.needs.target_amount).toLocaleString('en-IN')} (Housing, Groceries, Bills)
            </div>
          </div>

          {/* Wants */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>30% WANTS</span>
              <span className={`badge ${summary.wants.status === 'within_budget' ? 'badge-teal' : 'badge-crimson'}`}>
                {summary.wants.percent_of_income}% of Income
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
              ₹{Number(summary.wants.actual_amount).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Target: ₹{Number(summary.wants.target_amount).toLocaleString('en-IN')} (Dining, Subscriptions, Shopping)
            </div>
          </div>

          {/* Savings */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--teal-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>20% SAVINGS / SIP</span>
              <span className={`badge ${Number(summary.savings.percent_of_income) >= 20 ? 'badge-teal' : 'badge-amber'}`}>
                {summary.savings.percent_of_income}% of Income
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal-primary)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
              ₹{Number(summary.savings.actual_amount).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Net Savings Remaining: ₹{Number(summary.net_savings).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Deterministic Optimization Suggestions Box */}
      {summary && summary.suggestions && summary.suggestions.length > 0 && (
        <div className="glass-card" style={{ border: '1px solid rgba(19, 168, 158, 0.3)', background: 'var(--teal-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Lightbulb size={18} color="var(--teal-primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--teal-primary)', margin: 0 }}>
              Deterministic Engine Recommendations
            </h4>
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#0F766E' }}>
            {summary.suggestions.map((s, idx) => (
              <li key={idx} style={{ lineHeight: 1.45 }}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Income & Expense Data Management Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Income Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={18} color="var(--teal-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Income Sources</h3>
            </div>
            <button className="btn btn-teal" onClick={() => setShowAddIncome(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
              <Plus size={14} />
              <span>Add Income</span>
            </button>
          </div>

          {showAddIncome && (
            <form onSubmit={handleAddIncome} style={{ background: 'var(--bg-surface-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="fin-label">Monthly Amount (₹)</label>
                <input
                  type="number"
                  className="fin-input"
                  placeholder="e.g. 25000"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="fin-label">Source / Label</label>
                <select className="fin-select" value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)}>
                  <option value="Stipend / Salary">Stipend / Salary</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Allowance">Family Allowance</option>
                  <option value="Investments">Investment Dividend / Interest</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddIncome(false)} style={{ fontSize: '0.78rem' }}>Cancel</button>
                <button type="submit" className="btn btn-teal" style={{ fontSize: '0.78rem' }}>Save Income</button>
              </div>
            </form>
          )}

          {incomes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No income sources recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {incomes.map((inc) => (
                <div key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.95rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{inc.source}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{inc.date || inc.month}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--teal-primary)', fontSize: '0.95rem' }}>₹{Number(inc.amount).toLocaleString('en-IN')}</span>
                    <button onClick={() => handleDeleteIncome(inc.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }} title="Delete income">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="var(--violet-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Expenses & Auto-Bucketing</h3>
            </div>
            <button className="btn btn-violet" onClick={() => setShowAddExpense(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
              <Plus size={14} />
              <span>Add Expense</span>
            </button>
          </div>

          {showAddExpense && (
            <form onSubmit={handleAddExpense} style={{ background: 'var(--bg-surface-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="fin-label">Expense Amount (₹)</label>
                <input
                  type="number"
                  className="fin-input"
                  placeholder="e.g. 1500"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="fin-label">Category (Auto-classified to 50/30/20)</label>
                <select className="fin-select" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                  <option value="Groceries">Groceries (Needs)</option>
                  <option value="Rent">Rent & Housing (Needs)</option>
                  <option value="Utilities">Utilities & Electricity (Needs)</option>
                  <option value="Transport">Public Transport / Fuel (Needs)</option>
                  <option value="Dining Out">Dining Out & Swiggy (Wants)</option>
                  <option value="Shopping">Shopping & Fashion (Wants)</option>
                  <option value="Entertainment">Netflix & Movies (Wants)</option>
                  <option value="SIP">Mutual Fund SIP (Savings)</option>
                  <option value="Emergency Fund">Emergency Fund Deposit (Savings)</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="fin-label">Note / Description (Optional)</label>
                <input
                  type="text"
                  className="fin-input"
                  placeholder="e.g. Weekend dinner with friends"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddExpense(false)} style={{ fontSize: '0.78rem' }}>Cancel</button>
                <button type="submit" className="btn btn-violet" style={{ fontSize: '0.78rem' }}>Save Expense</button>
              </div>
            </form>
          )}

          {expenses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expenses recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
              {expenses.map((exp) => (
                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.95rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{exp.description || exp.category}</span>
                      <span className={`badge ${exp.bucket === 'needs' ? 'badge-teal' : exp.bucket === 'wants' ? 'badge-amber' : 'badge-slate'}`} style={{ fontSize: '0.65rem' }}>
                        {exp.bucket}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{exp.category} • {exp.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                    <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }} title="Delete expense">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
