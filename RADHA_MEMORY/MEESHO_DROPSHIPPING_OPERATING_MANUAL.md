# RareEmber Meesho Dropshipping Operating Manual & Executive Charter
**Author:** Boss Ajay (Founder) | **Adopted by:** Radha CEO & Autonomous Board
**Enforcement Date:** October 15, 2026 | **Target:** Operation 10,000 Diwali Sales

---

## 1. How Our Business Works: The Meesho Domestic Dropshipping Engine

### Core Operating Model:
RareEmber operates a high-speed, zero-inventory domestic dropshipping model tailored for the Indian consumer market.

```mermaid
flowchart LR
    A["Customer Orders on<br/>RareEmber Store / IG"] --> B["Pooja: WhatsApp 1-Click<br/>COD Intent Verification"]
    B -->|Confirmed| C["Arjun: Routes to Domestic<br/>Meesho Supplier (Surat/Bhiwandi)"]
    C --> D["Fast Express Dispatch<br/>(Delhivery/BlueDart Air 2-4 Days)"]
    D --> E["Doorstep Delivery &<br/>Cash on Delivery (COD) Collected"]
    E --> F["Kabir: 55%-65% Net Margin<br/>Remitted to RareEmber"]
    B -->|Unconfirmed/Fake| G["Order Cancelled<br/>(0% RTO Loss)"]
```

### Unit Economics:
- **Wholesale Domestic Sourcing Cost:** ₹140 – ₹220 per unit (sourced directly from domestic manufacturing hubs in Surat, Bhiwandi, Delhi, and Jaipur).
- **Express Logistics (Air/Surface):** ₹70 – ₹85 per delivery via Delhivery, BlueDart, and Shadowfax.
- **Selling Price on Storefront:** ₹499 – ₹699.
- **Net Margin:** **55% – 65%** (~₹260 – ₹380 net profit per delivered order).
- **Target on 10,000 Sales:** **₹49.9 Lakhs – ₹59.9 Lakhs GMV** with **~₹27.5 Lakhs Net Profit**.

---

## 2. Strict Product Availability & Supplier Quality Standard
**Directive:** *"Only add exact products that are available."*

### Arjun's Supplier Rules:
1. **100% In-Stock Verification:** Every catalog item must have an active, verified supplier with live inventory buffer.
2. **CDN Image Validation:** Every product must possess authentic, high-resolution 4-angle manufacturer CDN photographs (Hero, Macro Detail, Lifestyle In-Situ, Packaging) as mapped in `storefront/src/lib/data/product-gallery.ts`. Dead (404) links are banned.
3. **Supplier Rating Filter:** Only suppliers with a **4.5★+ rating** and proven dispatch SLA under 24 hours are permitted.
4. **Automated Stock Guard:** If a supplier's inventory drops below safety threshold, Arjun automatically shifts fulfillment to backup domestic suppliers or pauses the listing before any customer can purchase out-of-stock items.

---

## 3. The COD & RTO Shield (Pooja's Protocol)
**Problem:** In India, 70%+ of online shoppers purchase via Cash on Delivery (COD). Without verification, the industry average RTO (Return To Origin) is 35%–40%, resulting in heavy reverse logistics losses (~₹120/failed delivery).

**RareEmber Solution:**
1. **Automated WhatsApp 1-Click Verification:** Immediately when an order is placed, Pooja triggers an interactive WhatsApp message to the customer's phone:
   > *"Hi [Customer], your RareEmber Diwali order for [Product] (₹[Amount] COD) is ready! Tap [Confirm Dispatch] to verify."*
2. **Fake / Impulse Filter:** Only verified orders are handed to courier partners.
3. **Result:** RTO is suppressed from 35% down to **<12%**, preserving **over ₹15 Lakhs** in prevented shipping penalties across the 10,000 Diwali order target.

---

## 4. Eva's Facecam Content System
**Directive:** *"Always create facecam video of Eva and same product in her hand. Only name Eva, not Patel."*

1. **Presenter Identity:** The host and brand ambassador is strictly **Eva** (never "Patel").
2. **Visual Format:**
   - Top 55% of the reel features **Eva's live facecam perspective** with studio lighting, eye contact, and `🔴 LIVE FACECAM • EVA` badge.
   - In Eva's hand: The **exact product** being reviewed is prominently composited into her hand with realistic angle, soft drop shadow, and floating `✋ IN EVA'S HAND` indicator.
   - Lower section displays large, bold, high-contrast subtitle captions, festive Diwali discount code **`DIWALI100`** (Flat ₹100 OFF), and doorstep COD guarantee.
3. **Publishing Cadence:** 5x daily reels published automatically to Instagram (`@RareEmber`) and delivered to Boss Ajay's Telegram (`@rereemberbot`).

---

## 5. Security & Infrastructure Compliance
**Directive:** *"Check everything with security."*

1. **Zero Credential Exposure:**
   - `.env`, `browser_cookies.json`, `dots_gateway/browser_data/`, and API tokens are permanently ignored by Git (`.gitignore`).
   - No sensitive secrets are committed to public GitHub repositories.
2. **Session Security:**
   - Instagram authenticated session tokens (`sessionid`, `ds_user_id`, `csrftoken`) are stored exclusively in local encrypted Chromium browser profiles.
3. **Payment Security:**
   - Razorpay 256-bit SSL gateway with HMAC-SHA256 signature verification on all webhooks to prevent order spoofing.
4. **System Input Sanitization:**
   - All shell executions, database queries, and API endpoints sanitize input parameters to prevent injection attacks.
