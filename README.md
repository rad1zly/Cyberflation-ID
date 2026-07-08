# Cyberflation.ID

> **Cyber Risk Inflation Early Warning Platform for Indonesia**

![Status](https://img.shields.io/badge/status-hackathon--July%202026-blue)
![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%7C%20React%2019%20%7C%20TypeScript%20%7C%20Tailwind-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 What Is This?

**Cyberflation.ID** is an early warning platform that tracks and quantifies cyber risk inflation in Indonesia — combining real-time OSINT feeds, CISA KEV exploit data, infrastructure exposure scanning, and AI-powered threat analysis into a single **Cyber Inflation Index** (0–100).

Think of it like an **inflation index for cybersecurity threats** — when the index spikes, it means cyber risk is "inflating" (escalating rapidly), giving organizations and decision-makers a data-driven signal to act before incidents spike.

> **Use case**: A Bank SOC team monitors the index → sees it jump +15 points in a week → proactively hardens RDP-facing servers because Shodan exposure + ransomware news are both trending up.

---

## 🔍 Features

### Dashboard
- **Cyber Inflation Index** (0–100) — computed daily from 6 live data sources
- **5-Factor Scoring Model**: Incident Velocity (33%) + KEV Exploits (27%) + Shodan Exposure (20%) + CVSS Severity (15%) + News Threat (5%)
- **Weekly trend** (+/- change vs last week)
- **Severity breakdown** and risk status label (LOW / MODERATE / HIGH / CRITICAL)
- **Shodan Infrastructure Exposure** — live scan results for Indonesia (MongoDB, Redis, RDP, SMB, MySQL, Elasticsearch)
- **KEV Exploits** — real-time CISA Known Exploited Vulnerabilities feed
- **AI Threat Alerts** — auto-generated alerts when multiple threat vectors align

### Online Gambling OSINT
- **Google Dorking via SerpAPI** — automated scanning for gambling injection in Indonesian government & education websites
- **5 Sector Coverage**: .go.id (Government), .ac.id (Academic), .sch.id (School), .or.id (Organization), .desa.id (Village)
- **Top Injector Domains** — most active gambling domains used to inject Indonesian websites
- **Sector Distribution** — Pie/Bar chart showing which sectors are most targeted
- **VirusTotal + AbuseIPDB** links for every injector domain
- **Source**: SerpAPI (100 free searches/month) · Falls back to cached data
- **Stats**: Total infected (797), Active infections (765), Cleaned (32), Worst sector

### Online Gambling OSINT
- **Google Dorking via SerpAPI** — automated OSINT scanner for gambling injection in Indonesian government & education websites
- **5 Sector Coverage**: .go.id (Government), .ac.id (Academic), .sch.id (School), .or.id (Organization), .desa.id (Village)
- **Top Injector Domains** — most active slot gambling domains used to inject Indonesian websites (100% from SerpAPI dorking)
- **Sector Distribution** — Pie/Bar chart showing which sectors are most targeted
- **VirusTotal + AbuseIPDB** lookup links for every injector domain
- **Stats**: Total Infected, Active Infections, Cleaned, Worst Sector
- **Source**: SerpAPI (100 free searches/month) · Falls back to cached data

### Incident Feed
- **530+ Indonesian cyber incidents** seeded historically (90 days)
- Filterable by **sector**, **incident type**, **severity**, **status**
- Full-text search across title and description
- Pagination (20 items/page)

### AI Analyst
- Chat interface powered by **Fireworks AI (DeepSeek V4 Pro)**
- Scope-guarded system prompt — only answers cyber risk / Indonesia cybersecurity topics
- Can analyze incidents, KEVs, Shodan findings, and threat trends

### Cyber News
- Aggregated RSS feeds: **The Hacker News**, **Krebs on Security**, **Dark Reading**, **BleepingComputer**
- **Threat keyword analysis** — each article scored for: breach, ransomware, vulnerability, malware, phishing, geopolitics
- **News Threat Intelligence panel** — aggregated score, breakdown, high-alert headlines
- **News contributes to index** (5% weight via THN RSS feed)

### Sector Analysis
- Per-sector risk breakdown for Indonesia's 10 critical sectors:
  - Government, Financial Services, Healthcare, Education, Energy, Transportation, Telecommunications, Manufacturing, Retail, Entertainment
- Risk score per sector with incident distribution

### Forecast
- 30-day projection based on current velocity and seasonal patterns
- Threat trajectory visualization

### Submit Report
- Community-powered incident reporting
- Crowdsourced data helps fill OSINT gaps

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                  │
│  Dashboard │ AI Analyst │ Incident Feed │ Cyber News   │
│  Sectors   │ Forecast   │ Submit Report │              │
└────────────┬───────────────────────────────────────────┘
             │ fetch /api/*
┌────────────▼───────────────────────────────────────────┐
│                  API Routes (Next.js)                    │
│  /api/cyberinflationindex  /api/incidents               │
│  /api/kevin               /api/news                      │
└────────────┬───────────────────────────────────────────┘
             │
  ┌──────────┼───────────────────────────────────────┐
  │          │                                       │
  ▼          ▼                                       ▼
SQLite DB  KEVin API  Shodan API  Fireworks AI  RSS Feeds
(better-   (CISA KEV  (Infrastructure  (AI Chat)   (THN/Krebs/
 sqlite3)    Proxy)     Exposure)                DarkReading/
                                                     BleepingComputer)
```

---

## 📊 Cyber Inflation Index Methodology

The index is a **weighted multi-factor model** outputting 0–100:

| Factor | Weight | Data Source | Description |
|--------|--------|-------------|-------------|
| **Incident Velocity** | 28% | SQLite DB (crowdsourced + OSINT) | Current week incidents vs 90-day baseline |
| **KEV Velocity** | 22% | CISA KEV via KEVin API | New exploits added this week vs historical average |
| **Shodan Exposure** | 18% | Shodan API | Infrastructure exposure count in Indonesia |
| **CVSS Severity** | 12% | CISA KEV | Average CVSS score of recent KEVs |
| **News Threat** | 5% | The Hacker News RSS | Threat keyword density in cyber news |
| **Gambling Injection** | 15% | SerpAPI Google Dorking | Active gambling injector domains targeting Indonesian websites |

### Index Formula
```
Raw = (IncidentScore × 0.33) + (KEVScore × 0.27) + (ShodanScore × 0.20) + (CVSSScore × 0.15) + (NewsScore × 0.05)
Index = clamp(Raw × RansomwareModifier × SeverityWeight, 0, 100)
```

**Ransomware Modifier**: +30% boost if >20% of recent KEVs involve known ransomware campaigns.
**Severity Weight**: Scales from 0.5 (CVSS 0) to 1.5 (CVSS 10).

### Status Thresholds
| Index Range | Status |
|-------------|--------|
| 0–30 | 🟢 LOW |
| 31–50 | 🟡 MODERATE |
| 51–70 | 🟠 HIGH |
| 71–100 | 🔴 CRITICAL |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS |
| Database | SQLite + better-sqlite3 + Drizzle ORM |
| AI | Fireworks AI (DeepSeek V4 Pro) (OpenAI-compatible API) |
| Styling | CSS Variables (dark/light theme) |
| XML Parsing | fast-xml-parser |
| Charts | chart_template.py (matplotlib, OHLC) |
| OSINT | KEVin API, Shodan API, RSS feeds |

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Environment Variables

Create `.env.local` in the project root:

```env
# Fireworks AI (OpenAI-compatible endpoint)
FIREWORKS_API_KEY=your_fireworks_api_key_here
FIREWORKS_BASE_URL=https://api.fireworks.ai/v1
FIREWORKS_MODEL=accounts/fireworks/models/deepseek-v4-pro

# Shodan (infrastructure exposure scanning)
SHODAN_API_KEY=your_shodan_api_key

# KEVin API (CISA KEV proxy — free)
KEVIN_API_BASE=https://kevin.gtfkd.com

# Public base URL (for server-side API calls)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Installation

```bash
cd cyberflation
npm install

# Seed the database with sample incidents
npx tsx scripts/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start -- --port 3001
```

---

## 📁 Project Structure

```
cyberflation/
├── .env.local.example       # Environment variable template
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── cyberflation.db          # SQLite database (generated after seed)
├── scripts/
│   └── seed.ts              # Database seeder (530+ incidents)
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── chat/               # Fireworks AI chat endpoint
    │   │   ├── cyberinflationindex/ # Index computation engine
    │   │   ├── incidents/           # Paginated incident DB query
    │   │   ├── kevin/               # CISA KEV proxy endpoint
    │   │   └── news/                # RSS aggregation + threat analysis
    │   ├── globals.css              # Theme variables (dark/light)
    │   ├── layout.tsx
    │   └── page.tsx                 # View router
    ├── components/
    │   ├── Header.tsx               # Nav + theme toggle + alert bell
    │   ├── Sidebar.tsx              # Navigation menu
    │   ├── Dashboard.tsx             # Hero index card + live data cards
    │   ├── KEVExploits.tsx          # CISA KEV live feed card
    │   ├── AIAnalyst.tsx            # Chat interface
    │   ├── IncidentFeed.tsx         # Filterable incident list
    │   ├── News.tsx                 # RSS news + threat analysis
    │   ├── Sectors.tsx              # Per-sector risk breakdown
    │   ├── Forecast.tsx             # 30-day projection
    │   └── ReportForm.tsx          # Community submission form
    └── lib/
        ├── db/
        │   ├── index.ts             # better-sqlite3 connection
        │   └── schema.ts            # Drizzle ORM schema
        ├── kevin.ts                 # KEVin API service layer
        ├── shodan.ts                # Shodan API + 1hr cache
        ├── newsThreat.ts            # Shared news keyword analysis
        ├── mockData.ts              # Fallback static data
        └── utils.ts                 # Helpers (formatDate, timeAgo, cn)
```

---

## 🌐 Data Sources

| Source | Type | Coverage | Refresh |
|--------|------|----------|---------|
| **KEVin API** | CISA KEV exploits | Global + Indonesia-relevant | ~realtime |
| **Shodan API** | Infrastructure exposure | Indonesia IP ranges | 1-hour cache |
| **The Hacker News** | RSS feed | Global cyber news | 30-min cache |
| **Krebs on Security** | RSS feed | Global cyber news | 30-min cache |
| **Dark Reading** | RSS feed | Global cyber news | 30-min cache |
| **BleepingComputer** | RSS feed | Global cyber news | 30-min cache |
| **SerpAPI** | Google Dorking | Indonesia sector queries | 100 searches/month |
| **Crowdsourced Incidents** | SQLite DB | Indonesia-focused | On-submission |

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `FIREWORKS_API_KEY`
- `FIREWORKS_BASE_URL`
- `FIREWORKS_MODEL`
- `SHODAN_API_KEY`
- `KEVIN_API_BASE`
- `NEXT_PUBLIC_BASE_URL`

### Railway / Render

- Set build command: `npm run build`
- Set start command: `npm start`
- Add all environment variables above

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔒 Security Notes

- API keys are stored in environment variables — never committed to git
- The AI chat scope is hardcoded to reject out-of-scope questions
- SQLite database is local to the server instance
- Shodan API is rate-limited (Dev plan: 100 credits/month) — cached aggressively

---

## 📄 License

MIT — built for the Indonesia Cybersecurity Hackathon July 2026.

---

## 👤 Author

**Cyberflation.ID** — Early Warning Platform for Indonesian Cyber Risk Inflation.

Built with 💻 for the Indonesia cybersecurity community.
