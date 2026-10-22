'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const TICKET_CATEGORIES = [
  { id: 'tracking', label: 'Order Tracking & Courier Updates' },
  { id: 'exchange', label: 'Size Exchange & Replacement (7-Day Free Doorstep)' },
  { id: 'defect', label: 'Damaged / Defective Garment Received' },
  { id: 'payment', label: 'Payment Debited But Order Status Pending' },
  { id: 'custom', label: 'Bulk Order & Custom Drops Inquiry' },
  { id: 'cancellation', label: 'Order Cancellation Request' },
  { id: 'other', label: 'Other Inquiries' },
];

const TIME_SLOTS = [
  { id: 'whatsapp', label: 'Message Me on WhatsApp (Direct Chat)' },
  { id: 'morning', label: 'Morning Slot (10:00 AM – 1:00 PM IST)' },
  { id: 'afternoon', label: 'Afternoon Slot (2:00 PM – 5:00 PM IST)' },
  { id: 'evening', label: 'Evening Slot (6:00 PM – 9:00 PM IST)' },
];

export default function SupportClient() {
  const [activeTab, setActiveTab] = useState<'ticket' | 'callback' | 'direct'>('ticket');

  // Ticket form state
  const [ticketName, setTicketName] = useState('');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketCategory, setTicketCategory] = useState(TICKET_CATEGORIES[0].label);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ id: string; sla: string } | null>(null);
  const [ticketError, setTicketError] = useState('');

  // Callback form state
  const [callName, setCallName] = useState('');
  const [callPhone, setCallPhone] = useState('');
  const [callSlot, setCallSlot] = useState(TIME_SLOTS[0].label);
  const [callReason, setCallReason] = useState('');
  const [submittingCall, setSubmittingCall] = useState(false);
  const [callSuccess, setCallSuccess] = useState('');
  const [callError, setCallError] = useState('');

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError('');
    if (!ticketName.trim()) return setTicketError('Please enter your full name.');
    const cleanPhone = ticketPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return setTicketError('Please enter a valid 10-digit mobile number.');
    if (!ticketEmail.includes('@') || !ticketEmail.includes('.')) return setTicketError('Please enter a valid email address.');
    if (!ticketSubject.trim()) return setTicketError('Please enter a subject.');
    if (!ticketMessage.trim() || ticketMessage.trim().length < 5) return setTicketError('Please provide more details in your message.');

    setSubmittingTicket(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ticketName,
          phone: cleanPhone,
          email: ticketEmail,
          orderId: ticketOrderId,
          category: ticketCategory,
          subject: ticketSubject,
          message: ticketMessage,
          priority: ticketPriority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');
      setTicketResult({ id: data.ticketId, sla: data.sla || '12 Hours' });
    } catch (err: any) {
      setTicketError(err.message || 'Submission error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCallError('');
    if (!callName.trim()) return setCallError('Please enter your name.');
    const cleanPhone = callPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return setCallError('Please enter a valid 10-digit mobile number.');

    setSubmittingCall(true);
    try {
      const res = await fetch('/api/support/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: callName,
          phone: cleanPhone,
          slot: callSlot,
          reason: callReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request callback');
      setCallSuccess(data.message || 'Callback request registered!');
    } catch (err: any) {
      setCallError(err.message || 'Request failed');
    } finally {
      setSubmittingCall(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* SLA & Brand Guarantee Hero */}
      <div className="rounded-2xl bg-[#12100E] text-white p-6 sm:p-10 border border-white/10 shadow-xl">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D24]" />
            <span>Dedicated Care & Operations</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Rare Ember Care Desk
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
            Direct customer assistance for orders, size exchanges, custom drops, and tracking inquiries. Raise a ticket, request a direct callback, or contact operations directly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-300">
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded border border-white/10 font-mono text-[11px]">
              <span className="text-[#FF4D24] font-bold">SLA:</span> Guaranteed Reply Within 12 Hours
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded border border-white/10 font-mono text-[11px]">
              <span className="text-[#FF4D24] font-bold">POLICY:</span> 7-Day Free Doorstep Replacement
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded border border-white/10 font-mono text-[11px]">
              <span className="text-[#FF4D24] font-bold">SECURE:</span> 256-Bit SSL Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center p-1 rounded-xl bg-white border border-black/[0.08] shadow-xs max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ticket')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ticket'
              ? 'bg-[#12100E] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-950'
          }`}
        >
          Raise Ticket
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('callback')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'callback'
              ? 'bg-[#12100E] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-950'
          }`}
        >
          Request Callback
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('direct')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'direct'
              ? 'bg-[#12100E] text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-950'
          }`}
        >
          Direct Channels
        </button>
      </div>

      {/* TAB 1: RAISE A SUPPORT TICKET */}
      {activeTab === 'ticket' && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-black/[0.08] shadow-sm space-y-6">
          {ticketResult ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-lg mx-auto font-mono font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                  Ticket Registered
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
                  Ticket #{ticketResult.id}
                </h2>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  Your ticket has been logged with operations. We will reply to <strong className="text-neutral-900">{ticketEmail}</strong> and <strong className="text-neutral-900">+91 {ticketPhone}</strong> within <span className="text-[#FF4D24] font-bold">12 hours</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-black/[0.06] max-w-md mx-auto text-xs text-neutral-600 space-y-1 text-left">
                <p><strong>Category:</strong> {ticketCategory}</p>
                <p><strong>Subject:</strong> {ticketSubject}</p>
                {ticketOrderId && <p><strong>Order ID:</strong> #{ticketOrderId}</p>}
                <p><strong>Status:</strong> <span className="text-emerald-700 font-bold">Assigned to Operations (Pending 12h SLA)</span></p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTicketResult(null);
                    setTicketSubject('');
                    setTicketMessage('');
                  }}
                  className="px-5 py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition-all cursor-pointer"
                >
                  Raise Another Ticket
                </button>
                <Link
                  href="/track"
                  className="px-5 py-2.5 rounded-lg bg-[#12100E] hover:bg-black text-white text-xs font-bold transition-all no-underline"
                >
                  Track Order Status →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-5">
              <div className="border-b border-black/[0.06] pb-4">
                <h2 className="text-xl font-bold text-neutral-950">
                  Raise a Support Ticket
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  All inquiries receive a direct response from our operations team within 12 hours.
                </p>
              </div>

              {ticketError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {ticketError}
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Your Full Name <span className="text-[#FF4D24]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Mobile Number (10-Digit) <span className="text-[#FF4D24]">*</span>
                  </label>
                  <div className="flex rounded-lg border border-black/10 bg-neutral-50 overflow-hidden focus-within:border-[#FF4D24] focus-within:bg-white transition-all">
                    <span className="inline-flex items-center px-3 bg-neutral-100 text-neutral-600 text-xs font-mono font-bold border-r border-black/10">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={ticketPhone}
                      onChange={(e) => setTicketPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full px-3 py-3 text-sm bg-transparent text-neutral-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-[#FF4D24]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Related Order ID <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={ticketOrderId}
                    onChange={(e) => setTicketOrderId(e.target.value)}
                    placeholder="e.g. 27e06004"
                    className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Issue Category <span className="text-[#FF4D24]">*</span>
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white cursor-pointer"
                  >
                    {TICKET_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white cursor-pointer"
                  >
                    <option value="Normal">Normal (Standard 12h)</option>
                    <option value="Urgent">Urgent (Priority Dispatch)</option>
                  </select>
                </div>
              </div>

              {/* Subject & Message */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Subject / Summary <span className="text-[#FF4D24]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Size M too snug, request size exchange to L"
                  className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Detailed Message / Description <span className="text-[#FF4D24]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Please describe your question or issue in detail..."
                  className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white transition-all resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="w-full py-4 px-6 rounded-lg bg-[#FF4D24] hover:bg-[#e03d15] text-white font-bold text-xs uppercase tracking-wider shadow-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingTicket ? (
                    <>Submitting Ticket to Operations Desk...</>
                  ) : (
                    <>Submit Ticket (12h Reply SLA) →</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: REQUEST AN INSTANT CALLBACK */}
      {activeTab === 'callback' && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-black/[0.08] shadow-sm space-y-6">
          <div className="border-b border-black/[0.06] pb-4">
            <h2 className="text-xl font-bold text-neutral-950">
              Request a Direct Callback
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Prefer speaking directly? Enter your contact information and our operations desk will reach you during your requested window.
            </p>
          </div>

          {callSuccess ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-wider block">CONFIRMED</span>
              <h3 className="text-lg font-bold text-emerald-900">Callback Request Registered</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">{callSuccess}</p>
              <button
                type="button"
                onClick={() => setCallSuccess('')}
                className="mt-2 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer"
              >
                Request Another Call
              </button>
            </div>
          ) : (
            <form onSubmit={handleCallbackSubmit} className="space-y-4">
              {callError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {callError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-[#FF4D24]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={callName}
                    onChange={(e) => setCallName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-[#FF4D24]">*</span>
                  </label>
                  <div className="flex rounded-lg border border-black/10 bg-neutral-50 overflow-hidden focus-within:border-[#FF4D24] focus-within:bg-white">
                    <span className="inline-flex items-center px-3 bg-neutral-100 text-neutral-600 text-xs font-mono font-bold border-r border-black/10">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={callPhone}
                      onChange={(e) => setCallPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full px-3 py-3 text-sm bg-transparent text-neutral-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Preferred Call Time Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setCallSlot(slot.label)}
                      className={`p-3 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer ${
                        callSlot === slot.label
                          ? 'border-[#FF4D24] bg-[#FF4D24]/10 text-[#FF4D24]'
                          : 'border-black/10 bg-neutral-50 text-neutral-700 hover:border-black/20'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Inquiry Topic <span className="text-neutral-400 font-normal">(Brief Note)</span>
                </label>
                <input
                  type="text"
                  value={callReason}
                  onChange={(e) => setCallReason(e.target.value)}
                  placeholder="e.g. Sizing questions, bulk order discount, order delivery timing"
                  className="w-full px-4 py-3 text-sm rounded-lg border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingCall}
                className="w-full py-3.5 px-6 rounded-lg bg-[#12100E] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingCall ? 'Registering Request…' : 'Confirm Callback Request →'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: DIRECT CHANNELS */}
      {activeTab === 'direct' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Instagram Card */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 block">SOCIAL</span>
                <h3 className="text-base font-bold text-neutral-950">Instagram Official</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Follow <strong>@rareember</strong> for drop announcements, production updates, and styling archives.
                </p>
              </div>
              <a
                href="https://instagram.com/rareember"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg bg-[#12100E] text-white text-xs font-bold no-underline hover:bg-black transition-all"
              >
                DM on Instagram →
              </a>
            </div>

            {/* Email Escalation Card */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 block">DIRECT EMAIL</span>
                <h3 className="text-base font-bold text-neutral-950">Atelier Email</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Official correspondence, invoice requests, and business inquiries. Monitored with 12h reply commitment.
                </p>
                <p className="text-xs font-mono font-bold text-[#FF4D24]">rareemberagency@gmail.com</p>
              </div>
              <a
                href="mailto:rareemberagency@gmail.com?subject=Rare%20Ember%20Priority%20Inquiry"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg bg-[#12100E] text-white text-xs font-bold no-underline hover:bg-black transition-all"
              >
                Send Email →
              </a>
            </div>

            {/* WhatsApp Priority Desk */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 block">WHATSAPP</span>
                <h3 className="text-base font-bold text-neutral-950">WhatsApp Concierge</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Prefer chatting on WhatsApp? Request a message and our operations desk will reach your number directly.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('callback');
                  setCallSlot('Message Me on WhatsApp (Direct Chat)');
                  setCallReason('Requesting WhatsApp chat assistance for my order/inquiry');
                }}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs font-bold shadow-xs cursor-pointer"
              >
                Request WhatsApp Message →
              </button>
            </div>
          </div>

          {/* Operational Hours Card */}
          <div className="bg-white rounded-2xl p-6 border border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-neutral-600">
            <div>
              <p className="font-bold text-neutral-950">Production & Customer Care Hours</p>
              <p className="text-neutral-500 mt-0.5">Monday – Saturday: 9:00 AM – 8:00 PM IST (Sunday emergency escalations active)</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/returns" className="text-[#FF4D24] font-bold hover:underline">7-Day Free Replacement Policy →</Link>
              <span className="text-neutral-300">•</span>
              <Link href="/track" className="text-neutral-900 font-bold hover:underline">Track Courier Live →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
