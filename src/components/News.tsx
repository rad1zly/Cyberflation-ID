'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Clock, Rss, Filter, AlertTriangle } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  sourceColor: string;
  category?: string | string[];
  threatScore?: number;
  threatTypes?: string[];
}

interface ThreatAnalysis {
  score: number;
  rawScore: number;
  totalArticles: number;
  matchedArticles: number;
  breakdown: Record<string, number>;
  recentAlerts: string[];
}

export default function News() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sources, setSources] = useState<string[]>([]);
  const [threatAnalysis, setThreatAnalysis] = useState<ThreatAnalysis | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        const data: { items: NewsItem[]; threatAnalysis: ThreatAnalysis } = await res.json();
        setItems(data.items);
        setThreatAnalysis(data.threatAnalysis);
        const uniqueSources = [...new Set(data.items.map(i => i.source))];
        setSources(uniqueSources);
      } catch (e) {
        console.error('Failed to fetch news:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const filtered = filter === 'all' ? items : items.filter(i => i.source === filter);

  // Threat badge colors
  const threatColors: Record<string, string> = {
    breach: '#ff3d57',
    ransomware: '#a855f7',
    vulnerability: '#ff6b35',
    phishing: '#ffc53d',
    malware: '#ff3d57',
    geopolitics: '#3d9eff',
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffH / 24);
    if (diffD > 0) return `${diffD}d ago`;
    if (diffH > 0) return `${diffH}h ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Cyber Threat News
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Latest cybersecurity news from trusted sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Rss size={14} style={{ color: 'var(--accent-orange)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--accent-orange)' }}>
            Live RSS
          </span>
        </div>
      </div>

      {/* Source Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Filter size={12} />
          <span>Filter:</span>
        </div>
        <button
          onClick={() => setFilter('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: filter === 'all' ? 'var(--accent-blue)' : 'var(--bg-cell)',
            color: filter === 'all' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          All Sources
        </button>
        {sources.map(src => (
          <button
            key={src}
            onClick={() => setFilter(src)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: filter === src ? 'var(--bg-card)' : 'var(--bg-cell)',
              color: filter === src ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: filter === src ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Threat Analysis Panel */}
      {threatAnalysis && threatAnalysis.matchedArticles > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: 'var(--accent-orange)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                News Threat Intelligence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {threatAnalysis.matchedArticles}/{threatAnalysis.totalArticles} articles matched
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--accent-orange)' }}>
                Score: {threatAnalysis.score}
              </span>
            </div>
          </div>

          {/* Threat breakdown */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
            {Object.entries(threatAnalysis.breakdown).map(([threat, count]) => (
              <span
                key={threat}
                className="text-[11px] px-2 py-1 rounded-lg capitalize font-medium"
                style={{ background: (threatColors[threat] || '#8b8fa3') + '15', color: threatColors[threat] || 'var(--text-muted)' }}
              >
                {threat.replace('_', ' ')}: {count}
              </span>
            ))}
          </div>

          {/* Recent alerts */}
          {threatAnalysis.recentAlerts.length > 0 && (
            <div className="mt-2 p-3 rounded-lg" style={{ background: 'rgba(255,61,87,0.05)', border: '1px solid rgba(255,61,87,0.15)' }}>
              <div className="text-[10px] font-semibold mb-2" style={{ color: 'var(--accent-red)' }}>
                HIGH THREAT ALERTS
              </div>
              {threatAnalysis.recentAlerts.map((alert, i) => (
                <div key={i} className="text-[11px] mb-1" style={{ color: 'var(--text-secondary)' }}>
                  • {alert}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* News List */}
      {loading && (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading news...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
          No news available.
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-xl transition-all duration-150"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-card)';
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Source badge */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: item.sourceColor + '22',
                        color: item.sourceColor,
                      }}
                    >
                      {item.source}
                    </span>
                    {item.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                        style={{ background: 'var(--bg-cell)', color: 'var(--text-muted)' }}>
                        {Array.isArray(item.category) ? item.category[0] : item.category}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={10} />
                      <span suppressHydrationWarning>{timeAgo(item.pubDate)}</span>
                    </div>
                    {/* Threat badges */}
                    {(item.threatTypes || []).slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize"
                        style={{
                          background: (threatColors[t] || '#8b8fa3') + '18',
                          color: threatColors[t] || 'var(--text-muted)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold mb-1.5 leading-snug"
                    style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 mt-1">
                  <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
