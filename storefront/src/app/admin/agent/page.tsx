'use client';

/**
 * RareEmber AI Store Manager & Live Telemetry Center (/admin/agent)
 * Unlocks with the master vault key.
 * Features:
 * - Live User Activity Stream (Real-time pageviews, product views, clicks, cart adds, checkouts)
 * - Full E-Commerce Conversion Funnel & Stay Duration Metrics
 * - Gemini 3.8 Flash Autonomous Strategic Audit Desk
 * - One-Tap Telegram Dispatch for Morning Briefing & Weekly Master Growth Plan
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, BarList } from '@/components/admin/AgentCharts';

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

const Kpi = ({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) => (
  <div className={`rounded-xl border p-4 transition-all ${highlight ? 'border-[#FF4D24]/40 bg-[#FF4D24]/5' : 'border-neutral-800 bg-neutral-900/60'}`}>
    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</div>
    <div className="mt-1 text-2xl font-black tracking-tight text-neutral-100">{value}</div>
    {hint ? <div className="mt-1 text-xs text-neutral-400">{hint}</div> : null}
  </div>
);

export default function AdminAgentPage() {
  const [key, setKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);
  const [ov, setOv] = useState<Overview | null>(null);
  const [fp, setFp] = useState<{ points?: { date: string; revenue: number }[]; note: string; nextRevenue: number } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [sending, setSending] = useState<'daily' | 'weekly' | null>(null);
  const [sentMsg, setSentMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'live' | 'funnel' | 'ai' | 'analytics'>('live');
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
          setFp(data.forecast ?? null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl font-black text-neutral-100 tracking-tight">AI Command Center</h1>
          </div>
          <p className="mb-5 text-xs text-neutral-400">
            Founder & Operations Sentinel. Enter your Master Vault Key to unlock real-time store telemetry and autonomous agents.
          </p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && unlock()}
            placeholder="RE_SECURE_VAULT_..."
            className="mb-3 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-mono text-neutral-100 placeholder:text-neutral-600 focus:border-[#FF4D24] focus:outline-none"
          />
          <button
            onClick={unlock}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#FF4D24] to-[#FF6B35] py-3 text-sm font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_24px_rgba(255,77,36,0.3)] disabled:opacity-50"
          >
            {loading ? 'Authenticating…' : 'Unlock Command Center ⚡'}
          </button>
          {error ? <p className="mt-3 text-center text-xs font-semibold text-red-400">{error}</p> : null}
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-neutral-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <h1 className="text-2xl font-black tracking-tight text-white">RareEmber AI Command Center</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sentinel Active
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Window: <b className="text-neutral-200">{ov?.from} → {ov?.to}</b> ({ov?.days}d)
            {ov?.dataIssue ? ` • ⚠️ ${ov.dataIssue}` : ''}
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/admin/orders"
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 font-semibold text-neutral-300 hover:bg-neutral-800"
          >
            📦 Orders Desk
          </Link>

          <div className="flex rounded-lg border border-neutral-800 bg-neutral-900 p-0.5">
            {[1, 7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => { setDays(d); void load(d); }}
                className={`rounded-md px-2.5 py-1.5 font-bold transition-all ${
                  d === days ? 'bg-[#FF4D24] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {d === 1 ? '24h' : `${d}d`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`rounded-lg border px-3 py-2 font-semibold transition-all ${
              autoRefresh ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400' : 'border-neutral-800 bg-neutral-900 text-neutral-500'
            }`}
          >
            {autoRefresh ? '⏱️ Auto 20s' : '⏸️ Paused'}
          </button>

          <button
            onClick={() => void trigger('daily')}
            disabled={sending !== null}
            className="rounded-lg bg-neutral-800 px-3 py-2 font-semibold text-neutral-200 hover:bg-neutral-700 disabled:opacity-50"
          >
            {sending === 'daily' ? 'Dispatching…' : '🌅 Morning Telegram'}
          </button>

          <button
            onClick={() => void trigger('weekly')}
            disabled={sending !== null}
            className="rounded-lg bg-neutral-800 px-3 py-2 font-semibold text-neutral-200 hover:bg-neutral-700 disabled:opacity-50"
          >
            {sending === 'weekly' ? 'Dispatching…' : '📅 Weekly Telegram'}
          </button>
        </div>
      </div>

      {sentMsg ? (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs font-semibold text-emerald-300 flex items-center justify-between">
          <span>{sentMsg}</span>
          <button onClick={() => setSentMsg('')} className="text-neutral-500 hover:text-white">✕</button>
        </div>
      ) : null}

      {ov ? (
        <div className="space-y-6">
          {/* Main KPI Strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            <Kpi
              label="Gross Revenue"
              value={inr(ov.revenue)}
              hint={`${ov.orders} orders (${ov.prepaidOrders} prepaid • ${ov.codOrders} COD)`}
              highlight
            />
            <Kpi
              label="Visitors & Sessions"
              value={`${ov.visits}`}
              hint={`${ov.uniqueSessions} unique shoppers (${ov.bounceRatePct}% bounce)`}
            />
            <Kpi
              label="Avg Time On Site"
              value={formatDuration(ov.avgSessionSec)}
              hint={`${ov.engagedSessions} engaged multi-page sessions`}
            />
            <Kpi
              label="Conversion Rate"
              value={`${ov.conversionPct}%`}
              hint={`AOV ${inr(ov.aov)} • ${ov.cartToOrderPct}% cart complete`}
            />
            <Kpi
              label="Actions & Clicks"
              value={`${ov.clicks}`}
              hint={`${ov.addToCarts} cart adds • ${ov.checkoutsInitiated} checkouts`}
            />
            <Kpi
              label="COD Cash Pipeline"
              value={inr(ov.codCashGap.amount)}
              hint={`${ov.codCashGap.orders} in flight • ${ov.codCashGap.unconfirmed} unconfirmed`}
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-800 gap-1">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'live' ? 'border-[#FF4D24] text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>🔴 Live Activity Stream</span>
              <span className="rounded-full bg-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-400">{ov.liveEvents.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('funnel')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'funnel' ? 'border-[#FF4D24] text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              📊 Conversion Funnel
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'ai' ? 'border-[#FF4D24] text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              🧠 Gemini Growth Strategist
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'analytics' ? 'border-[#FF4D24] text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              📈 Trends & Sources
            </button>
          </div>

          {/* TAB 1: LIVE ACTIVITY STREAM */}
          {activeTab === 'live' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Live Visitor Event Stream</span>
                    <span className="text-[11px] text-neutral-500">(Latest 40 actions captured across storefront)</span>
                  </div>
                  <button
                    onClick={() => void load(days)}
                    className="text-xs font-semibold text-[#FF4D24] hover:underline"
                  >
                    Refresh Stream ↻
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        <th className="py-2.5 px-3">Time (IST)</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Page / Target</th>
                        <th className="py-2.5 px-3">Product / Detail</th>
                        <th className="py-2.5 px-3">Device & Source</th>
                        <th className="py-2.5 px-3 font-mono">Session ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-sans">
                      {ov.liveEvents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-500">
                            No visitor events in this window yet. Visit <a href="https://rareember.shop" target="_blank" className="text-[#FF4D24] underline">rareember.shop</a> in a new tab to see events stream live.
                          </td>
                        </tr>
                      ) : (
                        ov.liveEvents.map((e, idx) => (
                          <tr key={idx} className="hover:bg-neutral-800/30 transition-colors">
                            <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap">
                              {new Date(e.ts).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                  e.type === 'pageview'
                                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                    : e.type === 'view_product'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : e.type === 'add_to_cart'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : e.type === 'initiate_checkout'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                }`}
                              >
                                {e.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-neutral-200 font-mono text-[11px] max-w-xs truncate">
                              {e.path}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-300">
                              {e.product_id ? (
                                <span className="text-orange-300 font-medium">{e.product_id}</span>
                              ) : e.label ? (
                                <span className="text-neutral-400">"{e.label}"</span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap">
                              <span>{e.device === 'mobile' ? '📱 Mobile' : e.device === 'desktop' ? '💻 Desktop' : '📱 ' + e.device}</span>
                              {e.referrer && e.referrer !== 'direct' ? (
                                <span className="ml-1 text-neutral-500 font-mono text-[10px]">via {e.referrer}</span>
                              ) : null}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-neutral-500">
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
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
                <h3 className="text-base font-bold text-white mb-2">5-Stage Storefront Conversion Funnel</h3>
                <p className="text-xs text-neutral-400 mb-6">Track where customers progress or drop off from landing page to confirmed order.</p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">1. Store Visits</div>
                    <div className="mt-2 text-2xl font-black text-sky-400">{ov.funnel.visits}</div>
                    <div className="mt-1 text-[11px] text-neutral-400">{ov.uniqueSessions} unique shoppers</div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">2. Product Views</div>
                    <div className="mt-2 text-2xl font-black text-purple-400">{ov.funnel.productViews}</div>
                    <div className="mt-1 text-[11px] text-neutral-400">
                      {ov.funnel.visits ? `${Math.round((ov.funnel.productViews / ov.funnel.visits) * 100)}% view rate` : '0%'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">3. Add To Bag</div>
                    <div className="mt-2 text-2xl font-black text-amber-400">{ov.funnel.addToCarts}</div>
                    <div className="mt-1 text-[11px] text-neutral-400">
                      {ov.funnel.productViews ? `${Math.round((ov.funnel.addToCarts / Math.max(1, ov.funnel.productViews)) * 100)}% view-to-cart` : '0%'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">4. Checkout Started</div>
                    <div className="mt-2 text-2xl font-black text-orange-400">{ov.funnel.checkouts}</div>
                    <div className="mt-1 text-[11px] text-neutral-400">
                      {ov.funnel.addToCarts ? `${Math.round((ov.funnel.checkouts / Math.max(1, ov.funnel.addToCarts)) * 100)}% cart-to-checkout` : '0%'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">5. Completed Orders</div>
                    <div className="mt-2 text-2xl font-black text-emerald-300">{ov.funnel.orders}</div>
                    <div className="mt-1 text-[11px] text-emerald-400/80">
                      Overall {ov.conversionPct}% conversion
                    </div>
                  </div>
                </div>
              </div>

              {/* Demand Heatmap */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                  <BarList label="Most Viewed Products" rows={ov.topProducts} fmt={(n) => `×${n}`} />
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                  <BarList label="Top Store Pages Looked At" rows={ov.topPaths} color="#fbbf24" fmt={(n) => `×${n}`} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GEMINI AI STRATEGIST */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-950/20 via-neutral-900/60 to-neutral-950 p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🧠</span>
                      <h3 className="text-lg font-black text-white">Autonomous Gemini 3.8 Flash Growth Strategist</h3>
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">
                      Pipes live customer engagement, stay duration, cart drop-offs, and order PnL into Google Gemini to synthesize immediate tactical upgrades.
                    </p>
                  </div>
                  <button
                    onClick={runAiStrategy}
                    disabled={aiGenerating}
                    className="rounded-xl bg-gradient-to-r from-[#FF4D24] via-[#FF6B35] to-[#FF9900] px-5 py-3 text-xs font-black text-white shadow-[0_8px_24px_rgba(255,77,36,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {aiGenerating ? 'Analyzing Past Data with Gemini…' : '⚡ Generate AI Strategy Now'}
                  </button>
                </div>

                {liveStrategy ? (
                  <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-950 p-5 text-sm text-neutral-200 whitespace-pre-line leading-relaxed shadow-inner">
                    {liveStrategy}
                  </div>
                ) : null}
              </div>

              {/* Historical Reports */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-bold text-white">Sent Reports History (Telegram & Database)</div>
                  <div className="text-xs text-neutral-500">Autonomous 08:00 IST Morning & Weekly Crons</div>
                </div>
                <div className="space-y-3">
                  {reports.length === 0 ? (
                    <div className="text-xs text-neutral-600 py-4 text-center">No reports archived yet. Use buttons above to dispatch one.</div>
                  ) : null}
                  {reports.map((r, i) => (
                    <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
                      <div className="mb-2 flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="rounded bg-neutral-800 px-2 py-0.5 font-bold uppercase tracking-wider text-orange-400">
                          {r.kind}
                        </span>
                        <span>{new Date(r.ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                      </div>
                      <p className="whitespace-pre-line text-xs text-neutral-300 font-sans leading-relaxed">{r.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS & TRENDS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                  <LineChart label="Revenue Trend (₹)" points={ov.byDay.map((d) => ({ date: d.date, value: d.revenue }))} fmt={inr} color="#ff6b35" />
                  <div className="mt-4 h-px bg-neutral-800" />
                  <LineChart label="Store Visits / Day" points={ov.byDay.map((d) => ({ date: d.date, value: d.visits }))} color="#7dd3fc" />
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                  <LineChart label="Orders Placed (COD vs Prepaid)" points={ov.byDay.map((d) => ({ date: d.date, value: d.orders }))} color="#a3e635" />
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
                    <div>COD: <b className="text-white">{ov.codOrders}</b></div>
                    <div>Prepaid: <b className="text-white">{ov.prepaidOrders}</b></div>
                    <div>Returns: <b className="text-white">{ov.returns.refunded + ov.returns.cancelled + ov.returns.returned}</b></div>
                  </div>
                  <div className="mt-4 h-px bg-neutral-800" />
                  <BarList label="Device Split" rows={ov.deviceSplit.slice(0, 4)} color="#c4b5fd" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                  <BarList label="Traffic Referral Sources" rows={ov.topReferrers} color="#7dd3fc" fmt={(n) => `×${n}`} />
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                  <BarList label="Security & Rate-Limit Events" rows={ov.security} color="#f87171" fmt={(n) => `×${n}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-sm text-neutral-400">
          {loading ? 'Compiling store telemetry…' : error || 'No data found.'}
        </div>
      )}
    </div>
  );
}
