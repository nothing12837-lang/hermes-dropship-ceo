import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyTelegramCustomLead } from '@/lib/notifications/telegram';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

export const runtime = 'nodejs';

// GET /api/custom-drops - Returns B2B Custom Drops API status and discovery specs
export async function GET() {
  return NextResponse.json({
    service: 'RareEmber B2B Custom Merch Engine',
    status: 'online',
    location: 'Verified Domestic Maker Hub',
    capabilities: [
      '240 GSM Combed Cotton Heavyweight Tees',
      '240 GSM Full Sleeve Signature Graphic Drops',
      'Ultra-HD Fade-Proof DTF Printing',
      '20% Advance Booking & Batch Locking',
      'Door Delivery in 4-6 Days Pan-India'
    ],
    contact: {
      whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+919118211860',
      email: 'founder@rareember.shop'
    }
  });
}

// POST /api/custom-drops
// Body: { orgName, contactName, phone, quantity, productType, eventDate, estimatedBudget }
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = checkRateLimit(`custom_drops:${ip}`, 5, 600_000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many quote requests. Please wait a few minutes or reach out directly on WhatsApp.' }, { status: 429 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      orgName?: string;
      contactName?: string;
      phone?: string;
      quantity?: number;
      productType?: string;
      eventDate?: string;
      estimatedBudget?: number;
    };

    const orgName = String(body.orgName || '').trim().slice(0, 150);
    const contactName = String(body.contactName || '').trim().slice(0, 100);
    const phone = String(body.phone || '').trim().slice(0, 25);
    const quantity = Number(body.quantity) || 25;
    const productType = String(body.productType || 'Heavyweight Oversized Tees (240 GSM)').trim().slice(0, 150);
    const eventDate = String(body.eventDate || '').trim().slice(0, 60);
    const estimatedBudget = Number(body.estimatedBudget) || 0;

    if (!phone || phone.length < 8) {
      return NextResponse.json(
        { error: 'A valid WhatsApp phone number is required so our production desk can send 3D proofs.' },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const leadId = `RE-B2B-${randomSuffix}`;

    // 1. Dispatch real-time Telegram alert to Founder & Production Team
    await notifyTelegramCustomLead({
      leadId,
      orgName,
      contactName,
      phone,
      quantity,
      productType,
      eventDate,
      estimatedBudget,
    });

    // 2. Best-effort Supabase persistence
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        const sb = createClient(url, key);
        await sb.from('custom_leads').insert({
          lead_id: leadId,
          org_name: orgName,
          contact_name: contactName,
          phone,
          quantity,
          product_type: productType,
          event_date: eventDate,
          estimated_budget: estimatedBudget,
          status: 'new',
        });
      } catch (dbErr) {
        // Non-blocking: table might not exist yet; Telegram dispatch already alerted team
        console.warn('Could not record custom_lead in DB:', dbErr);
      }
    }

    return NextResponse.json({
      ok: true,
      leadId,
      message: 'Custom merch inquiry received! Our dedicated production desk will contact you via WhatsApp with free 3D design mockups within 2 hours.',
    });
  } catch (error: any) {
    console.error('Error handling custom drops lead:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please contact us on WhatsApp directly.' },
      { status: 500 }
    );
  }
}
