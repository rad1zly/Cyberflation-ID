/**
 * Seed script — generates 500+ realistic Indonesian cyber incidents
 * Run: npx tsx scripts/seed.ts
 */
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'cyberflation.db');
const sqlite = new Database(DB_PATH);

// Create tables directly
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    domain TEXT NOT NULL,
    sector TEXT NOT NULL,
    severity TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    description TEXT NOT NULL,
    source TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL
  );
`);

type IncidentRecord = {
  id: string;
  type: string;
  domain: string;
  sector: string;
  severity: string;
  timestamp: Date;
  description: string;
  source: string;
  location: string;
  status: string;
};

// Indonesian domains and organizations
const GOVERNMENT_DOMAINS = [
  'pemda-jateng.go.id', 'dinsos-jabar.go.id', 'pemkot-surabaya.go.id',
  'bpbd-makassar.go.id', 'rsud-samarinda.go.id', 'kemendagri.go.id',
  'bps.go.id', 'bssn.go.id', 'polri.go.id', 'tnik-tni.go.id',
  'pemdakotabaru.go.id', 'dinsan.banyuwangikab.go.id', 'kpud-semarang.go.id',
  'lpse-lampung.go.id', 'bappeda-bali.go.id', 'dispendik-surabaya.go.id',
  'rsud-dr-soetomo.go.id', 'bpjs-ketenagakerja.go.id', 'kemenkumham.go.id',
  'djpb.kemenkeu.go.id', 'bpk.go.id', 'mahkamahkonstitusi.go.id',
  'bkpm.go.id', 'pom.go.id', 'klhk.go.id', 'pip.go.id',
  'kemenag.go.id', 'ristekbrin.go.id', 'bmkg.go.id',
  'dishub-jakarta.go.id', 'perhubunganri.go.id', 'atrbpn.go.id',
  'pupr.go.id', 'pu.go.id', 'pertanian.go.id', 'ketahananpangan.go.id',
];

const EDUCATION_DOMAINS = [
  'univ-indonesia.ac.id', 'ugm.ac.id', 'itb.ac.id', 'ui.ac.id',
  'unpad.ac.id', 'undip.ac.id', 'its.ac.id', 'ipb.ac.id',
  'binus.ac.id', 'unair.ac.id', 'uinsby.ac.id', 'uinjkt.ac.id',
  'unhas.ac.id', 'ugm.ac.id', 'unnes.ac.id', 'unipa.ac.id',
  'unram.ac.id', 'uncen.ac.id', ' unp.ac.id', 'untan.ac.id',
  'unika.ac.id', 'atmajaya.ac.id', 'petra.ac.id', 'widya.ac.id',
  'polban.ac.id', 'polinema.ac.id', 'polnes.ac.id', 'pnj.ac.id',
  'sei.ac.id', 'ittelkom-sby.ac.id', 'ittelkom-dgt.ac.id',
  'smkn1-sby.sch.id', 'sman8-jkt.sch.id', 'smak1-jkt.sch.id',
  'bsi.ac.id', 'utm.ac.id', 'unar.ac.id', 'iai.ac.id',
];

const HEALTH_DOMAINS = [
  'rs-medika-jkj.ac.id', 'rsud-ciamis.go.id', 'rsud-tangerang.go.id',
  'rsud-ponorogo.go.id', 'rsud-mojokerto.go.id', 'rsud-tulungagung.go.id',
  'rsup-hasanuddin.go.id', 'rsup-nasional.go.id', 'rsup-soedono.go.id',
  'rskgm-jabar.go.id', 'rskia-jakarta.go.id', 'rsjkt-manado.go.id',
  'labkesda-jatim.go.id', 'binfunglapkesda.go.id', 'puskesmas-kelurahan.go.id',
  'dinkes-sulsel.go.id', 'dinkes-jateng.go.id', 'dinkes-dki.go.id',
  'bpjs-kesehatan.go.id', 'kemenkes.go.id', 'iot.kemenkes.go.id',
];

const FINANCE_DOMAINS = [
  'bank-blank.com', 'mandirisyariah.co.id', 'bsm.co.id',
  'btn.co.id', 'btnmu.co.id', 'bni.co.id', 'bri.co.id', 'btpn.co.id',
  'ojk.go.id', 'bi.go.id', 'be Clearing.go.id', 'idx.co.id',
  'ksei.co.id', 'ksei.co.id', 'astraj逃金光.co.id', 'pintu.co.id',
  'tokocrypto.co.id', 'indodax.com', 'coinco88.com',
  'pln.co.id', ' Pertamina.co.id', 'pgas.co.id',
  'asabri.co.id', 'taspen.co.id', 'jamsostek.co.id',
];

const CORPORATE_DOMAINS = [
  'pt-.xxx-metal.com', 'marketplace-xxx.id', 'plugin-wordpress-xxx.zip',
  'cv-teknologi-indonesia.com', 'pt-haritage-energy.com',
  'pt-indobalt-processing.com', 'cv-mitra-design.com',
  'pt-logistik-nusantara.com', 'pt-pertamina-cns.com',
  'cv-sukses-makmur.com', 'pt-energi-mandiri.com',
  'pt-fashion-express.com', 'cv-kreatif-media.com',
  'pt-pharmaceutical-ind.com', 'pt-chemicals-intl.com',
  'pt-automotive-tech.com', 'pt-construction corp.com',
  'pt-mining-resources.com', 'pt-agriculture-ind.com',
  'pt-textile-mills.com', 'pt-electronic-sys.com',
  'pt-packaging-ind.com', 'pt-plastic-tech.com',
  'pt-food-beverages.com', 'pt-wood-industry.com',
  'pt-metal-fabrication.com', 'pt-rubber-products.com',
  'pt-glass-ceramics.com', 'pt-chemical-dist.com',
];

const PUBLIC_DOMAINS = [
  'slotgacor-indo.net', 'togel88-wla.net', 'kasino-vip-online.net',
  'judol-premium.net', 'poker-online-terbaik.net', 'domino-qq-888.net',
  'bandar-togel-sgp.net', 'casino-live-24.net', 'slot88-gacor-new.net',
  'promo-judol-harian.net', 'bonus-depo-50ribu.net', 'app-slot-vip.net',
  'web-phising-bank.net', 'login- bank-saya.com', 'verif-akun-dana.com',
  'update-data-wallet.com', 'konfirmasi-paket-kena.com',
  'forum-darkweb-id.onion', 'market-leak-data.onion',
];

const TYPES = ['defacement', 'breach', 'phishing', 'online_gambling', 'malware', 'ransomware', 'credential_leak', 'ddos']
const SECTORS = ['government', 'education', 'health', 'finance', 'corporate', 'public']
const SEVERITIES = ['critical', 'high', 'medium', 'low']
const STATUSES = ['active', 'resolved', 'monitoring']
const SOURCES = ['Zone-H Mirror', 'Dark Web Monitor', 'PhishTank + Community Report', 'Community Report', 'BSSN Feed + Community', 'ExploitDB + Community', 'CTI Feed', 'BSSN CERT', 'CISA KEV', 'KEVin API', 'Vulnerability Scanner'];

const LOCATIONS = ['Jakarta', 'Surabaya', 'Bandung', 'Semarang', 'Makassar', 'Medan', 'Palembang', 'Tangerang', 'Depok', 'Bekasi', 'Yogyakarta', 'Malang', 'Solo', 'Bogor', 'Denpasar', 'Manado', 'Pontianak', 'Samarinda', 'Banjarmasin', 'Kupang', 'Jayapura', 'Ambon', 'Lombok', 'Sumatra', 'Java', 'Kalimantan', 'Sulawesi', 'Papua', 'Bali', 'Various', 'Unknown (Offshore)', 'Digital Distribution'];

const DEFACEMENT_MESSAGES = [
  'Government website defaced with political message. Homepage replaced with protest text.',
  'Minor defacement — motivational quote replaced with hacker message.',
  'Website defaced by hacktivist group. Indonesia-themed message displayed.',
  'Defacement via unpatched WordPress plugin. Shell uploaded to uploads folder.',
  'DNS hijack resulting in defacement on all subdomains.',
  'C-panel compromise leading to website defacement.',
  'SQL injection exploited to deface government portal.',
  'Phishing page injected into legitimate government domain.',
];

const PHISHING_DESCRIPTIONS = [
  'Phishing domain impersonating popular digital bank. Using valid SSL to deceive victims.',
  'Fake login page mimicking national e-government portal. Harvesting credentials.',
  'SMS phishing campaign targeting banking customers. Domain spoofing legitimate brand.',
  'Email phishing targeting corporate executives. BEC-style attack.',
  'Clone of popular e-commerce site collecting payment card data.',
  'Phishing kit found on compromised WordPress site.',
];

const BREACH_DESCRIPTIONS = [
  'Patient data leaked on dark web forum. 45,000 records including NIK, address, and medical history.',
  '890,000 marketplace user data leaked. Full card data + DOB + email exposed.',
  'Employee database containing HR records posted on hacker forum.',
  'Source code of proprietary application leaked on dark web marketplace.',
  'Customer PII including national ID numbers exposed via misconfigured S3 bucket.',
  'Internal communications and contracts leaked via exposed Git repository.',
];

const MALWARE_DESCRIPTIONS = [
  'Malicious WordPress plugin distributed via nulled theme sites. Full backdoor installed.',
  'RAT (Remote Access Trojan) distributed via compromised email attachment.',
  'Cryptominer injected into government web servers via unpatched vulnerability.',
  'Infostealer malware targeting cryptocurrency wallet browsers.',
  'Dridex banking trojan campaign targeting corporate banking users.',
  'Emotet malware resurfaces with new delivery mechanism via Excel macros.',
];

const RANSOMWARE_DESCRIPTIONS = [
  'LockBit 4.0 ransomware encrypted 12TB of manufacturing data. Ransom demand $800k.',
  'BlackCat ransomware attack on hospital IT systems. Patient records encrypted.',
  'Hive ransomware targeting financial services. Backup systems also encrypted.',
  'Conti ransomware group exfiltrated 50GB of corporate documents.',
  'Clop ransomware exploiting zero-day in file transfer software.',
  'WannaCry-style attack on regional government networks.',
];

const CREDENTIAL_LEAK_DESCRIPTIONS = [
  'Database containing 2,300 academic staff credentials found on paste site.',
  '1.2M usernames and passwords leaked from gaming platform.',
  'Corporate VPN credentials posted on dark web forum.',
  'AWS keys and credentials exposed in public GitHub repository.',
  'Email phishing campaign resulted in 340+ faculty credentials being compromised.',
];

const DDOS_DESCRIPTIONS = [
  'DDoS proto flood 120Gbps for 15 minutes. Layer 7 attack followed.',
  'Mirai-style botnet attack on ISP infrastructure. 500Gbps volumetric attack.',
  'Memcached amplification attack targeting financial exchange.',
  'SYN flood targeting government emergency response systems.',
  'Application-layer DDoS rendering public services unavailable.',
];

const ONLINE_GAMBLING_DESCRIPTIONS = [
  '428 subdomains from legitimate domain used for hosting online gambling content.',
  'Investment-themed gambling platform hosted on compromised corporate server.',
  'Online gambling aggregator domain using fast-flux DNS.',
  'Mobile gambling app APK distributed via compromised Indonesian app store.',
  'Cross-site scripting vulnerability used to inject gambling links into legitimate sites.',
];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getDateOffset = (daysBack: number): Date => {
  const d = new Date('2026-07-02T12:00:00Z');
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
};

function generateIncidents(): IncidentRecord[] {
  const records: IncidentRecord[] = [];
  let counter = 7900;

  // Generate 520 incidents
  for (let i = 0; i < 520; i++) {
    const type = getRandom(TYPES);
    const sector = getRandom(SECTORS);
    const severity = getRandom(SEVERITIES);
    const status = getRandom(STATUSES);
    const timestamp = getDateOffset(90);
    counter++;

    let domain = '';
    let description = '';

    switch (type) {
      case 'defacement':
        domain = getRandom(GOVERNMENT_DOMAINS);
        description = getRandom(DEFACEMENT_MESSAGES);
        break;
      case 'phishing':
        domain = getRandom(FINANCE_DOMAINS);
        description = getRandom(PHISHING_DESCRIPTIONS);
        break;
      case 'breach':
        domain = getRandom([...GOVERNMENT_DOMAINS, ...HEALTH_DOMAINS, ...CORPORATE_DOMAINS].slice(0, 50));
        description = getRandom(BREACH_DESCRIPTIONS);
        break;
      case 'malware':
        domain = getRandom(CORPORATE_DOMAINS);
        description = getRandom(MALWARE_DESCRIPTIONS);
        break;
      case 'ransomware':
        domain = getRandom([...GOVERNMENT_DOMAINS.slice(0, 10), ...CORPORATE_DOMAINS.slice(0, 10)]);
        description = getRandom(RANSOMWARE_DESCRIPTIONS);
        break;
      case 'credential_leak':
        domain = getRandom(EDUCATION_DOMAINS);
        description = getRandom(CREDENTIAL_LEAK_DESCRIPTIONS);
        break;
      case 'ddos':
        domain = getRandom(GOVERNMENT_DOMAINS.slice(0, 15));
        description = getRandom(DDOS_DESCRIPTIONS);
        break;
      case 'online_gambling':
        domain = getRandom(PUBLIC_DOMAINS);
        description = getRandom(ONLINE_GAMBLING_DESCRIPTIONS);
        break;
    }

    records.push({
      id: `INC-2026-${counter}`,
      type,
      domain,
      sector,
      severity,
      timestamp,
      description,
      source: getRandom(SOURCES),
      location: getRandom(LOCATIONS),
      status,
    });
  }

  // Add the 10 specific incidents from mock data (with slight variations)
  const specificIncidents: IncidentRecord[] = [
    { id: 'INC-2026-7841', domain: 'pemdakotabaru.go.id', sector: 'government', severity: 'high', status: 'monitoring', type: 'defacement', description: 'Government website defaced with political message. Homepage replaced with protest text.', source: 'Zone-H Mirror', location: 'East Kalimantan', timestamp: new Date('2026-07-02T14:23:00') },
    { id: 'INC-2026-7840', domain: 'rs-medika-jkj.ac.id', sector: 'health', severity: 'critical', status: 'active', type: 'breach', description: 'Patient data leaked on dark web forum. 45,000 records including NIK, address, and medical history.', source: 'Dark Web Monitor', location: 'Jakarta', timestamp: new Date('2026-07-02T12:15:00') },
    { id: 'INC-2026-7839', domain: 'bank-blank.com', sector: 'finance', severity: 'high', status: 'resolved', type: 'phishing', description: 'Phishing domain impersonating popular digital bank. Using valid SSL to deceive victims.', source: 'PhishTank + Community Report', location: 'Unknown (Offshore)', timestamp: new Date('2026-07-02T11:02:00') },
    { id: 'INC-2026-7838', domain: 'univ-indonesia.ac.id', sector: 'education', severity: 'medium', status: 'monitoring', type: 'credential_leak', description: 'Database containing 2,300 academic staff credentials found on paste site.', source: 'Community Report', location: 'Java', timestamp: new Date('2026-07-02T09:45:00') },
    { id: 'INC-2026-7837', domain: 'slotgacor-indo.net', sector: 'public', severity: 'medium', status: 'active', type: 'online_gambling', description: '428 subdomains from legitimate domain used for hosting online gambling content.', source: 'BSSN Feed + Community', location: 'Various', timestamp: new Date('2026-07-02T08:30:00') },
    { id: 'INC-2026-7836', domain: 'dinsan.banyuwangikab.go.id', sector: 'government', severity: 'medium', status: 'resolved', type: 'defacement', description: 'Minor defacement — motivational quote replaced with hacker message.', source: 'Zone-H Mirror', location: 'East Java', timestamp: new Date('2026-07-01T22:14:00') },
    { id: 'INC-2026-7835', domain: 'plugin-wordpress-xxx.zip', sector: 'corporate', severity: 'high', status: 'monitoring', type: 'malware', description: 'Malicious WordPress plugin distributed via nulled theme sites. Full backdoor installed.', source: 'ExploitDB + Community', location: 'Digital Distribution', timestamp: new Date('2026-07-01T18:55:00') },
    { id: 'INC-2026-7834', domain: 'pt-.xxx-metal.com', sector: 'corporate', severity: 'critical', status: 'active', type: 'ransomware', description: 'LockBit 4.0 ransomware encrypted 12TB of manufacturing data. Ransom demand $800k.', source: 'CTI Feed', location: 'Surabaya', timestamp: new Date('2026-07-01T16:40:00') },
    { id: 'INC-2026-7833', domain: 'bps.go.id', sector: 'government', severity: 'low', status: 'resolved', type: 'ddos', description: 'DDoS proto flood 120Gbps for 15 minutes. Layer 7 attack followed.', source: 'BSSN CERT', location: 'Jakarta', timestamp: new Date('2026-07-01T14:20:00') },
    { id: 'INC-2026-7832', domain: 'marketplace-xxx.id', sector: 'corporate', severity: 'high', status: 'active', type: 'breach', description: '890,000 marketplace user data leaked. Full card data + DOB + email exposed.', source: 'Dark Web Monitor', location: 'Unknown', timestamp: new Date('2026-07-01T11:00:00') },
  ];

  for (const inc of specificIncidents) {
    records.push(inc as IncidentRecord);
  }

  return records;
}

async function seed() {
  console.log('🌱 Seeding database...');

  const records = generateIncidents();

  // Clear existing data
  sqlite.exec('DELETE FROM incidents');

  // Insert in batches
  const insert = sqlite.prepare(`
    INSERT INTO incidents (id, type, domain, sector, severity, timestamp, description, source, location, status)
    VALUES (@id, @type, @domain, @sector, @severity, @timestamp, @description, @source, @location, @status)
  `);

  const insertMany = sqlite.transaction((items: typeof records) => {
    for (const item of items) {
      insert.run({
        ...item,
        timestamp: Math.floor(item.timestamp.getTime() / 1000),
      });
    }
  });

  insertMany(records);

  console.log(`✅ Seeded ${records.length} incidents`);
  console.log(`   Database: ${DB_PATH}`);
}

seed().catch(console.error);
