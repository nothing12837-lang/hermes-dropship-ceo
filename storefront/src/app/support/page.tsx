import { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Customer Support & Help Center — 12-Hour SLA Guarantee',
  description: 'Raise an official support ticket, request an instant callback, or contact Rare Ember founder operations. 12-hour reply guarantee for all orders & tracking inquiries.',
};

export default function SupportPage() {
  return (
    <main className="page-top min-h-screen bg-[#FFF9F1] text-neutral-900 pb-20 px-4 sm:px-6 lg:px-8">
      <SupportClient />
    </main>
  );
}
