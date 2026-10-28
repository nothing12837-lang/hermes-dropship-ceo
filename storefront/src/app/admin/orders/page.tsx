'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

interface AdminOrderItem {
  id?: string;
  product_id?: string;
  title?: string;
  name?: string;
  color?: string;
  size?: string;
  qty?: number;
  price?: number;
  price_inr?: number;
  imageUrl?: string;
  selectedStyle?: string;
}

interface AdminOrder {
  id: string;
  user_email: string;
  total_amount: number;
  subtotal?: number;
  shipping?: number;
  status: string;
  cj_order_id: string | null;
  meesho_order_id?: string | null;
  meesho_url?: string | null;
  rto_risk_level?: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  payment_method?: string | null;
  shipping_name?: string | null;
  shipping_address?: Record<string, any> | null;
  items?: AdminOrderItem[] | null;
  fulfillment_error?: string | null;
  created_at: string;
}

const KEY_STORAGE = 'rareember_admin_vault_key';

export default function AdminOrdersPage() {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'estimates' | 'support' | 'system'>('orders');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const headers = useCallback(
    (): HeadersInit => ({ Authorization: `Bearer ${key}` }),
    [key]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionSuccess('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { headers: headers() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate admin key');
      setOrders(data.orders ?? []);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed');
      if (String(err).includes('Unauthorized')) setUnlocked(false);
    } finally {
      setLoading(false);
    }
  }, [headers, statusFilter]);

  useEffect(() => {
    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlKey = params?.get('key')?.trim();
      const saved = urlKey || sessionStorage.getItem(KEY_STORAGE) || localStorage.getItem(KEY_STORAGE);
      if (saved) {
        setKey(saved);
        sessionStorage.setItem(KEY_STORAGE, saved);
        localStorage.setItem(KEY_STORAGE, saved);
        void (async () => {
          try {
            const res = await fetch('/api/admin/orders?limit=100', {
              headers: { Authorization: `Bearer ${saved}` },
            });
            if (res.ok) {
              const data = await res.json();
              setOrders(data.orders ?? []);
              setUnlocked(true);
            }
          } catch {
            // ignore
          }
        })();
      }
    } catch {}
  }, []);

  const handleUnlock = () => {
    if (!key.trim()) {
      setError('Please enter your secret master key.');
      return;
    }
    try {
      sessionStorage.setItem(KEY_STORAGE, key.trim());
      localStorage.setItem(KEY_STORAGE, key.trim());
    } catch {}
    void load();
  };

  const handleLock = () => {
    try {
      sessionStorage.removeItem(KEY_STORAGE);
      localStorage.removeItem(KEY_STORAGE);
    } catch {}
    setUnlocked(false);
    setKey('');
    setOrders([]);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNum?: string) => {
    setUpdatingId(orderId);
    setError('');
    setActionSuccess('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, tracking_number: trackingNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      setActionSuccess(`Order #${orderId.slice(0, 8)} updated to ${newStatus.toUpperCase()}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkShipped = (orderId: string) => {
    const tracking = window.prompt('Enter courier tracking number (Delhivery / BlueDart / Shadowfax):');
    if (tracking === null) return;
    void updateOrderStatus(orderId, 'shipped', tracking.trim() || undefined);
  };

  const handleTriggerQikink = async (orderId: string, force = false) => {
    setUpdatingId(orderId);
    setError('');
    setActionSuccess('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, force }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.reason && data.reason.includes('Test/temp order') && !force) {
          const reallyForce = window.confirm(
            '⚠️ Warning: This order was identified as a test order.\n\nDo you want to force-send it to the live Qikink factory floor? (This may initiate real manufacturing).'
          );
          if (reallyForce) {
            return void handleTriggerQikink(orderId, true);
          }
        }
        throw new Error(data.error || data.reason || 'Qikink dispatch failed');
      }
      setActionSuccess(`Order dispatched to Qikink floor! ID: #${data.qikinkOrderId || 'Success'}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dispatch failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReleaseStoreCredit = async (orderId: string, claimId?: string) => {
    setUpdatingId(orderId);
    setError('');
    setActionSuccess('');
    try {
      const res = await fetch('/api/admin/returns/approve', {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, claimId, action: 'release_credit' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to release store credit');
      }
      if (data.voucherCode && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(data.voucherCode).catch(() => {});
      }
      setActionSuccess(
        `✅ Activated & Emailed 110% Store Credit (${data.voucherCode || 'Code'}) for ₹${data.creditAmount}! (Copied to clipboard)`
      );
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve and release store credit');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Permanently delete order #${orderId.slice(0, 8)}? This cannot be undone.`)) {
      return;
    }
    setUpdatingId(orderId);
    setError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/admin/orders?orderId=${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setActionSuccess(`Order #${orderId.slice(0, 8)} deleted successfully.`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendInvoiceEmail = async (orderId: string) => {
    setUpdatingId(orderId);
    setError('');
    setActionSuccess('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'send_invoice' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch tax invoice');
      setActionSuccess(`✅ Official Tax Invoice & Delivery Receipt sent for Order #${orderId.slice(0, 8)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invoice email dispatch failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setActionSuccess(`Copied ${label} to clipboard!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // ── FINANCIAL & UNIT ECONOMICS CALCULATIONS ──
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const paidRevenue = orders
      .filter((o) => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const pendingCodRevenue = orders
      .filter((o) => o.status === 'pending_cod' || (o.status === 'pending' && o.payment_method === 'cod'))
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    // Calculate total items across all orders
    let totalItemsCount = 0;
    let estimatedFactoryCost = 0;

    orders.forEach((o) => {
      if (Array.isArray(o.items) && o.items.length > 0) {
        o.items.forEach((item) => {
          const qty = Number(item.qty || 1);
          totalItemsCount += qty;
          const t = (item.title || item.name || '').toLowerCase();
          // Unit base cost estimation:
          if (t.includes('hoodie')) {
            estimatedFactoryCost += 579 * qty;
          } else if (t.includes('jersey')) {
            estimatedFactoryCost += 349 * qty;
          } else if (t.includes('mat')) {
            estimatedFactoryCost += 299 * qty;
          } else if (t.includes('crop') || t.includes('dress')) {
            estimatedFactoryCost += 320 * qty;
          } else {
            estimatedFactoryCost += 279 * qty; // standard 240 GSM tee base landed cost
          }
        });
      } else {
        totalItemsCount += 1;
        estimatedFactoryCost += 280; // default estimated baseline
      }
    });

    const estimatedLogisticsCost = orders.length * 75; // average Air Express courier charge per parcel
    const netProjectedProfit = totalRevenue - estimatedFactoryCost - estimatedLogisticsCost;
    const netMarginPct = totalRevenue > 0 ? Math.round((netProjectedProfit / totalRevenue) * 100) : 48;

    // ── 30-DAY FORWARD ESTIMATES ──
    const activeOrdersCount = Math.max(orders.length, 1);
    // Average order value
    const aov = totalRevenue > 0 ? Math.round(totalRevenue / activeOrdersCount) : 659;
    // Projected 30-day velocity estimate (assuming min 3-5 orders/day initial momentum)
    const projectedDailyOrders = Math.max(orders.length > 3 ? orders.length / 3 : 3, 2);
    const projected30DayOrders = Math.round(projectedDailyOrders * 30);
    const projected30DayGMV = projected30DayOrders * aov;
    const projected30DayProfit = Math.round(projected30DayGMV * (netMarginPct / 100));

    // Recommended operating capital to keep in Qikink wallet
    const recommendedWalletBuffer = Math.round(projectedDailyOrders * 7 * 350); // 7 days of production buffer

    return {
      totalRevenue,
      paidRevenue,
      pendingCodRevenue,
      totalOrders: orders.length,
      totalItemsCount,
      estimatedFactoryCost,
      estimatedLogisticsCost,
      netProjectedProfit: Math.max(0, netProjectedProfit),
      netMarginPct: Math.max(25, netMarginPct),
      aov,
      projected30DayOrders,
      projected30DayGMV,
      projected30DayProfit,
      recommendedWalletBuffer,
    };
  }, [orders]);

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const email = (o.user_email || '').toLowerCase();
      const id = o.id.toLowerCase();
      const name = (o.shipping_name || o.shipping_address?.name || '').toLowerCase();
      const phone = String(o.shipping_address?.phone || '').toLowerCase();
      const city = String(o.shipping_address?.city || '').toLowerCase();
      const state = String(o.shipping_address?.state || '').toLowerCase();
      const pin = String(o.shipping_address?.zip || o.shipping_address?.pincode || '').toLowerCase();
      return (
        id.includes(q) ||
        email.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        city.includes(q) ||
        state.includes(q) ||
        pin.includes(q)
      );
    });
  }, [orders, searchQuery]);

  // 1. LOCKED VAULT LOGIN SCREEN
  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-md bg-[#131B2E] border border-orange-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-3xl mb-4 shadow-inner">
              🛡️
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              RareEmber <span className="text-orange-500">Command Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Restricted Founder Protocol • Authorized Access Only
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Master Vault Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="Enter Unhackable Master Key..."
                  className="w-full bg-[#0B0F19] border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-orange-400 px-2 py-1"
                >
                  {showKey ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-lg">↻</span> Verifying Security Vault...
                </>
              ) : (
                <>
                  <span>🔓</span> Unlock Command Center
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <span>🔒</span> Timing-Safe Cryptographic Protection Active
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. UNLOCKED EXECUTIVE DASHBOARD
  return (
    <main className="min-h-screen bg-[#0B0F19] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">RareEmber Command Center</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE OPS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Founder: <span className="text-white font-bold">Ajay Kumar</span> • Real-Time Order Stream & Future Projections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all no-underline flex items-center gap-1"
            >
              <span>📦</span> Products &amp; Drops
            </Link>
            <Link
              href="/admin/agent"
              className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-xs font-bold text-orange-300 transition-all no-underline flex items-center gap-1"
            >
              <span>🤖</span> AI Agent Desk ↗
            </Link>
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all no-underline"
            >
              Live Store ↗
            </Link>
            <Link
              href="/support"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all no-underline"
            >
              Help Desk ↗
            </Link>
            <button
              onClick={handleLock}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔒</span> Lock Vault
            </button>
          </div>
        </div>

        {/* Executive KPI Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 mt-1 font-mono">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Prepaid: <span className="text-emerald-400 font-bold">₹{metrics.paidRevenue.toLocaleString('en-IN')}</span> • COD: ₹{metrics.pendingCodRevenue.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projected Net Margin</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 mt-1 font-mono">
              ₹{metrics.netProjectedProfit.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-400">({metrics.netMarginPct}%)</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">Post-factory landed cost & air freight</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 font-mono">
              {orders.length}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">{metrics.totalItemsCount} units total volume</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">30-Day Forward GMV</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-400 mt-1 font-mono">
              ₹{metrics.projected30DayGMV.toLocaleString('en-IN')}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Est. Profit: <span className="text-emerald-400 font-bold">₹{metrics.projected30DayProfit.toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
            <span>✅ {actionSuccess}</span>
            <button onClick={() => setActionSuccess('')} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Primary Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#131B2E] text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              📦 Live Orders &amp; Fulfillment ({filteredOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('estimates')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'estimates'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#131B2E] text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              🔮 Future Estimates &amp; Unit Economics
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#131B2E] text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              🎫 Support Tickets &amp; 12h SLA
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className={loading ? 'animate-spin' : ''}>↻</span>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* ── TAB 1: ORDERS & FULFILLMENT STREAM ── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131B2E] border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: '', label: 'All' },
                  { id: 'paid', label: 'Paid (Prepaid)' },
                  { id: 'pending_cod', label: 'Pending COD' },
                  { id: 'processing', label: 'Processing' },
                  { id: 'shipped', label: 'Shipped' },
                  { id: 'delivered', label: 'Delivered' },
                  { id: 'return_requested', label: '🔄 Returns / Claims' },
                  { id: 'refunded', label: 'Refunded' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-[#0B0F19] text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, Phone, Name, City..."
                  className="w-full sm:w-64 bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
              {filteredOrders.map((o) => {
                const addr = o.shipping_address || {};
                const customerName = o.shipping_name || addr.name || 'Customer';
                const phone = String(addr.phone || '').replace(/\D/g, '');
                const formattedPhone = phone.slice(-10);
                const flat = addr.flat || addr.flatHouse || '';
                const street = addr.street || addr.areaStreet || addr.address || addr.line1 || '';
                const landmark = addr.landmark || '';
                const city = addr.city || '';
                const state = addr.state || '';
                const zip = addr.zip || addr.pincode || '';
                const addressType = addr.address_type || addr.addressType || 'Home';
                const isCod = o.payment_method === 'cod';

                const fullDeliveryAddress = [
                  flat,
                  street,
                  landmark ? `(Landmark: ${landmark})` : '',
                  city,
                  `${state} - ${zip}`,
                ].filter(Boolean).join(', ');

                const fullCourierLabel = `Name: ${customerName}\nPhone: +91 ${formattedPhone}\nAddress: ${flat ? `${flat}, ` : ''}${street}\n${landmark ? `Landmark: ${landmark}\n` : ''}City: ${city}\nState: ${state} - ${zip}\nPayment: ${isCod ? `Cash on Delivery (₹${o.total_amount})` : 'PREPAID'}`;

                return (
                  <div
                    key={o.id}
                    className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs sm:text-sm font-black text-orange-400">
                          #{o.id.slice(0, 8)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(o.id, 'Full Order UUID')}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        >
                          Copy UUID
                        </button>
                        <span className="text-[11px] text-slate-400">
                          {new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </span>

                        {isCod ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 border border-amber-500/30 text-amber-300">
                            💵 CASH ON DELIVERY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                            ⚡ PREPAID (ONLINE/UPI)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            o.status === 'return_requested'
                              ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 animate-pulse'
                              : o.status === 'refunded'
                              ? 'bg-neutral-500/20 border border-neutral-500/40 text-neutral-300'
                              : o.status === 'returned'
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                              : o.status === 'delivered'
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : o.status === 'shipped'
                              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                              : o.status === 'processing'
                              ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                              : o.status === 'paid'
                              ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {o.status === 'return_requested' ? '🔄 Return Requested' : o.status}
                        </span>
                        <span className="text-lg font-black text-white font-mono">
                          ₹{Number(o.total_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Return / Replacement Claim Callout Box */}
                    {(o.status === 'return_requested' || (o.fulfillment_error && o.fulfillment_error.includes('RETURN_CLAIM'))) && (
                      <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-rose-300 font-black text-xs uppercase tracking-wider">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                            ⚠️ 7-Day Return / Replacement Claim Active
                          </div>
                          {formattedPhone && (
                            <a
                              href={`https://wa.me/91${formattedPhone}?text=${encodeURIComponent(`Namaste ${customerName}! Rare Ember team regarding your replacement claim for Order #${o.id}. We are ready to assist you.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold no-underline inline-flex items-center gap-1"
                            >
                              💬 WhatsApp Customer Directly
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-rose-200/90 font-mono bg-black/40 p-2.5 rounded-lg border border-rose-500/20 whitespace-pre-wrap">
                          {o.fulfillment_error || 'Customer filed a 7-day return request via /returns.'}
                        </p>
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <button
                            onClick={() => void handleTriggerQikink(o.id, true)}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            🚀 Approve &amp; Re-dispatch via Qikink
                          </button>
                          <a
                            href="https://dashboard.qikink.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all no-underline inline-flex items-center gap-1"
                          >
                            🏭 Claim Free Qikink Defect Reprint ↗
                          </a>
                          <button
                            onClick={() => void handleReleaseStoreCredit(o.id)}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer border border-emerald-400/40 disabled:opacity-50"
                          >
                            💳 Approve &amp; Release 110% Store Credit
                          </button>
                          <button
                            onClick={() => void updateOrderStatus(o.id, 'refunded')}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer border border-slate-700 disabled:opacity-50"
                          >
                            💸 Mark as Refunded
                          </button>
                          <button
                            onClick={() => void updateOrderStatus(o.id, 'returned')}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700 disabled:opacity-50"
                          >
                            ✅ Mark Closed / Returned
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Customer & Address Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                      {/* Customer Contact */}
                      <div className="space-y-2 bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            Customer Details
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                            📍 {addressType}
                          </span>
                        </div>
                        <p className="text-sm font-black text-white">{customerName}</p>
                        <p className="text-slate-300 flex items-center gap-1.5">
                          <span>✉️</span> {o.user_email || 'No email provided'}
                        </p>
                        {formattedPhone && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-slate-200 font-mono font-bold">
                              📱 +91 {formattedPhone}
                            </span>
                            <a
                              href={`tel:+91${formattedPhone}`}
                              className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-[10px] font-bold no-underline"
                            >
                              📞 Call
                            </a>
                            <a
                              href={`https://wa.me/91${formattedPhone}?text=${encodeURIComponent(
                                `Namaste ${customerName}! Rare Ember se aapka order #${o.id.slice(0, 8)} confirm ho gaya hai. Dispatch updates jald share karenge.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold no-underline"
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Shipping Address */}
                      <div className="space-y-2 bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            Delivery Destination
                          </p>
                          <button
                            onClick={() => copyToClipboard(fullCourierLabel, 'Courier Label')}
                            className="text-[10px] font-bold text-orange-400 hover:underline cursor-pointer"
                          >
                            📋 Copy Full Label
                          </button>
                        </div>
                        <p className="text-slate-200 leading-relaxed">
                          {fullDeliveryAddress || 'Address in checkout notes'}
                        </p>
                        {landmark && (
                          <p className="text-[11px] text-amber-300">
                            <strong>Landmark:</strong> {landmark}
                          </p>
                        )}
                        {o.tracking_number && (
                          <div className="pt-1 flex items-center gap-2">
                            <span className="text-cyan-400 font-mono font-bold text-xs">
                              🚚 AWB: {o.tracking_number}
                            </span>
                            {o.tracking_url && (
                              <a
                                href={o.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-cyan-300 underline font-bold"
                              >
                                Live Tracker ↗
                              </a>
                            )}
                          </div>
                        )}
                        {o.cj_order_id && (
                          <p className="text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
                            <span>🏭</span> Qikink Order: #{o.cj_order_id}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ordered Items Breakdown */}
                    {Array.isArray(o.items) && o.items.length > 0 && (
                      <div className="space-y-2 bg-[#0B0F19]/60 p-3.5 rounded-xl border border-slate-800/80">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Ordered Items ({o.items.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {o.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-[#131B2E] p-2.5 rounded-xl border border-slate-800"
                            >
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title || 'Product'}
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">
                                  {item.title || item.name || 'Drop Item'}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                                  {item.color && (
                                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                                      {item.color}
                                    </span>
                                  )}
                                  {item.size && (
                                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                                      {item.size}
                                    </span>
                                  )}
                                  <span className="font-bold text-amber-400">Qty: {item.qty || 1}</span>
                                </div>
                                <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                                  ₹{Number(item.price_inr || item.price || 0).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Operational Quick Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Qikink Dispatch */}
                        <button
                          onClick={() => handleTriggerQikink(o.id)}
                          disabled={updatingId === o.id}
                          className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <span>🏭</span>{' '}
                          {o.cj_order_id && /^\d+$/.test(o.cj_order_id)
                            ? '⚡ Dispatched to Factory'
                            : '🚀 Dispatch to Qikink Floor'}
                        </button>

                        {/* Add / Update Tracking Number */}
                        <button
                          onClick={() => handleMarkShipped(o.id)}
                          disabled={updatingId === o.id}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <span>🚚</span> {o.tracking_number ? 'Update Tracking' : 'Enter Courier AWB'}
                        </button>

                        {/* Delete Order */}
                        <button
                          onClick={() => void handleDeleteOrder(o.id)}
                          disabled={updatingId === o.id}
                          className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <span>🗑️</span> Delete
                        </button>
                      </div>

                      {/* Status Transition Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Send / Resend Official Tax Invoice Email */}
                        <button
                          onClick={() => void handleSendInvoiceEmail(o.id)}
                          disabled={updatingId === o.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          title="Send or resend the official Tax Invoice & Delivery Receipt to customer email"
                        >
                          <span>📄</span> Email Invoice
                        </button>

                        {/* View / Print Official Tax Invoice */}
                        <a
                          href={`/invoice?orderId=${o.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Open official Section 31 GST Tax Invoice generator in a new tab"
                        >
                          <span>🖨️</span> Print Invoice
                        </a>

                        {o.status !== 'shipped' && o.status !== 'delivered' && (
                          <button
                            onClick={() => void updateOrderStatus(o.id, 'shipped')}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {o.status === 'processing' && (
                          <button
                            onClick={() => void updateOrderStatus(o.id, 'delivered')}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                            title="Mark directly delivered and email Tax Invoice"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {o.status === 'shipped' && (
                          <button
                            onClick={() => void updateOrderStatus(o.id, 'delivered')}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                            title="Mark delivered and automatically email official Tax Invoice"
                          >
                            Mark Delivered &amp; Send Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredOrders.length === 0 && !loading && (
                <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <span className="text-4xl">📦</span>
                  <h3 className="text-lg font-bold text-white">No Orders Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No orders match your search keyword. Clear the search bar to view all records.'
                      : 'No orders in this status view yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: FUTURE ESTIMATES & FINANCIAL INTELLIGENCE ── */}
        {activeTab === 'estimates' && (
          <div className="space-y-6">
            {/* 30-Day Forward Forecast Deck */}
            <div className="bg-[#131B2E] border border-orange-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider mb-2">
                  <span>🔮</span> 30-Day Forward Revenue &amp; Growth Runway
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Financial Projections &amp; Operating Run-Rate
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Dynamic mathematical projection based on your live order velocity, average order value (AOV: ₹{metrics.aov}), and Qikink print-on-demand landed economics.
                </p>
              </div>

              {/* Forecast Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Projected 30-Day GMV
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    ₹{metrics.projected30DayGMV.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Est. ~{metrics.projected30DayOrders} orders @ ₹{metrics.aov}/order
                  </p>
                </div>

                <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Projected Net Profit
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    ₹{metrics.projected30DayProfit.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Net profit margin: <strong className="text-emerald-400 font-bold">{metrics.netMarginPct}%</strong>
                  </p>
                </div>

                <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Wallet Buffer
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                    ₹{metrics.recommendedWalletBuffer.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Maintain in Qikink wallet to prevent auto-fulfillment pauses
                  </p>
                </div>
              </div>

              {/* Strategic Milestone Deck */}
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Strategic Milestone: 10 Successful Orders
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {orders.filter((o) => o.status === 'confirmed' || o.status === 'processing' || o.status === 'delivered').length} / 10 Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Pack of 2 &amp; Pack of 3 Value Bundles are strategically paused. Once RareEmber crosses 10 successful verified orders, the bundle engine and multi-item discount combinations will automatically be listed on the storefront.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-mono font-bold text-slate-400 block">Next Unlock:</span>
                  <span className="text-xs font-black text-amber-400">⚡ Pack of 2 &amp; 3 Bundles</span>
                </div>
              </div>

              {/* Unit Economics Breakdown Table */}
              <div className="bg-[#0B0F19] p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Unit Economics Breakdown (Per Typical Apparel Drop)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-slate-800">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Avg Customer Price</p>
                    <p className="text-lg font-black text-white mt-1">₹659</p>
                    <p className="text-[10px] text-slate-400">Direct-to-consumer</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-slate-800">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Factory Landed Cost</p>
                    <p className="text-lg font-black text-rose-400 mt-1">-₹279</p>
                    <p className="text-[10px] text-slate-400">Blank + DTF printing</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-slate-800">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Courier &amp; Packaging</p>
                    <p className="text-lg font-black text-rose-400 mt-1">-₹75</p>
                    <p className="text-[10px] text-slate-400">Air Express Pan-India</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-emerald-500/30">
                    <p className="text-emerald-400 text-[10px] uppercase font-bold">Net Profit / Unit</p>
                    <p className="text-lg font-black text-emerald-400 mt-1">+₹305</p>
                    <p className="text-[10px] text-emerald-300 font-bold">46.3% Net Margin</p>
                  </div>
                </div>
              </div>

              {/* Courier Delivery Turnaround Expectations */}
              <div className="bg-[#0B0F19] p-6 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Logistics &amp; Delivery Turnaround Expectations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-slate-800">
                    <p className="font-bold text-white">🏙️ Tier 1 Metros</p>
                    <p className="text-emerald-400 font-bold text-sm mt-0.5">2 – 3 Days</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Bengaluru, Mumbai, Delhi-NCR, Chennai, Hyderabad</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-slate-800">
                    <p className="font-bold text-white">🌆 Tier 2 Hubs</p>
                    <p className="text-cyan-400 font-bold text-sm mt-0.5">3 – 4 Days</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Pune, Ahmedabad, Jaipur, Varanasi, Lucknow, Kolkata</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-slate-800">
                    <p className="font-bold text-white">🏞️ Rest of India</p>
                    <p className="text-amber-400 font-bold text-sm mt-0.5">4 – 6 Days</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Northeast, J&amp;K, Remote &amp; Rural PINs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CUSTOMER CARE & SUPPORT TICKETS ── */}
        {activeTab === 'support' && (
          <div className="bg-[#131B2E] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
                  <span>⏱️</span> 12-Hour SLA Active
                </div>
                <h2 className="text-2xl font-black text-white">
                  Support Tickets &amp; Customer Callback Requests
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customer tickets submitted on <Link href="/support" target="_blank" className="text-orange-400 underline font-bold">/support</Link> are instantly dispatched to your Telegram bot.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black no-underline"
                >
                  Open Telegram Bot ↗
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-2xl block">💬</span>
                <h3 className="text-sm font-black text-white">Live Telegram Alerts</h3>
                <p className="text-slate-400 leading-relaxed">
                  Every time a customer submits a ticket or requests a callback, your Telegram Bot (<strong>@rareember</strong>) sends you an immediate push notification with:
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>Unique Ticket ID (e.g. #RE-TKT-829104)</li>
                  <li>Customer Name, Phone &amp; Email</li>
                  <li>1-Click Direct Call &amp; 1-Click WhatsApp link</li>
                  <li>Issue summary &amp; description</li>
                </ul>
              </div>

              <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-2xl block">⏱️</span>
                <h3 className="text-sm font-black text-white">12-Hour Founder SLA Guarantee</h3>
                <p className="text-slate-400 leading-relaxed">
                  Rare Ember promises customers a guaranteed response within 12 hours. Resolving tickets promptly ensures:
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>Zero chargebacks or disputed payments on Razorpay</li>
                  <li>Higher repeat purchase rate and 5-star customer reviews</li>
                  <li>Instant resolution for size exchanges and address corrections</li>
                </ul>
              </div>
            </div>

            {/* Active Return / Replacement Claims Section */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>🔄</span> Active 7-Day Return / Replacement Requests
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filed by customers on <Link href="/returns" target="_blank" className="text-orange-400 underline font-bold">/returns</Link>.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  {orders.filter((o) => o.status === 'return_requested' || (o.fulfillment_error && o.fulfillment_error.includes('RETURN_CLAIM'))).length} Pending Claims
                </span>
              </div>

              {orders.filter((o) => o.status === 'return_requested' || (o.fulfillment_error && o.fulfillment_error.includes('RETURN_CLAIM'))).length === 0 ? (
                <div className="bg-[#0B0F19] p-8 rounded-2xl border border-slate-800 text-center space-y-2">
                  <span className="text-3xl block">✨</span>
                  <p className="text-sm font-bold text-white">Zero Pending Return Claims</p>
                  <p className="text-xs text-slate-400">All customer orders are in good standing with zero open disputes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders
                    .filter((o) => o.status === 'return_requested' || (o.fulfillment_error && o.fulfillment_error.includes('RETURN_CLAIM')))
                    .map((claimOrder) => {
                      const addr = claimOrder.shipping_address || {};
                      const custName = claimOrder.shipping_name || addr.name || 'Customer';
                      const phone = String(addr.phone || '').replace(/\D/g, '').slice(-10);
                      return (
                        <div key={claimOrder.id} className="bg-[#0B0F19] p-4 sm:p-5 rounded-2xl border border-rose-500/30 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-orange-400">#{claimOrder.id.slice(0, 8)}</span>
                              <span className="text-xs font-bold text-white">{custName}</span>
                              <span className="text-[11px] text-slate-400 font-mono">₹{claimOrder.total_amount}</span>
                            </div>
                            {phone && (
                              <a
                                href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Namaste ${custName}! Rare Ember team regarding your return/replacement claim for Order #${claimOrder.id}. We are ready to assist you.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold no-underline inline-flex items-center gap-1"
                              >
                                💬 WhatsApp Customer
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-rose-200 font-mono bg-black/40 p-3 rounded-xl border border-rose-500/20 whitespace-pre-wrap">
                            {claimOrder.fulfillment_error || 'Return claim filed.'}
                          </div>
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <button
                              onClick={() => void handleTriggerQikink(claimOrder.id, true)}
                              disabled={updatingId === claimOrder.id}
                              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              🚀 Approve &amp; Re-dispatch Replacement via Qikink
                            </button>
                            <a
                              href="https://dashboard.qikink.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all no-underline inline-flex items-center gap-1"
                            >
                              🏭 Claim Free Qikink Defect Reprint ↗
                            </a>
                            <button
                              onClick={() => void handleReleaseStoreCredit(claimOrder.id)}
                              disabled={updatingId === claimOrder.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer border border-emerald-400/40 disabled:opacity-50"
                            >
                              💳 Approve &amp; Release 110% Store Credit
                            </button>
                            <button
                              onClick={() => void updateOrderStatus(claimOrder.id, 'refunded')}
                              disabled={updatingId === claimOrder.id}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer border border-slate-700 disabled:opacity-50"
                            >
                              💸 Mark as Refunded
                            </button>
                            <button
                              onClick={() => void updateOrderStatus(claimOrder.id, 'returned')}
                              disabled={updatingId === claimOrder.id}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700 disabled:opacity-50"
                            >
                              ✅ Mark Resolved / Closed
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
