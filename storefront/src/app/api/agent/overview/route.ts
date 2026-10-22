import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { getOverview, forecast } from '@/lib/agent/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin Agent Dashboard data. ADMIN_SECRET / CRON_SECRET bearer only.
 * GET /api/agent/overview?days=14
 */
export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_SECRET && !process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Agent not configured. Set ADMIN_SECRET (see .env.example).' }, { status: 503 });
  }
  const rl = checkRateLimit(`agentov:${clientIp(req.headers)}`, 60, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const days = Math.min(90, Math.max(1, parseInt(new URL(req.url).searchParams.get('days') || '14', 10) || 14));
  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured — agent cannot read store data.' }, { status: 503 });
  }
  try {
    const overview = await getOverview(days);
    const fc = forecast(overview.byDay, 7);
    const reps = await sb
      .from('agent_reports')
      .select('ts,kind,summary')
      .order('ts', { ascending: false })
      .limit(10);
    const reports = ((reps.data ?? []) as Array<{ ts: string; kind: string; summary: string }>).filter((r) => r.kind !== 'chat');
    return NextResponse.json({
      overview,
      forecast: { points: fc.points, note: fc.note, nextRevenue: fc.points.reduce((s, p) => s + p.revenue, 0) },
      reports,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err).slice(0, 300) }, { status: 500 });
  }
}