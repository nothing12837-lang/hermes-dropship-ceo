import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Catalog Drops | Rare Ember',
  description: 'Explore verified streetwear drops, hoodies, oversized tees, and apparel.',
};

export default function CustomDropsPage() {
  redirect('/shop');
}
