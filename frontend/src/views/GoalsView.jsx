import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, Clock, AlertCircle, ArrowRight, Sparkles, X } from 'lucide-react';
import { getGoals, createGoal, runGoalDelaySimulation } from '../api/client';

export default function GoalsView() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating goal
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');

  // Goal-Days Delayed Widget States
  const [spendAmount, setSpendAmount] = useState('4500');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [delayResult, setDelayResult] = useState(null);
  const [delayLoading, setDelayLoading] = useState(false);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await getGoals();
      setGoals(res);
      if (res.length > 0 && !selectedGoalId) {
        setSelectedGoalId(String(res[0].id));
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
    const handlePersonaChange = () => loadGoals();
    window.addEventListener('finwise_persona_changed', handlePersonaChange);
    return () => window.removeEventListener('finwise_persona_changed', handlePersonaChange);
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) return;
    try {
      await createGoal({
        name,
        target_amount: Number(targetAmount),
        target_date: targetDate,
        current_saved: Number(currentSaved) || 0,
        planned_monthly_contribution: Number(monthlyContribution) || 0,
        expected_annual_return_pct: 0,
      });
      setShowCreateModal(false);
      setName('');
      setTargetAmount('');
      setTargetDate('');
      setCurrentSaved('');
      setMonthlyContribution('');
      loadGoals();
    } catch (err) {
      alert(err.message || 'Failed to create goal');
    }
  };

  const handleCalculateDelay = async () => {
    if (!spendAmount || Number(spendAmount) <= 0) return;
    try {
      setDelayLoading(true);
      const res = await runGoalDelaySimulation({
        spend_amount: Number(spendAmount),
        goal_id: selectedGoalId ? Number(selectedGoalId) : null,
      });
      setDelayResult(res);
    } catch (err) {
      console.error('Failed to calculate delay:', err);
    } finally {
      setDelayLoading(false);
    }
  };

  useEffect(() => {
    if (goals.length > 0) {
      handleCalculateDelay();
    }
  }, [spendAmount, selectedGoalId, goals]);

  if (loading) {
    return <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading financial goals...</div>;
  }

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Banner & Action */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--violet-primary)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="var(--violet-primary)" />
            <span>Goal Planning & Delayed Gratification Engine</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Map target milestones, track real completion progress, and calculate the exact timeline delays caused by impulsive purchases.
          </p>
        </div>
        <button className="btn btn-violet" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>New Financial Goal</span>
        </button>
      </div>

      {/* Goal-Days Delayed Signature Feature Card */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--bg-surface-amber) 0%, #FFFFFF 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <Clock size={20} color="var(--gold-primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#B45309', margin: 0 }}>
            Goal-Days Delayed Calculator (Impulse Spend Reality Check)
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Before buying sneakers, ordering food, or checking out online, calculate exactly how many days of your planned savings this purchase sets you back.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="fin-label">Contemplated Spend Amount (₹)</label>
            <input
              type="number"
              className="fin-input"
              value={spendAmount}
              onChange={(e) => setSpendAmount(e.target.value)}
              placeholder="e.g. 4500"
            />
          </div>

          <div>
            <label className="fin-label">Target Milestone to Compare</label>
            <select
              className="fin-select"
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (Plan: ₹{Number(g.planned_monthly_contribution || 0).toLocaleString('en-IN')}/mo)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Delay Calculation Output Banner */}
        {delayResult && (
          <div className="glass-card" style={{ marginTop: '1.25rem', background: '#FFFFFF', border: '1px solid #FCD34D', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', padding: '0.65rem 1.15rem', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', border: '1px solid #FEE2E2' }}>
                <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, display: 'block' }}>DELAY PENALTY</span>
                <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#DC2626' }}>
                  +{delayResult.days_delayed} Days
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.96rem' }}>
                  {delayResult.message}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Based on daily savings rate of ₹{Number(delayResult.daily_goal_rate).toFixed(2)}/day toward your {delayResult.goal_name || 'goal'}.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Goals Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Active Milestones ({goals.length})
        </h3>

        {goals.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0 }}>No goals defined yet. Click "New Financial Goal" above to create one.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {goals.map((g) => {
              const progressPct = g.target_amount > 0 ? (Number(g.current_saved) / Number(g.target_amount)) * 100 : 0;
              const remaining = Math.max(0, Number(g.target_amount) - Number(g.current_saved));

              return (
                <div key={g.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={18} color="var(--teal-primary)" />
                      <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.02rem', margin: 0 }}>{g.name}</h4>
                    </div>
                    <span className="badge badge-teal">{progressPct.toFixed(1)}%</span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Saved: ₹{Number(g.current_saved).toLocaleString('en-IN')}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Target: ₹{Number(g.target_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ background: '#E2E8F0', height: '8px', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--teal-primary)', height: '100%', width: `${Math.min(100, progressPct)}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>REMAINING</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>₹{remaining.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>MONTHLY PLAN</span>
                      <span style={{ fontWeight: 800, color: 'var(--teal-primary)', fontSize: '0.9rem' }}>₹{Number(g.planned_monthly_contribution || 0).toLocaleString('en-IN')}/mo</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} />
                    <span>Target Deadline: {g.target_date || 'Ongoing Milestone'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for creating goal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', background: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Create New Financial Goal</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="fin-label">Goal Name</label>
                <input
                  type="text"
                  className="fin-input"
                  placeholder="e.g. 3-Month Emergency Fund, Laptop Upgrade"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="fin-label">Target Amount (₹)</label>
                  <input
                    type="number"
                    className="fin-input"
                    placeholder="e.g. 50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="fin-label">Already Saved (₹)</label>
                  <input
                    type="number"
                    className="fin-input"
                    placeholder="e.g. 10000"
                    value={currentSaved}
                    onChange={(e) => setCurrentSaved(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="fin-label">Target Date</label>
                  <input
                    type="date"
                    className="fin-input"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="fin-label">Planned Monthly (₹)</label>
                  <input
                    type="number"
                    className="fin-input"
                    placeholder="e.g. 5000"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-violet">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
