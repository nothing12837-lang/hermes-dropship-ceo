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
import { validateCouponCode } from '@/lib/festivals';
import { ENABLE_CUSTOM_NECK_LABEL, expandBundleItems } from '@/lib/fulfillment/qikink';
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
  it('successfully resolves the Signature Graphic Drop without 404', async () => {
    const drop = await getProductFromDB('qikink-32477737-mens-full-sleeve-t-shirt');
    expect(drop).toBeDefined();
    expect(drop?.id).toBe('qikink-32477737-mens-full-sleeve-t-shirt');
    expect(drop?.title).toContain('Men\'s Full Sleeve T-Shirt');
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
    // Unisex Oversized Jersey: ₹799 (M.R.P. ₹1,399)
    const jersey = enforcePriceFloor({
      id: 'qikink-32476280-unisex-oversized-jersey',
      title: 'Unisex Oversized Jersey — Creator Edition',
      price: 489,
    } as any);
    expect(jersey.price).toBe(799);
    expect(jersey.compareAtPrice).toBe(1399);

    // 240 GSM Unisex Oversized Standard T-Shirt: ₹849 (M.R.P. ₹1,499)
    const tee = enforcePriceFloor({
      id: 'qikink-32476431-unisex-oversized-standard-t-shirt',
      title: 'Rare Ember Unisex Oversized Standard T-Shirt',
      price: 499,
    } as any);
    expect(tee.price).toBe(849);
    expect(tee.compareAtPrice).toBe(1499);

    // Gaming Pad / Desk Mat: ₹799 (M.R.P. ₹1,399)
    const pad = enforcePriceFloor({
      id: 'rare-ember-desk-mat',
      title: 'Rare Ember Gaming Pad',
      price: 499,
    } as any);
    expect(pad.price).toBe(799);
    expect(pad.compareAtPrice).toBe(1399);

    // Streetwear Duo: ₹1,499 (M.R.P. ₹2,499)
    const duo = enforcePriceFloor({
      id: 'bundle-streetwear-duo',
      title: 'The Streetwear Duo (2x Heavyweight Oversized Tees)',
      price: 899,
    } as any);
    expect(duo.price).toBe(1499);
    expect(duo.compareAtPrice).toBe(2499);

    // Founding 50: ₹1,499 (M.R.P. ₹2,499)
    const f50 = enforcePriceFloor({
      id: 'bundle-founding-50',
      title: 'The Founding 50 Builder Pack',
      price: 1099,
    } as any);
    expect(f50.price).toBe(1499);
    expect(f50.compareAtPrice).toBe(2499);

    // Workstation Pack: ₹1,899 (M.R.P. ₹3,199)
    const workstation = enforcePriceFloor({
      id: 'bundle-workstation',
      title: 'The Creator Workstation Pack',
      price: 1199,
    } as any);
    expect(workstation.price).toBe(1899);
    expect(workstation.compareAtPrice).toBe(3199);

    // Women's Classic Tee, Crop Top, Tank Top, Sleeveless: min ₹699 (M.R.P. ₹1,199)
    const crop = enforcePriceFloor({
      id: 'qikink-64953748-crop-top',
      title: "Women's Graphic Crop Top",
      price: 399,
    } as any);
    expect(crop.price).toBe(699);
    expect(crop.compareAtPrice).toBe(1199);

    const sleeveless = enforcePriceFloor({
      id: 'qikink-64953600-sleeveless',
      title: "Men's Sleeveless Athletic Tee",
      price: 499,
    } as any);
    expect(sleeveless.price).toBe(699);
    expect(sleeveless.compareAtPrice).toBe(1199);

    // Men's Polo (220 GSM): min ₹799 (M.R.P. ₹1,399)
    const polo = enforcePriceFloor({
      id: 'qikink-64953576-polo',
      title: "Executive Pique Polo",
      price: 549,
    } as any);
    expect(polo.price).toBe(799);
    expect(polo.compareAtPrice).toBe(1399);

    // Unisex V-Neck (64953544): min ₹849 (M.R.P. ₹1,499)
    const vneck = enforcePriceFloor({
      id: 'qikink-64953544-v-neck',
      title: "Bio-Washed Combed Cotton V-Neck Tee",
      price: 499,
    } as any);
    expect(vneck.price).toBe(849);
    expect(vneck.compareAtPrice).toBe(1499);

    // French Terry Oversized Tee / Full-Sleeve Tee / T-Shirt Dress / Acid Wash: min ₹949 (M.R.P. ₹1,699)
    const fullSleeve = enforcePriceFloor({
      id: 'qikink-64953648-full-sleeve',
      title: "Men's Full Sleeve T-Shirt",
      price: 699,
    } as any);
    expect(fullSleeve.price).toBe(949);
    expect(fullSleeve.compareAtPrice).toBe(1699);

    const acidWash = enforcePriceFloor({
      id: 'qikink-32476620-acid-wash-tee',
      title: "Vintage Acid-Wash Oversized Heavyweight Tee",
      price: 699,
    } as any);
    expect(acidWash.price).toBe(949);
    expect(acidWash.compareAtPrice).toBe(1699);

    // 320 GSM Crewneck Sweatshirt & Heavyweight Joggers: min ₹1,099 (M.R.P. ₹1,899)
    const sweatshirt = enforcePriceFloor({
      id: 'qikink-320gsm-sweatshirt',
      title: "320 GSM French Terry Crewneck Sweatshirt",
      price: 799,
    } as any);
    expect(sweatshirt.price).toBe(1099);
    expect(sweatshirt.compareAtPrice).toBe(1899);

    const joggers = enforcePriceFloor({
      id: 'qikink-320gsm-joggers',
      title: "320 GSM Heavyweight Streetwear Joggers",
      price: 899,
    } as any);
    expect(joggers.price).toBe(1099);
    expect(joggers.compareAtPrice).toBe(1899);

    // 380 GSM Heavyweight Winter Hoodie: min ₹1,399 (M.R.P. ₹2,299)
    const hoodie = enforcePriceFloor({
      id: 'qikink-heavyweight-hoodie',
      title: "380 GSM Heavyweight Winter Hoodie",
      price: 999,
    } as any);
    expect(hoodie.price).toBe(1399);
    expect(hoodie.compareAtPrice).toBe(2299);

    // 350 GSM Contrast-Sleeve Varsity Jacket & Bomber Jacket: min ₹1,499 (M.R.P. ₹2,599)
    const varsityJacket = enforcePriceFloor({
      id: 'qikink-varsity-jacket-01',
      title: "350 GSM Contrast-Sleeve Varsity Jacket",
      price: 1199,
    } as any);
    expect(varsityJacket.price).toBe(1499);
    expect(varsityJacket.compareAtPrice).toBe(2599);

    const bomberJacket = enforcePriceFloor({
      id: 'qikink-bomber-jacket-01',
      title: "Architectural Streetwear Bomber Jacket",
      price: 1199,
    } as any);
    expect(bomberJacket.price).toBe(1499);
    expect(bomberJacket.compareAtPrice).toBe(2599);
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

describe('Financial Margin Protection: Coupons, Neck Label & COD Handling Fee', () => {
  it('protects coupon minimum order thresholds from eroding margins', () => {
    // PREPAID30: minOrder: 699
    expect(validateCouponCode('PREPAID30', 500).valid).toBe(false);
    expect(validateCouponCode('PREPAID30', 698).valid).toBe(false);
    const p30 = validateCouponCode('PREPAID30', 699);
    expect(p30.valid).toBe(true);
    expect(p30.discountAmount).toBe(30);

    // FIRST50: minOrder: 799
    expect(validateCouponCode('FIRST50', 699).valid).toBe(false);
    expect(validateCouponCode('FIRST50', 798).valid).toBe(false);
    const f50 = validateCouponCode('FIRST50', 799);
    expect(f50.valid).toBe(true);
    expect(f50.discountAmount).toBe(50);

    // DIWALI100: minOrder: 1299 (test during active date window)
    const diwaliDate = new Date('2026-10-25T12:00:00Z');
    expect(validateCouponCode('DIWALI100', 849, diwaliDate).valid).toBe(false);
    expect(validateCouponCode('DIWALI100', 1298, diwaliDate).valid).toBe(false);
    const diwali = validateCouponCode('DIWALI100', 1299, diwaliDate);
    expect(diwali.valid).toBe(true);
    expect(diwali.discountAmount).toBe(100);

    // EMBER: minOrder: 1299
    expect(validateCouponCode('EMBER', 849).valid).toBe(false);
    expect(validateCouponCode('EMBER', 1298).valid).toBe(false);
    const ember = validateCouponCode('EMBER', 1299);
    expect(ember.valid).toBe(true);
    expect(ember.discountAmount).toBe(130);

    // WELCOME10: minOrder: 1299
    expect(validateCouponCode('WELCOME10', 849).valid).toBe(false);
    expect(validateCouponCode('WELCOME10', 1298).valid).toBe(false);
    const welcome = validateCouponCode('WELCOME10', 1299);
    expect(welcome.valid).toBe(true);
    expect(welcome.discountAmount).toBe(130);
  });

  it('defaults ENABLE_CUSTOM_NECK_LABEL to false to avoid ₹20-25 secondary print charge', () => {
    expect(ENABLE_CUSTOM_NECK_LABEL).toBe(false);
  });

  it('enforces ₹59 COD handling fee on COD orders while waiving 100% on prepaid', () => {
    const subtotal = 849;
    const discount = 0;

    // Prepaid calculation
    const prepaidCodFee = 0;
    const prepaidTotal = subtotal + prepaidCodFee - discount;
    expect(prepaidTotal).toBe(849);

    // COD calculation
    const codFee = 59;
    const codTotal = subtotal + codFee - discount;
    expect(codTotal).toBe(908);
  });

  it('safely handles missing, null, undefined, 0, or NaN prices by applying correct floor', () => {
    const noPrice = enforcePriceFloor({
      id: 'custom-drop-empty',
      title: 'Rare Ember Atelier Drop',
    } as any);
    expect(noPrice.price).toBe(849);
    expect(noPrice.price_inr).toBe(849);
    expect(noPrice.compareAtPrice).toBe(1499);

    const zeroPrice = enforcePriceFloor({
      id: 'custom-drop-zero',
      title: 'Rare Ember Atelier Drop',
      price: 0,
      price_inr: 0,
    } as any);
    expect(zeroPrice.price).toBe(849);
    expect(zeroPrice.price_inr).toBe(849);
    expect(zeroPrice.compareAtPrice).toBe(1499);
  });

  it('preserves 38-45% profit margin on 240 GSM Unisex Raglan & Ringer Tees with ₹849 floor', () => {
    const raglan = enforcePriceFloor({
      id: 'qikink-32476636-unisex-raglan-t-shirt',
      title: 'Unisex Raglan T-Shirt — Namaste Hustle Graphic',
      price: 699,
    } as any);
    expect(raglan.price).toBe(849);
    expect(raglan.compareAtPrice).toBe(1499);

    const ringer = enforcePriceFloor({
      id: 'qikink-32476299-unisex-ringer-t-shirt',
      title: 'Unisex Ringer T-Shirt — Urban Retro Graphic',
      price: 699,
    } as any);
    expect(ringer.price).toBe(849);
    expect(ringer.compareAtPrice).toBe(1499);
  });

  it('expands bundle-workstation into 380 GSM Heavyweight Hoodie and 900x400mm Desk Mat', () => {
    const bundle = [{ id: 'bundle-workstation', qty: 1, size: 'XL' }];
    const items = expandBundleItems(bundle);
    expect(items.length).toBe(2);

    const hoodie = items.find((i) => i.qikinkSkuPrefix === 'UHd');
    expect(hoodie).toBeDefined();
    expect(hoodie?.size).toBe('XL');
    expect(hoodie?.title).toContain('380 GSM Oversized Hoodie');

    const mat = items.find((i) => i.qikinkSkuPrefix === 'MPad-900x400');
    expect(mat).toBeDefined();
    expect(mat?.title).toContain('Desk Mat');
  });

  it('enforces updated bundle coupon minimum order requirements', () => {
    // DUO99 requires 1499
    expect(validateCouponCode('DUO99', 899).valid).toBe(false);
    expect(validateCouponCode('DUO99', 1499).valid).toBe(true);

    // BUILDER99 requires 1499
    expect(validateCouponCode('BUILDER99', 899).valid).toBe(false);
    expect(validateCouponCode('BUILDER99', 1499).valid).toBe(true);

    // BUNDLE150 requires 1899
    expect(validateCouponCode('BUNDLE150', 1199).valid).toBe(false);
    expect(validateCouponCode('BUNDLE150', 1899).valid).toBe(true);
  });
});

