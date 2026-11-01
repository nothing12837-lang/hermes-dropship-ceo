import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';

export const metadata: Metadata = {
  title: 'All Streetwear & Graphic Drops',
  description:
    'Explore Rare Ember: architectural 240 GSM structured cotton oversized tees, 260 GSM French terry tees, and 320–380 GSM heavyweight fleece hoodies. Handcrafted graphic streetwear. Pan-India COD & Express Air Delivery.',
  keywords: [
    'streetwear online india',
    '240 gsm structured cotton t-shirt',
    'heavyweight fleece hoodie',
    'oversized drop shoulder tee',
    'luxury indian streetwear',
    'cash on delivery streetwear',
  ],
  alternates: {
    canonical: `${siteUrl}/shop`,
  },
  openGraph: {
    title: 'All Streetwear & Graphic Drops',
    description:
      'Curated architectural streetwear: 240 GSM structured tees and 320–380 GSM heavyweight hoodies with archival prints. Free Pan-India express delivery.',
    type: 'website',
    url: `${siteUrl}/shop`,
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
