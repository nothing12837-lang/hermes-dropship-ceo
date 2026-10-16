'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ChapterHeading } from '@/components/ui/Story';
import { formatPrice, computeDiscount, products, type Product } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { useWishlist } from '@/lib/store/wishlist';
import { supabase, type ProductRow } from '@/lib/supabase';

function toCard(p: Product) {
  return {
    id: p.id,
    emoji: p.emoji,
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
    emoji: p.emoji || '🛍️',
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
    <main className="page-top min-h-screen bg-bg-base">
      <div style={{ maxWidth: '76rem', margin: '0 auto', padding: '2rem' }}>
        <ChapterHeading index="♡" label="Wishlist" title="Saved for" accent="later." />
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1.5rem', border: '1px solid #ebebeb' }}>
            <div style={{ fontSize: '3rem', color: '#FF4D24' }}>♡</div>
            <p style={{ fontWeight: 800, marginTop: '1rem' }}>Nothing saved yet.</p>
            <p style={{ color: '#8a7b6b' }}>Tap the ♡ on any product to keep it here.</p>
            <Link href="/shop" style={{ display: 'inline-block', marginTop: '1.5rem', background: '#FF4D24', color: 'white', padding: '0.9rem 2rem', borderRadius: '9999px', fontWeight: 800, textDecoration: 'none' }}>
              Explore drops →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {list.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
