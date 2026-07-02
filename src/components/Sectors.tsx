'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CYBER_PRESSURE_DATA, INCIDENTS, SECTORS, type Sector } from '@/lib/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Activity,
  Globe,
  Shield,
  ArrowUpRight,
} from 'lucide-react';

const SECTOR_ICONS: Record<string, React.ElementType> = {
  Government: Building2,
  Education: Activity,
  Health: Shield,
  Finance: TrendingUp,
  Corporate: Globe,
  Public: AlertTriangle,
};

export default function Sectors() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const sector = CYBER_PRESSURE_DATA.find(s => s.sector === selectedSector);
  const sectorIncidents = selectedSector
    ? INCIDENTS.filter(i => i.sector === selectedSector?.toLowerCase())
    : [];

  const radarData = CYBER_PRESSURE_DATA.map(s => ({
    sector: s.sector,
    score: s.score,
    incidents: s.incidents,
  }));

  const severityCounts = selectedSector ? {
    critical: sectorIncidents.filter(i => i.severity === 'critical').length,
    high: sectorIncidents.filter(i => i.severity === 'high').length,
    medium: sectorIncidents.filter(i => i.severity === 'medium').length,
    low: sectorIncidents.filter(i => i.severity === 'low').length,
  } : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4">
        {/* Radar Chart — Overall */}
        <div
          className="col-span-12 lg:col-span-4 rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Indonesia Cyber Inflation Map</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Relative risk comparison across sectors</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="sector"
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
              />
              <Radar
                name="Pressure"
                dataKey="score"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                }}
                formatter={(value: unknown) => [`${value}/100`, 'Inflation Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Cards */}
        <div
          className="col-span-12 lg:col-span-8 rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Sectors Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CYBER_PRESSURE_DATA.map((s) => {
              const isSelected = selectedSector === s.sector;
              const statusColors = {
                critical: '#ff3d57',
                high: '#ff6b35',
                medium: '#ffc53d',
                low: '#00ff88',
              };
              const color = statusColors[s.status];
              const Icon = SECTOR_ICONS[s.sector] || Shield;
              return (
                <button
                  key={s.sector}
                  onClick={() => setSelectedSector(isSelected ? null : s.sector)}
                  className={cn(
                    'p-4 rounded-xl text-left transition-all duration-200',
                    isSelected ? 'ring-2' : ''
                  )}
                  style={{
                    background: isSelected ? `${color}10` : 'var(--bg-primary)',
                    border: isSelected ? `2px solid ${color}` : '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}15` }}
                    >
                      <Icon size={15} color={color} />
                    </div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${color}15`, color }}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{s.sector}</div>
                  <div className="text-2xl font-black mb-1" style={{ color }}>{s.score}</div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} color={s.trend > 0 ? '#ff6b35' : '#00ff88'} />
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: s.trend > 0 ? '#ff6b35' : '#00ff88' }}
                    >
                      {s.trend > 0 ? '+' : ''}{s.trend}% (7d)
                    </span>
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {s.incidents} incidents
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Sector Detail */}
      {selectedSector && sector && (
        <div
          className="rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-300"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${statusColors[sector.status]}15` }}
              >
                  {(() => {
                  const IconComponent = SECTOR_ICONS[sector.sector] || Shield;
                  return <IconComponent size={20} color={statusColors[sector.status]} />;
                })()}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{sector.sector} Sector</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Detailed analysis & risk breakdown</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="text-center px-4 py-2 rounded-xl"
                style={{ background: 'var(--bg-primary)' }}
              >
                <div className="text-xl font-black" style={{ color: statusColors[sector.status] }}>{sector.score}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/100 Score</div>
              </div>
              <div
                className="text-center px-4 py-2 rounded-xl"
                style={{ background: 'var(--bg-primary)' }}
              >
                <div className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{sector.incidents}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Incidents</div>
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight size={14} color={sector.trend > 0 ? '#ff6b35' : '#00ff88'} />
                <span
                  className="text-sm font-bold"
                  style={{ color: sector.trend > 0 ? '#ff6b35' : '#00ff88' }}
                >
                  {sector.trend > 0 ? '+' : ''}{sector.trend}%
                </span>
              </div>
            </div>
          </div>

          {/* Top threats */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4">
              <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>TOP THREATS</h4>
              <div className="space-y-2">
                {sectorIncidents.slice(0, 4).map((inc) => (
                  <div key={inc.id} className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                        {inc.type.replace('_', ' ')}
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${statusColors[inc.severity]}15`,
                          color: statusColors[inc.severity],
                        }}
                      >
                        {inc.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono" style={{ color: 'var(--accent-blue)' }}>{inc.domain}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity breakdown */}
            <div className="col-span-12 lg:col-span-4">
              <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>SEVERITY BREAKDOWN</h4>
              <div className="space-y-3">
                {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
                  const count = severityCounts?.[sev] || 0;
                  const total = sectorIncidents.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={sev} className="flex items-center gap-3">
                      <div className="w-16 text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{sev}</div>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: statusColors[sev],
                          }}
                        />
                      </div>
                      <div className="w-8 text-right text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Primary Threat Vector</div>
                <div className="text-sm font-semibold" style={{ color: statusColors.high }}>{sector.topThreat}</div>
              </div>
            </div>

            {/* Incident trend */}
            <div className="col-span-12 lg:col-span-4">
              <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>INCIDENT TYPE DISTRIBUTION</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[
                    { type: 'Deface', count: sectorIncidents.filter(i => i.type === 'defacement').length },
                    { type: 'Breach', count: sectorIncidents.filter(i => i.type === 'breach').length },
                    { type: 'Malware', count: sectorIncidents.filter(i => i.type === 'malware').length },
                    { type: 'Phishing', count: sectorIncidents.filter(i => i.type === 'phishing').length },
                    { type: 'Ransom', count: sectorIncidents.filter(i => i.type === 'ransomware').length },
                    { type: 'Cred', count: sectorIncidents.filter(i => i.type === 'credential_leak').length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis dataKey="type" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {[
                      { fill: '#ff6b35' },
                      { fill: '#ff3d57' },
                      { fill: '#a855f7' },
                      { fill: '#ffc53d' },
                      { fill: '#ff3d57' },
                      { fill: '#3d9eff' },
                    ].map((c, i) => <Cell key={i} fill={c.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const statusColors = {
  critical: '#ff3d57',
  high: '#ff6b35',
  medium: '#ffc53d',
  low: '#00ff88',
} as const;
