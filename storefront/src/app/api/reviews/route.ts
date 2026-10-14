import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdkkxpfhwrwyoardlceo.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka2t4cGZod3J3eW9hcmRsY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Njc2OTcsImV4cCI6MjEwNjQ0MzY5N30.qFvuYQ1G9NvYGYXWVtR6b9dPScOuUIfeVQ8yX3y1DJo';
  return createClient(url, key);
}

// GET /api/reviews?product_id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const sb = getSupabase();
    const { data, error } = await sb
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, user_name, rating, comment, image_url } = body;

    if (!product_id || !user_name || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, user_name, rating, comment' },
        { status: 400 }
      );
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const cleanUserName = String(user_name).trim().slice(0, 100);
    const cleanComment = String(comment).trim().slice(0, 2000);
    let cleanImageUrl = image_url ? String(image_url).trim() : null;

    // Safety: ensure image URL or base64 data string isn't excessively huge
    if (cleanImageUrl && cleanImageUrl.length > 500000) {
      // If oversized image, truncate or nullify to avoid payload explosion
      cleanImageUrl = null;
    }

    const sb = getSupabase();
    const { data, error } = await sb
      .from('reviews')
      .insert({
        product_id,
        user_name: cleanUserName,
        rating: numRating,
        comment: cleanComment,
        image_url: cleanImageUrl,
        verified_buyer: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Instant Telegram Alert to Ajay on @rereemberbot
    const token = '8898923626:AAEZTnurYzL70qpg42BgKKmLUBpW4g422aY';
    const chatId = '5238068527';
    const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
    const text = `⭐ *NEW CUSTOMER REVIEW ON RAREEMBER!*\n\n` +
      `👤 *Customer:* ${data.user_name}\n` +
      `⭐ *Rating:* ${data.rating}/5 (${stars})\n` +
      `📦 *Product:* ${data.product_id}\n` +
      `💬 *Feedback:* "${data.comment}"\n` +
      `📸 *Photo Attached:* ${data.image_url ? 'Yes' : 'No'}\n\n` +
      `👉 View on Store: https://rareember-store.vercel.app/product/${data.product_id}`;

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    }).catch(() => {});

    return NextResponse.json({ success: true, review: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit review' }, { status: 500 });
  }
}
