import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdkkxpfhwrwyoardlceo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    const mime = file.type;
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(mime)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPG, WebP, SVG' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = mime.includes('png') ? 'png' : mime.includes('svg') ? 'svg' : mime.includes('webp') ? 'webp' : 'jpg';
    const fileName = `artworks/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.storage
      .from('custom-artworks')
      .upload(fileName, buffer, {
        contentType: mime,
        upsert: true,
      });

    if (error) {
      console.error('[Upload] Supabase Storage error:', error);
      return NextResponse.json({ error: 'Failed to upload artwork to cloud storage' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('custom-artworks')
      .getPublicUrl(fileName);

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (err: any) {
    console.error('[Upload] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal upload error' }, { status: 500 });
  }
}
