'use client';

import dynamic from 'next/dynamic';
import AuthHashSync from '@/components/ui/AuthHashSync';

const CartDrawer = dynamic(() => import('@/components/ui/CartDrawer'), {
  ssr: false,
});

export default function ClientOverlays() {
  return (
    <>
      <AuthHashSync />
      <CartDrawer />
    </>
  );
}
