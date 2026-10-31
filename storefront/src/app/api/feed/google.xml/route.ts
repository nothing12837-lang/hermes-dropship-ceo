import { NextResponse } from 'next/server';
import { products as curatedCatalog, Product, isKidsProduct, enforcePriceFloor } from '@/lib/data/products';

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

function isDisallowed(p: Product): boolean {
  if (isKidsProduct(p)) return true;
  const str = `${p.id || ''} ${p.slug || ''} ${p.title || ''}`.toLowerCase();
  return /gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification|10rs|5rs|rare-ember-custom|blank-|bundle-/i.test(str);
}

export async function GET() {
  const siteUrl = 'https://www.rareember.shop';
  const activeProducts = (curatedCatalog as Product[])
    .filter((p) => !isDisallowed(p) && p.active !== false)
    .map((raw) => enforcePriceFloor(raw));

  const itemsXml = activeProducts
    .map((p) => {
      const cleanSlug = p.slug || p.id;
      const id = escapeXml(String(p.id));
      const title = escapeXml(String(p.title || 'RareEmber Luxury Streetwear Drop'));
      const desc = escapeXml(
        String(
          (p as any).description ||
            p.short ||
            `${title} — RareEmber™ Independent Luxury Streetwear. Architectural drop-shoulder cut, combed bio-washed fabric, and statement archival graphics. Complimentary express air delivery across India with 7-day doorstep size exchange.`
        )
      );
      const link = `${siteUrl}/product/${cleanSlug}`;
      const rawImg = p.image_url || '/flame-icon.png';
      const fullImg = rawImg.startsWith('http') ? rawImg : `${siteUrl}${rawImg}`;
      const imageLink = escapeXml(fullImg);
      const priceVal = Number(p.price_inr || p.price || 849);

      return `    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${priceVal.toFixed(2)} INR</g:price>
      <g:brand>RareEmber</g:brand>
      <g:age_group>adult</g:age_group>
      <g:gender>unisex</g:gender>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Express Air</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>RareEmber™ — Luxury Streetwear Collection</title>
    <link>${siteUrl}</link>
    <description>RareEmber Official Luxury Streetwear Catalog for Google Merchant Center</description>
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
