'use client';

import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('@/components/ui/CartDrawer'), {
  ssr: false,
});

export default function ClientOverlays() {
  return (
    <>
      <CartDrawer />
    </>
  );
}
