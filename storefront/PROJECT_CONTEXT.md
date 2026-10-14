# RareEmber - Premium Automated Dropshipping Store (Cursor / OpenCode Master Blueprint)

## 1. Project Overview & Brand Identity
**Name:** RareEmber
**Domain:** rareember.com
**Niche:** Premium Pet Care & Cozy-Tech Accessories.
**Target Market:** USA (High-income, aesthetic-focused pet owners).
**Business Model:** 100% Automated Dropshipping via CJDropshipping.
**Brand Slogan:** "Where pets meet comfort. Design for play."
**Core USP:** Breaking the traditional "Shopify template" mold. We offer a high-end, cinematic, story-driven shopping experience akin to an award-winning creative agency (Unseen.co style).

## 2. Tech Stack & Architecture
- **Framework:** Next.js 16 (App Router)
- **Styling:** TailwindCSS v4 (CSS-first approach using `@theme` in `globals.css`)
- **Animations:** Framer Motion (Scroll reveals, parallax, magnetic buttons, interactive 3D tilt cards)
- **Database / Auth:** Supabase (PostgreSQL)
- **Payments:** Stripe Checkout
- **Fulfillment / AI:** Radha (Autonomous AI Agent) managing Webhooks & CJDropshipping API

## 3. Detailed Information Architecture & Features to Build

### A. Pages to Generate
1. **`/` (Home):** Cinematic video hero, trust bar, trending products, newsletter. *(Already scaffolded)*
2. **`/shop` (Catalog):** 
   - Interactive category filters (Cozy-Tech, Dog Essentials, Cat Aesthetics).
   - Minimalist grid layout with 3D tilt product cards.
3. **`/product/[id]` (Product Detail Page):**
   - Immersive full-bleed image gallery.
   - Sticky "Add to Cart" sidebar.
   - Features section: "Why your pet will love this."
4. **`/about` (Brand Story):**
   - Parallax scrolling timeline of how RareEmber started.
5. **`/track` (Order Tracking):**
   - Simple, beautiful input field for Order ID & Email to fetch real-time CJ tracking status.

### B. Core Features to Implement
- **AI "Pet Match" Quiz:** A floating widget where users answer 3 questions about their pet, and the UI dynamically filters the best products.
- **Magnetic Buttons:** All primary CTAs should have a "magnetic" hover effect (button subtly follows the cursor).
- **Cart Slide-over:** A sleek, glassmorphism sidebar cart that slides in from the right. Must include an up-sell module.

### C. Real Services & Customer Promises (To be highlighted on the site)
We are actually providing these real services through our CJ Dropshipping & AI integration:
1. **Express US Shipping:** Sourcing products primarily from CJ's US warehouses for fast 3-7 day delivery times.
2. **24/7 Live AI Support:** An integrated chat widget where customers get instant answers regarding their orders or product recommendations.
3. **Real-Time Order Tracking:** Direct API integration with CJ Dropshipping so customers can see their exact package location natively on our site.
4. **Hassle-Free Replacements:** If a product arrives damaged, our AI automatically processes replacement requests via photo verification.

### D. AI Chatbot / Help Desk Widget (Powered by Radha)
- **Floating Chat Widget:** A sleek, non-intrusive chat icon in the bottom right corner of every page.
- **UI Design:** When opened, it should have a glassmorphism UI matching the Unseen.co style. 
- **Functionality to build:** 
  - Greet users: "Hi! I'm RareEmber's AI assistant. Need help finding the perfect bed for your dog, or checking an order status?"
  - Input area for users to type.
  - Integration placeholder: Leave a clear API route (e.g., `/api/chat`) where we will hook up the real AI logic later.

### E. Copywriting & Content Guidelines
- **Tone:** Warm, minimalist, sophisticated, slightly playful.
- **Trust Bar Text:** 
  - 🚚 Express US Shipping (3-7 Days)
  - 💬 24/7 Live AI Support (Instant help)
  - 📍 Real-Time Tracking (Know where your package is)
  - ↩️ Easy Replacements (Hassle-free process)

## 4. Design System (Unseen.co Style)
- **Colors:** 
  - Background: `#fffbf5` (Warm Cream - mandatory for all page backgrounds)
  - Accent: `#ff6b35` (Ember Orange - use sparingly for CTAs and highlights)
  - Text Primary: `#1a1412` (Soft Dark Brown/Black)
  - Text Secondary: `#52453e` (Muted Brown)
- **Typography:** 
  - Large, bold, tracking-tight fonts for headings (`letter-spacing: -0.04em`).
  - Clean, airy fonts for paragraphs (`line-height: 1.6`).
- **Cinematic Experience:** Avoid sharp boxes. Use rounded corners (`rounded-3xl`), soft shadows (`box-shadow: 0 10px 30px rgba(0,0,0,0.05)`), and glassmorphism (`backdrop-filter: blur(10px)` with semi-transparent white backgrounds).

## 5. Database Schema Requirements (For Supabase)
When writing backend code, assume the following tables:
- `products`: `id`, `title`, `description`, `price`, `compare_at_price`, `image_url`, `cj_sku`, `category`
- `orders`: `id`, `user_email`, `stripe_session_id`, `total_amount`, `status`, `cj_order_id`, `tracking_number`

## 6. Instructions for the AI Coder (Cursor / OpenCode)
1. **DO NOT** rewrite `src/app/page.tsx` from scratch—build upon its existing cinematic video and `ScrollReveal` logic.
2. Focus on building the `/shop`, `/product/[id]`, and the **AI Chatbot Widget** components next.
3. Ensure every new component uses Tailwind v4 syntax and incorporates Framer Motion for that premium "Unseen" feel.
4. Keep the code strictly modular (put UI components in `src/components/ui/`).
