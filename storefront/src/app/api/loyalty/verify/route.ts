import { NextRequest, NextResponse } from 'next/server';
import { verifyLoyaltyVoucher } from '@/lib/loyalty';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

export const runtime = 'nodejs';

/**
 * POST /api/loyalty/verify
 * Validates a single-use RE-GIFT-XXXXXX loyalty voucher against Supabase.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = checkRateLimit(`loyalty_verify_${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ valid: false, error: 'Too many verification requests. Please wait a minute.' }, { status: 429 });
  }

  try {
    const body = (await req.json()) as { code?: string; subtotal?: number };
    const code = (body.code || '').trim();
    const subtotal = Number(body.subtotal) || 0;

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Voucher code is required' }, { status: 400 });
    }

    const result = await verifyLoyaltyVoucher(code, subtotal);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('POST /api/loyalty/verify error:', err);
    return NextResponse.json({ valid: false, error: 'Internal verification failure' }, { status: 500 });
  }
}
