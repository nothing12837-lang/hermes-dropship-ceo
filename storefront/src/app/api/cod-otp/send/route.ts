import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, normalizeEmail } from '@/lib/security/validation';
import { sendCodOtpEmail } from '@/lib/notifications/email';
import { notifyTelegramOtp } from '@/lib/notifications/telegram';

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const body = await req.json();

    const rawEmail = body.email;
    const rawPhone = body.phone;
    const name = body.name ? String(body.name).trim() : undefined;

    const email = normalizeEmail(rawEmail);
    if (!email) {
      return NextResponse.json(
        { error: 'A valid email address is required for COD order verification.' },
        { status: 400 }
      );
    }

    const cleanPhone = String(rawPhone || '').replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'A valid 10-digit Indian mobile number is required.' },
        { status: 400 }
      );
    }

    // Rate-limiting: Max 4 requests per 10 minutes per email and per IP
    const emailLimit = checkRateLimit(`cod-otp:email:${email}`, 4, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification code requests. Please wait 10 minutes before requesting a new code.' },
        { status: 429 }
      );
    }

    const ipLimit = checkRateLimit(`cod-otp:ip:${ip}`, 8, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification code attempts from this network. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    // Generate cryptographic 6-digit OTP (100000 - 999999)
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const secret = process.env.COD_OTP_SECRET || process.env.ADMIN_SECRET;
    if (!secret) {
      console.error('[COD OTP Send API] Missing COD_OTP_SECRET in server environment');
      return NextResponse.json(
        { error: 'COD verification service temporarily unavailable.' },
        { status: 503 }
      );
    }

    const verificationHash = crypto
      .createHmac('sha256', secret)
      .update(`${email}:${cleanPhone}:${otp}:${expiresAt}`)
      .digest('hex');

    // 1. Dispatch OTP to customer's email via Resend
    const emailResult = await sendCodOtpEmail({
      email,
      otp,
      name,
    });

    // 2. Dispatch real-time Telegram backup alert
    const telegramResult = await notifyTelegramOtp({
      otp,
      email,
      phone: cleanPhone,
      name,
    });

    if (!emailResult.ok && !telegramResult) {
      console.error('[COD OTP Send API] Both email and Telegram dispatches failed:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to deliver verification code. Please check your contact details or try again.' },
        { status: 503 }
      );
    }

    const whatsappUrl = `https://wa.me/919118211860?text=${encodeURIComponent(
      `Hi Rare Ember, I am placing a COD order for ${email} (+91 ${cleanPhone}). Please share my OTP verification code.`
    )}`;

    return NextResponse.json({
      success: true,
      emailDelivered: emailResult.ok,
      whatsappFallback: !emailResult.ok,
      whatsappUrl,
      whatsappNumber: '+91 91182 11860',
      expiresAt,
      verificationHash,
      message: emailResult.ok
        ? `Verification code dispatched to ${email}`
        : 'Email delivery delayed while DNS records propagate. Tap below for instant WhatsApp verification.',
    });
  } catch (err: any) {
    console.error('[COD OTP Send API] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
