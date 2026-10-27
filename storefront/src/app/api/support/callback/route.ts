import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
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

    // 1. Database persistence via service_role client in support_tickets table
    let dbSaved = false;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      try {
        const sb = createClient(url, key);
        const ticketId = `CALL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const { error: insertErr } = await sb.from('support_tickets').insert({
          ticket_id: ticketId,
          name,
          phone: cleanPhone.slice(-10),
          email: 'callback@rareember.shop',
          category: 'callback_request',
          subject: `Instant Callback Request (${slot})`,
          message: reason ? `Slot: ${slot} | Reason: ${reason}` : `Customer requested callback during slot: ${slot}`,
          priority: 'high',
          status: 'open',
          created_at: new Date().toISOString(),
        });
        if (insertErr) {
          console.error('[Callback] DB insert error:', insertErr.message);
        } else {
          dbSaved = true;
        }
      } catch (dbErr) {
        console.error('[Callback] DB exception:', dbErr);
      }
    }

    // 2. Dispatch immediate callback alert to founder / ops via Telegram
    let alertSent = false;
    try {
      alertSent = await notifyTelegramCallbackRequest({
        name,
        phone: cleanPhone.slice(-10),
        slot,
        reason: reason || undefined,
      });
    } catch (telegramErr) {
      console.error('[Callback] Telegram alert error:', telegramErr);
    }

    // 3. Fail-safe: Ensure either DB row or Telegram notification succeeded
    if (!dbSaved && !alertSent) {
      return NextResponse.json(
        { error: 'Unable to schedule callback at this moment. Please contact us directly on WhatsApp.' },
        { status: 503 }
      );
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
