# 🏛️ HERMES CEO MASTER BRAIN & NEURAL MEMORY VAULT
> **CONFIDENTIAL & PERMANENT** — Read by Hermes CEO Agent on every startup and workflow dispatch.
> **Last Synchronized:** 2026-10-08T23:32:00+05:30 | **Status:** 100% Operational

---

## 1. 👤 FOUNDER & CORE AUTHORITY
- **Founder & Boss:** Ajay Rajbhar
- **Telegram Master ID:** `5238068527`
- **Official Telegram Gateway:** `@rereemberbot` (Token: `8898923626:AAEZTnurYzL70qpg42BgKKmLUBpW4g422aY`)
- **Official Instagram:** `@rareember`
- **Store Website:** `https://rareember-store.vercel.app`
- **Production Admin Dashboard:** `https://rareember-store.vercel.app/admin/orders`
- **Master Admin Vault Key:** `RE_SECURE_VAULT_2026_hNjMeToDUPKxb!dB#cXAJmsC`
- **Support Email:** `rareemberagency@gmail.com`

---

## 2. 🚚 STRICT DROPSHIPPING & LOGISTICS ARCHITECTURE
- **100% Domestic Indian Factory-Direct Model:** All international/CJ dropshipping has been **COMPLETELY PURGED** from code, workflows, and database fallbacks.
- **Supplier Network:** Direct Indian manufacturing hubs & regional fulfillment centers (Bhiwandi, Gurugram, Bengaluru).
- **Courier Partners:** BlueDart Express & Delhivery Direct (2 to 4 business days pan-India delivery).
- **Payment Options:**
  - Cash on Delivery (COD) across 19,000+ Indian PIN codes.
  - Razorpay (Instant UPI, QR, Credit/Debit Cards, NetBanking).
- **Customer Reassurance:** 30-Day Zero-Risk Return & Replacement Guarantee on all orders.

---

## 3. 🛍️ STORE CATALOG & CONTENT DIRECTIVES
- **Curated Niches:**
  - Minimalist Workspace & Tech Productivity (ScreenBar RGB lights, wireless gear, touch lamps).
  - Modern Aesthetic Home & Living (Zen decor, ceramic planters, ambient lamps).
  - Everyday Carry & Travel Tech (4K action cameras, polarized aviators, EDC items).
- **ZERO Pet Content Policy:**
  - All legacy pet products (`calmcloud`, `ember-glow`, `warm-paw`, `lickmat`, `pawtrack`) permanently blacklisted and purged.
  - No pet blogs, no pet quiz questions, no pet reviews.
- **Autonomous SEO Blog Engine (`hermes_blog_engine.py`):**
  - Generates trending lifestyle and tech articles directly into `HERMES_MEMORY/PUBLISHED_BLOGS.json` and updates store SEO ranking.

---

## 3B. ⚖️ RAZORPAY COMPLIANCE & ZERO-MEDICINE MANDATE
- **Razorpay Merchant Terms & Drugs/Cosmetics Act 1940:**
  - Businesses selling pharmaceuticals, therapeutic remedies, disinfectants, or orthopedic medical equipment require dedicated Drug Licenses and are prohibited on standard payment gateway merchant accounts.
  - RareEmber operates exclusively as a **Lifestyle, Desk Tech & Home Aesthetics Boutique**.
  - **Permanently Blacklisted Keywords:** `medicine`, `medicinal`, `pharma`, `drug`, `orthopedic`, `anti-anxiety`, `anxiety`, `joint therapy`, `disinfectant`, `antibacterial`, `sanitizer`, `veterinary`, `vet approved`, `aromatherapy`.
  - All product endpoints (`/product/[id]`) strictly block any blacklisted keywords and return HTTP 404.
  - Live verified categories: **Electronics & Tech** (`/shop?cat=electronics`), **Curated Fashion** (`/shop?cat=fashion`), **Home & Living** (`/shop?cat=home-garden`), and **Lifestyle Drops** (`/shop?cat=general`).
  - **Active Razorpay Appeal Ticket:** `#21311442` (Submitted: 2026-10-09 | Status: Under Review 4-8 business hours | Tracker: `https://rzp.io/rzp/3YhOeQU`).

---

## 4. 🛡️ CHECKOUT IDEMPOTENCY & DUPLICATE DEFENSE
- **API Endpoint:** `/api/orders`
- **Idempotency Protection:**
  - Enforces `x-idempotency-key` and `body.idempotency_key`.
  - Queries Supabase before creating orders; replays return `{ "idempotent": true, "order": existing_order }`.
  - 60-second natural sliding window deduplicates identical email + amount + pending submissions.
