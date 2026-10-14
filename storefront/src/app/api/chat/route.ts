import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { formatPrice } from '@/lib/data/products';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, sanitizeMessage } from '@/lib/security/validation';

// ─────────────────────────────────────────────────────────────
// POST /api/chat — Radha AI E-Commerce Concierge Engine
// Powered by Gemini 3.8 Flash + Supabase Live Catalog & Orders
// Resolves: Indian PIN codes, COD verification, live order tracking,
// domestic Indian product suggestions, and multilingual inquiries.
// ─────────────────────────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/i;
const ORDER_ID_RE = /(?:ord[_-]?)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|(?:ord[_-]?)?[0-9a-f]{8}/i;
const PINCODE_RE = /\b([1-9][0-9]{5})\b/;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt/i,
  /reveal\s+(the\s+)?(api[_\s]?key|secret|token|password|env)/i,
  /drop\s+table/i,
  /select\s+\*\s+from/i,
  /dump\s+(all\s+)?(users|orders|database)/i,
  /developer\s+mode/i,
  /dan\s+mode/i,
  /bypass\s+security/i,
];

function isPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

// Supabase client instance
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdkkxpfhwrwyoardlceo.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka2t4cGZod3J3eW9hcmRsY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Njc2OTcsImV4cCI6MjEwNjQ0MzY5N30.qFvuYQ1G9NvYGYXWVtR6b9dPScOuUIfeVQ8yX3y1DJo';
  return createClient(url, key);
}

// Order lookup directly from Supabase
async function lookupOrders(emailOrId: string) {
  try {
    const sb = getSupabase();
    const clean = emailOrId.toLowerCase().trim();

    if (EMAIL_RE.test(clean)) {
      const { data, error } = await sb
        .from('orders')
        .select('id, user_email, total_amount, status, tracking_number, created_at, shipping_address')
        .eq('user_email', clean)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) return null;
      return data ?? [];
    }

    const { data, error } = await sb
      .from('orders')
      .select('id, user_email, total_amount, status, tracking_number, created_at, shipping_address')
      .ilike('id', `%${clean}%`)
      .order('created_at', { ascending: false })
      .limit(1);

      if (error) return null;
      return data ?? [];
  } catch {
    return null;
  }
}

function isDisallowedChatProduct(p: { id?: string; title?: string; category?: string }): boolean {
  const text = `${p.id || ''} ${p.title || ''} ${p.category || ''}`.toLowerCase();
  return /calmcloud|ember-glow|warm-paw|lickmat|pawtrack|cozy-nest|aesthetic-scratch|smart-fetch|disinfectant|medicine|pharma|ortho|anxiety|pet|dog|cat|veterinary|therapy|healing|antibacterial|sanitizer/i.test(text);
}

// Fetch live products from Supabase
async function getLiveProducts(categoryFilter?: string, limit = 3) {
  try {
    const sb = getSupabase();
    let query = sb
      .from('products')
      .select('id, title, price, price_inr, compare_at_price, category, emoji')
      .order('rating', { ascending: false })
      .limit(limit);

    if (categoryFilter) {
      query = query.ilike('category', `%${categoryFilter}%`);
    }

    const { data } = await query;
    if (data && data.length > 0) {
      return data
        .filter((p) => !isDisallowedChatProduct(p))
        .map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price_inr ? Number(p.price_inr) : Number(p.price || 999),
          emoji: p.emoji || '✨',
        }));
    }
  } catch {}

  // Fallback verified Indian products
  return [
    { id: 'meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base', title: '3D Crystal Ball Galaxy Night Lamp with Wooden Base', price: 399, emoji: '🔮' },
    { id: 'meesho-water-sensor-led-diyas-pack-of-12', title: 'Water Sensor LED Diyas (Pack of 12 Smokeless)', price: 399, emoji: '🪔' },
    { id: 'meesho-heavy-duty-welcome-textured-mesh-door-mat', title: 'Welcome Textured Mesh Entrance Door Mat', price: 449, emoji: '🚪' },
    { id: 'meesho-galaxy-star-astronaut-projector-night-lamp', title: 'Astronaut Galaxy Star Projector LED Night Lamp', price: 899, emoji: '🚀' },
  ];
}

