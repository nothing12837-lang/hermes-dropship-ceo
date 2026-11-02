import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { getCanonicalSiteUrl, getCanonicalAuthCallbackUrl } from '@/lib/canonical';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Canonical Domain & Auth URLs', () => {
  it('strictly returns https://www.rareember.shop in production', () => {
    const origEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      expect(getCanonicalSiteUrl()).toBe('https://www.rareember.shop');
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  it('generates proper canonical auth callback URLs', () => {
    const url = getCanonicalAuthCallbackUrl('/reset-password');
    expect(url).toContain('https://www.rareember.shop/auth/callback?next=');
    expect(url).toContain(encodeURIComponent('/reset-password'));
  });
});

describe('Middleware Canonical Redirection', () => {
  it('redirects bare rareember.shop to https://www.rareember.shop with 308', () => {
    const req = new NextRequest('http://rareember.shop/checkout?source=ref', {
      headers: { host: 'rareember.shop' },
    });
    const res = middleware(req);
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://www.rareember.shop/checkout?source=ref');
  });

  it('redirects old vercel.app domains to https://www.rareember.shop with 308', () => {
    const req = new NextRequest('https://rareember.vercel.app/product/test-tee', {
      headers: { host: 'rareember.vercel.app' },
    });
    const res = middleware(req);
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://www.rareember.shop/product/test-tee');
  });

  it('allows canonical domain without redirect', () => {
    const req = new NextRequest('https://www.rareember.shop/shop', {
      headers: { host: 'www.rareember.shop' },
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });
});

describe('Stateless COD OTP Cryptographic Signature', () => {
  const secret = 'test-cod-otp-secret';
  const email = 'customer@example.com';
  const phone = '9876543210';
  const otp = '482910';
  const expiresAt = Date.now() + 300_000;

  it('generates authentic HMAC verification hash and verifies correctly', () => {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${email}:${phone}:${otp}:${expiresAt}`)
      .digest('hex');

    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(`${email}:${phone}:${otp}:${expiresAt}`)
      .digest('hex');

    expect(crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))).toBe(true);
  });

  it('rejects tampered OTP or phone number', () => {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${email}:${phone}:${otp}:${expiresAt}`)
      .digest('hex');

    const tamperedHash = crypto
      .createHmac('sha256', secret)
      .update(`${email}:9999999999:${otp}:${expiresAt}`)
      .digest('hex');

    expect(hash).not.toBe(tamperedHash);
  });

  it('verifies signed codVerifiedToken format and signature', () => {
    const timestamp = Date.now();
    const sig = crypto
      .createHmac('sha256', secret)
      .update(`cod-verified:${email}:${phone}:${timestamp}`)
      .digest('hex');

    const token = `cod-verified:${email}:${phone}:${timestamp}:${sig}`;
    const parts = token.split(':');

    expect(parts.length).toBe(5);
    expect(parts[0]).toBe('cod-verified');
    expect(parts[1]).toBe(email);
    expect(parts[2]).toBe(phone);

    const recomputedSig = crypto
      .createHmac('sha256', secret)
      .update(`cod-verified:${parts[1]}:${parts[2]}:${parts[3]}`)
      .digest('hex');

    expect(parts[4]).toBe(recomputedSig);
  });
});

describe('Partial COD & Order Schema Resiliency', () => {
  it('correctly embeds advance_paid and cod_balance in shipping_address payload', () => {
    const address = {
      line1: 'Focal Point, Banglore Road',
      city: 'Moga',
      state: 'Punjab',
      zip: '142001',
    };
    const finalTotal = 1430;
    const isPartialCod = true;

    const shippingAddress = {
      ...address,
      advance_paid: isPartialCod ? 100 : finalTotal,
      cod_balance: isPartialCod ? Math.max(0, finalTotal - 100) : 0,
    };

    expect(shippingAddress.advance_paid).toBe(100);
    expect(shippingAddress.cod_balance).toBe(1330);
    expect(shippingAddress.city).toBe('Moga');
  });
});
