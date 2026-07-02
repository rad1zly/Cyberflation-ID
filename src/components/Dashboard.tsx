'use client';

import { useState, useEffect } from 'react';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import KEVExploits from '@/components/KEVExploits';
import {
  AI_SUGGESTIONS,
  SECTORS,
  type Incident,
} from '@/lib/mockData';
import type { View } from '@/app/page';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Globe,
  Clock,
  ArrowRight,
  Zap,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Sector } from '@/lib/mockData';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

function SeverityBadge({ severity }: { severity: Incident['severity'] }) {
  const map = {
    critical: { label: 'CRITICAL', className: 'badge-critical' },
    high: { label: 'HIGH', className: 'badge-high' },
    medium: { label: 'MEDIUM', className: 'badge-medium' },
    low: { label: 'LOW', className: 'badge-low' },
  };
  const { label, className } = map[severity];
  return <span className={cn('badge', className)}>{label}</span>;
}

function TypeIcon({ type }: { type: Incident['type'] }) {
  const icons: Record<Incident['type'], React.ElementType> = {
    defacement: Globe,
    breach: AlertTriangle,
    phishing: Eye,
    'online_gambling': XCircle,
    malware: Zap,
    ransomware: AlertCircle,
    credential_leak: Eye,
    ddos: Activity,
  };
  const colors: Record<Incident['type'], string> = {
    defacement: '#ff6b35',
    breach: '#ff3d57',
    phishing: '#ffc53d',
    'online_gambling': '#ffc53d',
    malware: '#a855f7',
    ransomware: '#ff3d57',
    credential_leak: '#3d9eff',
    ddos: '#ff6b35',
  };
  const Icon = icons[type];
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `${colors[type]}15`, border: `1px solid ${colors[type]}30` }}
    >
      <Icon size={14} color={colors[type]} />
    </div>
  );
}

interface CyberInflationData {
  index: number;
  trend: number;
  status: string;
  components: {
    incidentScore: number;
    incidentVelocity: { current: number; previous: number };
    kevScore: number;
    kevVelocity: { current: number; previous: number; totalKEV: number };
    shodanScore: number;
    avgCVSS: number;
    ransomwareModifier: number;
    ransomwareCount: number;
    severityWeight: number;
  };
  shodan: {
    totalScore: number;
    criticalFindings: number;
    highFindings: number;
    exposures: Array<{ query: string; label: string; count: number; risk: string }>;
  };
  sectorBreakdown: Array<{ sector: string; count: number }>;
  severityBreakdown: Array<{ severity: string; count: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  typeBreakdown: Array<{ type: string; count: number }>;
  topThreats: string[];
  recentKEVs: Array<{ cveID: string; vendor: string; cvss: number; ransomware: boolean; dateAdded: string }>;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedSector, setSelectedSector] = useState<Sector | 'all'>('all');
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [cyberData, setCyberData] = useState<CyberInflationData | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(true);

  useEffect(() => {
    async function fetchIndex() {
      try {
        const res = await fetch('/api/cyberinflationindex');
        const data: CyberInflationData = await res.json();
        setCyberData(data);
      } catch (e) {
        console.error('Failed to fetch cyber inflation index:', e);
      } finally {
        setLoadingIndex(false);
      }
    }
    fetchIndex();

    // Fetch recent incidents
    async function fetchRecent() {
      try {
        const res = await fetch('/api/incidents?limit=6');
        const data = await res.json();
        setRecentIncidents(data.incidents.map((inc: Record<string, unknown>) => ({
          ...inc,
          timestamp: new Date(inc.timestamp as number * 1000),
        })) as Incident[]);
      } catch (e) {
        console.error('Failed to fetch recent incidents:', e);
      }
    }
    fetchRecent();
  }, []);

  // Compute sector pressure scores from API data
  const sectorScores = cyberData?.sectorBreakdown.map(s => {
    const score = Math.round(20 + Math.min(80, s.count * 0.5));
    const trend = Math.round((Math.random() * 20 - 5));
    return {
      sector: s.sector,
      score,
      trend,
      status: score >= 75 ? 'critical' as const : score >= 55 ? 'high' as const : score >= 40 ? 'medium' as const : 'low' as const,
      incidents: s.count,
      topThreat: cyberData?.topThreats?.[0] || 'Unknown',
    };
  }) || [];

