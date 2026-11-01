# AGENTS.md — Global Workspace Rules & Core Brand Memory

## 1. Operating Guidelines (Normal Mode)
- Build robust, clean, scalable, and maintainable software.
- Maintain high standards for security, performance, accessibility (WCAG AA), and test coverage.
- Deliver thorough and detailed engineering explanations and documentation.

---

## 2. 🏛️ RARE EMBER BRAND & CATALOG INVARIANTS (PERMANENT MEMORY)

Rare Ember (`https://www.rareember.shop`) is strictly a **luxury, architectural, heavyweight custom-printed Indian streetwear label**.
Every agent operating in this workspace must adhere to the following permanent rules without exception:

### 🚫 STRICTLY REMOVED & BANNED ITEMS (NEVER RE-ADD)
1. **NO 180 GSM OR THIN FABRICS:**
   - All 180 GSM blanks (including Qikink SKU 5474) are permanently banned.
   - All everyday classic crew tees, basic tees, baby tees, women's crop tops, tank tops, raglans, ringers, v-necks, t-shirt dresses, and 180 GSM full-sleeve tees are permanently purged and forbidden.
2. **NO UNPRINTED FACTORY BLANKS:**
   - Raw wholesale blank apparel (e.g. unprinted `UC61`, `UT27`, `UT58`, `UH26`, `UH35`, `UJ29`, `US22`, `UA22`, `US52`, `UJ31`, `UA30`, unprinted hoodies, unprinted sweatshirts, unprinted joggers, unprinted desk mats) are forbidden.
   - Any product without custom graphic print artwork created in Qikink client account `658581` must NEVER be exposed in the catalog, Supabase (`active = true`), Google Feed, or sitemap.
3. **NO RAW FACTORY CODES IN TITLES:**
   - Customer-facing titles must never contain raw supplier codes (`| UC61`, `| UA22`, `| UH32`) or the word `"Blank"`.
4. **NEVER CALL 240 GSM "HEAVYWEIGHT":**
   - 240 GSM garments must be labeled strictly as `"240 GSM STRUCTURED COTTON"` (or `"240 GSM AEROKNIT MESH"` for jerseys).
   - Only 320–380+ GSM fleece garments may be labeled `"HEAVYWEIGHT"`.
5. **NO WHOLESALE BLUEPRINTS IN PUBLIC FOLDERS:**
   - Unit economics blueprints and wholesale cost PDFs must never be placed inside `storefront/public/`.

---

### ✅ STRICT ALLOWED CATALOG: EXACT 8 CUSTOM-PRINTED DROPS
Only the following 8 products—created and verified with client artwork in Qikink—are permitted to be active:

| # | Qikink ID | Product Title | Fabric & GSM | Base Price | Prepaid Price | Landed Cost | Net Margin (Prepaid) | Net Margin (Base) |
|---|---|---|---|---|---|---|---|---|
| **1** | `32493953` | **Unisex Acid Washed Hoodie — Skull & Dragon Edition** | 320 GSM Acid Wash Fleece | ₹1,499 | ₹1,479 | ₹1,131.25 | **21.2%** | **24.5%** |
| **2** | `32493938` | **Unisex Heavyweight Hoodie — Unstoppable Tiger Edition** | 380 GSM Brushed Fleece | ₹1,349 | ₹1,329 | ₹1,016.25 | **21.2%** | **24.7%** |
| **3** | `32493470` | **Unisex Pullover Hoodie — Cyber Designer Edition** | 320 GSM French Terry Fleece | ₹1,329 | ₹1,309 | ₹1,006.25 | **20.8%** | **24.3%** |
| **4** | `32476431` | **Unisex Oversized Standard T-Shirt — Chrome Bengaluru Cyber Drop** | 240 GSM Structured Cotton | ₹669 | ₹659 | ₹507.00 | **20.7%** | **24.2%** |
| **5** | `32476620` | **Unisex Terry Oversized Tee — Not Today 260 GSM Terry** | 260 GSM French Terry Cotton | ₹759 | ₹739 | ₹570.00 | **20.5%** | **24.9%** |
| **6** | `32476280` | **Unisex Oversized Jersey — Cyber Sublimation Jersey** | 240 GSM Aeroknit Mesh | ₹669 | ₹659 | ₹507.00 | **20.7%** | **24.2%** |
| **7** | `32476332` | **Unisex Oversized Classic T-Shirt — Tokyo Street Graphic** | 240 GSM Structured Cotton | ₹669 | ₹659 | ₹507.00 | **20.7%** | **24.2%** |
| **8** | `32476629` | **Unisex Oversized Shirt — Flame Embroidered Icon** | 240 GSM Structured Cotton | ₹669 | ₹659 | ₹507.00 | **20.7%** | **24.2%** |

### ⚙️ SYSTEM & COMPLIANCE SPECIFICATIONS
- **Tax Invoice Supply Classification:** Courier COD Handling Fees are composite supply bundled with the principal garment under HSN `6109` (5% GST: 2.5% CGST + 2.5% SGST), not standalone 18% HSN `9968`.
- **Checkout Verification:** COD orders require 6-digit email OTP verification before order submission to prevent RTO fraud.
- **Product Gate Rule:** In code, all catalog exports must enforce `.filter((p) => p.is_printed === true && Boolean(p.qikinkClientProductId))`.
- **Database Status:** Supabase `public.products` must keep non-printed rows set to `active = false`.
