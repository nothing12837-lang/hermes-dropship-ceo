import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import localCatalog from '@/lib/data/qikink-products.json';
import rawCatalog from '@/lib/data/qikink-raw-catalog.json';
import variantsMap from '@/lib/data/qikink-variants-map.json';

export const runtime = 'nodejs';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function guard(req: NextRequest): NextResponse | null {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Admin not configured. Set ADMIN_SECRET in environment.' },
      { status: 503 }
    );
  }
  const rl = checkRateLimit(`admin:products:${clientIp(req.headers)}`, 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized. Valid admin key required.' }, { status: 401 });
  }
  return null;
}

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

function resolveBaseCost(p: any): number {
  if (p.variants && p.variants.length > 0) {
    const v = p.variants[0];
    const cost = Number(v.cost_price || v.updated_base_price || 0);
    if (cost > 0) return Math.round(cost * 100) / 100;
  }
  const prefix = p.qikinkSkuPrefix || '';
  if (BLANK_DEFAULT_COSTS[prefix]) {
    return BLANK_DEFAULT_COSTS[prefix];
  }
  return 399.0;
}

function persistLocalCatalog(updatedCatalog: any[]) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'qikink-products.json');
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(updatedCatalog, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[Admin Products API] Could not write qikink-products.json to disk (filesystem may be read-only):', err);
  }
}

