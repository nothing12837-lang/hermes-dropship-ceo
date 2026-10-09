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

## 5. 🎬 VIRAL 3D CARTOON HINDI DIALOGUE REEL ENGINE
- **Inspiration Format:** `@amitverse_ai` viral Hindi 3D cartoon dialogue debate style (`🍋 Gappu vs Pappu • Mall Price Debate`).
- **Core Characters:**
  - **Gappu / Chintu:** The Mall Overpayer (comedic, shocked voice, bought expensive showroom items for ₹4,500+).
  - **Pappu / Mintu:** The Smart RareEmber Dropshipper (confident, cool sunglasses, reveals direct factory prices under ₹999).
- **Spoken Audio Synthesis:**
  - Authentic spoken Hindi dialogues generated using Google TTS (`gTTS`).
  - Dual-character pitch shifting via FFmpeg (`asetrate=44100*1.14` for Gappu, `asetrate=44100*0.96` for Pappu).
  - Layered over upbeat lo-fi background music bed at 18% volume.
- **Video Motion & Composition (`ig_autopilot.py`):**
  - 1080x1920 (9:16) vertical MP4 video at 30 fps.
  - Multi-scene dynamic camera push-in motion (`zoompan`).
  - 3D cartoon character avatars with expressive mood changes (shocked, smirk, celebrate).
  - High-contrast glowing speech bubbles with Devanagari Hindi text + Roman English subtitles.
  - High-impact 3D studio product showcase with verified 4.9★ rating.
  - Animated bottom progress bar across the entire video runtime.
- **Viral Engagement CTA:**
  - *"Comment 'BUY' or 'LINK' for instant 1-Click COD link in your DMs!"*
  - First comment auto-posted on Instagram with direct product checkout link + festive coupon code.
  - Real-time video preview delivered directly to Ajay's Telegram bot.

---

## 6. ☁️ 24/7 CLOUD INFRASTRUCTURE (ZERO LAPTOP LOAD)
- **Execution Mode:** 100% Cloud-native via GitHub Actions.
- **Worker Ping-Pong:** `worker_a.yml` and `worker_b.yml` hand off continuous execution every ~5.5 hours.
- **Posting Schedule (IST):**
  1. `10:00 AM IST` - Auto Catalog Drop 1
  2. `01:30 PM IST` - Problem Solver Hindi Dialogue Reel
  3. `05:30 PM IST` - Festive Flash Coupon Deal
  4. `08:00 PM IST` - Evening Bestseller Highlight
  5. `10:00 PM IST` - Customer Trust & 5-Star Reviews
- **Laptop State:** 0 heavy background daemons running locally. Ajay's laptop stays completely clean and cool.

---
*Memory sealed and synced by Antigravity Agent for Founder Ajay Rajbhar.*
