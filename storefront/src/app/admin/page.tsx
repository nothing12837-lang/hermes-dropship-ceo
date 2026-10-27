'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const KEY_STORAGE = 'rareember_admin_vault_key';

interface ProductVariant {
  product_sku?: string;
  variant_sku: string;
  color: string;
  size: string;
  cost_price?: number;
  selling_price?: number;
  variant_image?: string;
}

interface ProductItem {
  id: string;
  slug: string;
  title: string;
  short?: string;
  story?: string;
  details?: string[];
  price: number;
  price_inr?: number;
  compareAtPrice?: number;
  compare_at_price?: number;
  category?: string;
  gender?: string;
  image_url: string;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  colorImages?: Record<string, string>;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
  badge?: string;
  qikinkSkuPrefix?: string;
  qikinkClientProductId?: string;
  qikinkPrintType?: string;
  is_printed?: boolean;
  active: boolean;
  baseCost: number;
  margin: number;
  marginPct: number;
  totalVariants: number;
}

interface QikinkVerificationResult {
  qikinkProductId: string;
  title: string;
  cleanTitle: string;
  blankSku: string;
  blankName: string;
  baseCost: number;
  recommendedSellingPrice: number;
  compareAtPrice: number;
  margin: number;
  marginPct: number;
  colors: string[];
  colorImages: Record<string, string>;
  primaryMockup: string;
  sizes: string[];
  totalVariants: number;
  sizeChartLink?: string;
  category: string;
  alreadyImported: boolean;
  existingId?: string | null;
  active: boolean;
  isCustomSynthesized?: boolean;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Catalog' },
  { id: 'mens', label: "Men's & Unisex" },
  { id: 'womens', label: "Women's" },
  { id: 'kids', label: 'Kids' },
  { id: 'fashion', label: 'Streetwear' },
  { id: 'blanks', label: 'Blanks' },
];

const SUGGESTED_QIKINK_DROPS = [
  { id: '32476280', label: 'Oversized Jersey (UJ35)', blank: 'UJ35' },
  { id: '32477737', label: 'Full Sleeve Tee (MRnFs)', blank: 'MRnFs' },
  { id: '32476824', label: 'Red Mecha Full Sleeve', blank: 'MRnFs' },
  { id: '32476620', label: 'Terry Boxy Tee (UT27)', blank: 'UT27' },
  { id: '32476431', label: 'Bengaluru Cyber Tee', blank: 'US22' },
  { id: '32476332', label: 'Tokyo Street Graphic', blank: 'UC22' },
  { id: '32476874', label: "Women's Classic Tee", blank: 'FRnHs' },
  { id: '32476851', label: 'Street Crop Top (FC39)', blank: 'FC39' },
];