// Search live products from Supabase by title keyword
async function searchLiveProducts(searchTerm: string, limit = 3) {
  try {
    const sb = getSupabase();
    const clean = searchTerm.trim().toLowerCase();
    const { data } = await sb
      .from('products')
      .select('id, title, price, price_inr, compare_at_price, category, emoji')
      .ilike('title', `%${clean}%`)
      .order('rating', { ascending: false })
      .limit(limit);

    if (data && data.length > 0) {
      return data
        .filter((p) => !isDisallowedChatProduct(p))
        .map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price_inr ? Number(p.price_inr) : Number(p.price || 449),
          emoji: p.emoji || '✨',
        }));
    }
  } catch {}
  return null;
}

// Call Google Gemini Flash LLM
async function callGemini(userMessage: string, contextSnippet = ''): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  if (!geminiKey) return null;

  const systemInstruction = `You are Radha, RareEmber's smart, warm, and helpful AI Shopping Concierge (rareember-store.vercel.app).
RareEmber is a premium Indian e-commerce store delivering directly from our Gujarat fulfillment center across all 19,000+ PIN codes in India.
Key Brand Rules:
1. Delivery & Timelines: Pan-India Express 2-4 business days via BlueDart, Delhivery, and India Post.
2. Cash on Delivery (COD): Fully available across India. Free shipping on prepaid orders & orders above ₹499.
3. If a customer provides or asks about ANY 6-digit Indian PIN code (e.g. 142001 in Punjab, 110001 in Delhi, etc.), confirm immediately and enthusiastically that their PIN code is 100% serviceable with 2-4 day express delivery and COD!
4. Returns & Guarantee: 7-Day Easy Replacement Policy for damaged, defective, or incorrect items. Support email: rareemberagency@gmail.com.
5. Tone: Polite, warm, respectful, energetic. You understand English, Hindi, and everyday Hinglish (e.g., "hlo", "haanji", "delivery ho jayegi").
6. Formatting: Keep responses concise, clear, and well-structured with friendly emojis and markdown bullet points. Never hallucinate fake international CJ shipping delays.
${contextSnippet ? `\nCurrent Context:\n${contextSnippet}` : ''}`;

  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemInstruction}\n\nCustomer Message: ${userMessage}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400,
            },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch {}
  }

  return null;
}

