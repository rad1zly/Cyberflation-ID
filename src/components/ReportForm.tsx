'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SECTORS, type Sector, type IncidentType } from '@/lib/mockData';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Shield,
  Star,
  Zap,
  Eye,
  Globe,
} from 'lucide-react';

const REPORT_TYPES: { id: IncidentType; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { id: 'defacement', label: 'Defacement', description: 'Website defaced or display changed without authorization', icon: Globe, color: '#ff6b35' },
  { id: 'breach', label: 'Data Breach', description: 'Indicators of data or database leak', icon: AlertCircle, color: '#ff3d57' },
  { id: 'phishing', label: 'Phishing', description: 'Domain or page impersonating official entity to steal data', icon: Eye, color: '#ffc53d' },
  { id: 'online_gambling', label: 'Online Gambling', description: 'Domain or subdomain used for online gambling', icon: Zap, color: '#ffc53d' },
  { id: 'malware', label: 'Malware', description: 'Distribution of malware, virus, or backdoor', icon: AlertCircle, color: '#a855f7' },
  { id: 'credential_leak', label: 'Credential Leak', description: 'Username, password, or token leaked on forum/paste site', icon: Shield, color: '#3d9eff' },
];

const URGENCY_LEVELS = [
  { id: 'low', label: 'Low', description: 'Early indication, no impact yet', color: '#00ff88' },
  { id: 'medium', label: 'Medium', description: 'Limited exposure or potential impact', color: '#ffc53d' },
  { id: 'high', label: 'High', description: 'Active incident, visible impact', color: '#ff6b35' },
  { id: 'critical', label: 'Critical', description: 'Major impact, sensitive data potentially leaked', color: '#ff3d57' },
];

export default function ReportForm() {
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [formData, setFormData] = useState({
    domain: '',
    sector: '' as Sector | '',
    location: '',
    description: '',
    evidenceUrl: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    reporterName: '',
    reporterEmail: '',
    agreeTerms: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !formData.domain || !formData.sector) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(0,255,136,0.1)', border: '2px solid rgba(0,255,136,0.3)' }}>
          <CheckCircle2 size={32} color="#00ff88" />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Report Submitted!</h2>
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          Thank you! Your report is being validated by the community.
        </p>
        <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          Estimated validation time: 2-24 hours. You will receive a notification via email.
        </p>

        <div className="text-left p-5 rounded-xl mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>REWARD POTENTIAL</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star size={16} color="#ffc53d" />
              <span className="text-sm font-semibold" style={{ color: 'var(--accent-yellow)' }}>+50 Points</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} color="#a855f7" />
              <span className="text-sm font-semibold" style={{ color: 'var(--accent-purple)' }}>Badge: First Report</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setSubmitted(false); setSelectedType(null); setFormData({ domain: '', sector: '', location: '', description: '', evidenceUrl: '', urgency: 'medium', reporterName: '', reporterEmail: '', agreeTerms: false }); }}
          className="cyber-btn cyber-btn-secondary"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Select Type', 'Details', 'Evidence', 'Submit'].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: i === 0 ? 'var(--accent-green)' : i < 2 ? 'rgba(0,255,136,0.15)' : 'var(--bg-card)',
                color: i === 0 ? '#0a0a0f' : i < 2 ? 'var(--accent-green)' : 'var(--text-muted)',
                border: i >= 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {i + 1}
            </div>
            <span className="text-xs hidden sm:block" style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {step}
            </span>
            {i < 3 && <div className="w-8 h-px mx-1" style={{ background: 'var(--border)' }} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Type Selection */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>1. Select Incident Type</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>What type of cybersecurity incident are you reporting?</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  'p-4 rounded-xl text-left transition-all duration-150',
                  selectedType === type.id ? 'ring-2 ring-offset-0' : ''
                )}
                style={{
                  background: selectedType === type.id ? `${type.color}12` : 'var(--bg-primary)',
                  border: selectedType === type.id ? `2px solid ${type.color}` : '1px solid var(--border)',
                  ['--tw-ring-color' as string]: selectedType === type.id ? type.color : 'transparent',
                }}
              >
                <type.icon size={18} color={type.color} className="mb-2" />
                <div className="text-xs font-semibold mb-0.5" style={{ color: selectedType === type.id ? type.color : 'var(--text-primary)' }}>
                  {type.label}
                </div>
                <div className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Details */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>2. Incident Details</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Provide as much detail as possible</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Domain / URL affected *
              </label>
              <input
                type="text"
                required
                placeholder="example.go.id or https://..."
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="cyber-input"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Sector *
              </label>
              <select
                required
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
                className="cyber-input"
              >
                <option value="">Select sector</option>
                {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Location / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Jakarta, Jawa Barat, etc."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="cyber-input"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Urgency Level *
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value as typeof formData.urgency })}
                className="cyber-input"
              >
                {URGENCY_LEVELS.map(u => (
                  <option key={u.id} value={u.id}>{u.label} — {u.description}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe the incident in detail — what happened, when, what you observed..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="cyber-input resize-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Evidence */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>3. Evidence & Reporter</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Optional but highly recommended for faster validation</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Evidence URL / Screenshot Link
              </label>
              <input
                type="url"
                placeholder="https:// screenshot URL or pastebin link..."
                value={formData.evidenceUrl}
                onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
                className="cyber-input"
              />
            </div>

            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border)' }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-green)'; }}
              onDragLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <Upload size={24} color="var(--text-muted)" className="mx-auto mb-2" />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Drag & drop screenshot here, or click to browse
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                PNG, JPG up to 10MB
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="Anonymous if blank"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                  className="cyber-input"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="For notification purposes"
                  value={formData.reporterEmail}
                  onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                  className="cyber-input"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-0.5"
              />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                I confirm this report is based on verified information and agree to the{' '}
                <span style={{ color: 'var(--accent-green)' }}>Community Guidelines</span> and{' '}
                <span style={{ color: 'var(--accent-green)' }}>Privacy Policy</span>
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={14} color="var(--text-muted)" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Reports are validated by community + AI before publication
            </span>
          </div>
          <button
            type="submit"
            disabled={!selectedType || !formData.domain || !formData.sector || !formData.description || !formData.agreeTerms || isSubmitting}
            className={cn(
              'cyber-btn cyber-btn-primary px-8',
              (!selectedType || !formData.domain || !formData.sector || !formData.description || !formData.agreeTerms) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'} <FileText size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
