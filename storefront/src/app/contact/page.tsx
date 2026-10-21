import { Metadata } from 'next';
import SupportClient from '../support/SupportClient';

export const metadata: Metadata = {
  title: 'Contact Us & Priority Support — Rare Ember',
  description: 'Official customer care desk, 12-hour support tickets, instant phone callbacks, Instagram DM, and direct email contact for Rare Ember.',
};

export default function ContactPage() {
  return (
    <main className="page-top min-h-screen bg-[#FFF9F1] text-neutral-900 pb-20 px-4 sm:px-6 lg:px-8">
      <SupportClient />
    </main>
  );
}
