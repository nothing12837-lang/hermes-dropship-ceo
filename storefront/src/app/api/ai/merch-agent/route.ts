import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { notifyTelegramOrder } from '@/lib/notifications/telegram';

interface PricingTier {
  min: number;
  max: number;
  teePrice: number;
  hoodiePrice: number;
  matPrice: number;
}

const PRICING_TIERS: PricingTier[] = [
  { min: 25, max: 50, teePrice: 399, hoodiePrice: 699, matPrice: 449 },
  { min: 51, max: 100, teePrice: 349, hoodiePrice: 649, matPrice: 399 },
  { min: 101, max: 250, teePrice: 299, hoodiePrice: 599, matPrice: 349 },
  { min: 251, max: 5000, teePrice: 269, hoodiePrice: 549, matPrice: 299 },
];

function calculateTierQuote(productType: 'tee' | 'hoodie' | 'mat', qty: number) {
  const boundedQty = Math.max(25, qty);
  const tier = PRICING_TIERS.find((t) => boundedQty >= t.min && boundedQty <= t.max) || PRICING_TIERS[PRICING_TIERS.length - 1];
  const unitPrice = productType === 'tee' ? tier.teePrice : productType === 'hoodie' ? tier.hoodiePrice : tier.matPrice;
  const retailPrice = productType === 'tee' ? 699 : productType === 'hoodie' ? 1499 : 899;
  const totalAmount = unitPrice * boundedQty;
  const retailTotal = retailPrice * boundedQty;
  const advanceAmount = Math.round(totalAmount * 0.20); // 20% Advance Booking Deposit
  const productName = productType === 'tee' ? '240 GSM Combed Bio-Washed Heavyweight Tee' : productType === 'hoodie' ? '380 GSM Heavyweight French Terry Fleece Hoodie' : '900x400x4mm Extended Gaming Desk Mat';

  return {
    productType,
    productName,
    quantity: boundedQty,
    unitPrice,
    totalAmount,
    advanceAmount,
    balanceAmount: totalAmount - advanceAmount,
    savings: retailTotal - totalAmount,
  };
}

