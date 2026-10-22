/**
 * AI Store Manager data layer (server-only).
 * Reads orders + analytics_events + security_events + agent_reports via the
 * SERVICE-ROLE key only — under RLS nothing else can read them.
 * All figures are aggregates; no PII is read or reported.
 */
import { getServiceSupabase } from '@/lib/supabase-server';

export interface DayPoint {
  date: string;
  visits: number;
  orders: number;
  revenue: number;
  codOrders: number;
  prepaidOrders: number;
}

export interface NamedCount {
  name: string;
  value: number;
}

export interface Overview {
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
  byDay: DayPoint[];
  liveEvents: Array<{
    ts: string;
    type: string;
    path: string;
    session_id: string;
    product_id?: string;
    referrer?: string;
    device?: string;
    label?: string;
  }>;
  funnel: {
    visits: number;
    productViews: number;
    addToCarts: number;
    checkouts: number;
    orders: number;
  };
  dataIssue: string | null;
}

const PADAYS = (n: number, ist = true): { fromIso: string; days: DayPoint[] } => {
  const out: DayPoint[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    out.push({
      date: d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      visits: 0,
      orders: 0,
      revenue: 0,
      codOrders: 0,
      prepaidOrders: 0,
    });
  }
  const first = new Date(now.getTime() - n * 86_400_000);
  return { fromIso: first.toISOString(), days: out };
};

