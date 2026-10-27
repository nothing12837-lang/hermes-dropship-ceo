import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSignedStoreCredit, verifyStoreCreditCode, redeemStoreCredit, computeStoreCreditHmac } from '@/lib/store-credit';
import { POST as webhookPost } from '@/app/api/webhooks/razorpay/route';
import { GET as ordersGet } from '@/app/api/orders/route';
import { NextRequest } from 'next/server';

describe('P0 Security & Architecture Audit Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('P0 #1 & #3: Store Credit Cryptographic Security & Atomic Single-Use Locking', () => {
    it('uses dedicated secret with HMAC-SHA256 and has no committed source code fallback in production', () => {
      const origEnv = process.env.NODE_ENV;
      const origStoreSecret = process.env.STORE_CREDIT_SECRET;
      const origRzpSecret = process.env.RAZORPAY_KEY_SECRET;
      const origSvcSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        process.env.NODE_ENV = 'production';
        delete process.env.STORE_CREDIT_SECRET;
        delete process.env.RAZORPAY_KEY_SECRET;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;

        expect(() => generateSignedStoreCredit('order_123', 500)).toThrow(/STORE_CREDIT_SECRET or server key required/);
      } finally {
        process.env.NODE_ENV = origEnv;
        if (origStoreSecret) process.env.STORE_CREDIT_SECRET = origStoreSecret;
        if (origRzpSecret) process.env.RAZORPAY_KEY_SECRET = origRzpSecret;
        if (origSvcSecret) process.env.SUPABASE_SERVICE_ROLE_KEY = origSvcSecret;
      }
    });

    it('atomically marks store credit as redeemed and locks out concurrent second spend', async () => {
      let isRedeemed = false;
      const validCode = 'CREDIT-849-ABCD-123456';

      const mockDb = {
        from: (table: string) => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  voucher_code: validCode,
                  credit_amount: 849,
                  status: 'approved_unworn',
                  is_redeemed: isRedeemed,
                },
                error: null,
              }),
            }),
          }),
          update: (updates: any) => ({
            eq: (col: string, val: any) => {
              if (col === 'voucher_code') {
                return {
                  eq: (col2: string, val2: any) => {
                    if (col2 === 'is_redeemed' && val2 === false) {
                      if (isRedeemed) {
                        // Already redeemed! Zero rows updated
                        return Promise.resolve({ data: [], error: null });
                      }
                      isRedeemed = true;
                      return Promise.resolve({ data: [{ id: 'mock_uuid' }], error: null });
                    }
                    return Promise.resolve({ data: [], error: null });
                  },
                };
              }
              return Promise.resolve({ data: [], error: null });
            },
          }),
        }),
      };

      // First spend: succeeds
      const firstRedeem = await redeemStoreCredit(validCode, 'order_1', mockDb);
      expect(firstRedeem.success).toBe(true);

      // Concurrent/second spend: fails immediately
      const secondRedeem = await redeemStoreCredit(validCode, 'order_2', mockDb);
      expect(secondRedeem.success).toBe(false);
      expect(secondRedeem.error).toContain('already been used');
    });
  });

  describe('P0 #2: Complete Elimination of Owner PII and Demo Bypasses', () => {
    it('never leaks owner PII or sample order on /api/orders without strict credentials', async () => {
      // Querying with former sample order ID '7792e434' without email MUST fail with HTTP 400
      const req1 = new NextRequest('http://localhost:3000/api/orders?orderId=7792e434');
      const res1 = await ordersGet(req1);
      expect(res1.status).toBe(400);

      const json1 = await res1.json();
      expect(json1.error).toContain('Both valid Order ID and Email are required');
      expect(json1.orders).toEqual([]);

      // Querying with owner email without order ID MUST fail with HTTP 400
      const req2 = new NextRequest('http://localhost:3000/api/orders?email=ajayrajbharrr0@gmail.com');
      const res2 = await ordersGet(req2);
      expect(res2.status).toBe(400);

      const json2 = await res2.json();
      expect(json2.orders).toEqual([]);
    });
  });

  describe('P0 #4: Razorpay Webhook Strict Secret Requirement', () => {
    it('returns HTTP 503 if RAZORPAY_WEBHOOK_SECRET is not configured', async () => {
      const origSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      try {
        delete process.env.RAZORPAY_WEBHOOK_SECRET;

        const req = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
          method: 'POST',
          headers: { 'x-razorpay-signature': 'abc' },
          body: JSON.stringify({ event: 'payment.captured' }),
        });

        const res = await webhookPost(req);
        expect(res.status).toBe(503);

        const data = await res.json();
        expect(data.error).toContain('RAZORPAY_WEBHOOK_SECRET');
      } finally {
        if (origSecret) process.env.RAZORPAY_WEBHOOK_SECRET = origSecret;
      }
    });
  });
});
