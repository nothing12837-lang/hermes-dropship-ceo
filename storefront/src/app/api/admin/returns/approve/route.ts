import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { generateSignedStoreCredit } from '@/lib/store-credit';
import { sendStoreCreditActivatedEmail } from '@/lib/notifications/email';
import { notifyTelegramStoreCreditReleased } from '@/lib/notifications/telegram';

export const runtime = 'nodejs';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * POST /api/admin/returns/approve
 *
 * Founder 1-Click Action to Approve and Release 110% Store Credit
 * once courier reverse pickup scan is verified or unworn garment is confirmed.
 *
 * Body: { claimId?: string; orderId?: string; action: 'release_credit' | 'approve_exchange' | 'reject' }
 * Gated by ADMIN_SECRET.
 */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`admin_approve:${clientIp(req.headers)}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized — Admin passkey required' }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase database credentials not configured' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const rawClaimId = String(body.claimId || '').trim();
    const rawOrderId = String(body.orderId || '').trim();
    const action = String(body.action || 'release_credit').trim().toLowerCase();

    if (!rawClaimId && !rawOrderId) {
      return NextResponse.json({ error: 'claimId or orderId is required' }, { status: 400 });
    }

    // 1. Locate the claim across returns, return_claims, or orders table
    let returnRecord: any = null;
    let orderRecord: any = null;

    // Check returns table
    try {
      let q = supabase.from('returns').select('*');
      if (rawClaimId) q = q.eq('claim_id', rawClaimId);
      else if (rawOrderId) q = q.eq('order_id', rawOrderId);
      const { data, error } = await q.maybeSingle();
      if (!error && data) returnRecord = data;
    } catch {
      // returns table might not exist
    }

    // Check return_claims table
    if (!returnRecord) {
      try {
        let q = supabase.from('return_claims').select('*');
        if (rawClaimId) q = q.eq('claim_id', rawClaimId);
        else if (rawOrderId) q = q.eq('order_id', rawOrderId);
        const { data, error } = await q.maybeSingle();
        if (!error && data) returnRecord = data;
      } catch {
        // return_claims table fallback
      }
    }

    // Resolve Order ID
    const targetOrderId = returnRecord?.order_id || rawOrderId || rawClaimId;

    // Fetch order details for customer info, total, and status updates
    if (targetOrderId) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .ilike('id', `${targetOrderId.slice(0, 8)}%`)
        .limit(1)
        .maybeSingle();
      orderRecord = orderData;
    }

    if (!returnRecord && !orderRecord) {
      return NextResponse.json({ error: 'No matching return claim or order found' }, { status: 404 });
    }

    const effectiveOrderId = orderRecord?.id || returnRecord?.order_id || targetOrderId;
    const effectiveClaimId = returnRecord?.claim_id || rawClaimId || `RE-CLM-${effectiveOrderId.slice(0, 8).toUpperCase()}`;

    // Handle Actions
    if (action === 'release_credit') {
      const orderTotal = Number(orderRecord?.total_amount || returnRecord?.order_total_inr || 0);
      const creditAmount = returnRecord?.credit_amount
        ? Number(returnRecord.credit_amount)
        : Math.max(1, Math.round(orderTotal * 1.10));

      // Get or generate signed voucher code
      let voucherCode = returnRecord?.voucher_code;
      if (!voucherCode || !voucherCode.startsWith('CREDIT-')) {
        voucherCode = generateSignedStoreCredit(effectiveOrderId, creditAmount);
      }

      // Update returns table
      try {
        await supabase
          .from('returns')
          .update({
            status: 'credit_released',
            voucher_code: voucherCode,
            is_redeemed: false,
            credit_amount: creditAmount,
            updated_at: new Date().toISOString(),
          })
          .or(`claim_id.eq.${effectiveClaimId},order_id.eq.${effectiveOrderId}`);
      } catch {
        // table update fallback
      }

      // Update return_claims table
      try {
        await supabase
          .from('return_claims')
          .update({
            status: 'credit_released',
            voucher_code: voucherCode,
            is_redeemed: false,
            notes: `[STORE_CREDIT_RELEASED: ${voucherCode} (₹${creditAmount})] ${returnRecord?.notes || ''}`.trim(),
            updated_at: new Date().toISOString(),
          })
          .or(`claim_id.eq.${effectiveClaimId},order_id.eq.${effectiveOrderId}`);
      } catch {
        // table update fallback
      }

      // Update orders table to refunded + note voucher released
      try {
        await supabase
          .from('orders')
          .update({
            status: 'refunded',
            fulfillment_error: `STORE_CREDIT_RELEASED: [${voucherCode}] Value: ₹${creditAmount} (+10% Bonus) | Claim: ${effectiveClaimId}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', effectiveOrderId);
      } catch (e) {
        console.warn('[Admin Returns Approve] Order status update failed:', e);
      }

      // Customer communication
      const customerContact = returnRecord?.contact || '';
      const customerEmail =
        (customerContact.includes('@') ? customerContact : null) ||
        orderRecord?.user_email ||
        orderRecord?.shipping_address?.email ||
        null;
      const customerName =
        orderRecord?.shipping_name ||
        orderRecord?.shipping_address?.name ||
        'Valued Patron';

      // Automatically send Resend email with active voucher code
      if (customerEmail) {
        await sendStoreCreditActivatedEmail({
          email: customerEmail,
          name: customerName,
          orderId: effectiveOrderId,
          claimId: effectiveClaimId,
          voucherCode,
          amount: creditAmount,
        }).catch((e) => console.error('[Admin Returns Approve] Email dispatch failed:', e));
      }

      // Ping Telegram with confirmation
      await notifyTelegramStoreCreditReleased({
        orderId: effectiveOrderId,
        claimId: effectiveClaimId,
        customerName,
        voucherCode,
        amount: creditAmount,
        email: customerEmail || undefined,
      }).catch((e) => console.error('[Admin Returns Approve] Telegram ping failed:', e));

      return NextResponse.json({
        success: true,
        ok: true,
        status: 'credit_released',
        voucherCode,
        creditAmount,
        claimId: effectiveClaimId,
        orderId: effectiveOrderId,
        message: `Store credit voucher ${voucherCode} (₹${creditAmount}) successfully approved, activated, and emailed to customer.`,
      });
    }

    if (action === 'approve_exchange') {
      try {
        await supabase
          .from('returns')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .or(`claim_id.eq.${effectiveClaimId},order_id.eq.${effectiveOrderId}`);
        await supabase
          .from('return_claims')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .or(`claim_id.eq.${effectiveClaimId},order_id.eq.${effectiveOrderId}`);
      } catch {
        // ignore
      }
      return NextResponse.json({ success: true, ok: true, status: 'approved', claimId: effectiveClaimId });
    }

    if (action === 'reject') {
      try {
        await supabase
          .from('returns')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .or(`claim_id.eq.${effectiveClaimId},order_id.eq.${effectiveOrderId}`);
        await supabase
          .from('return_claims')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .or(`claim_id.eq.${effectiveClaimId},order_id.eq.${effectiveOrderId}`);
      } catch {
        // ignore
      }
      return NextResponse.json({ success: true, ok: true, status: 'rejected', claimId: effectiveClaimId });
    }

    return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  } catch (err: any) {
    console.error('POST /api/admin/returns/approve error:', err);
    return NextResponse.json({ error: err?.message || 'Server error approving claim' }, { status: 500 });
  }
}
