// Shodan API integration with DB-first persistent caching
// DB acts as durable cache — no API re-fetch until TTL expires

import path from 'path';
import Database from 'better-sqlite3';

const SHODAN_KEY = process.env.SHODAN_API_KEY || '';
const SHODAN_BASE = 'https://api.shodan.io/shodan';
const DB_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL in DB

interface ShodanQuery {
  query: string;
  label: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
}

const SHODAN_QUERIES: ShodanQuery[] = [
  { query: 'country:ID+MongoDB', label: 'MongoDB (No Auth)', risk: 'critical', weight: 0.30 },
  { query: 'country:ID+Redis', label: 'Redis (No Auth)', risk: 'high', weight: 0.10 },
  { query: 'country:ID+port:3389', label: 'RDP Exposed', risk: 'critical', weight: 0.20 },
  { query: 'country:ID+port:445', label: 'SMB Exposed', risk: 'high', weight: 0.10 },
  { query: 'country:ID+product:mysql', label: 'MySQL Exposed', risk: 'high', weight: 0.10 },
  { query: 'country:ID+Elasticsearch', label: 'Elasticsearch (No Auth)', risk: 'critical', weight: 0.15 },
];

// In-memory cache (short TTL, survives server warm-up between requests)
interface CacheEntry { data: unknown; expires: number; }
const memCache = new Map<string, CacheEntry>();

function memGet(key: string): unknown | null {
  const e = memCache.get(key);
  if (e && e.expires > Date.now()) return e.data;
  memCache.delete(key);
  return null;
}
function memSet(key: string, data: unknown, ttlMs: number) {
  memCache.set(key, { data, expires: Date.now() + ttlMs });
}

function getDb(): Database.Database {
  return new Database(path.join(process.cwd(), 'cyberflation.db'));
}

// Normalize count to 0-100 score
function normalizeScore(count: number, maxExpected: number): number {
  return Math.min(100, (count / maxExpected) * 100);
}

export interface ShodanRiskScore {
  totalScore: number;
  criticalFindings: number;
  highFindings: number;
  summary: { query: string; label: string; count: number; risk: string }[];
  sectors: { sector: string; exposureScore: number; topExposures: string[] }[];
}

// Fetch a single Shodan count — DB-first, only call API if DB cache stale
async function shodanCount(query: string, label: string, risk: string): Promise<number> {
  const memKey = `count:${query}`;
  const cached = memGet(memKey);
  if (cached !== null) return cached as number;

  const now = Date.now();
  const cutoff = now - DB_CACHE_TTL_MS;

  try {
    const db = getDb();
    const row = db.prepare(
      'SELECT count FROM shodan_scans WHERE query = ? AND risk_level = ? AND scanned_at > ? ORDER BY scanned_at DESC LIMIT 1'
    ).get(query, risk) as { count: number } | undefined;

    if (row) {
      db.close();
      memSet(memKey, row.count, DB_CACHE_TTL_MS);
      return row.count;
    }
    db.close();
  } catch { /* DB not ready yet */ }

  // DB cache miss — call Shodan API
  await new Promise(r => setTimeout(r, 500));
  const url = `${SHODAN_BASE}/host/count?key=${SHODAN_KEY}&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    console.error(`Shodan count error for "${query}": ${res.status}`);
    return 0;
  }
  const data = await res.json() as { total: number };
  const count = data.total || 0;

  memSet(memKey, count, DB_CACHE_TTL_MS);

  // Persist to DB
  try {
    const db = getDb();
    db.prepare(
      'INSERT INTO shodan_scans (query, service, count, risk_level, scanned_at) VALUES (?, ?, ?, ?, ?)'
    ).run(query, label, count, risk, now);
    db.close();
  } catch (e) {
    console.warn('Failed to persist Shodan to DB:', e);
  }

  return count;
}

export async function getShodanRiskScore(): Promise<ShodanRiskScore> {
  const memKey = 'shodan:risk:v1';
  const cached = memGet(memKey);
  if (cached) return cached as ShodanRiskScore;

  const now = Date.now();
  const cutoff = now - DB_CACHE_TTL_MS;

  // Try DB cache first for the full result
  try {
    const db = getDb();
    const rows = db.prepare(
      'SELECT query, service, count, risk_level FROM shodan_scans WHERE scanned_at > ? ORDER BY scanned_at DESC'
    ).all(cutoff) as { query: string; service: string; count: number; risk_level: string }[];

    // Group by query — take latest per query
    const latestByQuery = new Map<string, typeof rows[0]>();
    for (const row of rows) {
      if (!latestByQuery.has(row.query)) latestByQuery.set(row.query, row);
    }
    const freshRows = Array.from(latestByQuery.values());

    if (freshRows.length === SHODAN_QUERIES.length) {
      // All queries have fresh DB data — reconstruct without API calls
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
      const summary: ShodanRiskScore['summary'] = [];

      for (const row of freshRows) {
        const q = SHODAN_QUERIES.find(q => q.query === row.query);
        if (!q) continue;
        const normalized = normalizeScore(row.count, maxCounts[row.query] || 10000);
        const weighted = normalized * q.weight;
        totalScore += weighted;
        if (row.risk_level === 'critical') criticalFindings++;
        else if (row.risk_level === 'high') highFindings++;
        summary.push({ query: row.query, label: row.service, count: row.count, risk: row.risk_level });
      }

      const score: ShodanRiskScore = {
        totalScore: Math.round(totalScore),
        criticalFindings,
        highFindings,
        summary,
        sectors: [],
      };

      memSet(memKey, score, DB_CACHE_TTL_MS);
      db.close();
      return score;
    }
    db.close();
  } catch (e) {
    console.warn('Shodan DB cache check failed:', e);
  }

  // DB cache miss (partial or full) — fetch missing from API
  const results: { query: string; label: string; count: number; risk: 'critical' | 'high' | 'medium' | 'low'; weight: number }[] = [];

  for (const q of SHODAN_QUERIES) {
    const count = await shodanCount(q.query, q.label, q.risk);
    results.push({ ...q, count });
  }

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
  const summary: ShodanRiskScore['summary'] = [];

  for (const r of results) {
    const normalized = normalizeScore(r.count, maxCounts[r.query] || 10000);
    const weighted = normalized * r.weight;
    totalScore += weighted;
    if (r.risk === 'critical') criticalFindings++;
    else if (r.risk === 'high') highFindings++;
    summary.push({ query: r.query, label: r.label, count: r.count, risk: r.risk });
  }

  const score: ShodanRiskScore = {
    totalScore: Math.round(totalScore),
    criticalFindings,
    highFindings,
    summary,
    sectors: [],
  };

  memSet(memKey, score, DB_CACHE_TTL_MS);
  return score;
}