export default function AdminProductsDashboard() {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Selected mockup preview per product card
  const [selectedCardColor, setSelectedCardColor] = useState<Record<string, string>>({});

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingQikink, setVerifyingQikink] = useState(false);
  const [inputQikinkId, setInputQikinkId] = useState('');
  const [verifiedDrop, setVerifiedDrop] = useState<QikinkVerificationResult | null>(null);
  const [importCustomTitle, setImportCustomTitle] = useState('');
  const [importCustomPrice, setImportCustomPrice] = useState<number>(699);
  const [importCustomCompare, setImportCustomCompare] = useState<number>(1299);
  const [importCustomCategory, setImportCustomCategory] = useState('mens');
  const [importingDrop, setImportingDrop] = useState(false);

  // Edit Modal
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState<number>(699);
  const [editCompare, setEditCompare] = useState<number>(1299);
  const [editCategory, setEditCategory] = useState('mens');
  const [editTag, setEditTag] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Remove Modal
  const [removingProduct, setRemovingProduct] = useState<ProductItem | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const headers = useCallback(
    (): HeadersInit => ({ Authorization: `Bearer ${key}` }),
    [key]
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionSuccess('');
    try {
      const res = await fetch('/api/admin/products', { headers: headers() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate admin key');
      setProducts(data.products ?? []);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
      if (String(err).includes('Unauthorized')) setUnlocked(false);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  // Auto-unlock from session / local storage or ?key=
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
            const res = await fetch('/api/admin/products', {
              headers: { Authorization: `Bearer ${saved}` },
            });
            if (res.ok) {
              const data = await res.json();
              setProducts(data.products ?? []);
              setUnlocked(true);
            }
          } catch {}
        })();
      }
    } catch {}
  }, []);

  const handleUnlock = () => {
    if (!key.trim()) return setError('Please enter vault key');
    sessionStorage.setItem(KEY_STORAGE, key.trim());
    localStorage.setItem(KEY_STORAGE, key.trim());
    void loadProducts();
  };

  const handleLock = () => {
    try {
      sessionStorage.removeItem(KEY_STORAGE);
      localStorage.removeItem(KEY_STORAGE);
    } catch {}
    setUnlocked(false);
    setKey('');
    setProducts([]);
  };

  // Toggle active (Stop / Pause / Resume)
  const handleToggleActive = async (p: ProductItem) => {
    const nextState = !p.active;
    setUpdatingId(p.id);
    setError('');
    setActionSuccess('');

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, active: nextState } : item))
    );

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_active',
          productId: p.id,
          active: nextState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status');
      setActionSuccess(data.message || `Drop updated to ${nextState ? 'LIVE' : 'PAUSED'}`);
    } catch (err) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, active: p.active } : item))
      );
      setError(err instanceof Error ? err.message : 'Toggle failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // Re-sync with Qikink
  const handleResyncQikink = async (p: ProductItem) => {
    setUpdatingId(p.id);
    setError('');
    setActionSuccess('');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resync_qikink',
          productId: p.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Re-sync failed');
      setActionSuccess(`Drop "${p.title}" successfully re-synced from Qikink S3 vault!`);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Re-sync failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // Verify Qikink product ID
  const handleVerifyQikink = async (idToVerify?: string) => {
    const targetId = (idToVerify || inputQikinkId).trim();
    if (!targetId) return;

    setVerifyingQikink(true);
    setError('');
    setVerifiedDrop(null);

    try {
      const res = await fetch(`/api/admin/products/verify-qikink?id=${encodeURIComponent(targetId)}`, {
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      const v: QikinkVerificationResult = data.verified;
      setVerifiedDrop(v);
      setImportCustomTitle(v.cleanTitle || v.title);
      setImportCustomPrice(v.recommendedSellingPrice || 699);
      setImportCustomCompare(v.compareAtPrice || 1299);
      setImportCustomCategory(v.category || 'mens');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Qikink verification failed');
    } finally {
      setVerifyingQikink(false);
    }
  };

  // 1-Click Import Drop
  const handleImportDrop = async () => {
    if (!verifiedDrop) return;
    setImportingDrop(true);
    setError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_qikink',
          qikinkProductId: verifiedDrop.qikinkProductId,
          title: importCustomTitle.trim() || verifiedDrop.title,
          sellingPrice: importCustomPrice,
          compareAtPrice: importCustomCompare,
          category: importCustomCategory,
          blankSku: verifiedDrop.blankSku,
          colors: verifiedDrop.colors,
          colorImages: verifiedDrop.colorImages,
          sizes: verifiedDrop.sizes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import drop');

      setActionSuccess(`Drop "${importCustomTitle || verifiedDrop.title}" imported to catalog!`);
      setShowAddModal(false);
      setVerifiedDrop(null);
      setInputQikinkId('');
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImportingDrop(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditPrice(p.price);
    setEditCompare(p.compareAtPrice || p.compare_at_price || Math.round(p.price * 1.6));
    setEditCategory(p.category || 'mens');
    setEditTag(p.tag || '');
    setEditActive(p.active);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setSavingEdit(true);
    setError('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_details',
          productId: editingProduct.id,
          updates: {
            title: editTitle.trim(),
            price: editPrice,
            compareAtPrice: editCompare,
            category: editCategory,
            tag: editTag.trim(),
            active: editActive,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');

      setActionSuccess(`Details for "${editTitle}" updated!`);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingEdit(false);
    }
  };

  // Remove Drop
  const handleConfirmRemove = async () => {
    if (!removingProduct) return;
    setIsRemoving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: removingProduct.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove drop');

      setActionSuccess(`Drop "${removingProduct.title}" removed from catalog.`);
      setRemovingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setIsRemoving(false);
    }
  };

  // Filtered catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.slug && p.slug.toLowerCase().includes(q)) ||
          (p.qikinkClientProductId && p.qikinkClientProductId.includes(q)) ||
          (p.qikinkSkuPrefix && p.qikinkSkuPrefix.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedCategory !== 'all') {
        const cat = (p.category || '').toLowerCase();
        const gender = (p.gender || '').toLowerCase();
        if (selectedCategory === 'mens' && !(gender === 'men' || cat === 'mens')) return false;
        if (selectedCategory === 'womens' && !(gender === 'women' || cat === 'womens')) return false;
        if (selectedCategory === 'kids' && !(gender === 'kids' || cat === 'kids')) return false;
        if (selectedCategory === 'fashion' && !(cat === 'fashion' || cat === 'mens' || cat === 'womens')) return false;
        if (selectedCategory === 'blanks' && p.is_printed !== false) return false;
      }

      if (statusFilter === 'active' && !p.active) return false;
      if (statusFilter === 'paused' && p.active) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const activeCount = products.filter((p) => p.active).length;
    const pausedCount = products.filter((p) => !p.active).length;
    const totalVariants = products.reduce((acc, p) => acc + (p.totalVariants || 0), 0);
    const avgMarginPct =
      total > 0 ? Math.round(products.reduce((acc, p) => acc + (p.marginPct || 0), 0) / total) : 0;
    return { total, activeCount, pausedCount, totalVariants, avgMarginPct };
  }, [products]);

  // 1. LOCKED VAULT GATE
  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#131B2E] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 mx-auto flex items-center justify-center text-3xl shadow-inner">
              👑
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Rare Ember Admin</h1>
            <p className="text-xs text-slate-400">
              Founder &amp; Executive Product Command Vault
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Security Passphrase
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="Enter ADMIN_SECRET..."
                  className="w-full bg-[#0B0F19] border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all pr-20"
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
                  <span className="animate-spin text-lg">↻</span> Verifying Vault Key...
                </>
              ) : (
                <>
                  <span>🔓</span> Unlock Product Command Center
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
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
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  RareEmber Product Controls
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE OPS
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 border border-orange-500/30 text-orange-400">
                  QIKINK FACTORY INTEGRATED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Founder: <span className="text-white font-bold">Ajay Kumar</span> • Real-Time Drop Controls, Pause/Resume &amp; Qikink Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/admin/orders"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all no-underline flex items-center gap-1"
            >
              <span>🚚</span> Orders &amp; Fulfillment ↗
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
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all no-underline flex items-center gap-1"
            >
              <span>🌐</span> Live Store ↗
            </Link>
            <button
              onClick={handleLock}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔒</span> Lock Vault
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span> {actionSuccess}
            </div>
            <button onClick={() => setActionSuccess('')} className="text-slate-400 hover:text-white font-mono">
              ✕
            </button>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span> {error}
            </div>
            <button onClick={() => setError('')} className="text-slate-400 hover:text-white font-mono">
              ✕
            </button>
          </div>
        )}

        {/* Executive KPI Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Drops</p>
            <h2 className="text-2xl font-black text-white mt-1 font-mono">{metrics.total}</h2>
            <p className="text-[10px] text-slate-400 mt-1">Authentic Qikink Apparel</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-lg">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active (Live)
            </p>
            <h2 className="text-2xl font-black text-emerald-400 mt-1 font-mono">{metrics.activeCount}</h2>
            <p className="text-[10px] text-slate-400 mt-1">Open for customer checkout</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-lg">
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Paused (OOS)
            </p>
            <h2 className="text-2xl font-black text-amber-400 mt-1 font-mono">{metrics.pausedCount}</h2>
            <p className="text-[10px] text-slate-400 mt-1">Temporarily stopped drops</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-lg">
            <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Total SKUs</p>
            <h2 className="text-2xl font-black text-cyan-400 mt-1 font-mono">{metrics.totalVariants}</h2>
            <p className="text-[10px] text-slate-400 mt-1">Color × Size physical variants</p>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-lg">
            <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Avg Gross Margin</p>
            <h2 className="text-2xl font-black text-orange-400 mt-1 font-mono">{metrics.avgMarginPct}%</h2>
            <p className="text-[10px] text-slate-400 mt-1">Weighted catalog markup</p>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Add New Drop */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drop by title, blank SKU (e.g. UJ35, MRnFs), or Qikink ID..."
                className="w-full bg-[#0B0F19] border border-slate-700 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-xl border border-slate-700 text-xs shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'all' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'active' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live ({metrics.activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('paused')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'paused' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paused ({metrics.pausedCount})
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setVerifiedDrop(null);
                  setInputQikinkId('');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <span>➕</span> Add New Drop from Qikink
              </button>
              <button
                onClick={loadProducts}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title="Refresh Catalog"
              >
                <span className={loading ? 'animate-spin inline-block' : ''}>↻</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'bg-[#0B0F19] text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredProducts.length} of {products.length} drops</span>
            {updatingId && <span className="text-orange-400 animate-pulse">Syncing change to database...</span>}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-[#131B2E] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <span className="text-4xl">🔍</span>
              <h3 className="text-base font-bold text-white">No products found matching filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for another keyword, reset status filter, or import a new drop from Qikink.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                const isUpdating = updatingId === p.id;
                const activeColor = selectedCardColor[p.id] || (p.colors && p.colors[0]) || 'White';
                const previewImg =
                  (p.colorImages && p.colorImages[activeColor]) ||
                  p.image_url ||
                  'https://www.rareember.shop/flame-icon.png';

                return (
                  <div
                    key={p.id}
                    className={`bg-[#131B2E] border rounded-2xl p-4 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden group ${
                      p.active
                        ? 'border-slate-800 hover:border-orange-500/50'
                        : 'border-amber-900/40 bg-[#10141f] opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Top Pill Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono">
                          {p.qikinkSkuPrefix || 'BLANK'}
                        </span>
                        {p.qikinkClientProductId && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 font-mono">
                            #{p.qikinkClientProductId}
                          </span>
                        )}
                      </div>

                      {/* Live / Paused Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1.5 ${
                          p.active
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        {p.active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>

                    {/* Image Mockup Preview */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0B0F19] border border-slate-800 mb-3 flex items-center justify-center">
                      <Image
                        src={previewImg}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {!p.active && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-amber-500/90 text-black text-[11px] font-black uppercase tracking-wider">
                            Paused / Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Color Swatches */}
                    {p.colors && p.colors.length > 1 && (
                      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto py-1">
                        {p.colors.slice(0, 6).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSelectedCardColor((prev) => ({ ...prev, [p.id]: c }))}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                              activeColor === c
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                        {p.colors.length > 6 && (
                          <span className="text-[9px] text-slate-500">+{p.colors.length - 6}</span>
                        )}
                      </div>
                    )}

                    {/* Title & Category */}
                    <div className="space-y-1 mb-3">
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug" title={p.title}>
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 font-mono">
                        /product/{p.slug || p.id}
                      </p>
                    </div>

                    {/* Financial Margins Grid */}
                    <div className="bg-[#0B0F19] rounded-xl p-2.5 border border-slate-800 space-y-1.5 mb-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Retail Price:</span>
                        <span className="font-extrabold text-amber-400 font-mono">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Landed Cost:</span>
                        <span className="font-semibold text-slate-400 font-mono">
                          ₹{p.baseCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-300">Profit Margin:</span>
                        <span className="font-black text-emerald-400 font-mono">
                          ₹{p.margin.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-emerald-500">({p.marginPct}%)</span>
                        </span>
                      </div>

                      {/* Visual Margin Bar */}
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${
                            p.marginPct >= 50 ? 'bg-emerald-500' : p.marginPct >= 30 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, p.marginPct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {/* STOP / RESUME Toggle Button */}
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={isUpdating}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                          p.active
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isUpdating ? (
                          <>
                            <span className="animate-spin inline-block">↻</span> Updating...
                          </>
                        ) : p.active ? (
                          <>
                            <span>⏸</span> Stop / Pause Drop
                          </>
                        ) : (
                          <>
                            <span>▶</span> Resume Drop (LIVE)
                          </>
                        )}
                      </button>

                      {/* Secondary Action Grid */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(p)}
                          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                          title="Edit Price, Title & Details"
                        >
                          <span>✏️</span> Edit
                        </button>

                        {/* Re-sync Button */}
                        <button
                          onClick={() => handleResyncQikink(p)}
                          disabled={isUpdating}
                          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                          title="Re-sync with Qikink S3"
                        >
                          <span>↻</span> Sync
                        </button>

                        {/* Live Preview Button */}
                        <Link
                          href={`/product/${p.slug || p.id}`}
                          target="_blank"
                          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all no-underline text-center"
                          title="Open live customer page"
                        >
                          <span>↗</span> View
                        </Link>

                        {/* Remove Button */}
                        <button
                          onClick={() => setRemovingProduct(p)}
                          className="py-1.5 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                          title="Remove / Archive Drop"
                        >
                          <span>🗑</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW DROP WITH QIKINK VERIFICATION           */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#131B2E] border border-slate-700 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-xl">
                  🔥
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Add New Drop from Qikink</h3>
                  <p className="text-xs text-slate-400">
                    Verify S3 mockups, garment blank &amp; factory landed cost
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Selection (Known Qikink Products):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QIKINK_DROPS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setInputQikinkId(s.id);
                      void handleVerifyQikink(s.id);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B0F19] border border-slate-700 hover:border-orange-500 text-slate-300 hover:text-orange-400 transition-all cursor-pointer"
                  >
                    #{s.id} • {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Check Button */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Enter Qikink Product ID (e.g. 32476280, 32477737, or custom):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputQikinkId}
                  onChange={(e) => setInputQikinkId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyQikink()}
                  placeholder="e.g. 32476280..."
                  className="flex-1 bg-[#0B0F19] border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
                <button
                  onClick={() => handleVerifyQikink()}
                  disabled={verifyingQikink || !inputQikinkId.trim()}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {verifyingQikink ? (
                    <>
                      <span className="animate-spin">↻</span> Verifying...
                    </>
                  ) : (
                    <>
                      <span>🔍</span> Check &amp; Verify
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Verification Result Card */}
            {verifiedDrop && (
              <div className="bg-[#0B0F19] border border-emerald-500/30 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span>✓</span> QIKINK PRODUCT VERIFIED
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: #{verifiedDrop.qikinkProductId} • Blank: {verifiedDrop.blankSku}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Mockup Preview */}
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 mx-auto sm:mx-0">
                    <Image
                      src={verifiedDrop.primaryMockup}
                      alt={verifiedDrop.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>

                  {/* Garment Blank Details */}
                  <div className="flex-1 space-y-1.5 text-xs">
                    <h4 className="font-extrabold text-white text-sm">{verifiedDrop.title}</h4>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Garment: <span className="text-orange-400 font-bold">{verifiedDrop.blankName}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-1">
                      <span>🎨 Colors: {verifiedDrop.colors.join(', ')}</span>
                      <span>📏 Sizes: {verifiedDrop.sizes.join(', ')}</span>
                      <span>📦 Variants: {verifiedDrop.totalVariants}</span>
                    </div>

                    <div className="flex items-center gap-4 pt-1 font-mono text-xs">
                      <span className="text-slate-400">
                        Factory Cost: <b className="text-white">₹{verifiedDrop.baseCost}</b>
                      </span>
                      <span className="text-emerald-400">
                        Margin:{' '}
                        <b>
                          ₹{(importCustomPrice - verifiedDrop.baseCost).toFixed(0)} (
                          {Math.round(((importCustomPrice - verifiedDrop.baseCost) / importCustomPrice) * 100)}%)
                        </b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customization Inputs Before Import */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      value={importCustomPrice}
                      onChange={(e) => setImportCustomPrice(Number(e.target.value))}
                      className="w-full bg-[#131B2E] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                      Compare MRP (₹)
                    </label>
                    <input
                      type="number"
                      value={importCustomCompare}
                      onChange={(e) => setImportCustomCompare(Number(e.target.value))}
                      className="w-full bg-[#131B2E] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                      Store Category
                    </label>
                    <select
                      value={importCustomCategory}
                      onChange={(e) => setImportCustomCategory(e.target.value)}
                      className="w-full bg-[#131B2E] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="mens">Men's &amp; Unisex</option>
                      <option value="womens">Women's Collection</option>
                      <option value="kids">Kids Streetwear</option>
                      <option value="fashion">Fashion &amp; Tops</option>
                      <option value="blanks">Essential Blanks</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                    Storefront Title
                  </label>
                  <input
                    type="text"
                    value={importCustomTitle}
                    onChange={(e) => setImportCustomTitle(e.target.value)}
                    className="w-full bg-[#131B2E] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                {/* Import CTA Button */}
                <button
                  onClick={handleImportDrop}
                  disabled={importingDrop}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {importingDrop ? (
                    <>
                      <span className="animate-spin text-sm">↻</span> Creating Drop in Supabase &amp; Catalog...
                    </>
                  ) : (
                    <>
                      <span>🚀</span> 1-Click Import Drop to Storefront Catalog
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT PRODUCT DETAILS                            */}
      {/* ======================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#131B2E] border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Edit Product Details</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                    Compare MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={editCompare}
                    onChange={(e) => setEditCompare(Number(e.target.value))}
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="mens">Men's &amp; Unisex</option>
                    <option value="womens">Women's Collection</option>
                    <option value="kids">Kids Streetwear</option>
                    <option value="fashion">Fashion &amp; Tops</option>
                    <option value="blanks">Essential Blanks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                    Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    placeholder="e.g. 🔥 NEW DROP"
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                <div>
                  <p className="font-bold text-white">Live Storefront Status</p>
                  <p className="text-[10px] text-slate-400">
                    {editActive ? 'Drop is active & live for orders' : 'Drop is paused (marked out of stock)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    editActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {editActive ? 'LIVE (ACTIVE)' : 'PAUSED (OOS)'}
                </button>
              </div>

              {/* Projected Margin Preview */}
              <div className="bg-[#0B0F19] rounded-xl p-3 border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-400">Factory Landed: ₹{editingProduct.baseCost}</span>
                <span className="text-[11px] font-bold text-emerald-400">
                  Margin: ₹{(editPrice - editingProduct.baseCost).toFixed(0)} (
                  {Math.round(((editPrice - editingProduct.baseCost) / editPrice) * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {savingEdit ? (
                  <>
                    <span className="animate-spin">↻</span> Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REMOVE PRODUCT CONFIRMATION                     */}
      {/* ======================================================== */}
      {removingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131B2E] border border-red-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-black text-white">Remove Product from Catalog?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <b className="text-white">&quot;{removingProduct.title}&quot;</b>?
              <br />
              This will deactivate the drop from the public store and hide it from customer search &amp; checkout.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRemovingProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isRemoving ? (
                  <>
                    <span className="animate-spin">↻</span> Removing...
                  </>
                ) : (
                  <>
                    <span>🗑</span> Confirm Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