// Radha Agent Core Knowledge & Reasoning Engine
async function processRadhaQuery(message: string) {
  const q = message.toLowerCase();

  // 1. Prompt Injection & Jailbreak Defense
  if (isPromptInjection(message)) {
    return {
      reply:
        "🛡️ Namaste! I am Radha, RareEmber's official shopping concierge. I am here to help you with order tracking, PIN code serviceability, COD, and product recommendations.",
    };
  }

  // 2. PIN Code Inquiries & Delivery Serviceability (Fuzzy + Explicit)
  const pinMatch = message.match(PINCODE_RE);
  const wantsDelivery = /delver|deliver|pincode|pin code|shipping|cod available|postcode|reach|area|serviceable|location/.test(q);

  if (pinMatch || (wantsDelivery && /\d{4,6}/.test(q))) {
    const pin = pinMatch ? pinMatch[1] : 'your PIN code';
    const suggestedProducts = await getLiveProducts(undefined, 3);
    return {
      reply: `✅ **PIN Code ${pin} is 100% Serviceable!**\n\n• 🚚 **Express Delivery:** 2–4 business days via BlueDart & Delhivery Express.\n• 💵 **Cash on Delivery (COD):** Fully available at your doorstep!\n• 📦 **Dispatch:** Dispatched within 24 hours from our domestic fulfillment hub.\n• 🎁 **Free Shipping:** Applied automatically on all orders above ₹499.\n• 🛡️ **Easy Replacement:** 7-day hassle-free doorstep replacement for damaged/defective items.\n\nWould you like recommendations for trending items or need help placing your order?`,
      products: suggestedProducts,
    };
  }

  // 3. Order Tracking & Status Inquiries
  const emailMatch = message.match(EMAIL_RE);
  const orderIdMatch = message.match(ORDER_ID_RE);
  const wantsTrack = /track|where.*order|order.*status|package|parcel|shipment|delivery status|mera order/.test(q);

  if (wantsTrack || emailMatch || orderIdMatch) {
    const identifier = emailMatch?.[0] || orderIdMatch?.[0];
    if (!identifier) {
      return {
        reply:
          "📦 I can track your shipment right now! Please share your **Order ID** (e.g. `ord_...`) or the **Email Address** you entered during checkout.",
      };
    }

    const orders = await lookupOrders(identifier);
    if (!orders || orders.length === 0) {
      return {
        reply: `🔍 Radha searched our dispatch database for "${identifier}", but found no recent order yet.\n\n• If you just placed your order in the last 15 minutes, please allow a moment for confirmation.\n• You can also track in real time on our [Order Tracking Portal](/track) or reach our team at **rareemberagency@gmail.com**.`,
      };
    }

    const order = orders[0] as Record<string, any>;
    const orderRef = String(order.id).slice(0, 8);
    const trackingInfo = order.tracking_number
      ? `\n🚚 **Courier Tracking:** \`${order.tracking_number}\` (BlueDart / Delhivery)`
      : '\n🚚 **Courier Tracking:** Order packed & preparing for hub handover. Active tracking updates within 12–24h.';

    return {
      reply: `✅ **Order #${orderRef} Found**\n• **Status:** ${String(order.status || 'Confirmed & Processing').toUpperCase()}\n• **Amount:** ${formatPrice(Number(order.total_amount ?? 0))}${trackingInfo}\n\nNeed to modify your delivery address or prioritize express dispatch? Let me know!`,
    };
  }

  // 4. Exact Product Keyword Searches
  if (/\b(lamp|lamps|light|lights|night lamp|desk lamp|night light|candle|candles)\b/i.test(q)) {
    const prods = (await searchLiveProducts('lamp', 3)) || (await searchLiveProducts('light', 3)) || [];
    return {
      reply: `✨ **Lamps & Ambient Lighting:** Here are our top trending LED desk lamps and ambient night lights, in stock and ready for fast 2–4 days express dispatch with COD:`,
      products: prods,
    };
  }

  if (/\b(cable|cables|charger|chargers|lightning|iphone cable|fast charge|usb)\b/i.test(q)) {
    const prods = (await searchLiveProducts('cable', 3)) || (await searchLiveProducts('charge', 3)) || [];
    return {
      reply: `⚡ **Charging & Fast Sync Cables:** Heavy-duty braided fast-charging cables ready for quick dispatch:`,
      products: prods,
    };
  }

  if (/\b(bottle|bottles|water bottle|flask)\b/i.test(q)) {
    const prods = (await searchLiveProducts('bottle', 3)) || [];
    return {
      reply: `💧 **Hydration & Glass Bottles:** Aesthetic cartoon print leakproof water bottles:`,
      products: prods,
    };
  }

  if (/\b(sock|socks|ankle)\b/i.test(q)) {
    const prods = (await searchLiveProducts('socks', 3)) || [];
    return {
      reply: `🧦 **Comfort Casual Socks:** Premium soft stretchable ankle socks collection (Pack of 12):`,
      products: prods,
    };
  }

  if (/\b(mat|mats|door mat|doormat)\b/i.test(q)) {
    const prods = (await searchLiveProducts('mat', 3)) || [];
    return {
      reply: `🏠 **Home Entrance & Floor Mats:** Textured mesh aesthetic door mats ready for instant delivery:`,
      products: prods,
    };
  }

  if (/\b(spray|freshener|diffuser|mist|lamp)\b/i.test(q)) {
    const prods = (await searchLiveProducts('diffuser', 3)) || (await searchLiveProducts('lamp', 3)) || [];
    return {
      reply: `🌸 **Home Living & Ambience:** Ultrasonic ambient mist humidifiers and LED mood lighting:`,
      products: prods,
    };
  }

  if (/\b(shelf|shelves|organizer|organiser|rack)\b/i.test(q)) {
    const prods = (await searchLiveProducts('shelf', 3)) || (await searchLiveProducts('organis', 3)) || [];
    return {
      reply: `🪴 **Home Storage & Shelves:** Aesthetic wall shelves and drill-free organizers:`,
      products: prods,
    };
  }

  // 5. Category-Specific Product Inquiries
  if (/travel|accessories|sun.*glass|fashion|style|eyewear/.test(q)) {
    const prods = await getLiveProducts('fashion', 3);
    return {
      reply: `✨ **Curated Fashion & Lifestyle:** Handpicked polarized eyewear, statement accessories, and style drops with 1-Click COD:`,
      products: prods,
    };
  }

  if (/home|living|kitchen|decor|interior/.test(q)) {
    const prods = await getLiveProducts('home-garden', 3);
    return {
      reply: `🪴 **Home & Living Essentials:** Handpicked aesthetic organizers and lifestyle upgrades ready for fast dispatch:`,
      products: prods,
    };
  }

  if (/tech|gadget|electronic|smart|camera|mouse|audio|sound/.test(q)) {
    const prods = await getLiveProducts('electronics', 3);
    return {
      reply: `⚡ **Trending Tech & Gadgets:** Precision-tested productivity gear and smart everyday electronics:`,
      products: prods,
    };
  }

  if (/fashion|wear|cloth|style|apparel/.test(q)) {
    const prods = await getLiveProducts('fashion', 3);
    return {
      reply: `✨ **Curated Fashion & Apparel:** Premium comfort wear and accessories crafted for everyday style:`,
      products: prods,
    };
  }

  // 5. Try calling Gemini 3.8 Flash for intelligent natural language handling
  const geminiResponse = await callGemini(message);
  if (geminiResponse) {
    const isProductRelated = /trending|product|buy|item|catalog|shop|best|popular/.test(q);
    const attachedProducts = isProductRelated ? await getLiveProducts(undefined, 3) : undefined;
    return {
      reply: geminiResponse,
      products: attachedProducts,
    };
  }

  // 6. Natural Language Deterministic Fallbacks
  if (/^(hi|hello|hlo|hey|namaste|radha|good\s*(morning|evening|afternoon)|sup|yo)/i.test(q)) {
    const prods = await getLiveProducts(undefined, 3);
    return {
      reply: `👋 Namaste! I am **Radha**, RareEmber's AI Shopping Concierge.\n\nHere is what I can do for you right now:\n1. 🚚 **Verify PIN Code & COD** — Tell me your PIN code (e.g. 142001).\n2. 📦 **Track an Order** — Provide your email or Order ID.\n3. ✨ **Trending Recommendations** — Browse viral tech gadgets, home aesthetics, or lifestyle items.\n4. 🛡️ **Assistance with Returns** — 7-day easy replacement policy for damaged items.\n\nHow may I help you today?`,
      products: prods,
    };
  }

  if (/cod|cash on delivery|pay on delivery|payment method|upi|gpay|phonepe/.test(q)) {
    return {
      reply: `💵 **Payment & Cash on Delivery (COD):**\n• **Cash on Delivery:** Available across 19,000+ Indian PIN codes at no extra charge.\n• **Prepaid Options:** Instant 100% secure checkout via UPI (Google Pay, PhonePe, Paytm) and Cards.\n• **Safety:** Secured with 256-Bit SSL encryption via Razorpay.`,
    };
  }

  if (/return|refund|replace|damaged|broken|exchange|cancel/.test(q)) {
    return {
      reply: `🛡️ **7-Day Easy Replacement Policy:**\n• If your product arrives damaged or defective, we provide an instant free doorstep replacement or resolution within 7 days of delivery.\n• No complicated paperwork — simply email rareemberagency@gmail.com with your Order ID or reach us here.`,
    };
  }

  // 7. General Fallback with real Indian winners
  const trendingProds = await getLiveProducts(undefined, 3);
  return {
    reply: `Namaste! I am **Radha**, RareEmber's concierge. You can ask me to **track an order**, check **express delivery & COD** for your PIN code, or explore our top-rated trending products below:`,
    products: trendingProds,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const rl = checkRateLimit(`radha_chat:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          reply: '⚠️ Rate limit reached. Please wait a moment before sending another query.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const sanitized = sanitizeMessage(body?.message);

    if (!sanitized || sanitized.trim().length === 0) {
      return NextResponse.json({
        reply: "👋 Namaste! I am Radha. How can I help you today? You can ask about delivery to your PIN code, track an order, or browse trending products.",
      });
    }

    if (sanitized.length > 500) {
      return NextResponse.json({
        reply: 'Please keep your message concise (under 500 characters) so Radha can assist you quickly.',
      });
    }

    const output = await processRadhaQuery(sanitized);
    return NextResponse.json(output);
  } catch (err) {
    return NextResponse.json(
      {
        reply: 'Radha is briefly connecting with the server. Please ask again or contact support at rareemberagency@gmail.com.',
      },
      { status: 200 }
    );
  }
}
