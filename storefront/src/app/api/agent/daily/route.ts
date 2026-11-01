import { NextRequest, NextResponse } from 'next/server';
import { isCron, isAdmin } from '@/lib/security/auth';
import { processVoucherReminders } from '@/lib/loyalty';

export const runtime = 'nodejs';

/**
 * GET | POST /api/agent/daily
 * Daily cron worker triggered by Vercel Cron at 2:30 AM (or manual ops trigger).
 *
 * Responsibilities:
 * 1. Process 3-Stage Loyalty Voucher Retention Reminders (Day 20, Day 45, Day 87 72h-warning).
 * 2. Authenticated via Authorization: Bearer <CRON_SECRET> or <ADMIN_SECRET>.
 */
async function handleDailyCron(req: NextRequest) {
  if (!isCron(req) && !isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized cron dispatch' }, { status: 401 });
  }

  try {
    const voucherReport = await processVoucherReminders();

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      voucherReminders: voucherReport,
    });
  } catch (err: any) {
    console.error('[Daily Cron] Execution failed:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Daily cron execution failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleDailyCron(req);
}

export async function POST(req: NextRequest) {
  return handleDailyCron(req);
}
