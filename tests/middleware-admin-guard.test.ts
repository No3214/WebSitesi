import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, middleware } from "../src/middleware";

function req(path: string, cookie?: string) {
  return new NextRequest(
    `https://www.kozbeylikonagi.com${path}`,
    cookie ? { headers: { cookie } } : undefined,
  );
}

describe("/admin/growth edge guard middleware (fail-closed)", () => {
  it("redirects unauthenticated requests to /admin with a real 307 (server-side)", () => {
    const res = middleware(req("/admin/growth"));
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/admin");
    expect(location.endsWith("/admin")).toBe(true);
    // must NOT bounce back into the protected dashboard
    expect(location).not.toContain("/admin/growth");
  });

  it("does not leak dashboard content on the unauthenticated redirect", () => {
    const res = middleware(req("/admin/growth"));
    // a redirect response has no rendered HTML body / dashboard markers
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).not.toMatch(/text\/html/);
    expect(res.status).toBe(307);
  });

  it("lets requests carrying a Payload session cookie through to the page-level role guard", () => {
    const res = middleware(req("/admin/growth", "payload-token=header.payload.signature"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("scopes the matcher strictly to /admin/growth (never Payload /admin or /api)", () => {
    expect(config.matcher).toContain("/admin/growth");
    for (const m of config.matcher) {
      expect(m.startsWith("/admin/growth")).toBe(true);
    }
  });
});
