import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, normalizeEmail } from '@/lib/security/validation';

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const body = await req.json();

    const email = normalizeEmail(body.email);
    const rawPhone = body.phone;
    const otp = String(body.otp || '').trim();
    const verificationHash = String(body.verificationHash || '').trim();
    const expiresAt = Number(body.expiresAt);

    if (!email || !rawPhone || !otp || !verificationHash || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required verification parameters.' },
        { status: 400 }
      );
    }

    // Rate-limiting & Brute-Force Protection: Max 10 attempts per IP and max 6 per email/phone per 10 mins
    const ipLimit = checkRateLimit(`cod-verify:ip:${ip}`, 12, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts from this network. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    const emailLimit = checkRateLimit(`cod-verify:target:${email}`, 6, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification code attempts. Please request a fresh code.' },
        { status: 429 }
      );
    }

    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please tap Resend to get a fresh code.' },
        { status: 400 }
      );
    }

    const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10);
    const secret = process.env.COD_OTP_SECRET || process.env.ADMIN_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'COD verification service temporarily unavailable.' },
        { status: 503 }
      );
    }

    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(`${email}:${cleanPhone}:${otp}:${expiresAt}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedHash, 'utf8');
    const providedBuffer = Buffer.from(verificationHash, 'utf8');

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your email and enter the exact 6-digit code.' },
        { status: 400 }
      );
    }

    // Generate signed codVerifiedToken valid for placing COD order (30 min grace)
    const tokenTimestamp = Date.now();
    const tokenSig = crypto
      .createHmac('sha256', secret)
      .update(`cod-verified:${email}:${cleanPhone}:${tokenTimestamp}`)
      .digest('hex');

    const codVerifiedToken = `cod-verified:${email}:${cleanPhone}:${tokenTimestamp}:${tokenSig}`;

    return NextResponse.json({
      success: true,
      codVerifiedToken,
      message: 'Cash on Delivery address and identity successfully verified.',
    });
  } catch (err: any) {
    console.error('[COD OTP Verify API] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Verification process failed.' },
      { status: 500 }
    );
  }
}
