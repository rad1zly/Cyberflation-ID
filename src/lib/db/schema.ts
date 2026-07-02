import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const incidents = sqliteTable('incidents', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // defacement | breach | phishing | online_gambling | malware | ransomware | credential_leak | ddos
  domain: text('domain').notNull(),
  sector: text('sector').notNull(), // government | education | health | finance | corporate | public
  severity: text('severity').notNull(), // critical | high | medium | low
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  description: text('description').notNull(),
  source: text('source').notNull(),
  location: text('location').notNull(),
  status: text('status').notNull(), // active | resolved | monitoring
});

export const kevCache = sqliteTable('kev_cache', {
  cveId: text('cve_id').primaryKey(),
  dateAdded: text('date_added').notNull(),
  dueDate: text('due_date').notNull(),
  vendorProject: text('vendor_project').notNull(),
  product: text('product').notNull(),
  vulnerabilityName: text('vulnerability_name').notNull(),
  shortDescription: text('short_description').notNull(),
  requiredAction: text('required_action').notNull(),
  notes: text('notes').notNull(),
  knownRansomwareCampaignUse: text('known_ransomware_campaign_use').notNull(),
  baseScore: real('base_score'),
  baseSeverity: text('base_severity'),
  attackVector: text('attack_vector'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const shodanScans = sqliteTable('shodan_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  query: text('query').notNull(),
  service: text('service').notNull(),
  count: integer('count').notNull(),
  riskLevel: text('risk_level').notNull(), // critical | high | medium | low
  scannedAt: integer('scanned_at', { mode: 'timestamp' }).notNull(),
});
