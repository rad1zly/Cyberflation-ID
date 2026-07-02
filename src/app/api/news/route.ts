import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { computeNewsThreat } from '@/lib/newsThreat';

const RSS_FEEDS = [
  {
    name: 'The Hacker News',
    url: 'https://feeds.feedburner.com/TheHackersNews',
    color: '#ff6b35',
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    color: '#ff3d57',
  },
  {
    name: 'Dark Reading',
    url: 'https://www.darkreading.com/rss.xml',
    color: '#3d9eff',
  },
  {
    name: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/feed/',
    color: '#00ff88',
  },
];

// Cache for 30 minutes
let newsCache: { items: NewsItem[]; expires: number } | null = null;

export interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  sourceColor: string;
  category?: string;
}

async function fetchFeed(feed: { name: string; url: string; color: string }): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Cyberflation.ID/1.0' },
      next: { revalidate: 1800 }, // cache 30 min
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml);

    // RSS 2.0 format
    const channel = parsed?.rss?.channel;
    if (!channel) return [];

    const items = Array.isArray(channel.item)
      ? channel.item
      : channel.item
        ? [channel.item]
        : [];

    return items.slice(0, 20).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || 'No title',
      link: (item.link as string) || '#',
      description: typeof item.description === 'string'
        ? item.description.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
        : '',
      pubDate: (item.pubDate as string) || ((item['@_'] as Record<string, unknown>)?.pubDate as string) || '',
      source: feed.name,
      sourceColor: feed.color,
      category: (Array.isArray(item.category) ? item.category[0] : item.category) as string || '',
    }));
  } catch (err) {
    console.error(`Failed to fetch ${feed.name}:`, err);
    return [];
  }
}

export async function GET() {
  // Return cached if valid
  if (newsCache && newsCache.expires > Date.now()) {
    return NextResponse.json(newsCache.items);
  }

  try {
    const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
    const items = results.flat().sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });

    // Compute threat analysis from news using shared utility
    const cleanItems = items.map(item => ({
      title: item.title,
      description: item.description,
      pubDate: item.pubDate,
    }));
    const threatResult = computeNewsThreat(cleanItems);

    const newsItemsWithScore = items.map(item => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      const matchedTypes: string[] = [];
      for (const [name, cfg] of Object.entries({
        breach: { keywords: ['breach', 'leaked', 'data leak', 'stolen data', 'exposed'], weight: 3 },
        ransomware: { keywords: ['ransomware', 'ransom', 'encrypted', 'lockbit', 'blackcat'], weight: 3 },
        vulnerability: { keywords: ['vulnerability', 'cve-', 'zero-day', 'zero day', 'exploit', 'patch'], weight: 2 },
        phishing: { keywords: ['phishing', 'credential', 'social engineering', 'spam'], weight: 1 },
        malware: { keywords: ['malware', 'trojan', 'backdoor', 'rootkit', 'infostealer'], weight: 2 },
        geopolitics: { keywords: ['apt', 'nation-state', 'china', 'russia', 'iran', 'korea', 'hacker group'], weight: 1 },
      })) {
        if (cfg.keywords.some((kw: string) => text.includes(kw))) {
          matchedTypes.push(name);
        }
      }
      return { ...item, threatTypes: matchedTypes };
    });

    newsCache = { items: newsItemsWithScore.slice(0, 30), expires: Date.now() + 30 * 60 * 1000 };

    return NextResponse.json({
      items: newsItemsWithScore,
      threatAnalysis: {
        score: threatResult.score,
        rawScore: threatResult.rawScore,
        totalArticles: threatResult.totalArticles,
        matchedArticles: threatResult.matchedArticles,
        breakdown: threatResult.breakdown,
        recentAlerts: threatResult.recentAlerts,
      },
    });
  } catch (err) {
    console.error('News API error:', err);
    return NextResponse.json([]);
  }
}
