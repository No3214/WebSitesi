import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security Hardening: Admin boundaries
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/payload")) {
    // In production, you might want to restrict by IP or specific session checks
    // For now, we ensure headers are properly managed
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  }

  // Handle SEO Redirections or trailing slashes if needed
  if (pathname.endsWith("/") && pathname.length > 1) {
    return NextResponse.redirect(new URL(pathname.slice(0, -1), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
