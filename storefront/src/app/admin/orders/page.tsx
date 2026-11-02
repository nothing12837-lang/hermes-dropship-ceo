'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { products as catalogProducts } from '@/lib/data/products';

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
  image?: string;
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

interface AdminTicket {
  id: string;
  name: string;
  phone: string;
  email: string;
  order_id?: string | null;
  category: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
}

const KEY_STORAGE = 'rareember_admin_vault_key';

// Helper to resolve real product titles, images, and prices even if test orders stored minimal data
function resolveItemDetails(item: AdminOrderItem, totalAmount: number = 0) {
  const cleanId = String(item.product_id || item.id || '').trim();
  const matched = catalogProducts.find(
    (p) => p.id === cleanId || p.slug === cleanId || (p as any).qikinkClientProductId === cleanId
  );

  const title =
    item.title && item.title !== 'Drop Item' && item.title !== 'Product'
      ? item.title
      : item.name && item.name !== 'Drop Item'
      ? item.name
      : matched?.title || 'Rare Ember Architectural Drop';

  const imageUrl =
    item.imageUrl ||
    item.image ||
    matched?.image_url ||
    matched?.images?.[0] ||
    '';

  const rawPrice = Number(item.price_inr || item.price || 0);
  const price = rawPrice > 0 ? rawPrice : matched?.price_inr || matched?.price || totalAmount || 0;

  return {
    title,
    imageUrl,
    price,
    color: item.color || 'Black',
    size: item.size || 'L',
    qty: Number(item.qty || 1),
    fabric: matched?.tag || matched?.badge || 'Heavyweight Combed Cotton',
  };
}

