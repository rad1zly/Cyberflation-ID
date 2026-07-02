// Shodan API integration with aggressive caching
// Plan: 100 query credits/month → cache 1 hour minimum

import path from 'path';
import Database from 'better-sqlite3';

const SHODAN_KEY = process.env.SHODAN_API_KEY || '';
const SHODAN_BASE = 'https://api.shodan.io/shodan';

interface ShodanQuery {
  query: string;
  label: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  weight: number; // contribution to infra risk score
}

// Queries to run (selective, conserve credits)
const SHODAN_QUERIES: ShodanQuery[] = [
  { query: 'country:ID+MongoDB', label: 'MongoDB (No Auth)', risk: 'critical', weight: 0.30 },
  { query: 'country:ID+Redis', label: 'Redis (No Auth)', risk: 'high', weight: 0.10 },
  { query: 'country:ID+port:3389', label: 'RDP Exposed', risk: 'critical', weight: 0.20 },
  { query: 'country:ID+port:445', label: 'SMB Exposed', risk: 'high', weight: 0.10 },
  { query: 'country:ID+product:mysql', label: 'MySQL Exposed', risk: 'high', weight: 0.10 },
  { query: 'country:ID+Elasticsearch', label: 'Elasticsearch (No Auth)', risk: 'critical', weight: 0.15 },
];

// In-memory cache with TTL
interface CacheEntry {
  data: unknown;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

async function shodanCount(query: string): Promise<number> {
  const cacheKey = `count:${query}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached as number;

  // Rate limit: 1 request/second for Shodan
  await new Promise(r => setTimeout(r, 1100));

  const url = `${SHODAN_BASE}/host/count?key=${SHODAN_KEY}&query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Shodan count error for "${query}": ${res.status}`);
    return 0;
  }
  const data = await res.json() as { total: number };
  const count = data.total || 0;

  // Cache for 1 hour (3600000ms)
  setCache(cacheKey, count, 3600000);
  return count;
}

export interface ShodanRiskScore {
  totalScore: number;         // 0-100 infrastructure risk
  criticalFindings: number;
  highFindings: number;
  summary: {
    query: string;
    label: string;
    count: number;
    risk: string;
  }[];
  sectors: {
    sector: string;
    exposureScore: number;
    topExposures: string[];
  }[];
}

// Normalize count to 0-100 score
function normalizeScore(count: number, maxExpected: number): number {
  return Math.min(100, (count / maxExpected) * 100);
}

export async function getShodanRiskScore(): Promise<ShodanRiskScore> {
  const cacheKey = 'shodan:risk:v1';
  const cached = getCached(cacheKey);
  if (cached) return cached as ShodanRiskScore;

  const results: { query: string; label: string; count: number; risk: 'critical' | 'high' | 'medium' | 'low'; weight: number }[] = [];

  for (const q of SHODAN_QUERIES) {
    const count = await shodanCount(q.query);
    results.push({ ...q, count });
  }

  // Compute weighted infrastructure risk score
  const maxCounts: Record<string, number> = {
    'country:ID+MongoDB': 20000,
    'country:ID+Redis': 5000,
    'country:ID+port:3389': 30000,
    'country:ID+port:445': 30000,
    'country:ID+product:mysql': 50000,
    'country:ID+Elasticsearch': 500,
  };

  let totalScore = 0;
  let criticalFindings = 0;
  let highFindings = 0;

  for (const r of results) {
    const max = maxCounts[r.query] || 10000;
    const normalized = normalizeScore(r.count, max);
    const weighted = normalized * r.weight;
    totalScore += weighted;

    if (r.risk === 'critical') criticalFindings++;
    else if (r.risk === 'high') highFindings++;
  }

  const summary = results.map(r => ({
    query: r.query,
    label: r.label,
    count: r.count,
    risk: r.risk,
  }));

  const score: ShodanRiskScore = {
    totalScore: Math.round(totalScore),
    criticalFindings,
    highFindings,
    summary,
    sectors: [], // TODO: sector-level Shodan queries if credits allow
  };

  // Cache for 1 hour
  setCache(cacheKey, score, 3600000);

  // Persist to database
  try {
    const dbPath = path.join(process.cwd(), 'cyberflation.db');
    const db = new Database(dbPath, { readonly: false });
    const now = new Date();
    const insert = db.prepare(
      'INSERT INTO shodan_scans (query, service, count, risk_level, scanned_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const r of results) {
      insert.run(r.query, r.label, r.count, r.risk, now.getTime());
    }
    db.close();
  } catch (e) {
    console.warn('Failed to persist Shodan results to DB:', e);
  }

  return score;
}
