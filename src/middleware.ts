import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Build a Content-Security-Policy header with a per-request nonce.
 * The nonce replaces 'unsafe-inline' in script-src.
 * style-src keeps 'unsafe-inline' (required by Tailwind/styled-jsx).
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    "img-src 'self' data: https: blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://connect.facebook.net https://eu-assets.i.posthog.com https://challenges.cloudflare.com`,
    "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://connect.facebook.net https://graph.facebook.net https://graph.facebook.com https://app.hotelrunner.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://challenges.cloudflare.com",
    "frame-src 'self' https://www.googletagmanager.com https://www.facebook.com https://app.hotelrunner.com https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://app.hotelrunner.com",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Edge Middleware
 * - Per-request CSP nonce generation
 * - Admin route protection
 * - Security: blocks suspicious patterns
 */
export function middleware(request: NextRequest): NextResponse {
  const { nextUrl: url } = request;
  const path = url.pathname.toLowerCase();

  // Block common attack patterns
  const blockedPatterns = [
    /\.env/,
    /\.git/,
    /wp-admin/,
    /wp-login/,
    /wp-content/,
    /wp-includes/,
    /phpinfo/,
    /\.php/,
    /xmlrpc/,
    /phpmyadmin/,
    /\.htaccess/,
    /\.svn/,
    /\/config\b/,
    /\/backup/,
    /\/actuator/,
  ];

  if (blockedPatterns.some((p) => p.test(path))) {
    return new NextResponse(null, { status: 404 });
  }

  // Generate a per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Forward nonce to Server Components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Set CSP with nonce (replaces static CSP in next.config.ts)
  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  // Supplementary security headers
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent admin pages from being indexed
  if (path.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|public|.*\\..*).*)", "/admin/:path*"],
};