function istDay(ts: string): string {
  return new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function refHost(r: string | null): string {
  if (!r) return 'direct';
  try {
    const u = new URL(r);
    return u.hostname.replace(/^www\./, '') || 'direct';
  } catch {
    return r.slice(0, 40);
  }
}

export async function getOverview(days = 14): Promise<Overview> {
  let sb = getServiceSupabase();
  if (!sb) {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (u && k) {
      const { createClient } = await import('@supabase/supabase-js');
      sb = createClient(u, k);
    }
  }
  if (!sb) throw new Error('Supabase client is not configured — the AI agent cannot read store data.');
  const n = Math.min(90, Math.max(1, Math.floor(days)));
  const { fromIso, days: byDay } = PADAYS(n);

  let dataIssue: string | null = null;

  const [evRes, ordRes, secRes] = await Promise.all([
    sb
      .from('analytics_events')
      .select('ts,type,path,session_id,referrer,product_id,meta')
      .gte('ts', fromIso)
      .order('ts', { ascending: false })
      .limit(20_000),
    sb
      .from('orders')
      .select('id,total_amount,status,payment_method,created_at,cod_confirmed')
      .gte('created_at', fromIso)
      .order('created_at', { ascending: false })
      .limit(5_000),
    sb
      .from('security_events')
      .select('ts,kind')
      .gte('ts', fromIso)
      .limit(5_000),
  ]);

  if (evRes.error) dataIssue = 'analytics_events read failed: ' + evRes.error.message;
  if (ordRes.error && !dataIssue) dataIssue = 'orders read failed: ' + ordRes.error.message;

  const events = (evRes.data ?? []) as Array<Record<string, unknown>>;
  const orders = (ordRes.data ?? []) as Array<Record<string, unknown>>;
  const secRows = (secRes.data ?? []) as Array<Record<string, unknown>>;

  // Aggregate events.
  let visits = 0;
  let productViews = 0;
  let addToCarts = 0;
  let clicks = 0;
  let checkoutsInitiated = 0;
  const sessions = new Map<string, { count: number; first: number; last: number }>();
  const prodCounts = new Map<string, number>();
  const pathCounts = new Map<string, number>();
  const refCounts = new Map<string, number>();
  const devCounts = new Map<string, number>();

  for (const e of events) {
    const type = String(e.type || '');
    const day = istDay(String(e.ts || ''));
    const slot = byDay.find((p) => p.date === day);
    const path = String(e.path || '/');
    if (type === 'pageview') {
      visits++;
      if (slot) slot.visits++;
      if (!String(path).startsWith('/api') && !String(path).startsWith('/admin')) {
        pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
      }
      const sid = String(e.session_id || '').slice(0, 64);
      if (sid) {
        const t = new Date(String(e.ts)).getTime();
        const s = sessions.get(sid) || { count: 0, first: t, last: t };
        s.count++;
        s.first = Math.min(s.first, t);
        s.last = Math.max(s.last, t);
        sessions.set(sid, s);
        const dev = String((e.meta as any)?.d || 'other');
        devCounts.set(dev, (devCounts.get(dev) || 0) + 1);
      }
      const ref = refHost(String(e.referrer || '') || null);
      refCounts.set(ref, (refCounts.get(ref) || 0) + 1);
    } else if (type === 'view_product') {
      productViews++;
      const pid = String(e.product_id || '').slice(0, 120);
      if (pid) prodCounts.set(pid, (prodCounts.get(pid) || 0) + 1);
    } else if (type === 'add_to_cart') {
      addToCarts++;
    } else if (type === 'click') {
      clicks++;
    } else if (type === 'initiate_checkout') {
      checkoutsInitiated++;
    }
  }

  let engaged = 0;
  let sessionSecTotal = 0;
  for (const s of sessions.values()) {
    if (s.count >= 2) engaged++;
    sessionSecTotal += Math.max(0, Math.min(1_800, (s.last - s.first) / 1000));
  }

  // Aggregate orders.
  let revenue = 0;
  let codOrders = 0;
  let prepaidOrders = 0;
  let codGapOrders = 0;
  let codGapAmount = 0;
  let codUnconfirmed = 0;
  let cancelled = 0;
  let refunded = 0;
  let returnedN = 0;
  for (const o of orders) {
    const st = String(o.status || 'pending').toLowerCase();
    const amt = Number(o.total_amount) || 0;
    const isCod = String(o.payment_method || '').toLowerCase() === 'cod';
    const day = istDay(String(o.created_at || ''));
    const slot = byDay.find((p) => p.date === day);
    const live = !(st === 'cancelled' || st === 'refunded');
    if (st === 'cancelled') cancelled++;
    else if (st === 'refunded') refunded++;
    else if (st === 'returned') returnedN++;
    if (slot && live && st !== 'returned') {
      slot.orders++;
      slot.revenue += amt;
      if (isCod) slot.codOrders++;
      else slot.prepaidOrders++;
    }
    if (live && st !== 'returned') {
      revenue += amt;
      if (isCod) {
        codOrders++;
        if (st !== 'delivered') {
          codGapOrders++;
          codGapAmount += amt;
          if (!o.cod_confirmed) codUnconfirmed++;
        }
      } else prepaidOrders++;
    }
  }

  const uniqueSessions = sessions.size;
  const ordersLive = codOrders + prepaidOrders;
  const liveEvents = events.slice(0, 40).map((e) => ({
    ts: String(e.ts || ''),
    type: String(e.type || 'pageview'),
    path: String(e.path || '/'),
    session_id: String(e.session_id || '').slice(0, 16),
    product_id: e.product_id ? String(e.product_id) : undefined,
    referrer: e.referrer ? refHost(String(e.referrer)) : undefined,
    device: String((e.meta as any)?.d || 'desktop'),
    label: (e.meta as any)?.label ? String((e.meta as any).label) : undefined,
  }));

  const funnel = {
    visits,
    productViews,
    addToCarts,
    checkouts: checkoutsInitiated,
    orders: ordersLive,
  };

  const ov: Overview = {
    from: byDay[0]?.date || '',
    to: byDay[byDay.length - 1]?.date || '',
    days: n,
    visits,
    uniqueSessions,
    engagedSessions: engaged,
    bounceRatePct: uniqueSessions ? Math.round(((uniqueSessions - engaged) / uniqueSessions) * 100) : 0,
    avgSessionSec: uniqueSessions ? Math.round(sessionSecTotal / uniqueSessions) : 0,
    productViews,
    addToCarts,
    clicks,
    checkoutsInitiated,
    orders: ordersLive,
    revenue,
    aov: ordersLive ? Math.round(revenue / ordersLive) : 0,
    conversionPct: visits ? +((ordersLive / visits) * 100).toFixed(2) : 0,
    cartToOrderPct: addToCarts ? +((ordersLive / addToCarts) * 100).toFixed(1) : 0,
    codOrders,
    prepaidOrders,
    codCashGap: {
      orders: codGapOrders,
      amount: Math.round(codGapAmount),
      unconfirmed: codUnconfirmed,
    },
    returns: { cancelled, refunded, returned: returnedN },
    topProducts: [...prodCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    topReferrers: [...refCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    topPaths: [...pathCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    deviceSplit: [...devCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4),
    security: (() => {
      const secCounts = new Map<string, number>();
      for (const r of secRows) {
        const k = String(r.kind || 'unknown');
        secCounts.set(k, (secCounts.get(k) || 0) + 1);
      }
      return [...secCounts.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    })(),
    byDay,
    liveEvents,
    funnel,
    dataIssue,
  };
  return ov;
}

/** Lean linear regression over the last points; returns the next horizon days. */
export function forecast(byDay: DayPoint[], horizon = 7): {
  points: DayPoint[];
  slopeRevenue: number;
  totalRevenue: number;
  note: string;
} {
  const hist = byDay.slice(-14);
  const xs = hist.map((_, i) => i);
  const rev = hist.map((d) => d.revenue);
  const vis = hist.map((d) => d.visits);
  const fit = (ys: number[]): { a: number; b: number } => {
    const n2 = xs.length;
    const mx = xs.reduce((s, v) => s + v, 0) / n2;
    const my = ys.reduce((s, v) => s + v, 0) / n2;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n2; i++) {
      num += (xs[i] - mx) * (ys[i] - my);
      den += (xs[i] - mx) ** 2;
    }
    const a = den ? num / den : 0;
    return { a, b: my - a * mx };
  };
  const fr = fit(rev);
  const fv = fit(vis);
  const totalRevenue = rev.reduce((s, v) => s + v, 0);
  const points: DayPoint[] = [];
  const lastDate = new Date(hist[hist.length - 1]?.date || new Date().toISOString());
  for (let i = 1; i <= horizon; i++) {
    const d = new Date(lastDate.getTime() + i * 86_400_000);
    points.push({
      date: d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      visits: Math.max(0, Math.round(fv.b + fv.a * (xs.length + i - 1))),
      orders: 0,
      revenue: Math.max(0, Math.round(fr.b + fr.a * (xs.length + i - 1))),
      codOrders: 0,
      prepaidOrders: 0,
    });
  }
  let note = 'stable';
  if (totalRevenue === 0) note = 'no sales in window — forecast unreliable until first orders land';
  else if (fr.a > 5) note = 'revenue trending UP';
  else if (fr.a < -5) note = 'revenue trending DOWN — act on weekly plan';
  return { points, slopeRevenue: fr.a, totalRevenue, note };
}

export const inr = (n: number): string => '₹' + Math.round(n).toLocaleString('en-IN');