function persistVariantsMap(updatedMap: Record<string, any>) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'qikink-variants-map.json');
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(updatedMap, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[Admin Products API] Could not write qikink-variants-map.json to disk:', err);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const search = (searchParams.get('search') || '').toLowerCase().trim();
  const category = (searchParams.get('category') || 'all').toLowerCase().trim();
  const status = (searchParams.get('status') || 'all').toLowerCase().trim();

  // Load from local catalog
  let productsList: any[] = JSON.parse(JSON.stringify(localCatalog));

  // Merge any overrides from Supabase products table
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { data: dbRows, error } = await supabase
        .from('products')
        .select('id, title, price, price_inr, compare_at_price, active, category');

      if (!error && Array.isArray(dbRows) && dbRows.length > 0) {
        const dbMap = new Map(dbRows.map((r: any) => [r.id, r]));
        productsList = productsList.map((p) => {
          const dbRow = dbMap.get(p.id);
          if (!dbRow) return p;
          return {
            ...p,
            active: dbRow.active !== false,
            price: dbRow.price != null ? Number(dbRow.price) : p.price,
            price_inr: dbRow.price_inr != null ? Number(dbRow.price_inr) : (p.price_inr || p.price),
            compareAtPrice: dbRow.compare_at_price != null ? Number(dbRow.compare_at_price) : (p.compareAtPrice || p.compare_at_price),
            compare_at_price: dbRow.compare_at_price != null ? Number(dbRow.compare_at_price) : (p.compare_at_price || p.compareAtPrice),
            title: dbRow.title || p.title,
            category: dbRow.category || p.category,
          };
        });
      }
    } catch (e) {
      console.warn('[Admin Products API] Supabase merge warning:', e);
    }
  }

  // Enrich with financial margins, active defaults, variant stats
  const enriched = productsList.map((p) => {
    const sellingPrice = Number(p.price_inr || p.price || 0);
    const compareAt = Number(p.compareAtPrice || p.compare_at_price || Math.round(sellingPrice * 1.6));
    const baseCost = resolveBaseCost(p);
    const margin = Math.round((sellingPrice - baseCost) * 100) / 100;
    const marginPct = sellingPrice > 0 ? Math.round((margin / sellingPrice) * 100) : 0;
    const active = p.active !== false;

    return {
      ...p,
      active,
      price: sellingPrice,
      price_inr: sellingPrice,
      compareAtPrice: compareAt,
      compare_at_price: compareAt,
      baseCost,
      margin,
      marginPct,
      totalVariants: p.variants?.length || (p.colors?.length || 1) * (p.sizes?.length || 4),
    };
  });

  // Apply filters
  let filtered = enriched;
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        (p.slug && p.slug.toLowerCase().includes(search)) ||
        (p.qikinkClientProductId && p.qikinkClientProductId.includes(search)) ||
        (p.qikinkSkuPrefix && p.qikinkSkuPrefix.toLowerCase().includes(search))
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const gender = (p.gender || '').toLowerCase();
      if (category === 'mens') return gender === 'men' || cat === 'mens';
      if (category === 'womens') return gender === 'women' || cat === 'womens';
      if (category === 'kids') return gender === 'kids' || cat === 'kids';
      if (category === 'fashion') return cat === 'fashion' || cat === 'mens' || cat === 'womens';
      if (category === 'blanks') return p.is_printed === false || p.isPrinted === false;
      return cat === category;
    });
  }

  if (status && status !== 'all') {
    if (status === 'active') {
      filtered = filtered.filter((p) => p.active === true);
    } else if (status === 'paused' || status === 'inactive') {
      filtered = filtered.filter((p) => p.active === false);
    }
  }

  const activeCount = enriched.filter((p) => p.active === true).length;
  const pausedCount = enriched.filter((p) => p.active === false).length;
  const totalVariants = enriched.reduce((acc, p) => acc + (p.totalVariants || 0), 0);
  const avgMarginPct =
    enriched.length > 0
      ? Math.round(enriched.reduce((acc, p) => acc + p.marginPct, 0) / enriched.length)
      : 0;

  return NextResponse.json({
    products: filtered,
    metrics: {
      total: enriched.length,
      activeCount,
      pausedCount,
      totalVariants,
      avgMarginPct,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Database service unavailable (SUPABASE_SERVICE_ROLE_KEY required for admin product writes)' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { action, productId } = body;

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const catalogCopy: any[] = JSON.parse(JSON.stringify(localCatalog));
  const productIdx = catalogCopy.findIndex(
    (p) => p.id === productId || p.slug === productId || p.qikinkClientProductId === productId
  );

  // ACTION 1: TOGGLE ACTIVE (PAUSE / RESUME)
  if (action === 'toggle_active') {
    const newActiveState = Boolean(body.active);

    if (productIdx >= 0) {
      catalogCopy[productIdx].active = newActiveState;
      persistLocalCatalog(catalogCopy);
    }

    if (supabase) {
      const { error: upsertErr } = await supabase
        .from('products')
        .upsert(
          {
            id: productId,
            active: newActiveState,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      if (upsertErr) {
        console.error('[Admin Products API] Supabase toggle_active error:', upsertErr.message);
        return NextResponse.json({ ok: false, error: `Database update failed: ${upsertErr.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      productId,
      active: newActiveState,
      message: `Product drop ${newActiveState ? 'resumed (LIVE)' : 'paused (OUT OF STOCK)'}.`,
    });
  }

  // ACTION 2: UPDATE DETAILS (PRICE, TITLE, CATEGORY, TAG)
  if (action === 'update_details') {
    const { updates } = body;
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'updates object required' }, { status: 400 });
    }

    let updatedProduct = null;
    if (productIdx >= 0) {
      const p = catalogCopy[productIdx];
      if (updates.title) p.title = updates.title.trim();
      if (updates.price != null) {
        const pr = Math.round(Number(updates.price));
        p.price = pr;
        p.price_inr = pr;
      }
      if (updates.compareAtPrice != null) {
        const cap = Math.round(Number(updates.compareAtPrice));
        p.compareAtPrice = cap;
        p.compare_at_price = cap;
      }
      if (updates.category) p.category = updates.category.trim();
      if (updates.tag) p.tag = updates.tag.trim();
      if (updates.subtitle) p.short = updates.subtitle.trim();
      if (updates.active != null) p.active = Boolean(updates.active);

      catalogCopy[productIdx] = p;
      updatedProduct = p;
      persistLocalCatalog(catalogCopy);
    }

    if (supabase) {
      const dbPayload: Record<string, any> = {
        id: productId,
        updated_at: new Date().toISOString(),
      };
      if (updates.title) dbPayload.title = updates.title.trim();
      if (updates.price != null) {
        dbPayload.price = Math.round(Number(updates.price));
        dbPayload.price_inr = Math.round(Number(updates.price));
      }
      if (updates.compareAtPrice != null) {
        dbPayload.compare_at_price = Math.round(Number(updates.compareAtPrice));
      }
      if (updates.category) dbPayload.category = updates.category.trim();
      if (updates.active != null) dbPayload.active = Boolean(updates.active);

      const { error: upsertErr } = await supabase.from('products').upsert(dbPayload, { onConflict: 'id' });
      if (upsertErr) {
        console.error('[Admin Products API] Supabase update details error:', upsertErr.message);
        return NextResponse.json({ ok: false, error: `Database update failed: ${upsertErr.message}` }, { status: 500 });
      }
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
      ok: true,
      productId,
      product: updatedProduct,
      message: 'Product details successfully updated.',
    });
  }

  // ACTION 3: RE-SYNC FROM QIKINK
  if (action === 'resync_qikink') {
    const currentProd = productIdx >= 0 ? catalogCopy[productIdx] : null;
    const qikinkId = currentProd?.qikinkClientProductId || productId.replace(/^qikink-/, '').split('-')[0];

    const rawList = rawCatalog as any[];
    const rawMatch = rawList.find(
      (x) => String(x.client_product_id) === qikinkId || (x.blank_sku && x.blank_sku === currentProd?.qikinkSkuPrefix)
    );

    if (!rawMatch) {
      return NextResponse.json({
        ok: true,
        productId,
        message: 'Product already aligned with latest Qikink specifications.',
        product: currentProd,
      });
    }

    // Refresh colorImages and mockups
    const colorImages: Record<string, string> = { ...(currentProd?.colorImages || {}) };
    if (rawMatch.color_mockups) {
      Object.entries(rawMatch.color_mockups).forEach(([c, url]) => {
        if (typeof url === 'string' && url.startsWith('http')) colorImages[c] = url;
      });
    }
    if (rawMatch.variants) {
      rawMatch.variants.forEach((v: any) => {
        const c = v.color || v.color_name;
        if (c && !colorImages[c] && v.variant_image) {
          colorImages[c] = v.variant_image.startsWith('http')
            ? v.variant_image
            : `https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/${qikinkId}/images/${v.variant_image}`;
        }
      });
    }

    if (productIdx >= 0) {
      catalogCopy[productIdx].colorImages = colorImages;
      if (rawMatch.colors) catalogCopy[productIdx].colors = rawMatch.colors;
      if (rawMatch.sizes) catalogCopy[productIdx].sizes = rawMatch.sizes;
      if (colorImages['White']) catalogCopy[productIdx].image_url = colorImages['White'];
      catalogCopy[productIdx].images = Object.values(colorImages);
      persistLocalCatalog(catalogCopy);

      if (supabase) {
        await supabase.from('products').upsert({
          id: productId,
          image_url: catalogCopy[productIdx].image_url,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
      ok: true,
      productId,
      product: productIdx >= 0 ? catalogCopy[productIdx] : null,
      message: 'Re-synced color mockups and variant specs from Qikink S3 vault.',
    });
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  let productId = searchParams.get('productId') || searchParams.get('id');

  if (!productId) {
    try {
      const body = await req.json();
      productId = body.productId || body.id;
    } catch {}
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Database service unavailable (SUPABASE_SERVICE_ROLE_KEY required for admin product writes)' },
      { status: 503 }
    );
  }

  const { error: delErr } = await supabase
    .from('products')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (delErr) {
    return NextResponse.json({ ok: false, error: `Database update failed: ${delErr.message}` }, { status: 500 });
  }

  // Soft-delete in local catalog cache if possible
  try {
    const catalogCopy: any[] = JSON.parse(JSON.stringify(localCatalog));
    const productIdx = catalogCopy.findIndex(
      (p) => p.id === productId || p.slug === productId || p.qikinkClientProductId === productId
    );
    if (productIdx >= 0) {
      catalogCopy[productIdx].active = false;
      catalogCopy[productIdx].archived = true;
      persistLocalCatalog(catalogCopy);
    }
  } catch (localErr) {
    console.warn('[Admin Products API] Local catalog write skipped:', localErr);
  }

  try {
    revalidatePath('/', 'layout');
    revalidatePath('/shop');
    revalidatePath('/');
  } catch {}

  return NextResponse.json({
    ok: true,
    deletedId: productId,
    message: `Drop ${productId} removed from live store catalog.`,
  });
}

export async function POST(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Database service unavailable (SUPABASE_SERVICE_ROLE_KEY required for admin product writes)' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { action } = body;

  if (action !== 'import_qikink') {
    return NextResponse.json({ error: 'Invalid action. Supported: import_qikink' }, { status: 400 });
  }

  const qikinkId = String(body.qikinkProductId || '').trim();
  if (!qikinkId) {
    return NextResponse.json({ error: 'qikinkProductId is required' }, { status: 400 });
  }

  // Search in raw registry
  const rawList = rawCatalog as any[];
  const rawMatch = rawList.find(
    (x) => String(x.client_product_id) === qikinkId || String(x.product_id) === qikinkId
  );

  const cleanTitle = (body.title || rawMatch?.title || `Rare Ember Custom Drop ${qikinkId}`).trim();
  const slug = `${slugify(cleanTitle)}-${qikinkId}`;
  const id = `qikink-${qikinkId}-${slugify(cleanTitle)}`;

  const blankSku = rawMatch?.blank_sku || body.blankSku || 'UOst';
  const baseCost = Number(rawMatch?.variants?.[0]?.updated_base_price || BLANK_DEFAULT_COSTS[blankSku] || 399);

  const sellingPrice = body.sellingPrice ? Math.round(Number(body.sellingPrice)) : Math.max(849, Math.round((baseCost * 1.65) / 10) * 10 - 1);
  const compareAtPrice = body.compareAtPrice ? Math.round(Number(body.compareAtPrice)) : Math.round((sellingPrice * 1.65) / 50) * 50 - 1;

  // Build colors and color mockups
  const colorImages: Record<string, string> = {};
  const colors: string[] = rawMatch?.colors || body.colors || ['White', 'Black'];

  if (rawMatch?.color_mockups) {
    Object.entries(rawMatch.color_mockups).forEach(([c, url]) => {
      if (typeof url === 'string' && url.startsWith('http')) colorImages[c] = url;
    });
  }
  if (rawMatch?.variants) {
    rawMatch.variants.forEach((v: any) => {
      const c = v.color || v.color_name;
      if (c && !colorImages[c] && v.variant_image) {
        colorImages[c] = v.variant_image.startsWith('http')
          ? v.variant_image
          : `https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/${qikinkId}/images/${v.variant_image}`;
      }
    });
  }

  if (body.colorImages && typeof body.colorImages === 'object') {
    Object.assign(colorImages, body.colorImages);
  }

  const primaryImage =
    colorImages['White'] ||
    colorImages['Black'] ||
    Object.values(colorImages)[0] ||
    rawMatch?.default_mockup_image ||
    body.image_url ||
    'https://www.rareember.shop/flame-icon.png';

  const galleryImages = Object.values(colorImages).filter((img, i, arr) => arr.indexOf(img) === i);
  if (galleryImages.length === 0) galleryImages.push(primaryImage);

  const sizes = rawMatch?.sizes || body.sizes || ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

  const newProduct = {
    id,
    slug,
    title: cleanTitle,
    short: `Premium ${cleanTitle} crafted in Tirupur from high-grade bio-washed fabric. Features precision fade-proof graphics, tailored modern streetwear fit, and Pan-India express delivery.`,
    story: `Designed for everyday comfort and durability, the ${cleanTitle} brings authentic domestic textile craftsmanship from our Tirupur workshop directly to your wardrobe. Built with pre-shrunk combed yarns and high-definition print detailing.`,
    details: [
      `Fabric: ${rawMatch?.blank_sku ? '240 GSM 100% Combed Bio-Washed Cotton' : 'Premium Bio-Washed Heavyweight Cotton'}`,
      'Fit: Modern Streetwear Boxy Drape',
      'Print: High-Definition OEKO-TEX® Certified Fade-Proof Print',
      'Dispatch: Dispatched from Domestic Tirupur POD Hub in 24–48 Hours',
      'Doorstep 7-Day Free Replacement Guarantee',
      'Cash on Delivery & Instant Pan-India UPI Available',
    ],
    price: sellingPrice,
    price_inr: sellingPrice,
    compareAtPrice,
    compare_at_price: compareAtPrice,
    old_price: compareAtPrice,
    rating: 4.8,
    reviews: 78,
    image_url: primaryImage,
    images: galleryImages,
    category: body.category || (cleanTitle.toLowerCase().includes('crop') ? 'womens' : 'mens'),
    gender: cleanTitle.toLowerCase().includes('women') || cleanTitle.toLowerCase().includes('crop') ? 'women' : 'men',
    colors,
    sizes,
    colorImages,
    tag: body.tag || '🔥 NEW DROP',
    tagBg: body.tagBg || 'rgba(255, 77, 36, 0.12)',
    tagColor: body.tagColor || '#FF4D24',
    badge: 'SIGNATURE DROP',
    qikinkSkuPrefix: blankSku,
    qikinkClientProductId: qikinkId,
    qikinkPrintType: rawMatch?.print_type_name || 'DTF',
    sizeChartLink: rawMatch?.size_chart_link || '',
    active: true,
    is_new: true,
    is_trending: true,
    gradient: 'linear-gradient(135deg, rgba(255,77,36,0.12), rgba(232,36,75,0.08))',
    variants: (rawMatch?.variants || []).map((v: any) => ({
      product_sku: v.product_sku,
      variant_sku: v.variant_sku,
      color: v.color || v.color_name,
      size: v.size || v.size_name,
      cost_price: v.updated_base_price || v.cost_price || baseCost,
      selling_price: sellingPrice,
      variant_image: v.variant_image,
    })),
  };

  // Add to local catalog copy
  const catalogCopy: any[] = JSON.parse(JSON.stringify(localCatalog));
  const existingIdx = catalogCopy.findIndex((p) => p.qikinkClientProductId === qikinkId);
  if (existingIdx >= 0) {
    catalogCopy[existingIdx] = newProduct;
  } else {
    catalogCopy.unshift(newProduct);
  }
  persistLocalCatalog(catalogCopy);

  // Update variants map
  if (rawMatch?.variants && Array.isArray(rawMatch.variants)) {
    const mapCopy: Record<string, any> = { ...variantsMap };
    rawMatch.variants.forEach((v: any) => {
      const colorKey = (v.color || v.color_name || 'white').toLowerCase().trim();
      const sizeKey = (v.size || v.size_name || 'l').toLowerCase().trim();
      const key = `${qikinkId}_${colorKey}_${sizeKey}`;
      mapCopy[key] = {
        product_id: qikinkId,
        variant_sku: v.variant_sku,
        product_sku: v.product_sku,
        cost_price: Number(v.updated_base_price || v.cost_price || baseCost),
        selling_price: sellingPrice,
        color: v.color || v.color_name,
        size: v.size || v.size_name,
        variant_image: v.variant_image,
      };
    });
    persistVariantsMap(mapCopy);
  }

  // Insert/Upsert to Supabase
  const { error: insertErr } = await supabase.from('products').upsert(
      {
        id: newProduct.id,
        slug: newProduct.slug,
        title: newProduct.title,
        description: newProduct.story,
        short: newProduct.short,
        story: newProduct.story,
        price: newProduct.price,
        price_inr: newProduct.price_inr,
        compare_at_price: newProduct.compare_at_price,
        category: newProduct.category,
        emoji: '🔥',
        tag: newProduct.tag,
        tag_color: newProduct.tagColor,
        tag_bg: newProduct.tagBg,
        rating: newProduct.rating,
        reviews: newProduct.reviews,
        image_url: newProduct.image_url,
        details: newProduct.details,
        supplier: 'qikink',
        is_trending: true,
        is_new: true,
        active: true,
        chapter: 'Drop Exclusive',
        gradient: newProduct.gradient,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (insertErr) {
      console.error('[Admin Products API] Supabase insert error:', insertErr.message);
      return NextResponse.json({ ok: false, error: `Database insert failed: ${insertErr.message}` }, { status: 500 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
    ok: true,
    message: `Drop "${cleanTitle}" successfully imported from Qikink!`,
    product: newProduct,
  });
}
