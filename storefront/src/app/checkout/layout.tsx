import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | Rare Ember',
  description: 'Complete your luxury streetwear order with UPI, Cards, or Cash on Delivery.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
