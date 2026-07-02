// KEVin API - CISA Known Exploited Vulnerabilities catalog
// Base URL: https://kevin.gtfkd.com

const KEVIN_BASE = 'https://kevin.gtfkd.com';
const RATE_LIMIT_MS = 500; // 2 RPS max

let lastCall = 0;

async function kevinFetch(path: string): Promise<unknown> {
  const now = Date.now();
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastCall));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();

  const res = await fetch(`${KEVIN_BASE}${path}`, {
    headers: { 'User-Agent': 'Cyberflation.ID/1.0' },
    next: { revalidate: 3600 }, // cache 1 hour
  });
  if (!res.ok) throw new Error(`KEVin API error: ${res.status}`);
  return res.json();
}

export interface KEVVulnerability {
  cveID: string;
  dateAdded: string;
  dueDate: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  shortDescription: string;
  requiredAction: string;
  notes: string;
  nvdData: NVDData[];
  githubPocs: string[];
  knownRansomwareCampaignUse: string;
}

export interface NVDData {
  attackVector: string;
  attackComplexity: string;
  baseSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  baseScore: number;
  exploitabilityScore: number;
  vulnStatus: string;
}

export interface Metrics {
  cves_count: number;
  kevs_count: number;
}

export async function getMetrics(): Promise<Metrics> {
  const data = await kevinFetch('/get_metrics') as Metrics;
  return data;
}

export async function getRecentKEVs(days = 7): Promise<KEVVulnerability[]> {
  return kevinFetch(`/kev/recent?days=${days}`) as Promise<KEVVulnerability[]>;
}

export async function searchKEVs(query: string, perPage = 10): Promise<{ vulnerabilities: KEVVulnerability[]; total: number }> {
  const data = await kevinFetch(`/kev?search=${encodeURIComponent(query)}&per_page=${perPage}`) as {
    vulnerabilities: KEVVulnerability[];
    total_vulns: number;
  };
  return { vulnerabilities: data.vulnerabilities, total: data.total_vulns };
}

export async function getKEV(cveId: string): Promise<KEVVulnerability | null> {
  try {
    return await kevinFetch(`/kev/${cveId}`) as KEVVulnerability;
  } catch {
    return null;
  }
}
