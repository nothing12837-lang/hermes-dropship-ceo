import { describe, expect, it } from 'vitest';
import { normalizeIndianState } from '@/app/checkout/page';
import { getProductFromDB } from '@/lib/products-server';
import {
  sortSizes,
  getGarmentSpecBadge,
  enforcePriceFloor,
  products,
  BUNDLE_FALLBACK_PRODUCTS,
} from '@/lib/data/products';
import { isAllowedBlog, deduplicatePosts } from '@/app/blog/page';
import qp from '@/lib/data/qikink-products.json';

describe('normalizeIndianState', () => {
  it('normalizes common Indian state variations and aliases', () => {
    expect(normalizeIndianState('NCT of Delhi')).toBe('Delhi');
    expect(normalizeIndianState('Delhi NCR')).toBe('Delhi');
    expect(normalizeIndianState('New Delhi')).toBe('Delhi');
    expect(normalizeIndianState('Jammu & Kashmir')).toBe('Jammu and Kashmir');
    expect(normalizeIndianState('Orissa')).toBe('Odisha');
    expect(normalizeIndianState('Pondicherry')).toBe('Puducherry');
    expect(normalizeIndianState('Uttaranchal')).toBe('Uttarakhand');
    expect(normalizeIndianState('Tamilnadu')).toBe('Tamil Nadu');
    expect(normalizeIndianState('Chattisgarh')).toBe('Chhattisgarh');
    expect(normalizeIndianState('Andaman & Nicobar')).toBe('Andaman and Nicobar Islands');
    expect(normalizeIndianState('Daman and Diu')).toBe('Dadra and Nagar Haveli and Daman and Diu');
    expect(normalizeIndianState('Karnataka')).toBe('Karnataka');
    expect(normalizeIndianState('Maharashtra')).toBe('Maharashtra');
  });
});

describe('Product Catalog Resolution (Zero 404 Glitches)', () => {
  it('successfully resolves the 380 GSM Heavyweight Hoodie without 404', async () => {
    const hoodie = await getProductFromDB('rare-ember-380gsm-heavyweight-streetwear-hoodie');
    expect(hoodie).toBeDefined();
    expect(hoodie?.id).toBe('rare-ember-380gsm-heavyweight-streetwear-hoodie');
    expect(hoodie?.title).toContain('380 GSM Heavyweight');
  });

  it('resolves all products in the catalog cleanly', async () => {
    for (const item of qp) {
      const slug = item.slug || item.id;
      const res = await getProductFromDB(slug);
      expect(res, `Product ${slug} failed to resolve`).toBeDefined();
      expect(res?.title).toBeTruthy();
    }
  });
});

describe('Glitches Fix 1: Pricing Floor & Dynamic Garment Badges', () => {
  it('enforces updated price floors for key drops and bundles', () => {
    // Unisex Oversized Jersey: ₹679
    const jersey = enforcePriceFloor({
      id: 'qikink-32476280-unisex-oversized-jersey',
      title: 'Unisex Oversized Jersey — Creator Edition',
      price: 489,
    } as any);
    expect(jersey.price).toBe(679);
    expect(jersey.compareAtPrice).toBe(1299);

    // Unisex Oversized Standard T-Shirt: ₹649
    const tee = enforcePriceFloor({
      id: 'qikink-32476431-unisex-oversized-standard-t-shirt',
      title: 'Rare Ember Unisex Oversized Standard T-Shirt',
      price: 499,
    } as any);
    expect(tee.price).toBe(649);
    expect(tee.compareAtPrice).toBe(1199);

    // Gaming Pad / Desk Mat: ₹649
    const pad = enforcePriceFloor({
      id: 'rare-ember-desk-mat',
      title: 'Rare Ember Gaming Pad',
      price: 499,
    } as any);
    expect(pad.price).toBe(649);
    expect(pad.compareAtPrice).toBe(1199);

    // Streetwear Duo: ₹1,199
    const duo = enforcePriceFloor({
      id: 'bundle-streetwear-duo',
      title: 'The Streetwear Duo (2x Heavyweight Oversized Tees)',
      price: 899,
    } as any);
    expect(duo.price).toBe(1199);
    expect(duo.compareAtPrice).toBe(1799);

    // Founding 50: ₹1,199
    const f50 = enforcePriceFloor({
      id: 'bundle-founding-50',
      title: 'The Founding 50 Builder Pack',
      price: 1099,
    } as any);
    expect(f50.price).toBe(1199);
    expect(f50.compareAtPrice).toBe(1799);

    // Workstation Pack: ₹1,399
    const workstation = enforcePriceFloor({
      id: 'bundle-workstation',
      title: 'The Creator Workstation Pack',
      price: 1199,
    } as any);
    expect(workstation.price).toBe(1399);
    expect(workstation.compareAtPrice).toBe(1999);
  });

  it('correctly maps getGarmentSpecBadge without shifting array indices', () => {
    // Varsity jacket must NOT get Gaming Pad badge
    const varsity = getGarmentSpecBadge({
      id: 'varsity-jacket-01',
      title: '3AM Indiranagar Founder Club — 350 GSM Contrast-Sleeve Varsity Jacket',
    });
    expect(varsity).toBe('350 GSM Varsity');

    // Gaming Pad must get 900x400mm badge, NOT Dev Bestseller
    const deskMat = getGarmentSpecBadge({
      id: 'gaming-pad-01',
      title: 'Rare Ember Gaming Pad',
    });
    expect(deskMat).toBe('Extended 900×400mm');

    // Heavyweight hoodie
    const hoodie = getGarmentSpecBadge({
      id: 'hoodie-01',
      title: 'Rare Ember Git Commit Or Die Trying Heavyweight Dev Hoodie',
    });
    expect(hoodie).toBe('380 GSM Heavy Fleece');

    // Unisex jersey
    const jersey = getGarmentSpecBadge({
      id: 'jersey-01',
      title: 'Unisex Oversized Jersey — Creator Edition',
    });
    expect(jersey).toBe('220 GSM Breathable Mesh');
  });
});

