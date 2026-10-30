import { NextResponse } from 'next/server';
import { products as curatedCatalog, Product } from '@/lib/data/products';

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

/**
 * Maps items to official Google Product Categories (Taxonomy)
 * Valid Google categories are required for Google Shopping tab free listings.
 */
function getGoogleProductCategory(p: Product): string {
  const title = (p.title || '').toLowerCase();
  const id = (p.id || '').toLowerCase();

  if (title.includes('mug') || id.includes('mug')) {
    return 'Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs';
  }
  if (title.includes('desk mat') || title.includes('mousepad') || id.includes('desk-mat')) {
    return 'Office Supplies > Desk Organizers & Accessories';
  }
  if (title.includes('hoodie') || title.includes('sweatshirt')) {
    return 'Apparel & Accessories > Clothing > Outerwear > Coats & Jackets';
  }
  if (title.includes('jersey')) {
    return 'Apparel & Accessories > Clothing > Activewear > Jerseys';
  }
  if (title.includes('dress')) {
    return 'Apparel & Accessories > Clothing > Dresses';
  }
  // All streetwear t-shirts, tops, and silhouettes
  return 'Apparel & Accessories > Clothing > Shirts & Tops';
}

function getProductType(p: Product): string {
  const title = (p.title || '').toLowerCase();
  if (title.includes('hoodie')) return 'Streetwear > Outerwear > Hoodies';
  if (title.includes('oversized')) return 'Streetwear > Unisex > Oversized Tees';
  if (title.includes('full sleeve')) return 'Streetwear > Men > Full Sleeve Tees';
  if (title.includes('crop') || title.includes("women's")) return 'Streetwear > Women > Tops & Tees';
  if (title.includes('girl') || title.includes('boy') || title.includes('kids')) return 'Streetwear > Kids > Graphic Tees';
  if (title.includes('desk mat')) return 'Creator Gear > Workstation > Desk Mats';
  if (title.includes('mug')) return 'Artisan Living > Drinkware > Mugs';
  return 'Streetwear > Graphic Drops';
}

function getGender(p: Product): 'male' | 'female' | 'unisex' {
  const title = (p.title || '').toLowerCase();
  if (p.gender === 'women' || title.includes("women's") || title.includes("girl's") || title.includes('crop')) {
    return 'female';
  }
  if (p.gender === 'men' || title.includes("men's") || title.includes("boy's")) {
    return 'male';
  }
  return 'unisex';
}

function getAgeGroup(p: Product): 'adult' | 'kids' {
  const title = (p.title || '').toLowerCase();
  if (title.includes('kid') || title.includes("girl's crew") || title.includes("boy's crew") || p.category === 'kids') {
    return 'kids';
  }
  return 'adult';
}

function getMaterial(p: Product): string {
  const title = (p.title || '').toLowerCase();
  if (title.includes('mug')) return 'High-Density Stoneware Ceramic';
  if (title.includes('desk mat')) return 'Waterproof Micro-Weave Cloth & Rubber Base';
  if (title.includes('hoodie')) return '100% Super-Combed Bio-Washed Cotton French Terry (380 GSM)';
  if (title.includes('terry')) return '260 GSM French Terry Cotton';
  return '100% Super-Combed Bio-Washed Cotton (240 GSM Combed Cotton)';
}

function getShippingWeight(p: Product): string {
  const title = (p.title || '').toLowerCase();
  if (title.includes('hoodie')) return '0.65 kg';
  if (title.includes('desk mat')) return '0.40 kg';
  if (title.includes('mug')) return '0.45 kg';
  return '0.30 kg';
}

export async function GET() {
  const catalogItems = curatedCatalog as Product[];
  const siteUrl = 'https://www.rareember.shop';

  const itemsXml = catalogItems
    .map((p) => {
      const cleanSlug = p.slug || p.id;
      const rawId = p.id;
      const mpn = escapeXml((p.slug || rawId).replace(/^qikink-?/i, 'RE-').toUpperCase());
      const id = escapeXml(String(rawId));
      const title = escapeXml(String(p.title || 'RareEmber Curated Drop'));
      const desc = escapeXml(
        String(
          (p as any).description ||
            p.short ||
            `${title} — Authentic Rare Ember drop. Crafted with ${getMaterial(p)}. Pan-India express air delivery via Delhivery Air with Cash on Delivery and 7-day returns.`
        )
      );
      const link = `${siteUrl}/product/${cleanSlug}`;
      const imageLink = escapeXml(String(p.image_url || `${siteUrl}/flame-icon.png`));

      const priceVal = Number(p.price || p.price_inr || 599);
      const googleCategory = escapeXml(getGoogleProductCategory(p));
      const productType = escapeXml(getProductType(p));
      const gender = getGender(p);
      const ageGroup = getAgeGroup(p);
      const material = escapeXml(getMaterial(p));
      const weight = getShippingWeight(p);

      const color = p.colors && p.colors.length > 0 ? escapeXml(p.colors[0]) : 'Obsidian Black';
      const size = p.sizes && p.sizes.length > 0 ? escapeXml(p.sizes.slice(0, 6).join('/')) : 'One Size';

      // Additional images if available
      const additionalImages = (p.images || [])
        .filter((img) => img && img !== p.image_url)
        .slice(0, 4)
        .map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join('\n');

      return `    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
${additionalImages ? additionalImages + '\n' : ''}      <g:brand>RareEmber</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${priceVal.toFixed(2)} INR</g:price>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${productType}</g:product_type>
      <g:gender>${gender}</g:gender>
      <g:age_group>${ageGroup}</g:age_group>
      <g:color>${color}</g:color>
      <g:size>${size}</g:size>
      <g:material>${material}</g:material>
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${mpn}</g:mpn>
      <g:shipping_weight>${weight}</g:shipping_weight>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Express Air</g:service>
        <g:price>0.00 INR</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>1</g:max_handling_time>
        <g:min_transit_time>2</g:min_transit_time>
        <g:max_transit_time>4</g:max_transit_time>
      </g:shipping>
      <g:return_policy_label>7_day_returns</g:return_policy_label>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>RareEmber™ — Luxury Streetwear Collection</title>
    <link>${siteUrl}</link>
    <description>Rare Ember Official Product Catalog for Google Shopping Tab Free Listings</description>
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
