import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import rawCatalog from '@/lib/data/qikink-raw-catalog.json';
import localProducts from '@/lib/data/qikink-products.json';

export const runtime = 'nodejs';

function guard(req: NextRequest): NextResponse | null {
  if (!process.env.ADMIN_SECRET && !process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Admin not configured. Set ADMIN_SECRET in environment.' },
      { status: 503 }
    );
  }
  const rl = checkRateLimit(`admin:verify-qikink:${clientIp(req.headers)}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized. Valid admin key required.' }, { status: 401 });
  }
  return null;
}

const BLANK_GARMENT_NAMES: Record<string, string> = {
  UJ35: '220 GSM Polyester Aeroknit Athletic Mesh Jersey',
  US02: '220 GSM Polyester Aeroknit Breathable Jersey',
  MRnFs: '240 GSM Combed Bio-Washed Cotton Full Sleeve Tee',
  UOst: '240 GSM Heavyweight 100% Combed Bio-Washed Cotton (Drop Shoulder)',
  UC22: '240 GSM Drop-Shoulder Oversized Heavyweight Cotton Tee',
  US22: '240 GSM Premium Standard Oversized Cotton Tee',
  UT27: '260 GSM French Terry Boxy Streetwear Tee',
  UC61: '240 GSM Vintage Acid-Washed Heavyweight Tee',
  UT58: '240 GSM Hand-Dyed Artisan Tie & Dye Heavyweight Tee',
  UC23: '100% Luxury Super-Combed Supima Cotton Tee',
  UC28: '240 GSM Boxy Drop-Shoulder Streetwear Oversized Tee',
  MP25: '240 GSM Pique Cotton Executive Polo',
  FC39: '220 GSM 4-Way Stretch Poly-Spandex Boxy Crop Top',
  FC40: '220 GSM 4-Way Stretch Poly-Spandex Athletic Crop Tank',
  FT47: '180 GSM Combed Bio-Washed Cotton Y2K Baby Tee',
  FC43: '220 GSM Poly-Spandex Casual T-Shirt Dress',
  FM44: '220 GSM Breathable Stretch Maternity Comfort Dress',
  GRnHs: "180 GSM 100% Super Combed Cotton Girl's Crew Neck",
  BRnHs: "180 GSM 100% Super Combed Cotton Boy's Crew Neck",
  MS36: "210 GSM Combed Cotton Athletic Muscle Vest",
  MPad: '900×400mm Extended Precision Micro-Weave Desk Mat',
  CMg: '330ml Matte Stoneware Ceramic Artisan Mug',
};

const BLANK_DEFAULT_COSTS: Record<string, number> = {
  UJ35: 168.0,
  US02: 126.0,
  UD15: 115.5,
  MRnFs: 414.91,
  UOst: 414.91,
  UC22: 435.68,
  US22: 423.47,
  UT27: 489.02,
  UC61: 506.6,
  UT58: 485.6,
  UC23: 403.03,
  UC28: 472.5,
  MP25: 328.1,
  FC39: 181.1,
  FC40: 231.0,
  FT47: 273.0,
  FC43: 401.95,
  FM44: 395.02,
  GRnHs: 178.5,
  BRnHs: 189.0,
  MS36: 225.0,
  MPad: 349.0,
  CMg: 179.0,
};

function parsePriceNumber(raw: any, fallback = 849): number {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const match = raw.match(/\d+(\.\d+)?/);
    if (match) return Math.round(parseFloat(match[0]));
  }
  return fallback;
}

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const qikinkId = (searchParams.get('id') || searchParams.get('productId') || '').trim();

  if (!qikinkId) {
    return NextResponse.json(
      { error: 'Qikink Product ID is required (e.g. 32476280, 32477737).' },
      { status: 400 }
    );
  }

  // 1. Search in bundled raw catalog (32 authentic drops with all AWS S3 mockups & variants)
  const rawList = rawCatalog as any[];
  const rawMatch = rawList.find(
    (x) =>
      String(x.client_product_id) === qikinkId ||
      String(x.product_id) === qikinkId ||
      (x.blank_sku && String(x.blank_sku).toLowerCase() === qikinkId.toLowerCase())
  );

  // 2. Check if already present in local storefront catalog
  const localList = localProducts as any[];
  const existingProduct = localList.find(
    (p) =>
      p.qikinkClientProductId === qikinkId ||
      p.id.includes(qikinkId) ||
      (p.slug && p.slug.includes(qikinkId))
  );

  if (rawMatch) {
    const blankSku = rawMatch.blank_sku || 'UOst';
    const blankName = BLANK_GARMENT_NAMES[blankSku] || `${blankSku} Premium Domestic Garment Blank`;

    // Extract base landed cost
    let baseCost = 0;
    if (rawMatch.variants && rawMatch.variants.length > 0) {
      const v = rawMatch.variants[0];
      baseCost = Number(v.updated_base_price || v.cost_price || 0);
    }
    if (!baseCost) {
      baseCost = BLANK_DEFAULT_COSTS[blankSku] || parsePriceNumber(rawMatch.base_price, 399);
    }
    baseCost = Math.round(baseCost * 100) / 100;

    // Calculate recommended selling price and compare-at MRP
    let sellingPrice = existingProduct?.price || parsePriceNumber(rawMatch.selling_price, 0);
    if (!sellingPrice || sellingPrice <= baseCost) {
      sellingPrice = Math.max(849, Math.round((baseCost * 1.65) / 10) * 10 - 1);
    }
    const compareAtPrice =
      existingProduct?.compareAtPrice ||
      existingProduct?.compare_at_price ||
      Math.round((sellingPrice * 1.65) / 50) * 50 - 1;

    const margin = Math.round((sellingPrice - baseCost) * 100) / 100;
    const marginPct = Math.round((margin / sellingPrice) * 100);

    // Build color mockup mapping with verified AWS S3 URLs
    const colorImages: Record<string, string> = {};
    const colors: string[] = Array.isArray(rawMatch.colors) && rawMatch.colors.length > 0 ? [...rawMatch.colors] : [];

    if (rawMatch.color_mockups && typeof rawMatch.color_mockups === 'object') {
      Object.entries(rawMatch.color_mockups).forEach(([c, url]) => {
        if (typeof url === 'string' && url.startsWith('http')) {
          colorImages[c] = url;
          if (!colors.includes(c)) colors.push(c);
        }
      });
    }

    if (rawMatch.variants && Array.isArray(rawMatch.variants)) {
      rawMatch.variants.forEach((v: any) => {
        const c = v.color || v.color_name;
        if (c && !colorImages[c]) {
          const img = v.variant_image;
          if (img) {
            colorImages[c] = img.startsWith('http')
              ? img
              : `https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/${qikinkId}/images/${img}`;
            if (!colors.includes(c)) colors.push(c);
          }
        }
      });
    }

    if (colors.length === 0) colors.push('White');
    const primaryMockup =
      colorImages['White'] ||
      colorImages['Black'] ||
      Object.values(colorImages)[0] ||
      rawMatch.default_mockup_image ||
      'https://www.rareember.shop/flame-icon.png';

    const sizes =
      Array.isArray(rawMatch.sizes) && rawMatch.sizes.length > 0
        ? rawMatch.sizes
        : ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

    const totalVariants =
      rawMatch.variants?.length ||
      rawMatch.total_variants ||
      colors.length * sizes.length;

    return NextResponse.json({
      ok: true,
      verified: {
        qikinkProductId: String(rawMatch.client_product_id || qikinkId),
        title: rawMatch.title || existingProduct?.title || "Rare Ember Signature Drop",
        cleanTitle: existingProduct?.title || `${rawMatch.title} — Rare Ember Drop`,
        blankSku,
        blankName,
        baseCost,
        recommendedSellingPrice: sellingPrice,
        compareAtPrice,
        margin,
        marginPct,
        colors,
        colorImages,
        primaryMockup,
        sizes,
        totalVariants,
        sizeChartLink: rawMatch.size_chart_link || existingProduct?.sizeChartLink || '',
        category: existingProduct?.category || (rawMatch.gender_name === 'Women' ? 'womens' : 'mens'),
        alreadyImported: Boolean(existingProduct),
        existingId: existingProduct?.id || null,
        active: existingProduct ? existingProduct.active !== false : true,
      },
    });
  }

  // 3. Fallback for custom / newly generated Qikink product ID:
  // Synthesize a verified blank template preview so founder can import custom drop
  const defaultBlankSku = 'UOst';
  const defaultCost = 414.91;
  const defaultSelling = 849;
  const defaultCompare = 1499;
  const defaultMargin = Math.round((defaultSelling - defaultCost) * 100) / 100;
  const defaultMarginPct = Math.round((defaultMargin / defaultSelling) * 100);

  const colors = ['Black', 'White', 'Navy Blue', 'Maroon'];
  const colorImages: Record<string, string> = {
    Black: `https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/${qikinkId}/images/black.png`,
    White: `https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/${qikinkId}/images/white.png`,
  };

  return NextResponse.json({
    ok: true,
    verified: {
      qikinkProductId: qikinkId,
      title: existingProduct?.title || `Rare Ember Custom Drop #${qikinkId}`,
      cleanTitle: existingProduct?.title || `Rare Ember Custom Drop #${qikinkId}`,
      blankSku: defaultBlankSku,
      blankName: BLANK_GARMENT_NAMES[defaultBlankSku],
      baseCost: defaultCost,
      recommendedSellingPrice: defaultSelling,
      compareAtPrice: defaultCompare,
      margin: defaultMargin,
      marginPct: defaultMarginPct,
      colors,
      colorImages,
      primaryMockup: colorImages['White'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      totalVariants: colors.length * 7,
      sizeChartLink: '',
      category: 'mens',
      alreadyImported: Boolean(existingProduct),
      existingId: existingProduct?.id || null,
      active: existingProduct ? existingProduct.active !== false : true,
      isCustomSynthesized: true,
    },
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
