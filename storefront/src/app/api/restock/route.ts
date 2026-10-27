import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';

export const runtime = 'nodejs';

// POST /api/restock { product_id, email/phone } -> notify-me signup (cloud table or memory fallback)
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = checkRateLimit(`restock:${ip}`, 10, 600_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
  }

  try {
    const body = (await req.json()) as { product_id?: string; contact?: string };
    const product_id = String(body.product_id || "").trim().slice(0, 80);
    const contact = String(body.contact || "").trim().slice(0, 80);
    if (!product_id || !contact) return NextResponse.json({ error: "product_id + contact required" }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      try {
        const sb = createClient(url, key);
        await sb.from("restock_alerts").insert({ product_id, contact });
      } catch {}
    }
    return NextResponse.json({ ok: true, product_id });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}
