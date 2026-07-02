// Mock data for Cyberflation.ID

export type IncidentType = 'defacement' | 'breach' | 'phishing' | 'online_gambling' | 'malware' | 'ransomware' | 'credential_leak' | 'ddos';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Sector = 'government' | 'education' | 'health' | 'finance' | 'corporate' | 'public';

export interface Incident {
  id: string;
  type: IncidentType;
  domain: string;
  sector: Sector;
  severity: Severity;
  timestamp: Date;
  description: string;
  source: string;
  location: string;
  status: 'active' | 'resolved' | 'monitoring';
}

export interface CyberPressureScore {
  sector: string;
  score: number;
  trend: number;
  status: 'critical' | 'high' | 'medium' | 'low';
  incidents: number;
  topThreat: string;
}

export interface ForecastData {
  date: string;
  predicted: number;
  upper: number;
  lower: number;
  actual?: number;
}

export interface AISuggestion {
  type: 'warning' | 'alert' | 'info' | 'critical';
  title: string;
  description: string;
  sector?: string;
  timestamp: Date;
}

export const SECTORS: { id: Sector; name: string; color: string }[] = [
  { id: 'government', name: 'Government', color: '#ff6b35' },
  { id: 'education', name: 'Education', color: '#3d9eff' },
  { id: 'health', name: 'Health', color: '#ff3d57' },
  { id: 'finance', name: 'Finance', color: '#00ff88' },
  { id: 'corporate', name: 'Corporate', color: '#a855f7' },
  { id: 'public', name: 'Public', color: '#ffc53d' },
];

export const INCIDENT_TYPES: { id: IncidentType; label: string; color: string }[] = [
  { id: 'defacement', label: 'Defacement', color: '#ff6b35' },
  { id: 'breach', label: 'Data Breach', color: '#ff3d57' },
  { id: 'phishing', label: 'Phishing', color: '#ffc53d' },
  { id: 'online_gambling', label: 'Online Gambling', color: '#ffc53d' },
  { id: 'malware', label: 'Malware', color: '#a855f7' },
  { id: 'ransomware', label: 'Ransomware', color: '#ff3d57' },
  { id: 'credential_leak', label: 'Credential Leak', color: '#3d9eff' },
  { id: 'ddos', label: 'DDoS', color: '#ff6b35' },
];

export const INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-7841',
    type: 'defacement',
    domain: 'pemdakotabaru.go.id',
    sector: 'government',
    severity: 'high',
    timestamp: new Date('2026-07-02T14:23:00'),
    description: 'Government website defaced with political message. Homepage replaced with protest text.',
    source: 'Zone-H Mirror',
    location: 'East Kalimantan',
    status: 'monitoring',
  },
  {
    id: 'INC-2026-7840',
    type: 'breach',
    domain: 'rs-medika-jkj.ac.id',
    sector: 'health',
    severity: 'critical',
    timestamp: new Date('2026-07-02T12:15:00'),
    description: 'Patient data leaked on dark web forum. 45,000 records including NIK, address, and medical history.',
    source: 'Dark Web Monitor',
    location: 'Jakarta',
    status: 'active',
  },
  {
    id: 'INC-2026-7839',
    type: 'phishing',
    domain: 'bank-blank.com',
    sector: 'finance',
    severity: 'high',
    timestamp: new Date('2026-07-02T11:02:00'),
    description: 'Phishing domain impersonating popular digital bank. Using valid SSL to deceive victims.',
    source: 'PhishTank + Community Report',
    location: 'Unknown (Offshore)',
    status: 'resolved',
  },
  {
    id: 'INC-2026-7838',
    type: 'credential_leak',
    domain: 'univ-indonesia.ac.id',
    sector: 'education',
    severity: 'medium',
    timestamp: new Date('2026-07-02T09:45:00'),
    description: 'Database containing 2,300 academic staff credentials found on paste site.',
    source: 'Community Report',
    location: 'Java',
    status: 'monitoring',
  },
  {
    id: 'INC-2026-7837',
    type: 'online_gambling',
    domain: 'slotgacor-indo.net',
    sector: 'public',
    severity: 'medium',
    timestamp: new Date('2026-07-02T08:30:00'),
    description: '428 subdomains from legitimate domain used for hosting online gambling content.',
    source: 'BSSN Feed + Community',
    location: 'Various',
    status: 'active',
  },
  {
    id: 'INC-2026-7836',
    type: 'defacement',
    domain: 'dinsan.banyuwangikab.go.id',
    sector: 'government',
    severity: 'medium',
    timestamp: new Date('2026-07-01T22:14:00'),
    description: 'Minor defacement — motivational quote replaced with hacker message.',
    source: 'Zone-H Mirror',
    location: 'East Java',
    status: 'resolved',
  },
  {
    id: 'INC-2026-7835',
    type: 'malware',
    domain: 'plugin-wordpress-xxx.zip',
    sector: 'corporate',
    severity: 'high',
    timestamp: new Date('2026-07-01T18:55:00'),
    description: 'Malicious WordPress plugin distributed via nulled theme sites. Full backdoor installed.',
    source: 'ExploitDB + Community',
    location: 'Digital Distribution',
    status: 'monitoring',
  },
  {
    id: 'INC-2026-7834',
    type: 'ransomware',
    domain: 'pt-.xxx-metal.com',
    sector: 'corporate',
    severity: 'critical',
    timestamp: new Date('2026-07-01T16:40:00'),
    description: 'LockBit 4.0 ransomware encrypted 12TB of manufacturing data. Ransom demand $800k.',
    source: 'CTI Feed',
    location: 'Surabaya',
    status: 'active',
  },
  {
    id: 'INC-2026-7833',
    type: 'ddos',
    domain: 'bps.go.id',
    sector: 'government',
    severity: 'low',
    timestamp: new Date('2026-07-01T14:20:00'),
    description: 'DDoS proto flood 120Gbps for 15 minutes. Layer 7 attack followed.',
    source: 'BSSN CERT',
    location: 'Jakarta',
    status: 'resolved',
  },
  {
    id: 'INC-2026-7832',
    type: 'breach',
    domain: 'marketplace-xxx.id',
    sector: 'corporate',
    severity: 'high',
    timestamp: new Date('2026-07-01T11:00:00'),
    description: '890,000 marketplace user data leaked. Full card data + DOB + email exposed.',
    source: 'Dark Web Monitor',
    location: 'Unknown',
    status: 'active',
  },
];

