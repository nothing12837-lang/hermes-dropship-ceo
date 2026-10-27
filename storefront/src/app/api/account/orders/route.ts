import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

export const runtime = 'nodejs';

/**
 * GET /api/account/orders
 * Returns order history for the authenticated user, verified by their Supabase JWT session.
 * Fixes RLS restriction where orders table is restricted to service_role only.
 */
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`account_orders:${clientIp(req.headers)}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }

  // Verify JWT session
  const authClient = createClient(url, anonKey);
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  const serviceSb = getServiceSupabase();
  if (!serviceSb) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const userEmail = (user.email || '').toLowerCase().trim();
    const userId = user.id;

    // Fetch user orders matching either verified user_id or verified email
    let q = serviceSb
      .from('orders')
      .select('id, user_email, total_amount, status, payment_method, items, created_at, tracking_number, tracking_url, shipping_address, shipping_name')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userId && userEmail) {
      q = q.or(`user_id.eq.${userId},user_email.ilike.${userEmail}`);
    } else if (userId) {
      q = q.eq('user_id', userId);
    } else {
      q = q.ilike('user_email', userEmail);
    }

    const { data: orders, error: dbError } = await q;
    if (dbError) {
      console.error('[Account Orders] DB query error:', dbError.message);
      return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      orders: orders || [],
    });
  } catch (err: any) {
    console.error('[Account Orders] Exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
