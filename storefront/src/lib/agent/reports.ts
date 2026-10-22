/**
 * The AI Store Manager's own reports.
 * Daily (08:00 IST via cron): sales, reach, COD cash gap, forecast, one tip.
 * Weekly (Monday 08:00 IST): full-week metrics piped through the LLM as a
 * growth strategist, sent to Telegram and stored for the admin panel.
 */
import { getOverview, forecast, inr, type Overview } from '@/lib/agent/analytics';
import { askAgent } from '@/lib/agent/ai';
import { sendTelegramText } from '@/lib/agent/telegram';
import { getServiceSupabase } from '@/lib/supabase-server';

const ADMIN_LINK = '📊 <a href="https://rareember.shop/admin/agent">Open Agent Dashboard</a>';

function ruleTip(ov: Overview): string {
  if (ov.visits > 10 && ov.orders === 0) {
    return `🧭 <b>Focus:</b> ${ov.visits} visitors with 0 orders — traffic sees the store but does not buy. Add a limited-time festival bundle banner above the fold and surface the COD badge on every PDP.`;
  }
  if (ov.codCashGap.amount > ov.revenue * 0.5) {
    return `🧭 <b>Focus:</b> COD cash gap is ${inr(ov.codCashGap.amount)} (${ov.codCashGap.unconfirmed} unconfirmed). Push WhatsApp confirmations and offer a ₹30 prepaid incentive on COD-heavy pincodes.`;
  }
  if (ov.bounceRatePct > 70 && ov.uniqueSessions > 10) {
    return `🧭 <b>Focus:</b> ${ov.bounceRatePct}% of sessions bounce. Sharpen hero copy on ${ov.topPaths[0]?.name || '/'} and add a bestseller strip above the fold.`;
  }
  if (ov.addToCarts > ov.orders * 2 && ov.addToCarts > 0) {
    return `🧭 <b>Focus:</b> ${ov.addToCarts} carts vs ${ov.orders} orders (cart-to-order ${ov.cartToOrderPct}%). Retarget drop-offs inside the cart drawer with a COD reminder and shipping reassurance.`;
  }
  return `🧭 <b>Focus:</b> attach-rate lever — build a 2-item bundle around ${ov.topProducts[0]?.name || 'your bestseller'} and promote it with a save-and-claim offer.`;
}

async function storeReport(kind: 'daily' | 'weekly', text: string, data: object): Promise<void> {
  const sb = getServiceSupabase();
  if (!sb) return;
  try {
    await sb.from('agent_reports').insert({ kind, summary: text.slice(0, 2000), body: data });
  } catch (err) {
    console.error('agent_reports insert failed:', err);
  }
}

/** Prune raw events so the tables stay small. 180d analytics / 90d security. */
async function pruneOldEvents(): Promise<void> {
  const sb = getServiceSupabase();
  if (!sb) return;
  try {
    await sb.from('analytics_events').delete().lt('ts', new Date(Date.now() - 180 * 86_400_000).toISOString());
    await sb.from('security_events').delete().lt('ts', new Date(Date.now() - 90 * 86_400_000).toISOString());
  } catch (err) {
    console.error('prune failed:', err);
  }
}

export async function sendDailyReport(): Promise<{ ok: boolean; text: string; error?: string }> {
  let ov: Overview;
  let fc: ReturnType<typeof forecast>;
  try {
    ov = await getOverview(1);
    fc = forecast(ov.byDay, 7);
  } catch (err) {
    const text =
      `🤖 <b>Rare Ember AI Agent</b>\n\n` +
      `⚠️ Cannot build the daily report: <b>${String(err instanceof Error ? err.message : err).slice(0, 200)}</b>\n` +
      `Set <code>SUPABASE_SERVICE_ROLE_KEY</code> in the Vercel env to enable store reads.`;
    await sendTelegramText(text);
    return { ok: false, text, error: String(err) };
  }

  void pruneOldEvents();

  const text =
    `🌞 <b>RARE EMBER DAILY</b> — ${ov.byDay[0]?.date || ''}\n\n` +
    `💰 Sales: <b>${inr(ov.revenue)}</b> from <b>${ov.orders}</b> orders (COD ${ov.codOrders} • Prepaid ${ov.prepaidOrders})\n` +
    `💳 AOV: <b>${inr(ov.aov)}</b> • Conversion: <b>${ov.conversionPct}%</b>\n` +
    `🚨 COD cash gap: <b>${inr(ov.codCashGap.amount)}</b> (${ov.codCashGap.orders} in pipeline, ${ov.codCashGap.unconfirmed} unconfirmed)\n` +
    `👁 Reach: <b>${ov.visits}</b> visits • ${ov.uniqueSessions} sessions • avg ${Math.floor(ov.avgSessionSec / 60)}m on-site\n` +
    `🔥 Top source: <b>${ov.topReferrers[0]?.name || 'direct'}</b> (${ov.topReferrers[0]?.value || 0})\n` +
    `❌ Returns/cancels: ${ov.returns.cancelled + ov.returns.refunded + ov.returns.returned}\n` +
    `🔮 Forecast 7d: <b>${inr(fc.points.reduce((s, p) => s + p.revenue, 0))}</b> ${fc.note}\n` +
    `🛡 Security: ${ov.security.length ? ov.security.map((s) => `${s.name}×${s.value}`).join(', ') : 'all clear'}\n\n` +
    ruleTip(ov) +
    `\n\n${ADMIN_LINK}`;

  await sendTelegramText(text);
  await storeReport('daily', text, ov as unknown as object);
  return { ok: true, text };
}

