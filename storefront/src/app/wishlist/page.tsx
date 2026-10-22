'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { formatPrice, computeDiscount, products, type Product } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { useWishlist } from '@/lib/store/wishlist';
import { supabase, type ProductRow } from '@/lib/supabase';

function toCard(p: Product) {
  return {
    id: p.id,
    tag: p.tag,
    tagColor: p.tagColor,
    tagBg: p.tagBg,
    title: p.title,
    desc: p.short,
    price: formatPrice(p.price_inr || p.price),
    oldPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
    rawPrice: p.price_inr || p.price,
    gradient: p.gradient || 'linear-gradient(135deg, #18181b, #09090b)',
    imageUrl: p.image_url,
    chapter: p.chapter || undefined,
    pet: undefined,
    rating: p.rating,
    reviews: p.reviews,
    discount: computeDiscount(p.price, p.compareAtPrice, p.price_inr),
  };
}

function rowToCard(p: ProductRow) {
  const price = (p as any).price_inr != null ? Number((p as any).price_inr) : Number(p.price);
  const compare = p.compare_at_price != null ? Number(p.compare_at_price) : undefined;
  return {
    id: p.id,
    tag: p.tag || 'Saved',
    tagColor: p.tag_color || '#FFFFFF',
    tagBg: p.tag_bg || '#FF4D24',
    title: p.title,
    desc: p.short || p.description || '',
    price: formatPrice(price),
    oldPrice: compare ? formatPrice(compare) : undefined,
    rawPrice: price,
    rawComparePrice: compare,
    gradient: p.gradient || 'linear-gradient(135deg, #FFF3E4, #FFE8D6)',
    imageUrl: resolveProductImage(p.id, p.image_url),
    chapter: p.chapter || undefined,
    pet: undefined,
    rating: Number(p.rating ?? 4.3),
    reviews: Number(p.reviews ?? 120),
    discount: computeDiscount(Number(p.price), compare, (p as any).price_inr ? Number((p as any).price_inr) : undefined),
  };
}

export default function WishlistPage() {
  const { wishes } = useWishlist();
  const [dbCards, setDbCards] = useState<ReturnType<typeof rowToCard>[]>([]);

  const localList = products.filter((p) => wishes.includes(p.id));
  const localIds = new Set(localList.map((p) => p.id));
  const missingIds = wishes.filter((id) => !localIds.has(id));

  useEffect(() => {
    let cancelled = false;
    if (missingIds.length === 0) {
      setDbCards([]);
      return;
    }
    supabase
      .from('products')
      .select('*')
      .in('id', missingIds)
      .eq('active', true)
      .then(({ data }) => {
        if (!cancelled) setDbCards(((data ?? []) as ProductRow[]).map(rowToCard));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishes.join(',')]);

  const list = [...localList.map(toCard), ...dbCards];

  return (
    <main className="page-top min-h-screen bg-[#FBF8F3] text-[#12100E] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF4D24] block mb-2">
            Personal Archive
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#12100E]">
            Saved Garments & Drops
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Pieces bookmarked for your upcoming orders.
          </p>
        </div>

        {list.length === 0 ? (
          <div className="bg-white border border-black/[0.08] p-12 text-center max-w-lg mx-auto">
            <h2 className="font-bold text-lg text-[#12100E] mb-2">Your saved archive is empty</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Browse the catalog and tap the bookmark icon on any piece to save it here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF4D24] hover:bg-[#e03d15] text-white font-bold text-xs uppercase tracking-wider no-underline transition-colors"
            >
              <span>Explore Collection</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {list.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
