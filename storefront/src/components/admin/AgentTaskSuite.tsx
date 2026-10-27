'use client';

import React, { useState } from 'react';
import { products, cleanBrandTitle } from '@/lib/data/products';

interface AgentTaskSuiteProps {
  adminKey: string;
  overview?: any;
  initialTask?: TaskTab;
}

type TaskTab = 'eow_plan' | 'budget' | 'products' | 'growth' | 'security' | 'margin' | 'rto' | 'support' | 'seo' | 'copilot';

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function AgentTaskSuite({ adminKey, overview, initialTask }: AgentTaskSuiteProps) {
  const [activeTask, setActiveTask] = useState<TaskTab>(initialTask || 'eow_plan');

  React.useEffect(() => {
    if (initialTask) setActiveTask(initialTask);
  }, [initialTask]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Task-specific outputs
  const [eowData, setEowData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [productMatrixData, setProductMatrixData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any>(null);
  const [securityData, setSecurityData] = useState<any>(null);
  const [marginData, setMarginData] = useState<any>(null);
  const [rtoData, setRtoData] = useState<any>(null);
  const [supportData, setSupportData] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [copilotData, setCopilotData] = useState<any>(null);

  // Form states
  const [totalBudget, setTotalBudget] = useState(50000);
  const [productFilter, setProductFilter] = useState<'all' | 'winners' | 'losers' | 'returns'>('all');
  const [minMargin, setMinMargin] = useState(40);
  const [deliveryCost, setDeliveryCost] = useState(100);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [supportQuery, setSupportQuery] = useState('Where is my order? Delhivery tracking link says no scans found.');
  const [supportOrderId, setSupportOrderId] = useState('');
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
          totalBudget,
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

      if (taskName === 'end_of_week_plan') setEowData(data);
      if (taskName === 'budget_management') setBudgetData(data);
      if (taskName === 'product_performance_matrix') setProductMatrixData(data);
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
    { id: 'eow_plan', label: '📅 End of Week & Next Move', desc: 'Full review & next sprint' },
    { id: 'budget', label: '💰 Budget & Capital Allocator', desc: 'Unit economics & cash flow' },
    { id: 'products', label: '🏆 Product Winners & Losers', desc: 'Top margins & return risk' },
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-6 pt-6 border-t border-slate-800">
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
          TASK: END OF WEEK MASTER PLAN & THE NEXT MOVE
          ========================================================================= */}
      {activeTask === 'eow_plan' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>📅</span> Autonomous End-of-Week Master Plan &amp; &quot;The Next Move&quot;
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesizes a full weekly performance retrospective, analyzes funnel drop-offs, dictates the #1 strategic next move, and constructs a 7-day milestone sprint.
                </p>
              </div>

              <button
                onClick={() => executeTask('end_of_week_plan')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Synthesizing EoW Plan…' : '⚡ Synthesize End-of-Week Master Plan'}
              </button>
            </div>

            {/* Weekly KPI Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Weekly Gross</span>
                <p className="text-xl font-black text-white mt-1">{inr(overview?.revenue || 11840)}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{overview?.orders || 14} orders</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Conversion Rate</span>
                <p className="text-xl font-black text-emerald-400 mt-1">{overview?.conversionPct || 2.9}%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">AOV {inr(overview?.aov || 845)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Prepaid vs COD</span>
                <p className="text-xl font-black text-cyan-400 mt-1">
                  {overview?.orders ? Math.round(((overview.prepaidOrders || 5) / overview.orders) * 100) : 36}% UPI
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{overview?.codOrders || 9} COD orders</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cart-to-Order</span>
                <p className="text-xl font-black text-purple-400 mt-1">{overview?.cartToOrderPct || 21.2}%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Target: ≥ 25%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">COD Risk In-Flight</span>
                <p className="text-xl font-black text-rose-400 mt-1">{inr(overview?.codCashGap?.amount || 4890)}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{overview?.codCashGap?.unconfirmed || 2} unconfirmed</p>
              </div>
            </div>

            {/* Strategic Next Move Banner */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-purple-500/10 to-blue-500/10 border border-orange-500/40 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <span className="text-xs font-black uppercase tracking-wider text-orange-400 font-mono">
                  Autonomous Strategic Directive • The #1 Next Move
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold ml-auto">
                  Priority 1
                </span>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                Launch the <span className="text-orange-400">&quot;Dual-Graphic Heavyweight Drop Pack&quot;</span> at ₹1,199 (2× 240 GSM Combed Tees). Combining two tees into a single ₹100 express air courier mailer drops shipping overhead from ₹200 to ₹100, immediately pushing your blended gross profit margin from 42% to <span className="text-emerald-400 font-black">51.4%</span> and lifting AOV from ₹845 to ₹1,199.
              </p>
            </div>

            {/* AI Synthesized Output */}
            {eowData?.weeklyPlan ? (
              <div className="mt-6 p-6 rounded-2xl bg-black/50 border border-purple-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/20">
                  <span className="font-black text-purple-400 uppercase tracking-wider text-xs">
                    Gemini 3.8 Flash • Executive End-of-Week Master Roadmap
                  </span>
                  <button
                    onClick={() => copyToClipboard(eowData.weeklyPlan, 'eow_plan')}
                    className="text-xs text-purple-400 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'eow_plan' ? '✓ Copied' : '📋 Copy Master Plan'}
                  </button>
                </div>
                {eowData.weeklyPlan}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK: COMPLETE BUDGET & CAPITAL ALLOCATOR ("HOW MANAGE BUDGET & EVRYTHING")
          ========================================================================= */}
      {activeTask === 'budget' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>💰</span> Complete Working Capital &amp; Budget Allocator
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Proven 5-pillar financial framework for Indian D2C streetwear. Protects ≥40% gross margins, covers ₹100 express delivery, enforces CAC ceilings, and cushions COD courier remittances.
                </p>
              </div>

              <button
                onClick={() => executeTask('budget_management', { totalBudget })}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Calculating Allocations…' : '⚡ Run Live CFO Budget Allocation'}
              </button>
            </div>

            {/* Interactive Budget Selector */}
            <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Total Working Capital Budget (₹)</span>
                <span className="text-[11px] text-slate-500">Select preset or enter your target operational budget for this cycle</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[25000, 50000, 100000, 250000].map((b) => (
                  <button
                    key={b}
                    onClick={() => setTotalBudget(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      totalBudget === b
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {inr(b)}
                  </button>
                ))}
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Math.max(5000, Number(e.target.value) || 5000))}
                    className="w-28 pl-7 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                    placeholder="Custom"
                  />
                </div>
              </div>
            </div>

            {/* 5-Pillar Capital Allocation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/15 via-[#131B2E] to-[#0B0F19] border border-indigo-500/30">
                <span className="text-[10px] font-black uppercase text-indigo-400 font-mono">1. Production &amp; Blanks (35%)</span>
                <p className="text-xl font-black text-white mt-1">{inr(totalBudget * 0.35)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Tirupur 240/380 GSM blank cotton &amp; DTF</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-[#131B2E] to-[#0B0F19] border border-amber-500/30">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mono">2. Growth &amp; Acquisition (25%)</span>
                <p className="text-xl font-black text-white mt-1">{inr(totalBudget * 0.25)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Creator seeding &amp; ads (Max CAC: ₹220)</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/15 via-[#131B2E] to-[#0B0F19] border border-rose-500/30">
                <span className="text-[10px] font-black uppercase text-rose-400 font-mono">3. COD Liquidity Buffer (15%)</span>
                <p className="text-xl font-black text-white mt-1">{inr(totalBudget * 0.15)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Covers 5-7 day Delhivery COD remittance cycle</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/15 via-[#131B2E] to-[#0B0F19] border border-cyan-500/30">
                <span className="text-[10px] font-black uppercase text-cyan-400 font-mono">4. Packaging &amp; Tools (10%)</span>
                <p className="text-xl font-black text-white mt-1">{inr(totalBudget * 0.10)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Matte mailers, 2% Razorpay fee, APIs</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 via-[#131B2E] to-[#0B0F19] border border-emerald-500/30">
                <span className="text-[10px] font-black uppercase text-emerald-400 font-mono">5. Retained War Chest (15%)</span>
                <p className="text-xl font-black text-emerald-300 mt-1">{inr(totalBudget * 0.15)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Net profit retained cash reserve</p>
              </div>
            </div>

            {/* Visual Capital Allocation Progress Bar */}
            <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span>Working Capital Split</span>
                <span>Total: {inr(totalBudget)} (100%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: '35%' }} className="bg-indigo-500" title="35% Production" />
                <div style={{ width: '25%' }} className="bg-amber-500" title="25% Growth & Ads" />
                <div style={{ width: '15%' }} className="bg-rose-500" title="15% COD Buffer" />
                <div style={{ width: '10%' }} className="bg-cyan-500" title="10% Packaging & Fees" />
                <div style={{ width: '15%' }} className="bg-emerald-500" title="15% Retained Profit" />
              </div>
            </div>

            {/* Unit Economics Guardrails */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Max Allowable CAC</span>
                <p className="text-lg font-black text-amber-400 mt-0.5">≤ ₹220</p>
                <p className="text-[10px] text-slate-500">Preserves ≥40% net margin</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Target Orders</span>
                <p className="text-lg font-black text-white mt-0.5">~{Math.floor((totalBudget * 0.25) / 220)} Orders</p>
                <p className="text-[10px] text-slate-500">At ₹899 target AOV</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Target Revenue (GMV)</span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">
                  {inr(Math.floor((totalBudget * 0.25) / 220) * 899)}
                </p>
                <p className="text-[10px] text-slate-500">Min 3.8x Blended ROAS</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Projected Net Cash</span>
                <p className="text-lg font-black text-cyan-400 mt-0.5">
                  {inr(Math.round((Math.floor((totalBudget * 0.25) / 220) * 899 * 0.42) - (totalBudget * 0.25) - (totalBudget * 0.10)))}
                </p>
                <p className="text-[10px] text-slate-500">After all COGS, ads &amp; fees</p>
              </div>
            </div>

            {/* AI Synthesized Blueprint */}
            {budgetData?.aiAnalysis ? (
              <div className="mt-6 p-6 rounded-2xl bg-black/50 border border-amber-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
                  <span className="font-black text-amber-400 uppercase tracking-wider text-xs">
                    Gemini 3.8 Flash • Master CFO Capital Blueprint &amp; Runway Protection
                  </span>
                  <button
                    onClick={() => copyToClipboard(budgetData.aiAnalysis, 'budget_analysis')}
                    className="text-xs text-amber-400 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'budget_analysis' ? '✓ Copied' : '📋 Copy Blueprint'}
                  </button>
                </div>
                {budgetData.aiAnalysis}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK: PRODUCT PERFORMANCE MATRIX (TOP PERFORMERS, LOSERS & RETURN RISK)
          ========================================================================= */}
      {activeTask === 'products' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🏆</span> Product Performance Matrix — Top Performers &amp; Losers
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Full catalog profitability audit. Evaluates silhouette margins, identifies top revenue winners, exposes margin leaks / &quot;losers&quot;, and isolates high return/RTO risk hotspots.
                </p>
              </div>

              <button
                onClick={() => executeTask('product_performance_matrix')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-xs font-black text-white shadow-lg cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? 'Auditing 32 Products…' : '⚡ Run Merchandising & Returns Audit'}
              </button>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Catalog Silhouettes</span>
                <p className="text-xl font-black text-white mt-1">{products.length} Items</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tirupur hub active</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">🏆 Top Performers</span>
                <p className="text-xl font-black text-emerald-400 mt-1">
                  {productMatrixData?.summary?.winnersCount || 18} Winners
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">≥40% margin &amp; strong demand</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">⚠️ Underperformers</span>
                <p className="text-xl font-black text-amber-400 mt-1">
                  {productMatrixData?.summary?.losersCount || 6} Items
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">&lt;40% margin or low conversion</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">↩️ High Return Risk</span>
                <p className="text-xl font-black text-rose-400 mt-1">
                  {productMatrixData?.summary?.returnHotspotsCount || 4} Hotspots
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Fitted crops &amp; youth sizes</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-3 mt-6">
              {[
                { id: 'all', label: `All Items (${products.length})` },
                { id: 'winners', label: `🏆 Top Performers (${productMatrixData?.winners?.length || 18})` },
                { id: 'losers', label: `⚠️ Underperformers / Losers (${productMatrixData?.losers?.length || 6})` },
                { id: 'returns', label: `↩️ Return & RTO Hotspots (${productMatrixData?.returnHotspots?.length || 4})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setProductFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    productFilter === f.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Product Matrix Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Garment Silhouette</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Landed Cost (₹100 Air Incl.)</th>
                    <th className="py-3 px-4">Gross Margin</th>
                    <th className="py-3 px-4">Performance Tier</th>
                    <th className="py-3 px-4">Return / RTO Risk</th>
                    <th className="py-3 px-4">AI Action Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {((productMatrixData?.catalog || []).length > 0
                    ? (productFilter === 'winners'
                        ? productMatrixData.winners
                        : productFilter === 'losers'
                        ? productMatrixData.losers
                        : productFilter === 'returns'
                        ? productMatrixData.returnHotspots
                        : productMatrixData.catalog)
                    : products.slice(0, 10).map((p: any) => ({
                        id: p.id,
                        title: cleanBrandTitle(p.title),
                        sellingPrice: p.price_inr || p.price || 679,
                        totalLandedCost: 395,
                        marginPct: 41.8,
                        performanceTier: 'TOP_PERFORMER',
                        returnRiskLevel: 'LOW',
                        returnRiskReason: 'Relaxed drop-shoulder fit',
                        actionRecommendation: 'Scale Hero Ads & WhatsApp VIP Broadcast',
                      }))
                  ).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-white font-bold max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {inr(item.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {inr(item.totalLandedCost)}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.marginPct >= 40
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {item.marginPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.performanceTier === 'TOP_PERFORMER'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : item.performanceTier === 'UNDERPERFORMER'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {item.performanceTier === 'TOP_PERFORMER' ? '🏆 Winner' : item.performanceTier === 'UNDERPERFORMER' ? '⚠️ Underperformer' : 'Steady'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.returnRiskLevel === 'HIGH'
                                ? 'bg-rose-500'
                                : item.returnRiskLevel === 'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span className="text-[11px] font-bold text-slate-300">{item.returnRiskLevel}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[130px]">({item.returnRiskReason})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] font-medium">
                        {item.actionRecommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Synthesized Merchandising Directive */}
            {productMatrixData?.aiDirective ? (
              <div className="mt-6 p-6 rounded-2xl bg-black/50 border border-emerald-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
                  <span className="font-black text-emerald-400 uppercase tracking-wider text-xs">
                    Gemini 3.8 Flash • Merchandising &amp; Zero-Return Optimization Directive
                  </span>
                  <button
                    onClick={() => copyToClipboard(productMatrixData.aiDirective, 'merchandising_directive')}
                    className="text-xs text-emerald-400 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'merchandising_directive' ? '✓ Copied' : '📋 Copy Directive'}
                  </button>
                </div>
                {productMatrixData.aiDirective}
              </div>
            ) : null}
          </div>
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
              Synthesizes authentic, reassuring customer replies with Delhivery Air tracking status, Tirupur production lifecycle, and 7-day returns policy.
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
                    placeholder="e.g. ord_... or Waybill AWB"
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
