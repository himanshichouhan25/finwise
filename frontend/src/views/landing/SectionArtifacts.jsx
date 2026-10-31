import React from 'react';

/**
 * SectionArtifacts: Premium, clearly visible fintech background artifacts
 * Provides visible geometric engineering grid, luminous aurora mesh gradients,
 * high-tech watermark diagrams, and crosshairs that break the "solid white" flatness.
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
      {/* 1. Visible Engineering Blueprint Grid (Lines + Dots) */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(109, 74, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(109, 74, 255, 0.06) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(109, 74, 255, 0.18) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '48px 48px, 48px 48px, 24px 24px',
          backgroundPosition: 'center',
          opacity: 0.9,
          maskImage: 'radial-gradient(ellipse 95% 85% at 50% 50%, #000 65%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 50%, #000 65%, transparent 100%)',
        }} 
      />

      {/* 2. Vibrant Ambient Aurora Mesh Glow - Top Right */}
      {(glowPosition === 'top-right' || glowPosition === 'both') && (
        <div 
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-8%',
            width: '680px',
            height: '680px',
            borderRadius: '50%',
            background: variant === 'connected' 
              ? 'radial-gradient(circle, rgba(15, 159, 154, 0.18) 0%, rgba(15, 159, 154, 0.05) 45%, transparent 70%)'
              : variant === 'tradeoff'
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.04) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(109, 74, 255, 0.18) 0%, rgba(109, 74, 255, 0.05) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }} 
        />
      )}

      {/* 3. Vibrant Ambient Aurora Glow - Bottom Left */}
      {(glowPosition === 'bottom-left' || glowPosition === 'both') && (
        <div 
          style={{
            position: 'absolute',
            bottom: '-12%',
            left: '-8%',
            width: '640px',
            height: '640px',
            borderRadius: '50%',
            background: variant === 'claim'
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.14) 0%, rgba(239, 68, 68, 0.03) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(15, 159, 154, 0.16) 0%, rgba(15, 159, 154, 0.04) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }} 
        />
      )}

      {/* Center Subtle Violet Glow for Visual Depth */}
      <div 
        style={{
          position: 'absolute',
          top: '35%',
          left: '30%',
          width: '500px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109, 74, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* 4. Clearly Visible Architectural Watermark SVGs */}
      {variant === 'problem' && (
        <>
          {/* Concentric Financial Orbit Rings (Top Right) */}
          <svg
            style={{
              position: 'absolute',
              right: '2%',
              top: '6%',
              width: '460px',
              height: '460px',
              opacity: 0.75,
            }}
            viewBox="0 0 400 400"
            fill="none"
          >
            <circle cx="200" cy="200" r="185" stroke="rgba(109, 74, 255, 0.25)" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="200" cy="200" r="135" stroke="rgba(15, 159, 154, 0.3)" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="85" stroke="rgba(109, 74, 255, 0.35)" strokeWidth="1.5" strokeDasharray="3 4" />
            <circle cx="200" cy="200" r="35" fill="rgba(109, 74, 255, 0.06)" stroke="rgba(109, 74, 255, 0.4)" strokeWidth="1.5" />
            {/* Axis Lines with tick marks */}
            <line x1="200" y1="5" x2="200" y2="395" stroke="rgba(109, 74, 255, 0.18)" strokeWidth="1" />
            <line x1="5" y1="200" x2="395" y2="200" stroke="rgba(109, 74, 255, 0.18)" strokeWidth="1" />
            {/* Floating Satellite Nodes */}
            <circle cx="335" cy="200" r="5" fill="#6D4AFF" />
            <circle cx="200" cy="65" r="5" fill="#0F9F9A" />
            <circle cx="115" cy="200" r="4" fill="#6D4AFF" />
          </svg>

          {/* Left Geometric Calibration Target */}
          <svg
            style={{
              position: 'absolute',
              left: '1%',
              bottom: '8%',
              width: '240px',
              height: '240px',
              opacity: 0.7,
            }}
            viewBox="0 0 200 200"
            fill="none"
          >
            <rect x="25" y="25" width="150" height="150" rx="20" stroke="rgba(109, 74, 255, 0.22)" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="48" stroke="rgba(15, 159, 154, 0.35)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="8" fill="rgba(109, 74, 255, 0.25)" />
            <path d="M85 100 H115 M100 85 V115" stroke="rgba(109, 74, 255, 0.5)" strokeWidth="2" />
          </svg>
        </>
      )}

      {variant === 'coach' && (
        <svg
          style={{
            position: 'absolute',
            left: '2%',
            top: '12%',
            width: '400px',
            height: '400px',
            opacity: 0.7,
          }}
          viewBox="0 0 300 300"
          fill="none"
        >
          <circle cx="150" cy="150" r="130" stroke="rgba(109, 74, 255, 0.22)" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="150" cy="150" r="75" stroke="rgba(109, 74, 255, 0.3)" strokeWidth="1.5" />
          <path d="M80 150 L150 80 L220 150 L150 220 Z" stroke="rgba(15, 159, 154, 0.35)" strokeWidth="1.5" />
          <circle cx="150" cy="80" r="6" fill="#6D4AFF" />
          <circle cx="220" cy="150" r="6" fill="#0F9F9A" />
          <circle cx="150" cy="220" r="6" fill="#6D4AFF" />
          <circle cx="80" cy="150" r="6" fill="#0F9F9A" />
        </svg>
      )}

      {variant === 'connected' && (
        <svg
          style={{
            position: 'absolute',
            right: '3%',
            bottom: '8%',
            width: '440px',
            height: '440px',
            opacity: 0.7,
          }}
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle cx="200" cy="200" r="170" stroke="rgba(15, 159, 154, 0.25)" strokeWidth="1.5" strokeDasharray="5 5" />
          <circle cx="200" cy="200" r="110" stroke="rgba(109, 74, 255, 0.3)" strokeWidth="1.5" />
          <line x1="40" y1="200" x2="360" y2="200" stroke="rgba(15, 159, 154, 0.2)" strokeWidth="1.5" />
          <line x1="200" y1="40" x2="200" y2="360" stroke="rgba(15, 159, 154, 0.2)" strokeWidth="1.5" />
          <circle cx="200" cy="30" r="7" fill="#0F9F9A" />
          <circle cx="370" cy="200" r="7" fill="#6D4AFF" />
          <circle cx="200" cy="370" r="7" fill="#0F9F9A" />
          <circle cx="30" cy="200" r="7" fill="#6D4AFF" />
        </svg>
      )}

      {variant === 'tradeoff' && (
        <svg
          style={{
            position: 'absolute',
            left: '3%',
            top: '10%',
            width: '420px',
            height: '420px',
            opacity: 0.7,
          }}
          viewBox="0 0 350 350"
          fill="none"
        >
          <path d="M 40 260 A 160 160 0 0 1 310 140" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="2" strokeDasharray="8 6" />
          <circle cx="310" cy="140" r="9" fill="#F59E0B" />
          <circle cx="40" cy="260" r="7" fill="#6D4AFF" />
          <circle cx="175" cy="175" r="130" stroke="rgba(109, 74, 255, 0.2)" strokeWidth="1.5" />
        </svg>
      )}

      {variant === 'claim' && (
        <svg
          style={{
            position: 'absolute',
            right: '4%',
            top: '12%',
            width: '380px',
            height: '380px',
            opacity: 0.7,
          }}
          viewBox="0 0 300 300"
          fill="none"
        >
          <path d="M150 30 L250 75 V175 C250 240 150 280 150 280 C150 280 50 240 50 175 V75 Z" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" strokeDasharray="5 5" />
          <circle cx="150" cy="155" r="50" stroke="rgba(109, 74, 255, 0.25)" strokeWidth="1.5" />
          <circle cx="150" cy="155" r="8" fill="#EF4444" />
        </svg>
      )}

      {variant === 'clarity' && (
        <svg
          style={{
            position: 'absolute',
            left: '2%',
            bottom: '10%',
            width: '400px',
            height: '400px',
            opacity: 0.7,
          }}
          viewBox="0 0 350 350"
          fill="none"
        >
          <circle cx="175" cy="175" r="150" stroke="rgba(109, 74, 255, 0.25)" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="175" cy="175" r="100" stroke="rgba(15, 159, 154, 0.3)" strokeWidth="1.5" />
          <line x1="25" y1="175" x2="325" y2="175" stroke="rgba(109, 74, 255, 0.18)" strokeWidth="1.5" />
          <line x1="175" y1="25" x2="175" y2="325" stroke="rgba(109, 74, 255, 0.18)" strokeWidth="1.5" />
        </svg>
      )}

      {/* 5. Clearly Visible Precision Corner Crosshairs */}
      <div style={{ position: 'absolute', top: '24px', left: '32px', color: 'rgba(109, 74, 255, 0.45)', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
        +
      </div>
      <div style={{ position: 'absolute', top: '24px', right: '32px', color: 'rgba(109, 74, 255, 0.45)', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
        +
      </div>
      <div style={{ position: 'absolute', bottom: '24px', left: '32px', color: 'rgba(109, 74, 255, 0.45)', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
        +
      </div>
      <div style={{ position: 'absolute', bottom: '24px', right: '32px', color: 'rgba(109, 74, 255, 0.45)', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
        +
      </div>
    </div>
  );
}
