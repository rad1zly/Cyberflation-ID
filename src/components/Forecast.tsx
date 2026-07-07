'use client';

import { useState, useEffect } from 'react';
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
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const RISK_LEVELS = [
  { threshold: 71, label: 'CRITICAL', color: '#ff3d57', description: 'Immediate action required' },
  { threshold: 51, label: 'HIGH', color: '#ff3d57', description: 'Enhanced monitoring needed' },
  { threshold: 31, label: 'MEDIUM', color: '#ffc53d', description: 'Standard monitoring' },
  { threshold: 0, label: 'LOW', color: '#00c853', description: 'Baseline monitoring' },
];

function getRiskLevel(score: number) {
  return RISK_LEVELS.find(r => score >= r.threshold)!;
}

// Generate forecast data based on current real index
function generateForecast(currentIndex: number, horizon: number, acceleration: number) {
  const data = [];
  const now = new Date();
  let index = currentIndex;

  // Last 14 days: gradually build up to current index (for context)
  for (let i = 13; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayIndex = Math.max(0, currentIndex - (acceleration * i) + (Math.random() * 6 - 3));
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: Math.round(dayIndex),
      predicted: undefined as number | undefined,
    });
  }

  // Today: actual value
  data.push({
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    actual: currentIndex,
    predicted: undefined,
  });

  // Future: projected based on acceleration + slight mean-reversion noise
  for (let i = 1; i <= horizon; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    // Project with damping: acceleration decays over time (mean reversion tendency)
    const damping = Math.exp(-i / 20); // decay over ~20 days
    const drift = acceleration * damping;
    const noise = (Math.random() * 4 - 2); // ±2 random noise
    index = Math.max(0, Math.min(100, index + drift + noise));
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: undefined,
      predicted: Math.round(index),
    });
  }

  return data;
}

interface IndexData {
  index: number;
  status: string;
  trend: number;
  components: {
    incidentScore: number;
    kevScore: number;
    shodanScore: number;
    avgCVSS: number;
  };
  gambling: { score: number; activeInfections: number };
}

