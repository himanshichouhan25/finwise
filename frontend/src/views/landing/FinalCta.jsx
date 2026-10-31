import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { PERSONAS } from '../../api/client';

export default function FinalCta({ onOpenAuth, onExploreDemo, on1ClickDemo }) {
  return (
    <section style={{ padding: '6rem 0', background: 'var(--lp-bg-white)', position: 'relative' }}>
      <div className="lp-container">
        <div
          style={{
            background: 'linear-gradient(135deg, #5135CC 0%, #6D4AFF 50%, #0F9F9A 100%)',
            borderRadius: '32px',
            padding: '4.5rem 2.5rem',
            textAlign: 'center',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -10px rgba(109, 74, 255, 0.35)',
          }}
        >
          {/* Subtle background circle */}
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              <Sparkles size={14} /> Ready for financial clarity?
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                color: '#FFFFFF',
              }}
            >
              Start making more intentional money decisions.
            </h2>

            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '2.5rem',
                maxWidth: '600px',
                margin: '0 auto 2.5rem auto',
              }}
            >
              Understand your finances, plan your goals, and build confidence—one verified decision at a time.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <button
                type="button"
                onClick={() => onOpenAuth?.('register')}
                style={{
                  background: '#FFFFFF',
                  color: 'var(--lp-brand-violet-dark)',
                  border: 'none',
                  padding: '0.9rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'; }}
              >
                Explore FinWise AI Free <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => onExploreDemo?.()}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '0.9rem 1.8rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              >
                Instant Guest Mode
              </button>
            </div>

            {/* 1-Click Demo Persona Pills */}
            <div style={{ paddingTop: '1.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '0.85rem' }}>
                ⚡ Or Jump Straight in with Seeded Hackathon Personas:
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => on1ClickDemo?.(p.id)}
                    style={{
                      padding: '0.55rem 0.95rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; e.currentTarget.style.borderColor = '#FFFFFF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
                  >
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                    <span style={{ opacity: 0.8, fontSize: '0.72rem' }}>({p.tier})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