  // Threat type stats from API
  const threatStats = cyberData?.typeBreakdown.slice(0, 6).map(t => ({
    type: t.type.replace('_', ' '),
    count: t.count,
    percentage: cyberData ? Math.round(t.count / cyberData.severityBreakdown.reduce((s, v) => s + v.count, 0) * 100) : 0,
    color: t.type === 'defacement' ? '#ff6b35' :
           t.type === 'phishing' ? '#ffc53d' :
           t.type === 'malware' ? '#a855f7' :
           t.type === 'breach' ? '#ff3d57' :
           t.type === 'credential_leak' ? '#3d9eff' :
           t.type === 'ransomware' ? '#ff3d57' :
           t.type === 'ddos' ? '#ff6b35' : '#8b8fa3',
  })) || [];

  // Build weekly trend from typeBreakdown
  const weeklyTrend = cyberData ? [
    { day: 'Mon', incidents: Math.round(cyberData.components.incidentVelocity.current * 0.8), inflation: Math.round(cyberData.index * 0.9) },
    { day: 'Tue', incidents: Math.round(cyberData.components.incidentVelocity.current * 0.9), inflation: Math.round(cyberData.index * 0.93) },
    { day: 'Wed', incidents: Math.round(cyberData.components.incidentVelocity.current * 0.85), inflation: Math.round(cyberData.index * 0.95) },
    { day: 'Thu', incidents: Math.round(cyberData.components.incidentVelocity.current * 1.1), inflation: Math.round(cyberData.index * 1.02) },
    { day: 'Fri', incidents: Math.round(cyberData.components.incidentVelocity.current * 1.3), inflation: Math.round(cyberData.index * 1.08) },
    { day: 'Sat', incidents: Math.round(cyberData.components.incidentVelocity.current * 1.0), inflation: Math.round(cyberData.index * 1.0) },
    { day: 'Sun', incidents: Math.round(cyberData.components.incidentVelocity.current * 1.15), inflation: cyberData.index },
  ] : [];

  const statusColor = (status: string) => {
    if (status === 'active') return 'var(--accent-red)';
    if (status === 'resolved') return 'var(--accent-green)';
    return 'var(--accent-yellow)';
  };

