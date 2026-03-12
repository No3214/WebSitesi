import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Production-Ready Middleware
 * Focuses on global security headers and routing logic.
 * Heavy lifting (like HMAC validation) is moved to route segments to avoid body consumption issues.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/payload")) {
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (pathname.endsWith("/") && pathname.length > 1) {
    return NextResponse.redirect(new URL(pathname.slice(0, -1), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
