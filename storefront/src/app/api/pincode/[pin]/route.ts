import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;
  const clean = (pin || '').replace(/\D/g, '').slice(0, 6);
  if (clean.length !== 6 || !/^\d{6}$/.test(clean)) {
    return NextResponse.json({ error: 'Invalid 6-digit Indian PIN code' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Hub lookup failed' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Pincode proxy error:', err);
    return NextResponse.json({ error: 'Network lookup error' }, { status: 500 });
  }
}
