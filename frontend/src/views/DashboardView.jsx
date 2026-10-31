import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Receipt, 
  PiggyBank, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight,
  Target,
  ArrowUpRight,
  ShieldAlert,
  TrendingUp,
  Clock
} from 'lucide-react';
import { getDashboardData } from '../api/client';

export default function DashboardView({ onNavigateToCoach, onNavigateToTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
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

  if (loading) {
    return (
      <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', background: '#FFFFFF', padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-subtle)' }}>
          <Sparkles size={18} color="var(--violet-primary)" style={{ animation: 'spin 2s linear infinite' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Aggregating real-time financial intelligence...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="glass-card" style={{ borderColor: '#FCA5A5', background: '#FEF2F2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#DC2626' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
          <button className="btn btn-outline" onClick={loadData} style={{ marginTop: '1rem' }}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { budget_summary, health_score, active_goals, pending_journal_reviews_count, coach_starter_prompt } = data;

  // Calculate 50/30/20 proportions
  const netInc = Number(budget_summary.net_income) || 1;
  const needsSpent = Number(budget_summary.needs.actual_amount) || 0;
  const wantsSpent = Number(budget_summary.wants.actual_amount) || 0;
  const savingsSpent = Number(budget_summary.savings.actual_amount) || 0;

  const needsPct = Math.min(100, Math.round((needsSpent / netInc) * 100));
  const wantsPct = Math.min(100, Math.round((wantsSpent / netInc) * 100));
  const savingsPct = Math.min(100, Math.round((savingsSpent / netInc) * 100));

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* 1. Executive Welcome & AI Coach Starter Banner */}
      <div className="glass-panel panel-violet" style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7047FF 0%, #5135CC 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(112, 71, 255, 0.3)',
            flexShrink: 0,
          }}>
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Welcome back, {data.user_name}
              </h2>
              <span className="badge badge-violet" style={{ fontSize: '0.72rem' }}>
                Health Score: {health_score.score}/100
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.3rem', maxWidth: '640px', lineHeight: 1.45 }}>
              {coach_starter_prompt}
            </p>
          </div>
        </div>
        <button
          className="btn btn-violet"
          onClick={() => onNavigateToCoach(coach_starter_prompt)}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
        >
          <span>Ask AI Coach</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 2. Primary KPI Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Monthly Net Income */}
        <div className="glass-card glass-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
              MONTHLY NET INCOME
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--violet-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={17} color="var(--violet-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.65rem', letterSpacing: '-0.02em' }}>
            ₹{Number(budget_summary.net_income).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Active Cycle:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{budget_summary.month}</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card glass-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
              TOTAL EXPENSES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={17} color="#E11D48" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.65rem', letterSpacing: '-0.02em' }}>
            ₹{Number(budget_summary.total_expenses).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Needs: ₹{Number(budget_summary.needs.actual_amount).toLocaleString('en-IN')} • Wants: ₹{Number(budget_summary.wants.actual_amount).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Net Monthly Savings */}
        <div className="glass-card glass-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
              NET SAVINGS SURPLUS
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank size={17} color="var(--teal-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--teal-primary)', marginTop: '0.65rem', letterSpacing: '-0.02em' }}>
            ₹{Number(budget_summary.net_savings).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Savings Rate: <strong style={{ color: 'var(--teal-primary)' }}>{budget_summary.savings.percent_of_income}%</strong> of income
          </div>
        </div>

        {/* Health Score */}
        <div
          className="glass-card glass-card-hover"
          onClick={() => onNavigateToTab('health')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
              FINANCIAL HEALTH
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={17} color="#D97706" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.65rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {health_score.score}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
            <span className="badge badge-amber" style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>
              Grade {health_score.grade}
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Condition: <strong style={{ color: 'var(--text-main)' }}>{health_score.band}</strong>
          </div>
        </div>
      </div>

      {/* 3. 50/30/20 Budget Adherence Visualizer */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              50/30/20 Budget Breakdown
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Deterministic evaluation against benchmark Indian budgeting standards
            </p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => onNavigateToTab('budget')}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <span>Manage Budget</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Stacked Ratio Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: '#E5E7EB', gap: '2px' }}>
            <div style={{ width: `${Math.min(100, needsPct)}%`, background: '#3B82F6', transition: 'width 0.4s ease' }} title={`Needs: ${needsPct}%`} />
            <div style={{ width: `${Math.min(100, wantsPct)}%`, background: '#F59E0B', transition: 'width 0.4s ease' }} title={`Wants: ${wantsPct}%`} />
            <div style={{ width: `${Math.min(100, savingsPct)}%`, background: '#13A89E', transition: 'width 0.4s ease' }} title={`Savings: ${savingsPct}%`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
              Needs: {budget_summary.needs.percent_of_income}% (Target: 50%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
              Wants: {budget_summary.wants.percent_of_income}% (Target: 30%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#13A89E' }} />
              Savings: {budget_summary.savings.percent_of_income}% (Target: 20%)
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Needs */}
          <div className="glass-card" style={{ background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>Essential Needs (50%)</span>
              <span className={`badge ${budget_summary.needs.status === 'within_budget' ? 'badge-teal' : 'badge-crimson'}`} style={{ fontSize: '0.68rem' }}>
                {budget_summary.needs.status === 'within_budget' ? 'Within Budget' : 'Exceeded'}
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{Number(budget_summary.needs.actual_amount).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Housing, food, utilities, health
            </span>
          </div>

          {/* Wants */}
          <div className="glass-card" style={{ background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>Discretionary Wants (30%)</span>
              <span className={`badge ${budget_summary.wants.status === 'within_budget' ? 'badge-teal' : 'badge-crimson'}`} style={{ fontSize: '0.68rem' }}>
                {budget_summary.wants.status === 'within_budget' ? 'Under Control' : 'Over Budget'}
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{Number(budget_summary.wants.actual_amount).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Dining, subscriptions, gadgets
            </span>
          </div>

          {/* Savings */}
          <div className="glass-card" style={{ background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>Savings & SIPs (20%)</span>
              <span className={`badge ${Number(budget_summary.savings.percent_of_income) >= 20 ? 'badge-teal' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>
                {Number(budget_summary.savings.percent_of_income) >= 20 ? 'Target Met' : 'Under Target'}
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--teal-primary)' }}>
              ₹{Number(budget_summary.savings.actual_amount).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Emergency fund, equity investments
            </span>
          </div>
        </div>
      </div>

      {/* 4. Active Goals & Immediate Shortcuts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Active Financial Goals Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Active Goals ({active_goals.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target milestones & contribution tracking</p>
            </div>
            <button className="btn btn-outline" onClick={() => onNavigateToTab('goals')} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              View All
            </button>
          </div>

          {active_goals.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: '#F8FAFC', borderRadius: 'var(--radius-sm)' }}>
              <Target size={24} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.88rem', margin: 0 }}>No active goals configured yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {active_goals.slice(0, 3).map((g) => {
                const progressPct = g.target_amount > 0 ? (Number(g.current_saved) / Number(g.target_amount)) * 100 : 0;
                return (
                  <div key={g.id} className="glass-card" style={{ background: '#FAFBFD', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={16} color="var(--teal-primary)" />
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>{g.name}</span>
                      </div>
                      <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{progressPct.toFixed(0)}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Saved: ₹{Number(g.current_saved).toLocaleString('en-IN')}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Target: ₹{Number(g.target_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ background: '#E2E8F0', height: '6px', borderRadius: '3px', marginTop: '0.45rem', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--teal-primary)', height: '100%', width: `${Math.min(100, progressPct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Intelligence Shortcuts */}
        <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Quick Action Calculators
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Run deterministic engines before spending</p>
          </div>

          <div
            onClick={() => onNavigateToTab('sip')}
            className="glass-card glass-card-hover"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-subtle)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="var(--teal-primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>SIP Wealth Simulator</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Model compounding with inflation discounts</div>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          <div
            onClick={() => onNavigateToTab('claims')}
            className="glass-card glass-card-hover"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-subtle)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={18} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Finfluencer Scam Detector</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Audit social media tips & implied CAGR</div>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          <div
            onClick={() => onNavigateToTab('journal')}
            className="glass-card glass-card-hover"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-subtle)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--violet-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="var(--violet-primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Impulse Decision Journal</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>24-hour cooling-off lock for purchases</div>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      {/* 5. Cooling-off Notification Alert */}
      {pending_journal_reviews_count > 0 && (
        <div className="glass-card" style={{
          border: '1px solid #FDE68A',
          background: '#FFFBEB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertTriangle size={20} color="#D97706" />
            <div>
              <span style={{ fontWeight: 700, color: '#B45309', fontSize: '0.9rem' }}>
                {pending_journal_reviews_count} Impulse Decision(s) Under Cooling-Off Timer
              </span>
              <p style={{ fontSize: '0.8rem', color: '#92400E', margin: '0.15rem 0 0 0' }}>
                Your timer protects you from rash spending. Check if the purchase still aligns with your goals.
              </p>
            </div>
          </div>
          <button className="btn btn-gold" onClick={() => onNavigateToTab('journal')} style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
            Review Decision Journal
          </button>
        </div>
      )}
    </div>
  );
}
