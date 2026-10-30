import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';

export const metadata: Metadata = {
  title: 'All Collection — 240 GSM Tees & 380 GSM Outerwear',
  description:
    'Explore the Rare Ember collection: 240 GSM combed cotton oversized tees, 320–380 GSM fleece hoodies, varsity bombers, and creator workstation gear. Pan-India COD & Express Delivery.',
  keywords: [
    'streetwear online india',
    '240 gsm oversized t-shirt',
    '380 gsm fleece hoodie',
    'creator desk accessories',
    'contrast varsity jacket',
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
