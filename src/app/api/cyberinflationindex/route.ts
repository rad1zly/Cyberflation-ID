import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getShodanRiskScore } from '@/lib/shodan';
import { computeNewsThreat } from '@/lib/newsThreat';
import { getGamblingData } from '@/lib/gamblingDork';
import { XMLParser } from 'fast-xml-parser';

const KEVIN_BASE = 'https://kevin.gtfkd.com';
const RATE_LIMIT_MS = 500;
let lastKEVCall = 0;

async function kevinFetch(path: string) {
  const now = Date.now();
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastKEVCall));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastKEVCall = Date.now();
  const res = await fetch(`${KEVIN_BASE}${path}`, {
    headers: { 'User-Agent': 'Cyberflation.ID/1.0' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`KEVin error: ${res.status}`);
  return res.json();
}

function getDb() {
  return new Database(path.join(process.cwd(), 'cyberflation.db'));
}

interface KEVVuln {
  cveID: string;
  dateAdded: string;
  knownRansomwareCampaignUse: string;
  nvdData: Array<{ baseScore: number; baseSeverity: string }>;
}

export async function GET() {
  try {
    const db = getDb();

    // ── 1. INCIDENT VELOCITY from SQLite ─────────────────────────────────
    const now = Math.floor(Date.now() / 1000);
    const oneWeekAgo = now - 7 * 86400;
    const twoWeeksAgo = now - 14 * 86400;

    const weekIncidents = (db.prepare(
      `SELECT COUNT(*) as count FROM incidents WHERE timestamp >= ?`
    ).get(oneWeekAgo) as { count: number }).count;

    const prevWeekIncidents = (db.prepare(
      `SELECT COUNT(*) as count FROM incidents WHERE timestamp >= ? AND timestamp < ?`
    ).get(twoWeeksAgo, oneWeekAgo) as { count: number }).count;

    // Sector breakdown
    const sectorRows = db.prepare(
      `SELECT sector, COUNT(*) as count FROM incidents GROUP BY sector`
    ).all() as Array<{ sector: string; count: number }>;

    // Severity breakdown
    const severityRows = db.prepare(
      `SELECT severity, COUNT(*) as count FROM incidents WHERE timestamp >= ?`
    ).all(oneWeekAgo) as Array<{ severity: string; count: number }>;

    // Status breakdown
    const statusRows = db.prepare(
      `SELECT status, COUNT(*) as count FROM incidents WHERE timestamp >= ?`
    ).all(oneWeekAgo) as Array<{ status: string; count: number }>;

    // Type breakdown (30 days)
    const thirtyDaysAgo = now - 30 * 86400;
    const typeRows = db.prepare(
      `SELECT type, COUNT(*) as count FROM incidents WHERE timestamp >= ? GROUP BY type ORDER BY count DESC`
    ).all(thirtyDaysAgo) as Array<{ type: string; count: number }>;

    db.close();

    // ── 2. KEV DATA from CISA via KEVin ────────────────────────────────
    const recentKEVs = await kevinFetch('/kev/recent?days=7') as KEVVuln[];
    const prevKEVs = await kevinFetch('/kev/recent?days=14') as KEVVuln[];

    // Filter to only last 14 days that aren't in the last 7 days
    const prevKEVSet = new Set(recentKEVs.map((k: KEVVuln) => k.cveID));
    const kevPrevWeek = (prevKEVs as KEVVuln[]).filter((k: KEVVuln) => !prevKEVSet.has(k.cveID));

    // ── 3. SHODAN INFRASTRUCTURE RISK ──────────────────────────────
    const shodan = await getShodanRiskScore();

    // ── 3b. NEWS THREAT INTELLIGENCE ─────────────────────────────────────
    let newsBreachMentions = 0;
    let newsRansomwareMentions = 0;
    let normalizedNewsScore = 0;
    try {
      const rssRes = await fetch('https://feeds.feedburner.com/TheHackersNews', {
        headers: { 'User-Agent': 'Cyberflation.ID/1.0' },
        next: { revalidate: 1800 },
      });
      if (rssRes.ok) {
        const xml = await rssRes.text();
        const parser = new XMLParser({ ignoreAttributes: false });
        const parsed = parser.parse(xml);
        const channel = parsed?.rss?.channel;
        const rawItems = Array.isArray(channel?.item) ? channel.item : channel?.item ? [channel.item] : [];
        const newsItems = rawItems.slice(0, 20).map((item: Record<string, string>) => ({
          title: item.title || '',
          description: typeof item.description === 'string' ? item.description.replace(/<[^>]+>/g, '') : '',
          pubDate: item.pubDate || '',
        }));
        const ta = computeNewsThreat(newsItems);
        normalizedNewsScore = ta.score;
        newsBreachMentions = ta.breakdown?.breach || 0;
        newsRansomwareMentions = ta.breakdown?.ransomware || 0;
      }
    } catch { /* news unavailable */ }

    // ── 3c. GAMBLING INJECTION (SerpAPI dorking) ───────────────────────────
    let gamblingScore = 0;
    let activeInfections = 0;
    let totalInfected = 0;
    try {
      const gambleData = await getGamblingData();
      totalInfected = gambleData.totalInfected || 0;
      activeInfections = gambleData.activeInfections || 0;
      // Score: normalize infected count to 0-100 (797 baseline = 100)
      gamblingScore = Math.min(100, Math.round((activeInfections / 797) * 100));
    } catch { /* gambling data unavailable */ }

    // ── 4. CYBER INFLATION INDEX COMPUTATION ─────────────────────────────
    // Baseline constants
    const BASELINE_INCIDENTS_WEEKLY = 180; // historical weekly average
    const BASELINE_KEV_WEEKLY = 15;       // CISA KEV avg ~15/week

    // Incident Velocity Score (0-100)
    // Compares this week vs last week, normalized
    const incidentVelocity = weekIncidents / BASELINE_INCIDENTS_WEEKLY;
    const prevIncidentVelocity = prevWeekIncidents / BASELINE_INCIDENTS_WEEKLY;
    const incidentAcceleration = prevIncidentVelocity > 0
      ? (incidentVelocity - prevIncidentVelocity) / prevIncidentVelocity
      : 0;
    // Score: 50 base + up to 30 for volume + up to 20 for acceleration
    const incidentScore = Math.min(100, Math.max(0,
      30 +                                    // base participation
      Math.min(30, incidentVelocity * 30) +   // volume component
      Math.min(20, incidentAcceleration * 100) // acceleration component
    ));

    // KEV Velocity Score (0-100)
    // Tracks exploit pressure from CISA KEV
    const kevVelocity = recentKEVs.length / BASELINE_KEV_WEEKLY;
    const kevPrevVelocity = kevPrevWeek.length / BASELINE_KEV_WEEKLY;
    const kevAcceleration = kevPrevVelocity > 0
      ? (kevVelocity - kevPrevVelocity) / kevPrevVelocity
      : 0;
    const kevScore = Math.min(100, Math.max(0,
      20 +                                    // base participation
      Math.min(35, kevVelocity * 35) +        // velocity component
      Math.min(25, kevAcceleration * 50) +    // acceleration (new KEVs/week)
      Math.min(20, (recentKEVs.filter((k: KEVVuln) => k.nvdData?.[0]?.baseScore >= 9.0).length / recentKEVs.length) * 20) // critical KEV fraction
    ));

    // Ransomware Modifier (0-1 multiplier)
    const ransomwareCount = (recentKEVs as KEVVuln[]).filter(
      (k: KEVVuln) => k.knownRansomwareCampaignUse !== 'Unknown'
    ).length;
    const ransomwareFraction = recentKEVs.length > 0 ? ransomwareCount / recentKEVs.length : 0;
    const ransomwareModifier = 1 + ransomwareFraction * 0.3; // up to +30% for ransomware

    // Severity Weight from recent KEV CVSS
    const avgCVSS = recentKEVs.length > 0
      ? (recentKEVs as KEVVuln[]).reduce((sum, k) => sum + (k.nvdData?.[0]?.baseScore || 0), 0) / recentKEVs.length
      : 5.0;
    const severityWeight = Math.min(1.5, 0.5 + (avgCVSS / 10)); // 0.5 at CVSS 0, 1.5 at CVSS 10

    // ── 5. FINAL INDEX ──────────────────────────────────────────────────
    // Weights: Incident=28%, KEV=22%, Shodan=18%, CVSS=12%, News=5%, Gambling=15%
    const rawIndex = (
      (incidentScore * 0.28) +       // incident velocity
      (kevScore * 0.22) +        // KEV velocity from CISA
      (shodan.totalScore * 0.18) +  // Shodan infrastructure risk
      ((avgCVSS / 10) * 100 * 0.12) + // CVSS severity
      (normalizedNewsScore * 0.05) +   // news threat intelligence
      (gamblingScore * 0.15)          // gambling injection (SerpAPI dorking)
    ) * ransomwareModifier * severityWeight;

    const cyberInflationIndex = Math.round(Math.min(100, Math.max(0, rawIndex)));

    // Trend: compare to implicit "last week" index
    const prevIndex = Math.min(100, Math.max(0,
      30 + Math.min(30, prevIncidentVelocity * 30) +
      (prevIncidentVelocity > 0 ? Math.min(20, ((prevIncidentVelocity - weekIncidents/prevWeekIncidents) / prevIncidentVelocity) * 100) : 0)
    )) * 0.45 +
    Math.min(100, Math.max(0, 20 + Math.min(35, kevPrevVelocity * 35))) * 0.40;
    // Compute "last week" index for trend comparison
    const prevWeekKEVVels = kevPrevWeek.length / BASELINE_KEV_WEEKLY;
    const prevWeekKVAvgCVSS = kevPrevWeek.length > 0
      ? kevPrevWeek.reduce((s: number, k: KEVVuln) => s + (k.nvdData?.[0]?.baseScore || 0), 0) / kevPrevWeek.length
      : 5.0;
    const prevWeekKVW = Math.min(1.5, 0.5 + (prevWeekKVAvgCVSS / 10));
    const prevRansomFrac = kevPrevWeek.filter((k: KEVVuln) => k.knownRansomwareCampaignUse !== 'Unknown').length / (kevPrevWeek.length || 1);
    const prevKVModifier = 1 + prevRansomFrac * 0.3;

    const prevRaw = (
      (Math.min(100, Math.max(0, 30 + Math.min(30, prevIncidentVelocity * 30))) * 0.45) +
      (Math.min(100, Math.max(0, 20 + Math.min(35, prevWeekKEVVels * 35))) * 0.40) +
      ((prevWeekKVAvgCVSS / 10) * 100 * 0.15)
    ) * prevKVModifier * prevWeekKVW;
    const prevWeekIndex = Math.round(Math.min(100, Math.max(0, prevRaw)));
    const trend = cyberInflationIndex - prevWeekIndex;

    // Top threats from type breakdown
    const topThreats = typeRows.slice(0, 3).map((t) => t.type.replace('_', ' '));

    return NextResponse.json({
      index: cyberInflationIndex,
      trend,
      status: cyberInflationIndex >= 75 ? 'critical' : cyberInflationIndex >= 55 ? 'high' : cyberInflationIndex >= 40 ? 'medium' : 'low',
      components: {
        incidentScore: Math.round(incidentScore),
        incidentVelocity: { current: weekIncidents, previous: prevWeekIncidents },
        kevScore: Math.round(kevScore),
        kevVelocity: {
          current: recentKEVs.length,
          previous: kevPrevWeek.length,
          totalKEV: 1642,
        },
        shodanScore: shodan.totalScore,
        avgCVSS: Math.round(avgCVSS * 10) / 10,
        ransomwareModifier: Math.round(ransomwareModifier * 100) / 100,
        ransomwareCount,
        severityWeight: Math.round(severityWeight * 100) / 100,
      },
      shodan: {
        totalScore: shodan.totalScore,
        criticalFindings: shodan.criticalFindings,
        highFindings: shodan.highFindings,
        exposures: shodan.summary,
      },
      news: {
        score: normalizedNewsScore,
        breachMentions: newsBreachMentions,
        ransomwareMentions: newsRansomwareMentions,
      },
      gambling: {
        score: gamblingScore,
        activeInfections,
        totalInfected,
      },
      sectorBreakdown: sectorRows,
      severityBreakdown: severityRows,
      statusBreakdown: statusRows,
      typeBreakdown: typeRows,
      topThreats,
      recentKEVs: recentKEVs.slice(0, 5).map((k: KEVVuln) => ({
        cveID: k.cveID,
        vendor: k.nvdData?.[0]?.baseSeverity || 'N/A',
        cvss: k.nvdData?.[0]?.baseScore || 0,
        ransomware: k.knownRansomwareCampaignUse !== 'Unknown',
        dateAdded: k.dateAdded,
      })),
    });

  } catch (err) {
    console.error('Cyber Inflation Index error:', err);
    return NextResponse.json({ error: 'Failed to compute index' }, { status: 500 });
  }
}
