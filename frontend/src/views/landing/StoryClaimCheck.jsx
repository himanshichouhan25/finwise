import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import SectionArtifacts from './SectionArtifacts';

export default function StoryClaimCheck({ onOpenAuth }) {
  return (
    <section 
      id="claims" 
      style={{ 
        padding: '7rem 0', 
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FEF2F2 35%, #FEE2E2 70%, #F8FAFC 100%)', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      <SectionArtifacts variant="claim" glowPosition="both" />
      <div className="cs-container" style={{ position: 'relative', zIndex: 1 }}>
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
            background: '#FFFFFF',
            boxShadow: '0 25px 50px -10px rgba(239, 68, 68, 0.15), 0 4px 16px rgba(0, 0, 0, 0.04)',
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
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', padding: '1.25rem', border: '1.5px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Stage 3 • SEBI Verdict & Flags
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--cs-text-primary)', marginBottom: '0.5rem' }}>
                High Scam Probability
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', color: '#991B1B' }}>
                <div>🚩 Exceeds Warren Buffett / Nifty 50 CAGR by 40x</div>
                <div>🚩 Unregulated advice without SEBI registration</div>
              </div>
            </div>

          </div>

          {/* Action CTA */}
          <div style={{ textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--cs-border-light)' }}>
            <button
              type="button"
              onClick={() => onOpenAuth?.('register')}
              className="cs-btn cs-btn-secondary"
            >
              Verify Any Questionable Financial Tip <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
