import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { products as staticCatalog } from '@/lib/data/products';

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let catalogItems = staticCatalog;

  if (url && key) {
    try {
      const sb = createClient(url, key);
      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        catalogItems = data;
      }
    } catch (e) {
      console.warn('Fallback to static catalog for Google feed:', e);
    }
  }

  const siteUrl = 'https://www.rareember.shop';

  const itemsXml = catalogItems
    .map((p) => {
      const id = escapeXml(String(p.id));
      const title = escapeXml(String(p.title || 'RareEmber Curated Drop'));
      const desc = escapeXml(
        String((p as any).description || p.story || p.short || `${title} - Premium curated lifestyle item by RareEmber. Pan-India express delivery with Cash on Delivery.`)
      );
      const link = `${siteUrl}/product/${id}`;
      const imageLink = escapeXml(String(p.image_url || `${siteUrl}/flame-icon.png`));
      
      let priceVal = 449;
      if (p.price_inr && Number(p.price_inr) > 0) {
        priceVal = Number(p.price_inr);
      } else if (p.price && Number(p.price) > 0) {
        const num = Number(p.price);
        priceVal = num >= 80 ? Math.round(num) : Math.round(num * 85);
      }

      const category = escapeXml(String(p.category || 'Apparel & Accessories'));

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
