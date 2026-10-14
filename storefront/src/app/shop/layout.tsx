import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://rareember-store.vercel.app';

export const metadata: Metadata = {
  title: 'All Products — Trending Electronics, Fashion & Home Decor',
  description:
    'Explore RareEmber catalog: wireless desk tech, curated fashion accessories, smart organizers, and ambient home aesthetics. Pan-India COD & Worldwide Express Delivery.',
  keywords: [
    'online shopping catalog',
    'buy electronics online',
    'curated fashion store',
    'home essentials India',
    'lifestyle accessories online',
    'cash on delivery shopping',
  ],
  alternates: {
    canonical: `${siteUrl}/shop`,
  },
  openGraph: {
    title: 'Shop All Trending Drops | RareEmber',
    description:
      'Trending electronics, curated fashion apparel, smart home gadgets, and aesthetic lifestyle essentials. Free Pan-India & Global delivery options.',
    type: 'website',
    url: `${siteUrl}/shop`,
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
