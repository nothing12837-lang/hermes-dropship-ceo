'use client';

/**
 * RareEmber AI Store Manager & Live Telemetry Center (/admin/agent)
 * Upgraded High-Energy Cyberpunk Dashboard with Dynamic Colorful Heatmaps,
 * Live Multi-Stage Funnel, Real-Time Event Stream & Autonomous Gemini 3.8 Flash Strategist.
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, BarList } from '@/components/admin/AgentCharts';
import AgentTaskSuite from '@/components/admin/AgentTaskSuite';

const KEY_STORAGE = 'rareember_admin_vault_key';

interface NamedCount { name: string; value: number }
interface LiveEvent {
  ts: string;
  type: string;
  path: string;
  session_id: string;
  product_id?: string;
  referrer?: string;
  device?: string;
  label?: string;
}

interface Overview {
  from: string;
  to: string;
  days: number;
  visits: number;
  uniqueSessions: number;
  engagedSessions: number;
  bounceRatePct: number;
  avgSessionSec: number;
  productViews: number;
  addToCarts: number;
  clicks: number;
  checkoutsInitiated: number;
  orders: number;
  revenue: number;
  aov: number;
  conversionPct: number;
  cartToOrderPct: number;
  codOrders: number;
  prepaidOrders: number;
  codCashGap: { orders: number; amount: number; unconfirmed: number };
  returns: { cancelled: number; refunded: number; returned: number };
  topProducts: NamedCount[];
  topReferrers: NamedCount[];
  topPaths: NamedCount[];
  deviceSplit: NamedCount[];
  security: NamedCount[];
  byDay: { date: string; visits: number; orders: number; revenue: number; codOrders: number; prepaidOrders: number }[];
  liveEvents: LiveEvent[];
  funnel: {
    visits: number;
    productViews: number;
    addToCarts: number;
    checkouts: number;
    orders: number;
  };
  dataIssue: string | null;
}

interface Report { ts: string; kind: string; summary: string }

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const KpiCard = ({
  icon,
  label,
  value,
  hint,
  colorTheme = 'orange',
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  colorTheme?: 'orange' | 'cyan' | 'emerald' | 'purple' | 'yellow' | 'rose';
}) => {
  const themes = {
    orange: {
      border: 'border-orange-500/30 hover:border-orange-500/60',
      bg: 'bg-gradient-to-br from-orange-500/20 via-[#131B2E] to-[#0B0F19]',
      glow: 'shadow-[0_4px_24px_rgba(255,77,36,0.15)]',
      text: 'text-orange-300',
    },
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      bg: 'bg-gradient-to-br from-cyan-500/20 via-[#131B2E] to-[#0B0F19]',
      glow: 'shadow-[0_4px_24px_rgba(6,182,212,0.15)]',
      text: 'text-cyan-300',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      bg: 'bg-gradient-to-br from-emerald-500/20 via-[#131B2E] to-[#0B0F19]',
      glow: 'shadow-[0_4px_24px_rgba(16,185,129,0.15)]',
      text: 'text-emerald-300',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-500/60',
      bg: 'bg-gradient-to-br from-purple-500/20 via-[#131B2E] to-[#0B0F19]',
      glow: 'shadow-[0_4px_24px_rgba(168,85,247,0.15)]',
      text: 'text-purple-300',
    },
    yellow: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      bg: 'bg-gradient-to-br from-amber-500/20 via-[#131B2E] to-[#0B0F19]',
      glow: 'shadow-[0_4px_24px_rgba(245,158,11,0.15)]',
      text: 'text-amber-300',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-500/60',
      bg: 'bg-gradient-to-br from-rose-500/20 via-[#131B2E] to-[#0B0F19]',
      glow: 'shadow-[0_4px_24px_rgba(244,63,94,0.15)]',
      text: 'text-rose-300',
    },
  }[colorTheme];

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 ${themes.border} ${themes.bg} ${themes.glow}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">{value}</div>
      {hint && (
        <div className={`mt-2 text-[11px] font-bold leading-relaxed ${themes.text}`}>
          {hint}
        </div>
      )}
    </div>
  );
};

export default function AdminAgentPage() {
  const [key, setKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);
  const [ov, setOv] = useState<Overview | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [sending, setSending] = useState<'daily' | 'weekly' | null>(null);
  const [sentMsg, setSentMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'eow' | 'budget' | 'products' | 'live' | 'funnel' | 'ai' | 'analytics'>('eow');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [liveStrategy, setLiveStrategy] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(
    async (range: number, keyOverride?: string) => {
      const k = keyOverride ?? key;
      if (!k) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/agent/overview?days=${range}`, { headers: { Authorization: `Bearer ${k}` } });
        const data = await res.json();
        if (!res.ok && res.status !== 503) throw new Error(data.error || 'Failed to authenticate admin key');
        if (res.status === 503) {
          setError(data.error || 'Database connection required.');
        } else {
          setOv(data.overview ?? null);
          setReports(data.reports ?? []);
          setUnlocked(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    },
    [key]
  );

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORAGE);
    if (saved) {
      setKey(saved);
      void load(days, saved);
    }
  }, [days, load]);

  // Optional 20-second telemetry polling
  useEffect(() => {
    if (!unlocked || !autoRefresh) return;
    const interval = setInterval(() => {
      void load(days);
    }, 20_000);
    return () => clearInterval(interval);
  }, [unlocked, autoRefresh, days, load]);

  const unlock = () => {
    if (!key.trim()) return setError('Please enter your Master Vault Key.');
    sessionStorage.setItem(KEY_STORAGE, key.trim());
    void load(days);
  };

  const trigger = async (kind: 'daily' | 'weekly') => {
    setSending(kind);
    setSentMsg('');
    try {
      const res = await fetch(`/api/agent/${kind}`, { method: 'POST', headers: { Authorization: `Bearer ${key}` } });
      const data = await res.json();
      setSentMsg(res.ok ? `✅ ${kind.toUpperCase()} report dispatched to Telegram.` : `⚠️ ${data.error || 'Failed'}`);
      if (res.ok) void load(days);
    } catch {
      setSentMsg('⚠️ Telegram dispatch failed.');
    } finally {
      setSending(null);
    }
  };

  const runAiStrategy = async () => {
    setAiGenerating(true);
    setSentMsg('');
    try {
      const res = await fetch('/api/agent/strategy', { method: 'POST', headers: { Authorization: `Bearer ${key}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Strategy generation failed');
      setLiveStrategy(data.strategy);
      setSentMsg('⚡ Live Gemini 3.8 Flash strategy generated.');
      void load(days);
    } catch (err) {
      setSentMsg(err instanceof Error ? `⚠️ ${err.message}` : 'AI strategy failed');
    } finally {
      setAiGenerating(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4D24]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md rounded-3xl border border-orange-500/30 bg-[#131B2E] p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/40 flex items-center justify-center text-2xl shadow-inner">
              🤖
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">AI Command Center</h1>
              <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Rare Ember Autonomous Sentinel</p>
            </div>
          </div>
          <p className="mb-6 text-xs text-slate-400 leading-relaxed">
            Real-time customer journey analytics, conversion funnel metrics, and autonomous Gemini 3.8 Flash strategist.
          </p>
          <div className="space-y-4">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && unlock()}
              placeholder="Enter Master Vault Key..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3.5 text-sm font-mono text-white placeholder:text-slate-500 focus:border-[#FF4D24] focus:outline-none focus:ring-2 focus:ring-[#FF4D24]/20 transition-all"
            />
            <button
              onClick={unlock}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#FF4D24] via-[#FF6B35] to-[#FFA048] py-3.5 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_24px_rgba(255,77,36,0.35)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating…' : 'Unlock Command Center ⚡'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${Math.round(sec)}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-[#131B2E] p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl shadow-inner">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">RareEmber AI Command Sentinel</h1>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE TELEMETRY ACTIVE
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Window: <b className="text-orange-400">{ov?.from} → {ov?.to}</b> ({ov?.days}d)
                    {ov?.dataIssue ? ` • ⚠️ ${ov.dataIssue}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <Link
                href="/admin/orders"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all no-underline flex items-center gap-1.5"
              >
                <span>📦</span> Orders Desk
              </Link>
              <Link
                href="https://www.rareember.shop"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition-all no-underline flex items-center gap-1.5"
              >
                <span>🛍️</span> Storefront ↗
              </Link>

              {/* Time Range Pills */}
              <div className="flex rounded-xl border border-slate-800 bg-slate-900/90 p-1">
                {[1, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDays(d); void load(d); }}
                    className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
                      d === days
                        ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF6B35] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d === 1 ? '24h' : `${d}d`}
                  </button>
                ))}
              </div>

              {/* Auto 20s Polling */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`rounded-xl border px-3.5 py-2 font-bold transition-all cursor-pointer ${
                  autoRefresh
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {autoRefresh ? '⏱️ Auto 20s' : '⏸️ Paused'}
              </button>

              {/* Telegram Dispatch */}
              <button
                onClick={() => void trigger('daily')}
                disabled={sending !== null}
                className="rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 px-3.5 py-2 font-bold text-indigo-300 transition-all cursor-pointer disabled:opacity-50"
              >
                {sending === 'daily' ? 'Dispatching…' : '🌅 Telegram Brief'}
              </button>
              <button
                onClick={() => void trigger('weekly')}
                disabled={sending !== null}
                className="rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 px-3.5 py-2 font-bold text-purple-300 transition-all cursor-pointer disabled:opacity-50"
              >
                {sending === 'weekly' ? 'Dispatching…' : '📅 Weekly Plan'}
              </button>
            </div>
          </div>
        </div>

        {sentMsg && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg">
            <span>{sentMsg}</span>
            <button onClick={() => setSentMsg('')} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        {ov ? (
          <div className="space-y-6">
            
            {/* Vivid 6-Card KPI Strip */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
              <KpiCard
                icon="⚡"
                label="Gross Revenue"
                value={inr(ov.revenue)}
                hint={`${ov.orders} orders (${ov.prepaidOrders} prepaid • ${ov.codOrders} COD)`}
                colorTheme="orange"
              />
              <KpiCard
                icon="🌐"
                label="Visitors & Sessions"
                value={`${ov.visits}`}
                hint={`${ov.uniqueSessions} unique (${ov.bounceRatePct}% bounce)`}
                colorTheme="cyan"
              />
              <KpiCard
                icon="⏱️"
                label="Avg Time On Site"
                value={formatDuration(ov.avgSessionSec)}
                hint={`${ov.engagedSessions} engaged multi-page visits`}
                colorTheme="emerald"
              />
              <KpiCard
                icon="🎯"
                label="Conversion Rate"
                value={`${ov.conversionPct}%`}
                hint={`AOV ${inr(ov.aov)} • ${ov.cartToOrderPct}% cart checkout`}
                colorTheme="purple"
              />
              <KpiCard
                icon="🔥"
                label="Actions & Clicks"
                value={`${ov.clicks}`}
                hint={`${ov.addToCarts} cart adds • ${ov.checkoutsInitiated} checkouts`}
                colorTheme="yellow"
              />
              <KpiCard
                icon="💵"
                label="COD Pipeline"
                value={inr(ov.codCashGap.amount)}
                hint={`${ov.codCashGap.orders} in flight • ${ov.codCashGap.unconfirmed} unconfirmed`}
                colorTheme="rose"
              />
            </div>

            {/* Vibrant Tab Pills */}
            <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('eow')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'eow'
                    ? 'bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 text-white shadow-[0_4px_16px_rgba(168,85,247,0.35)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>📅 End of Week &amp; Next Move</span>
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'budget'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.35)] font-black'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>💰 Budget &amp; Capital Allocator</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🏆 Product Winners &amp; Losers</span>
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'live'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_4px_16px_rgba(6,182,212,0.35)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🔴 Live Activity Stream</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono">{ov.liveEvents.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('funnel')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'funnel'
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>📊 Conversion Funnel</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF6B35] text-white shadow-[0_4px_16px_rgba(255,77,36,0.35)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🧠 Gemini AI Sentinel</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-[0_4px_16px_rgba(20,184,166,0.35)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>📈 Trends &amp; Sources</span>
              </button>
            </div>

            {/* TAB: END OF WEEK MASTER PLAN & NEXT MOVE */}
            {activeTab === 'eow' && (
              <div className="space-y-6">
                <AgentTaskSuite adminKey={key} overview={ov} initialTask="eow_plan" />
              </div>
            )}

            {/* TAB: BUDGET & CAPITAL ALLOCATOR */}
            {activeTab === 'budget' && (
              <div className="space-y-6">
                <AgentTaskSuite adminKey={key} overview={ov} initialTask="budget" />
              </div>
            )}

            {/* TAB: PRODUCT WINNERS, LOSERS & RETURN RISK */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <AgentTaskSuite adminKey={key} overview={ov} initialTask="products" />
              </div>
            )}

            {/* TAB 1: LIVE ACTIVITY STREAM */}
            {activeTab === 'live' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-base font-black text-white">Live Customer Activity Stream</span>
                      <span className="text-xs text-slate-400">(Real-time actions streaming across India)</span>
                    </div>
                    <button
                      onClick={() => void load(days)}
                      className="text-xs font-black text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>↻</span> Refresh Stream
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-black uppercase tracking-wider text-slate-400">
                          <th className="py-3 px-4">Time (IST)</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Storefront Path</th>
                          <th className="py-3 px-4">Target Detail</th>
                          <th className="py-3 px-4">Device & Source</th>
                          <th className="py-3 px-4 font-mono">Session ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {ov.liveEvents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-500">
                              No visitor actions recorded in this window yet. Visit <a href="https://www.rareember.shop" target="_blank" className="text-cyan-400 underline font-bold">rareember.shop</a> in a new tab to see events stream live.
                            </td>
                          </tr>
                        ) : (
                          ov.liveEvents.map((e, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                                {new Date(e.ts).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                    e.type === 'pageview'
                                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                      : e.type === 'view_product'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                      : e.type === 'add_to_cart'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : e.type === 'initiate_checkout'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                  }`}
                                >
                                  {e.type}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-200 font-mono text-[11px] max-w-xs truncate font-semibold">
                                {e.path}
                              </td>
                              <td className="py-3 px-4 text-slate-300">
                                {e.product_id ? (
                                  <span className="text-orange-400 font-bold">{e.product_id}</span>
                                ) : e.label ? (
                                  <span className="text-slate-400 italic">"{e.label}"</span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                                <span>{e.device === 'mobile' ? '📱 Mobile' : e.device === 'desktop' ? '💻 Desktop' : '📱 ' + e.device}</span>
                                {e.referrer && e.referrer !== 'direct' ? (
                                  <span className="ml-1.5 text-cyan-400 font-mono text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">via {e.referrer}</span>
                                ) : null}
                              </td>
                              <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                                {e.session_id}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONVERSION FUNNEL */}
            {activeTab === 'funnel' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-purple-500/30 bg-[#131B2E] p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📊</span>
                    <h3 className="text-lg font-black text-white">5-Stage Storefront Conversion Funnel</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">Real-time progression from homepage impressions to completed checkout.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Stage 1 */}
                    <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/15 via-[#131B2E] to-[#0B0F19] p-5 shadow-lg">
                      <div className="text-[10px] font-black text-sky-400 uppercase tracking-wider">1. Store Visits</div>
                      <div className="mt-2 text-3xl font-black text-white">{ov.funnel.visits}</div>
                      <div className="mt-2 text-xs font-bold text-sky-300">{ov.uniqueSessions} unique shoppers</div>
                    </div>

                    {/* Stage 2 */}
                    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-[#131B2E] to-[#0B0F19] p-5 shadow-lg">
                      <div className="text-[10px] font-black text-purple-400 uppercase tracking-wider">2. Product Views</div>
                      <div className="mt-2 text-3xl font-black text-white">{ov.funnel.productViews}</div>
                      <div className="mt-2 text-xs font-bold text-purple-300">
                        {ov.funnel.visits ? `${Math.round((ov.funnel.productViews / ov.funnel.visits) * 100)}% view rate` : '0%'}
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-[#131B2E] to-[#0B0F19] p-5 shadow-lg">
                      <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">3. Add To Bag</div>
                      <div className="mt-2 text-3xl font-black text-white">{ov.funnel.addToCarts}</div>
                      <div className="mt-2 text-xs font-bold text-amber-300">
                        {ov.funnel.productViews ? `${Math.round((ov.funnel.addToCarts / Math.max(1, ov.funnel.productViews)) * 100)}% view-to-cart` : '0%'}
                      </div>
                    </div>

                    {/* Stage 4 */}
                    <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-[#131B2E] to-[#0B0F19] p-5 shadow-lg">
                      <div className="text-[10px] font-black text-orange-400 uppercase tracking-wider">4. Checkout Started</div>
                      <div className="mt-2 text-3xl font-black text-white">{ov.funnel.checkouts}</div>
                      <div className="mt-2 text-xs font-bold text-orange-300">
                        {ov.funnel.addToCarts ? `${Math.round((ov.funnel.checkouts / Math.max(1, ov.funnel.addToCarts)) * 100)}% cart-to-checkout` : '0%'}
                      </div>
                    </div>

                    {/* Stage 5 */}
                    <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 via-[#131B2E] to-[#0B0F19] p-5 shadow-lg">
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">5. Orders Placed</div>
                      <div className="mt-2 text-3xl font-black text-emerald-300">{ov.funnel.orders}</div>
                      <div className="mt-2 text-xs font-bold text-emerald-400">
                        {ov.conversionPct}% total conversion
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demand Heatmap */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
                    <BarList label="🔥 Most Viewed Products" rows={ov.topProducts} color="#FF6B35" fmt={(n) => `×${n}`} />
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
                    <BarList label="📍 Top Store Pages Looked At" rows={ov.topPaths} color="#38BDF8" fmt={(n) => `×${n}`} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GEMINI AI MULTI-TASK SENTINEL */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <AgentTaskSuite adminKey={key} overview={ov} />

                <div className="rounded-3xl border border-orange-500/40 bg-gradient-to-br from-[#1C122C] via-[#131B2E] to-[#1A0C08] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🧠</span>
                        <div>
                          <h3 className="text-xl font-black text-white">Autonomous Gemini 3.8 Flash Growth Strategist</h3>
                          <p className="text-[11px] font-black uppercase tracking-wider text-orange-400 mt-0.5">Google DeepMind Strategic E-Commerce Engine</p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-300 max-w-xl leading-relaxed">
                        Feeds live visitor stay duration, conversion drop-off stages, and product interest metrics into Gemini 3.8 Flash to synthesize instant revenue optimizations.
                      </p>
                    </div>
                    <button
                      onClick={runAiStrategy}
                      disabled={aiGenerating}
                      className="rounded-2xl bg-gradient-to-r from-[#FF4D24] via-[#A855F7] to-[#3B82F6] px-6 py-4 text-xs font-black text-white shadow-[0_8px_32px_rgba(255,77,36,0.35)] hover:brightness-120 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {aiGenerating ? 'Analyzing Past Data with Gemini…' : '⚡ Generate AI Strategy Now'}
                    </button>
                  </div>

                  {liveStrategy && (
                    <div className="mt-6 rounded-2xl border border-purple-500/30 bg-black/50 p-6 text-sm text-slate-100 whitespace-pre-line leading-relaxed shadow-inner">
                      {liveStrategy}
                    </div>
                  )}
                </div>

                {/* Historical Reports */}
                <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
                  <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-base font-black text-white">Archived Executive Reports (Telegram & Database)</div>
                    <div className="text-xs text-slate-400">Autonomous 08:00 IST Morning & Weekly Crons</div>
                  </div>
                  <div className="space-y-3">
                    {reports.length === 0 ? (
                      <div className="text-xs text-slate-500 py-6 text-center">No reports archived yet. Use buttons above to dispatch one.</div>
                    ) : null}
                    {reports.map((r, i) => (
                      <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 transition-colors">
                        <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="rounded-full bg-orange-500/20 border border-orange-500/40 px-3 py-0.5 font-black uppercase tracking-wider text-orange-300">
                            {r.kind}
                          </span>
                          <span className="font-mono">{new Date(r.ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                        </div>
                        <p className="whitespace-pre-line text-xs text-slate-200 font-sans leading-relaxed">{r.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ANALYTICS & TRENDS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
                    <LineChart label="Revenue Trend (₹)" points={ov.byDay.map((d) => ({ date: d.date, value: d.revenue }))} fmt={inr} color="#FF4D24" />
                    <div className="mt-6 h-px bg-slate-800" />
                    <div className="mt-6">
                      <LineChart label="Store Visits / Day" points={ov.byDay.map((d) => ({ date: d.date, value: d.visits }))} color="#38BDF8" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
                    <LineChart label="Orders Placed (COD vs Prepaid)" points={ov.byDay.map((d) => ({ date: d.date, value: d.orders }))} color="#10B981" />
                    <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-slate-400 border-t border-slate-800 pt-4">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">COD Orders</div>
                        <div className="text-lg font-black text-white mt-1">{ov.codOrders}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Prepaid Orders</div>
                        <div className="text-lg font-black text-white mt-1">{ov.prepaidOrders}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Returns</div>
                        <div className="text-lg font-black text-white mt-1">{ov.returns.refunded + ov.returns.cancelled + ov.returns.returned}</div>
                      </div>
                    </div>
                    <div className="mt-6 h-px bg-slate-800" />
                    <div className="mt-6">
                      <BarList label="Device Split" rows={ov.deviceSplit.slice(0, 4)} color="#C084FC" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
                    <BarList label="🌐 Traffic Referral Sources" rows={ov.topReferrers} color="#38BDF8" fmt={(n) => `×${n}`} />
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
                    <BarList label="🛡️ Security & Rate-Limit Events" rows={ov.security} color="#F43F5E" fmt={(n) => `×${n}`} />
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="py-24 text-center text-sm text-slate-400 bg-[#131B2E] rounded-3xl border border-slate-800">
            {loading ? 'Compiling store telemetry…' : error || 'No data found.'}
          </div>
        )}

      </div>
    </div>
  );
}
