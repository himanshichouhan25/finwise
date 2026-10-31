import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, TrendingUp, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { getHealthScore } from '../api/client';

export default function HealthScoreView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadScore = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getHealthScore();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load health score');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScore();
    const handlePersonaChange = () => loadScore();
    window.addEventListener('finwise_persona_changed', handlePersonaChange);
    return () => window.removeEventListener('finwise_persona_changed', handlePersonaChange);
  }, []);

  if (loading) {
    return <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Computing financial health factors...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="glass-card" style={{ color: '#DC2626', background: '#FEF2F2', borderColor: '#FCA5A5' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--violet-primary)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Activity size={22} color="var(--violet-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Comprehensive Financial Health Score (0–100)
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Mathematical score based on savings rate, emergency runway, 50/30/20 budget adherence, and active goal progress.
          </p>
        </div>
        <span className="badge badge-violet" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>Dynamic Rescaling Active</span>
      </div>

      {/* Main Score & Band Showcase */}
      <div className="glass-panel" style={{
        padding: '2.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--violet-soft) 0%, var(--teal-soft) 100%)',
        border: '1px solid rgba(112, 71, 255, 0.2)',
      }}>
        <div style={{
          width: '144px',
          height: '144px',
          borderRadius: '50%',
          border: '6px solid var(--teal-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(19, 168, 158, 0.25)',
          background: '#FFFFFF',
        }}>
          <span style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {data.score}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', marginTop: '0.2rem' }}>OUT OF 100</span>
        </div>

        <div style={{ marginTop: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Grade {data.grade}
          </span>
          <span className="badge badge-teal" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
            {data.band}
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '0.75rem', lineHeight: 1.5 }}>
          Your score reflects your financial balance and resilience. Boost your score further by growing your emergency fund runway or keeping discretionary wants under 30%.
        </p>
      </div>

      {/* Factor by Factor Breakdown */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Five-Factor Health Diagnostics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {data.factors.map((f, idx) => {
            const factorPct = f.max_points > 0 ? (Number(f.points) / Number(f.max_points)) * 100 : 0;
            return (
              <div key={idx} className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.98rem', margin: 0 }}>
                    {f.name}
                  </h4>
                  <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
                    {Number(f.points).toFixed(1)} / {Number(f.max_points).toFixed(1)} pts
                  </span>
                </div>

                <div style={{ background: '#E2E8F0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    background: factorPct >= 70 ? 'var(--teal-primary)' : factorPct >= 40 ? 'var(--gold-primary)' : 'var(--danger-primary)',
                    height: '100%',
                    width: `${factorPct}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {f.explanation}
                </p>

                {f.improvement_tip && (
                  <div style={{
                    marginTop: 'auto',
                    padding: '0.6rem 0.85rem',
                    background: 'var(--teal-soft)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(19, 168, 158, 0.25)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.45rem',
                    fontSize: '0.76rem',
                    color: '#0F766E',
                  }}>
                    <Lightbulb size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Pro Tip:</strong> {f.improvement_tip}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
