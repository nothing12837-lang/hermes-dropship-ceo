import { Suspense } from 'react';
import { CustomDropsClient } from './CustomDropsClient';

export const metadata = {
  title: 'Custom Merch for Hackathons, College Fests & Startups | RareEmber™',
  description: 'Direct Tirupur manufacturing with zero setup fees. 240 GSM tees, 380 GSM hoodies & desk mats with 4-day delivery for college clubs & tech startups.',
};

export default function CustomDropsPage() {
  return (
    <Suspense
      fallback={
        <main className="page-top min-h-screen bg-[#FFFBF5] flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
            <p className="font-semibold text-neutral-600 text-xs">Loading B2B Merch Studio…</p>
          </div>
        </main>
      }
    >
      <CustomDropsClient />
    </Suspense>
  );
}
