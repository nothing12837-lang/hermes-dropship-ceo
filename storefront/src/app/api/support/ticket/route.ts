import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, normalizeEmail } from '@/lib/security/validation';
import { notifyTelegramSupportTicket } from '@/lib/notifications/telegram';
import { sendSupportTicketConfirmationEmail } from '@/lib/notifications/email';

export const runtime = 'nodejs';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`ticket:${clientIp(req.headers)}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = normalizeEmail(body.email);
    const orderId = String(body.orderId || '').trim();
    const category = String(body.category || 'General Assistance').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();
    const priority = String(body.priority || 'Normal').trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || (cleanPhone.length !== 10 && cleanPhone.length !== 12)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!subject || subject.length < 3) {
      return NextResponse.json({ error: 'Please enter a subject for your ticket.' }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return NextResponse.json({ error: 'Please describe your query or issue.' }, { status: 400 });
    }

    const ticketId = `RE-TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Persist to database via service-role
    let dbSaved = false;
    const sb = getSupabase();
    if (sb) {
      try {
        const { error: insertErr } = await sb.from('support_tickets').insert({
          id: ticketId,
          name,
          phone: cleanPhone.slice(-10),
          email,
          order_id: orderId || null,
          category,
          subject,
          message,
          priority,
          status: 'open',
          created_at: new Date().toISOString(),
        });
        if (insertErr) {
          console.error('[Support Ticket] DB insert failed:', insertErr.message);
        } else {
          dbSaved = true;
        }
      } catch (dbErr) {
        console.error('[Support Ticket] DB exception:', dbErr);
      }
    }

    // 2. Dispatch high-priority Telegram alert
    let alertSent = false;
    try {
      await notifyTelegramSupportTicket({
        ticketId,
        name,
        phone: cleanPhone.slice(-10),
        email,
        orderId: orderId || undefined,
        category,
        subject,
        message,
        priority,
      });
      alertSent = true;
    } catch (telegramErr) {
      console.error('[Support Ticket] Telegram alert error:', telegramErr);
    }

    // 3. Dispatch official confirmation email to customer
    try {
      await sendSupportTicketConfirmationEmail({
        ticketId,
        name,
        email,
        phone: cleanPhone.slice(-10),
        subject,
        category,
        message,
        orderId: orderId || undefined,
      });
    } catch (emailErr) {
      console.warn('[Support Ticket] Confirmation email warning:', emailErr);
    }

    if (!dbSaved && !alertSent) {
      return NextResponse.json(
        { error: 'Unable to register support ticket at this time. Please WhatsApp us directly.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      ticketId,
      sla: '12 Hours Guarantee',
      message: 'Your ticket has been officially registered with our founder desk. We will reply to your email and phone within 12 hours.',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Support ticket error:', err);
    return NextResponse.json({ error: 'Failed to submit ticket. Please try again or WhatsApp us.' }, { status: 500 });
  }
}