export async function sendWeeklyReport(): Promise<{ ok: boolean; text: string; error?: string }> {
  let ov: Overview;
  let fc: ReturnType<typeof forecast>;
  try {
    ov = await getOverview(7);
    fc = forecast(ov.byDay, 7);
  } catch (err) {
    const text =
      `🤖 <b>Rare Ember AI Agent — Weekly</b>\n\n⚠️ Cannot build the weekly analysis: <b>${String(err instanceof Error ? err.message : err).slice(0, 200)}</b>`;
    await sendTelegramText(text);
    return { ok: false, text, error: String(err) };
  }

  const data = {
    window: { from: ov.from, to: ov.to },
    revenue: ov.revenue,
    orders: ov.orders,
    aov: ov.aov,
    conversionPct: ov.conversionPct,
    cod: { orders: ov.codOrders, cashGap: ov.codCashGap, returns: ov.returns },
    prepaidOrders: ov.prepaidOrders,
    traffic: {
      visits: ov.visits,
      sessions: ov.uniqueSessions,
      engagedSessions: ov.engagedSessions,
      bouncePct: ov.bounceRatePct,
      avgSessionSec: ov.avgSessionSec,
      productViews: ov.productViews,
      addToCart: ov.addToCarts,
      topReferrers: ov.topReferrers,
      topPaths: ov.topPaths,
      deviceSplit: ov.deviceSplit,
    },
    topProducts: ov.topProducts,
    security: ov.security,
    forecast: { next7Revenue: fc.points.reduce((s, p) => s + p.revenue, 0), trend: fc.note, slope: fc.slopeRevenue },
  };

  const system =
    'You are the growth strategist AI inside Rare Ember, an Indian D2C streetwear store (Tirupur factory-direct, COD + Razorpay prepaid).' +
    ' Reply as compact Telegram-HTML (tags allowed: <b> <i> <code> <a href>). Max 3200 chars. Structure:\n\n' +
    '📈 <b>WEEKLY ANALYSIS</b> — 3-line summary of what happened and why.\n' +
    '🤝 <b>KEEP THEM HOOKED</b> — 3 concrete actions to increase visitor interest & on-site time.\n' +
    '🚀 <b>SELL MORE</b> — bundle/offer ideas grounded in the top-products &amp; cart data.\n' +
    '↩️ <b>FEWER RETURNS</b> — how to cut returns/RTO (sizing, COD confirmation, packaging).\n' +
    '🔮 <b>OUTLOOK</b> — comment on the forecast trend for next week.\n' +
    '🧪 <b>TOP 3 EXPERIMENTS</b> — ranked, each with expected impact.\n\n' +
    'Rules: use ONLY the numbers provided — never invent ones. Indian rupee tone. End with https://rareember.shop/admin/agent';

  const llmText = await askAgent(JSON.stringify(data), system, 900);

  const text =
    (llmText ??
      `🤖 <b>RARE EMBER WEEKLY</b> (${ov.from} → ${ov.to})\n\n` +
      `💰 Revenue: <b>${inr(ov.revenue)}</b> • Orders: ${ov.orders} • AOV ${inr(ov.aov)}\n` +
      `👁 Visits: ${ov.visits} • Conv: ${ov.conversionPct}% • Bounce: ${ov.bounceRatePct}%\n` +
      `🚨 COD gap: ${inr(ov.codCashGap.amount)} • Returns: ${ov.returns.refunded} refunded / ${ov.returns.cancelled} cancelled\n` +
      `🔮 Forecast 7d: ${inr(fc.points.reduce((s, p) => s + p.revenue, 0))} (${fc.note})\n\n` +
      `⚠️ Deep LLM analysis unavailable — set GEMINI_API_KEY.`) +
    `\n\n${ADMIN_LINK}`;

  await sendTelegramText(text);
  await storeReport('weekly', text, data);
  return { ok: true, text };
}