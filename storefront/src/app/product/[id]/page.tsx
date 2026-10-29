import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductFromDB } from '@/lib/products-server';
import { isKidsProduct } from '@/lib/data/products';
import { getServiceSupabase } from '@/lib/supabase-server';
import { ProductClient } from './ProductClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 120; // 2 min edge cache (ISR) for instant PDP loading

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (/gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification|10rs|5rs|rare-ember-custom|blank-/i.test(id)) {
    notFound();
  }
  const product = await getProductFromDB(id);

  if (!product || isKidsProduct(product)) notFound();

  const cleanSlug = product.slug || product.id;
  const currentPrice = product.price_inr || product.price || 999;

  // Clean factory SKU noise (e.g. '| UC61', 'UH62', etc.)
  const cleanTitle = (product.title || '')
    .replace(/\|\s*[A-Z0-9_-]{2,8}/gi, '')
    .replace(/\b(qikink|ut58|cc32|ms65|fc38|fa30|uj31|fd16|ur50|ua22|ut27|mt45|ut68|uc61|uh62|uc28|uc23|ma45|us52|ua51|ua26|bc50|mf31|ur37|ms36|ub39|us21|uv34|uj35|bc21|uh83|ur39)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const isHoodie = cleanTitle.toLowerCase().includes('hoodie');
  const isTee = cleanTitle.toLowerCase().includes('tee') || cleanTitle.toLowerCase().includes('shirt');
  const isBottom = cleanTitle.toLowerCase().includes('shorts') || cleanTitle.toLowerCase().includes('sweatpants');
  const gsmTag = isHoodie ? '380 GSM Heavyweight' : isTee ? '240 GSM Combed Cotton' : isBottom ? 'French Terry' : 'Heavyweight Streetwear';

  const seoTitle = `${cleanTitle} (${gsmTag}) — Rare Ember Streetwear India`;
  const description =
    product.short ||
    `Buy ${cleanTitle} online in India for ₹${currentPrice}. Premium ${gsmTag}, super-combed bio-washed fabric, drop-shoulder streetwear fit. Express 2-4 day pan-India delivery with Cash on Delivery (COD) & 7-day easy returns.`;

  const canonicalUrl = `${siteUrl}/product/${cleanSlug}`;
  const rawImage = product.image_url || '/flame-icon.png';
  const ogImageUrl = rawImage.startsWith('http') ? rawImage : `${siteUrl}${rawImage}`;

  const keywords = [
    cleanTitle,
    `${cleanTitle} India`,
    'buy streetwear online india',
    'oversized t shirt india',
    'heavyweight t shirt 240 gsm',
    '380 gsm hoodie india',
    'acid wash streetwear',
    'drop shoulder t shirt',
    'rare ember',
    'cod streetwear india',
  ];

  return {
    title: seoTitle,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description,
      url: canonicalUrl,
      siteName: 'Rare Ember',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 1200,
          alt: `${cleanTitle} — Rare Ember Streetwear`,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seoTitle} | Rare Ember`,
      description,
      images: [ogImageUrl],
      creator: '@rareember',
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  if (/gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification|10rs|5rs|rare-ember-custom|blank-/i.test(id)) {
    redirect('/shop');
  }
  const product = await getProductFromDB(id);

  if (!product || isKidsProduct(product)) notFound();

  const cleanSlug = (product.slug || product.id).replace(/^meesho-/, '');
  // Automatically redirect legacy, raw supplier, or old qikink- SKU links to clean brand URL
  if (cleanSlug && cleanSlug !== id) {
    redirect(`/product/${cleanSlug}`);
  }

  const canonicalUrl = `${siteUrl}/product/${cleanSlug}`;

  const isDrinkware = product.title.toLowerCase().includes('mug') || product.title.toLowerCase().includes('sipper');
  const isDeskGear = product.title.toLowerCase().includes('mat') || product.title.toLowerCase().includes('mousepad');
  const resolvedMaterial = isDrinkware
    ? 'High-Density Heat-Retaining Ceramic'
    : isDeskGear
    ? 'Waterproof Micro-Weave Cloth & Non-Slip Rubber Base'
    : '100% Super-Combed Bio-Washed Cotton (240 GSM Heavyweight)';

  // Real review data only.
  //
  // The schema previously published `ratingValue: product.rating || 4.8` and
  // `reviewCount: product.reviews || 128` -- seeded placeholder values that
  // did not match the on-page average computed from the real `reviews` table.
  // Publishing invented review markup breaches Google's structured-data
  // policy and is a manual-action risk. If we cannot prove a rating from the
  // reviews table, we omit the node entirely.
  let aggregateRating: Record<string, unknown> | undefined;
  try {
    const svc = getServiceSupabase();
    if (svc) {
      const { data: reviewRows, error: reviewErr } = await svc
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id);
      if (!reviewErr && Array.isArray(reviewRows) && reviewRows.length > 0) {
        const ratings = reviewRows
          .map((r: any) => Number(r?.rating))
          .filter((n: number) => Number.isFinite(n) && n > 0 && n <= 5);
        if (ratings.length > 0) {
          const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
          aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: Number(avg.toFixed(2)),
            reviewCount: ratings.length,
            bestRating: '5',
            worstRating: '1',
          };
        }
      }
    }
  } catch (e) {
    console.warn('[PDP] review aggregate unavailable:', e);
  }

  const cleanMpn = (product.slug || product.id).replace(/^qikink-?/i, 'RE-').toUpperCase();
  const primaryColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Obsidian Black';
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'Standard';
  const suggestedGender =
    product.gender === 'women' || product.title.toLowerCase().includes("women's") || product.title.toLowerCase().includes("girl's")
      ? 'female'
      : product.gender === 'men' || product.title.toLowerCase().includes("men's") || product.title.toLowerCase().includes("boy's")
      ? 'male'
      : 'unisex';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image_url ? [product.image_url, ...(product.images || []).filter((i) => i && i !== product.image_url).slice(0, 3)] : [`${siteUrl}/flame-icon.png`],
    description: product.short || product.title,
    disambiguatingDescription: `Authentic Rare Ember drop. Crafted with ${resolvedMaterial}. Pan-India express air shipping in 2-4 days via BlueDart & Delhivery with Cash on Delivery (COD) and 7-day easy returns.`,
    sku: cleanMpn,
    mpn: cleanMpn,
    color: primaryColor,
    size: availableSizes,
    pattern: product.is_printed ? 'Graphic Print' : 'Solid',
    category: isDrinkware ? 'Artisan Drinkware' : isDeskGear ? 'Desk & Creator Gear' : 'Streetwear Apparel',
    material: resolvedMaterial,
    audience: {
      '@type': 'PeopleAudience',
      suggestedGender,
    },
    brand: {
      '@type': 'Brand',
      name: 'Rare Ember',
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price: product.price_inr || product.price || 999,
      validFrom: '2026-01-01T00:00:00Z',
      priceValidUntil: '2027-12-31T23:59:59Z',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Rare Ember',
        url: siteUrl,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
        returnShippingFeesAmount: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'INR',
        },
        merchantReturnLink: `${siteUrl}/returns`,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'INR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 4,
            unitCode: 'd',
          },
        },
      },
    },
    ...(aggregateRating ? { aggregateRating } : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${siteUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense fallback={null}>
        <ProductClient product={product} />
      </Suspense>
    </>
  );
}
