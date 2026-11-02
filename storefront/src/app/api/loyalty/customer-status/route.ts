import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, normalizeEmail } from '@/lib/security/validation';

export const runtime = 'nodejs';

/**
 * POST /api/loyalty/customer-status
 * Checks whether an email, phone number, or account ID has any existing confirmed/delivered orders.
 * Returns { isFirstOrder: boolean, orderCount: number }
 * Never leaks customer PII.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = checkRateLimit(`cust_status_${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ isFirstOrder: true, error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = (await req.json()) as {
      email?: string;
      phone?: string;
      userId?: string;
    };

    const cleanEmail = normalizeEmail(body.email);
    const cleanPhone = String(body.phone || '').replace(/\D/g, '').slice(-10);
    const cleanUserId = typeof body.userId === 'string' && body.userId.trim() ? body.userId.trim() : null;

    if (!cleanEmail && !cleanPhone && !cleanUserId) {
      return NextResponse.json({ isFirstOrder: true, orderCount: 0 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      // Fail closed gracefully to first order if DB service unavailable
      return NextResponse.json({ isFirstOrder: true, orderCount: 0 });
    }

    const conditions: string[] = [];
    if (cleanEmail) conditions.push(`user_email.ilike.${cleanEmail}`);
    if (cleanPhone && cleanPhone.length === 10) conditions.push(`shipping_address->>phone.ilike.%${cleanPhone}%`);
    if (cleanUserId) conditions.push(`user_id.eq.${cleanUserId}`);

    if (conditions.length === 0) {
      return NextResponse.json({ isFirstOrder: true, orderCount: 0 });
    }

    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .or(conditions.join(','))
      .in('status', ['paid', 'delivered', 'shipped', 'processing', 'completed']);

    if (error) {
      console.warn('[Customer Status API] Query warning:', error.message);
      return NextResponse.json({ isFirstOrder: true, orderCount: 0 });
    }

    const existingCount = Number(count) || 0;
    const isFirst = existingCount === 0;

    return NextResponse.json({
      isFirstOrder: isFirst,
      orderCount: existingCount,
    });
  } catch (err: any) {
    console.error('[Customer Status API] Error checking status:', err);
    return NextResponse.json({ isFirstOrder: true, orderCount: 0 });
  }
}
