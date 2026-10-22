import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { askAgent, llmConfigured } from '@/lib/agent/ai';
import { replyTelegram } from '@/lib/agent/telegram';
import { getOverview, forecast, inr } from '@/lib/agent/analytics';
import { sendDailyReport, sendWeeklyReport } from '@/lib/agent/reports';
import { getServiceSupabase } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Founder <-> AI agent private chat + command console, over the existing bot.
 * Telegram posts updates here with header X-Telegram-Bot-Api-Secret-Token,
 * which MUST equal TELEGRAM_WEBHOOK_SECRET. Only TELEGRAM_CHAT_ID is served.
 */

interface TgUpdate {
  message?: {
    chat?: { id?: number | string };
    from?: { id?: number | string };
    text?: string;
  };
}

const HELP =
  `🤖 <b>Rare Ember AI Manager</b>\n\n` +
  `/daily — today's sales, reach &amp; COD gap\n` +
  `/weekly — full 7-day LLM growth analysis\n` +
  `/forecast — 7-day revenue &amp; traffic projection\n` +
  `/top — top products, sources &amp; pages\n` +
  `/security — recent security log\n\n` +
  `Or just ask me anything about the store — I answer from live data.`;

async function chatSystemPrompt(): Promise<string> {
  try {
    const ov: Awaited<ReturnType<typeof getOverview>> = await getOverview(7);
    const fc = forecast(ov.byDay, 7);
    const compact = {
      revenue: ov.revenue,
      orders: ov.orders,
      aov: ov.aov,
      conversionPct: ov.conversionPct,
      visits: ov.visits,
      sessions: ov.uniqueSessions,
      bouncePct: ov.bounceRatePct,
      codGap: ov.codCashGap,
      returns: ov.returns,
      topProducts: ov.topProducts.slice(0, 5),
      topReferrers: ov.topReferrers.slice(0, 5),
      forecast7d: fc.points.reduce((s, p) => s + p.revenue, 0),
      trend: fc.note,
    };
    return (
      'You are the AI manager of Rare Ember (Indian D2C streetwear store, COD + Razorpay, Tirupur products).\n' +
      'Answer the founder briefly (max 1200 chars, plain Telegram-HTML: only <b> <i> <code> tags).\n' +
      `Ground every claim in this live 7-day data:\n${JSON.stringify(compact)}`
    );
  } catch {
    return (
      'You are the AI manager of Rare Ember (Indian D2C streetwear store, COD + Razorpay).\n' +
      'Answer the founder briefly (max 1200 chars). Live store data is unavailable — say so and keep it general.'
    );
  }
}

async function persistChat(q: string, a: string): Promise<void> {
  const sb = getServiceSupabase();
  if (!sb) return;
  try {
    await sb.from('agent_reports').insert({ kind: 'chat', summary: `Q: ${q.slice(0, 300)}\nA: ${a.slice(0, 1500)}`, body: {} });
  } catch (err) {
    console.error('chat log failed:', err);
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'TELEGRAM_WEBHOOK_SECRET not set — configure it, then run the Telegram setWebhook call.' }, { status: 503 });
  }
  const got = req.headers.get('x-telegram-bot-api-secret-token') || '';
  const a = Buffer.from(String(got));
  const b = Buffer.from(String(secret));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TgUpdate = {};
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }
  const msg = update.message;
  const chatId = msg?.chat?.id;
  const text = typeof msg?.text === 'string' ? msg.text.trim().slice(0, 1000) : '';
  if (!chatId || !text) return NextResponse.json({ ok: true });

  // Only the founder chat is ever answered.
  if (String(chatId) !== String(process.env.TELEGRAM_CHAT_ID || '')) {
    return NextResponse.json({ ok: true });
  }

  const rl = checkRateLimit(`tg:${chatId}`, 30, 60_000);
  if (!rl.allowed) {
    await replyTelegram(chatId, '⏳ Too fast — try again in a minute.');
    return NextResponse.json({ ok: true });
  }

  const cmd = text.split(/\s+/)[0].toLowerCase();

  if (cmd === '/help') {
    await replyTelegram(chatId, HELP);
    return NextResponse.json({ ok: true });
  }
  if (cmd === '/daily') {
    const r = await sendDailyReport();
    if (!r.ok) await replyTelegram(chatId, `⚠️ ${String(r.error || 'daily failed').slice(0, 200)}`);
    return NextResponse.json({ ok: true });
  }
  if (cmd === '/weekly') {
    const r = await sendWeeklyReport();
    if (!r.ok) await replyTelegram(chatId, `⚠️ ${String(r.error || 'weekly failed').slice(0, 200)}`);
    return NextResponse.json({ ok: true });
  }
  if (cmd === '/forecast' || cmd === '/top' || cmd === '/security') {
    let body = '';
    try {
      const ov = await getOverview(7);
      const fc = forecast(ov.byDay, 7);
      if (cmd === '/forecast') {
        body =
          `🔮 <b>7-DAY FORECAST</b>\n` +
          `Revenue: <b>${inr(fc.points.reduce((s, p) => s + p.revenue, 0))}</b> (${fc.note})\n` +
          fc.points.map((p) => `• ${p.date}: ${inr(p.revenue)} / ${p.visits} visits`).join('\n');
      } else if (cmd === '/top') {
        body =
          `🥇 <b>TOP PRODUCTS (7d)</b>\n${ov.topProducts.map((p) => `• ${p.name} ×${p.value}`).join('\n') || '• none yet'}\n\n` +
          `🌍 <b>TOP SOURCES</b>\n${ov.topReferrers.map((p) => `• ${p.name} ×${p.value}`).join('\n') || '• none yet'}\n\n` +
          `📄 <b>TOP PAGES</b>\n${ov.topPaths.map((p) => `• ${p.name} ×${p.value}`).join('\n') || '• none yet'}`;
      } else {
        body =
          `🛡 <b>SECURITY (7d)</b>\n` +
          (ov.security.length ? ov.security.map((s) => `• ${s.name}: ${s.value}`).join('\n') : '• all clear — no anomalies logged');
      }
    } catch (err) {
      body = `⚠️ ${String(err instanceof Error ? err.message : err).slice(0, 200)}`;
    }
    await replyTelegram(chatId, body);
    return NextResponse.json({ ok: true });
  }

  // Freeform chat: LLM grounded in live data.
  if (!llmConfigured()) {
    await replyTelegram(chatId, HELP);
    return NextResponse.json({ ok: true });
  }
  const system = await chatSystemPrompt();
  const answer = await askAgent(text, system, 700);
  const reply = answer || '⚠️ I could not process that — try /daily, /top or rephrase.';
  await replyTelegram(chatId, reply);
  await persistChat(text, reply);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  // Health probe only; real access is POST + secret header.
  return NextResponse.json({ ok: true, hint: 'Telegram webhook endpoint (POST only).' });
}