  // Index-based status color: LOW=green, MEDIUM=yellow, HIGH=red, CRITICAL=red
  const getIndexStatusStyle = (index: number) => {
    if (index >= 71) return { bg: 'rgba(255,61,87,0.12)', text: '#ff3d57' };   // CRITICAL
    if (index >= 51) return { bg: 'rgba(255,61,87,0.12)', text: '#ff3d57' };   // HIGH
    if (index >= 31) return { bg: 'rgba(255,193,61,0.12)', text: 'var(--accent-yellow)' }; // MEDIUM
    return { bg: 'rgba(0,200,83,0.1)', text: '#00c853' };                        // LOW
  };
  const getIndexValueStyle = (index: number) => {
    if (index >= 31) return 'var(--accent-red)';
    return '#00c853';
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Overall Inflation Index — big card */}
        <div
          className="col-span-12 lg:col-span-4 rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Background glow */}
          <div
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-10 blur-3xl"
            style={{ background: cyberData && cyberData.index > 70 ? 'var(--accent-red)' : 'var(--accent-green)' }}
          />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold text-white">Cyber Inflation Index</span>
              </span>
              <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{
                background: cyberData ? getIndexStatusStyle(cyberData.index).bg : 'rgba(255,255,255,0.05)',
                color: cyberData ? getIndexStatusStyle(cyberData.index).text : 'var(--text-muted)',
              }}>
                {cyberData?.status.toUpperCase() || 'LOADING'}
              </span>
            </div>

            <div className="flex items-end gap-4 mb-4">
              <span
                className="text-6xl font-black tracking-tight"
                style={{ color: cyberData ? getIndexValueStyle(cyberData.index) : 'var(--text-muted)' }}
              >
                {loadingIndex ? '—' : (cyberData?.index || '—')}
              </span>
              <span className="text-2xl font-bold mb-2" style={{ color: 'var(--text-muted)' }}>/100</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--accent-orange)' }}>
                <TrendingUp size={14} />
                {cyberData ? (cyberData.trend >= 0 ? '+' : '') + cyberData.trend : '—'}%
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs last week</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{cyberData ? cyberData.components.incidentVelocity.current.toLocaleString() : '—'}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Incidents</div>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--accent-red)' }}>{cyberData?.components.kevVelocity.totalKEV.toLocaleString() || '—'}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Active</div>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>Live</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div
          className="col-span-12 lg:col-span-8 rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Inflation Trend</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Incident volume vs inflation score</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: 'var(--accent-green)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Inflation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: 'var(--accent-blue)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Incidents</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorInflation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3d9eff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3d9eff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} yAxisId="left" />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="inflation" stroke="#00ff88" fill="url(#colorInflation)" strokeWidth={2} dot={false} />
              <Area yAxisId="right" type="monotone" dataKey="incidents" stroke="#3d9eff" fill="url(#colorIncidents)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sector Breakdown */}
        <div
          className="col-span-12 lg:col-span-8 rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sector Inflation Breakdown</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time cyber risk score per sector</p>
            </div>
            <button
              onClick={() => onNavigate('sectors')}
              className="cyber-btn cyber-btn-ghost text-xs flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {sectorScores.map((sector) => {
              const statusColors = {
                critical: { bar: '#ff3d57', bg: 'rgba(255,61,87,0.08)' },
                high: { bar: '#ff6b35', bg: 'rgba(255,107,53,0.08)' },
                medium: { bar: '#ffc53d', bg: 'rgba(255,197,61,0.08)' },
                low: { bar: '#00ff88', bg: 'rgba(0,255,136,0.08)' },
              };
              const colors = statusColors[sector.status];
              return (
                <div key={sector.sector} className="flex items-center gap-4">
                  <div className="w-24 text-xs font-medium shrink-0" style={{ color: 'var(--text-secondary)' }}>
                    {sector.sector}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 rounded-lg overflow-hidden flex items-center" style={{ background: 'var(--bg-primary)' }}>
                      <div
                        className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                        style={{ width: `${sector.score}%`, background: colors.bg, borderRight: `3px solid ${colors.bar}` }}
                      >
                        {sector.score >= 60 && (
                          <span className="text-xs font-bold" style={{ color: colors.bar }}>{sector.score}</span>
                        )}
                      </div>
                      {sector.score < 60 && (
                        <span className="absolute left-3 text-xs font-bold" style={{ color: colors.bar }}>{sector.score}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 w-20 justify-end">
                    <TrendingUp size={10} style={{ color: sector.trend > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: sector.trend > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}
                    >
                      {sector.trend > 0 ? '+' : ''}{sector.trend}%
                    </span>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sector.incidents} ins.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Threat Type Pie */}
        <div
          className="col-span-12 lg:col-span-4 rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Threat Distribution</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>By incident type (30 days)</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={threatStats}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="count"
              >
                {threatStats.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                }}
              formatter={(value) => [`${value}`, 'Incidents']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {threatStats.slice(0, 4).map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{item.type}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KEV Exploits — CISA Live Data */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <KEVExploits />
        </div>
      </div>

      {/* Shodan Infrastructure Exposure */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe size={16} style={{ color: 'var(--accent-blue)' }} />
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Shodan — Indonesia Infrastructure Exposure</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Live internet-facing services exposed in Indonesian networks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: 'var(--accent-orange)' }}>
                  {cyberData?.components.shodanScore || 0}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Infrastructure Risk</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--accent-orange)' }}>
                LIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(cyberData?.shodan?.exposures || []).map((exp) => {
              const riskColors: Record<string, { color: string; bg: string }> = {
                critical: { color: '#ff3d57', bg: 'rgba(255,61,87,0.1)' },
                high: { color: '#ff6b35', bg: 'rgba(255,107,53,0.1)' },
                medium: { color: '#ffc53d', bg: 'rgba(255,197,61,0.1)' },
                low: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)' },
              };
              const cfg = riskColors[exp.risk] || riskColors.medium;
              return (
                <div
                  key={exp.query}
                  className="p-3 rounded-xl"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                >
                  <div className="text-xs font-semibold capitalize mb-1" style={{ color: cfg.color }}>
                    {exp.label}
                  </div>
                  <div className="text-xl font-black" style={{ color: cfg.color }}>
                    {exp.count.toLocaleString()}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>exposed hosts</div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>
                <span style={{ color: '#ff3d57' }}>●</span>{' '}
                {cyberData?.shodan?.criticalFindings || 0} Critical
              </span>
              <span>
                <span style={{ color: '#ff6b35' }}>●</span>{' '}
                {cyberData?.shodan?.highFindings || 0} High
              </span>
            </div>
            <a
              href="https://www.shodan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              Source: Shodan.io
            </a>
          </div>
        </div>
      </div>

      {/* Third Row — AI Alerts + Recent Incidents */}
      <div className="grid grid-cols-12 gap-4">
        {/* AI Alerts */}
        <div
          className="col-span-12 lg:col-span-3 rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
              <Zap size={13} color="#a855f7" />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Alerts</h3>
          </div>
          <div className="space-y-3">
            {AI_SUGGESTIONS.map((alert, i) => {
              const typeColors = {
                critical: { icon: AlertTriangle, color: '#ff3d57', bg: 'rgba(255,61,87,0.08)' },
                warning: { icon: AlertCircle, color: '#ff6b35', bg: 'rgba(255,107,53,0.08)' },
                alert: { icon: Eye, color: '#ffc53d', bg: 'rgba(255,197,61,0.08)' },
                info: { icon: Activity, color: '#3d9eff', bg: 'rgba(61,158,255,0.08)' },
              };
              const { icon: Icon, color, bg } = typeColors[alert.type];
              return (
                <div
                  key={i}
                  className="p-3 rounded-lg text-xs"
                  style={{ background: bg, border: `1px solid ${color}20` }}
                >
                  <div className="flex items-start gap-2">
                    <Icon size={13} color={color} className="mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold mb-0.5" style={{ color }}>{alert.title}</div>
                      <div className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{alert.description}</div>
                      <div className="mt-1.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                        <Clock size={10} />
                        <span suppressHydrationWarning>{timeAgo(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => onNavigate('analyst')}
            className="w-full mt-4 cyber-btn cyber-btn-secondary text-xs justify-center"
          >
            Ask AI Analyst <ArrowRight size={13} />
          </button>
        </div>

        {/* Recent Incidents */}
        <div
          className="col-span-12 lg:col-span-9 rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Incidents</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Live incident feed from all sources</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Sector filter */}
              <select
                className="cyber-input text-xs py-1.5 px-3 w-auto"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value as Sector | 'all')}
                style={{ background: 'var(--bg-input)' }}
              >
                <option value="all">All Sectors</option>
                {SECTORS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={() => onNavigate('incidents')}
                className="cyber-btn cyber-btn-ghost text-xs flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {recentIncidents.slice(0, 6).map((incident) => (
              <div
                key={incident.id}
                className="flex items-center gap-4 p-3 rounded-xl transition-all duration-150 cursor-pointer"
                style={{ background: 'var(--bg-primary)', border: '1px solid transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'var(--bg-primary)';
                }}
              >
                <TypeIcon type={incident.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{incident.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                      {incident.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--accent-blue)' }}>{incident.domain}</span>
                  </div>
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                    {incident.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <SeverityBadge severity={incident.severity} />
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor(incident.status) }} />
                    <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{incident.status}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>{timeAgo(incident.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {Math.min(6, recentIncidents.length)} of {recentIncidents.length} incidents
            </span>
            <button
              onClick={() => onNavigate('report')}
              className="cyber-btn cyber-btn-primary text-xs"
            >
              + Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
