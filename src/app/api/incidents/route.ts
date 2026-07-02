import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function getDb() {
  const DB_PATH = path.join(process.cwd(), 'cyberflation.db');
  return new Database(DB_PATH);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sector = searchParams.get('sector') || '';
  const type = searchParams.get('type') || '';
  const severity = searchParams.get('severity') || '';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  const db = getDb();

  let where = '1=1';
  const params: (string | number)[] = [];

  if (sector) { where += ' AND sector = ?'; params.push(sector); }
  if (type) { where += ' AND type = ?'; params.push(type); }
  if (severity) { where += ' AND severity = ?'; params.push(severity); }
  if (status) { where += ' AND status = ?'; params.push(status); }
  if (search) {
    where += ' AND (domain LIKE ? OR id LIKE ? OR description LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM incidents WHERE ${where}`).get(...params) as { count: number }).count;
  const rows = db.prepare(`SELECT * FROM incidents WHERE ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`).all(...params, limit, offset) as Array<Record<string, unknown>>;

  // Get stats
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'monitoring' THEN 1 ELSE 0 END) as monitoring,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
    FROM incidents
  `).get() as Record<string, number>;

  // Get sector breakdown
  const sectorBreakdown = db.prepare(`
    SELECT sector, COUNT(*) as count FROM incidents GROUP BY sector
  `).all() as Array<{ sector: string; count: number }>;

  db.close();

  return NextResponse.json({
    incidents: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats,
    sectorBreakdown,
  });
}
