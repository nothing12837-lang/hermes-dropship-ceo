import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { askAgent } from '@/lib/agent/ai';
import { getOverview, inr } from '@/lib/agent/analytics';
import { products, cleanBrandTitle, computeDiscount } from '@/lib/data/products';
import { getServiceSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export type AgentTaskType =
  | 'margin_audit'
  | 'rto_risk_audit'
  | 'support_solver'
  | 'creative_copywriter'
  | 'seo_optimizer'
  | 'copilot_chat'
  | 'growth_strategy';

interface TaskPayload {
  task: AgentTaskType;
  userPrompt?: string;
  productId?: string;
  customerQuery?: string;
  orderId?: string;
  channel?: 'whatsapp' | 'email' | 'instagram' | 'meta_ads';
  minMarginPct?: number;
  deliveryCost?: number;
}

// Qikink Base Print & Garment Cost Estimator based on silhouette
function estimateBaseCost(p: any): number {
  const cat = (p.category || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  const slug = (p.slug || '').toLowerCase();
  const desc = (p.description || '').toLowerCase();

  if (title.includes('hoodie') || slug.includes('hoodie') || cat.includes('hoodie') || desc.includes('380 gsm')) {
    return 590; // 380 GSM loopback French terry + DTF print
  }
  if (title.includes('jacket') || title.includes('bomber') || title.includes('varsity')) {
    return 650; // Heavyweight outerwear + embroidery/print
  }
  if (title.includes('full sleeve') || slug.includes('full-sleeve')) {
    return 320; // Full sleeve combed cotton + print
  }
  if (title.includes('sweatshirt') || slug.includes('sweatshirt')) {
    return 480; // 320 GSM fleece crewneck
  }
  if (title.includes('crop') || slug.includes('crop')) {
    return 210; // Women's combed cotton crop
  }
  if (title.includes('oversized') || title.includes('jersey') || desc.includes('240 gsm')) {
    return 285; // 240 GSM box-fit combed tee + HD print
  }
  if (title.includes('girl') || title.includes('kids')) {
    return 190; // Youth combed crewneck
  }
  // Standard combed cotton graphic t-shirt
  return 245;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized. Admin Vault Key required.' }, { status: 401 });
  }

  const rl = checkRateLimit(`agent_tasks:${clientIp(req.headers)}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit reached. Please wait a minute.' }, { status: 429 });
  }

  try {
    const body: TaskPayload = await req.json();
    const task = body.task || 'growth_strategy';
    const deliveryCost = body.deliveryCost ?? 100;
    const minMarginPct = body.minMarginPct ?? 40;

    // Load store analytics overview for live context grounding
    let storeOverview: any = null;
    try {
      storeOverview = await getOverview(7);
    } catch {}

    // =========================================================================
    // TASK 1: MARGIN AUDIT & PRICING GATEKEEPER (Minimum 40% Profit + ₹100 Delivery)
    // =========================================================================
    if (task === 'margin_audit') {
      const auditResults = products.map((p) => {
        const sellingPrice = p.price_inr || p.price || 0;
        const baseCost = estimateBaseCost(p);
        const gst = Math.round((baseCost + deliveryCost) * 0.05); // 5% apparel GST
        const totalLandedCost = baseCost + deliveryCost + gst;
        const grossProfit = sellingPrice - totalLandedCost;
        const marginPct = sellingPrice > 0 ? Math.round((grossProfit / sellingPrice) * 1000) / 10 : 0;
        const meetsTarget = marginPct >= minMarginPct;
        const targetPrice = Math.ceil(totalLandedCost / (1 - minMarginPct / 100));
        // Round to attractive 99 ending
        const recommendedPrice = Math.ceil(targetPrice / 10) * 10 - 1;

        return {
          id: p.id,
          title: cleanBrandTitle(p.title),
          category: p.category || 'streetwear',
          sellingPrice,
          baseCost,
          deliveryCost,
          gst,
          totalLandedCost,
          grossProfit,
          marginPct,
          meetsTarget,
          recommendedPrice: meetsTarget ? sellingPrice : Math.max(sellingPrice, recommendedPrice),
          status: meetsTarget ? 'COMPLIANT (≥40%)' : 'MARGIN_WARNING (<40%)',
        };
      });

      const totalItems = auditResults.length;
      const compliantItems = auditResults.filter((r) => r.meetsTarget).length;
      const warningItems = auditResults.filter((r) => !r.meetsTarget);
      const avgMarginPct = Math.round(auditResults.reduce((acc, curr) => acc + curr.marginPct, 0) / Math.max(1, totalItems));

      const systemPrompt =
        'You are the Chief Financial Officer & Margin Strategist for Rare Ember (https://rareember.shop), an independent Indian D2C streetwear brand. ' +
        'Our core operating rule: Pan-India express air delivery costs ₹100 and MUST be included in every product price (never charged separately at checkout). ' +
        'Every product MUST achieve a MINIMUM 40% gross profit margin after accounting for Qikink blank + DTF print + ₹100 express delivery + 5% GST.\n\n' +
        'Analyze the audit data provided and output a crisp executive report in Markdown:\n' +
        '1. Executive Margin Health Score & Compliance Overview\n' +
        '2. Products Needing Immediate Price Calibration (list item name, current price, and recommended price to hit 40%+ margin)\n' +
        '3. Multi-Pack Bundle Opportunities (e.g. 2-Tee packs that save delivery overhead and boost margin to 48%+)\n' +
        '4. Founder Action Checklist\n\n' +
        'Tone: Ultra-crisp, quantitative, Rupee (₹) grounded. Never invent fictitious products.';

      const userPrompt = JSON.stringify({
        rule: `Minimum ${minMarginPct}% gross profit, ₹${deliveryCost} delivery fee included`,
        catalogSummary: {
          totalItems,
          compliantCount: compliantItems,
          warningCount: warningItems.length,
          averageMarginPct: `${avgMarginPct}%`,
        },
        warningsSample: warningItems.slice(0, 10),
        topCompliantSample: auditResults.filter((r) => r.meetsTarget).slice(0, 5),
      });

      const aiAnalysis = await askAgent(userPrompt, systemPrompt, 1400);

      return NextResponse.json({
        ok: true,
        task,
        summary: {
          totalProducts: totalItems,
          compliantCount: compliantItems,
          warningCount: warningItems.length,
          avgMarginPct,
          minMarginTargetPct: minMarginPct,
          deliveryCostIncluded: deliveryCost,
        },
        items: auditResults,
        aiAnalysis: aiAnalysis || 'Margin audit completed. Rule compliance calculated.',
      });
    }

    // =========================================================================
    // TASK 2: RTO & COD RISK SENTINEL (Cash on Delivery Fraud & Address Protection)
    // =========================================================================
    if (task === 'rto_risk_audit') {
      const sb = getServiceSupabase();
      let liveOrders: any[] = [];

      if (sb) {
        try {
          const { data } = await sb
            .from('orders')
            .select('id, email, shipping_name, shipping_address, total, payment_method, status, created_at')
            .order('created_at', { ascending: false })
            .limit(15);
          if (data && data.length > 0) liveOrders = data;
        } catch {}
      }

      // If no orders yet, analyze active sample order
      if (liveOrders.length === 0) {
        liveOrders = [
          {
            id: '7792e434-7bf5-4ff4-9296-cf2f4c2af57f',
            email: 'ajayrajbharrr0@gmail.com',
            shipping_name: 'Ajay Rajbhar',
            shipping_address: {
              city: 'Bangalore',
              state: 'Karnataka',
              zip: '562107',
              line1: 'Near Aerospace Park, Bagalur Main Rd',
            },
            total: 548,
            payment_method: 'cod',
            status: 'processing',
            created_at: '2026-10-22T07:19:00.000Z',
          },
        ];
      }

      // Evaluate order risk heuristics
      const evaluatedOrders = liveOrders.map((o) => {
        const isCod = o.payment_method === 'cod' || (o.status || '').toLowerCase().includes('cod');
        const zip = o.shipping_address?.zip || '';
        const line1 = o.shipping_address?.line1 || '';
        const name = o.shipping_name || '';

        let riskScore = 10; // Base baseline
        const flags: string[] = [];

        if (isCod) {
          riskScore += 25;
          flags.push('Cash on Delivery');
        } else {
          riskScore -= 10;
          flags.push('Prepaid Verified');
        }

        if (zip.length !== 6 || !/^\d{6}$/.test(zip)) {
          riskScore += 35;
          flags.push('Invalid/Suspicious 6-Digit PIN');
        } else {
          flags.push('Valid Indian Postal PIN');
        }

        if (line1.length < 15) {
          riskScore += 25;
          flags.push('Short / Incomplete Street Address');
        }

        if (name.trim().split(' ').length < 2) {
          riskScore += 15;
          flags.push('Single Word Name');
        }

        const clampedScore = Math.max(5, Math.min(95, riskScore));
        const riskLevel = clampedScore < 30 ? 'LOW' : clampedScore < 60 ? 'MEDIUM' : 'HIGH';

        // Pre-filled WhatsApp OTP / Address Confirmation link
        const cleanPhone = (o.phone || '9118211860').replace(/\D/g, '');
        const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const confirmMsg = encodeURIComponent(
          `Hi ${name || 'there'}! This is RareEmber Atelier (rareember.shop). Your COD Order #${o.id.slice(0, 8)} for ₹${o.total} is ready for dispatch to ${o.shipping_address?.city || 'your address'}, PIN ${zip}. Please reply YES to confirm physical doorstep delivery via Delhivery Air.`
        );
        const waLink = `https://wa.me/${targetPhone}?text=${confirmMsg}`;

        return {
          id: o.id,
          name,
          email: o.email,
          city: o.shipping_address?.city,
          zip,
          total: o.total,
          isCod,
          riskScore: clampedScore,
          riskLevel,
          flags,
          waConfirmLink: waLink,
        };
      });

      const systemPrompt =
        'You are the AI Risk & Logistics Sentinel for Rare Ember (rareember.shop). ' +
        'COD orders carry a 25-35% industry RTO (Return-to-Origin) risk in Indian e-commerce if unconfirmed. ' +
        'Analyze these orders and deliver a tactical RTO reduction directive in Markdown:\n' +
        '1. COD Risk Summary & Flagged Orders\n' +
        '2. Verification Protocol (WhatsApp 1-tap confirmation scripts)\n' +
        '3. RTO Prevention Playbook (Incentivizing switch from COD to UPI with ₹50 store credit)\n' +
        'Tone: Analytical, protective of margins, focused on cash collection.';

      const aiAnalysis = await askAgent(JSON.stringify(evaluatedOrders), systemPrompt, 1200);

      return NextResponse.json({
        ok: true,
        task,
        orders: evaluatedOrders,
        aiAnalysis: aiAnalysis || 'RTO risk analysis completed.',
      });
    }

    // =========================================================================
    // TASK 3: CUSTOMER CARE & SUPPORT CONCIERGE (Live Delhivery / Size Exchange)
    // =========================================================================
    if (task === 'support_solver') {
      const query = body.customerQuery || 'Where is my order? Delhivery tracking link says no scans found.';
      const orderId = body.orderId || '7792e434';

      const systemPrompt =
        'You are the Senior Concierge & Customer Care Specialist for Rare Ember (https://rareember.shop). ' +
        'Brand details: Independent Indian heavyweight streetwear, Tirupur production hub, express air courier via Delhivery & BlueDart. ' +
        'Official support email: support@rareember.shop. Guarantee: 7-Day Free Doorstep Size & Quality Replacement Guarantee.\n\n' +
        'IMPORTANT COURIER TELEMETRY CONTEXT:\n' +
        'When an order has just been placed and is in Stage 2 (In Production & Quality Check), an AWB (like BD-18023747616) is pre-allocated on our manifest. ' +
        'Delhivery’s public portal only displays live flight scans once physical barcode handover occurs at the Coimbatore airport hub (Stage 3). ' +
        'Reassure the customer with warmth, transparency, and streetwear prestige.\n\n' +
        'Format your response in Markdown with TWO CLEAR SECTIONS:\n' +
        '### 1. 📱 Ready-to-Send WhatsApp Reply (with bold text, emojis, tracking link, and warm sign-off)\n' +
        '### 2. ✉️ Official Email Reply (Professional subject line, structured body, and support signature)\n\n' +
        'Tone: Elegant, warm, reassuring, never robotic.';

      const userPrompt = `Customer Query: "${query}"\nReferenced Order ID: ${orderId}\nCustomer Email: ajayrajbharrr0@gmail.com\nCourier Waybill: BD-18023747616 (Delhivery Air Express)\nStatus: In Production & Quality Check (Tirupur Hub)`;

      const aiResponse = await askAgent(userPrompt, systemPrompt, 1200);

      return NextResponse.json({
        ok: true,
        task,
        customerQuery: query,
        orderId,
        resolution: aiResponse || 'Customer support resolution generated.',
      });
    }

    // =========================================================================
    // TASK 4: CREATIVE STREETWEAR COPYWRITER & AD ENGINE
    // =========================================================================
    if (task === 'creative_copywriter') {
      const targetProduct = (body.productId ? products.find((p) => p.id === body.productId) : null) || products[0];
      const title = cleanBrandTitle(targetProduct.title);
      const price = targetProduct.price_inr || targetProduct.price;

      const systemPrompt =
        'You are the Creative Director & Streetwear Copywriter for Rare Ember (https://rareember.shop). ' +
        'Craft authentic, editorial, high-converting social & advertising copy for our drops. ' +
        'We reject generic dropshipping tropes. Emphasize 240 GSM bio-washed combed cotton, 380 GSM loopback French terry, Tirupur loom milling, structured drop-shoulder drape, and included express air dispatch.\n\n' +
        'Generate THREE high-energy creative assets in Markdown:\n' +
        '### 1. 📸 Instagram Feed & Carousel Caption (Editorial hook, fabric specs, subtle FOMO, curated streetwear tags like #RareEmber #IndianStreetwear #240GSM)\n' +
        '### 2. 🎬 3-Second Viral Reel / Shorts Hook (High-contrast visual opening for content creators, e.g. "Stop wearing see-through fast fashion tees...")\n' +
        '### 3. ⚡ WhatsApp VIP Drop Broadcast (Punchy, urgent, direct checkout link with Free Air Delivery callout)\n\n' +
        'Tone: Jacquemus meets Stüssy — sharp, tactile, confident.';

      const userPrompt = JSON.stringify({
        productName: title,
        sellingPrice: inr(price),
        mrp: inr(targetProduct.compareAtPrice || price * 1.8),
        colors: targetProduct.colors || ['Black', 'White', 'Melange'],
        sizes: targetProduct.sizes || ['S', 'M', 'L', 'XL', '2XL'],
        productUrl: `https://www.rareember.shop/product/${targetProduct.slug || targetProduct.id}`,
      });

      const copy = await askAgent(userPrompt, systemPrompt, 1300);

      return NextResponse.json({
        ok: true,
        task,
        product: {
          id: targetProduct.id,
          title,
          price,
          url: `https://www.rareember.shop/product/${targetProduct.slug || targetProduct.id}`,
        },
        copy: copy || 'Creative copy generated.',
      });
    }

    // =========================================================================
    // TASK 5: SEO & GOOGLE MERCHANT FEED OPTIMIZER
    // =========================================================================
    if (task === 'seo_optimizer') {
      const targetProduct = (body.productId ? products.find((p) => p.id === body.productId) : null) || products[0];
      const title = cleanBrandTitle(targetProduct.title);

      const systemPrompt =
        'You are the Principal Technical SEO & Google Merchant Center Architect for Rare Ember (rareember.shop). ' +
        'Optimize product discovery for Indian streetwear queries on Google Search & Shopping.\n\n' +
        'Generate structured SEO specifications in Markdown:\n' +
        '### 1. High-CTR Meta Title (< 60 chars with high-intent keywords)\n' +
        '### 2. High-Converting Meta Description (< 155 chars with GSM, price, delivery included)\n' +
        '### 3. Top 10 High-Intent Search Queries (Targeted Indian search terms)\n' +
        '### 4. Schema.org Product JSON-LD (Valid JSON-LD snippet with Brand, Offers, InStock, Currency INR)\n\n' +
        'Focus on search intent: "oversized t shirt men 240 gsm india", "heavyweight cotton streetwear india".';

      const userPrompt = JSON.stringify({
        productTitle: title,
        category: targetProduct.category,
        price: targetProduct.price_inr || targetProduct.price,
        description: (targetProduct as any).description || targetProduct.short,
        canonicalUrl: `https://www.rareember.shop/product/${targetProduct.slug || targetProduct.id}`,
      });

      const seoSpec = await askAgent(userPrompt, systemPrompt, 1200);

      return NextResponse.json({
        ok: true,
        task,
        product: { id: targetProduct.id, title },
        seoSpec: seoSpec || 'SEO specifications generated.',
      });
    }

    // =========================================================================
    // TASK 6: INTERACTIVE FOUNDER COPILOT (Ask Anything to Radha / Hermes CEO)
    // =========================================================================
    if (task === 'copilot_chat') {
      const userInstruction = body.userPrompt || 'How can we increase our daily order volume while keeping COD RTO below 10%?';

      const systemPrompt =
        'You are Radha, the Autonomous AI CEO & Strategic Growth Sentinel of Rare Ember (https://rareember.shop). ' +
        'You are conversing directly with Founder Ajay Rajbhar. ' +
        'Brand DNA: Curated Indian streetwear, Tirupur hub production, Qikink POD fulfillment, Delhivery Air logistics, 40%+ gross margins, express air delivery included in all prices.\n\n' +
        'Answer Ajay’s questions with razor-sharp business intelligence, real quantitative calculations in Indian Rupees (₹), ' +
        'actionable engineering & marketing steps, and strategic leadership. Be thorough, clear, and inspiring.';

      const contextPayload = {
        founder: 'Ajay Rajbhar',
        storeTelemetry: storeOverview
          ? {
              visits: storeOverview.visits,
              conversionPct: `${storeOverview.conversionPct}%`,
              revenue: inr(storeOverview.revenue),
              aov: inr(storeOverview.aov),
              codPipeline: inr(storeOverview.codCashGap?.amount || 0),
            }
          : 'Live telemetry active',
        catalogSize: products.length,
        deliveryPolicy: '₹100 Express Air included everywhere, minimum 40% margin required',
        instruction: userInstruction,
      };

      const response = await askAgent(JSON.stringify(contextPayload), systemPrompt, 1400);

      return NextResponse.json({
        ok: true,
        task,
        prompt: userInstruction,
        response: response || 'Radha AI Copilot response synthesized.',
      });
    }

    // Default: Fallback to General Growth Strategy
    const strategy = await askAgent(
      JSON.stringify(storeOverview || {}),
      'You are the Principal AI Growth Strategist for Rare Ember. Synthesize a 4-point tactical growth directive in Markdown.',
      1200
    );

    return NextResponse.json({
      ok: true,
      task: 'growth_strategy',
      strategy: strategy || 'Growth strategy synthesized.',
    });
  } catch (err: any) {
    console.error('Agent task error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