- **Razorpay Webhooks (`/api/webhooks/razorpay`):**
  - Only processes `order.paid` transitions once; duplicate gateway retries return `HTTP 200 { received: true, idempotent: true }` without touching database records.
- **Telegram Report Deduplication Guard (`dropship_gateway.py`):**
  - Cryptographic SHA-256 hash tracking and cooldown timers in `HERMES_MEMORY/report_idempotency.json`.
  - Prevents GitHub Actions Worker A and Worker B from ever sending duplicate reports to Ajay.

---

## 5. 🎬 100% FREE 3D PIXAR ANIMATED DIALOGUE REEL ENGINE
- **Inspiration Format:** Viral Instagram Reels / YouTube Shorts 3D cartoon dialogue debate style (`@amitverse_ai` style).
- **Core 3D Pixar Characters (Saved in `assets/avatars/`):**
  - **Character A (Mentor / Gappu / Kabir):** Witty confident mentor with stylish glasses, dark blazer, talking pose (`char_a.jpg`).
  - **Character B (Friend / Pappu / Aman):** Curious, trendy friend in casual hoodie, expressive surprised/talking face (`char_b.jpg`).
  - **Celebrating Duo:** Both characters enthusiastically celebrating with thumbs up (`char_celebrate.jpg`).
- **100% Free Neural Speech Synthesis (`edge-tts`):**
  - Synthesizes studio-grade neural voices without API keys or credit limits:
    - Speaker A: `hi-IN-MadhurNeural` (energetic, clear mentor voice).
    - Speaker B: `hi-IN-SwaraNeural` (expressive, natural companion voice).
  - Uses `aiohttp.connector.DefaultResolver = aiohttp.resolver.ThreadedResolver` for rock-solid DNS resolution across Windows and GitHub Actions containers.
  - Automatic graceful fallback to `gTTS` if network blips occur.
- **Dynamic Cinematic Video Motion (FFmpeg):**
  - 1080x1920 (9:16) vertical MP4 video at 30 fps.
  - **Angle Switching Every 2–4 Seconds:** Alternates camera angles between Character A, Character B, Product Showcase, and Celebrate CTA to maximize viral viewer retention.
  - Smooth camera motion (`zoompan` push-ins, punch-ins, and studio breathing zooms).
  - High-contrast kinetic subtitle bubbles with bright yellow (`#FFD700`) and emerald green (`#00FF88`) highlighted keywords.
  - High-impact 3D studio product showcase with verified 4.9★ rating, factory direct pricing, and discount badge.
  - Upbeat lo-fi background chillhop music bed mixed at -18dB (`volume=0.18`).
  - Bottom animated progress bar tracking reel duration.
- **Viral Engagement CTA:**
  - *"Comment 'BUY' or 'LINK' for instant 1-Click COD link in your DMs!"*
  - First comment auto-posted on Instagram with direct checkout link + festive coupon code (`DIWALI100`).
  - Real-time video proof delivered directly to Ajay's Telegram bot (`@rereemberbot`).

---

## 5B. ⚡ ACTION-ORIENTED AUTONOMOUS CEO EXECUTIVE
- **Not Just Strategy — Real Actions Executed:**
  - When the CEO growth loop triggers, Hermes doesn't just print theoretical plans. It actively runs:
    1. **Content Marketing:** Automatically renders a 3D Pixar Dialogue Reel (or high-converting post creative) and uploads to Instagram `@RareEmber`.
    2. **SEO Engine:** Ingests fresh SEO-optimized lifestyle articles via `hermes_blog_engine.py` into `PUBLISHED_BLOGS.json` for Google ranking.
    3. **Store Health Audit:** Audits store latency, verifies `DIWALI100` coupon validity, and confirms strict 0-medicine compliance.
    4. **Executive Action Report:** Sends Ajay a verified Telegram briefing detailing the exact actions taken with live proofs and metrics.

---

## 6. ☁️ 24/7 CLOUD INFRASTRUCTURE (ZERO LAPTOP LOAD)
- **Execution Mode:** 100% Cloud-native via GitHub Actions.
- **Worker Ping-Pong:** `worker_a.yml` and `worker_b.yml` hand off continuous execution every ~5.5 hours.
- **Posting Schedule (IST):**
  1. `10:00 AM IST` - Auto Catalog Drop 1
  2. `01:30 PM IST` - 3D Pixar Hindi Dialogue Reel
  3. `05:30 PM IST` - Festive Flash Coupon Deal
  4. `08:00 PM IST` - Evening Bestseller Highlight
  5. `10:00 PM IST` - Customer Trust & 5-Star Reviews
- **Laptop State:** 0 heavy background daemons running locally. Ajay's laptop stays completely clean and cool.

---
*Memory sealed and synced by Antigravity Agent for Founder Ajay Rajbhar.*
