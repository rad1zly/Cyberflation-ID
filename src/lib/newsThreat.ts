// News threat keyword analysis
// Used both by /api/news (to display) and /api/cyberinflationindex (to score)

export const NEWS_THREAT_KEYWORDS = {
  breach: { keywords: ['breach', 'leaked', 'data leak', 'stolen data', 'exposed'], weight: 3 },
  ransomware: { keywords: ['ransomware', 'ransom', 'encrypted', 'lockbit', 'blackcat', 'hive', 'conti'], weight: 3 },
  vulnerability: { keywords: ['vulnerability', 'cve-', 'zero-day', 'zero day', 'exploit', 'patch critical', 'unpatched'], weight: 2 },
  malware: { keywords: ['malware', 'trojan', 'backdoor', 'rootkit', 'infostealer', 'rat '], weight: 2 },
  phishing: { keywords: ['phishing', 'credential theft', 'social engineering', 'spear phishing'], weight: 1 },
  geopolitics: { keywords: ['apt', 'nation-state', 'china', 'russia', 'iran', 'north korea', 'hacker group', 'state-sponsored'], weight: 1 },
};

export interface ThreatResult {
  score: number;
  rawScore: number;
  totalArticles: number;
  matchedArticles: number;
  breakdown: Record<string, number>;
  recentAlerts: string[];
}

export function computeNewsThreat(items: Array<{ title: string; description: string; pubDate: string }>): ThreatResult {
  const now = Date.now();
  const oneDay = 86400000;
  let totalScore = 0;
  const breakdown: Record<string, number> = {};
  const recentAlerts: string[] = [];

  for (const item of items) {
    const text = `${item.title} ${item.description}`.toLowerCase();
    let itemScore = 0;
    const matched: string[] = [];

    for (const [name, cfg] of Object.entries(NEWS_THREAT_KEYWORDS) as [string, { keywords: string[]; weight: number }][]) {
      if (cfg.keywords.some((kw) => text.includes(kw))) {
        itemScore += cfg.weight;
        matched.push(name);
        breakdown[name] = (breakdown[name] || 0) + 1;
      }
    }

    // Time decay
    const age = now - (new Date(item.pubDate).getTime() || now);
    if (age > 2 * oneDay) itemScore *= 0.25;
    else if (age > oneDay) itemScore *= 0.5;

    totalScore += itemScore;
    if (matched.length > 0 && itemScore >= 3) {
      recentAlerts.push(item.title.substring(0, 80));
    }
  }

  // Normalize: ~150 raw score = 100
  const normalized = Math.min(100, Math.round((totalScore / 150) * 100));
  const matchedArticles = Object.values(breakdown).reduce((s, v) => s + (v > 0 ? 1 : 0), 0);

  return {
    score: normalized,
    rawScore: totalScore,
    totalArticles: items.length,
    matchedArticles,
    breakdown,
    recentAlerts: recentAlerts.slice(0, 5),
  };
}
