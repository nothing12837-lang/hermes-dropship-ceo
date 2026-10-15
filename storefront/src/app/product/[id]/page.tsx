import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductFromDB } from '@/lib/products-server';
import { ProductClient } from './ProductClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 120; // 2 min edge cache (ISR) for instant PDP loading

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductFromDB(id);

  if (!product) notFound();

  const cleanSlug = product.slug || product.id;
  const description =
    product.short || `Buy ${product.title} online at Rare Ember. Pan-India Express Delivery with Razorpay & Cash on Delivery.`;

  const canonicalUrl = `${siteUrl}/product/${cleanSlug}`;

  return {
    title: `${product.title} — Buy Online`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} | Rare Ember`,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: product.image_url || '/flame-icon.png',
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: [product.image_url || '/flame-icon.png'],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductFromDB(id);

  if (!product) notFound();

  const cleanSlug = (product.slug || product.id).replace(/^meesho-/, '');
  // Automatically redirect legacy or raw supplier links to clean brand URL
  if (id.startsWith('meesho-') && cleanSlug && cleanSlug !== id) {
    redirect(`/product/${cleanSlug}`);
  }

  const canonicalUrl = `${siteUrl}/product/${cleanSlug}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image_url ? [product.image_url] : [`${siteUrl}/flame-icon.png`],
    description: product.short || product.title,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Rare Ember',
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price: product.price_inr || product.price || 999,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Rare Ember',
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
          addressCountry: ['IN', 'US'],
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
            maxValue: 5,
            unitCode: 'd',
          },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.8,
      reviewCount: product.reviews || 128,
      bestRating: '5',
      worstRating: '1',
    },
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
      <ProductClient product={product} />
    </>
  );
}
