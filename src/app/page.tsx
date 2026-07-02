'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import AIAnalyst from '@/components/AIAnalyst';
import IncidentFeed from '@/components/IncidentFeed';
import ReportForm from '@/components/ReportForm';
import Forecast from '@/components/Forecast';
import Sectors from '@/components/Sectors';
import News from '@/components/News';
import { AI_SUGGESTIONS } from '@/lib/mockData';

export type View = 'dashboard' | 'analyst' | 'incidents' | 'report' | 'forecast' | 'sectors' | 'news';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) setCurrentView('incidents');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'analyst': return <AIAnalyst />;
      case 'incidents': return <IncidentFeed searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} />;
      case 'report': return <ReportForm />;
      case 'forecast': return <Forecast />;
      case 'sectors': return <Sectors />;
      case 'news': return <News />;
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        collapsed={sidebarCollapsed}
      />
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '240px', transition: 'margin-left 0.2s ease' }}
      >
        <Header
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentView={currentView}
          onSearch={handleSearch}
          onAlertsClick={() => setShowAlerts(!showAlerts)}
          showAlerts={showAlerts}
          alerts={AI_SUGGESTIONS}
        />
        <main className="flex-1 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