export const CYBER_PRESSURE_DATA: CyberPressureScore[] = [
  { sector: 'Government', score: 82, trend: 23, status: 'critical', incidents: 147, topThreat: 'Defacement + DDoS' },
  { sector: 'Health', score: 76, trend: 18, status: 'high', incidents: 89, topThreat: 'Data Breach + Ransomware' },
  { sector: 'Education', score: 68, trend: 31, status: 'high', incidents: 203, topThreat: 'Credential Leak + Phishing' },
  { sector: 'Corporate', score: 59, trend: 7, status: 'medium', incidents: 312, topThreat: 'Malware + Ransomware' },
  { sector: 'Public', score: 54, trend: -5, status: 'medium', incidents: 476, topThreat: 'Online Gambling + Phishing' },
  { sector: 'Finance', score: 38, trend: 2, status: 'low', incidents: 64, topThreat: 'Phishing + SMishing' },
];

export const OVERALL_PRESSURE = {
  score: 71,
  trend: 16,
  status: 'high' as const,
  totalIncidents: 1291,
  activeThreats: 23,
  lastUpdated: new Date('2026-07-02T15:00:00'),
};

export function generateForecastData(): ForecastData[] {
  const data: ForecastData[] = [];
  const baseScores = [58, 62, 55, 67, 72, 68, 75, 71, 74, 69, 76, 73, 78, 74, 71, 77, 73, 79, 75, 82, 78, 76, 81, 77, 80, 76, 82, 78, 74, 80];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const predicted = baseScores[i];
    data.push({
      date: date.toISOString().split('T')[0],
      predicted,
      upper: predicted + 8,
      lower: predicted - 8,
      actual: i < 20 ? predicted + (Math.random() * 6 - 3) : undefined,
    });
  }
  return data;
}

export const AI_SUGGESTIONS: AISuggestion[] = [
  {
    type: 'critical',
    title: 'Spike Defacement Domain .go.id',
    description: '340% increase in defacement targeting local government domains detected. Main factor: unpatched legacy CMS exploitation.',
    sector: 'government',
    timestamp: new Date('2026-07-02T14:00:00'),
  },
  {
    type: 'warning',
    title: 'Credential Leak - Education Sector',
    description: '3 new credential leak reports from university domains in the last 24 hours. Mass password rotation recommended.',
    sector: 'education',
    timestamp: new Date('2026-07-02T12:30:00'),
  },
  {
    type: 'alert',
    title: 'Ransomware Campaign - Manufacturing Sector',
    description: 'Increasing ransomware activity targeting manufacturing. LockBit 4.0 variant detected in 2 victims.',
    sector: 'corporate',
    timestamp: new Date('2026-07-02T10:00:00'),
  },
  {
    type: 'info',
    title: 'CVE-2026-4428 Being Exploited',
    description: 'Critical RCE vulnerability in Spring Framework is actively exploited. Patch immediately.',
    timestamp: new Date('2026-07-02T08:00:00'),
  },
];

export const THREAT_TYPE_STATS = [
  { type: 'Defacement', count: 423, percentage: 32.7, color: '#ff6b35' },
  { type: 'Phishing/Online Gambling', count: 389, percentage: 30.1, color: '#ffc53d' },
  { type: 'Malware', count: 187, percentage: 14.5, color: '#a855f7' },
  { type: 'Data Breach', count: 134, percentage: 10.4, color: '#ff3d57' },
  { type: 'Credential Leak', count: 98, percentage: 7.6, color: '#3d9eff' },
  { type: 'Ransomware', count: 60, percentage: 4.6, color: '#ff3d57' },
];

export const WEEKLY_TREND = [
  { day: 'Mon', incidents: 142, inflation: 58 },
  { day: 'Tue', incidents: 167, inflation: 62 },
  { day: 'Wed', incidents: 153, inflation: 60 },
  { day: 'Thu', incidents: 198, inflation: 67 },
  { day: 'Fri', incidents: 231, inflation: 72 },
  { day: 'Sat', incidents: 189, inflation: 68 },
  { day: 'Sun', incidents: 211, inflation: 71 },
];