describe('Glitches Fix 2: Canonical Size Ordering (Eliminating Sizes S–XS)', () => {
  it('sorts adult sizes in strict canonical order XS -> 5XL', () => {
    const unsorted = ['S', 'M', 'L', 'XS', 'XL', 'XXL'];
    const sorted = sortSizes(unsorted);
    expect(sorted).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL']);

    // Check formatting
    const formatted = `Sizes ${sorted[0]}–${sorted[sorted.length - 1]}`;
    expect(formatted).toBe('Sizes XS–XXL');
    expect(formatted).not.toBe('Sizes S–XS');
  });

  it('sorts adult sizes with S and 3XL properly', () => {
    const unsorted = ['L', '3XL', 'S', 'M', '2XL', 'XL'];
    const sorted = sortSizes(unsorted);
    expect(sorted).toEqual(['S', 'M', 'L', 'XL', '2XL', '3XL']);
    expect(`Sizes ${sorted[0]}–${sorted[sorted.length - 1]}`).toBe('Sizes S–3XL');
  });

  it('correctly sorts kids sizes without confusing letter M with adult Medium', () => {
    const kids = ['24-35M', '0-12M', '12-23M'];
    const sorted = sortSizes(kids);
    expect(sorted).toEqual(['0-12M', '12-23M', '24-35M']);
  });
});

describe('Glitches Fix 3: Catalog Filtering of Squished Kids Tees & Test Artifacts', () => {
  it('omits 1-inch squished print items and test fixtures from public catalog', () => {
    const ids = products.map((p) => p.id);
    expect(ids.some((id) => id.includes('64953488'))).toBe(false);
    expect(ids.some((id) => id.includes('64953664'))).toBe(false);
    expect(ids.some((id) => id.includes('rare-ember-gateway-test-pass'))).toBe(false);
  });
});

describe('Glitches Fix 4: Journal & Blog Filtering & Deduplication', () => {
  it('filters out dropshipping kitchen, diffuser, and bedroom lighting spam', () => {
    expect(isAllowedBlog({ title: 'Smart Kitchen Organizers That Save 2 Hours Every Day', slug: 'smart-kitchen-organizers' })).toBe(false);
    expect(isAllowedBlog({ title: 'Top 7 Smart Kitchen Organizers', slug: 'top-7-smart-kitchen' })).toBe(false);
    expect(isAllowedBlog({ title: 'How Ambient Diffusers Transform Sleep Quality', slug: 'ambient-diffusers-sleep' })).toBe(false);
    expect(isAllowedBlog({ title: 'Modern Aesthetic Home Lighting', slug: 'modern-aesthetic-home-lighting' })).toBe(false);
    expect(isAllowedBlog({ title: 'Cozy Bedroom Desk Setup Under 500 Rupees', slug: 'bedroom-desk-under-500' })).toBe(false);
  });

  it('permits authentic streetwear and workspace engineering articles', () => {
    expect(isAllowedBlog({ title: 'Why 240 GSM Heavyweight Streetwear Is Replacing Fast-Fashion', slug: 'why-240-gsm' })).toBe(true);
    expect(isAllowedBlog({ title: 'The Blueprint for High-End College Fest & Hackathon Merch', slug: 'hackathon-merch' })).toBe(true);
    expect(isAllowedBlog({ title: 'Inside the Loom: 380 GSM French Terry Fleece', slug: '380-gsm-fleece' })).toBe(true);
    expect(isAllowedBlog({ title: 'How to Build an Ultra-Clean Minimalist Desk Setup', slug: 'minimalist-desk-setup' })).toBe(true);
  });

  it('deduplicates identical articles that share the same title or timestamped slug', () => {
    const duplicateArticles = [
      { title: 'Budget-Friendly Desk Setup Ideas Under 1000 Rupees', slug: 'budget-desk-setup-ideas-india-202610151640' },
      { title: 'Budget-Friendly Desk Setup Ideas Under 1000 Rupees', slug: 'budget-desk-setup-ideas-india-202610151641' },
      { title: 'Budget-Friendly Desk Setup Ideas Under 1000 Rupees', slug: 'budget-desk-setup-ideas-india-202610151707' },
      { title: 'Budget-Friendly Desk Setup Ideas Under 1000 Rupees', slug: 'budget-desk-setup-ideas-india-202610151840' },
      { title: 'Why 240 GSM Heavyweight Streetwear Is Replacing Fast-Fashion', slug: 'why-240-gsm' },
    ];
    const deduped = deduplicatePosts(duplicateArticles);
    expect(deduped.length).toBe(2);
    expect(deduped[0].title).toBe('Budget-Friendly Desk Setup Ideas Under 1000 Rupees');
    expect(deduped[1].title).toBe('Why 240 GSM Heavyweight Streetwear Is Replacing Fast-Fashion');
  });
});
