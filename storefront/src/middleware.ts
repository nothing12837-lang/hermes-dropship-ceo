import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware: Canonical Domain Enforcement & Edge Route Handling.
 * Immediately redirects all non-canonical hostnames (e.g., *.vercel.app, bare rareember.shop)
 * to https://www.rareember.shop via 308 Permanent Redirect, preserving path and query params.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();

  // Exclude local development environments
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.includes('192.168.');

  if (!isLocal) {
    const isBareDomain = hostname === 'rareember.shop';
    const isVercelDomain = hostname.endsWith('.vercel.app');

    if (isBareDomain || isVercelDomain) {
      const { pathname, search } = request.nextUrl;
      const destination = `https://www.rareember.shop${pathname}${search}`;
      return NextResponse.redirect(destination, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.json
     * - static image/asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
};
