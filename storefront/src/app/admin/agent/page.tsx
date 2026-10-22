'use client';

/**
 * AI Agent Dashboard (/admin/agent)
 * Unlocks with the same master key as /admin/orders.
 * Shows: traffic, sales, COD cash gap, funnel, top content, security,
 * 7-day forecast, agent reports. Can trigger daily/weekly reports on demand.
 */
import { useCallback, useEffect, useState } from 'react';
import { LineChart, BarList } from '@/components/admin/AgentCharts';

const KEY_STORAGE = 'rareember_admin_vault_key';

interface NamedCount { name: string; value: number }
interface Overview {
  from: string; to: string; days: number;
  visits: number; uniqueSessions: number; engagedSessions: number; bounceRatePct: number; avgSessionSec: number;
  productViews: number; addToCarts: number;
  orders: number; revenue: number; aov: number; conversionPct: number; cartToOrderPct: number;
  codOrders: number; prepaidOrders: number;
  codCashGap: { orders: number; amount: number; unconfirmed: number };
  returns: { cancelled: number; refunded: number; returned: number };
  topProducts: NamedCount[]; topReferrers: NamedCount[]; topPaths: NamedCount[]; deviceSplit: NamedCount[];
  security: NamedCount[];
  byDay: { date: string; visits: number; orders: number; revenue: number; codOrders: number; prepaidOrders: number }[];
  dataIssue: string | null;
}
interface Report { ts: string; kind: string; summary: string }

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const Kpi = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
    <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
    <div className="mt-1 text-lg font-semibold text-neutral-100">{value}</div>
    {hint ? <div className="mt-0.5 text-[11px] text-neutral-500">{hint}</div> : null}
  </div>
);

