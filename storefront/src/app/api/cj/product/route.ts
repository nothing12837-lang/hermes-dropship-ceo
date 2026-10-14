import { NextResponse } from 'next/server';
import { getCJProductMedia, isCJConfigured } from '@/lib/api/cj_dropshipping';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp, isValidSku } from '@/lib/security/validation';

export async function GET(request: Request) {
  const rl = checkRateLimit(`cj:${clientIp(request.headers)}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const sku = searchParams.get('sku')?.trim() ?? '';

  if (!isValidSku(sku)) {
    return NextResponse.json({ error: 'Valid SKU required' }, { status: 400 });
  }

  if (!isCJConfigured()) {
    return NextResponse.json({ error: 'CJ integration not configured' }, { status: 503 });
  }

  try {
    const media = await getCJProductMedia(sku);
    return NextResponse.json(media);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CJ lookup failed';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
