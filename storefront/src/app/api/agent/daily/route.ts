import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, isCron } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { sendDailyReport } from '@/lib/agent/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily morning report (08:00 IST) (Telegram + agent_reports).
 * Vercel cron Bearer CRON_SECRET. Admin on-demand: Bearer ADMIN_SECRET.
 */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`agentdaily:${clientIp(req.headers)}`, 20, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  if (!isAdmin(req) && !isCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await sendDailyReport();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

export async function GET(req: NextRequest) {
  return POST(req);
}