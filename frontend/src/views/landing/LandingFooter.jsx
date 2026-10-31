import React from 'react';
import { Sparkles } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer style={{ background: '#FFFFFF', borderTop: '1px solid var(--lp-border-subtle)', padding: '4rem 0 2.5rem 0' }}>
      <div className="lp-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Brand Column */}
          <div style={{ maxWidth: '340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--lp-brand-violet) 0%, var(--lp-brand-violet-dark) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} color="#FFFFFF" />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lp-text-primary)' }}>
                FinWise <span style={{ color: 'var(--lp-brand-violet)' }}>AI</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              An intelligent, context-aware financial coaching companion designed specifically for college students,
              gig freelancers, and first-time earners in India.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--lp-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
              Financial Intelligence
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>AI Financial Coach</a></li>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>50/30/20 Budget Engine</a></li>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>Goal-Days Delayed</a></li>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>SIP Wealth Simulator</a></li>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>Debt & Loan Amortization</a></li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--lp-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
              Trust & Verification
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>Finfluencer Scam Detector</a></li>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>SEBI Compliance Guardrails</a></li>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>0–100 Health Diagnostics</a></li>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>Impulse Decision Journal</a></li>
              <li><a href="#features" style={{ color: 'var(--lp-text-muted)', textDecoration: 'none' }}>Deterministic Math Engines</a></li>
            </ul>
          </div>

          {/* Hackathon Attribution */}
          <div>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--lp-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
              Project Information
            </h5>
            <div style={{ fontSize: '0.82rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6 }}>
              <strong>MNIT Jaipur 24-Hour Hackathon</strong><br />
              Domain 3.1 • AI Financial Coach for First-Time Investors<br />
              Built with React, FastAPI, SQLAlchemy & Groq LLaMA 3.3.
            </div>
          </div>

        </div>

        {/* Regulatory & Educational Disclaimer */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            background: 'var(--lp-bg-soft)',
            border: '1px solid var(--lp-border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--lp-text-muted)',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          <strong>Educational Disclaimer:</strong> FinWise AI is an educational financial planning tool.
          Simulations, projections, and AI responses are estimates and do not guarantee future investment returns.
          FinWise AI is not a SEBI-registered investment advisor. Users should verify all financial and market information
          independently before making legal or monetary commitments.
        </div>

        {/* Bottom Credits */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--lp-border-light)', fontSize: '0.78rem', color: 'var(--lp-text-light)' }}>
          <div>
            © 2026 FinWise AI. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Built for young Indian earners</span> • <span>HS256 JWT & bcrypt secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
