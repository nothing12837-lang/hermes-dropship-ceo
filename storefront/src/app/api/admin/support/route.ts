import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { getServiceSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';

/**
 * GET /api/admin/support
 * List support tickets and custom B2B leads for the founder operations portal.
 * Gated by ADMIN_SECRET / Bearer admin token.
 */
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`admin:support:${clientIp(req.headers)}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized. Valid admin key required.' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable (SUPABASE_SERVICE_ROLE_KEY required)' }, { status: 503 });
  }

  try {
    const [ticketsRes, leadsRes] = await Promise.all([
      supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('custom_leads').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    return NextResponse.json({
      ok: true,
      tickets: ticketsRes.data || [],
      leads: leadsRes.data || [],
    });
  } catch (err: any) {
    console.error('[Admin Support] Query error:', err);
    return NextResponse.json({ error: 'Failed to query support tickets' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/support
 * Update ticket or lead status (e.g. resolve, in_progress, contacted).
 */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { type, id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }

    const table = type === 'lead' ? 'custom_leads' : 'support_tickets';
    const idColumn = type === 'lead' ? 'lead_id' : 'id';

    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes) updates.notes = notes;

    const { error } = await supabase.from(table).update(updates).eq(idColumn, id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/support?id=...&type=ticket|lead
 * Delete ticket or lead (admin only).
 */
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'ticket';

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    const table = type === 'lead' ? 'custom_leads' : 'support_tickets';
    const idColumn = type === 'lead' ? 'lead_id' : 'id';

    const { error } = await supabase.from(table).delete().eq(idColumn, id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
