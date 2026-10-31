import React, { useState } from 'react';
import './landing/landing.css';
import './landing/cinematic-story.css';

import LandingNavbar from './landing/LandingNavbar';
import CinematicHero from './landing/CinematicHero';
import StoryProblem from './landing/StoryProblem';
import StoryCoach from './landing/StoryCoach';
import StoryConnected from './landing/StoryConnected';
import StoryTradeOff from './landing/StoryTradeOff';
import StoryClaimCheck from './landing/StoryClaimCheck';
import StoryClarity from './landing/StoryClarity';
import CinematicFinalCta from './landing/CinematicFinalCta';
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
      handleOpenAuth('login');
    }
  };

  return (
    <div className="cinematic-landing">
      {/* Floating Minimal Glass Navigation */}
      <LandingNavbar
        onOpenAuth={handleOpenAuth}
        onExploreDemo={onExploreDemo}
      />

      {/* Hero: "Your money has a future." with 3D Luminous Financial Artifact */}
      <CinematicHero
        onOpenAuth={handleOpenAuth}
        onExploreDemo={onExploreDemo}
      />

      {/* Section 1 — The Problem: "Your money is moving. Is it moving you forward?" */}
      <StoryProblem />

      {/* Section 2 — Meet Your Financial Coach: "Meet the coach that helps you think before you spend." */}
      <StoryCoach
        onOpenAuth={handleOpenAuth}
      />

      {/* Section 3 — Your Financial Life, Connected: Asymmetrical Implemented Feature Showcase */}
      <StoryConnected />

      {/* Section 4 — Understand the Trade-Off: Interactive Goal-Days Delayed What-If Visualizer */}
      <StoryTradeOff
        onOpenAuth={handleOpenAuth}
      />

      {/* Section 5 — Question the Claim: "Not every financial claim deserves your trust." */}
      <StoryClaimCheck
        onOpenAuth={handleOpenAuth}
      />

      {/* Section 6 — From Confusion to Clarity: "Less financial noise. More intentional decisions." */}
      <StoryClarity
        onOpenAuth={handleOpenAuth}
      />

      {/* Final Call to Action: "Your next financial decision can be smarter." */}
      <CinematicFinalCta
        onOpenAuth={handleOpenAuth}
        onExploreDemo={onExploreDemo}
        on1ClickDemo={handle1ClickDemo}
      />

      {/* Minimal Footer with Educational Disclaimer & SEBI Notices */}
      <LandingFooter />

      {/* Light-Theme Authentication Dialog */}
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
