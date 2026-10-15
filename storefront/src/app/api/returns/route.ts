import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyTelegramReturnClaim } from '@/lib/notifications/telegram';

export const runtime = 'nodejs';

// POST /api/returns
// Body: { orderId, contact, reason, preference, notes }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      orderId?: string;
      contact?: string;
      reason?: string;
      preference?: string;
      notes?: string;
    };

    const orderId = String(body.orderId || '').trim().slice(0, 80);
    const contact = String(body.contact || '').trim().slice(0, 100);
    const reason = String(body.reason || 'General issue / size mismatch').trim().slice(0, 150);
    const preference = String(body.preference || 'Free Replacement / Reprint').trim().slice(0, 100);
    const notes = String(body.notes || '').trim().slice(0, 500);

    if (!orderId || !contact) {
      return NextResponse.json(
        { error: 'Order ID and Contact (email/phone) are required to file a replacement request.' },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const claimId = `RE-CLM-${randomSuffix}`;

    // 1. Dispatch high-priority Telegram alert to store team
    await notifyTelegramReturnClaim({
      claimId,
      orderId,
      contact,
      reason,
      preference,
      notes,
    });

    // 2. Best-effort persistence to Supabase
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        const sb = createClient(url, key);
        await sb.from('return_claims').insert({
          claim_id: claimId,
          order_id: orderId,
          contact,
          reason,
          preference,
          notes,
          status: 'pending',
        });
      } catch (dbErr) {
        // Table might not exist yet; Telegram alert already dispatched
        console.warn('Could not record return_claims in DB:', dbErr);
      }
    }

    return NextResponse.json({
      ok: true,
      claimId,
      message: 'Your replacement request has been submitted. Our team will verify and dispatch within 24 hours.',
    });
  } catch (err: any) {
    console.error('Failed to process return claim:', err);
    return NextResponse.json({ error: 'Server error processing claim. Please retry.' }, { status: 500 });
  }
}
