import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, Clock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
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
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading financial goals...</div>;
  }

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px' }}>
      {/* Top Banner & Action */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
            Goal Setting & Delayed Gratification Engine
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Map target milestones, track real completion progress, and see the exact days delayed by impulsive purchases.
          </p>
        </div>
        <button className="btn btn-teal" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>New Financial Goal</span>
        </button>
      </div>

      {/* Goal-Days Delayed Signature Feature Card */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Clock size={20} color="#F59E0B" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FBBF24' }}>
            Goal-Days Delayed Calculator (Impulse Spend Reality Check)
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
          Before buying sneakers, dining at a fancy café, or shopping online, see how many days of your hard-earned progress this purchase delays.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="fin-label">Impulsive Spend Amount (₹)</label>
            <input
              type="number"
              className="fin-input"
              value={spendAmount}
              onChange={(e) => setSpendAmount(e.target.value)}
              placeholder="e.g. 4500"
            />
          </div>

          <div>
            <label className="fin-label">Compare Against Goal</label>
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
          <div className="glass-card" style={{ marginTop: '1.25rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <span style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: 600, display: 'block' }}>DELAY PENALTY</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F87171' }}>
                  +{delayResult.days_delayed} Days
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>
                  {delayResult.message}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                  Based on daily savings rate of ₹{Number(delayResult.daily_goal_rate).toFixed(2)}/day toward your {delayResult.goal_name || 'goal'}.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Goals Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
          Current Active Milestones ({goals.length})
        </h3>

        {goals.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
            <p>No goals defined yet. Click "New Financial Goal" above to create one.</p>
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
                      <Target size={18} color="#14B8A6" />
                      <h4 style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1rem' }}>{g.name}</h4>
                    </div>
                    <span className="badge badge-teal">{progressPct.toFixed(1)}%</span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#94A3B8' }}>Saved: ₹{Number(g.current_saved).toLocaleString('en-IN')}</span>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Target: ₹{Number(g.target_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ background: '#14B8A6', height: '100%', width: `${Math.min(100, progressPct)}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>REMAINING</span>
                      <span style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.85rem' }}>₹{remaining.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>TARGET DATE</span>
                      <span style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.85rem' }}>{g.target_date || 'Ongoing'}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Plan: ₹{Number(g.planned_monthly_contribution || 0).toLocaleString('en-IN')}/mo</span>
                    <span className="badge badge-slate">{g.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Create Financial Goal
            </h3>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="fin-label">Goal Name</label>
                <input
                  type="text"
                  className="fin-input"
                  placeholder="e.g. 3-Month Emergency Fund, Laptop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                <label className="fin-label">Already Saved (₹, optional)</label>
                <input
                  type="number"
                  className="fin-input"
                  placeholder="e.g. 10000"
                  value={currentSaved}
                  onChange={(e) => setCurrentSaved(e.target.value)}
                />
              </div>
              <div>
                <label className="fin-label">Target Completion Date</label>
                <input
                  type="date"
                  className="fin-input"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="fin-label">Planned Monthly Savings (₹, optional)</label>
                <input
                  type="number"
                  className="fin-input"
                  placeholder="e.g. 5000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-teal">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