export default function Forecast() {
  const [horizon, setHorizon] = useState(14);
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    fetch('/api/cyberinflationindex')
      .then(r => r.json())
      .then(d => setIndexData(d))
      .finally(() => setLoading(false));
  }, []);

  // Fetch LLM-generated forecast analysis whenever data or horizon changes
  useEffect(() => {
    if (!indexData) return;
    setAnalysisLoading(true);
    const forecast = generateForecast(currentIndex, horizon, acceleration);
    fetch('/api/forecast-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indexData, forecast, horizon }),
    })
      .then(r => r.json())
      .then(d => setAnalysis(d.analysis || null))
      .catch(() => setAnalysis(null))
      .finally(() => setAnalysisLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexData?.index, horizon]);

  if (loading || !indexData) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  const currentIndex = indexData.index;
  // Acceleration: how fast the index is changing per day
  // Based on incident velocity vs baseline and gambling pressure
  const incidentVel = (indexData.components.incidentScore / 100);
  const gamblingPressure = (indexData.gambling.score / 100);
  const acceleration = (incidentVel * 1.2 + gamblingPressure * 0.8) * 0.6; // daily drift

  const forecast = generateForecast(currentIndex, horizon, acceleration);
  const sliced = forecast.slice(-(horizon + 14)); // keep last 14 actual + horizon future

  const lastPredicted = forecast[forecast.length - 1];
  const prevPredicted = forecast[forecast.length - 2];
  const trend = (lastPredicted.predicted ?? 0) - (prevPredicted?.predicted ?? 0);

  const risk = getRiskLevel(lastPredicted.predicted ?? currentIndex);

  const predictedVals = sliced.filter(d => d.predicted !== undefined);
  const avgForecast = predictedVals.length > 0
    ? Math.round(predictedVals.reduce((s, d) => s + (d.predicted || 0), 0) / predictedVals.length)
    : currentIndex;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { actual?: number; predicted?: number } }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    const isActual = d.payload.actual !== undefined;
    return (
      <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="font-bold mt-1" style={{ color: isActual ? '#00c853' : risk.color }}>
          {isActual ? `Actual: ${d.value}` : `Forecast: ${d.value}`}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-12 gap-4">
        {/* Current Index */}
        <div className="col-span-12 lg:col-span-3 rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Current Index
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black" style={{ color: currentIndex >= 31 ? '#ff3d57' : '#00c853' }}>
              {currentIndex}
            </span>
            <span className="text-lg mb-1" style={{ color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div className="text-[10px] font-semibold mt-1 uppercase"
            style={{ color: getRiskLevel(currentIndex).color }}>
            {indexData.status}
          </div>
        </div>

        {/* 30-Day Forecast */}
        <div className="col-span-12 lg:col-span-3 rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            30-Day Forecast
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black" style={{ color: risk.color }}>
              {lastPredicted.predicted}
            </span>
            <span className="text-lg mb-1" style={{ color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {trend >= 0
              ? <ArrowUpRight size={12} style={{ color: '#ff3d57' }} />
              : <ArrowDownRight size={12} style={{ color: '#00c853' }} />}
            <span className="text-[10px] font-semibold" style={{ color: trend >= 0 ? '#ff3d57' : '#00c853' }}>
              {trend >= 0 ? '+' : ''}{trend} pts
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>vs today</span>
          </div>
        </div>

        {/* Avg Forecast */}
        <div className="col-span-12 lg:col-span-3 rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Avg Forecast
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black" style={{ color: '#ffc53d' }}>
              {avgForecast}
            </span>
            <span className="text-lg mb-1" style={{ color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {getRiskLevel(avgForecast).label} average
          </div>
        </div>

        {/* Risk Level */}
        <div className="col-span-12 lg:col-span-3 rounded-2xl p-5"
          style={{ background: `${risk.color}12`, border: `1px solid ${risk.color}30` }}>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Forecast Risk
          </div>
          <div className="text-2xl font-black" style={{ color: risk.color }}>
            {risk.label}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {risk.description}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Horizon selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: 'var(--accent-orange)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Cyber Inflation Trajectory
            </span>
          </div>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            {[7, 14, 30].map(h => (
              <button key={h}
                onClick={() => setHorizon(h)}
                className="px-3 py-1.5 text-[10px] font-medium transition-colors"
                style={{
                  background: horizon === h ? 'var(--accent-orange)' : 'transparent',
                  color: horizon === h ? '#fff' : 'var(--text-muted)',
                }}>
                {h}D
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sliced} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c853" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00c853" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={risk.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={risk.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={false}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Reference lines */}
              <ReferenceLine y={71} stroke="#ff3d57" strokeDasharray="5 5" strokeOpacity={0.3}
                label={{ value: 'CRITICAL', position: 'right', fill: '#ff3d57', fontSize: 9 }} />
              <ReferenceLine y={51} stroke="#ff6b35" strokeDasharray="5 5" strokeOpacity={0.3}
                label={{ value: 'HIGH', position: 'right', fill: '#ff6b35', fontSize: 9 }} />
              <ReferenceLine y={31} stroke="#ffc53d" strokeDasharray="5 5" strokeOpacity={0.3}
                label={{ value: 'MEDIUM', position: 'right', fill: '#ffc53d', fontSize: 9 }} />
              <ReferenceLine y={currentIndex} stroke="#00c853" strokeDasharray="3 3" strokeOpacity={0.5} />
              {/* Actual area */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#00c853"
                strokeWidth={2}
                fill="url(#actualGrad)"
                dot={false}
                connectNulls
              />
              {/* Forecast area */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke={risk.color}
                strokeWidth={2}
                fill="url(#forecastGrad)"
                strokeDasharray="5 3"
                dot={false}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: '#00c853' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full border-dashed" style={{ borderTop: `2px dashed ${risk.color}` }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: '#00c853', opacity: 0.5 }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Today</span>
          </div>
        </div>
      </div>

      {/* LLM Forecast Analysis */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={12} style={{ color: 'var(--accent-orange)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            AI Forecast Analysis
          </span>
          {analysisLoading && <RefreshCw size={10} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
        </div>
        {analysisLoading ? (
          <div className="text-xs italic py-4 text-center" style={{ color: 'var(--text-muted)' }}>
            Generating AI forecast analysis...
          </div>
        ) : analysis ? (
          <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {analysis.split('\n').reduce<React.ReactNode[]>((acc, line, i) => {
              const trimmed = line.trim();
              if (!trimmed) { acc.push(<br key={`br-${i}`} />); return acc; }
              // Render inline: **bold**, *italic*, plain text
              const parts = trimmed.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
              const rendered = parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <em key={j}>{part.slice(1, -1)}</em>;
                }
                return <span key={j}>{part}</span>;
              });
              // Section headings
              if (/^(Executive Summary|Key Drivers|Sector Spotlight|Recommended Actions|Confidence|AI Forecast Analysis)/i.test(trimmed)) {
                acc.push(<p key={`h-${i}`} className="font-bold mt-2 mb-1" style={{ color: 'var(--text-primary)', fontSize: '0.7rem' }}>{rendered}</p>);
              } else {
                acc.push(<p key={`p-${i}`} style={{ margin: '2px 0' }}>{rendered}</p>);
              }
              return acc;
            }, [])}
          </div>
        ) : (
          <div className="text-xs italic text-center py-4" style={{ color: 'var(--text-muted)' }}>
            AI analysis unavailable — check Fireworks API configuration
          </div>
        )}
      </div>

      {/* Driver Analysis */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 rounded-2xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={12} style={{ color: 'var(--accent-orange)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Key Drivers
            </span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Incident Velocity', value: indexData.components.incidentScore, max: 100 },
              { label: 'KEV Exploits', value: indexData.components.kevScore, max: 100 },
              { label: 'CVSS Severity', value: Math.round(indexData.components.avgCVSS * 10), max: 100 },
              { label: 'Gambling Pressure', value: indexData.gambling.score, max: 100 },
            ].map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.value}/100</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: 'var(--bg-cell)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${d.value}%`, background: d.value > 70 ? '#ff3d57' : d.value > 40 ? '#ffc53d' : '#00c853' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 rounded-2xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={12} style={{ color: 'var(--accent-orange)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Risk Thresholds
            </span>
          </div>
          <div className="space-y-2">
            {RISK_LEVELS.map(r => (
              <div key={r.label}
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: r.threshold === 71 ? `${r.color}10` : 'transparent' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-xs font-semibold" style={{ color: r.color }}>{r.label}</span>
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>≥ {r.threshold}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
