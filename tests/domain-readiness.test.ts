import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

type DomainReadinessModule = {
  evaluateDomainReadiness: (args: {
    canonicalOrigins?: string[];
    previewOrigin?: string;
    expectedCommit?: string;
    fetchImpl?: typeof fetch;
    resolveNsImpl?: () => Promise<string[]>;
    resolveMxImpl?: () => Promise<Array<{ exchange: string; preference: number }>>;
  }) => Promise<{
    previewReady: boolean;
    canonicalReady: boolean;
    dnsReady: boolean;
    decision: string;
    blockers: string[];
    warnings: string[];
  }>;
};

async function loadDomainReadinessModule() {
  return (await import(
    pathToFileURL(path.join(process.cwd(), "scripts/domain-readiness.mjs")).href
  )) as DomainReadinessModule;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function htmlResponse(title: string, status = 200) {
  return new Response(`<html><head><title>${title}</title></head><body></body></html>`, {
    status,
    headers: { "content-type": "text/html" },
  });
}

const healthyBody = {
  status: "ok",
  service: "kozbeyli-konagi",
  deployment: { commit: "abc123def456" },
};

describe("domain readiness", () => {
  it("returns NO-GO when canonical domains do not serve the app health endpoint", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com", "https://www.kozbeylikonagi.com"],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.includes("kozbeyli-konagi.vercel.app/api/health")) return jsonResponse(healthyBody);
        if (href.includes("kozbeyli-konagi.vercel.app")) return htmlResponse("Kozbeyli Konağı");
        if (href.endsWith("/api/health")) return htmlResponse("Not Found", 404);
        return htmlResponse("Kozbeyli Konağı - Landing Page");
      },
      resolveNsImpl: async () => ["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.previewReady).toBe(true);
    expect(result.canonicalReady).toBe(false);
    expect(result.decision).toBe("CANONICAL DOMAIN NO-GO");
    expect(result.blockers).toContain(
      "https://kozbeylikonagi.com does not serve kozbeyli-konagi at current commit",
    );
  });

  it("returns GO when preview and canonical domains serve the same current app health", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com", "https://www.kozbeylikonagi.com"],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def4567890",
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        return htmlResponse("Kozbeyli Konağı");
      },
      resolveNsImpl: async () => ["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.previewReady).toBe(true);
    expect(result.canonicalReady).toBe(true);
    expect(result.dnsReady).toBe(true);
    expect(result.decision).toBe("CANONICAL DOMAIN GO");
    expect(result.blockers).toEqual([]);
  });

  it("keeps DNS lookup failures as warnings instead of blocking a verified web deployment", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com"],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        return htmlResponse(href.includes("www.") ? "WWW" : "Kozbeyli Konağı");
      },
      resolveNsImpl: async () => {
        throw new Error("queryNs ECONNREFUSED kozbeylikonagi.com");
      },
      resolveMxImpl: async () => {
        throw new Error("queryMx ECONNREFUSED kozbeylikonagi.com");
      },
    });

    expect(result.decision).toBe("CANONICAL DOMAIN GO");
    expect(result.dnsReady).toBe(false);
    expect(result.blockers).toEqual([]);
    expect(result.warnings).toContain(
      "canonical domain MX record could not be verified as mx.kozbeylikonagi.com",
    );
  });
});
