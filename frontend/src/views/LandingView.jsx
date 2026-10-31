import React, { useState } from 'react';
import './landing/landing.css';
import LandingNavbar from './landing/LandingNavbar';
import LandingHero from './landing/LandingHero';
import TrustStrip from './landing/TrustStrip';
import ProblemSection from './landing/ProblemSection';
import SolutionGrid from './landing/SolutionGrid';
import FeatureShowcase from './landing/FeatureShowcase';
import HowItWorks from './landing/HowItWorks';
import ImpactSection from './landing/ImpactSection';
import FinalCta from './landing/FinalCta';
import LandingFooter from './landing/LandingFooter';
import LandingAuthModal from './landing/LandingAuthModal';
import { demoLogin } from '../api/client';

export default function LandingView({ onAuthSuccess, onExploreDemo }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');

  const handleOpenAuth = (mode = 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handle1ClickDemo = async (personaId) => {
    try {
      const res = await demoLogin(personaId);
      if (res?.user) {
        onAuthSuccess?.(res.user);
      }
    } catch (err) {
      console.error('Demo login error:', err);
      // Fallback to opening auth modal if session token creation fails
      handleOpenAuth('login');
    }
  };

  return (
    <div className="finwise-landing">
      {/* 1. Sticky Navigation */}
      <LandingNavbar
        onOpenAuth={handleOpenAuth}
        onExploreDemo={onExploreDemo}
      />

      {/* 2. Striking Light Hero */}
      <LandingHero
        onOpenAuth={handleOpenAuth}
        onExploreDemo={onExploreDemo}
      />

      {/* 3. Trust & Core Value Strip */}
      <TrustStrip />

      {/* 4. Editorial Problem Section */}
      <ProblemSection />

      {/* 5. 9-Module Connected Solution Grid */}
      <SolutionGrid
        onSelectFeature={(_featureId) => handleOpenAuth('register')}
      />

      {/* 6. Feature Deep Dive Showcase */}
      <FeatureShowcase
        onOpenAuth={handleOpenAuth}
      />

      {/* 7. How It Works: 3-Step Journey */}
      <HowItWorks
        onOpenAuth={handleOpenAuth}
      />

      {/* 8. Impact & Differentiation Matrix */}
      <ImpactSection />

      {/* 9. Final CTA with 1-Click Persona Demos */}
      <FinalCta
        onOpenAuth={handleOpenAuth}
        onExploreDemo={onExploreDemo}
        on1ClickDemo={handle1ClickDemo}
      />

      {/* 10. Educational Disclaimer & Footer */}
      <LandingFooter />

      {/* 11. Light-Theme Auth Modal */}
      <LandingAuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setAuthModalOpen(false);
          onAuthSuccess?.(user);
        }}
      />
    </div>
  );
}
