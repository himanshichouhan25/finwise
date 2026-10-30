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
      await addIncomeRecord({
        amount: Number(incomeAmount),
        source: incomeSource,
        date: new Date().toISOString().split('T')[0],
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
      await addExpenseRecord({
        amount: Number(expenseAmount),
        category: expenseCategory,
        description: expenseDescription || expenseCategory,
        date: new Date().toISOString().split('T')[0],
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
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading budget data...</div>;
  }

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px' }}>
      {/* 50/30/20 Metric Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Needs */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>50% NEEDS</span>
              <span className={`badge ${summary.needs.status === 'within_budget' ? 'badge-teal' : 'badge-crimson'}`}>
                {summary.needs.percent_of_income}% of Income
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
              ₹{Number(summary.needs.actual_amount).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
              Target: ₹{Number(summary.needs.target_amount).toLocaleString('en-IN')} (Rent, Groceries, Bills)
            </div>
          </div>

          {/* Wants */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>30% WANTS</span>
              <span className={`badge ${summary.wants.status === 'within_budget' ? 'badge-teal' : 'badge-crimson'}`}>
                {summary.wants.percent_of_income}% of Income
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
              ₹{Number(summary.wants.actual_amount).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
              Target: ₹{Number(summary.wants.target_amount).toLocaleString('en-IN')} (Dining, Shopping, Movies)
            </div>
          </div>

          {/* Savings */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>20% SAVINGS / SIP</span>
              <span className={`badge ${Number(summary.savings.percent_of_income) >= 20 ? 'badge-teal' : 'badge-amber'}`}>
                {summary.savings.percent_of_income}% of Income
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2DD4BF', marginTop: '0.5rem' }}>
              ₹{Number(summary.savings.actual_amount).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
              Net Savings Remaining: ₹{Number(summary.net_savings).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Deterministic Optimization Suggestions Box */}
      {summary && summary.suggestions && summary.suggestions.length > 0 && (
        <div className="glass-card" style={{ border: '1px solid rgba(20, 184, 166, 0.3)', background: 'rgba(20, 184, 166, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lightbulb size={18} color="#2DD4BF" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2DD4BF' }}>
              Deterministic Engine Recommendations
            </h4>
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
            {summary.suggestions.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Income & Expense Data Management Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Income Table */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={18} color="#14B8A6" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Income Sources</h3>
            </div>
            <button className="btn btn-teal" onClick={() => setShowAddIncome(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Plus size={14} />
              <span>Add Income</span>
            </button>
          </div>

          {showAddIncome && (
            <form onSubmit={handleAddIncome} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddIncome(false)} style={{ fontSize: '0.75rem' }}>Cancel</button>
                <button type="submit" className="btn btn-teal" style={{ fontSize: '0.75rem' }}>Save Income</button>
              </div>
            </form>
          )}

          {incomes.length === 0 ? (
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No income sources recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {incomes.map((inc) => (
                <div key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>{inc.source}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{inc.date || inc.month}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#2DD4BF' }}>₹{Number(inc.amount).toLocaleString('en-IN')}</span>
                    <button onClick={() => handleDeleteIncome(inc.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Table */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="#F59E0B" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Expenses & Auto-Bucketing</h3>
            </div>
            <button className="btn btn-gold" onClick={() => setShowAddExpense(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Plus size={14} />
              <span>Add Expense</span>
            </button>
          </div>

          {showAddExpense && (
            <form onSubmit={handleAddExpense} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddExpense(false)} style={{ fontSize: '0.75rem' }}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ fontSize: '0.75rem' }}>Save Expense</button>
              </div>
            </form>
          )}

          {expenses.length === 0 ? (
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No expenses recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
              {expenses.map((exp) => (
                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>{exp.description || exp.category}</span>
                      <span className={`badge ${exp.bucket === 'needs' ? 'badge-teal' : exp.bucket === 'wants' ? 'badge-amber' : 'badge-slate'}`} style={{ fontSize: '0.65rem' }}>
                        {exp.bucket}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{exp.category} • {exp.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#F8FAFC' }}>₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                    <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={14} />
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
