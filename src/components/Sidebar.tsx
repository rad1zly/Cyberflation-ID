'use client';

import { cn } from '@/lib/utils';
import type { View } from '@/app/page';
import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  FileText,
  TrendingUp,
  Building2,
  Radio,
  Globe,
  ShieldAlert,
  Rss,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  collapsed: boolean;
}

const navItems: { id: View; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyst', label: 'AI Analyst', icon: MessageSquare },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'sectors', label: 'Sectors', icon: Building2 },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'news', label: 'Cyber News', icon: Rss },
  { id: 'gambling', label: 'Online Gambling', icon: ShieldAlert },
  { id: 'report', label: 'Submit Report', icon: FileText },
];

export default function Sidebar({ currentView, onNavigate, collapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b gap-3',
          collapsed ? 'justify-center' : 'justify-between'
        )}
        style={{ borderColor: 'var(--border)' }}
      >
        {!collapsed && (
          <img
            src="/logo.png"
            alt="CYBERFLATION.ID"
            className="h-10 w-auto object-contain"
            style={{ filter: 'brightness(1.1)' }}
          />
        )}
        {collapsed && (
          <img
            src="/logo.png"
            alt="CYBERFLATION.ID"
            className="w-10 h-10 object-contain rounded-lg"
          />
        )}
      </div>

      {/* Live indicator */}
      {!collapsed && (
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className="w-2 h-2 rounded-full pulse-dot"
                style={{ background: 'var(--accent-green)' }}
              />
              <div
                className="absolute inset-0 w-2 h-2 rounded-full pulse-dot"
                style={{ background: 'var(--accent-green)', opacity: 0.4 }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              LIVE MONITORING
            </span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                collapsed && 'justify-center',
                isActive
                  ? 'text-[var(--accent-green)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              )}
              style={
                isActive
                  ? { background: 'rgba(0, 255, 136, 0.08)' }
                  : undefined
              }
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{label}</span>
                  {badge && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(0, 255, 136, 0.15)', color: 'var(--accent-green)' }}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => {}}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <Radio size={14} />
          {!collapsed && <span>v1.0 Beta</span>}
        </button>
      </div>
    </aside>
  );
}
