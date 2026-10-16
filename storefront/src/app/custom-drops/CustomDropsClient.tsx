'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MerchAgentModal } from '@/components/ai/MerchAgentModal';

type ProductType = 'tee' | 'hoodie' | 'mat';

interface PricingTier {
  min: number;
  max: number;
  teePrice: number;
  hoodiePrice: number;
  matPrice: number;
}

const PRICING_TIERS: PricingTier[] = [
  { min: 25, max: 50, teePrice: 399, hoodiePrice: 699, matPrice: 449 },
  { min: 51, max: 100, teePrice: 349, hoodiePrice: 649, matPrice: 399 },
  { min: 101, max: 250, teePrice: 299, hoodiePrice: 599, matPrice: 349 },
  { min: 251, max: 1000, teePrice: 269, hoodiePrice: 549, matPrice: 299 },
];

export function CustomDropsClient() {
  const [productType, setProductType] = useState<ProductType>('tee');
  const [quantity, setQuantity] = useState<number>(35);
  const [orgName, setOrgName] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isAiAgentOpen, setIsAiAgentOpen] = useState<boolean>(false);

  // Calculate pricing based on tier
  const tier = PRICING_TIERS.find((t) => quantity >= t.min && quantity <= t.max) || PRICING_TIERS[0];
  
  const unitPrice =
    productType === 'tee'
      ? tier.teePrice
      : productType === 'hoodie'
      ? tier.hoodiePrice
      : tier.matPrice;

  const retailPrice =
    productType === 'tee' ? 699 : productType === 'hoodie' ? 1499 : 899;

  const totalEstimate = unitPrice * quantity;
  const totalRetail = retailPrice * quantity;
  const totalSavings = totalRetail - totalEstimate;

  const getProductName = () => {
    if (productType === 'tee') return '240 GSM Heavyweight Oversized Tee';
    if (productType === 'hoodie') return '380 GSM Heavyweight Fleece Hoodie';
    return '900x400mm Extended Gaming Desk Mat';
  };

  const generateWhatsAppUrl = () => {
    const text = encodeURIComponent(
      `👋 Hi RareEmber Team! I want a custom bulk quote:\n\n` +
      `• Organization / College: ${orgName || 'College Club / Startup'}\n` +
      `• Contact Person: ${contactName || 'Lead Organizer'}\n` +
      `• Product: ${getProductName()}\n` +
      `• Quantity: ${quantity} units\n` +
      `• Target Event Date: ${eventDate || 'Next 2-3 weeks'}\n` +
      `• Estimated Budget: ₹${totalEstimate.toLocaleString('en-IN')}\n\n` +
      `Please share free digital mockups & dispatch timeline!`
    );
    // WhatsApp direct link to RareEmber Founder line
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
    return waNumber ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <main className="page-top min-h-screen text-[#161311] pb-24 bg-[#FFFBF5]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#121110] text-white py-16 px-4 md:px-8 border-b border-white/10">
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <span
            className="aurora-blob"
            style={{ width: 400, height: 400, top: -150, right: -100, background: 'rgba(255,77,36,0.35)' }}
          />
          <span
            className="aurora-blob"
            style={{ width: 350, height: 350, bottom: -100, left: -50, background: 'rgba(14,165,233,0.25)' }}
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#FF4D24]/40 text-[#FF9A3D] text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <span>⚡</span> B2B Campus &amp; Startup Merch Engine
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Custom High-Grade Merch for <br className="hidden sm:inline" />
            <span className="text-gradient-ember-animated">Hackathons, Fests &amp; Startups</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base text-white/70 font-medium leading-relaxed">
            Zero setup fees. 100% Combed Heavyweight Cotton (240 GSM) &amp; Fleece (380 GSM). 
            High-Definition fade-proof DTF prints. Dispatched direct from our Tirupur domestic hub in 4–6 days.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-white/80">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              ✅ Zero Setup or Screen Fees
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              ⚡ Free 3D Mockup in 2 Hours
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              🚚 Pan-India Express Door Delivery
            </span>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsAiAgentOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4D24] via-[#ff3b0f] to-[#E8244B] text-white font-black text-xs uppercase tracking-wider shadow-[0_8px_25px_rgba(255,77,36,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <span>🤖 Talk to B2B Merch AI • Instant Quote &amp; 20% Advance</span>
            </button>
            <a
              href="#estimator"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all no-underline text-center"
            >
              Bulk Calculator ↓
            </a>
          </div>
        </div>
      </section>

      {/* CALCULATOR & ESTIMATOR */}
      <section id="estimator" className="max-w-5xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-black/[0.08]">
          <div className="border-b border-black/[0.06] pb-6 mb-8">
            <h2 className="text-xl md:text-3xl font-black text-[#161311] tracking-tight">
              Instant Bulk Price Estimator
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 mt-1">
              Select your merchandise type and quantity to see live transparent factory-direct bulk pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT CONFIGURATOR (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2.5">
                  1. Choose Apparel / Setup Gear
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setProductType('tee')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      productType === 'tee'
                        ? 'border-[#FF4D24] bg-[#FF4D24]/[0.04] ring-2 ring-[#FF4D24]/20'
                        : 'border-black/[0.08] hover:border-black/20 bg-neutral-50/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">👕</span>
                    <span className="block font-black text-xs text-neutral-900">240 GSM Oversized Tee</span>
                    <span className="block text-[11px] text-[#FF4D24] font-bold mt-0.5">From ₹269/unit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductType('hoodie')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      productType === 'hoodie'
                        ? 'border-[#FF4D24] bg-[#FF4D24]/[0.04] ring-2 ring-[#FF4D24]/20'
                        : 'border-black/[0.08] hover:border-black/20 bg-neutral-50/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">🧥</span>
                    <span className="block font-black text-xs text-neutral-900">380 GSM Fleece Hoodie</span>
                    <span className="block text-[11px] text-[#FF4D24] font-bold mt-0.5">From ₹549/unit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductType('mat')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      productType === 'mat'
                        ? 'border-[#FF4D24] bg-[#FF4D24]/[0.04] ring-2 ring-[#FF4D24]/20'
                        : 'border-black/[0.08] hover:border-black/20 bg-neutral-50/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">🖥️</span>
                    <span className="block font-black text-xs text-neutral-900">900x400 Desk Mat</span>
                    <span className="block text-[11px] text-[#FF4D24] font-bold mt-0.5">From ₹299/unit</span>
                  </button>
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    2. Quantity (Min: 25 Units)
                  </label>
                  <span className="text-xs font-black text-[#FF4D24] bg-[#FF4D24]/10 px-2.5 py-0.5 rounded-full">
                    {quantity} Units Selected
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {[25, 35, 50, 100, 200, 350].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        quantity === preset
                          ? 'bg-[#161311] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="25"
                  max="500"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-[#FF4D24] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-bold text-neutral-400 mt-1">
                  <span>25 units</span>
                  <span>100 units</span>
                  <span>250 units</span>
                  <span>500+ units</span>
                </div>
              </div>

              {/* Details List */}
              <div className="bg-[#FFFBF5] rounded-2xl p-4 border border-black/[0.06] space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-700">
                  <span>✨ <b>Fabric Specs:</b></span>
                  <span className="font-semibold text-neutral-900">
                    {productType === 'tee' ? '240 GSM Combed Cotton (Bio-Washed)' : productType === 'hoodie' ? '380 GSM Heavy French Terry Brushed' : '4mm Micro-Weave Rubber Backing'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>🎨 <b>Print Technology:</b></span>
                  <span className="font-semibold text-neutral-900">OEKO-TEX Certified HD DTF (Chest + Back)</span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>⚡ <b>Dispatch Lead Time:</b></span>
                  <span className="font-semibold text-emerald-700">4–6 Working Days Direct to Campus/Office</span>
                </div>
              </div>
            </div>

            {/* RIGHT SUMMARY CARD (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#1c1917] to-[#0c0a09] text-white rounded-3xl p-6 md:p-7 shadow-xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF9A3D]">Tier Quotation</span>
                  <h3 className="text-xl font-black">{getProductName()}</h3>
                </div>
                <span className="text-2xl">🔥</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-white/70">
                  <span>Bulk Tier Unit Price:</span>
                  <span className="text-base font-black text-white">₹{unitPrice}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Standard Retail Value:</span>
                  <span className="line-through text-white/40">₹{totalRetail.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Your Bulk Club Savings:</span>
                  <span>- ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Screen &amp; Setup Fee:</span>
                  <span className="text-emerald-400 font-bold">₹0 (FREE)</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Pan-India Air Logistics:</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-white/60 block">Total Estimated Cost:</span>
                  <span className="text-2xl md:text-3xl font-black text-gradient-ember-animated">
                    ₹{totalEstimate.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] font-black text-white/60 bg-white/10 px-2.5 py-1 rounded-full uppercase">
                  100% Prepaid
                </span>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAiAgentOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF4D24] via-[#ff3b0f] to-[#f59e0b] hover:opacity-95 text-white font-black text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-xl active:scale-95"
                >
                  <span>🤖</span>
                  <span>Negotiate &amp; Lock 20% Advance via AI Agent</span>
                </button>

                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 transition-all no-underline shadow-lg cursor-pointer"
                >
                  <span>💬</span>
                  <span>Lock Quote on WhatsApp (Instant)</span>
                </a>

                <p className="text-[10px] text-center text-white/50">
                  ⚡ 20% advance booking reserves fabric batch. Remaining 80% on dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INQUIRY FORM */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 mt-16">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/[0.08] shadow-sm">
          <div className="text-center space-y-1.5 mb-6">
            <h3 className="text-xl md:text-2xl font-black text-[#161311]">
              Need a Custom Spec or Sample Delivered?
            </h3>
            <p className="text-xs text-neutral-500">
              Drop your club or event details below and our production desk will send 3D proofs within 2 hours.
            </p>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3"
            >
              <span className="text-3xl block">🎉</span>
              <h4 className="font-black text-emerald-900 text-base">Inquiry Received!</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Thank you, <b>{contactName || 'Organizer'}</b>! Founder Ajay Rajbhar will reach out on WhatsApp (<b>{phone}</b>) within 2 hours with digital design mockups and payment link for <b>{orgName || 'your team'}</b>.
              </p>
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs no-underline"
              >
                Speed up on WhatsApp →
              </a>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">College Club / Startup Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RVCE Coding Club, HackFest, Acme Tech"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] focus:outline-none focus:border-[#FF4D24] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma (Club Lead)"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] focus:outline-none focus:border-[#FF4D24] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] focus:outline-none focus:border-[#FF4D24] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Target Event Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 15th, 2026"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] focus:outline-none focus:border-[#FF4D24] text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#161311] hover:bg-black text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Request Free 3D Design Proof &amp; Spec Sheet ➔
              </button>
            </form>
          )}
        </div>
      </section>

      {/* WHY RAREMBER SECTION */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mt-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF4D24]">Factory Direct Moat</span>
          <h3 className="text-2xl md:text-4xl font-black text-[#161311]">
            Why 100+ Organizers Trust RareEmber
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] space-y-3">
            <span className="text-3xl block">🏭</span>
            <h4 className="font-black text-sm text-neutral-900">Direct From Tirupur Hub</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              No middlemen, no Delhi retail resellers. We manufacture and print directly at Tamil Nadu&apos;s knitwear capital with strict GSM control.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] space-y-3">
            <span className="text-3xl block">🛡️</span>
            <h4 className="font-black text-sm text-neutral-900">100% Pre-Shrunk &amp; Bio-Washed</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Zero shrinkage after washing. 240+ GSM heavyweight drop-shoulder contemporary silhouette loved by developers and Gen-Z creators.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] space-y-3">
            <span className="text-3xl block">🚀</span>
            <h4 className="font-black text-sm text-neutral-900">Guaranteed Event Timelines</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We understand hackathon deadlines. We partner with BlueDart Air and Delhivery Surface to guarantee delivery before your event start date.
            </p>
          </div>
        </div>
      </section>

      {/* FLOATING AI AGENT BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsAiAgentOpen(true)}
          className="px-5 py-3 rounded-full bg-[#161311] text-white hover:bg-black font-black text-xs uppercase tracking-wider shadow-2xl border border-white/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ring-2 ring-[#FF4D24]/50"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>🤖 AI Merch Specialist</span>
          <span className="text-[#FF9A3D]">⚡</span>
        </button>
      </div>

      {/* AI AGENT MODAL */}
      <MerchAgentModal
        isOpen={isAiAgentOpen}
        onClose={() => setIsAiAgentOpen(false)}
        defaultProduct={productType}
        defaultQty={quantity}
      />
    </main>
  );
}
