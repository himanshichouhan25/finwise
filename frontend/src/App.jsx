import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './views/DashboardView';
import BudgetView from './views/BudgetView';
import SipSimulatorView from './views/SipSimulatorView';
import GoalsView from './views/GoalsView';
import CoachChatView from './views/CoachChatView';
import ClaimsAuditView from './views/ClaimsAuditView';
import DecisionJournalView from './views/DecisionJournalView';
import HealthScoreView from './views/HealthScoreView';
import MarketView from './views/MarketView';

const TAB_TITLES = {
  dashboard: 'Executive Financial Intelligence',
  market: 'Indian Market Intelligence & Stock Analysis',
  budget: '50/30/20 Budget & Expense Tracking',
  sip: 'Systematic Investment Plan (SIP) Simulator',
  goals: 'Financial Goals & Delayed Gratification',
  coach: 'FinWise AI Financial Coach',
  claims: 'Finfluencer Claim Reality Check & SEBI Audit',
  journal: 'Impulse Decision Journal & 24h Cooling-Off',
  health: 'Financial Health Diagnostics (0–100)',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [coachPrompt, setCoachPrompt] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleNavigateToCoach = (prompt = '') => {
    setCoachPrompt(prompt);
    setCurrentTab('coach');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Dispatch event to refresh active views
    window.dispatchEvent(new CustomEvent('finwise_persona_changed'));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="main-content">
        <TopBar
          title={TAB_TITLES[currentTab] || 'FinWise AI'}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateToCoach={handleNavigateToCoach}
              onNavigateToTab={setCurrentTab}
            />
          )}
          {currentTab === 'market' && <MarketView />}
          {currentTab === 'budget' && <BudgetView />}
          {currentTab === 'sip' && <SipSimulatorView />}
          {currentTab === 'goals' && <GoalsView />}
          {currentTab === 'coach' && <CoachChatView initialPrompt={coachPrompt} />}
          {currentTab === 'claims' && <ClaimsAuditView />}
          {currentTab === 'journal' && <DecisionJournalView />}
          {currentTab === 'health' && <HealthScoreView />}
        </main>
      </div>
    </div>
  );
}
