import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  History, 
  TrendingUp, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { analyzeClaim, getClaimHistory } from '../api/client';

export default function ClaimsAuditView() {
  const [claimText, setClaimText] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const loadHistory = async () => {
    try {
      const res = await getClaimHistory();
      setHistory(res);
    } catch (err) {
      console.error('Failed to load claim history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
    const handlePersonaChange = () => loadHistory();
    window.addEventListener('finwise_persona_changed', handlePersonaChange);
    return () => window.removeEventListener('finwise_persona_changed', handlePersonaChange);
  }, []);

  const handleAudit = async (customText = null) => {
    const text = (customText || claimText).trim();
    if (!text || loading) return;

    try {
      setLoading(true);
      setError(null);
      const res = await analyzeClaim(text);
      setResult(res);
      setClaimText(text);
      loadHistory();
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (err) {
      setError(err.message || 'Failed to analyze claim');
    } finally {
      setLoading(false);
    }
  };

  const SAMPLE_CLAIMS = [
    {
      title: "Scam Claim (Astronomical CAGR)",
      text: "Turn ₹10,000 into 1 Crore in 3 years with this secret crypto & penny stock trick! Limited slots!",
    },
    {
      title: "SEBI Violation (Guaranteed 20%/mo)",
      text: "Join our exclusive VIP Telegram channel for 100% guaranteed 20% return every month! Zero risk pakka profit!",
    },
    {
      title: "Realistic Claim (Nifty 50 Index)",
      text: "Invest in Nifty 50 index funds for an expected 12% to 14% annual return over a 10 year horizon.",
    },
  ];

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1240px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--danger-primary)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldAlert size={22} color="var(--danger-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Finfluencer Claim Reality Check & Scam Detector
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Paste any social media post, YouTube video promise, or Telegram stock tip. We extract the parameters, calculate implied CAGR, and expose red flags.
          </p>
        </div>
        <span className="badge badge-crimson" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem' }}>
          <Zap size={13} />
          <span>SEBI Rule Enforcement</span>
        </span>
      </div>

      {/* Input Form & Sample Chips */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label className="fin-label" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
          Enter Social Media Claim / Investment Offer
        </label>
        <textarea
          className="fin-input"
          rows={3}
          placeholder="e.g. 'Turn ₹10,000 into 1 Crore in 3 years with this secret crypto & penny stock trick...'"
          value={claimText}
          onChange={(e) => setClaimText(e.target.value)}
          style={{ resize: 'vertical', width: '100%', fontSize: '0.92rem', lineHeight: '1.55', borderRadius: 'var(--radius-sm)' }}
        />

        {/* Quick Sample Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Test with demo claims:</span>
          {SAMPLE_CLAIMS.map((sc, idx) => (
            <button
              key={idx}
              className="btn btn-outline"
              onClick={() => handleAudit(sc.text)}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              {sc.title}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            className="btn btn-teal"
            onClick={() => handleAudit()}
            disabled={loading || !claimText.trim()}
            style={{ padding: '0.65rem 1.45rem', fontSize: '0.9rem', fontWeight: 700 }}
          >
            <Search size={16} />
            <span>{loading ? 'Auditing Math & Rules...' : 'Audit Claim Reality'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#DC2626', padding: '1rem' }}>
          {error}
        </div>
      )}

      {/* Audit Analysis Results Card */}
      {result && (
        <div
          ref={resultRef}
          className="glass-panel"
          style={{
            padding: '1.75rem',
            border: `1px solid ${result.risk_level === 'extreme' ? '#FCA5A5' : result.risk_level === 'high' ? '#FDE68A' : 'rgba(19, 168, 158, 0.4)'}`,
            background: result.risk_level === 'extreme' ? '#FFF5F5' : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {/* Header & Risk Level Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                AUDIT VERDICT
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                {result.verdict}
              </h3>
            </div>
            <span
              className={`badge ${
                result.risk_level === 'extreme'
                  ? 'badge-crimson'
                  : result.risk_level === 'high'
                  ? 'badge-amber'
                  : 'badge-teal'
              }`}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.95rem', fontWeight: 800, letterSpacing: '0.04em' }}
            >
              {result.risk_level.toUpperCase()} RISK LEVEL
            </span>
          </div>

          {/* Metric KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.1rem', background: '#FFFFFF' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>IMPLIED ANNUAL CAGR</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: result.annualized_cagr_pct > 30 ? '#DC2626' : 'var(--teal-primary)', marginTop: '0.25rem' }}>
                {result.annualized_cagr_pct}% p.a.
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Timeframe: {result.timeframe_years} Year(s)</span>
            </div>

            <div className="glass-card" style={{ padding: '1.1rem', background: '#FFFFFF' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>DOUBLING TIME (RULE OF 72)</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#B45309', marginTop: '0.25rem' }}>
                {result.doubling_time_years ? `${result.doubling_time_years} Years` : 'Instant / High Risk'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Time required to 2x money</span>
            </div>

            <div className="glass-card" style={{ padding: '1.1rem', background: '#FFFFFF' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>RETURN GUARANTEE</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: result.is_guaranteed ? '#DC2626' : 'var(--teal-primary)', marginTop: '0.4rem' }}>
                {result.is_guaranteed ? '⚠️ Guaranteed (Illegal)' : '✓ Market-Linked'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SEBI allows guarantees only on FDs</span>
            </div>
          </div>

          {/* Detected Red Flags */}
          {result.red_flags && result.red_flags.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#DC2626', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={17} />
                <span>Detected Red Flags ({result.red_flags.length})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.red_flags.map((rf, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#DC2626', fontSize: '0.86rem' }}>{rf.title}</span>
                      <span className="badge badge-crimson" style={{ fontSize: '0.65rem' }}>{rf.severity}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#7F1D1D', marginTop: '0.35rem', lineHeight: '1.45', margin: '0.35rem 0 0 0' }}>{rf.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmark Multiples Comparison Table */}
          {result.benchmarks && result.benchmarks.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={16} color="var(--teal-primary)" />
                <span>Benchmark Multiples Comparison</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {result.benchmarks.map((bm, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '0.9rem', background: '#F8FAFC' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 600 }}>
                      {bm.benchmark_name.replace('_', ' ')} ({bm.benchmark_cagr_pct}%)
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                      {bm.multiplier_vs_benchmark}x
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>vs real-world standard asset rate</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History of Previous Audits */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <History size={18} color="var(--text-muted)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Previous Claim Checks ({history.length})</h3>
        </div>

        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No previous claims audited yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.map((h) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, margin: 0 }}>"{h.claim_text}"</p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
                <span className={`badge ${h.risk_level === 'extreme' ? 'badge-crimson' : h.risk_level === 'high' ? 'badge-amber' : 'badge-teal'}`}>
                  {h.risk_level.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
