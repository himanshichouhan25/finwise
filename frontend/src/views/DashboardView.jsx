import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Receipt, 
  PiggyBank, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight,
  Target
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
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
        <p>Loading real-time financial intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#F87171' }}>
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

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px' }}>
      {/* Welcome & AI Starter Prompt Banner */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
        border: '1px solid rgba(20, 184, 166, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(20, 184, 166, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={22} color="#2DD4BF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
              Financial Snapshot for {data.user_name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              {coach_starter_prompt}
            </p>
          </div>
        </div>
        <button
          className="btn btn-teal"
          onClick={() => onNavigateToCoach(coach_starter_prompt)}
        >
          <span>Ask AI Coach</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        {/* Monthly Income */}
        <div className="glass-card glass-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>MONTHLY NET INCOME</span>
            <Wallet size={18} color="#14B8A6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            ₹{Number(budget_summary.net_income).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
            Active Month: {budget_summary.month}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card glass-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>TOTAL EXPENSES</span>
            <Receipt size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            ₹{Number(budget_summary.total_expenses).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
            Needs: ₹{Number(budget_summary.needs.actual_amount).toLocaleString('en-IN')} | Wants: ₹{Number(budget_summary.wants.actual_amount).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Net Savings */}
        <div className="glass-card glass-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>MONTHLY SAVINGS</span>
            <PiggyBank size={18} color="#2DD4BF" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2DD4BF', marginTop: '0.5rem' }}>
            ₹{Number(budget_summary.net_savings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
            Savings Rate: {budget_summary.savings.percent_of_income}% of income
          </div>
        </div>

        {/* Health Score */}
        <div className="glass-card glass-card-hover" onClick={() => onNavigateToTab('health')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>HEALTH SCORE</span>
            <Activity size={18} color="#D4AF37" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B' }}>
              {health_score.score}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>/ 100</span>
            <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>
              Grade {health_score.grade}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
            Status: {health_score.band}
          </div>
        </div>
      </div>

      {/* 50/30/20 Budget Allocation Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
              50/30/20 Budget Adherence
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Deterministic breakdown against recommended Indian budgeting benchmarks
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => onNavigateToTab('budget')} style={{ fontSize: '0.8rem' }}>
            Manage Budget & Expenses
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Needs */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>Needs (50% Target)</span>
              <span className={`badge ${budget_summary.needs.status === 'within_budget' ? 'badge-teal' : 'badge-crimson'}`}>
                {budget_summary.needs.status === 'within_budget' ? 'Within Budget' : 'Exceeded'}
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
              ₹{Number(budget_summary.needs.actual_amount).toLocaleString('en-IN')}
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 400, marginLeft: '0.5rem' }}>
                ({budget_summary.needs.percent_of_income}% of income)
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{
                background: budget_summary.needs.status === 'within_budget' ? '#14B8A6' : '#EF4444',
                height: '100%',
                width: `${Math.min(100, Number(budget_summary.needs.percent_of_income))}%`
              }} />
            </div>
          </div>

          {/* Wants */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>Wants (30% Target)</span>
              <span className={`badge ${budget_summary.wants.status === 'within_budget' ? 'badge-teal' : 'badge-crimson'}`}>
                {budget_summary.wants.status === 'within_budget' ? 'Under Control' : 'Over Budget'}
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
              ₹{Number(budget_summary.wants.actual_amount).toLocaleString('en-IN')}
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 400, marginLeft: '0.5rem' }}>
                ({budget_summary.wants.percent_of_income}% of income)
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{
                background: budget_summary.wants.status === 'within_budget' ? '#F59E0B' : '#EF4444',
                height: '100%',
                width: `${Math.min(100, Number(budget_summary.wants.percent_of_income))}%`
              }} />
            </div>
          </div>

          {/* Savings */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>Savings & SIPs (20% Target)</span>
              <span className={`badge ${budget_summary.savings.status === 'within_budget' ? 'badge-teal' : 'badge-amber'}`}>
                {Number(budget_summary.savings.percent_of_income) >= 20 ? 'Target Met' : 'Under Target'}
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2DD4BF' }}>
              ₹{Number(budget_summary.savings.actual_amount).toLocaleString('en-IN')}
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 400, marginLeft: '0.5rem' }}>
                ({budget_summary.savings.percent_of_income}% of income)
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{
                background: '#14B8A6',
                height: '100%',
                width: `${Math.min(100, Number(budget_summary.savings.percent_of_income) * 5)}%`
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Financial Goals Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
              Active Financial Goals ({active_goals.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Target milestones and planned monthly savings
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => onNavigateToTab('goals')} style={{ fontSize: '0.8rem' }}>
            View All Goals
          </button>
        </div>

        {active_goals.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No active goals configured yet. Set one up to plan your future!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {active_goals.map((g) => {
              const progressPct = g.target_amount > 0 ? (Number(g.current_saved) / Number(g.target_amount)) * 100 : 0;
              return (
                <div key={g.id} className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={16} color="#14B8A6" />
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{g.name}</span>
                    </div>
                    <span className="badge badge-teal">{progressPct.toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94A3B8' }}>Saved: ₹{Number(g.current_saved).toLocaleString('en-IN')}</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>Target: ₹{Number(g.target_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ background: '#14B8A6', height: '100%', width: `${Math.min(100, progressPct)}%` }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Deadline: {g.target_date || 'Ongoing'}</span>
                    <span>Plan: ₹{Number(g.planned_monthly_contribution || 0).toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Impulse Decision Journal Alert if pending */}
      {pending_journal_reviews_count > 0 && (
        <div className="glass-card" style={{
          border: '1px solid rgba(245, 158, 11, 0.4)',
          background: 'rgba(245, 158, 11, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="#F59E0B" />
            <div>
              <span style={{ fontWeight: 600, color: '#FBBF24' }}>
                {pending_journal_reviews_count} Impulse Decision(s) Under Cooling-Off Review
              </span>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Check if your cooling-off period has passed before making that impulsive purchase.
              </p>
            </div>
          </div>
          <button className="btn btn-gold" onClick={() => onNavigateToTab('journal')} style={{ fontSize: '0.8rem' }}>
            Review Journal
          </button>
        </div>
      )}
    </div>
  );
}
