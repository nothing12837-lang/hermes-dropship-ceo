import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { notifyTelegramCallbackRequest } from '@/lib/notifications/telegram';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`callback:${clientIp(req.headers)}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const slot = String(body.slot || 'Morning (10 AM - 1 PM)').trim();
    const reason = String(body.reason || '').trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || (cleanPhone.length !== 10 && cleanPhone.length !== 12)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    // Dispatch immediate callback alert to founder / ops
    try {
      await notifyTelegramCallbackRequest({
        name,
        phone: cleanPhone.slice(-10),
        slot,
        reason: reason || undefined,
      });
    } catch (telegramErr) {
      console.error('[Callback] Telegram alert error:', telegramErr);
    }

    return NextResponse.json({
      success: true,
      message: `Callback request received! Our operations team will call you at +91 ${cleanPhone.slice(-10)} during ${slot}.`,
    });
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.json({ error: 'Failed to request callback.' }, { status: 500 });
  }
}
