import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type SecurityHeadersModule = {
  evaluateSecurityHeaderSource: (args?: { baseDir?: string }) => {
    ready: boolean;
    checks: Array<{ id: string; ready: boolean; detail: string }>;
  };
  evaluateSecurityHeaderLive: (args?: {
    target?: string;
    fetchImpl?: typeof fetch;
  }) => Promise<{
    ready: boolean;
    checks: Array<{ id: string; ready: boolean; detail: string }>;
    headers: Record<string, string>;
  }>;
  evaluateSecurityHeadersReadiness: (args?: {
    baseDir?: string;
    target?: string;
    fetchImpl?: typeof fetch;
  }) => Promise<{
    decision: string;
    blockers: string[];
  }>;
};

async function loadSecurityHeadersModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/security-headers-readiness.mjs")).href
  )) as SecurityHeadersModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-security-headers-"));
  tmpDirs.push(dir);
  return dir;
}

function mockFetch(headers: Record<string, string>, status = 200): typeof fetch {
  return (async () =>
    ({
      status,
      url: "https://www.kozbeylikonagi.com/",
      headers: new Headers(headers),
    }) as Response) as typeof fetch;
}

const lockedCsp = [
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://challenges.cloudflare.com https://*.posthog.com https://app.hms.gen.tr",
  "connect-src 'self' https://*.posthog.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net https://connect.facebook.net https://www.facebook.com https://challenges.cloudflare.com https://app.hms.gen.tr https://kozbeyli-konagi.hmshotel.net",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "frame-src 'self' https://www.google.com https://maps.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
  "frame-ancestors 'self'",
].join("; ");

const strictHeaders = {
  "content-security-policy": lockedCsp,
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-frame-options": "SAMEORIGIN",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("security headers readiness", () => {
  it("keeps the current Next.js source policy covered by the production header contract", async () => {
    const securityHeaders = await loadSecurityHeadersModule();
    const result = securityHeaders.evaluateSecurityHeaderSource();

    expect(result.ready).toBe(true);
    expect(result.checks.find((check) => check.id === "source_unsafe_eval_dev_only")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "source_no_wide_frame_src")).toMatchObject({
      ready: true,
    });
  });

  it("accepts strict live production headers", async () => {
    const securityHeaders = await loadSecurityHeadersModule();
    const result = await securityHeaders.evaluateSecurityHeaderLive({
      target: "https://www.kozbeylikonagi.com",
      fetchImpl: mockFetch(strictHeaders),
    });

    expect(result.ready).toBe(true);
    expect(result.headers["strict-transport-security"]).toContain("preload");
    expect(result.checks.find((check) => check.id === "live_no_production_unsafe_eval")).toMatchObject({
      ready: true,
    });
  });

  it("blocks relaxed production CSP frame and eval surfaces", async () => {
    const securityHeaders = await loadSecurityHeadersModule();
    const result = await securityHeaders.evaluateSecurityHeadersReadiness({
      fetchImpl: mockFetch({
        ...strictHeaders,
        "content-security-policy": `${lockedCsp}; script-src 'self' 'unsafe-eval'; frame-src https: blob:`,
      }),
    });

    expect(result.decision).toBe("SECURITY HEADERS BLOCKED");
    expect(result.blockers.join("\n")).toContain("production CSP must not allow unsafe-eval");
    expect(result.blockers.join("\n")).toContain("frame-src must not allow every HTTPS origin");
    expect(result.blockers.join("\n")).toContain("frame-src must not allow blob frames");
  });

  it("fails source readiness when global Next.js headers are removed", async () => {
    const securityHeaders = await loadSecurityHeadersModule();
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "next.config.ts"), "export default {};\n");

    const result = securityHeaders.evaluateSecurityHeaderSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "next_headers_hook")).toMatchObject({
      ready: false,
    });
    expect(result.checks.find((check) => check.id === "source_content_security_policy")).toMatchObject({
      ready: false,
    });
  });
});
