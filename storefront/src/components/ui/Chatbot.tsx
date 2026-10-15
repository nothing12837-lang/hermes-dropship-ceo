'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { formatPrice, products } from '@/lib/data/products';
import { useGeo } from '@/context/GeoContext';

interface ChatProduct {
  id: string;
  title: string;
  price: number;
  emoji: string;
}

interface Msg {
  me: boolean;
  text: string;
  products?: ChatProduct[];
  timestamp?: Date;
}

function RareEmberLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <Image
      src="/flame-icon.png"
      alt="RareEmber"
      width={36}
      height={36}
      className={`object-contain ${className}`}
    />
  );
}

const QUICK_PROMPTS = [
  '📦 Track my order',
  '🚚 Delivery to my PIN code',
  '⚡ Trending products',
  '💵 Cash on Delivery info',
  '🛡️ Return & refund policy',
];

export default function Chatbot() {
  const pathname = usePathname();
  if (pathname?.startsWith('/dots')) {
    return null;
  }
  const { formatPrice: geoFormatPrice } = useGeo();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      me: false,
      text: "👋 Namaste! I am **Radha**, RareEmber's AI Shopping Concierge.\n\nI can track your order in real time, verify 2–4 day express delivery & COD for your Indian PIN code, or recommend top trending products. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, open]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput('');
    setMsgs((m) => [...m, { me: true, text: message, timestamp: new Date() }]);
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          me: false,
          text: data.reply || "I'm ready to help with your orders or product queries.",
          products: data.products,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          me: false,
          text: "I experienced a brief connection blip. You can track your order at [/track](/track), check live delivery on any product page, or email rareemberagency@gmail.com.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setBusy(false);
      setTimeout(scrollToBottom, 120);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!mounted) return null;

  return (
    <>
      {/* Floating Right Corner Trigger */}
      <div className="fixed bottom-6 right-6 z-[179] flex items-center gap-2">
        {!open && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.12)] cursor-pointer text-xs font-bold text-neutral-900 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ask Radha AI</span>
          </motion.button>
        )}

        <motion.button
          onClick={() => {
            setOpen(!open);
            setMinimized(false);
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label={open ? 'Close Radha AI Concierge' : 'Open Radha AI Concierge'}
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#161311] border border-amber-500/40 text-white flex items-center justify-center cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_24px_rgba(255,100,0,0.25)] hover:border-amber-400 active:scale-95 transition-all"
        >
          {open ? (
            <span className="text-xl font-bold">✕</span>
          ) : (
            <div className="flex items-center justify-center">
              <RareEmberLogo className="w-8 h-8 md:w-9 md:h-9" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#161311] animate-pulse" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-24 right-4 md:right-6 z-[178] w-[min(440px,calc(100vw-2rem))] ${
              minimized ? 'h-[72px]' : 'h-[min(650px,calc(100vh-8rem))]'
            } flex flex-col rounded-[1.75rem] bg-[#FFFBF5]/95 backdrop-blur-2xl border border-black/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.22)] overflow-hidden transition-all`}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#161311] text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <RareEmberLogo className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight text-white">Radha Concierge</span>
                    <span className="text-amber-400 text-xs">✨</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>RareEmber AI Support • Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-neutral-300 flex items-center justify-center cursor-pointer border-none bg-transparent transition-colors text-sm"
                  aria-label={minimized ? 'Maximize chat' : 'Minimize chat'}
                >
                  {minimized ? '▢' : '—'}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-neutral-300 flex items-center justify-center cursor-pointer border-none bg-transparent transition-colors text-sm"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!minimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs leading-relaxed">
                  {/* Security trust badge */}
                  <div className="self-center py-1 px-3 rounded-full bg-neutral-900/[0.04] border border-black/[0.05] text-[10px] text-neutral-500 font-semibold flex items-center gap-1.5">
                    <span>🔒</span>
                    <span>256-Bit SSL Encrypted • Private & Secure</span>
                  </div>

                  {msgs.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${m.me ? 'items-end' : 'items-start'} max-w-[88%]`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl whitespace-pre-wrap ${
                          m.me
                            ? 'bg-[#161311] text-white rounded-tr-xs'
                            : 'bg-white text-neutral-900 border border-black/[0.06] shadow-xs rounded-tl-xs'
                        }`}
                      >
                        {m.text}
                      </div>

                      {/* Attached Product Cards if recommended */}
                      {m.products && m.products.length > 0 && (
                        <div className="grid gap-2 mt-2 w-full">
                          {m.products.map((p) => (
                            <Link
                              key={p.id}
                              href={`/product/${p.id}`}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-black/[0.06] hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all text-neutral-900 no-underline"
                            >
                              <span className="text-2xl">{p.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <span className="block font-bold text-xs truncate">{p.title}</span>
                                <span className="text-amber-600 font-extrabold text-[11px]">
                                  {geoFormatPrice(p.price)}
                                </span>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-[#161311] text-white text-[10px] font-bold">
                                View ⚡
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {m.timestamp && (
                        <span className="text-[10px] text-neutral-400 mt-1 px-1">
                          {formatTime(m.timestamp)}
                        </span>
                      )}
                    </motion.div>
                  ))}

                  {busy && (
                    <div className="self-start p-3 rounded-2xl bg-white border border-black/[0.06] text-neutral-500 text-xs flex items-center gap-2 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      <span>Radha is checking live inventory…</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Bar */}
                <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="px-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-[11px] font-semibold text-neutral-800 whitespace-nowrap hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-white/80 border-t border-black/[0.06] flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Ask Radha about PIN code, orders, or products..."
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-full border border-black/10 bg-neutral-50 text-neutral-900 outline-none focus:border-amber-500 focus:bg-white transition-all placeholder:text-neutral-400"
                  />
                  <button
                    onClick={() => send()}
                    disabled={busy || !input.trim()}
                    className="w-9 h-9 rounded-full bg-[#161311] text-white flex items-center justify-center border-none cursor-pointer hover:bg-black active:scale-95 disabled:opacity-40 transition-all text-xs font-bold shrink-0"
                    aria-label="Send query"
                  >
                    ↑
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}