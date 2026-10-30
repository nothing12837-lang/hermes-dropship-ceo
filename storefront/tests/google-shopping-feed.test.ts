import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/feed/google/route';

describe('Google Shopping & Merchant Center Feed Engine', () => {
  it('should return valid XML with HTTP 200 and application/xml Content-Type', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/xml');

    const xml = await res.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('RareEmber');
  });

  it('should include all active products with required Google Shopping attributes', async () => {
    const res = await GET();
    const xml = await res.text();

    const items = xml.split('<item>').slice(1);
    expect(items.length).toBeGreaterThan(10);

    for (const item of items) {
      // 1. Core Identifiers
      expect(item).toContain('<g:id>');
      expect(item).toContain('<g:title>');
      expect(item).toContain('<g:description>');
      expect(item).toContain('<g:link>https://www.rareember.shop/product/');
      expect(item).toContain('<g:image_link>https://');

      // 2. Brand & Condition
      expect(item).toMatch(/<g:brand>(RareEmber|Rare Ember)<\/g:brand>/);
      expect(item).toContain('<g:condition>new</g:condition>');
      expect(item).toContain('<g:availability>in_stock</g:availability>');

      // 3. Price formatting: e.g. 779.00 INR
      expect(item).toMatch(/<g:price>\d+\.00 INR<\/g:price>/);

      // 4. Strict Google Taxonomy Category (never arbitrary single-word categories like 'fashion')
      expect(item).toMatch(/<g:google_product_category>(Apparel (&amp;|&) Accessories|Home (&amp;|&) Garden|Office Supplies)/);

      // 5. Mandatory Apparel attributes for Free Listings
      expect(item).toMatch(/<g:gender>(male|female|unisex)<\/g:gender>/);
      expect(item).toMatch(/<g:age_group>(adult|kids)<\/g:age_group>/);
      expect(item).toContain('<g:color>');
      expect(item).toContain('<g:size>');
      expect(item).toContain('<g:material>');

      // 6. Custom POD identifier flags (prevents GTIN/barcode rejection in Merchant Center)
      expect(item).toContain('<g:identifier_exists>no</g:identifier_exists>');
      expect(item).toContain('<g:mpn>');

      // 7. Shipping & Delivery Details
      expect(item).toContain('<g:country>IN</g:country>');
      expect(item).toMatch(/<g:service>(Express Air|Delhivery Express Air)<\/g:service>/);
      expect(item).toContain('<g:price>0.00 INR</g:price>');
      expect(item).toContain('<g:shipping_weight>');
      expect(item).toContain('<g:return_policy_label>7_day_returns</g:return_policy_label>');
    }
  });

  it('should map categories correctly for specialized items', async () => {
    const res = await GET();
    const xml = await res.text();

    // Check desk mat mapping if present
    if (xml.includes('Desk Mat')) {
      expect(xml).toContain('Office Supplies &gt; Desk Organizers &amp; Accessories');
    }

    // Check hoodie mapping if present
    if (xml.includes('Hoodie')) {
      expect(xml).toContain('Apparel &amp; Accessories &gt; Clothing &gt; Outerwear &gt; Coats &amp; Jackets');
    }

    // Check jersey mapping if present
    if (xml.includes('Jersey')) {
      expect(xml).toContain('Apparel &amp; Accessories &gt; Clothing &gt; Activewear &gt; Jerseys');
    }
  });
});


import { GET as getXmlFeed } from '@/app/api/feed/google.xml/route';

describe('Google Shopping XML Dedicated Route (/api/feed/google.xml)', () => {
  it('should return valid XML feed with brand RareEmber and Express Air shipping', async () => {
    const res = await getXmlFeed();
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">');
    expect(xml).toContain('<g:brand>RareEmber</g:brand>');
    expect(xml).toContain('<g:service>Express Air</g:service>');
    expect(xml).toContain('<g:price>');
    expect(xml).toContain('<g:availability>in_stock</g:availability>');
  });
});
