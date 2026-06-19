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
    dnsFallbackFetchImpl?: typeof fetch;
  }) => Promise<{
    previewReady: boolean;
    canonicalReady: boolean;
    dnsReady: boolean;
    decision: string;
    blockers: string[];
    warnings: string[];
    dns: {
      ns: string[];
      mx: Array<{ exchange: string; preference: number }>;
      nsSource: string;
      mxSource: string;
    };
    preview: {
      home: {
        hasOpeningHeroVideo: boolean;
        redirect?: {
          firstHopInsecure: boolean;
          resolvedLocation: string;
        };
      };
      health: {
        redirect?: {
          firstHopInsecure: boolean;
          resolvedLocation: string;
        };
      };
    };
    canonical: Array<{
      origin: string;
      home: {
        redirect?: {
          firstHopInsecure: boolean;
          resolvedLocation: string;
        };
      };
      health: {
        redirect?: {
          firstHopInsecure: boolean;
          resolvedLocation: string;
        };
      };
    }>;
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

function htmlResponse(title: string, status = 200, body = "") {
  return new Response(`<html><head><title>${title}</title></head><body>${body}</body></html>`, {
    status,
    headers: { "content-type": "text/html" },
  });
}

function appShellResponse(title = "Kozbeyli Konağı") {
  return htmlResponse(title, 200, '<video class="hero-video"><source src="/videos/hero.mp4" /></video>');
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
        if (href.includes("kozbeyli-konagi.vercel.app")) return appShellResponse();
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
    expect(result.blockers).toContain(
      "https://kozbeylikonagi.com homepage does not expose opening hero video /videos/hero.mp4",
    );
  });

  it("returns NO-GO when app health is current but the homepage is not the opening video shell", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com"],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        if (href.includes("kozbeyli-konagi.vercel.app")) return appShellResponse();
        return htmlResponse("Kozbeyli Konağı - Landing Page");
      },
      resolveNsImpl: async () => ["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.previewReady).toBe(true);
    expect(result.canonicalReady).toBe(false);
    expect(result.decision).toBe("CANONICAL DOMAIN NO-GO");
    expect(result.blockers).toEqual([
      "https://kozbeylikonagi.com homepage does not expose opening hero video /videos/hero.mp4",
    ]);
  });

  it("returns NO-GO when canonical HTTPS redirects first to insecure HTTP", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com"],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      fetchImpl: async (url: string | URL | Request, init?: RequestInit) => {
        const href = String(url);
        const redirectMode = init?.redirect;

        if (redirectMode === "manual" && href.startsWith("https://kozbeylikonagi.com")) {
          return new Response("", {
            status: 301,
            headers: {
              location: href.replace("https://kozbeylikonagi.com", "http://www.kozbeylikonagi.com"),
            },
          });
        }

        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        return appShellResponse(href.includes("www.") ? "WWW" : "Kozbeyli Konağı");
      },
      resolveNsImpl: async () => ["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.previewReady).toBe(true);
    expect(result.canonicalReady).toBe(false);
    expect(result.decision).toBe("CANONICAL DOMAIN NO-GO");
    expect(result.canonical[0]?.health.redirect?.firstHopInsecure).toBe(true);
    expect(result.canonical[0]?.home.redirect?.firstHopInsecure).toBe(true);
    expect(result.blockers).toContain(
      "https://kozbeylikonagi.com redirects first hop to insecure HTTP: http://www.kozbeylikonagi.com/api/health",
    );
    expect(result.blockers).toContain(
      "https://kozbeylikonagi.com redirects first hop to insecure HTTP: http://www.kozbeylikonagi.com/",
    );
  });

  it("returns GO when preview and canonical domains serve the same current app health and hero video shell", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com", "https://www.kozbeylikonagi.com"],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def4567890",
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        return appShellResponse(href.includes("www.") ? "WWW" : "Kozbeyli Konağı");
      },
      resolveNsImpl: async () => ["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.previewReady).toBe(true);
    expect(result.canonicalReady).toBe(true);
    expect(result.dnsReady).toBe(true);
    expect(result.decision).toBe("CANONICAL DOMAIN GO");
    expect(result.preview.home.hasOpeningHeroVideo).toBe(true);
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
        return appShellResponse(href.includes("www.") ? "WWW" : "Kozbeyli Konağı");
      },
      resolveNsImpl: async () => {
        throw new Error("queryNs ECONNREFUSED kozbeylikonagi.com");
      },
      resolveMxImpl: async () => {
        throw new Error("queryMx ECONNREFUSED kozbeylikonagi.com");
      },
      dnsFallbackFetchImpl: async () => {
        throw new Error("dns-over-https disabled in this test");
      },
    });

    expect(result.decision).toBe("CANONICAL DOMAIN GO");
    expect(result.dnsReady).toBe(false);
    expect(result.blockers).toEqual([]);
    expect(result.warnings).toContain(
      "canonical domain MX record could not be verified as mx.kozbeylikonagi.com",
    );
  });

  it("falls back to DNS-over-HTTPS when the local resolver is unavailable", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com"],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        return appShellResponse(href.includes("www.") ? "WWW" : "Kozbeyli Konağı");
      },
      resolveNsImpl: async () => {
        throw new Error("queryNs ECONNREFUSED kozbeylikonagi.com");
      },
      resolveMxImpl: async () => {
        throw new Error("queryMx ECONNREFUSED kozbeylikonagi.com");
      },
      dnsFallbackFetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        const recordType = new URL(href).searchParams.get("type");

        if (recordType === "NS") {
          return jsonResponse({
            Answer: [
              { data: "anastasia.ns.cloudflare.com." },
              { data: "theo.ns.cloudflare.com." },
            ],
          });
        }

        return jsonResponse({
          Answer: [{ data: "0 mx.kozbeylikonagi.com." }],
        });
      },
    });

    expect(result.decision).toBe("CANONICAL DOMAIN GO");
    expect(result.dnsReady).toBe(true);
    expect(result.dns.ns).toEqual(["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"]);
    expect(result.dns.mx).toEqual([{ exchange: "mx.kozbeylikonagi.com", preference: 0 }]);
    expect(result.dns.nsSource).toContain("dns");
    expect(result.dns.mxSource).toContain("dns");
    expect(result.warnings).toEqual([]);
  });
});
