import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, isCron } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { sendDailyReport, sendWeeklyReport } from '@/lib/agent/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily morning report (08:00 IST) (Telegram + agent_reports).
 * Vercel cron Bearer CRON_SECRET. Admin on-demand: Bearer ADMIN_SECRET.
 * Automatically folds weekly deep analysis on Mondays to comply with Vercel Hobby 2-cron limit.
 */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`agentdaily:${clientIp(req.headers)}`, 20, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  if (!isAdmin(req) && !isCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await sendDailyReport();

  // If today is Monday (day 1), also run the weekly report
  const isMonday = new Date().getDay() === 1;
  let weeklyResult: any = null;
  if (isMonday) {
    try {
      weeklyResult = await sendWeeklyReport();
    } catch (e: any) {
      console.error('[Agent Daily] Weekly report folding error:', e);
    }
  }

  return NextResponse.json({ ...result, weekly: weeklyResult }, { status: result.ok ? 200 : 503 });
}

export async function GET(req: NextRequest) {
  return POST(req);
}