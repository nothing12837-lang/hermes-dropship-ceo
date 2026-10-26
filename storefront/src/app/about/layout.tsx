import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Our Sourcing & Craftsmanship',
  description: 'Learn about Rare Ember: our story, verified seller craft production, zero-compromise heavyweight quality, and our customer-first 7-day guarantee.',
  openGraph: {
    title: 'About Our Sourcing & Craftsmanship',
    description: 'Curating premium heavyweight streetwear, artisan drinkware, and creator desk essentials direct from verified domestic makers.',
    url: 'https://www.rareember.shop/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
