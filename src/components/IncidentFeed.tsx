'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, AlertCircle, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { INCIDENT_TYPES, SECTORS, type Incident, type IncidentType, type Sector } from '@/lib/mockData';

interface IncidentFeedProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

interface IncidentApiResponse {
  incidents: Incident[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    total: number;
    active: number;
    resolved: number;
    monitoring: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  sectorBreakdown: Array<{ sector: string; count: number }>;
}

export default function IncidentFeed({ searchQuery, onClearSearch }: IncidentFeedProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentApiResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchQuery || '');
  const [sectorFilter, setSectorFilter] = useState<Sector | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<Incident['severity'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Incident['status'] | 'all'>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
        search: search,
        sector: sectorFilter === 'all' ? '' : sectorFilter,
        type: typeFilter === 'all' ? '' : typeFilter,
        severity: severityFilter === 'all' ? '' : severityFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
      });
      const res = await fetch(`/api/incidents?${params}`);
      const data: IncidentApiResponse = await res.json();
      setIncidents(data.incidents.map((inc) => ({
        ...inc,
        timestamp: new Date((inc.timestamp as unknown as number) * 1000),
      })) as Incident[]);
      setStats(data.stats);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error('Failed to fetch incidents:', e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, sectorFilter, typeFilter, severityFilter, statusFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    if (searchQuery !== undefined) setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sectorFilter, typeFilter, severityFilter, statusFilter]);

  const statusConfig = {
    active: { icon: AlertCircle, color: '#ff3d57', label: 'Active' },
    resolved: { icon: CheckCircle2, color: '#00ff88', label: 'Resolved' },
    monitoring: { icon: Clock, color: '#ffc53d', label: 'Monitoring' },
  };

  const severityConfig = {
    critical: { color: '#ff3d57', bg: 'rgba(255,61,87,0.1)', border: 'rgba(255,61,87,0.25)' },
    high: { color: '#ff6b35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.25)' },
    medium: { color: '#ffc53d', bg: 'rgba(255,197,61,0.1)', border: 'rgba(255,197,61,0.25)' },
    low: { color: '#00ff88', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.2)' },
  };

  const typeColor = (type: IncidentType) => INCIDENT_TYPES.find(t => t.id === type)?.color || '#8b8fa3';

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Incidents', value: stats?.total?.toLocaleString() || '—', color: '#e2e4ed' },
          { label: 'Active', value: stats?.active?.toLocaleString() || '—', color: '#ff3d57' },
          { label: 'Resolved', value: stats?.resolved?.toLocaleString() || '—', color: '#00ff88' },
          { label: 'Critical', value: stats?.critical?.toLocaleString() || '—', color: '#ff6b35' },
          { label: 'High', value: stats?.high?.toLocaleString() || '—', color: '#ffc53d' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by domain, ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cyber-input pl-9"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-2">
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value as Sector | 'all')} className="cyber-input text-xs py-2 px-3 w-auto">
            <option value="all">All Sectors</option>
            {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as IncidentType | 'all')} className="cyber-input text-xs py-2 px-3 w-auto">
            <option value="all">All Types</option>
            {INCIDENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as Incident['severity'] | 'all')} className="cyber-input text-xs py-2 px-3 w-auto">
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Incident['status'] | 'all')} className="cyber-input text-xs py-2 px-3 w-auto">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="monitoring">Monitoring</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{loading ? '...' : `${stats?.total?.toLocaleString() || 0} results`}</span>
          <button className="cyber-btn cyber-btn-secondary text-xs">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Incident Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
          <div className="col-span-1">ID</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2">Domain</div>
          <div className="col-span-1">Sector</div>
          <div className="col-span-1">Severity</div>
          <div className="col-span-2">Description</div>
          <div className="col-span-1">Source</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Time</div>
        </div>

        {loading && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading incidents...
          </div>
        )}

        {!loading && incidents.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
            No incidents found matching your filters.
          </div>
        )}

        {/* Rows */}
        {!loading && (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {incidents.map((incident) => {
              const s = severityConfig[incident.severity];
              const st = statusConfig[incident.status];
              const StIcon = st.icon;
              const tColor = typeColor(incident.type);
              return (
                <div
                  key={incident.id}
                  className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center cursor-pointer transition-all duration-100"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => setSelectedIncident(selectedIncident?.id === incident.id ? null : incident)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="col-span-1">
                    <span className="text-xs font-mono font-medium" style={{ color: 'var(--accent-blue)' }}>
                      {incident.id}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded-md capitalize"
                      style={{ background: `${tColor}15`, color: tColor }}
                    >
                      {incident.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{incident.domain}</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{incident.sector}</span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                    >
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{incident.description}</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{incident.source}</span>
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <StIcon size={12} color={st.color} />
                      <span className="text-[10px]" style={{ color: st.color }}>{st.label}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                      {new Date(incident.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-40 flex items-center gap-1"
                style={{ background: 'var(--bg-cell)', color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((page, idx, arr) => (
                  <span key={page} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-xs" style={{ color: 'var(--text-muted)' }}>...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                      style={
                        currentPage === page
                          ? { background: 'var(--accent-blue)', color: '#fff' }
                          : { background: 'var(--bg-cell)', color: 'var(--text-secondary)' }
                      }
                    >
                      {page}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-40 flex items-center gap-1"
                style={{ background: 'var(--bg-cell)', color: 'var(--text-secondary)' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Detail */}
      {selectedIncident && (
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold" style={{ color: 'var(--accent-blue)' }}>
                {selectedIncident.id}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-md capitalize"
                style={{ background: `${typeColor(selectedIncident.type)}15`, color: typeColor(selectedIncident.type) }}
              >
                {selectedIncident.type.replace('_', ' ')}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded"
                style={{ background: severityConfig[selectedIncident.severity].bg, color: severityConfig[selectedIncident.severity].color, border: `1px solid ${severityConfig[selectedIncident.severity].border}` }}
              >
                {selectedIncident.severity.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-xs px-3 py-1 rounded-lg"
              style={{ background: 'var(--bg-cell)', color: 'var(--text-muted)' }}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Severity</div>
              <div
                className="text-lg font-bold"
                style={{ color: severityConfig[selectedIncident.severity].color }}
              >
                {selectedIncident.severity.toUpperCase()}
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Type</div>
              <div className="text-lg font-bold capitalize" style={{ color: typeColor(selectedIncident.type) }}>
                {selectedIncident.type.replace('_', ' ')}
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Status</div>
              <div className="text-lg font-bold" style={{ color: statusConfig[selectedIncident.status].color }}>
                {statusConfig[selectedIncident.status].label}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Full Description</div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedIncident.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Domain</div>
              <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{selectedIncident.domain}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Location</div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedIncident.location}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
