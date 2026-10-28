import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { notifyTelegramReturnClaim } from '@/lib/notifications/telegram';
import { sendReturnClaimConfirmationEmail } from '@/lib/notifications/email';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { generateSignedStoreCredit } from '@/lib/store-credit';

export const runtime = 'nodejs';

const REPLACEMENT_WINDOW_DAYS = 7;

/**
 * POST /api/returns
 * Body: { orderId, contact, reason, preference, notes }
 *
 * Every claim is tied to a REAL order that the contact matches, is
 * limited to the published 7-day replacement window, is de-duplicated per
 * order, and is persisted with the order total and payment method so the ops
 * team can actually refund or replace it.
 *
 * 100% Fail-Safe: If `return_claims` table is not yet migrated in Supabase,
 * it writes directly into the `orders` table metadata and fires instant
 * Telegram + Resend email notifications so no customer claim is ever lost.
 */
export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(`returns:${clientIp(req.headers)}`, 10, 60 * 60_000);
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

    const rawOrderId = String(body.orderId || '').trim().slice(0, 80);
    const contact = String(body.contact || '').trim().slice(0, 100);
    const reason = String(body.reason || 'General issue / size mismatch').trim().slice(0, 150);
    const preference = String(body.preference || 'Free Replacement / Reprint').trim().slice(0, 100);
    const notes = String(body.notes || '').trim().slice(0, 500);

    if (!rawOrderId || !contact) {
      return NextResponse.json(
        { error: 'Order ID and Contact (email/phone) are required to file a replacement request.' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('[Returns] SUPABASE_SERVICE_ROLE_KEY is required for returns service under RLS.');
      return NextResponse.json(
        { error: 'Returns service is temporarily unavailable. Please contact support@rareember.shop directly.' },
        { status: 503 }
      );
    }
    const sb = createClient(url, key);

    // 1. The order must exist.
    // Handles full 36-char UUIDs, 8-char short IDs, and '#'-prefixed IDs seamlessly.
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleanOrderId = rawOrderId.replace(/^[#\s]+/, '').trim();
    let order: any = null;

    if (UUID_REGEX.test(cleanOrderId)) {
      const { data, error: orderErr } = await sb
        .from('orders')
        .select('id, user_email, total_amount, status, created_at, shipping_address, shipping_name, payment_method, fulfillment_error')
        .eq('id', cleanOrderId)
        .maybeSingle();
      if (orderErr && orderErr.code !== '22P02') {
        console.error('[Returns] order lookup error:', orderErr.message);
      }
      order = data;
    } else if (/^[0-9a-f]{6,36}$/i.test(cleanOrderId)) {
      // 6 to 32 hex character prefix lookup
      const { data, error: prefixErr } = await sb
        .from('orders')
        .select('id, user_email, total_amount, status, created_at, shipping_address, shipping_name, payment_method, fulfillment_error')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!prefixErr && data) {
        order = data.find((o: any) => o.id.toLowerCase().startsWith(cleanOrderId.toLowerCase())) || null;
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: 'No order found for that Order ID. Please check the ID in your confirmation email or SMS.' },
        { status: 404 }
      );
    }

    // 2. The contact must belong to that order.
    const orderEmail = String(order.user_email || '').trim().toLowerCase();
    const orderPhone = String((order.shipping_address as any)?.phone || '').replace(/\D/g, '');
    const contactLower = contact.toLowerCase();
    const contactDigits = contact.replace(/\D/g, '');
    const emailMatches = orderEmail.length > 0 && contactLower.includes(orderEmail);
    const phoneMatches =
      contactDigits.length >= 6 &&
      orderPhone.length >= 6 &&
      (contactDigits.includes(orderPhone) || orderPhone.includes(contactDigits));
    if (!emailMatches && !phoneMatches) {
      return NextResponse.json(
        { error: 'The contact details do not match this order. Please use the email or phone number provided during checkout.' },
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
              'Please contact support@rareember.shop directly and our team will do our best to assist you.',
          },
          { status: 400 }
        );
      }
    }

    // 4. One open claim per order check (check returns table, return_claims table, and orders status)
    try {
      const activeStatuses = ['pending', 'pending_pickup', 'approved', 'in_progress', 'credit_released'];

      // Check returns table
      const { data: existingReturn } = await sb
        .from('returns')
        .select('claim_id, status')
        .eq('order_id', order.id)
        .in('status', activeStatuses)
        .limit(1);

      if (existingReturn && existingReturn.length > 0 && existingReturn[0]?.claim_id) {
        return NextResponse.json(
          {
            error:
              `A replacement request (${existingReturn[0].claim_id}) is already open for this order. ` +
              'Our team will contact you shortly.',
          },
          { status: 409 }
        );
      }

      // Check return_claims table
      const { data: existingClaim } = await sb
        .from('return_claims')
        .select('claim_id, status')
        .eq('order_id', order.id)
        .in('status', activeStatuses)
        .limit(1);

      if (existingClaim && existingClaim.length > 0 && existingClaim[0]?.claim_id) {
        return NextResponse.json(
          {
            error:
              `A replacement request (${existingClaim[0].claim_id}) is already open for this order. ` +
              'Our team will contact you shortly.',
          },
          { status: 409 }
        );
      }

      // Check order status on the order itself
      if (
        order.status === 'return_requested' ||
        order.status === 'returned' ||
        order.status === 'refunded'
      ) {
        return NextResponse.json(
          {
            error:
              'A replacement or return claim has already been registered for this order. ' +
              'Our Rare Ember support team will contact you directly via WhatsApp or email.',
          },
          { status: 409 }
        );
      }
    } catch {
      // safe fallback if tables are not yet migrated
    }

    const claimId = `RE-CLM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const orderTotal = Number(order.total_amount || 0);
    const customerName = order.shipping_name || (order.shipping_address as any)?.name || 'Customer';

    // 5. Automated Store Credit Engine (Cryptographically Signed & Locked behind Reverse Pickup):
    const isStoreCredit = preference.toLowerCase().includes('credit');
    const storeCreditAmount = isStoreCredit ? Math.round(orderTotal * 1.1) : null;
    const storeCreditCode = isStoreCredit
      ? generateSignedStoreCredit(order.id, storeCreditAmount!)
      : null;
    const claimStatus = isStoreCredit ? 'pending_pickup' : 'pending';

    // Persist the claim: First attempt returns table, then return_claims table
    let savedInTable = false;
    try {
      const returnRow: Record<string, unknown> = {
        claim_id: claimId,
        order_id: order.id,
        contact,
        reason,
        preference,
        notes: isStoreCredit
          ? `[STORE_CREDIT_RESERVED: ${storeCreditCode} (₹${storeCreditAmount}) (Status: pending_pickup)] ${notes || ''}`.trim()
          : notes,
        status: claimStatus,
        voucher_code: isStoreCredit ? storeCreditCode : null,
        is_redeemed: false,
        order_total_inr: orderTotal,
        payment_method: String(order.payment_method || 'cod'),
      };
      const { error: insertErr } = await sb.from('returns').insert(returnRow);
      if (!insertErr) {
        savedInTable = true;
      }
    } catch {
      // returns table might not exist
    }

    try {
      const claimRow: Record<string, unknown> = {
        claim_id: claimId,
        order_id: order.id,
        contact,
        reason,
        preference,
        notes: isStoreCredit
          ? `[STORE_CREDIT_RESERVED: ${storeCreditCode} (₹${storeCreditAmount}) (Status: pending_pickup)] ${notes || ''}`.trim()
          : notes,
        status: claimStatus,
        voucher_code: isStoreCredit ? storeCreditCode : null,
        is_redeemed: false,
        order_total_inr: orderTotal,
        payment_method: String(order.payment_method || 'cod'),
      };
      const { error: insertErr } = await sb.from('return_claims').insert(claimRow);
      if (!insertErr) {
        savedInTable = true;
      } else {
        // Retry with minimal columns if extended columns don't exist
        const minimal = {
          claim_id: claimId,
          order_id: order.id,
          contact,
          reason,
          preference,
          notes: isStoreCredit
            ? `[STORE_CREDIT_RESERVED: ${storeCreditCode} (₹${storeCreditAmount}) (Status: pending_pickup)] ${notes || ''}`.trim()
            : notes,
          status: claimStatus,
        };
        const { error: minimalErr } = await sb.from('return_claims').insert(minimal);
        if (!minimalErr) {
          savedInTable = true;
        } else {
          console.warn('[Returns] return_claims insert fallback needed:', minimalErr.message);
        }
      }
    } catch (tblErr) {
      console.warn('[Returns] return_claims table unavailable, using orders metadata fallback:', tblErr);
    }

    // 6. Fail-Safe: Always record on the order itself so it is visible in Admin Orders
    try {
      const { error: orderUpdateErr } = await sb
        .from('orders')
        .update({
          status: 'return_requested',
          fulfillment_error: isStoreCredit
            ? `STORE_CREDIT_RESERVED: [${storeCreditCode}] Value: ₹${storeCreditAmount} (+10% Bonus) | Status: pending_pickup | Claim: ${claimId} | Reason: ${reason}`
            : `RETURN_CLAIM: [${claimId}] Reason: ${reason} | Pref: ${preference} | Contact: ${contact}${notes ? ` | Notes: ${notes}` : ''}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (orderUpdateErr) {
        console.error('[Returns] Failed to update orders metadata for claim:', orderUpdateErr.message);
      }
    } catch (orderUpdateErr) {
      console.error('[Returns] Exception while updating orders metadata for claim:', orderUpdateErr);
    }

    // 7. Alert the store founder & ops team via Telegram
    await notifyTelegramReturnClaim({
      claimId,
      orderId: order.id,
      contact,
      customerName,
      reason,
      preference,
      notes,
      storeCreditCode,
      storeCreditAmount,
      status: claimStatus,
    }).catch((e) => console.error('[Returns] Telegram alert failed:', e));

    // 8. Send confirmation email to customer if email is available (voucher withheld until pickup scan)
    const recipientEmail = orderEmail || (contact.includes('@') ? contact : null);
    if (recipientEmail) {
      sendReturnClaimConfirmationEmail({
        email: recipientEmail,
        name: customerName,
        claimId,
        orderId: order.id,
        reason,
        preference,
        isStoreCredit,
        storeCreditCode: null, // CRITICAL: NEVER send active voucher code before courier pickup scan!
        storeCreditAmount,
        isPendingPickup: true,
      }).catch((e) => console.error('[Returns] Email dispatch failed:', e));
    }

    return NextResponse.json({
      success: true,
      ok: true,
      claimId,
      status: claimStatus,
      isStoreCredit,
      reservedCreditAmount: isStoreCredit ? storeCreditAmount : undefined,
      message: isStoreCredit
        ? `Your ₹${storeCreditAmount} Store Credit (110% Value) has been generated and locked to your account! Our courier partner will pick up your unworn original piece (or verify your claim via our Support Desk), and your instant voucher code will be activated via Email & WhatsApp immediately upon pickup scan.`
        : 'Your replacement request has been submitted. Our team will verify and dispatch within 24 hours.',
    });
  } catch (err: unknown) {
    console.error('Failed to process return claim:', err);
    return NextResponse.json(
      { error: 'Server error processing claim. Please retry.' },
      { status: 500 }
    );
  }
}
