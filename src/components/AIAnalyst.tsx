'use client';

import { useState, useRef, useEffect } from 'react';
import { cn, timeAgo } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  Zap,
  Shield,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Globe,
  ChevronDown,
  Bot,
  User,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

const SUGGESTED_PROMPTS = [
  { icon: TrendingUp, label: 'Which sector is most at risk this week?', color: '#ff6b35' },
  { icon: AlertTriangle, label: 'Why is the education sector inflation score rising?', color: '#3d9eff' },
  { icon: Globe, label: 'Which domains should be prioritized now?', color: '#00ff88' },
  { icon: BarChart3, label: 'What is the 7-day cyber risk forecast?', color: '#a855f7' },
  { icon: Shield, label: 'Mitigation recommendations for defacement spike?', color: '#ffc53d' },
  { icon: Zap, label: 'Any new data breach trends in Indonesia?', color: '#ff3d57' },
];

const MOCK_RESPONSES: Record<string, string> = {
  default: `Based on current data from Cyberflation.ID monitoring system:

**📊 Sector Risk Summary**

| Sector | Score | Trend | Status |
|--------|------|-------|--------|
| Government | 82/100 | +23% | 🔴 CRITICAL |
| Health | 76/100 | +18% | 🟠 HIGH |
| Education | 68/100 | +31% | 🟠 HIGH |
| Corporate | 59/100 | +7% | 🟡 MEDIUM |

**🔍 Key Findings:**

1. **Government sector** experienced significant spike (+23%) mainly from .go.id domain defacements and DDoS activity increase.

2. **Education sector** had the largest increase (+31%) due to 3 credential leak reports from universities in the last 24 hours.

3. **Health sector** remains elevated due to active breach at RS-Medika-JKJ with 45,000+ patient records potentially leaked.

**⚡ Recommended Actions:**
- Prioritaskan patching CMS WordPress/Joomla di domain pemerintah daerah
- Mass password rotation for academic staff recommended
- Verifikasi status keamanan plugin third-party di environment production

**Confidence Score: 87%** — Data points: 1,247 incidents, 23 active threat feeds, 156 community reports.`,
  sector: `**Health sector** has Cyber Inflation Index **76/100** (HIGH) with main factors:

1. **Active Data Breach** — RS-Medika-JKJ: 45,000+ patient records leaked (CRITICAL)
2. **Ransomware Campaign** — LockBit 4.0 targeting healthcare providers
3. **Credential Leak** — 2 laporan faculty/staff dari institusi kesehatan

**Trend Analysis:**
- Last 7 days: 76 → 82 → 79 → 76 (volatile, elevated)
- Compared to 30-day average: **+18% above baseline**

**Economic Impact Estimate:**
Based on RCVaR methodology, estimated potential loss: **Rp 12.8 - 45.2 miliar** (compliance fines + data recovery + reputation damage).

**Mitigation Priority:**
🔴 Immediate: Incident response for RS-Medika-JKJ breach
🟠 This week: Security audit all systems storing PHI (Protected Health Information) (Protected Health Information)`,
};

export default function AIAnalyst() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to **AI Cyberflation Analyst** 👋

This AI analyst monitors Indonesia cyber risk inflation in realtime. It can help with:

• 📊 Per-sector risk analysis
• 🔮 7-14 day cyber inflation forecast
• 🎯 Domain/asset prioritization
• 📋 Actionable mitigation recommendations
• 📈 Incident correlation with economic impact

**Data coverage:** 1,247 incidents tracked, 6 sectors, 23 threat feeds.

Feel free to ask questions in English or Indonesian.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const conversationHistory = [...messages, userMessage];
    setMessages(conversationHistory);
    setInput('');
    setIsLoading(true);
    setShowPrompts(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.content || 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
        sources: ['Zone-H Mirror', 'Dark Web Monitor', 'BSSN CERT', 'Community Reports', 'CVE/KEV Feed'],
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: '❌ Failed to connect to AI service. Please check your internet connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Context Loaded', value: '1,247 Incidents', icon: BarChart3, color: '#3d9eff' },
          { label: 'Sectors Covered', value: '6 Sectors', icon: Globe, color: '#00ff88' },
          { label: 'Threat Feeds', value: '23 Active', icon: Zap, color: '#a855f7' },
          { label: 'Community Reports', value: '156 Today', icon: Shield, color: '#ffc53d' },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${stat.color}15` }}
            >
              <stat.icon size={16} color={stat.color} />
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat container */}
      <div
        className="flex-1 rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Chat header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
            <Bot size={16} color="#a855f7" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cyberflation AI Analyst</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] pulse-dot" />

            </div>
          </div>
          <button className="cyber-btn cyber-btn-ghost text-xs">
            <Sparkles size={13} />
            Upgrade
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {showPrompts && messages.length === 1 && (
            <div className="mb-6">
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                Try asking about:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt.label);
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-150"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = prompt.color + '50';
                      e.currentTarget.style.background = `${prompt.color}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--bg-primary)';
                    }}
                  >
                    <prompt.icon size={14} color={prompt.color} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              {msg.role === 'assistant' ? (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(168,85,247,0.15)' }}>
                  <Bot size={14} color="#a855f7" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,255,136,0.1)' }}>
                  <User size={14} color="#00ff88" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={cn('p-4', msg.role === 'assistant' ? 'chat-bubble-ai' : 'chat-bubble-user')}
                >
                  <div
                    className="text-xs leading-relaxed whitespace-pre-wrap"
                    style={{ color: msg.role === 'assistant' ? 'var(--text-primary)' : 'var(--text-primary)' }}
                  >
                    {msg.content.split('\n').map((line, i) => {
                      // Format markdown-like content
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={i} className="font-semibold mt-2 first:mt-0" style={{ color: 'var(--text-primary)' }}>
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      if (line.startsWith('|')) {
                        // Simple table formatting
                        return (
                          <div key={i} className="font-mono text-[11px] my-1 overflow-x-auto" style={{ color: 'var(--text-secondary)' }}>
                            {line}
                          </div>
                        );
                      }
                      if (line.startsWith('•') || line.startsWith('-')) {
                        return (
                          <p key={i} className="ml-2 my-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {line}
                          </p>
                        );
                      }
                      if (line.match(/^\d+\./)) {
                        return (
                          <p key={i} className="my-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {line}
                          </p>
                        );
                      }
                      if (line.trim() === '') {
                        return <br key={i} />;
                      }
                      return (
                        <p key={i} className="my-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5 ml-1">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                    {timeAgo(msg.timestamp)}
                  </span>
                  {msg.sources && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      • Sources: {msg.sources.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.15)' }}>
                <Bot size={14} color="#a855f7" />
              </div>
              <div className="chat-bubble-ai p-4">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} color="#a855f7" className="animate-spin" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Analyzing threat data...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="p-4 border-t"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
        >
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Indonesia cyber risk landscape..."
                className="cyber-input pr-12 resize-none text-sm"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <span className="absolute bottom-3 right-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {input.length}/2000
              </span>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                'cyber-btn cyber-btn-primary px-4 shrink-0',
                (!input.trim() || isLoading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              AI may produce inaccurate information. Always verify with primary sources.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
