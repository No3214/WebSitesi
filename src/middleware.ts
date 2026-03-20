import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge Middleware
 * - Admin route protection
 * - Language detection hint
 * - Security: blocks suspicious patterns
 */
export function middleware(request: NextRequest) {
  const { nextUrl: url } = request;
  const response = NextResponse.next();

  // Block common attack patterns
  const path = url.pathname.toLowerCase();
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

  // Security headers (supplements next.config.ts headers)
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
