import { NextResponse } from 'next/server';
// Use the curated catalogue, not the raw JSON: the raw feed published the
// Rs.10 "Gateway Test Pass" test SKU and pre-price-floor prices, so Google
// Shopping showed prices the storefront never charged.
import { products as curatedCatalog } from '@/lib/data/products';

export const runtime = 'nodejs';
export const revalidate = 3600; // Cache feed for 1 hour

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const catalogItems = curatedCatalog as any[];
  const siteUrl = 'https://www.rareember.shop';

  const itemsXml = catalogItems
    .map((p) => {
      const cleanSlug = p.slug || p.id;
      const id = escapeXml(String(p.id));
      const title = escapeXml(String(p.title || 'RareEmber Curated Drop'));
      const desc = escapeXml(
        String((p as any).description || p.short || `${title} - Premium 100% combed cotton apparel by RareEmber. Pan-India express delivery with Cash on Delivery.`)
      );
      const link = `${siteUrl}/product/${cleanSlug}`;
      const imageLink = escapeXml(String(p.image_url || `${siteUrl}/flame-icon.png`));
      
      const priceVal = Number(p.price || p.price_inr || 599);
      const category = escapeXml(String(p.category || 'Apparel & Accessories > Clothing'));

      return `    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:brand>RareEmber</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${priceVal.toFixed(2)} INR</g:price>
      <g:google_product_category>${category}</g:google_product_category>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Express Domestic Delivery</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>RareEmber - Curated Streetwear, Artisan Living &amp; Workstation Tech</title>
    <link>${siteUrl}</link>
    <description>RareEmber Official Catalog for Google Shopping and Free Listings</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