export default function AdminAgentPage() {
  const [key, setKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(14);
  const [ov, setOv] = useState<Overview | null>(null);
  const [fp, setFp] = useState<{ points?: { date: string; revenue: number }[]; note: string; nextRevenue: number } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [sending, setSending] = useState<'daily' | 'weekly' | null>(null);
  const [sentMsg, setSentMsg] = useState('');

  const load = useCallback(
    async (range: number, keyOverride?: string) => {
      const k = keyOverride ?? key;
      if (!k) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/agent/overview?days=${range}`, { headers: { Authorization: `Bearer ${k}` } });
        const data = await res.json();
        if (!res.ok && res.status !== 503) throw new Error(data.error || 'Load failed');
        if (res.status === 503) {
          setError(data.error || 'Agent backend not configured.');
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

  const unlock = () => {
    if (!key.trim()) return setError('Enter your master key.');
    sessionStorage.setItem(KEY_STORAGE, key.trim());
    void load(days);
  };

  const trigger = async (kind: 'daily' | 'weekly') => {
    setSending(kind);
    setSentMsg('');
    try {
      const res = await fetch(`/api/agent/${kind}`, { method: 'POST', headers: { Authorization: `Bearer ${key}` } });
      const data = await res.json();
      setSentMsg(res.ok ? `✅ ${kind} report sent to Telegram.` : `⚠️ ${data.error || 'Failed'}`);
      if (res.ok) void load(days);
    } catch {
      setSentMsg('⚠️ Request failed.');
    } finally {
      setSending(null);
    }
  };

  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4">
        <h1 className="mb-1 text-xl font-bold text-neutral-100">🤖 AI Agent Dashboard</h1>
        <p className="mb-4 text-sm text-neutral-500">Same master key as the orders panel.</p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && unlock()}
          placeholder="Master key"
          className="mb-2 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
        />
        <button onClick={unlock} className="rounded bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-500">
          Unlock
        </button>
        {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      </div>
    );
  }

  const docs = ov ? (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">🤖 AI Agent Dashboard</h1>
          <p className="text-xs text-neutral-500">
            {ov.from} → {ov.to} ({ov.days}d){ov.dataIssue ? ` • ⚠️ ${ov.dataIssue}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => { setDays(d); void load(d); }}
              className={`rounded px-2 py-1 ${d === days ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={() => void trigger('daily')}
            disabled={sending !== null}
            className="rounded bg-neutral-800 px-2 py-1 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
          >
            {sending === 'daily' ? 'Sending…' : 'Send daily now'}
          </button>
          <button
            onClick={() => void trigger('weekly')}
            disabled={sending !== null}
            className="rounded bg-neutral-800 px-2 py-1 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
          >
            {sending === 'weekly' ? 'Analyzing…' : 'Send weekly plan'}
          </button>
        </div>
      </div>

      {sentMsg ? <p className="text-xs text-green-400">{sentMsg}</p> : null}

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Kpi label="Revenue" value={inr(ov.revenue)} hint={`${ov.orders} orders • AOV ${inr(ov.aov)}`} />
        <Kpi label="Visits" value={String(ov.visits)} hint={`${ov.uniqueSessions} sessions • ${ov.bounceRatePct}% bounce`} />
        <Kpi label="Conversion" value={`${ov.conversionPct}%`} hint={`${ov.addToCarts} carts → ${ov.cartToOrderPct}% complete`} />
        <Kpi label="COD cash gap" value={inr(ov.codCashGap.amount)} hint={`${ov.codCashGap.orders} open • ${ov.codCashGap.unconfirmed} unconfirmed`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <LineChart label="Revenue / day" points={ov.byDay.map((d) => ({ date: d.date, value: d.revenue }))} fmt={inr} color="#ff6b35" />
          <div className="mt-2 h-px bg-neutral-800" />
          <LineChart label="Visits / day" points={ov.byDay.map((d) => ({ date: d.date, value: d.visits }))} color="#7dd3fc" />
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <LineChart label="Orders / day (COD vs prepaid)" points={ov.byDay.map((d) => ({ date: d.date, value: d.orders }))} color="#a3e635" />
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-400">
            <div>COD: <b className="text-neutral-200">{ov.codOrders}</b></div>
            <div>Prepaid: <b className="text-neutral-200">{ov.prepaidOrders}</b></div>
            <div>Returns: <b className="text-neutral-200">{ov.returns.refunded + ov.returns.cancelled + ov.returns.returned}</b></div>
          </div>
          <div className="mt-2 h-px bg-neutral-800" />
          <BarList label="Devices" rows={ov.deviceSplit.slice(0, 4)} color="#c4b5fd" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <BarList label="Top products (views)" rows={ov.topProducts} fmt={(n) => `×${n}`} />
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <BarList label="Top traffic sources" rows={ov.topReferrers} color="#7dd3fc" fmt={(n) => `×${n}`} />
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <BarList label="Top pages" rows={ov.topPaths} color="#fbbf24" fmt={(n) => `×${n}`} />
        </div>
      </div>

      <div className="rounded-lg border border-orange-700/40 bg-orange-950/20 p-4">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-semibold text-orange-300">🔮 7-day forecast</div>
          <div className="text-xs text-neutral-400">{fp?.note}</div>
        </div>
        <div className="mt-2 text-2xl font-bold text-orange-200">{fp ? inr(fp.nextRevenue) : '—'}</div>
        <div className="mt-1 text-xs text-neutral-500">projected revenue, next 7 days (linear trend of the window)</div>
        {fp?.points ? (
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-neutral-400 md:grid-cols-7">
            {fp.points.map((p) => (
              <div key={p.date} className="rounded bg-neutral-900/70 p-2">
                <div className="text-neutral-500">{p.date.slice(5)}</div>
                <div className="text-neutral-200">{inr(p.revenue)}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <BarList label="🛡 Security events" rows={ov.security} color="#f87171" fmt={(n) => `×${n}`} />
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="mb-2 text-xs text-neutral-400">🤖 Latest agent reports</div>
          <div className="space-y-3">
            {reports.length === 0 ? <div className="text-xs text-neutral-600">No reports yet — send one above.</div> : null}
            {reports.map((r) => (
              <div key={r.ts} className="rounded border border-neutral-800 bg-neutral-900/70 p-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="rounded bg-neutral-800 px-1.5 py-0.5 uppercase">{r.kind}</span>
                  <span>{new Date(r.ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                </div>
                <p className="whitespace-pre-line text-xs text-neutral-300">{r.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-sm text-neutral-400">{loading ? 'Loading…' : error || 'No data.'}</div>
  );

  return <div className="mx-auto max-w-6xl px-4 py-6">{docs}</div>;
}