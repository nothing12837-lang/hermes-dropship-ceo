import { NextResponse } from 'next/server';
import { getProductsFromDB } from '@/lib/products-server';

export const revalidate = 60; // 1 min ISR cache

export async function GET() {
  try {
    const products = await getProductsFromDB();
    return NextResponse.json({ products });
  } catch (err) {
    console.warn('[Public Products API] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
