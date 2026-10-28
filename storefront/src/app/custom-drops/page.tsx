import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CustomDropsClient } from './CustomDropsClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Custom Merch for Hackathons, College Fests & Startups | RareEmber',
  },
  description:
    'Custom merch design studio and factory-direct bulk merchandise for hackathons, college fests, creator brands, and startups. 240 GSM tees, 380 GSM hoodies, and desk mats.',
  alternates: {
    canonical: 'https://www.rareember.shop/custom-drops',
  },
};

export default function CustomDropsPage() {
  return (
    <Suspense
      fallback={
        <main className="page-top min-h-screen bg-[#0E0C0A] flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-[#FF4D24] animate-spin" />
            <p className="font-semibold text-neutral-400 text-xs">Loading Custom Merch Studio…</p>
          </div>
        </main>
      }
    >
      <CustomDropsClient />
    </Suspense>
  );
}
