'use client';

import { useState } from 'react';
import { generateForecastData, CYBER_PRESSURE_DATA, WEEKLY_TREND } from '@/lib/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'lucide-react';

const forecast = generateForecastData();
const horizonOptions = [
  { id: 7, label: '7 Days' },
  { id: 14, label: '14 Days' },
  { id: 30, label: '30 Days' },
];

const riskLevels = [
  { threshold: 80, label: 'CRITICAL', color: '#ff3d57', description: 'Immediate action required' },
  { threshold: 60, label: 'HIGH', color: '#ff6b35', description: 'Enhanced monitoring needed' },
  { threshold: 40, label: 'MEDIUM', color: '#ffc53d', description: 'Standard monitoring' },
  { threshold: 0, label: 'LOW', color: '#00ff88', description: 'Baseline monitoring' },
];

export default function Forecast() {
  const [horizon, setHorizon] = useState(14);
  const [showConfidenceBand, setShowConfidenceBand] = useState(true);

  const sliced = forecast.slice(-horizon);

  const lastActual = forecast.filter(d => d.actual !== undefined).pop();
  const nextPredicted = sliced[sliced.length - 1];

  const nextRiskLevel = riskLevels.find(r => nextPredicted.predicted >= r.threshold)!;
  const prevDay = sliced[sliced.length - 2];

  const trend = nextPredicted.predicted - (prevDay?.predicted || nextPredicted.predicted);
  const avgScore = Math.round(sliced.reduce((sum, d) => sum + d.predicted, 0) / sliced.length);
  const peakDay = sliced.reduce((max, d) => d.predicted > max.predicted ? d : max, sliced[0]);

  return (
    <div className="space-y-6">
      {/* Header Forecast Cards */}
      <div className="grid grid-cols-12 gap-4">
        <div
          className="col-span-12 lg:col-span-3 rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-10 blur-2xl"
            style={{ background: nextRiskLevel.color }}
          />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Predicted Inflation — Day {horizon}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black" style={{ color: nextRiskLevel.color }}>
                {nextPredicted.predicted}
              </span>
              <span className="text-lg font-bold mb-2" style={{ color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div
              className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: `${nextRiskLevel.color}15`, color: nextRiskLevel.color }}
            >
              {nextRiskLevel.label}
            </div>
            <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              {nextRiskLevel.description}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} color="var(--accent-blue)" />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Average (14d)</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{avgScore}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Inflation Score</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              {trend > 0 ? <ArrowUpRight size={14} color="var(--accent-orange)" /> : <ArrowDownRight size={14} color="var(--accent-green)" />}
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>14d Trend</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: trend > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
              {trend > 0 ? '+' : ''}{trend} pts
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>vs prev day</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} color="var(--accent-red)" />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Peak Forecast</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: peakDay.predicted > 75 ? 'var(--accent-red)' : peakDay.predicted > 60 ? 'var(--accent-orange)' : 'var(--accent-yellow)' }}>
              {peakDay.predicted}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{peakDay.date}</div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Cyber Inflation Forecast — {horizon} Day Projection
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Predicted based on historical incident velocity, CVE exploitation rate, and community signal
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Horizon selector */}
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
              {horizonOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setHorizon(opt.id)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={
                    horizon === opt.id
                      ? { background: 'var(--accent-green)', color: '#0a0a0f' }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={showConfidenceBand}
                onChange={(e) => setShowConfidenceBand(e.target.checked)}
              />
              Confidence Band
            </label>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={sliced}>
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Critical threshold */}
            <ReferenceLine y={80} stroke="#ff3d57" strokeDasharray="5 5" strokeOpacity={0.4} label={{ value: 'CRITICAL', position: 'right', fill: '#ff3d57', fontSize: 10 }} />
            <ReferenceLine y={60} stroke="#ff6b35" strokeDasharray="5 5" strokeOpacity={0.4} label={{ value: 'HIGH', position: 'right', fill: '#ff6b35', fontSize: 10 }} />
            <ReferenceLine y={40} stroke="#ffc53d" strokeDasharray="5 5" strokeOpacity={0.4} label={{ value: 'MEDIUM', position: 'right', fill: '#ffc53d', fontSize: 10 }} />

            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              domain={[20, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text-primary)',
              }}
              labelFormatter={(v) => {
                const d = new Date(v);
                return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                if (name === 'upper' || name === 'lower') return null;
                return [`${value} /100`, name === 'predicted' ? 'Predicted' : 'Actual'];
              }}
            />

            {showConfidenceBand && (
              <Area
                type="monotone"
                dataKey="upper"
                stroke="transparent"
                fill="#a855f7"
                fillOpacity={0.06}
                dot={false}
                activeDot={false}
                legendType="none"
              />
            )}
            {showConfidenceBand && (
              <Area
                type="monotone"
                dataKey="lower"
                stroke="transparent"
                fill="var(--bg-card)"
                fillOpacity={1}
                dot={false}
                activeDot={false}
                legendType="none"
              />
            )}

            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#a855f7"
              fill="url(#colorPredicted)"
              strokeWidth={2.5}
              dot={false}
              name="Predicted"
            />
            {sliced.some(d => d.actual !== undefined) && (
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#00ff88"
                fill="url(#colorActual)"
                strokeWidth={2}
                dot={false}
                name="Actual"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 rounded" style={{ background: '#a855f7' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 rounded" style={{ background: '#00ff88' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Actual</span>
          </div>
          {showConfidenceBand && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ background: 'rgba(168,85,247,0.15)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Confidence Band (±8)</span>
            </div>
          )}
        </div>
      </div>

      {/* Sector Forecast */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sector Forecast — 7 Days</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Predicted change per sector in the next 7 days</p>
          </div>
          <Calendar size={16} color="var(--text-muted)" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CYBER_PRESSURE_DATA.map((sector) => {
            const forecastChange = sector.trend + Math.floor(Math.random() * 10 - 3);
            const isUp = forecastChange > 0;
            return (
              <div key={sector.sector} className="p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-xs font-medium mb-2 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {sector.sector}
                </div>
                <div className="text-lg font-bold" style={{ color: sector.score > 70 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                  {Math.min(99, sector.score + forecastChange)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {isUp ? <ArrowUpRight size={11} color="var(--accent-orange)" /> : <ArrowDownRight size={11} color="var(--accent-green)" />}
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: isUp ? 'var(--accent-orange)' : 'var(--accent-green)' }}
                  >
                    {isUp ? '+' : ''}{forecastChange}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Methodology */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Forecast Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: 'Historical Trend',
              description: 'ARIMA time-series extrapolation from 30-day incident velocity',
              icon: '📊',
            },
            {
              label: 'Community Signal',
              description: 'Crowdsourced report trend + sentiment analysis from Telegram/forum',
              icon: '👥',
            },
            {
              label: 'CVE Exploitation Rate',
              description: 'Real-time CVE/KEV feed monitoring for active exploits in Indonesia',
              icon: '🔴',
            },
          ].map((m, i) => (
            <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{m.label}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{m.description}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-4" style={{ color: 'var(--text-muted)' }}>
          Confidence Score: 78%. Forecast uses ARIMA + XGBoost ensemble. Actual results may vary based on unforeseen events (zero-day exploits, coordinated attacks).
        </p>
      </div>
    </div>
  );
}
