import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';

export const metadata: Metadata = {
  title: 'All Streetwear & Graphic Drops',
  description:
    'Explore Rare Ember catalog: heavyweight streetwear, 240 GSM full sleeve drops, artisan ceramic mugs, extended desk mats, and creator gear. Pan-India COD & Express Delivery.',
  keywords: [
    'streetwear online india',
    'heavyweight oversized t-shirt',
    '240 gsm full sleeve t-shirt',
    'creator desk accessories',
    'aesthetic coffee mug',
    'cash on delivery streetwear',
  ],
  alternates: {
    canonical: `${siteUrl}/shop`,
  },
  openGraph: {
    title: 'All Streetwear & Graphic Drops',
    description:
      'Curated heavyweight streetwear, artisan drinkware, extended desk gear, and creator lifestyle essentials. Free Pan-India express delivery options.',
    type: 'website',
    url: `${siteUrl}/shop`,
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
