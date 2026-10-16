'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuoteData {
  productType: 'tee' | 'hoodie' | 'mat';
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount?: number;
  savings: number;
}

interface MerchAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProduct?: 'tee' | 'hoodie' | 'mat';
  defaultQty?: number;
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', cb: (resp: { error: { description: string } }) => void): void;
}

interface RazorpayWindow extends Window {
  Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
}

export function MerchAgentModal({ isOpen, onClose, defaultProduct = 'tee', defaultQty = 50 }: MerchAgentModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Greetings! I am **Hermes AI**, RareEmber's Autonomous B2B Merch Specialist & Production Desk (powered by Hermes Agent Engine).\n\nAre you organizing a **hackathon, college fest, startup launch, or team drop**? Tell me what you're planning, your target quantity, or ask for a live production quote!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadDetails, setLeadDetails] = useState({
    name: '',
    phone: '',
    org: '',
    eventDate: '',
  });
  const [payingAdvance, setPayingAdvance] = useState(false);
  const [advancePaid, setAdvancePaid] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/hermes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: newMessages,
        }),
      });

      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `I've noted that! For bulk runs from 25 to 500+ pieces, our 240 GSM Tees are ₹269–₹399 and 380 GSM Hoodies are ₹549–₹699 with 0 setup fees. Please share your phone or WhatsApp number so Founder Ajay can send digital mockups!`,
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚡ Tirupur Hub connection hiccup. You can reach Founder Ajay directly on WhatsApp at **+91 91702 44347** for instant 2-hour 3D mockups and bulk billing!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const parseQuoteData = (content: string): QuoteData | null => {
    const match = content.match(/<<<QUOTE_DATA:(.*?)>>>/);
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  };

  const cleanMessageContent = (content: string): string => {
    return content.replace(/<<<QUOTE_DATA:(.*?)>>>/g, '').trim();
  };

  const handlePayAdvance = async (quote: QuoteData) => {
    if (!leadDetails.name.trim() || !leadDetails.phone.trim()) {
      alert('Please enter your Name and WhatsApp phone number to lock your booking.');
      return;
    }

    setPayingAdvance(true);

    // Ensure Razorpay SDK is loaded
    const rzWindow = window as unknown as RazorpayWindow;
    if (!rzWindow.Razorpay) {
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (!existingScript) {
        try {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Razorpay failed'));
            document.body.appendChild(script);
          });
        } catch {
          alert('Payment gateway failed to load. Please retry.');
          setPayingAdvance(false);
          return;
        }
      }
    }

    try {
      const res = await fetch('/api/hermes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_advance_order',
          productType: quote.productType,
          quantity: quote.quantity,
          orgName: leadDetails.org || 'College / Startup Team',
          contactName: leadDetails.name,
          phone: leadDetails.phone,
          eventDate: leadDetails.eventDate,
        }),
      });

      const data = await res.json();
      if (!data.ok || !data.order_id) {
        alert(data.error || 'Failed to initialize booking.');
        setPayingAdvance(false);
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: 'INR',
        name: 'Rare Ember B2B Studio',
        description: `20% Advance Deposit (${quote.quantity}x ${quote.productName})`,
        order_id: data.order_id,
        handler: function () {
          setAdvancePaid(true);
          setPayingAdvance(false);
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `🎉 **20% Advance Booking Deposit Confirmed!**\n\n• **Booking Ref:** \`${data.order_id}\`\n• **Amount Received:** ₹${quote.advanceAmount.toLocaleString('en-IN')}\n• **Units Locked:** ${quote.quantity}x ${quote.productName}\n• **Lead Contact:** ${leadDetails.name} (${leadDetails.phone})\n\nOur production desk at Tirupur has locked your fabric lot. Founder Ajay Rajbhar will message you on WhatsApp within 2 hours with 3D design mockups for final approval!`,
            },
          ]);
        },
        prefill: {
          name: leadDetails.name,
          contact: leadDetails.phone,
        },
        theme: { color: '#FF4D24' },
      };

      const RazorpayCtor = (window as unknown as RazorpayWindow).Razorpay;
      if (RazorpayCtor) {
        const rzp = new RazorpayCtor(options);
        rzp.open();
      }
    } catch {
      alert('Unable to connect to payment gateway. Please message us on WhatsApp.');
    } finally {
      setPayingAdvance(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl h-[90vh] max-h-[720px] rounded-3xl bg-[#121110] text-white border border-white/10 shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* AGENT HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#191715]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF4D24] to-[#f59e0b] flex items-center justify-center text-lg font-black shadow-lg">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">Hermes AI</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Tirupur Desk • Hermes Engine
                </span>
              </div>
              <p className="text-[11px] text-white/60">Autonomous B2B Merch Desk &amp; Production Engineer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center text-sm font-black transition-all cursor-pointer border-none"
          >
            ✕
          </button>
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {messages.map((m, i) => {
            const quote = m.role === 'assistant' ? parseQuoteData(m.content) : null;
            const cleanedText = cleanMessageContent(m.content);

            return (
              <div
                key={i}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-[#FF4D24] to-[#E8244B] text-white font-medium shadow-md'
                      : 'bg-white/5 border border-white/10 text-white/90 shadow-sm'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {cleanedText}
                </div>

                {/* DYNAMIC INTERACTIVE 20% ADVANCE BOOKING CARD */}
                {quote && (
                  <div className="mt-3 w-full max-w-md rounded-2xl bg-gradient-to-br from-[#1e1b18] to-[#121110] border border-[#FF4D24]/40 p-4 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9A3D]">Official Proforma Quote</span>
                        <h4 className="font-black text-sm text-white">{quote.quantity}x {quote.productName}</h4>
                      </div>
                      <span className="text-xl">⚡</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-white/60 block text-[10px]">Tier Price:</span>
                        <span className="font-black text-white text-sm">₹{quote.unitPrice}/unit</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-white/60 block text-[10px]">Total Order:</span>
                        <span className="font-black text-white text-sm">₹{quote.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* 20% Advance Highlight */}
                    <div className="p-3 rounded-xl bg-[#FF4D24]/10 border border-[#FF4D24]/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9A3D] block">
                          20% Advance Booking Deposit
                        </span>
                        <span className="text-lg font-black text-white">
                          ₹{quote.advanceAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-white/70 text-right">
                        Balance ₹{((quote.totalAmount - quote.advanceAmount)).toLocaleString('en-IN')} on dispatch
                      </span>
                    </div>

                    {/* Organizer Input Fields if not yet booked */}
                    {!advancePaid && (
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Your Full Name *"
                            value={leadDetails.name}
                            onChange={(e) => setLeadDetails({ ...leadDetails, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#FF4D24]"
                          />
                          <input
                            type="tel"
                            placeholder="WhatsApp Number *"
                            value={leadDetails.phone}
                            onChange={(e) => setLeadDetails({ ...leadDetails, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#FF4D24]"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="College / Club / Company Name"
                          value={leadDetails.org}
                          onChange={(e) => setLeadDetails({ ...leadDetails, org: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#FF4D24]"
                        />

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            type="button"
                            disabled={payingAdvance}
                            onClick={() => handlePayAdvance(quote)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF4D24] to-[#E8244B] text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
                          >
                            <span>{payingAdvance ? 'Opening Gateway...' : `Lock with 20% Advance (₹${quote.advanceAmount.toLocaleString('en-IN')})`}</span>
                            <span>⚡</span>
                          </button>

                          <a
                            href={`https://wa.me/919170244347?text=${encodeURIComponent(`Hi Ajay, I got a quote for ${quote.quantity}x ${quote.productName} (₹${quote.totalAmount}). Please confirm mockups!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 no-underline active:scale-95 transition-all"
                          >
                            <span>💬</span> WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#FF4D24] animate-ping" />
              <span>Hermes AI is calculating tier pricing &amp; Tirupur capacity...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            'Quote for 100 Hackathon Tees',
            'Quote for 50 Winter Hoodies',
            'Can I get a physical sample?',
            'How does the 20% advance work?',
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => sendMessage(promptText)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-bold whitespace-nowrap transition-all border border-white/5 cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* CHAT INPUT FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 sm:p-4 border-t border-white/10 bg-[#161413] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about bulk pricing, fabrics, samples, or delivery dates..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#FF4D24] transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-[#FF4D24] hover:bg-[#ff3b0f] disabled:opacity-40 text-white font-black flex items-center justify-center transition-all cursor-pointer border-none shadow-md shrink-0"
          >
            ➔
          </button>
        </form>
      </motion.div>
    </div>
  );
}
