import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Magic-byte sniffing: the browser-supplied MIME type is attacker controlled. */
function sniffImageType(buf: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 12 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(req: Request) {
  try {
    // Abuse guard: unauthenticated writes to a public bucket must be bounded.
    // Key per IP. A single global bucket let one abuser lock every shopper
    // out of artwork upload for 10 minutes.
    const rl = checkRateLimit(`upload:${clientIp(req.headers)}`, 5, 10 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many uploads. Try again shortly.' }, { status: 429 });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Upload storage not configured' }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    // SVG is intentionally NOT allowed: an SVG is an active document and served
    // from the public bucket it becomes stored XSS on a *.supabase.co origin.
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPG, WebP' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageType(buffer);
    if (!sniffed || sniffed !== file.type) {
      return NextResponse.json({ error: 'File content does not match a supported image type' }, { status: 400 });
    }
    const mime = sniffed;
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    const fileName = `artworks/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
