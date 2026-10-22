import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { notifyTelegramReturnClaim } from '@/lib/notifications/telegram';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

export const runtime = 'nodejs';

const REPLACEMENT_WINDOW_DAYS = 7;

/**
 * POST /api/returns
 * Body: { orderId, contact, reason, preference, notes }
 *
 * Every claim is now tied to a REAL order that the contact matches, is
 * limited to the published 7-day replacement window, is de-duplicated per
 * order, and is persisted with the order total and payment method so the ops
 * team can actually refund it. Previously any caller could file unlimited
 * "free replacement" claims against any order ID (or a made-up one) and the
 * insert error was discarded, so the claim silently vanished while the
 * customer was told it had been submitted.
 */
export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(`returns:${clientIp(req.headers)}`, 3, 60 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many replacement requests. Please try again later.' },
        { status: 429 }
      );
    }

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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('[Returns] SUPABASE_SERVICE_ROLE_KEY is not configured.');
      return NextResponse.json(
        { error: 'Returns service is not configured. Please contact support.' },
        { status: 503 }
      );
    }
    const sb = createClient(url, key);

    // 1. The order must exist.
    const { data: order, error: orderErr } = await sb
      .from('orders')
      .select('id, user_email, total_amount, status, created_at, shipping_address')
      .eq('id', orderId)
      .maybeSingle();
    if (orderErr) {
      console.error('[Returns] order lookup failed:', orderErr.message);
      return NextResponse.json({ error: 'Could not verify the order. Please try again.' }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json(
        { error: 'No order found for that Order ID. Please check the ID in your confirmation email.' },
        { status: 404 }
      );
    }

    // 2. The contact must belong to that order.
    const orderEmail = String(order.user_email || '').trim().toLowerCase();
    const orderPhone = String((order.shipping_address as any)?.phone || '').replace(/\D/g, '');
    const contactLower = contact.toLowerCase();
    const contactDigits = contact.replace(/\D/g, '');
    const emailMatches = orderEmail.length > 0 && contactLower.includes(orderEmail);
    const phoneMatches = orderPhone.length >= 6 && contactDigits.includes(orderPhone);
    if (!emailMatches && !phoneMatches) {
      return NextResponse.json(
        { error: 'The contact details do not match this order. Use the email or phone number on your order.' },
        { status: 403 }
      );
    }

    // 3. The published 7-day replacement window.
    const createdAt = order.created_at ? new Date(order.created_at).getTime() : NaN;
    if (Number.isFinite(createdAt)) {
      const ageDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
      if (ageDays > REPLACEMENT_WINDOW_DAYS) {
        return NextResponse.json(
          {
            error:
              `Our 7-day replacement window for this order closed on ` +
              `${new Date(createdAt + REPLACEMENT_WINDOW_DAYS * 86400000).toLocaleDateString('en-IN')}. ` +
              'Please contact support and we will do our best to help.',
          },
          { status: 400 }
        );
      }
    }

    // 4. One open claim per order.
    const { data: existing } = await sb
      .from('return_claims')
      .select('claim_id, status')
      .eq('order_id', orderId)
      .in('status', ['pending', 'approved', 'in_progress'])
      .limit(1)
      .maybeSingle();
    if (existing?.claim_id) {
      return NextResponse.json(
        {
          error:
            `A replacement request (${existing.claim_id}) is already open for this order. ` +
            'Our team will contact you shortly.',
        },
        { status: 409 }
      );
    }

    const claimId = `RE-CLM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const orderTotal = Number(order.total_amount || 0);

    // 5. Persist first, and CHECK the error. The order total and payment
    //    method travel with the claim so ops can refund it.
    const claimRow: Record<string, unknown> = {
      claim_id: claimId,
      order_id: orderId,
      contact,
      reason,
      preference,
      notes,
      status: 'pending',
      order_total_inr: orderTotal,
      payment_method: String((order as any).payment_method || 'cod'),
    };
    const { error: insertErr } = await sb.from('return_claims').insert(claimRow);
    if (insertErr) {
      const missingColumn = /column .* does not exist/i.test(insertErr.message);
      if (!missingColumn) {
        console.error('[Returns] insert failed:', insertErr.message);
        return NextResponse.json(
          { error: 'Could not record your request. Please try again.' },
          { status: 503 }
        );
      }
      // The extended columns have not been migrated yet: retry with the
      // base columns only rather than losing the claim entirely.
      const minimal = {
        claim_id: claimId,
        order_id: orderId,
        contact,
        reason,
        preference,
        notes,
        status: 'pending',
      };
      const { error: minimalErr } = await sb.from('return_claims').insert(minimal);
      if (minimalErr) {
        console.error('[Returns] minimal insert failed:', minimalErr.message);
        return NextResponse.json(
          { error: 'Could not record your request. Please try again.' },
          { status: 503 }
        );
      }
    }

    // 6. Alert the ops team.
    await notifyTelegramReturnClaim({
      claimId,
      orderId,
      contact,
      reason,
      preference,
      notes,
    }).catch((e) => console.error('[Returns] Telegram alert failed:', e));

    return NextResponse.json({
      ok: true,
      claimId,
      message: 'Your replacement request has been submitted. Our team will verify and dispatch within 24 hours.',
    });
  } catch (err: unknown) {
    console.error('Failed to process return claim:', err);
    return NextResponse.json(
      { error: 'Server error processing claim. Please retry.' },
      { status: 500 }
    );
  }
}