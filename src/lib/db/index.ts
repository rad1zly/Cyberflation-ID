import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'cyberflation.db');

const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite, { schema });

// Initialize tables
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

  CREATE TABLE IF NOT EXISTS kev_cache (
    cve_id TEXT PRIMARY KEY,
    date_added TEXT NOT NULL,
    due_date TEXT NOT NULL,
    vendor_project TEXT NOT NULL,
    product TEXT NOT NULL,
    vulnerability_name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    required_action TEXT NOT NULL,
    notes TEXT NOT NULL,
    known_ransomware_campaign_use TEXT NOT NULL,
    base_score REAL,
    base_severity TEXT,
    attack_vector TEXT,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_incidents_sector ON incidents(sector);
  CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
  CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
  CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents(timestamp DESC);
`);
