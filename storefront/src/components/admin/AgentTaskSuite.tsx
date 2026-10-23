'use client';

import React, { useState } from 'react';
import { products, cleanBrandTitle, formatPrice } from '@/lib/data/products';

interface AgentTaskSuiteProps {
  adminKey: string;
  overview?: any;
}

type TaskTab = 'margin' | 'rto' | 'support' | 'copywriter' | 'seo' | 'copilot';

export default function AgentTaskSuite({ adminKey, overview }: AgentTaskSuiteProps) {
  const [activeTask, setActiveTask] = useState<TaskTab>('margin');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Task-specific outputs
  const [marginData, setMarginData] = useState<any>(null);
  const [rtoData, setRtoData] = useState<any>(null);
  const [supportData, setSupportData] = useState<any>(null);
  const [copyData, setCopyData] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [copilotData, setCopilotData] = useState<any>(null);

  // Form states
  const [minMargin, setMinMargin] = useState(40);
  const [deliveryCost, setDeliveryCost] = useState(100);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [supportQuery, setSupportQuery] = useState('Where is my order? Delhivery tracking link says no scans found.');
  const [supportOrderId, setSupportOrderId] = useState('7792e434');
  const [copilotPrompt, setCopilotPrompt] = useState('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const executeTask = async (taskName: string, payload: Record<string, any> = {}) => {
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/agent/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          task: taskName,
          minMarginPct: minMargin,
          deliveryCost,
          productId: selectedProductId,
          customerQuery: supportQuery,
          orderId: supportOrderId,
          userPrompt: copilotPrompt,
          ...payload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');

      if (taskName === 'margin_audit') setMarginData(data);
      if (taskName === 'rto_risk_audit') setRtoData(data);
      if (taskName === 'support_solver') setSupportData(data);
      if (taskName === 'creative_copywriter') setCopyData(data);
      if (taskName === 'seo_optimizer') setSeoData(data);
      if (taskName === 'copilot_chat') setCopilotData(data);

      setStatusMsg(`⚡ ${taskName.replace(/_/g, ' ').toUpperCase()} executed via Gemini 3.8 Flash.`);
    } catch (err: any) {
      setStatusMsg(`⚠️ Error: ${err?.message || 'Task failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const TASK_BUTTONS = [
    { id: 'margin', label: '💰 40% Margin Gatekeeper', desc: '₹100 delivery included' },
    { id: 'rto', label: '🛡️ COD & RTO Risk Sentinel', desc: 'Address verification' },
    { id: 'support', label: '💬 Customer Concierge', desc: 'Delhivery & Size solver' },
    { id: 'copywriter', label: '📸 Streetwear Social & Ads', desc: 'Reels, Instagram, VIP SMS' },
    { id: 'seo', label: '🔍 Google SEO & Snippets', desc: 'High-intent search terms' },
    { id: 'copilot', label: '🤖 Ask Radha AI Copilot', desc: 'Direct founder intelligence' },
  ];

  return (
    <div className="space-y-6">
      {/* Task Header & Multi-Task Navigation */}
      <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-[#1C122C] via-[#131B2E] to-[#120D1A] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Autonomous AI Task Suite</h3>
                <p className="text-[11px] font-black uppercase tracking-wider text-orange-400 mt-0.5">
                  Powered by Google Gemini 3.8 Flash • Real-Time Telemetry Grounding
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Execute specialized autonomous tasks across margin compliance (40%+ profit + ₹100 express delivery), COD fraud prevention, customer concierge, and streetwear social drops.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Gemini 3.8 Flash Online
            </span>
          </div>
        </div>

        {/* Task Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-6 border-t border-slate-800">
          {TASK_BUTTONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTask(t.id as TaskTab)}
              className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                activeTask === t.id
                  ? 'bg-gradient-to-br from-[#FF4D24]/20 to-[#A855F7]/20 border-orange-500/50 shadow-md ring-1 ring-orange-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
              }`}
            >
              <div className={`text-xs font-black truncate ${activeTask === t.id ? 'text-white' : 'text-slate-300'}`}>
                {t.label}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* =========================================================================
          TASK 1: 40% MARGIN & ₹100 DELIVERY GATEKEEPER
          ========================================================================= */}
      {activeTask === 'margin' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>💰</span> 40% Minimum Profit Margin &amp; ₹100 Delivery Auditor
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces founder rule: ₹100 express air delivery included everywhere; minimum 40% gross profit after blank + DTF print + delivery + GST.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono">Min Margin:</span>
                  <input
                    type="number"
                    value={minMargin}
                    onChange={(e) => setMinMargin(Number(e.target.value) || 40)}
                    className="w-16 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-white font-mono text-xs text-center"
                  />
                  <span className="text-slate-400 font-mono">%</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono">Delivery Inc:</span>
                  <input
                    type="number"
                    value={deliveryCost}
                    onChange={(e) => setDeliveryCost(Number(e.target.value) || 100)}
                    className="w-16 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-white font-mono text-xs text-center"
                  />
                  <span className="text-slate-400 font-mono">₹</span>
                </div>

                <button
                  onClick={() => executeTask('margin_audit')}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? 'Auditing 32 Products…' : '⚡ Run Margin Audit Now'}
                </button>
              </div>
            </div>

            {marginData ? (
              <div className="space-y-6 mt-6">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Catalog Items</span>
                    <p className="text-xl font-black text-white mt-1">{marginData.summary.totalProducts}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Compliant (≥40% Profit)</span>
                    <p className="text-xl font-black text-emerald-300 mt-1">{marginData.summary.compliantCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Margin Warnings (&lt;40%)</span>
                    <p className="text-xl font-black text-amber-300 mt-1">{marginData.summary.warningCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Average Catalog Margin</span>
                    <p className="text-xl font-black text-orange-400 mt-1">{marginData.summary.avgMarginPct}%</p>
                  </div>
                </div>

                {/* AI Executive Strategy */}
                <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/20">
                    <span className="font-black text-orange-400 uppercase tracking-wider text-xs">
                      Gemini 3.8 Flash • Executive Margin Directive
                    </span>
                    <button
                      onClick={() => copyToClipboard(marginData.aiAnalysis, 'margin_analysis')}
                      className="text-xs text-purple-400 hover:text-white cursor-pointer"
                    >
                      {copiedSnippet === 'margin_analysis' ? '✓ Copied' : '📋 Copy Analysis'}
                    </button>
                  </div>
                  {marginData.aiAnalysis}
                </div>

                {/* Table of Products */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Base Cost</th>
                        <th className="py-3 px-4">Delivery</th>
                        <th className="py-3 px-4">Total Landed</th>
                        <th className="py-3 px-4">Selling Price</th>
                        <th className="py-3 px-4">Net Profit</th>
                        <th className="py-3 px-4">Margin %</th>
                        <th className="py-3 px-4">Status &amp; Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {marginData.items.slice(0, 15).map((it: any) => (
                        <tr key={it.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-200 max-w-[200px] truncate">{it.title}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">₹{it.baseCost}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">₹{it.deliveryCost}</td>
                          <td className="py-3 px-4 font-mono text-slate-300 font-bold">₹{it.totalLandedCost}</td>
                          <td className="py-3 px-4 font-mono text-white font-black">₹{it.sellingPrice}</td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold">+₹{it.grossProfit}</td>
                          <td className="py-3 px-4 font-mono font-black">
                            <span className={it.marginPct >= minMargin ? 'text-emerald-400' : 'text-amber-400'}>
                              {it.marginPct}%
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                it.meetsTarget
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {it.meetsTarget ? '✓ ≥40% SAFE' : `⚠️ Rec: ₹${it.recommendedPrice}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Click <b>&quot;Run Margin Audit Now&quot;</b> above to compute real-time margins across all 32 items with ₹100 express delivery included.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK 2: COD & RTO RISK SENTINEL
          ========================================================================= */}
      {activeTask === 'rto' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🛡️</span> COD &amp; RTO (Return to Origin) Risk Sentinel
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluates Cash on Delivery orders, analyzes postal PIN deliverability, and generates 1-click WhatsApp verification scripts.
                </p>
              </div>

              <button
                onClick={() => executeTask('rto_risk_audit')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Evaluating Orders…' : '⚡ Run RTO Risk Audit'}
              </button>
            </div>

            {rtoData ? (
              <div className="space-y-6 mt-6">
                {/* RTO Tactics by Gemini */}
                <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/20">
                    <span className="font-black text-purple-400 uppercase tracking-wider text-xs">
                      Gemini 3.8 Flash • RTO Mitigation Directive
                    </span>
                    <button
                      onClick={() => copyToClipboard(rtoData.aiAnalysis, 'rto_analysis')}
                      className="text-xs text-purple-400 hover:text-white cursor-pointer"
                    >
                      {copiedSnippet === 'rto_analysis' ? '✓ Copied' : '📋 Copy Directive'}
                    </button>
                  </div>
                  {rtoData.aiAnalysis}
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                    Evaluated Order Manifest (Recent COD &amp; Prepaid Transactions)
                  </h5>
                  {rtoData.orders.map((o: any) => (
                    <div
                      key={o.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white font-mono">Order #{o.id.slice(0, 8)}…</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              o.riskLevel === 'LOW'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : o.riskLevel === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            Risk: {o.riskLevel} ({o.riskScore}%)
                          </span>
                          <span className="text-xs text-slate-400">
                            {o.isCod ? '💵 COD' : '💳 Prepaid'} • ₹{o.total}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {o.name} • {o.city || 'India'} (PIN: {o.zip})
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {o.flags.map((f: string, idx: number) => (
                            <span key={idx} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={o.waConfirmLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black no-underline shadow-md inline-flex items-center gap-1.5"
                        >
                          <span>📲 1-Tap WhatsApp Confirm</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Click <b>&quot;Run RTO Risk Audit&quot;</b> to scan pending orders for fake addresses and generate WhatsApp confirmation links.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK 3: CUSTOMER CARE CONCIERGE (Delhivery Tracking & Size Exchange)
          ========================================================================= */}
      {activeTask === 'support' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <h4 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <span>💬</span> AI Customer Care Concierge &amp; Resolution Engine
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              Synthesizes authentic, reassuring customer replies with Delhivery Air tracking status, Tirupur production lifecycle, and 7-day doorstep size replacement policy.
            </p>

            <div className="space-y-4 max-w-3xl">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Common Inquiry or Enter Custom Query:</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    'Where is my order? Delhivery tracking link says no scans found.',
                    'Can I exchange size M for size L?',
                    'Is cash on delivery available to my pincode?',
                    'I received my package but print looks defective.',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSupportQuery(preset)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 cursor-pointer border border-slate-700 text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  value={supportQuery}
                  onChange={(e) => setSupportQuery(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  placeholder="Customer inquiry message..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Referenced Order ID / AWB:</label>
                  <input
                    type="text"
                    value={supportOrderId}
                    onChange={(e) => setSupportOrderId(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                    placeholder="e.g. 7792e434 or BD-18023747616"
                  />
                </div>
                <button
                  onClick={() => executeTask('support_solver')}
                  disabled={loading}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
                >
                  {loading ? 'Synthesizing Resolution…' : '⚡ Generate Response'}
                </button>
              </div>
            </div>

            {supportData && (
              <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-orange-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
                  <span className="font-black text-orange-400 text-xs uppercase tracking-wider">
                    Gemini 3.8 Flash • Concierge Resolution (WhatsApp &amp; Email Ready)
                  </span>
                  <button
                    onClick={() => copyToClipboard(supportData.resolution, 'support_reply')}
                    className="text-xs text-orange-400 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'support_reply' ? '✓ Copied All' : '📋 Copy All'}
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed font-sans">
                  {supportData.resolution}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK 4: STREETWEAR SOCIAL & AD COPYWRITER
          ========================================================================= */}
      {activeTask === 'copywriter' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <h4 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <span>📸</span> Streetwear Drop &amp; Social Ads Copywriter
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              Picks any garment from the catalog and generates high-converting Instagram Feed captions, 3-second Reel hooks, and VIP WhatsApp drop broadcasts.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-2xl">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Garment Drop:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {cleanBrandTitle(p.title)} — {formatPrice(p.price_inr || p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => executeTask('creative_copywriter')}
                disabled={loading}
                className="sm:mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Crafting Drops…' : '⚡ Generate Creative Copy'}
              </button>
            </div>

            {copyData && (
              <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-pink-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-pink-500/20">
                  <span className="font-black text-pink-400 text-xs uppercase tracking-wider">
                    Creative Assets for: {copyData.product.title}
                  </span>
                  <button
                    onClick={() => copyToClipboard(copyData.copy, 'ad_copy')}
                    className="text-xs text-pink-400 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'ad_copy' ? '✓ Copied' : '📋 Copy Copy'}
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed font-sans">
                  {copyData.copy}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK 5: SEO & GOOGLE MERCHANT FEED OPTIMIZER
          ========================================================================= */}
      {activeTask === 'seo' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <h4 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <span>🔍</span> Google SEO &amp; Merchant Center Optimizer
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              Generates high-CTR Google search meta titles, meta descriptions, high-intent Indian streetwear keywords, and Schema.org Product JSON-LD snippets.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-2xl">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Product for SEO:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {cleanBrandTitle(p.title)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => executeTask('seo_optimizer')}
                disabled={loading}
                className="sm:mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Optimizing Metadata…' : '⚡ Generate SEO Specs'}
              </button>
            </div>

            {seoData && (
              <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <span className="font-black text-cyan-400 text-xs uppercase tracking-wider">
                    Google SEO Specs: {seoData.product.title}
                  </span>
                  <button
                    onClick={() => copyToClipboard(seoData.seoSpec, 'seo_spec')}
                    className="text-xs text-cyan-400 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'seo_spec' ? '✓ Copied' : '📋 Copy SEO Specs'}
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed font-sans">
                  {seoData.seoSpec}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK 6: ASK RADHA AI (INTERACTIVE FOUNDER COPILOT)
          ========================================================================= */}
      {activeTask === 'copilot' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <h4 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <span>🤖</span> Ask Radha AI — Autonomous CEO Copilot
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              Ask any operational, marketing, or technical question directly. Radha injects live store telemetry, inventory status, and pricing rules into Gemini 3.8 Flash to return immediate tactical directives.
            </p>

            <div className="space-y-4 max-w-3xl">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Quick Founder Prompts:</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    'How can we increase prepaid UPI orders over COD?',
                    'Audit our 40% profit margin and express delivery inclusion',
                    'Explain the Delhivery Air tracking lifecycle for customers',
                    'Which silhouette should we drop next based on visitor trends?',
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCopilotPrompt(prompt)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer border border-slate-700 transition-colors"
                    >
                      ⚡ {prompt}
                    </button>
                  ))}
                </div>

                <textarea
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 font-sans"
                  placeholder="Ask Radha AI anything regarding RareEmber store operations, margins, conversions, or customer flows..."
                />
              </div>

              <button
                onClick={() => executeTask('copilot_chat')}
                disabled={loading || !copilotPrompt.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF4D24] via-[#A855F7] to-[#3B82F6] hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? 'Radha AI Reasoning with Gemini…' : '⚡ Ask Radha AI'}
              </button>
            </div>

            {copilotData && (
              <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                  <span className="font-black text-purple-400 text-xs uppercase tracking-wider">
                    Radha CEO Directive
                  </span>
                  <button
                    onClick={() => copyToClipboard(copilotData.response, 'copilot_reply')}
                    className="text-xs text-purple-400 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'copilot_reply' ? '✓ Copied' : '📋 Copy Directive'}
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed font-sans">
                  {copilotData.response}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
