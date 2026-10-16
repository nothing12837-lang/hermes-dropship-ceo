'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminOrder {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  cj_order_id: string | null;
  meesho_order_id?: string | null;
  meesho_url?: string | null;
  rto_risk_level?: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  shipping_address?: Record<string, string> | null;
}

const KEY_STORAGE = 'rareember_admin_vault_key';

export default function AdminOrdersPage() {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
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
      const params = new URLSearchParams({ limit: '50' });
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
    const saved = sessionStorage.getItem(KEY_STORAGE);
    if (saved) {
      setKey(saved);
      // Auto-unlock with saved key
      void (async () => {
        try {
          const res = await fetch('/api/admin/orders?limit=50', {
            headers: { Authorization: `Bearer ${saved}` }
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
  }, []);

  const handleUnlock = () => {
    if (!key.trim()) {
      setError('Please enter your secret vault key.');
      return;
    }
    sessionStorage.setItem(KEY_STORAGE, key.trim());
    void load();
  };

  const handleLock = () => {
    sessionStorage.removeItem(KEY_STORAGE);
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
        body: JSON.stringify({ orderId, status: newStatus, tracking_number: trackingNum })
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
    const tracking = window.prompt('Enter courier tracking number (Delhivery / BlueDart):');
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
            '⚠️ Warning: This order was identified as a test/temp order.\n\nDo you really want to force-send it to the Qikink factory floor? (This may initiate real manufacturing and courier dispatch).'
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setActionSuccess(`Copied ${label} to clipboard!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped' || o.status === 'delivered').length;

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
            <p className="text-sm text-slate-400 mt-2">
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
                <span>🔒</span> 256-Bit Cryptographic Timing-Safe Comparison Active
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. UNLOCKED EXECUTIVE DASHBOARD
  return (
    <main className="min-h-screen bg-[#0B0F19] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-3xl shadow-inner">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">RareEmber Command Center</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  LIVE 24x7
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Founder: <span className="text-white font-bold">Ajay Rajbhar</span> • Production Operations & Orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all"
            >
              View Live Store ↗
            </Link>
            <button
              onClick={handleLock}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔒</span> Lock Vault
            </button>
          </div>
        </div>

        {/* Real-Time Business KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Gross store volume</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
              {orders.length}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">All recorded transactions</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Dispatch</p>
            <h2 className="text-2xl sm:text-3xl font-black text-orange-400 mt-2 font-mono">
              {pendingOrders}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting courier pickup</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfilled</p>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">
              {shippedOrders}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Dispatched / Delivered</p>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center justify-between">
            <span>✅ {actionSuccess}</span>
            <button onClick={() => setActionSuccess('')} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#131B2E] border border-slate-800 rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: '', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'paid', label: 'Paid (COD/UPI)' },
              { id: 'processing', label: 'Processing' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#0B0F19] text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => void load()}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>↻</span>
            {loading ? 'Refreshing…' : 'Refresh Data'}
          </button>
        </div>

        {/* Orders Feed */}
        <div className="space-y-4">
          {orders.map((o) => {
            const addr = o.shipping_address;
            const fullAddr = addr
              ? `${addr.name || ''}, ${addr.street || addr.address || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.zip || addr.pincode || ''}`
              : 'Direct Online Checkout';
            const phone = addr?.phone || '';

            return (
              <div
                key={o.id}
                className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-orange-400">
                      #{o.id.slice(0, 8)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(o.id, 'Order ID')}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                      title="Copy full UUID"
                    >
                      Copy
                    </button>
                    <span className="text-xs text-slate-400">
                      {new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        o.status === 'delivered'
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
                      {o.status}
                    </span>
                    <span className="text-lg font-black text-white font-mono">
                      ₹{Number(o.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800/80">
                    <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Customer Contact</p>
                    <p className="text-white font-bold">{o.user_email || 'Guest Customer'}</p>
                    {phone && (
                      <p className="text-slate-300 font-mono">📱 +91 {phone}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800/80">
                    <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Shipping Destination</p>
                    <p className="text-slate-200">{fullAddr}</p>
                    {o.tracking_number && (
                      <p className="text-cyan-400 font-mono font-bold">
                        📍 Courier Tracking: {o.tracking_number}
                      </p>
                    )}
                    {o.cj_order_id && (
                      <p className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                        <span>⚡</span> Qikink Order ID: #{o.cj_order_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Operational Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Qikink Dispatch Action */}
                    <button
                      onClick={() => handleTriggerQikink(o.id)}
                      disabled={updatingId === o.id}
                      className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>🏭</span> {o.cj_order_id && /^\d+$/.test(o.cj_order_id) ? '⚡ Qikink Synced' : '🚀 Send to Qikink'}
                    </button>

                    {/* WhatsApp Action */}
                    {phone && (() => {
                      const digits = phone.replace(/\D/g, '');
                      const waNum = digits.length === 12 && digits.startsWith('91') ? digits : (digits.length === 10 ? `91${digits}` : digits);
                      return (
                        <a
                          href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                            `Namaste! RareEmber se aapka order #${o.id.slice(0, 8)} confirm ho gaya hai. Dispatch details jald hi share karenge!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <span>💬</span> WhatsApp Customer
                        </a>
                      );
                    })()}

                    {/* Copy Address */}
                    <button
                      onClick={() => copyToClipboard(fullAddr, 'Shipping Address')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      📋 Copy Shipping Label
                    </button>

                    {/* Delete Order Action */}
                    <button
                      onClick={() => void handleDeleteOrder(o.id)}
                      disabled={updatingId === o.id}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                      title="Permanently delete this order"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>

                  {/* Status Toggles */}
                  <div className="flex items-center gap-2">
                    {o.status !== 'shipped' && o.status !== 'delivered' && (
                      <button
                        onClick={() => handleMarkShipped(o.id)}
                        disabled={updatingId === o.id}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {updatingId === o.id ? 'Updating…' : '🚚 Mark as Shipped'}
                      </button>
                    )}

                    {o.status === 'shipped' && (
                      <button
                        onClick={() => void updateOrderStatus(o.id, 'delivered')}
                        disabled={updatingId === o.id}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {updatingId === o.id ? 'Updating…' : '✔ Mark Delivered'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {orders.length === 0 && !loading && (
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <span className="text-4xl">📦</span>
              <h3 className="text-lg font-bold text-white">No Orders Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No orders match your current filter. When a customer checks out, the live order card will appear here automatically!
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
