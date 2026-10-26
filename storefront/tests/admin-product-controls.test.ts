import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getAdminProducts, PATCH as patchAdminProducts, POST as postAdminProducts, DELETE as deleteAdminProducts } from '@/app/api/admin/products/route';
import { GET as verifyQikink } from '@/app/api/admin/products/verify-qikink/route';

describe('Admin Product Controls & Qikink Verification API', () => {
  const originalAdminSecret = process.env.ADMIN_SECRET;

  beforeEach(() => {
    process.env.ADMIN_SECRET = 'test_secret_vault_123';
  });

  afterEach(() => {
    process.env.ADMIN_SECRET = originalAdminSecret;
    vi.restoreAllMocks();
  });

  describe('Security & Authentication Gates', () => {
    it('rejects unauthenticated requests to /api/admin/products with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: { Authorization: 'Bearer wrong_token' },
      });
      const res = await getAdminProducts(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Unauthorized');
    });

    it('rejects unauthenticated requests to verify-qikink with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/verify-qikink?id=32476280');
      const res = await verifyQikink(req);
      expect(res.status).toBe(401);
    });

    it('allows access with valid ADMIN_SECRET Bearer token', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: { Authorization: 'Bearer test_secret_vault_123' },
      });
      const res = await getAdminProducts(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json.products)).toBe(true);
      expect(json.products.length).toBeGreaterThan(0);
      expect(json.metrics).toBeDefined();
      expect(json.metrics.total).toBeGreaterThan(0);
    });
  });

  describe('Qikink Live Verification Endpoint', () => {
    it('requires a product ID parameter', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/verify-qikink', {
        headers: { Authorization: 'Bearer test_secret_vault_123' },
      });
      const res = await verifyQikink(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('required');
    });

    it('verifies product 32476280 (Unisex Oversized Jersey) with accurate blank SKU UJ35 and landed cost', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/verify-qikink?id=32476280', {
        headers: { Authorization: 'Bearer test_secret_vault_123' },
      });
      const res = await verifyQikink(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.verified).toBeDefined();
      expect(json.verified.blankSku).toBe('UJ35');
      expect(json.verified.baseCost).toBe(220.5);
      expect(json.verified.recommendedSellingPrice).toBeGreaterThan(json.verified.baseCost);
      expect(json.verified.margin).toBeGreaterThan(0);
      expect(json.verified.marginPct).toBeGreaterThan(40);
      expect(json.verified.colors).toBeDefined();
      expect(json.verified.sizes).toBeDefined();
    });

    it('verifies product 32477737 (Men Full Sleeve T-Shirt) with blank SKU MRnFs', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/verify-qikink?id=32477737', {
        headers: { Authorization: 'Bearer test_secret_vault_123' },
      });
      const res = await verifyQikink(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.verified.blankSku).toBe('MRnFs');
      expect(json.verified.baseCost).toBeCloseTo(414.91, 1);
      expect(json.verified.sizes).toContain('M');
      expect(json.verified.sizes).toContain('L');
    });

    it('synthesizes a valid verified preview for a custom Qikink product ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/verify-qikink?id=99998888', {
        headers: { Authorization: 'Bearer test_secret_vault_123' },
      });
      const res = await verifyQikink(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.verified.blankSku).toBe('UOst');
      expect(json.verified.isCustomSynthesized).toBe(true);
      expect(json.verified.recommendedSellingPrice).toBe(849);
      expect(json.verified.compareAtPrice).toBe(1499);
      expect(json.verified.margin).toBeGreaterThan(400);
    });
  });

  describe('Product Controls: Stop, Pause, Edit, Re-sync & Import', () => {
    it('supports toggle_active action to pause and resume a product drop', async () => {
      const pauseReq = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer test_secret_vault_123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_active',
          productId: 'qikink-32476280-unisex-oversized-jersey',
          active: false,
        }),
      });
      const pauseRes = await patchAdminProducts(pauseReq);
      expect(pauseRes.status).toBe(200);
      const pauseJson = await pauseRes.json();
      expect(pauseJson.ok).toBe(true);
      expect(pauseJson.active).toBe(false);

      // Resume product
      const resumeReq = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer test_secret_vault_123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_active',
          productId: 'qikink-32476280-unisex-oversized-jersey',
          active: true,
        }),
      });
      const resumeRes = await patchAdminProducts(resumeReq);
      expect(resumeRes.status).toBe(200);
      const resumeJson = await resumeRes.json();
      expect(resumeJson.ok).toBe(true);
      expect(resumeJson.active).toBe(true);
    });

    it('supports update_details to modify price and compareAtPrice', async () => {
      const editReq = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer test_secret_vault_123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_details',
          productId: 'qikink-32476280-unisex-oversized-jersey',
          updates: {
            price: 799,
            compareAtPrice: 1399,
            title: 'Unisex Oversized Jersey — Creator Sublimation Jersey',
          },
        }),
      });
      const editRes = await patchAdminProducts(editReq);
      expect(editRes.status).toBe(200);
      const editJson = await editRes.json();
      expect(editJson.ok).toBe(true);
      expect(editJson.product.price).toBe(799);
    });

    it('supports resync_qikink to refresh color mockups and variants', async () => {
      const resyncReq = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer test_secret_vault_123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resync_qikink',
          productId: 'qikink-32476280-unisex-oversized-jersey',
        }),
      });
      const res = await patchAdminProducts(resyncReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.message).toContain('Qikink');
    });

    it('supports 1-click import of a verified Qikink product drop', async () => {
      const importReq = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test_secret_vault_123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'import_qikink',
          qikinkProductId: '32476280',
          title: 'Unisex Oversized Jersey — Creator Edition',
          sellingPrice: 799,
          compareAtPrice: 1399,
          category: 'fashion',
        }),
      });
      const res = await postAdminProducts(importReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.product).toBeDefined();
      expect(json.product.price).toBe(799);
      expect(json.product.qikinkClientProductId).toBe('32476280');
    });

    it('supports soft-deleting / removing a product from the catalog', async () => {
      const deleteReq = new NextRequest('http://localhost:3000/api/admin/products?productId=qikink-32476280-unisex-oversized-jersey', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test_secret_vault_123',
        },
      });
      const res = await deleteAdminProducts(deleteReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.deletedId).toBe('qikink-32476280-unisex-oversized-jersey');

      // Re-activate product for test cleanliness
      const reactivateReq = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer test_secret_vault_123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_active',
          productId: 'qikink-32476280-unisex-oversized-jersey',
          active: true,
        }),
      });
      await patchAdminProducts(reactivateReq);
    });
  });
});
