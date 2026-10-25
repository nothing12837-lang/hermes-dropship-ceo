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

    const secret = process.env.COD_OTP_SECRET || process.env.ADMIN_SECRET || 'rareember-cod-otp-secret-2026';

    const verificationHash = crypto
      .createHmac('sha256', secret)
      .update(`${email}:${cleanPhone}:${otp}:${expiresAt}`)
      .digest('hex');

    // 1. Dispatch OTP to customer's email via Resend
    await sendCodOtpEmail({
      email,
      otp,
      name,
    });

    // 2. Dispatch real-time Telegram backup alert
    await notifyTelegramOtp({
      otp,
      email,
      phone: cleanPhone,
      name,
    });

    return NextResponse.json({
      success: true,
      expiresAt,
      verificationHash,
      message: `Verification code dispatched to ${email}`,
    });
  } catch (err: any) {
    console.error('[COD OTP Send API] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