function getRazorpay(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

const SYSTEM_PROMPT = `You are EmberAI, the Autonomous B2B Merch Specialist & Production Engineer for RareEmber (rareember.shop).
Your goal is to consult with campus fest organizers, hackathon leads, tech startups, and creators who need custom high-grade merchandise, provide transparent tier pricing, explain fabrics, and facilitate a 20% advance booking deposit.

Brand & Factory Moat:
- Direct knitwear manufacturing in Tirupur, Tamil Nadu (India's garment capital).
- Fabrics: 
  * 240+ GSM Super Combed Bio-Washed 100% Cotton (drop shoulder, pre-shrunk, 1.25" lycra ribbed collar).
  * 380 GSM Heavyweight French Terry Brushed Fleece Hoodies (double-layered hood, kangaroo pocket, anti-sag derby ribbing).
  * 900x400x4mm Extended Precision Micro-Weave Gaming Desk Mats (spill-resistant, vulcanized natural rubber).
- Printing: 1200 DPI High-Density Archival Direct-to-Film (DTF) prints tested for 50+ machine washes.
- Guarantees: ZERO setup fees, ZERO screen charges, FREE digital 3D mockups in 2 hours, FREE sample kit for orders of 50+ units.
- Logistics: 4–6 business days door delivery Pan-India via BlueDart Air & Delhivery Surface.
- Payment Terms: 20% Advance Booking Deposit to reserve the fabric lot & begin film printing; remaining 80% balance due upon dispatch with video inspection.

Pricing Tiers:
- Heavyweight Tees (240 GSM): 25–50 units @ ₹399 | 51–100 units @ ₹349 | 101–250 units @ ₹299 | 251+ units @ ₹269
- Fleece Hoodies (380 GSM): 25–50 units @ ₹699 | 51–100 units @ ₹649 | 101–250 units @ ₹599 | 251+ units @ ₹549
- Desk Mats (900x400mm): 25–50 units @ ₹449 | 51–100 units @ ₹399 | 101–250 units @ ₹349 | 251+ units @ ₹299

Guidelines for Your Responses:
1. Be enthusiastic, concise, professional, and knowledgeable about streetwear manufacturing and hackathon timelines.
2. When the user asks for a quote or specifies quantity, calculate the numbers clearly.
3. ALWAYS include the 20% advance booking deposit amount and explain that locking the 20% deposit reserves the knitwear batch and puts their design in the 2-hour 3D proof queue.
4. When you have enough info to quote (or when the user asks for pricing), embed this special JSON block at the very end of your response:
<<<QUOTE_DATA:{"productType":"tee|hoodie|mat","productName":"...","quantity":N,"unitPrice":N,"totalAmount":N,"advanceAmount":N,"savings":N}>>>
This allows the frontend to render an instant 1-click Razorpay advance deposit button.
5. If the user asks about physical samples, explain: "We dispatch a free blank/print sample kit for all orders of 50+ units immediately upon 20% advance booking, or you can order 1 retail piece on our store with 100% refund credit against your bulk run."`;

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`merch_ai:${clientIp(req.headers)}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const action = body.action || 'chat';

    // ACTION 1: CREATE 20% ADVANCE BOOKING PAYMENT (RAZORPAY)
    if (action === 'create_advance_order') {
      const {
        productType = 'tee',
        quantity = 35,
        orgName = 'Campus Club',
        contactName = 'Lead Organizer',
        phone = '',
        email = '',
        eventDate = '',
        notes = '',
      } = body;

      const quote = calculateTierQuote(productType, Number(quantity));
      const advancePaise = quote.advanceAmount * 100;

      const rzp = getRazorpay();
      let razorpayOrderId = `mock_adv_${Date.now()}`;
      let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_mock';

      if (rzp) {
        try {
          const rzOrder = await rzp.orders.create({
            amount: advancePaise,
            currency: 'INR',
            receipt: `rcpt_adv_${Date.now()}`,
            notes: {
              type: 'b2b_advance_deposit',
              orgName,
              contactName,
              phone,
              email,
              productType,
              quantity: String(quote.quantity),
              eventDate,
              totalAmount: String(quote.totalAmount),
              advanceAmount: String(quote.advanceAmount),
            },
          });
          razorpayOrderId = rzOrder.id;
        } catch (e: any) {
          console.error('Razorpay Advance Order failed:', e?.message);
        }
      }

      // Notify Founder on Telegram
      try {
        await notifyTelegramOrder({
          id: razorpayOrderId,
          email: email || 'b2b-lead@rareember.shop',
          name: `${contactName} (${orgName})`,
          total: quote.advanceAmount,
          paymentMethod: 'razorpay_b2b_advance_20pct',
          items: [
            {
              id: `b2b-${productType}`,
              title: `${quote.productName} (Qty: ${quote.quantity} units)`,
              price: quote.unitPrice,
              qty: quote.quantity,
            },
          ],
        });
      } catch {}

      return NextResponse.json({
        ok: true,
        order_id: razorpayOrderId,
        amount: advancePaise,
        advance_amount: quote.advanceAmount,
        total_amount: quote.totalAmount,
        balance_amount: quote.balanceAmount,
        key_id: keyId,
        currency: 'INR',
        quote,
      });
    }

    // ACTION 2: CONVERSE VIA GEMINI API (WITH RULE-BASED ROBUST FALLBACK)
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const latestUserMsg = messages[messages.length - 1]?.content || 'Hello, I want bulk merch';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const contents = [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: "Understood. I am EmberAI, ready to assist high-impact campus organizers, startups, and creators with custom merch quotes, fabric guidance, and advance booking." }] },
          ...messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return NextResponse.json({
              role: 'assistant',
              content: candidateText,
            });
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call fallback:', geminiError?.message);
      }
    }

    // INTELLIGENT RULE-BASED FALLBACK ENGINE
    const lower = latestUserMsg.toLowerCase();
    let productType: 'tee' | 'hoodie' | 'mat' = 'tee';
    if (lower.includes('hoodie') || lower.includes('sweatshirt')) productType = 'hoodie';
    else if (lower.includes('mat') || lower.includes('mousepad') || lower.includes('desk')) productType = 'mat';

    // Parse quantity
    const qtyMatch = lower.match(/\b(\d{2,4})\b/);
    const quantity = qtyMatch ? Math.max(25, parseInt(qtyMatch[1], 10)) : 50;

    const quote = calculateTierQuote(productType, quantity);

    let reply = `👋 Hey! I'm **EmberAI**, RareEmber's B2B Merch Specialist.\n\n` +
      `Here is your live production quote for **${quote.quantity}x ${quote.productName}** direct from our Tirupur domestic hub:\n\n` +
      `• **Bulk Tier Price:** ₹${quote.unitPrice}/unit (Standard retail: ₹${productType === 'tee' ? 699 : productType === 'hoodie' ? 1499 : 899})\n` +
      `• **Total Order Value:** ₹${quote.totalAmount.toLocaleString('en-IN')}\n` +
      `• **Your Bulk Savings:** ₹${quote.savings.toLocaleString('en-IN')}\n` +
      `• **Screen & Setup Fees:** ₹0 (FREE)\n` +
      `• **Doorstep Delivery:** 4–6 Days via BlueDart Air & Delhivery\n\n` +
      `⚡ **Advance Booking Terms:**\n` +
      `To lock your knitwear lot and begin 1200 DPI DTF film printing, we only require a **20% Advance Booking Deposit (₹${quote.advanceAmount.toLocaleString('en-IN')})**. The remaining balance of ₹${quote.balanceAmount.toLocaleString('en-IN')} is paid upon pre-dispatch video inspection.\n\n` +
      `Would you like to lock this 20% advance slot right now or review digital 3D mockups first?\n\n` +
      `<<<QUOTE_DATA:${JSON.stringify(quote)}>>>`;

    if (lower.includes('sample') || lower.includes('fabric')) {
      reply = `✨ **Fabric & Sample Guarantee:**\n\n` +
        `• **Tees:** 240+ GSM 100% Super Combed Bio-Washed Cotton with 1.25" lycra ribbed neckband.\n` +
        `• **Hoodies:** 380 GSM Heavy French Terry Brushed Fleece with structured double-lined hood.\n` +
        `• **Printing:** OEKO-TEX certified 1200 DPI DTF prints tested for 50+ washes.\n\n` +
        `📦 **Free Sample Policy:** For every order of 50+ units, we dispatch a complimentary sample pack directly to your campus or office upon paying the 20% advance booking deposit. Alternatively, you can order 1 retail piece on our storefront, and we credit 100% of that cost against your final bulk invoice!\n\n` +
        `<<<QUOTE_DATA:${JSON.stringify(quote)}>>>`;
    }

    return NextResponse.json({
      role: 'assistant',
      content: reply,
    });
  } catch (err: any) {
    console.error('Merch Agent API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
