import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { getOverview, forecast, inr } from '@/lib/agent/analytics';
import { askAgent } from '@/lib/agent/ai';
import { getServiceSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rl = checkRateLimit(`agent_strategy:${clientIp(req.headers)}`, 10, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  try {
    const ov = await getOverview(7);
    const fc = forecast(ov.byDay, 7);

    const data = {
      window: { from: ov.from, to: ov.to, days: 7 },
      traffic: {
        visits: ov.visits,
        uniqueSessions: ov.uniqueSessions,
        engagedSessions: ov.engagedSessions,
        bouncePct: ov.bounceRatePct,
        avgStaySec: ov.avgSessionSec,
        topPaths: ov.topPaths,
        topReferrers: ov.topReferrers,
        deviceSplit: ov.deviceSplit,
      },
      interactions: {
        productViews: ov.productViews,
        addToCarts: ov.addToCarts,
        clicks: ov.clicks,
        checkouts: ov.checkoutsInitiated,
        funnel: ov.funnel,
      },
      commercials: {
        orders: ov.orders,
        revenue: ov.revenue,
        aov: ov.aov,
        conversionPct: ov.conversionPct,
        cartToOrderPct: ov.cartToOrderPct,
        codOrders: ov.codOrders,
        prepaidOrders: ov.prepaidOrders,
        codCashGap: ov.codCashGap,
        returns: ov.returns,
      },
      topProducts: ov.topProducts,
      forecast: { next7Revenue: fc.points.reduce((s, p) => s + p.revenue, 0), trend: fc.note },
    };

    const system =
      'You are the Principal AI Growth Strategist for Rare Ember (https://rareember.shop), high-street Indian D2C streetwear (Tirupur manufacturing, Razorpay UPI prepaid + COD). ' +
      'Analyze the store telemetry: visitor stay time, pages viewed, clicks, drop-offs, and orders. ' +
      'Provide an executive-level strategic upgrade plan formatted with Markdown and bullet points.\n\n' +
      'Structure:\n' +
      '### 1. Performance Diagnostics & User Behavior\n' +
      'Summarize on-site time, where users drop off, and conversion bottleneck based on real data.\n\n' +
      '### 2. High-Impact Fixes (Eliminate Drop-Offs)\n' +
      'Provide 3 concrete, specific UX, copy, or catalog adjustments to keep visitors on-site longer.\n\n' +
      '### 3. Immediate Revenue & Bundle Upgrades\n' +
      'Recommend 2 tailored product bundles (e.g. 2-Tee packs or Hoodies) to maximize AOV.\n\n' +
      '### 4. RTO & COD Margin Protection\n' +
      'Specific operational tactics to ensure cash collection and prevent fake orders.\n\n' +
      'Tone: Crisp, quantitative, Rupee (₹) grounded. Never invent fictitious numbers.';

    const plan = await askAgent(JSON.stringify(data), system, 1200);

    const resultText =
      plan ||
      `### ⚡ AI Strategy Directive\n\n• **Store Traffic:** ${ov.visits} visits across ${ov.uniqueSessions} unique sessions (avg stay: ${Math.floor(ov.avgSessionSec / 60)}m ${ov.avgSessionSec % 60}s).\n• **Conversion Rate:** ${ov.conversionPct}% with AOV of ${inr(ov.aov)}.\n• **COD Pipeline:** ${inr(ov.codCashGap.amount)} across ${ov.codCashGap.orders} orders.\n• **Top Action:** Introduce limited-time bundles around top viewed products (${ov.topProducts[0]?.name || 'Flagship drops'}) and incentivize prepaid UPI checkout.`;

    // Persist in agent_reports table
    try {
      let sb = getServiceSupabase();
      if (!sb) {
        const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (u && k) {
          const { createClient } = await import('@supabase/supabase-js');
          sb = createClient(u, k);
        }
      }
      if (sb) {
        await sb.from('agent_reports').insert({
          kind: 'strategy',
          summary: resultText.slice(0, 2000),
          body: data,
        });
      }
    } catch {}

    return NextResponse.json({ ok: true, strategy: resultText, data });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
