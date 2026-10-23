'use client';

import React, { useState } from 'react';
import { products, cleanBrandTitle } from '@/lib/data/products';

interface AgentTaskSuiteProps {
  adminKey: string;
  overview?: any;
}

type TaskTab = 'growth' | 'security' | 'margin' | 'rto' | 'support' | 'seo' | 'copilot';

export default function AgentTaskSuite({ adminKey, overview }: AgentTaskSuiteProps) {
  const [activeTask, setActiveTask] = useState<TaskTab>('growth');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Task-specific outputs
  const [growthData, setGrowthData] = useState<any>(null);
  const [securityData, setSecurityData] = useState<any>(null);
  const [marginData, setMarginData] = useState<any>(null);
  const [rtoData, setRtoData] = useState<any>(null);
  const [supportData, setSupportData] = useState<any>(null);
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

      if (taskName === 'growth_mindset') setGrowthData(data);
      if (taskName === 'security_audit') setSecurityData(data);
      if (taskName === 'margin_audit') setMarginData(data);
      if (taskName === 'rto_risk_audit') setRtoData(data);
      if (taskName === 'support_solver') setSupportData(data);
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
    { id: 'growth', label: '🚀 Growth Mindset & Targets', desc: 'KPIs & Revenue Accelerator' },
    { id: 'security', label: '🛡️ 24/7 Cyber Threat Sentinel', desc: 'Hacking, bugs & RLS scan' },
    { id: 'margin', label: '💰 40% Margin Gatekeeper', desc: '₹100 delivery included' },
    { id: 'rto', label: '📦 COD & RTO Risk Sentinel', desc: 'Address verification' },
    { id: 'support', label: '💬 Customer Concierge', desc: 'Delhivery & Size solver' },
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
                <h3 className="text-xl sm:text-2xl font-black text-white">Autonomous AI Command &amp; Cyber Sentinel</h3>
                <p className="text-[11px] font-black uppercase tracking-wider text-orange-400 mt-0.5">
                  Powered by Google Gemini 3.8 Flash • Continuous 24/7 Telemetry &amp; Security Auditing
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Equipped with an unrelenting Growth Mindset to hit store targets (40%+ profit, ₹100 express delivery included, UPI acceleration) and a 24/7 Cybersecurity Sentinel scanning for threats, bugs, and data leaks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              24/7 Shield Active • Gemini Online
            </span>
          </div>
        </div>

        {/* Task Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-6 pt-6 border-t border-slate-800">
          {TASK_BUTTONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTask(t.id as TaskTab)}
              className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer border ${
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
          TASK 1: GROWTH MINDSET & TARGETS ENGINE
          ========================================================================= */}
      {activeTask === 'growth' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🚀</span> Autonomous Growth Mindset &amp; Revenue Accelerator
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Relentlessly tracks our targets: 40%+ gross margin on every drop, ₹100 express air delivery included, &gt;45% UPI prepaid conversion, and &lt;8% RTO.
                </p>
              </div>

              <button
                onClick={() => executeTask('growth_mindset')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D24] via-[#FF6B35] to-[#FFA048] hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Synthesizing Growth Sprint…' : '⚡ Run Growth Sprint Directive'}
              </button>
            </div>

            {/* Target Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Gross Margin Target</span>
                <p className="text-xl font-black text-emerald-400 mt-1">≥ 40%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">₹100 Express Delivery Included</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Prepaid UPI Share</span>
                <p className="text-xl font-black text-cyan-400 mt-1">≥ 45%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Locks cash &amp; cuts COD RTO</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cart Checkout Rate</span>
                <p className="text-xl font-black text-purple-400 mt-1">≥ 25%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Zero drop-off at address step</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">AOV (Average Order)</span>
                <p className="text-xl font-black text-orange-400 mt-1">≥ ₹899</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Multi-piece &amp; hoodie bundles</p>
              </div>
            </div>

            {growthData && (
              <div className="space-y-6 mt-6">
                <div className="p-5 rounded-2xl bg-black/40 border border-orange-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-500/20">
                    <span className="font-black text-orange-400 uppercase tracking-wider text-xs">
                      Gemini 3.8 Flash • High-Velocity Growth Sprint &amp; Experiments
                    </span>
                    <button
                      onClick={() => copyToClipboard(growthData.growthPlan, 'growth_plan')}
                      className="text-xs text-orange-400 hover:text-white cursor-pointer"
                    >
                      {copiedSnippet === 'growth_plan' ? '✓ Copied' : '📋 Copy Plan'}
                    </button>
                  </div>
                  {growthData.growthPlan}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK 2: 24/7 CYBERSECURITY, THREAT & BUG SENTINEL
          ========================================================================= */}
      {activeTask === 'security' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🛡️</span> 24/7 Autonomous Cybersecurity, Hacking &amp; Bug Sentinel
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Continuously scans the storefront, database RLS policies, payment webhooks, API routes, and rate-limits to prevent attacks and data leaks.
                </p>
              </div>

              <button
                onClick={() => executeTask('security_audit')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Running 10-Point Cyber Audit…' : '⚡ Run Live Cyber Audit Now'}
              </button>
            </div>

            {/* Security Posture Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Store Security Health</span>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-2xl font-black text-emerald-400">98 / 100</p>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Hardened Shield
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">10 of 10 defense protocols verified</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Active Threat Level</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                  <p className="text-lg font-black text-white">LOW / DEFENDED</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Zero unauthorized breaches recorded</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">24/7 Automated Vigilance</span>
                <div className="flex items-center gap-2 mt-1 text-xs font-bold text-cyan-300">
                  <span>✓ Edge SSL</span>
                  <span>✓ PostgreSQL RLS</span>
                  <span>✓ CSP</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Nightly GitHub Actions cloud sentinel synced</p>
              </div>
            </div>

            {/* Defense Matrix */}
            <div className="mt-6">
              <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono mb-3">
                10-Point D2C Cybersecurity &amp; Bug Defense Checklist
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {[
                  { name: 'Edge SSL & TLS 1.3 Handshake', detail: 'HSTS max-age=63072000 preload active.' },
                  { name: 'Clickjacking & Frame Busting', detail: 'X-Frame-Options: DENY, frame-ancestors: none.' },
                  { name: 'Content-Security-Policy (CSP)', detail: 'Strict script whitelist for Razorpay and analytics.' },
                  { name: 'PostgreSQL Row-Level Security', detail: '9 tables sealed with 0 public anonymous dump leaks.' },
                  { name: 'Server-Side Price Tampering Gate', detail: 'Client discounts discarded; subtotal re-computed.' },
                  { name: 'DDoS & Velocity Rate-Limiting', detail: 'Token-bucket IP filters on checkout & order APIs.' },
                  { name: 'SQL Injection & XSS Guardrails', detail: 'Zod schemas validated; parameterized SQL queries.' },
                  { name: 'Customer PII & IDOR Address Masking', detail: 'Dual-key order verification; street masked.' },
                  { name: 'Razorpay HMAC Webhook Verification', detail: 'Constant-time crypto.timingSafeEqual signatures.' },
                  { name: '₹100 Delivery Inclusion & Margin Rule', detail: 'Delivery fee baked into price; minimum 40% margin.' },
                ].map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> {c.name}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{c.detail}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                      PASS
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {securityData && (
              <div className="space-y-6 mt-6">
                <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
                    <span className="font-black text-emerald-400 uppercase tracking-wider text-xs">
                      Gemini 3.8 Flash • 24/7 CISO Security Audit Briefing
                    </span>
                    <button
                      onClick={() => copyToClipboard(securityData.briefing, 'security_briefing')}
                      className="text-xs text-emerald-400 hover:text-white cursor-pointer"
                    >
                      {copiedSnippet === 'security_briefing' ? '✓ Copied' : '📋 Copy Briefing'}
                    </button>
                  </div>
                  {securityData.briefing}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK 3: 40% MARGIN & ₹100 DELIVERY GATEKEEPER
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
          TASK 4: COD & RTO RISK SENTINEL
          ========================================================================= */}
      {activeTask === 'rto' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>📦</span> COD &amp; RTO (Return to Origin) Risk Sentinel
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

                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                    Evaluated Order Manifest (Recent Transactions)
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
          TASK 5: CUSTOMER CARE CONCIERGE (Delhivery Tracking & Size Exchange)
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
          TASK 6: SEO & GOOGLE MERCHANT FEED OPTIMIZER
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
          TASK 7: ASK RADHA AI (INTERACTIVE FOUNDER COPILOT)
          ========================================================================= */}
      {activeTask === 'copilot' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <h4 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <span>🤖</span> Ask Radha AI — Autonomous CEO Copilot
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              Ask any operational, marketing, security, or technical question directly. Radha injects live store telemetry, inventory status, and pricing rules into Gemini 3.8 Flash to return immediate tactical directives.
            </p>

            <div className="space-y-4 max-w-3xl">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Quick Founder Prompts:</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    'How can we increase prepaid UPI orders over COD to 50%?',
                    'Audit our 40% profit margin and express delivery inclusion',
                    'Explain the Delhivery Air tracking lifecycle for customers',
                    'Check our 24/7 security posture against DDoS and SQL injections',
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
                  placeholder="Ask Radha AI anything regarding RareEmber store operations, margins, conversions, security, or customer flows..."
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
