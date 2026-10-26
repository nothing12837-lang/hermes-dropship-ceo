import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Rare Ember — The Independent Streetwear Atelier',
  description: 'Learn about Rare Ember craftsmanship, 240 GSM bio-washed cotton, and our mission to create luxury streetwear in India.',
  alternates: {
    canonical: 'https://www.rareember.shop/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
