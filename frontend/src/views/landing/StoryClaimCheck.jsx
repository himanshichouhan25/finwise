import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function StoryClaimCheck({ onOpenAuth }) {
  return (
    <section id="claims" style={{ padding: '7rem 0', background: 'var(--cs-bg-soft)', position: 'relative' }}>
      <div className="cs-container">
        {/* Section Header */}
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="cs-eyebrow cs-eyebrow-dark" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', borderColor: 'rgba(220, 38, 38, 0.25)' }}>
            <ShieldAlert size={14} color="#DC2626" /> Viral Social Media Scam Shield
          </div>
          <h2 className="cs-headline-editorial" style={{ marginBottom: '1.25rem' }}>
            Not every financial claim <br />
            <span style={{ color: '#DC2626' }}>deserves your trust.</span>
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6 }}>
            Young Indian earners lose billions every year to unregulated Telegram channels and YouTube stock tips.
            FinWise AI strips away the hype, computes the implied compound math, and exposes statistical red flags.
          </p>
        </div>

        {/* 3-Step Claim Audit Workflow Visual Card */}
        <div
          className="cs-editorial-card"
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '2.5rem',
            borderRadius: '28px',
          }}
        >
          {/* Step Sequence Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            {/* Step 1: Input */}
            <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--cs-border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cs-text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Stage 1 • Claim Submission
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '0.5rem' }}>
                Viral Video / Telegram Tip
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--cs-text-secondary)', fontStyle: 'italic', border: '1px solid var(--cs-border-light)' }}>
                "Turn ₹10,000 into ₹1 Crore in 3 years with this secret algorithmic penny stock trick!"
              </div>
            </div>

            {/* Step 2: Math Engine */}
            <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--cs-border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cs-violet)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Stage 2 • Mathematical Reality Check
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '0.5rem' }}>
                Implied Compound Return
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--cs-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--cs-text-muted)' }}>Implied Annual CAGR</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626' }}>900.0% / yr</span>
              </div>
            </div>

            {/* Step 3: Verdict */}
            <div style={{ background: 'rgba(254, 242, 242, 0.7)', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Stage 3 • Scam Exposure
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#DC2626', marginBottom: '0.5rem' }}>
                High Risk Scam Flagged
              </div>
              <div style={{ fontSize: '0.78rem', color: '#991B1B', lineHeight: 1.45 }}>
                Exceeds Warren Buffett's 50-year record by 45x. Characteristic of pump-and-dump fraud.
              </div>
            </div>

          </div>

          {/* Historical Benchmark Comparison */}
          <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '18px', padding: '1.75rem', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--cs-text-primary)', marginBottom: '1rem' }}>
              Historical Benchmark Comparison (Annualized Returns)
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  <span style={{ color: '#DC2626' }}>Social Media Influencer Promise (900.0%)</span>
                  <span style={{ color: '#DC2626' }}>Mathematically Impossible</span>
                </div>
                <div style={{ height: '10px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#DC2626' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--cs-violet)' }}>Warren Buffett Berkshire Track Record (20.0%)</span>
                  <span style={{ color: 'var(--cs-text-muted)' }}>Top Hedge Fund History</span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                  <div style={{ width: '22%', height: '100%', background: 'var(--cs-violet)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--cs-teal)' }}>NIFTY 50 Index 20-Year Average (12.5%)</span>
                  <span style={{ color: 'var(--cs-text-muted)' }}>Indian Market Benchmark</span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                  <div style={{ width: '14%', height: '100%', background: 'var(--cs-teal)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Educational Disclaimer Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--cs-border-light)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--cs-text-muted)', maxWidth: '680px' }}>
              <strong>Educational Disclaimer:</strong> FinWise provides mathematical compound return verification based on the parameters entered.
              It is an educational decision-support tool and does not constitute official SEBI certification or regulatory enforcement.
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth?.('register')}
              className="cs-btn cs-btn-secondary"
              style={{ fontSize: '0.88rem', padding: '0.6rem 1.25rem' }}
            >
              Audit a Claim Free <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
