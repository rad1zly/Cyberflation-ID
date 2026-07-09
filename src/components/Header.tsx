'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, Bell, Search, AlertTriangle, AlertCircle, Activity, Sun, Moon } from 'lucide-react';
import type { View } from '@/app/page';

const VIEW_TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  analyst: 'AI Cyberflation Analyst',
  incidents: 'Incident Feed',
  report: 'Submit Report',
  forecast: 'Cyber Inflation Forecast',
  sectors: 'Sector Analysis',
  news: 'Cyber News',
  gambling: 'Online Gambling Exploits',
};

const VIEW_SUBTITLES: Record<View, string> = {
  dashboard: 'Real-time cyber risk inflation monitoring for Indonesia',
  analyst: 'Ask anything about Indonesia cyber risk landscape',
  incidents: 'Live feed of reported cybersecurity incidents',
  report: 'Contribute to the community-driven early warning system',
  forecast: '7-14 day predictive cyber inflation forecast',
  sectors: 'Sector-by-sector risk breakdown and analysis',
  news: 'Latest cybersecurity news from trusted sources',
  gambling: 'OSINT dorking engine for gambling injection in Indonesian government & education websites',
};

interface AISuggestion {
  type: 'warning' | 'alert' | 'info' | 'critical';
  title: string;
  description: string;
  sector?: string;
  timestamp: Date;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  currentView: View;
  onSearch: (query: string) => void;
  onAlertsClick: () => void;
  showAlerts: boolean;
  alerts: AISuggestion[];
}

export default function Header({
  onToggleSidebar,
  currentView,
  onSearch,
  onAlertsClick,
  showAlerts,
  alerts,
}: HeaderProps) {
  const [inputValue, setInputValue] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('cyberflation-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cyberflation-theme', next);
  };
  const alertsRef = useRef<HTMLDivElement>(null);

  // Close alerts on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        onAlertsClick();
      }
    }
    if (showAlerts) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showAlerts, onAlertsClick]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const alertColors: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
    critical: { color: '#ff3d57', icon: AlertTriangle, bg: 'rgba(255,61,87,0.1)' },
    warning: { color: '#ff6b35', icon: AlertCircle, bg: 'rgba(255,107,53,0.1)' },
    alert: { color: '#ffc53d', icon: Activity, bg: 'rgba(255,197,61,0.1)' },
    info: { color: '#3d9eff', icon: Activity, bg: 'rgba(61,158,255,0.1)' },
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b sticky top-0 z-40"
      style={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {VIEW_TITLES[currentView]}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {VIEW_SUBTITLES[currentView]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Logo — top right */}
        <img
          src="/logo.png"
          alt="CYBERFLATION.ID"
          className="h-9 w-auto object-contain mr-2"
        />

        {/* Search */}
        <form onSubmit={handleSubmit} className="relative hidden md:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search domain, sector, threat..."
            className="cyber-input pl-9 pr-4 py-2 text-xs w-64"
          />
        </form>

        {/* Alert badge */}
        <div ref={alertsRef} className="relative">
          <button
            onClick={onAlertsClick}
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell size={18} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--accent-red)' }}
            />
          </button>

          {/* Alerts Dropdown */}
          {showAlerts && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl p-3 z-50"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div className="text-xs font-semibold mb-3 px-2" style={{ color: 'var(--text-muted)' }}>
                AI ALERTS
              </div>
              <div className="space-y-2">
                {alerts.slice(0, 4).map((alert, i) => {
                  const cfg = alertColors[alert.type] || alertColors.info;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg text-xs"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                    >
                      <div className="flex items-start gap-2">
                        <Icon size={13} color={cfg.color} className="mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold" style={{ color: cfg.color }}>{alert.title}</div>
                          <div className="mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {alert.description.length > 80
                              ? alert.description.substring(0, 80) + '...'
                              : alert.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Status pill */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(0, 255, 136, 0.08)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            color: 'var(--accent-green)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] pulse-dot" />
          Indonesia
        </div>
      </div>
    </header>
  );
}
