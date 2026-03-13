import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware for Distribution Hardening.
 * Handles simulated geo-detection and language routing.
 */
export function middleware(request: NextRequest) {
  const { nextUrl: url, headers } = request;
  
  // 1. Simulated Geo-Detection (Hardened for global distribution)
  const country = headers.get('x-vercel-ip-country') || 'TR';
  const acceptLanguage = headers.get('accept-language') || 'tr';
  
  // 2. Logic to suggest /en if user is from outside TR or has EN preference
  const isEnPreferred = acceptLanguage.toLowerCase().includes('en') || country !== 'TR';
  const hasLocaleCookie = request.cookies.has('NEXT_LOCALE');
  
  // Log telemetry (Simulated)
  console.log(`[Middleware] Target: ${url.pathname} | Geo: ${country} | Language: ${acceptLanguage} | EN_Preferred: ${isEnPreferred} | Cookie: ${hasLocaleCookie}`);

  // In a real production environment, we could rewrite the URL here 
  // currently we just pass through as the client-side language switcher handles state.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|public|.*\\..*).*)',
  ],
};