export default function AdminCommandCenter() {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [, setLeads] = useState<any[]>([]);

  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'customers' | 'drops' | 'website'>('orders');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'callbacks'>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // Operations state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [syncCountdown, setSyncCountdown] = useState<number>(15);

  // Inline AWB Editing State
  const [editingAwbOrderId, setEditingAwbOrderId] = useState<string | null>(null);
  const [awbInputValue, setAwbInputValue] = useState<string>('');

  const headers = useCallback(
    (): HeadersInit => ({ Authorization: `Bearer ${key}` }),
    [key]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);

      const [ordersRes, supportRes] = await Promise.all([
        fetch(`/api/admin/orders?${params.toString()}`, { headers: headers() }),
        fetch('/api/admin/support', { headers: headers() }),
      ]);

      const ordersData = await ordersRes.json();
      if (!ordersRes.ok) throw new Error(ordersData.error || 'Failed to authenticate admin key');
      setOrders(ordersData.orders ?? []);

      if (supportRes.ok) {
        const supportData = await supportRes.json();
        setTickets(supportData.tickets ?? []);
        setLeads(supportData.leads ?? []);
      }

      setUnlocked(true);
      setLastRefreshedAt(new Date());
      setSyncCountdown(15);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed');
      if (String(err).includes('Unauthorized')) setUnlocked(false);
    } finally {
      setLoading(false);
    }
  }, [headers, statusFilter]);

  // Initial load from storage / query param
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
            const [ordersRes, supportRes] = await Promise.all([
              fetch('/api/admin/orders?limit=100', { headers: { Authorization: `Bearer ${saved}` } }),
              fetch('/api/admin/support', { headers: { Authorization: `Bearer ${saved}` } }),
            ]);
            if (ordersRes.ok) {
              const oData = await ordersRes.json();
              setOrders(oData.orders ?? []);
              setUnlocked(true);
              setLastRefreshedAt(new Date());
            }
            if (supportRes.ok) {
              const sData = await supportRes.json();
              setTickets(sData.tickets ?? []);
              setLeads(sData.leads ?? []);
            }
          } catch {}
        })();
      }
    } catch {}
  }, []);

  // Live auto-refresh polling countdown every second
  useEffect(() => {
    if (!unlocked || !autoRefresh) return;
    const interval = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          void load();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [unlocked, autoRefresh, load]);

  const handleUnlock = () => {
    if (!key.trim()) {
      setError('Please enter your secret master key.');
      return;
    }
    sessionStorage.setItem(KEY_STORAGE, key.trim());
    localStorage.setItem(KEY_STORAGE, key.trim());
    void load();
  };

  const handleLock = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    localStorage.removeItem(KEY_STORAGE);
    setKey('');
    setUnlocked(false);
    setOrders([]);
    setTickets([]);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setActionSuccess(`Copied ${label} to clipboard!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // ── ORDER ACTIONS ──
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setError('');
    setActionSuccess('');
    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setActionSuccess(`Order #${orderId.slice(0, 8)} status set to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      setError(err?.message || 'Update failed');
      // Rollback on error
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveAwb = async (orderId: string, trackingNumber: string) => {
    const cleanTn = trackingNumber.trim();
    if (!cleanTn) {
      setError('Please enter a valid tracking number / AWB.');
      return;
    }
    setUpdatingId(orderId);
    setError('');
    setActionSuccess('');

    const trackingUrl = `https://www.delhivery.com/track/package/${cleanTn}`;
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, tracking_number: cleanTn, tracking_url: trackingUrl, status: 'shipped' }
          : o
      )
    );
    setEditingAwbOrderId(null);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          tracking_number: cleanTn,
          tracking_url: trackingUrl,
          status: 'shipped',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update AWB tracking');
      setActionSuccess(`AWB ${cleanTn} assigned & Order marked as SHIPPED!`);
    } catch (err: any) {
      setError(err?.message || 'AWB update failed');
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTriggerQikink = async (orderId: string) => {
    setUpdatingId(orderId);
    setError('');
    setActionSuccess('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'fulfill_qikink' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.reason || data.error || 'Qikink dispatch failed');
      setActionSuccess(`Order #${orderId.slice(0, 8)} dispatched to Qikink (Ref: ${data.qikinkOrderId || 'QUEUED'})`);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Qikink fulfillment error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Permanently delete order #${orderId.slice(0, 8)}? This cannot be undone.`)) return;
    setUpdatingId(orderId);
    setError('');
    // Optimistic removal
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      const res = await fetch(`/api/admin/orders?orderId=${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setActionSuccess(`Order #${orderId.slice(0, 8)} deleted successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendInvoiceEmail = async (orderId: string) => {
    setUpdatingId(orderId);
    setError('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'send_invoice' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch tax invoice');
      setActionSuccess(`Official Tax Invoice PDF & receipt dispatched for Order #${orderId.slice(0, 8)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invoice email dispatch failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── SUPPORT TICKET ACTIONS ──
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId);
    setError('');
    setActionSuccess('');
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ticket', id: ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update ticket');
      setActionSuccess(`Ticket #${ticketId} status updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      setError(err?.message || 'Update failed');
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm(`Delete ticket #${ticketId}?`)) return;
    setUpdatingId(ticketId);
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    try {
      const res = await fetch(`/api/admin/support?id=${encodeURIComponent(ticketId)}&type=ticket`, {
        method: 'DELETE',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setActionSuccess(`Ticket #${ticketId} deleted.`);
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  // ── CRM & CUSTOMER DIRECTORY CALCULATION ──
  const customers = useMemo(() => {
    const map = new Map<string, {
      name: string;
      email: string;
      phone: string;
      orderCount: number;
      totalSpend: number;
      orders: AdminOrder[];
      address: Record<string, any>;
      latestOrderDate: string;
      preferredPayment: string;
    }>();

    orders.forEach((o) => {
      const email = (o.user_email || '').toLowerCase().trim();
      const addr = o.shipping_address || {};
      const phone = String(addr.phone || '').replace(/\D/g, '').slice(-10);
      const key = email || phone || o.id;

      const existing = map.get(key);
      const orderAmount = Number(o.total_amount) || 0;

      if (!existing) {
        map.set(key, {
          name: o.shipping_name || addr.name || 'Customer',
          email: o.user_email || 'Not provided',
          phone,
          orderCount: 1,
          totalSpend: orderAmount,
          orders: [o],
          address: addr,
          latestOrderDate: o.created_at,
          preferredPayment: o.payment_method || 'prepaid',
        });
      } else {
        existing.orderCount += 1;
        existing.totalSpend += orderAmount;
        existing.orders.push(o);
        if (!existing.phone && phone) existing.phone = phone;
        if (new Date(o.created_at) > new Date(existing.latestOrderDate)) {
          existing.latestOrderDate = o.created_at;
          existing.address = addr;
          existing.name = o.shipping_name || addr.name || existing.name;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders]);

  // ── FINANCIAL METRICS ──
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const paidRevenue = orders
      .filter((o) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const pendingCodRevenue = orders
      .filter((o) => o.status === 'pending_cod' || (o.status === 'pending' && o.payment_method === 'cod'))
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    let totalItems = 0;
    orders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          totalItems += Number(it.qty || 1);
        });
      }
    });

    const openTicketsCount = tickets.filter((t) => t.status === 'open' || !t.status).length;
    const callbacksCount = tickets.filter((t) => t.category === 'callback_request' || t.id.startsWith('CALL-')).length;

    return {
      totalRevenue,
      paidRevenue,
      pendingCodRevenue,
      totalOrders: orders.length,
      totalItems,
      totalCustomers: customers.length,
      openTicketsCount,
      callbacksCount,
    };
  }, [orders, tickets, customers]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const addr = o.shipping_address || {};
      const name = (o.shipping_name || addr.name || '').toLowerCase();
      const phone = String(addr.phone || '').replace(/\D/g, '');
      const email = (o.user_email || '').toLowerCase();
      const id = o.id.toLowerCase();
      const city = String(addr.city || '').toLowerCase();
      return id.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q) || city.includes(q);
    });
  }, [orders, searchQuery]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (ticketFilter === 'open') return t.status === 'open' || !t.status;
      if (ticketFilter === 'in_progress') return t.status === 'in_progress';
      if (ticketFilter === 'resolved') return t.status === 'resolved';
      if (ticketFilter === 'callbacks') return t.category === 'callback_request' || t.id.startsWith('CALL-');
      return true;
    });
  }, [tickets, ticketFilter]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        String(c.address.city || '').toLowerCase().includes(q)
      );
    });
  }, [customers, customerSearch]);

  // ── LOCKED SCREEN ──
  if (!unlocked) {
    return (
      <main className="min-h-screen bg-radial from-[#151221] via-[#090A12] to-[#040508] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0F1424]/90 backdrop-blur-xl border border-amber-500/25 rounded-3xl p-8 shadow-[0_20px_60px_rgba(255,107,36,0.15)] space-y-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF4D24]/20 via-[#FF9900]/25 to-amber-500/10 border border-[#FF4D24]/40 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-[#FF4D24]/20 animate-pulse">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Rare Ember Founder Portal</h1>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Enter your master vault secret key to unlock live orders, customer CRM &amp; dispatch controls.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter ADMIN_SECRET..."
                className="w-full bg-[#070A14] border border-neutral-700 focus:border-[#FF4D24] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-white"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF4D24] via-[#FF6B35] to-[#FF9900] hover:brightness-110 text-white font-black text-sm tracking-wide transition-all shadow-lg shadow-[#FF4D24]/30 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating…' : 'Unlock Command Center ⚡'}
            </button>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-300 bg-rose-500/15 p-3 rounded-xl border border-rose-500/30">
              ⚠️ {error}
            </p>
          )}

          <p className="text-[11px] text-neutral-500 font-medium">
            Architectural Indian Streetwear • Supreme Founder Authority
          </p>
        </div>
      </main>
    );
  }

  // ── UNLOCKED COMMAND CENTER ──
  return (
    <main className="min-h-screen bg-[#070913] text-white pt-24 pb-20 px-3 sm:px-6 lg:px-8 selection:bg-[#FF4D24] selection:text-white">
      <div className="max-w-[1520px] mx-auto space-y-5">
        {/* Top Master Header Bar */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#170E0B] via-[#0D1322] to-[#120B1C] border border-[#FF4D24]/30 rounded-3xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FF4D24]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4D24]/30 via-amber-500/20 to-purple-500/10 border border-[#FF4D24]/50 flex items-center justify-center text-3xl shadow-lg shadow-[#FF4D24]/20 shrink-0">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Rare Ember Command Center</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Next sync in: <strong>{syncCountdown}s</strong>
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Founder: <span className="text-white font-extrabold">Ajay Kumar</span> • Real-Time Orders, Customer CRM &amp; Factory Dispatch
                  {lastRefreshedAt && (
                    <span className="text-[11px] text-neutral-500 ml-2">
                      (Synced {lastRefreshedAt.toLocaleTimeString('en-IN')})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {/* Auto-Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                  autoRefresh
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}
                title="Toggles automatic background polling"
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
                <span>{autoRefresh ? `Auto-Sync: ${syncCountdown}s` : 'Sync: Paused'}</span>
              </button>

              {/* Instant Manual Sync */}
              <button
                onClick={() => void load()}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-xs font-black text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <span className={loading ? 'animate-spin' : ''}>⚡</span>
                <span>{loading ? 'Syncing…' : 'Sync Now'}</span>
              </button>

              <Link
                href="/"
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-xs font-bold text-neutral-200 transition-all no-underline"
              >
                Live Store ↗
              </Link>

              <button
                onClick={handleLock}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-xs font-bold text-rose-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔒</span> Lock Vault
              </button>
            </div>
          </div>
        </div>

        {/* Executive KPI Matrix with Colorful Gradient Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Gross Revenue (Gold/Amber) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1F1708] via-[#120F0B] to-[#0A0B10] border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-xl shadow-amber-950/20">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
                <span>💰</span> Gross Revenue
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                INR Live
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono tracking-tight drop-shadow-sm">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </h2>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-500/20 text-[11px] flex-wrap">
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                ⚡ Prepaid: ₹{metrics.paidRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                💵 COD: ₹{metrics.pendingCodRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Card 2: Total Orders (Electric Cyan) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#081824] via-[#0A1017] to-[#0A0B10] border border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-xl shadow-cyan-950/20">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-cyan-400/90 uppercase tracking-wider flex items-center gap-1.5">
                <span>📦</span> Orders Placed
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {metrics.totalItems} Units
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-cyan-300 mt-2 font-mono tracking-tight drop-shadow-sm">
              {metrics.totalOrders}
            </h2>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-cyan-500/20 text-[11px]">
              <span className="text-cyan-200">
                Delivered: <strong className="text-emerald-400">{orders.filter((o) => o.status === 'delivered').length}</strong>
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-cyan-200">
                Transit: <strong className="text-cyan-400">{orders.filter((o) => o.status === 'shipped').length}</strong>
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-cyan-200">
                Pending: <strong className="text-amber-400">{orders.filter((o) => o.status.includes('pending')).length}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: Customer Directory (Royal Purple) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1C0D2A] via-[#100A1A] to-[#0A0B10] border border-purple-500/40 rounded-3xl p-4 sm:p-5 shadow-xl shadow-purple-950/20">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-purple-400/90 uppercase tracking-wider flex items-center gap-1.5">
                <span>👥</span> Customer CRM
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {customers.filter((c) => c.orderCount >= 2 || c.totalSpend >= 2000).length} VIPs
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-purple-300 mt-2 font-mono tracking-tight drop-shadow-sm">
              {metrics.totalCustomers}
            </h2>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-purple-500/20 text-[11px] text-purple-200/80">
              <span>Avg Basket: <strong className="text-white">₹{metrics.totalCustomers > 0 ? Math.round(metrics.totalRevenue / metrics.totalCustomers).toLocaleString('en-IN') : 0}</strong></span>
              <span className="text-neutral-600">•</span>
              <span className="text-purple-300">100% Verified Phones</span>
            </div>
          </div>

          {/* Card 4: Support SLA (Rose / Emerald) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#240A12] via-[#14080D] to-[#0A0B10] border border-rose-500/40 rounded-3xl p-4 sm:p-5 shadow-xl shadow-rose-950/20">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-rose-400/90 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎫</span> Support &amp; SLA
              </p>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                12h SLA Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-rose-400 mt-2 font-mono tracking-tight drop-shadow-sm flex items-baseline gap-2">
              <span>{metrics.openTicketsCount}</span>
              <span className="text-xs font-normal text-neutral-400">Open Tickets</span>
            </h2>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-rose-500/20 text-[11px] text-neutral-300">
              <span className="text-rose-300 font-bold">{metrics.callbacksCount} Callbacks</span>
              <span className="text-neutral-600">•</span>
              <span className="text-emerald-400 font-bold">1-Click WhatsApp SLA</span>
            </div>
          </div>
        </div>

        {/* Global Action Feedback Banners */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span>{actionSuccess}</span>
            </span>
            <button onClick={() => setActionSuccess('')} className="text-xs text-emerald-400 hover:text-white cursor-pointer border-none bg-transparent">✕</button>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-transparent border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </span>
            <button onClick={() => setError('')} className="text-xs text-rose-400 hover:text-white cursor-pointer border-none bg-transparent">✕</button>
          </div>
        )}

        {/* Master Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF7A00] text-white shadow-lg shadow-[#FF4D24]/30'
                  : 'bg-[#0E121E] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span>📦</span>
              <span>Orders &amp; Dispatch ({filteredOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tickets'
                  ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF7A00] text-white shadow-lg shadow-[#FF4D24]/30'
                  : 'bg-[#0E121E] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span>🎫</span>
              <span>Support &amp; Callbacks</span>
              {metrics.openTicketsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {metrics.openTicketsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF7A00] text-white shadow-lg shadow-[#FF4D24]/30'
                  : 'bg-[#0E121E] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span>👥</span>
              <span>Customer CRM ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('drops')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'drops'
                  ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF7A00] text-white shadow-lg shadow-[#FF4D24]/30'
                  : 'bg-[#0E121E] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span>🏷️</span>
              <span>Drops &amp; Margins ({catalogProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('website')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'website'
                  ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF7A00] text-white shadow-lg shadow-[#FF4D24]/30'
                  : 'bg-[#0E121E] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span>🌐</span>
              <span>Store Status</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: LIVE ORDERS & FULFILLMENT STREAM
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0D121F] border border-neutral-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: '', label: `All Orders (${orders.length})` },
                  { id: 'paid', label: `⚡ Paid (${orders.filter((o) => o.status === 'paid').length})` },
                  { id: 'pending_cod', label: `💵 Pending COD (${orders.filter((o) => o.status === 'pending_cod' || (o.status === 'pending' && o.payment_method === 'cod')).length})` },
                  { id: 'processing', label: `🏭 In Production (${orders.filter((o) => o.status === 'processing').length})` },
                  { id: 'shipped', label: `🚚 In Transit (${orders.filter((o) => o.status === 'shipped').length})` },
                  { id: 'delivered', label: `✅ Delivered (${orders.filter((o) => o.status === 'delivered').length})` },
                  { id: 'return_requested', label: `🔄 Returns (${orders.filter((o) => o.status === 'return_requested').length})` },
                  { id: 'refunded', label: `Refunded (${orders.filter((o) => o.status === 'refunded').length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF7A00] text-white shadow-md shadow-[#FF4D24]/20'
                        : 'bg-[#070A14] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
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
                  placeholder="Search order ID, customer name, phone, city..."
                  className="w-full md:w-80 bg-[#070A14] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#FF4D24]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Zero-State */}
            {filteredOrders.length === 0 ? (
              <div className="bg-[#0D121F] border border-neutral-800 rounded-3xl p-12 text-center space-y-3">
                <span className="text-4xl block">📦</span>
                <h3 className="text-lg font-black text-white">No Orders Found</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  {statusFilter ? `No orders currently match status "${statusFilter}".` : 'Your store is ready to receive orders from Meta ads and direct customer checkouts.'}
                </p>
              </div>
            ) : (
              /* All-in-One Live Order Cards */
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
                      className={`rounded-3xl p-5 sm:p-6 shadow-2xl transition-all duration-300 space-y-4 border ${
                        o.status === 'delivered'
                          ? 'bg-gradient-to-br from-[#0C1A14] to-[#0A0D15] border-emerald-500/50 shadow-emerald-950/20'
                          : o.status === 'shipped'
                          ? 'bg-gradient-to-br from-[#091724] to-[#0A0D15] border-cyan-500/50 shadow-cyan-950/20'
                          : o.status === 'processing'
                          ? 'bg-gradient-to-br from-[#180D26] to-[#0A0D15] border-purple-500/50 shadow-purple-950/20'
                          : isCod
                          ? 'bg-gradient-to-br from-[#1F140A] to-[#0A0D15] border-amber-500/50 shadow-amber-950/20'
                          : o.status === 'return_requested'
                          ? 'bg-gradient-to-br from-[#220B13] to-[#0A0D15] border-rose-500/50 shadow-rose-950/20 animate-pulse'
                          : 'bg-gradient-to-br from-[#0E1322] to-[#080B12] border-blue-500/30 hover:border-blue-500/50'
                      }`}
                    >
                      {/* Order Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-sm font-black text-amber-400">
                            #{o.id.slice(0, 8)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(o.id, 'Order UUID')}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white cursor-pointer border border-neutral-700"
                          >
                            Copy UUID
                          </button>
                          <span className="text-[11px] text-neutral-400 font-medium">
                            🗓️ {new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {isCod ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                              <span>💵</span>
                              <span>CASH ON DELIVERY (₹100 ADVANCE)</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                              <span>⚡</span>
                              <span>PREPAID (ONLINE UPI)</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Dynamic Status Tag */}
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                              o.status === 'delivered'
                                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                                : o.status === 'shipped'
                                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm'
                                : o.status === 'processing'
                                ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-sm'
                                : o.status === 'paid'
                                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300 shadow-sm'
                                : o.status === 'return_requested'
                                ? 'bg-rose-500/25 border border-rose-500/60 text-rose-300 animate-pulse'
                                : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                            }`}
                          >
                            ● {o.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xl font-black text-white font-mono tracking-tight">
                            ₹{Number(o.total_amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Address Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        {/* Customer Contact Card */}
                        <div className="space-y-2 bg-[#060810]/70 p-4 rounded-2xl border border-neutral-800">
                          <div className="flex items-center justify-between">
                            <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                              Customer Contact &amp; Actions
                            </p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-neutral-800 text-neutral-300 capitalize border border-neutral-700">
                              📍 {addressType}
                            </span>
                          </div>
                          <p className="text-sm font-black text-white">{customerName}</p>
                          <p className="text-neutral-300 flex items-center gap-1.5">
                            <span>✉️</span>
                            <a href={`mailto:${o.user_email}`} className="text-neutral-300 hover:text-white underline font-medium">
                              {o.user_email || 'No email provided'}
                            </a>
                          </p>
                          {formattedPhone && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              <span className="text-neutral-200 font-mono font-bold">
                                📱 +91 {formattedPhone}
                              </span>
                              <a
                                href={`tel:+91${formattedPhone}`}
                                className="px-2.5 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold no-underline border border-blue-500/30 transition-colors"
                              >
                                📞 Call
                              </a>
                              <a
                                href={`https://wa.me/91${formattedPhone}?text=${encodeURIComponent(
                                  `Namaste ${customerName}! Rare Ember team regarding your order #${o.id.slice(0, 8)}. We are preparing your order for express dispatch.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black no-underline flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
                              >
                                💬 WhatsApp Customer
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Shipping Destination Card */}
                        <div className="space-y-2 bg-[#060810]/70 p-4 rounded-2xl border border-neutral-800">
                          <div className="flex items-center justify-between">
                            <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                              Delivery Destination
                            </p>
                            <button
                              onClick={() => copyToClipboard(fullCourierLabel, 'Courier Label')}
                              className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer border-none bg-transparent"
                            >
                              📋 Copy Courier Label
                            </button>
                          </div>
                          <p className="text-neutral-200 leading-relaxed font-mono">
                            {fullDeliveryAddress || 'Address in checkout notes'}
                          </p>
                          {landmark && (
                            <p className="text-[11px] text-amber-300">
                              <strong>Landmark:</strong> {landmark}
                            </p>
                          )}

                          {/* Tracking & AWB Section */}
                          <div className="pt-1.5 space-y-1.5 border-t border-neutral-800/80">
                            {o.tracking_number ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-cyan-300 font-mono font-bold text-xs bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                                  🚚 AWB: {o.tracking_number}
                                </span>
                                {o.tracking_url && (
                                  <a
                                    href={o.tracking_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-cyan-400 hover:text-cyan-200 underline font-bold"
                                  >
                                    Live Tracker ↗
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAwbOrderId(o.id);
                                    setAwbInputValue(o.tracking_number || '');
                                  }}
                                  className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer bg-transparent border-none"
                                >
                                  ✏️ Edit AWB
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAwbOrderId(o.id);
                                    setAwbInputValue('');
                                  }}
                                  className="text-[11px] font-bold text-cyan-400 bg-cyan-500/15 hover:bg-cyan-500/25 px-2.5 py-1 rounded-xl border border-cyan-500/30 cursor-pointer flex items-center gap-1 transition-all"
                                >
                                  <span>🚚</span>
                                  <span>+ Add Courier AWB Tracking</span>
                                </button>
                              </div>
                            )}

                            {/* Inline AWB Input Box */}
                            {editingAwbOrderId === o.id && (
                              <div className="p-2.5 rounded-xl bg-neutral-900 border border-cyan-500/40 flex items-center gap-2 mt-2">
                                <input
                                  type="text"
                                  value={awbInputValue}
                                  onChange={(e) => setAwbInputValue(e.target.value)}
                                  placeholder="Enter Delhivery / BlueDart AWB #..."
                                  className="flex-1 bg-black/60 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveAwb(o.id, awbInputValue)}
                                  className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black cursor-pointer border-none"
                                >
                                  Save AWB
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingAwbOrderId(null)}
                                  className="px-2 py-1 text-xs text-neutral-400 hover:text-white cursor-pointer bg-transparent border-none"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {o.cj_order_id && (
                              <p className="text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
                                <span>🏭</span> Qikink Order: #{o.cj_order_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ordered Items Breakdown with Smart Catalog Resolution */}
                      {Array.isArray(o.items) && o.items.length > 0 && (
                        <div className="space-y-2 bg-[#060810]/50 p-3.5 rounded-2xl border border-neutral-800">
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                            Ordered Items ({o.items.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {o.items.map((rawItem, idx) => {
                              const resolved = resolveItemDetails(rawItem, Number(o.total_amount) || 0);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 bg-[#0D121E] p-3 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all"
                                >
                                  {resolved.imageUrl ? (
                                    <img
                                      src={resolved.imageUrl}
                                      alt={resolved.title}
                                      className="w-14 h-14 rounded-xl object-cover border border-neutral-700 shrink-0 bg-black/40"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl shrink-0">
                                      👕
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-white truncate" title={resolved.title}>
                                      {resolved.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1 flex-wrap">
                                      <span className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300 font-medium">
                                        Color: <strong>{resolved.color}</strong>
                                      </span>
                                      <span className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300 font-bold">
                                        Size: <strong>{resolved.size}</strong>
                                      </span>
                                      <span className="font-bold text-amber-400">Qty: {resolved.qty}</span>
                                    </div>
                                    <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                                      ₹{resolved.price.toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Operational Quick Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-neutral-800/80">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Live Status Switcher Dropdown */}
                          <div className="flex items-center gap-1.5 bg-[#060810] px-2.5 py-1 rounded-xl border border-neutral-700 text-xs">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Set Status:</span>
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              disabled={updatingId === o.id}
                              className="bg-transparent text-xs font-black text-white outline-none cursor-pointer"
                            >
                              <option value="pending" className="bg-[#0D121E]">Pending</option>
                              <option value="pending_cod" className="bg-[#0D121E]">Pending COD</option>
                              <option value="paid" className="bg-[#0D121E]">Paid (Prepaid)</option>
                              <option value="processing" className="bg-[#0D121E]">In Production</option>
                              <option value="shipped" className="bg-[#0D121E]">In Transit (Shipped)</option>
                              <option value="delivered" className="bg-[#0D121E]">Delivered</option>
                              <option value="return_requested" className="bg-[#0D121E]">Return Requested</option>
                              <option value="refunded" className="bg-[#0D121E]">Refunded</option>
                              <option value="cancelled" className="bg-[#0D121E]">Cancelled</option>
                            </select>
                          </div>

                          {/* Dispatch via Qikink */}
                          <button
                            onClick={() => handleTriggerQikink(o.id)}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <span>🏭</span>
                            <span>{updatingId === o.id ? 'Connecting Qikink…' : 'Dispatch via Qikink'}</span>
                          </button>

                          {/* Send Tax Invoice */}
                          <button
                            onClick={() => handleSendInvoiceEmail(o.id)}
                            disabled={updatingId === o.id}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer border border-neutral-700 disabled:opacity-50"
                          >
                            🧾 Send Tax Invoice
                          </button>

                          {/* Fast Action Shipped & Delivered */}
                          {o.status !== 'shipped' && o.status !== 'delivered' && (
                            <button
                              onClick={() => updateOrderStatus(o.id, 'shipped')}
                              disabled={updatingId === o.id}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              🚚 Mark Shipped
                            </button>
                          )}

                          {o.status !== 'delivered' && (
                            <button
                              onClick={() => updateOrderStatus(o.id, 'delivered')}
                              disabled={updatingId === o.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              ✅ Mark Delivered
                            </button>
                          )}
                        </div>

                        {/* Delete Order Button */}
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          disabled={updatingId === o.id}
                          className="px-2.5 py-1.5 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer border-none bg-transparent"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: CUSTOMER SUPPORT & CALLBACK DESK (REAL LIVE DATA)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {/* Ticket Category & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0D121F] border border-neutral-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: `All Inquiries (${tickets.length})` },
                  { id: 'open', label: `🔴 Open (${tickets.filter((t) => t.status === 'open' || !t.status).length})` },
                  { id: 'in_progress', label: `🟡 In Progress (${tickets.filter((t) => t.status === 'in_progress').length})` },
                  { id: 'resolved', label: `🟢 Resolved (${tickets.filter((t) => t.status === 'resolved').length})` },
                  { id: 'callbacks', label: `📞 Instant Callbacks (${tickets.filter((t) => t.category === 'callback_request' || t.id.startsWith('CALL-')).length})` },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTicketFilter(tf.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ticketFilter === tf.id
                        ? 'bg-gradient-to-r from-[#FF4D24] to-[#FF7A00] text-white shadow-md'
                        : 'bg-[#070A14] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-neutral-400 font-medium">
                Guaranteed 12h Customer Support SLA
              </div>
            </div>

            {/* Support Tickets Feed */}
            {filteredTickets.length === 0 ? (
              <div className="bg-[#0D121F] border border-neutral-800 rounded-3xl p-12 text-center space-y-3">
                <span className="text-4xl block">✨</span>
                <h3 className="text-lg font-black text-white">No Tickets in this Filter</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Customer queries submitted on /support or /support/callback will instantly appear here with 1-click WhatsApp reply buttons.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((t) => {
                  const isCallback = t.category === 'callback_request' || t.id.startsWith('CALL-');
                  const phone = String(t.phone || '').replace(/\D/g, '').slice(-10);

                  return (
                    <div
                      key={t.id}
                      className={`rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-300 space-y-4 border ${
                        t.status === 'resolved'
                          ? 'bg-gradient-to-br from-[#0B1512] to-[#0A0D15] border-emerald-500/30'
                          : t.status === 'in_progress'
                          ? 'bg-gradient-to-br from-[#181512] to-[#0A0D15] border-amber-500/30'
                          : 'bg-gradient-to-br from-[#170E1A] to-[#0A0D15] border-rose-500/40'
                      }`}
                    >
                      {/* Ticket Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-sm font-black text-amber-400">
                            #{t.id}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {new Date(t.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 border border-blue-500/40 text-blue-300">
                            {isCallback ? '📞 INSTANT CALLBACK' : t.category || 'General Support'}
                          </span>

                          {t.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 border border-rose-500/40 text-rose-300">
                              HIGH PRIORITY
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              t.status === 'resolved'
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                : t.status === 'in_progress'
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse'
                            }`}
                          >
                            {t.status || 'OPEN'}
                          </span>
                        </div>
                      </div>

                      {/* Customer Details & WhatsApp Action */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        <div className="space-y-1.5 bg-[#060810] p-4 rounded-2xl border border-neutral-800">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Customer Information
                          </p>
                          <p className="text-sm font-black text-white">{t.name || 'Shopper'}</p>
                          <p className="text-neutral-300">✉️ {t.email || 'Not provided'}</p>
                          {phone && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              <span className="text-neutral-200 font-mono font-bold">
                                📱 +91 {phone}
                              </span>
                              <a
                                href={`tel:+91${phone}`}
                                className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[11px] font-bold no-underline border border-blue-500/30"
                              >
                                📞 Call
                              </a>
                              <a
                                href={`https://wa.me/91${phone}?text=${encodeURIComponent(
                                  `Namaste ${t.name}! Rare Ember customer care regarding your query #${t.id} (${t.subject || t.category}). How can we help you?`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black no-underline flex items-center gap-1 shadow-sm"
                              >
                                💬 WhatsApp Customer
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Subject & Order Reference */}
                        <div className="space-y-1.5 bg-[#060810] p-4 rounded-2xl border border-neutral-800">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Ticket Subject
                          </p>
                          <p className="text-sm font-bold text-white">{t.subject || 'Support Query'}</p>
                          {t.order_id && (
                            <p className="text-xs text-amber-400 font-mono pt-1">
                              📦 Related Order: #{t.order_id}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Customer Message Box */}
                      <div className="bg-[#060810] p-4 rounded-2xl border border-neutral-800/80 space-y-1">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Customer Message:
                        </p>
                        <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                          {t.message || 'No message content provided.'}
                        </p>
                      </div>

                      {/* Ticket Action Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
                        <div className="flex items-center gap-2">
                          {t.status !== 'in_progress' && t.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateTicketStatus(t.id, 'in_progress')}
                              disabled={updatingId === t.id}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              ⚡ Mark In Progress
                            </button>
                          )}

                          {t.status !== 'resolved' ? (
                            <button
                              onClick={() => handleUpdateTicketStatus(t.id, 'resolved')}
                              disabled={updatingId === t.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              ✅ Mark Resolved
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateTicketStatus(t.id, 'open')}
                              disabled={updatingId === t.id}
                              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              ↩ Reopen Ticket
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteTicket(t.id)}
                          disabled={updatingId === t.id}
                          className="px-2.5 py-1.5 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer border-none bg-transparent"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: CUSTOMER CRM DIRECTORY
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0D121F] border border-neutral-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Verified Shoppers: {customers.length}</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customer name, phone, email, city..."
                  className="w-full sm:w-80 bg-[#070A14] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#FF4D24]"
                />
                {customerSearch && (
                  <button
                    onClick={() => setCustomerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="bg-[#0D121F] border border-neutral-800 rounded-3xl p-12 text-center space-y-3">
                <span className="text-4xl block">👥</span>
                <h3 className="text-lg font-black text-white">No Customers Match Search</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomers.map((cust, idx) => {
                  const isVip = cust.totalSpend >= 2500 || cust.orderCount >= 2;
                  const city = cust.address?.city || 'India';
                  const state = cust.address?.state || '';

                  return (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-[#121626] to-[#0A0D15] border border-neutral-800 hover:border-purple-500/40 rounded-3xl p-5 space-y-3 shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white">{cust.name}</h3>
                            {isVip && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-300">
                                ⭐ VIP BUYER
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            ✉️ {cust.email}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-black text-amber-400 font-mono">
                            ₹{cust.totalSpend.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            {cust.orderCount} {cust.orderCount === 1 ? 'Order' : 'Orders'}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-neutral-300 bg-[#060810] p-3 rounded-2xl border border-neutral-800 space-y-1">
                        <p className="text-[10px] text-neutral-500 uppercase font-bold">Latest Delivery Hub:</p>
                        <p className="truncate">{city}{state ? `, ${state}` : ''} {cust.address?.zip ? `(${cust.address.zip})` : ''}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-800">
                        {cust.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-neutral-300">
                              📱 +91 {cust.phone}
                            </span>
                            <a
                              href={`https://wa.me/91${cust.phone}?text=${encodeURIComponent(
                                `Namaste ${cust.name}! Greetings from Rare Ember. We appreciate you being part of our community.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black no-underline flex items-center gap-1 shadow-xs"
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500">Phone not on file</span>
                        )}

                        <span className="text-[10px] text-neutral-500">
                          Last ordered: {new Date(cust.latestOrderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 4: DROPS, CATALOG & LIVE MARGINS
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'drops' && (
          <div className="space-y-4">
            <div className="bg-[#0D121F] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-white">Active Custom-Printed Streetwear Drops (Exact 8 Pieces)</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Verified Tirupur factory blanks + client artwork in Qikink account 658581. Permanent catalog invariant.
                </p>
              </div>

              <Link
                href="/admin"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF4D24] to-[#FF7A00] text-white text-xs font-black no-underline shadow-sm"
              >
                Qikink Catalog Sync Tool ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {catalogProducts.map((p) => {
                const price = Number(p.price_inr || p.price || 0);
                const compareAt = Number(p.compareAtPrice || p.compare_at_price || 0);
                const isHoodie = p.title.toLowerCase().includes('hoodie');
                const isJersey = p.title.toLowerCase().includes('jersey');
                const baseCost = isHoodie ? 579 : isJersey ? 349 : 279;
                const grossProfit = price - baseCost;
                const marginPct = price > 0 ? Math.round((grossProfit / price) * 100) : 50;

                return (
                  <div
                    key={p.id}
                    className="bg-gradient-to-br from-[#101422] to-[#0A0D15] border border-neutral-800 hover:border-amber-500/40 rounded-3xl p-4 space-y-3 shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-16 h-16 rounded-2xl object-cover border border-neutral-800 shrink-0 bg-black/40"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                            {p.tag || p.category || 'Streetwear'}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate" title={p.title}>
                            {p.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-white font-mono">
                              ₹{price.toLocaleString('en-IN')}
                            </span>
                            {compareAt > price && (
                              <span className="text-xs text-neutral-500 line-through font-mono">
                                ₹{compareAt.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#060810] p-3 rounded-2xl border border-neutral-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span>Factory Cost:</span>
                          <span className="font-mono text-neutral-300">₹{baseCost}</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400 font-black">
                          <span>Net Profit Margin:</span>
                          <span className="font-mono">₹{grossProfit} ({marginPct}%)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Drop
                      </span>

                      <Link
                        href={`/product/${p.slug || p.id}`}
                        target="_blank"
                        className="text-xs text-amber-400 font-bold hover:underline"
                      >
                        View Live ↗
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 5: WEBSITE STATUS & SYSTEM INTEGRATIONS
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'website' && (
          <div className="bg-[#0D121F] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-xl font-black text-white">Rare Ember Infrastructure Health</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Real-time connection status across your cloud database, payment gateways, and ad pixels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#060810] p-5 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-2xl block">⚡</span>
                <h3 className="text-sm font-black text-white">Vercel Edge Cloud</h3>
                <p className="text-emerald-400 font-bold">● Active on Production</p>
                <p className="text-neutral-400">Aliased to www.rareember.shop with Turbopack SSR &amp; SSG.</p>
              </div>

              <div className="bg-[#060810] p-5 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-2xl block">📸</span>
                <h3 className="text-sm font-black text-white">Meta / Instagram Pixel</h3>
                <p className="text-emerald-400 font-bold">● Active (ID: 1535815651644454)</p>
                <p className="text-neutral-400">Tracks PageViews, AddToCart, and Purchase events for your ads.</p>
              </div>

              <div className="bg-[#060810] p-5 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-2xl block">💳</span>
                <h3 className="text-sm font-black text-white">Razorpay Payments</h3>
                <p className="text-emerald-400 font-bold">● Active &amp; Webhooks Armed</p>
                <p className="text-neutral-400">Accepts instant UPI, GooglePay, PhonePe, Cards &amp; NetBanking.</p>
              </div>

              <div className="bg-[#060810] p-5 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-2xl block">🏭</span>
                <h3 className="text-sm font-black text-white">Qikink POD Automation</h3>
                <p className="text-emerald-400 font-bold">● Connected Hub (Account 658581)</p>
                <p className="text-neutral-400">Auto-fulfillment queue dispatches paid parcels directly to factory.</p>
              </div>

              <div className="bg-[#060810] p-5 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-2xl block">🛡️</span>
                <h3 className="text-sm font-black text-white">Cloudflare Security Standard</h3>
                <p className="text-emerald-400 font-bold">● Passed (Zero Vulnerabilities)</p>
                <p className="text-neutral-400">Timing-safe HMAC signatures, price floors, and rate limiting active.</p>
              </div>

              <div className="bg-[#060810] p-5 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-2xl block">📬</span>
                <h3 className="text-sm font-black text-white">Resend Email Gateway</h3>
                <p className="text-emerald-400 font-bold">● Verified Delivery</p>
                <p className="text-neutral-400">Dispatches order receipts, COD OTPs &amp; support confirmation emails.</p>
              </div>
            </div>

            {/* Quick Store Links */}
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Quick Storefront Navigation</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Link href="/" target="_blank" className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold no-underline hover:bg-neutral-700">
                  Homepage ↗
                </Link>
                <Link href="/shop" target="_blank" className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold no-underline hover:bg-neutral-700">
                  Shop Catalog ↗
                </Link>
                <Link href="/checkout" target="_blank" className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold no-underline hover:bg-neutral-700">
                  Checkout Page ↗
                </Link>
                <Link href="/track" target="_blank" className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold no-underline hover:bg-neutral-700">
                  Order Tracker ↗
                </Link>
                <Link href="/returns" target="_blank" className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold no-underline hover:bg-neutral-700">
                  7-Day Returns ↗
                </Link>
                <Link href="/support" target="_blank" className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold no-underline hover:bg-neutral-700">
                  Support Helpdesk ↗
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
