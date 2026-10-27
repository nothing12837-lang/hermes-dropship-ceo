'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { formatPrice } from '@/lib/data/products';
import { useGeo } from '@/context/GeoContext';
import Link from 'next/link';

interface OrderItem {
  id: string;
  qty: number;
  title?: string;
}

interface OrderRecord {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  tracking_number?: string | null;
  items?: OrderItem[];
}

export function ProfileClient() {
  const { formatPrice: geoFormatPrice } = useGeo();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) router.push('/login');
        return;
      }

      if (mounted) setUser(session.user);

      try {
        const res = await fetch('/api/account/orders', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const json = await res.json();
        if (mounted) {
          setOrders(json.orders || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load profile orders:', err);
        if (mounted) {
          setOrders([]);
          setLoading(false);
        }
      }
    }
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [router]);

  const getStatusBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'paid') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: '💳 Paid & Processing',
      };
    }
    if (s === 'pending_cod') {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-200',
        label: '📦 COD Confirmed',
      };
    }
    if (s === 'shipped' || s === 'fulfilled' || s === 'in transit') {
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        label: '🚚 In Transit',
      };
    }
    if (s === 'delivered') {
      return {
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        label: '✨ Delivered',
      };
    }
    return {
      bg: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      label: '⏳ Processing',
    };
  };

  if (loading) {
    return (
      <main className="page-top min-h-screen bg-[#FFF9F1] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
          <p className="font-semibold text-neutral-600 text-sm">Loading your account...</p>
        </div>
      </main>
    );
  }

  const activeShipments = orders.filter((o) =>
    ['paid', 'pending_cod', 'shipped', 'fulfilled'].includes(o.status)
  ).length;

  return (
    <main className="page-top min-h-screen bg-[#FFF9F1] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Apple-grade Header Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1d1d1f] to-neutral-700 text-white flex items-center justify-center text-2xl font-black shadow-md">
                {(user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-neutral-950">
                    {user?.user_metadata?.full_name || 'My Account'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase tracking-wider">
                    Member
                  </span>
                </div>
                <p className="text-neutral-500 text-sm mt-0.5 font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="px-4 py-2.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors no-underline"
              >
                Browse Shop →
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#1d1d1f] text-white hover:bg-black transition-all cursor-pointer border-none shadow-xs"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-black/[0.05]">
            <div className="p-3.5 rounded-2xl bg-[#FFF9F1]/80 border border-black/[0.04]">
              <div className="text-xs font-medium text-neutral-500">Total Orders</div>
              <div className="text-xl font-black text-neutral-950 mt-1">{orders.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FFF9F1]/80 border border-black/[0.04]">
              <div className="text-xs font-medium text-neutral-500">Active Shipments</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{activeShipments}</div>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-neutral-950 tracking-tight">Order History</h2>
          <span className="text-xs font-semibold text-neutral-500">
            {orders.length} {orders.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-black/[0.06] shadow-xs">
            <div className="text-4xl mb-3">🛍️</div>
            <h3 className="text-base font-bold text-neutral-900">No orders placed yet</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Your future orders, live courier tracking, and delivery updates will appear here automatically.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-5 px-6 py-3 rounded-full bg-[#1d1d1f] text-white text-xs font-bold hover:bg-black transition-all no-underline shadow-xs"
            >
              Start Exploring Products →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-black/[0.06] shadow-xs hover:border-black/10 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/[0.05] gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-neutral-950">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center sm:text-right justify-between sm:justify-end gap-4">
                      <div>
                        <div className="text-xs text-neutral-500 font-medium">Order Total</div>
                        <div className="text-lg font-black text-neutral-950">
                          {geoFormatPrice(order.total_amount)}
                        </div>
                      </div>

                      <Link
                        href={`/track?orderId=${order.id}&email=${encodeURIComponent(user?.email || '')}`}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-[#FF4D24] text-white hover:bg-[#e03d15] transition-all no-underline shadow-xs shrink-0"
                      >
                        Track Live 📍
                      </Link>
                    </div>
                  </div>

                  {/* Order items preview */}
                  <div className="mt-4 pt-1">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      Items
                    </div>
                    <div className="grid gap-2">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#FFF9F1]/60 border border-black/[0.03]"
                        >
                          <span className="font-semibold text-neutral-800">
                            {item.title || `Item #${item.id.slice(0, 10)}`}
                          </span>
                          <span className="font-bold text-neutral-500">Qty: {item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
