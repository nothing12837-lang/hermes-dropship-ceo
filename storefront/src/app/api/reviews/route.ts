import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET /api/reviews?product_id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id')?.trim();

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const sb = getSupabase();
    if (!sb) {
      return NextResponse.json({ reviews: [] });
    }

    const { data, error } = await sb
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`review:${clientIp(req.headers)}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many reviews submitted. Please wait.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { product_id, user_name, rating, comment, image_url } = body;

    if (!product_id || !user_name || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, user_name, rating, comment' },
        { status: 400 }
      );
    }

    const numRating = parseInt(String(rating), 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const cleanUserName = String(user_name).trim().slice(0, 100);
    const cleanComment = String(comment).trim().slice(0, 2000);
    let cleanImageUrl: string | null = null;
    if (typeof image_url === 'string') {
      const trimmed = image_url.trim();
      if (trimmed.startsWith('https://') && trimmed.length <= 1000) {
        cleanImageUrl = trimmed;
      }
    }

    const sb = getSupabase();
    if (!sb) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    const { data, error } = await sb
      .from('reviews')
      .insert({
        product_id: String(product_id).trim().slice(0, 128),
        user_name: cleanUserName,
        rating: numRating,
        comment: cleanComment,
        image_url: cleanImageUrl,
        verified_buyer: false, // Default unverified for public submissions
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to record review' }, { status: 500 });
    }

    // Optional Telegram Alert to Store Owner (env only)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = (process.env.TELEGRAM_ALLOWED_USERS || '5238068527').split(',')[0].trim();
    if (token && chatId && data) {
      const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
      const text = `⭐ *NEW CUSTOMER REVIEW ON RAREEMBER!*\n\n` +
        `👤 *Customer:* ${data.user_name}\n` +
        `⭐ *Rating:* ${data.rating}/5 (${stars})\n` +
        `📦 *Product:* ${data.product_id}\n` +
        `💬 *Feedback:* "${data.comment}"\n` +
        `📸 *Photo Attached:* ${data.image_url ? 'Yes' : 'No'}\n\n` +
        `👉 View on Store: https://rareember-store.vercel.app/product/${data.product_id.replace(/^meesho-/, '')}`;

      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, review: data }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
