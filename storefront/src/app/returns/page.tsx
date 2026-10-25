import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReturnsClient } from './ReturnsClient';

export const metadata: Metadata = {
  title: '7-Day Easy Replacement & Return Policy',
  description: 'Our 100% free doorstep replacement guarantee. Hassle-free resolution for sizing mismatches, print defects, or courier damage.',
};

export default function ReturnsPage() {
  return (
    <main className="page-top min-h-screen bg-[#FFF9F1] pb-24">
      <Suspense fallback={<div className="text-center py-24 text-neutral-400 text-xs">Loading replacement portal…</div>}>
        <ReturnsClient />
      </Suspense>
    </main>
  );
}
