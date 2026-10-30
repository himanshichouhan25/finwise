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
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Computing financial health factors...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="glass-card" style={{ color: '#F87171' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Activity size={22} color="#D4AF37" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              Comprehensive Financial Health Score (0–100)
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Pure mathematical score based on savings rate, emergency fund buffer, 50/30/20 budget adherence, and goal progress.
          </p>
        </div>
        <span className="badge badge-amber">Rescaling Engine Active</span>
      </div>

      {/* Main Score & Band Showcase */}
      <div className="glass-panel" style={{
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.15) 0%, rgba(21, 31, 51, 0.7) 70%)',
      }}>
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          border: '6px solid #14B8A6',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 35px rgba(20, 184, 166, 0.35)',
          background: 'rgba(15, 23, 42, 0.8)',
        }}>
          <span style={{ fontSize: '3rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
            {data.score}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>OUT OF 100</span>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
            Grade {data.grade}
          </span>
          <span className="badge badge-teal" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            {data.band}
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#CBD5E1', maxWidth: '600px', marginTop: '0.75rem' }}>
          Your score reflects balanced money management. Boost your score further by increasing your emergency fund buffer or staying within your 30% Wants bucket.
        </p>
      </div>

      {/* Factor by Factor Breakdown */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
          Five-Factor Health Diagnostics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {data.factors.map((f, idx) => {
            const factorPct = f.max_points > 0 ? (Number(f.points) / Number(f.max_points)) * 100 : 0;
            return (
              <div key={idx} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                    {f.name}
                  </h4>
                  <span className="badge badge-teal">
                    {Number(f.points).toFixed(1)} / {Number(f.max_points).toFixed(1)} pts
                  </span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.08)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    background: factorPct >= 70 ? '#14B8A6' : factorPct >= 40 ? '#F59E0B' : '#EF4444',
                    height: '100%',
                    width: `${factorPct}%`
                  }} />
                </div>

                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  {f.explanation}
                </p>

                {f.improvement_tip && (
                  <div style={{
                    marginTop: 'auto',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(20, 184, 166, 0.08)',
                    borderRadius: '6px',
                    border: '1px solid rgba(20, 184, 166, 0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    color: '#2DD4BF',
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
