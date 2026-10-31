import React from 'react';

/**
 * SectionArtifacts: Premium high-end fintech graphic artifacts
 * Provides visible geometric engineering grid, glowing market wave contours,
 * luminous aurora mesh gradients, floating telemetry pills, and radar watermarks.
 */
export default function SectionArtifacts({ 
  variant = 'problem', // 'problem', 'coach', 'connected', 'tradeoff', 'claim', 'clarity'
  glowPosition = 'both'
}) {
  return (
    <div 
      className="cs-section-artifacts"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* 1. Precision Engineering Blueprint Grid (Lines + Dots) */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(109, 74, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(109, 74, 255, 0.05) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(109, 74, 255, 0.22) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '48px 48px, 48px 48px, 24px 24px',
          backgroundPosition: 'center',
          opacity: 0.95,
          maskImage: 'radial-gradient(ellipse 95% 85% at 50% 50%, #000 65%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 50%, #000 65%, transparent 100%)',
        }} 
      />

      {/* 2. Luminous Financial Market Wave Contour (Flowing SVG) */}
      <svg
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '0',
          width: '100%',
          height: '220px',
          opacity: 0.45,
        }}
        viewBox="0 0 1440 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6D4AFF" stopOpacity="0.1" />
            <stop offset="35%" stopColor="#6D4AFF" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#0F9F9A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="waveAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6D4AFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#6D4AFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill Area below wave */}
        <path
          d="M0,130 C240,190 440,70 720,110 C1000,150 1200,40 1440,90 L1440,220 L0,220 Z"
          fill="url(#waveAreaGrad)"
        />
        {/* Glow Shadow Stroke */}
        <path
          d="M0,130 C240,190 440,70 720,110 C1000,150 1200,40 1440,90"
          stroke="url(#waveGrad1)"
          strokeWidth="3.5"
          filter="drop-shadow(0 0 8px rgba(109, 74, 255, 0.4))"
        />
        {/* Faint Dashed Secondary Wave */}
        <path
          d="M0,160 C260,80 500,180 760,130 C1020,80 1260,170 1440,120"
          stroke="rgba(15, 159, 154, 0.28)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
      </svg>

      {/* 3. Ambient Aurora Glow - Top Right */}
      {(glowPosition === 'top-right' || glowPosition === 'both') && (
        <div 
          style={{
            position: 'absolute',
            top: '-12%',
            right: '-10%',
            width: '720px',
            height: '720px',
            borderRadius: '50%',
            background: variant === 'connected' 
              ? 'radial-gradient(circle, rgba(15, 159, 154, 0.22) 0%, rgba(15, 159, 154, 0.06) 45%, transparent 70%)'
              : variant === 'tradeoff'
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(109, 74, 255, 0.22) 0%, rgba(109, 74, 255, 0.06) 45%, transparent 70%)',
            filter: 'blur(65px)',
          }} 
        />
      )}

      {/* 4. Ambient Aurora Glow - Bottom Left */}
      {(glowPosition === 'bottom-left' || glowPosition === 'both') && (
        <div 
          style={{
            position: 'absolute',
            bottom: '-14%',
            left: '-10%',
            width: '680px',
            height: '680px',
            borderRadius: '50%',
            background: variant === 'claim'
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.16) 0%, rgba(239, 68, 68, 0.04) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(15, 159, 154, 0.18) 0%, rgba(15, 159, 154, 0.05) 45%, transparent 70%)',
            filter: 'blur(65px)',
          }} 
        />
      )}

      {/* 5. Floating Glassmorphic Telemetry Chips (Visible in gutters) */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '3%',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(109, 74, 255, 0.25)',
          boxShadow: '0 8px 20px -4px rgba(109, 74, 255, 0.15)',
          padding: '0.35rem 0.8rem',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.72rem',
          fontWeight: 750,
          color: '#6D4AFF',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
        DETERMINISTIC MATH ENGINE // LIVE
      </div>

      <div
        style={{
          position: 'absolute',
          top: '80px',
          right: '3%',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(15, 159, 154, 0.25)',
          boxShadow: '0 8px 20px -4px rgba(15, 159, 154, 0.15)',
          padding: '0.35rem 0.8rem',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.72rem',
          fontWeight: 750,
          color: '#0F9F9A',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6D4AFF', boxShadow: '0 0 6px #6D4AFF' }} />
        SEBI COMPLIANCE GUARDRAIL ACTIVE
      </div>

      {/* 6. High-Tech Concentric Radar Node (Top Right) */}
      <svg
        style={{
          position: 'absolute',
          right: '1%',
          top: '5%',
          width: '480px',
          height: '480px',
          opacity: 0.85,
        }}
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="190" stroke="rgba(109, 74, 255, 0.25)" strokeWidth="1.5" strokeDasharray="8 8" />
        <circle cx="200" cy="200" r="140" stroke="rgba(15, 159, 154, 0.35)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="90" stroke="rgba(109, 74, 255, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="200" cy="200" r="40" fill="rgba(109, 74, 255, 0.08)" stroke="rgba(109, 74, 255, 0.5)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="5" fill="#6D4AFF" />
        {/* Radar crosshairs with degree labels */}
        <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(109, 74, 255, 0.22)" strokeWidth="1" />
        <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(109, 74, 255, 0.22)" strokeWidth="1" />
        <circle cx="340" cy="200" r="5" fill="#0F9F9A" />
        <circle cx="200" cy="60" r="5" fill="#6D4AFF" />
        <circle cx="200" cy="340" r="5" fill="#F59E0B" />
        <circle cx="60" cy="200" r="5" fill="#0F9F9A" />
      </svg>

      {/* 7. Bottom Left Geometric Calibration Target */}
      <svg
        style={{
          position: 'absolute',
          left: '1%',
          bottom: '6%',
          width: '260px',
          height: '260px',
          opacity: 0.8,
        }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <rect x="25" y="25" width="150" height="150" rx="24" stroke="rgba(109, 74, 255, 0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
        <circle cx="100" cy="100" r="52" stroke="rgba(15, 159, 154, 0.4)" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="10" fill="rgba(109, 74, 255, 0.2)" stroke="#6D4AFF" strokeWidth="1.5" />
        <path d="M80 100 H120 M100 80 V120" stroke="#6D4AFF" strokeWidth="2" />
      </svg>

      {/* 8. Precision Corner Crosshairs */}
      <div style={{ position: 'absolute', top: '24px', left: '32px', color: '#6D4AFF', fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
        +
      </div>
      <div style={{ position: 'absolute', top: '24px', right: '32px', color: '#6D4AFF', fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
        +
      </div>
      <div style={{ position: 'absolute', bottom: '24px', left: '32px', color: '#6D4AFF', fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
        +
      </div>
      <div style={{ position: 'absolute', bottom: '24px', right: '32px', color: '#6D4AFF', fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
        +
      </div>
    </div>
  );
}
