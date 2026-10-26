'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function ReturnsClient() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [reason, setReason] = useState('Size Mismatch (Need Different Size)');
  const [preference, setPreference] = useState('Free Doorstep Replacement (Recommended)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    claimId: string;
    message: string;
    status?: string;
    isStoreCredit?: boolean;
    reservedCreditAmount?: number;
    storeCreditCode?: string;
    storeCreditAmount?: number;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const qOrder = searchParams.get('order_id') || searchParams.get('orderId');
    const qEmail = searchParams.get('email');
    if (qOrder) setOrderId(qOrder);
    if (qEmail) setContact(qEmail);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanOrderId = orderId.trim();
    const cleanContact = contact.trim();

    if (!cleanOrderId) {
      return setError('Please enter your Order ID (from your confirmation receipt or SMS).');
    }
    if (!cleanContact || (!cleanContact.includes('@') && cleanContact.replace(/\D/g, '').length < 10)) {
      return setError('Please enter a valid Email address or 10-digit mobile number.');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cleanOrderId,
          contact: cleanContact,
          reason,
          preference,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to submit claim. Please try again.');
        setSubmitting(false);
        return;
      }

      setClaimResult({
        claimId: data.claimId || 'RE-CLM-7842',
        message: data.message || 'Claim received! We will process your replacement within 24 hours.',
        status: data.status,
        isStoreCredit: data.isStoreCredit,
        reservedCreditAmount: data.reservedCreditAmount || data.storeCreditAmount,
        storeCreditAmount: data.storeCreditAmount || data.reservedCreditAmount,
        storeCreditCode: data.storeCreditCode,
      });
    } catch {
      setError('Network error while submitting. Please email support@rareember.shop directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto pt-6 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-bold text-neutral-800 shadow-xs mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Zero-Hassle 7-Day Guarantee
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
          7-Day Easy Returns Policy
        </h1>
        <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
          Wrong size? Defective print? Damaged in courier? We make it right immediately with <b>7-Day Easy Returns</b> or full refund.
        </p>
      </div>

      {/* 3-Step Process Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-black/[0.06] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-900 flex items-center justify-center text-xl font-black mb-4">
            01
          </div>
          <h3 className="text-base font-bold text-neutral-950 mb-2">1-Minute Claim</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Fill out the simple form below with your Order ID and issue reason within 7 days of package delivery.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-black/[0.06] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-900 flex items-center justify-center text-xl font-black mb-4">
            02
          </div>
          <h3 className="text-base font-bold text-neutral-950 mb-2">Doorstep 1-to-1 Exchange</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            For size exchanges, simply hand over the original unworn piece with tags intact to the courier partner upon delivery.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-black/[0.06] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-900 flex items-center justify-center text-xl font-black mb-4">
            03
          </div>
          <h3 className="text-base font-bold text-neutral-950 mb-2">Defect Guarantee</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Defective print or transit damage? 100% Free reprint covered directly with quick photo verification.
          </p>
        </div>
      </div>

      {/* Interactive Replacement Claim Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-12">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/[0.06]">
          <div className="w-10 h-10 rounded-2xl bg-[#FF4D24]/10 text-[#FF4D24] flex items-center justify-center text-lg font-black">
            ⚡
          </div>
          <div>
            <h2 className="text-lg font-black text-neutral-950">
              Submit 7-Day Return Request
            </h2>
            <p className="text-xs text-neutral-500">
              Directly connected to our warehouse dispatch queue for 24-hour turnaround.
            </p>
          </div>
        </div>

        {claimResult ? (
          claimResult.isStoreCredit || claimResult.status === 'pending_pickup' ? (
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-6 shadow-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                🔒 110% Store Credit Reserved — Pending Courier Pickup Scan
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest block">
                  Atelier Return Claim #{claimResult.claimId}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-neutral-950">
                  ₹{claimResult.reservedCreditAmount || claimResult.storeCreditAmount} Store Credit Locked to Claim #{claimResult.claimId}
                </h3>
              </div>

              <p className="text-sm text-neutral-700 max-w-xl mx-auto leading-relaxed font-medium">
                Your ₹{claimResult.reservedCreditAmount || claimResult.storeCreditAmount} Store Credit (110% Value — 100% Order Value + 10% Atelier Bonus) has been generated and locked to Claim #{claimResult.claimId}! Our courier partner will pick up your unworn original piece (or verify your claim via our Atelier Desk), and your instant single-use voucher code will be activated and dispatched via Email &amp; WhatsApp immediately upon pickup scan.
              </p>

              {/* Security & Pickup Status Stepper */}
              <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left pt-2">
                <div className="p-4 rounded-2xl bg-white border border-black/[0.08] shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">✓</span>
                    <span className="text-xs font-bold text-neutral-900">1. Claim Reserved</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    110% Store credit amount cryptographically generated &amp; secured.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black flex items-center justify-center">⚡</span>
                    <span className="text-xs font-bold text-amber-950">2. Courier Pickup</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    Courier scans unworn original garment at your doorstep.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] opacity-80">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-300 text-neutral-600 text-[10px] font-black flex items-center justify-center">🔒</span>
                    <span className="text-xs font-bold text-neutral-600">3. Instant Voucher</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    Single-use code unlocked &amp; dispatched via Email &amp; WhatsApp.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-lg mx-auto text-xs text-amber-900 leading-relaxed">
                🛡️ <b>Anti-Fraud Guarantee:</b> To prevent duplicate inventory loss, active voucher codes unlock immediately once courier reverse pickup scan is recorded.
              </div>

              <div className="pt-2 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/track"
                  className="px-6 py-3 rounded-xl bg-[#161311] text-white text-xs font-black no-underline hover:bg-neutral-800 transition-all shadow-md"
                >
                  Track Claim &amp; Reverse Pickup Status →
                </Link>
                <button
                  type="button"
                  onClick={() => setClaimResult(null)}
                  className="px-5 py-3 rounded-xl bg-white text-neutral-800 text-xs font-bold border border-black/10 hover:bg-neutral-50 transition-all cursor-pointer"
                >
                  File Another Request
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-800 block">TICKET CONFIRMED</span>
              <h3 className="text-xl font-black text-emerald-900">
                Claim Registered Successfully
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Ticket ID: <strong className="font-mono text-sm px-2 py-1 bg-white rounded-lg border border-emerald-400">{claimResult.claimId}</strong>
              </p>
              <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                {claimResult.message} Our support team has received your ticket and will verify via WhatsApp or email to dispatch your replacement.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/track"
                  className="px-5 py-2.5 rounded-lg bg-[#161311] text-white text-xs font-bold no-underline hover:bg-neutral-800 transition-all"
                >
                  Track Your Orders →
                </Link>
                <button
                  type="button"
                  onClick={() => setClaimResult(null)}
                  className="px-5 py-2.5 rounded-lg bg-white text-neutral-800 text-xs font-bold border border-black/10 cursor-pointer"
                >
                  File Another Request
                </button>
              </div>
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <span>Error:</span> {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Order ID *
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. 6c7e6415 or from confirmation receipt"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-black/15 bg-neutral-50/70 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Registered Email or Phone *
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@email.com or 10-digit mobile number"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-black/15 bg-neutral-50/70 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Reason for Request *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-black/15 bg-neutral-50/70 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="Size Mismatch (Need Different Size)">Size Mismatch (Need 1 Size Up/Down)</option>
                  <option value="Print Defect or Misalignment">Print Defect or Misalignment</option>
                  <option value="Damaged in Courier Transit">Damaged / Torn in Courier Transit</option>
                  <option value="Received Wrong Item or Color">Received Wrong Item or Color</option>
                  <option value="Quality Concern or Stitching Issue">Quality Concern or Stitching Issue</option>
                  <option value="Other Issue">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Preferred Resolution *
                </label>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-black/15 bg-neutral-50/70 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="Doorstep 1-to-1 Exchange (Hand over original piece)">Doorstep 1-to-1 Exchange (Hand over original piece to courier)</option>
                  <option value="Free Defect Reprint (For Print/Fabric Defects)">Free Defect Reprint (100% Free for Defective Print/Tear)</option>
                  <option value="Store Credit + 10% Extra Bonus">Store Credit + 10% Extra Bonus Coupon</option>
                  <option value="Full Refund to Bank / UPI">Full Refund (to Bank / UPI)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Issue Description & Details (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Tell us what went wrong (e.g., 'Ordered Size L, need Size XL for an oversized streetwear look' or 'Print is slightly tilted')."
                className="w-full px-4 py-3 text-sm rounded-xl border border-black/15 bg-neutral-50/70 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all font-medium"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-100 border border-black/[0.08] text-xs text-neutral-700 leading-relaxed space-y-1">
              <div>
                <strong className="font-mono text-[11px] uppercase tracking-wider text-neutral-900">Defects &amp; Damage:</strong> Verified via WhatsApp photo — 100% free reprint dispatched immediately at zero cost.
              </div>
              <div>
                <strong className="font-mono text-[11px] uppercase tracking-wider text-neutral-900">Size Exchanges:</strong> 1-to-1 doorstep handover required. Original unworn garment with tags intact must be handed to the courier partner upon delivery.
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-lg font-bold text-xs uppercase tracking-wider text-white bg-[#FF4D24] hover:bg-[#e03d15] active:scale-[0.99] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting Request…' : 'Submit 7-Day Return Request →'}
            </button>
          </form>
        )}
      </div>

      {/* Detailed Policy Accordion / Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-black/[0.06] shadow-xs mb-10 space-y-8">
        <div>
          <h2 className="text-lg font-black text-neutral-950 mb-2">
            Why 7-Day Returns Guarantee?
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            All Rare Ember garments and creator drops are custom-produced on premium heavyweight blanks at our domestic print factory. Traditional returns take 10–14 days and cost customers reverse courier charges. Instead, our <b>7-Day Easy Returns Guarantee</b> provides an instant resolution or full refund directly to your doorstep with zero friction whenever there is an issue.
          </p>
        </div>

        <div className="border-t border-black/[0.05] pt-6">
          <h2 className="text-lg font-black text-neutral-950 mb-2">
            Size Exchanges vs. Manufacturing Defects
          </h2>
          <ul className="text-xs text-neutral-600 space-y-2 list-disc pl-5 leading-relaxed">
            <li><b>Factory Defects or Damage:</b> 100% Free doorstep replacement with zero cost upon photo verification.</li>
            <li><b>Size Mismatches:</b> To prevent duplicate inventory waste, size exchanges require a 1-to-1 physical handover of the original unworn garment with tags intact to the courier upon delivery of the new size.</li>
          </ul>
        </div>

        <div className="border-t border-black/[0.05] pt-6">
          <h2 className="text-lg font-black text-neutral-950 mb-2">
            Refund Processing Timelines
          </h2>
          <ul className="text-xs text-neutral-600 space-y-2 list-disc pl-5 leading-relaxed">
            <li><b>Prepaid Orders (UPI, Cards, NetBanking):</b> Refunds are credited back to your original source account within 24–48 hours via Razorpay.</li>
            <li><b>Cash on Delivery (COD) Orders:</b> Once your claim is approved, refunds are sent directly via instant UPI transfer (Google Pay, PhonePe, Paytm) or bank NEFT.</li>
          </ul>
        </div>

        <div className="border-t border-black/[0.05] pt-6">
          <h2 className="text-lg font-black text-neutral-950 mb-2">
            Order Cancellations
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Orders can be modified or cancelled within <b>12 hours of placement</b> before the blank enters the automated DTF print and silicone wash queue.
          </p>
        </div>

        <div className="border-t border-black/[0.05] pt-6">
          <h2 className="text-lg font-black text-neutral-950 mb-2">
            Need Immediate Assistance?
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Our 24/7 customer care concierge is available in the bottom corner of your screen, or reach our direct care desk:
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:support@rareember.shop"
              className="px-5 py-2.5 rounded-lg bg-[#12100E] text-white text-xs font-bold hover:bg-black transition-all no-underline shadow-xs"
            >
              Email Care Desk (support@rareember.shop) →
            </a>
            <Link
              href="/track"
              className="px-5 py-2.5 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200 transition-all no-underline"
            >
              Track Active Delivery →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
