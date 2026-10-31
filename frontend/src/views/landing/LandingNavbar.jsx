import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

export default function LandingNavbar({ onOpenAuth, onExploreDemo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'The Problem', href: '#problem' },
    { label: 'AI Coach', href: '#coach' },
    { label: 'Features', href: '#features' },
    { label: 'Scam Shield', href: '#claims' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.25s ease',
        background: isScrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(248, 250, 252, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${isScrolled ? 'var(--lp-border-subtle)' : 'transparent'}`,
        boxShadow: isScrolled ? '0 4px 20px rgba(16, 24, 40, 0.04)' : 'none',
      }}
    >
      <div className="lp-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
        {/* Brand Logo */}
        <a href="#overview" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--lp-brand-violet) 0%, var(--lp-brand-violet-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(109, 74, 255, 0.35)',
            }}
          >
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--lp-text-primary)', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              FinWise <span style={{ color: 'var(--lp-brand-violet)' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--lp-text-muted)', fontWeight: 600, letterSpacing: '0.01em' }}>
              Intelligent Financial Companion
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="lp-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--lp-text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--lp-brand-violet)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-text-secondary)'; }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="lp-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={() => onExploreDemo?.()}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--lp-text-secondary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem 0.8rem',
              borderRadius: '8px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lp-bg-soft)'; e.currentTarget.style.color = 'var(--lp-text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--lp-text-secondary)'; }}
          >
            Explore as Guest
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth?.('login')}
            className="lp-btn lp-btn-secondary"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth?.('register')}
            className="lp-btn lp-btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
          >
            Get Started <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--lp-text-primary)',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
          className="lp-show-mobile"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--lp-bg-white)',
            borderBottom: '1px solid var(--lp-border-subtle)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--lp-text-primary)',
                textDecoration: 'none',
                padding: '0.35rem 0',
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--lp-border-subtle)' }}>
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onOpenAuth?.('login'); }}
              className="lp-btn lp-btn-secondary"
              style={{ width: '100%' }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onOpenAuth?.('register'); }}
              className="lp-btn lp-btn-primary"
              style={{ width: '100%' }}
            >
              Get Started Free
            </button>
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onExploreDemo?.(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--lp-brand-teal)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                padding: '0.4rem',
              }}
            >
              Explore as Guest (No account needed)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

