# Project Memory

This document serves as the project's memory bank. It stores important context, design decisions, learned information, and ongoing notes that are crucial for the project's development.

## Context
- **Project Name:** Rareember
- **Mission:** A fully autonomous multi-agent AI automation agency capable of building websites, making voice calls, and capturing leads.
- **Started:** 2026-08-28

## Tech Stack & Architecture
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion.
- **UI Libraries Integrated:** Aceternity UI, Magic UI.
- **Backend:** FastAPI (Python), Pipecat WebRTC for voice.
- **Component Strategy:** We use Awwwards-tier custom components (Custom Cursor, Noise Overlay, Magnetic Buttons, Text Reveals, Border Beams).

## Key Decisions & Progress (Up to Aug 30, 2026)
- **Git Repo Initialized:** Code is safely version controlled locally.
- **Multi-Agent Simulation UI:** Upgraded the `ChatWidget` on the homepage to simulate a team of agents (CEO, Website Builder, QA) conversing before responding to the user.
- **Awwwards Global UI:** Hidden standard cursor; injected `CustomCursor` and `NoiseOverlay` globally in `app/layout.jsx`.
- **Preview Sites Generated:**
  1. `/preview/coffee`: Dark theme café with glowing 400px Parallax coffee cup.
  2. `/preview/makoba`: Ultra-luxury boutique for Makoba Pen Store with gold Spotlights.
  3. `/preview/deepthi`: High-performance mobile-optimized Neo-Slate grocery design for Deepthi Store.

## Next Steps for Tomorrow
1. Wire the Next.js `ChatWidget` to the actual FastAPI backend.
2. Setup Postgres/Supabase memory for the multi-agent persistence.
3. Deploy the frontend to Netlify.

---

## Dropshipping Platform — Saved State (2026-10-07)
- **What:** `dropshipping-platform/` — full India+Global dropshipping business
  (Express API :8002 + Next.js 16 store :3002 + Vite admin :5173 + Prisma schema).
- **Payments:** Razorpay (UPI/cards, mock without keys) + Stripe (intl, mock)
  + COD (+₹49). Webhook HMAC verify before acting.
- **Suppliers:** GlowRoad / BaapStore / CJ / Qikink adapters; order confirm
  auto-forwards POs; jobs: inventory-sync, order-fulfillment, price-monitor.
- **Growth built-in:** reviews, referrals, upsells, SEO (sitemap/robots/JSON-LD/blog),
  automation flows (abandoned cart, welcome, COD-confirm, post-purchase).
- **Security (verified live):** rate limits (300/60/20 per min + bans), 100kb bodies,
  allowlist CORS, timing-safe admin key, allowlist input validation, safe errors,
  CSP/HSTS headers, frontend middleware limits. Docs: `docs/SECURITY.md`.
- **Frontend:** 23 files, zero deps beyond Next+React, premium mobile-first CSS,
  sticky buy bar, wishlist, coupons, tracking page. Builds clean (12 routes).
- **Env templates fixed:** `backend/.env.example` (all vars),
  `frontend/.env.example`, root `.env.example`.
- **Go-live guide:** `docs/GO_LIVE_AND_APIS.md` (keys table, Render+Vercel+Supabase
  deploy, webhook URLs, smoke tests). Telegram/WhatsApp setup:
  `docs/TELEGRAM_WHATSAPP_AI_SETUP.md`.
- **Known test order:** COD P001 ×1 → total ₹848, profit ₹410.
- **Next:** Supabase `DATABASE_URL` + live Razorpay KYC + Meta webhook verify,
  then Vercel/Render deploy per the guide.
- **Razorpay approval (2026-10-07):** live keys need website approval (24–48h).
  Added the 5 pages reviewers check: /contact /privacy /terms /shipping /refunds
  + footer links. Use TEST mode keys until approved.
- **Blank-grid bugfix (2026-10-07):** grid empty when site opened via 127.0.0.1
  (CORS allowlist rejected it). Backend now allows any loopback origin in dev.
  Added local SVG product images (`frontend/public/p/*.svg`) + img onError
  fallback + home retry button. All services restarted + verified.
- **LAN/CORS bugfix-2 (2026-10-07):** backend dev CORS now allows private-LAN
  origins; frontend API base auto-follows page hostname (phone-on-WiFi case).
  Both builds pass; services restarted + verified (LAN origin allowed).
- **SSR fix (2026-10-07):** home/products/detail converted to Server Components
  (fetch via `lib/server.ts` loopback) — product grid + images baked into HTML,
  browser fetch/CORS can no longer break it. Verified: names + 10 `<img>` in raw
  HTML. Added connection-status banner in providers for self-diagnosis.
- **Dead-buttons bugfix (2026-10-07):** each useCart()/useWishlist() had isolated
  state (header badge never updated) + setState-inside-updater (StrictMode
  chaos). Rebuilt both on useSyncExternalStore shared store. Verified build.
- **SSR-kill bugfix (2026-10-07):** providers.tsx had a `mounted` gate rendering
  a Loading screen on the server — SSR HTML contained ZERO products (only 4
  divs). Removed it. Verified: 10 cards + 10 buttons + 10 imgs in raw HTML.
  (Also: /api/track/* lives under /api/orders/track/* in TS backend.)
