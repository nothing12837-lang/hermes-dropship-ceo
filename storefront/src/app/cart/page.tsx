'use client';

import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { useGeo } from '@/context/GeoContext';
import { products } from '@/lib/data/products';
import { CURATED_PRODUCT_GALLERIES } from '@/lib/data/product-gallery';

export default function CartPage() {
  const { items, setQty, remove, count } = useCart();
  const { formatPrice, market } = useGeo();
  const isIndia = market === 'IN';

  const isUsdFloat = (p: number) => p > 0 && p < 60 && !Number.isInteger(p);

  const getItemPrice = (item: { price?: number; price_inr?: number }) => {
    if (isIndia) {
      if (item.price_inr != null && Number(item.price_inr) > 0) return Math.round(Number(item.price_inr));
      if (item.price != null && Number(item.price) > 0) {
        const p = Number(item.price);
        return isUsdFloat(p) ? Math.round(p * 85) : Math.round(p);
      }
      return 449;
    }
    if (item.price != null && Number(item.price) > 0) {
      const p = Number(item.price);
      return p >= 80 ? Number((p / 85).toFixed(2)) : p;
    }
    if (item.price_inr != null && Number(item.price_inr) > 0) {
      return Number((Number(item.price_inr) / 85).toFixed(2));
    }
    return 14.99;
  };

  const subtotal = items.reduce((acc, i) => acc + getItemPrice(i) * i.qty, 0);

  if (items.length === 0) {
    return (
      <main className="page-top" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffbf5', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛍️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1a1412', marginBottom: '0.6rem' }}>
            Your Cart is Empty
          </h1>
          <p style={{ color: '#665e57', lineHeight: 1.6, marginBottom: '1.8rem' }}>
            Discover trending domestic Indian factory-direct lifestyle, tech, and festive home decor drops with Cash on Delivery across all 19,000+ PIN codes.
          </p>
          <Link
            href="/shop"
            style={{
              display: 'inline-block',
              background: '#FF4D24',
              color: 'white',
              padding: '0.9rem 2rem',
              borderRadius: '9999px',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(255,77,36,0.3)'
            }}
          >
            Explore Trending Drops →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-top" style={{ minHeight: '90vh', background: '#fffbf5', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1412' }}>
            Shopping Cart ({count} {count === 1 ? 'item' : 'items'})
          </h1>
          <Link href="/shop" style={{ color: '#FF4D24', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            + Continue Shopping
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '1.4rem', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
            {items.map((item) => {
              const itemImage = (() => {
                if (item.imageUrl) return item.imageUrl;
                const found = products.find((p) => p.id === item.id || p.id === item.id.split('__')[0]);
                if (found && item.color && found.colors) {
                  const colorIdx = found.colors.findIndex((c) => c.toLowerCase() === item.color?.toLowerCase());
                  if (colorIdx >= 0) {
                    if (Array.isArray(found.images) && found.images[colorIdx]) return found.images[colorIdx];
                    if (CURATED_PRODUCT_GALLERIES[found.id]?.[colorIdx]) return CURATED_PRODUCT_GALLERIES[found.id][colorIdx];
                  }
                }
                return (item as any).image_url || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200';
              })();

              return (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #f4f0eb', paddingBottom: '1.2rem' }}>
                <img
                  src={itemImage}
                  alt={item.title || 'Cart product'}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.8rem', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1412', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  {(item.color || item.size) && (
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>
                      {item.color && (
                        <span style={{ background: '#f5f5f4', padding: '0.15rem 0.45rem', borderRadius: '0.35rem', border: '1px solid #e7e5e4', color: '#44403c' }}>
                          Color: {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span style={{ background: '#f5f5f4', padding: '0.15rem 0.45rem', borderRadius: '0.35rem', border: '1px solid #e7e5e4', color: '#44403c' }}>
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ color: '#FF4D24', fontWeight: 900, marginTop: '0.2rem' }}>
                    {formatPrice(item.price || 5.99, item.price_inr || 449)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #e5e0d8', borderRadius: '9999px', overflow: 'hidden' }}>
                      <button
                        onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
                        style={{ border: 'none', background: 'transparent', padding: '0.2rem 0.6rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, Math.min(99, item.qty + 1))}
                        style={{ border: 'none', background: 'transparent', padding: '0.2rem 0.6rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      style={{ border: 'none', background: 'transparent', color: '#998f86', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

          <div style={{ background: '#fdf9f4', padding: '1.5rem', borderTop: '1px solid #f4f0eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#665e57', fontWeight: 600 }}>Delivery:</span>
              <span style={{ color: '#10b981', fontWeight: 800 }}>FREE (Express Domestic)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1412' }}>Subtotal:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FF4D24' }}>
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <Link
                href="/checkout"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#FF4D24',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '9999px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(255,77,36,0.3)'
                }}
              >
                Proceed to Checkout (COD or UPI) →
              </Link>
              <div style={{ textAlign: 'center', color: '#887d73', fontSize: '0.78rem', fontWeight: 600 }}>
                🛡️ 7-Day Doorstep Replacement Guarantee • Cash on Delivery Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
