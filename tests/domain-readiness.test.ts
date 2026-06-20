import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

type DomainReadinessModule = {
  evaluateDomainReadiness: (args: {
    canonicalOrigins?: string[];
    brandOrigins?: string[];
    previewOrigin?: string;
    expectedCommit?: string;
    fetchImpl?: typeof fetch;
    resolve4Impl?: (host: string) => Promise<string[]>;
    resolveCnameImpl?: (host: string) => Promise<string[]>;
    resolveNsImpl?: () => Promise<string[]>;
    resolveMxImpl?: () => Promise<Array<{ exchange: string; preference: number }>>;
    dnsFallbackFetchImpl?: typeof fetch;
  }) => Promise<{
    previewReady: boolean;
    canonicalReady: boolean;
    brandReady: boolean;
    dnsReady: boolean;
    decision: string;
    blockers: string[];
    warnings: string[];
    dns: {
      ns: string[];
      mx: Array<{ exchange: string; preference: number }>;
      nsSource: string;
      mxSource: string;
      authority: {
        provider: string;
        label: string;
        action: string;
      };
      registrarVsDnsNote: string;
      isimtescilCaution: string;
      vercelTargetRecords: Array<{
        type: string;
        host: string;
        value: string;
        purpose: string;
      }>;
      webRecordsOk: boolean;
      webRecordChecks: Array<{
        type: string;
        host: string;
        expectedValue: string;
        actualValues: string[];
        ready: boolean;
        remediation: string;
      }>;
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
      legacyHost: {
        detected: boolean;
        signatures: Array<{ id: string; label: string }>;
      };
      home: {
        legacySignatures?: Array<{ id: string; label: string }>;
        redirect?: {
          firstHopInsecure: boolean;
          resolvedLocation: string;
        };
      };
      health: {
        legacySignatures?: Array<{ id: string; label: string }>;
        redirect?: {
          firstHopInsecure: boolean;
          resolvedLocation: string;
        };
      };
    }>;
    brand: Array<{
      origin: string;
      legacyHost: {
        detected: boolean;
        signatures: Array<{ id: string; label: string }>;
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

function legacyHostResponse() {
  return htmlResponse(
    "Kozbeyli Konağı - 404",
    404,
    `
      <style>/* @package Seagull for Joomla! */</style>
      <div>404 - Error: 404</div>
      <div>Sayfa Bulunamadi</div>
      <script>
        window.parent.postMessage({method: 'renderPageSections'}, 'https://kozbeyli-konagi-1.hotelrunner.com/');
      </script>
    `,
  );
}

const healthyBody = {
  status: "ok",
  service: "kozbeyli-konagi",
  deployment: { commit: "abc123def456" },
};

function vercelWebRecordResolvers() {
  return {
    resolve4Impl: async () => ["76.76.21.21"],
    resolveCnameImpl: async () => ["cname.vercel-dns-0.com"],
  };
}

describe("domain readiness", () => {
  it("returns NO-GO when canonical domains do not serve the app health endpoint", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com", "https://www.kozbeylikonagi.com"],
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      ...vercelWebRecordResolvers(),
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
    expect(result.dns.authority).toMatchObject({
      provider: "cloudflare",
      label: "Cloudflare",
    });
    expect(result.dns.registrarVsDnsNote).toContain("Nameservers decide");
    expect(result.dns.isimtescilCaution).toContain("registered at Isimtescil");
    expect(result.dns.vercelTargetRecords).toEqual([
      expect.objectContaining({
        group: "canonical",
        type: "A",
        host: "kozbeylikonagi.com",
        value: "76.76.21.21",
      }),
      expect.objectContaining({
        group: "canonical",
        type: "A",
        host: "www.kozbeylikonagi.com",
        value: "76.76.21.21",
      }),
      expect.objectContaining({
        group: "brand",
        type: "A",
        host: "kozbeylikonagi.com.tr",
        value: "76.76.21.21",
      }),
      expect.objectContaining({
        group: "brand",
        type: "A",
        host: "www.kozbeylikonagi.com.tr",
        value: "76.76.21.21",
      }),
    ]);
    expect(result.blockers).toContain(
      "https://kozbeylikonagi.com does not serve kozbeyli-konagi at current commit",
    );
    expect(result.blockers).toContain(
      "https://kozbeylikonagi.com homepage does not expose opening hero video /videos/hero.mp4",
    );
  });

  it("classifies legacy Joomla and HotelRunner host surfaces as explicit canonical blockers", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://www.kozbeylikonagi.com"],
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      ...vercelWebRecordResolvers(),
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.includes("kozbeyli-konagi.vercel.app/api/health")) return jsonResponse(healthyBody);
        if (href.includes("kozbeyli-konagi.vercel.app")) return appShellResponse();
        return legacyHostResponse();
      },
      resolveNsImpl: async () => ["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.previewReady).toBe(true);
    expect(result.canonicalReady).toBe(false);
    expect(result.decision).toBe("CANONICAL DOMAIN NO-GO");
    expect(result.canonical[0]?.legacyHost.detected).toBe(true);
    expect(result.canonical[0]?.legacyHost.signatures.map((signature) => signature.id)).toEqual([
      "joomla-seagull",
      "hotelrunner-legacy-landing",
    ]);
    expect(result.blockers).toContain(
      "https://www.kozbeylikonagi.com serves legacy host surface: legacy Joomla/Seagull template, legacy HotelRunner hosted landing surface",
    );
  });

  it("keeps com.tr brand domains in the public launch gate so split legacy surfaces cannot pass", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com", "https://www.kozbeylikonagi.com"],
      brandOrigins: ["https://www.kozbeylikonagi.com.tr"],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      ...vercelWebRecordResolvers(),
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.includes("kozbeylikonagi.com.tr")) return legacyHostResponse();
        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        return appShellResponse(href.includes("www.") ? "WWW" : "Kozbeyli Konağı");
      },
      resolveNsImpl: async () => ["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.previewReady).toBe(true);
    expect(result.canonicalReady).toBe(true);
    expect(result.brandReady).toBe(false);
    expect(result.decision).toBe("CANONICAL DOMAIN NO-GO");
    expect(result.brand[0]?.legacyHost.detected).toBe(true);
    expect(result.blockers).toContain(
      "https://www.kozbeylikonagi.com.tr serves legacy host surface: legacy Joomla/Seagull template, legacy HotelRunner hosted landing surface",
    );
  });

  it("returns NO-GO when app health is current but the homepage is not the opening video shell", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com"],
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      ...vercelWebRecordResolvers(),
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
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      ...vercelWebRecordResolvers(),
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
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def4567890",
      ...vercelWebRecordResolvers(),
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
    expect(result.dns.webRecordsOk).toBe(true);
    expect(result.decision).toBe("CANONICAL DOMAIN GO");
    expect(result.preview.home.hasOpeningHeroVideo).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("warns when web DNS records do not match Vercel targets without overriding verified web readiness", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com"],
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      resolve4Impl: async () => ["203.0.113.10"],
      resolveCnameImpl: async () => ["old-host.example.com"],
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        return appShellResponse(href.includes("www.") ? "WWW" : "Kozbeyli Konağı");
      },
      resolveNsImpl: async () => ["anastasia.ns.cloudflare.com", "theo.ns.cloudflare.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.decision).toBe("CANONICAL DOMAIN GO");
    expect(result.dnsReady).toBe(false);
    expect(result.dns.webRecordsOk).toBe(false);
    expect(result.blockers).toEqual([]);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        "A kozbeylikonagi.com does not match Vercel target 76.76.21.21; actual: 203.0.113.10",
        "A www.kozbeylikonagi.com does not match Vercel target 76.76.21.21; actual: 203.0.113.10",
      ]),
    );
    expect(result.dns.webRecordChecks.find((record) => record.host === "kozbeylikonagi.com")).toMatchObject({
      ready: false,
      expectedValue: "76.76.21.21",
      actualValues: ["203.0.113.10"],
    });
  });

  it("keeps DNS lookup failures as warnings instead of blocking a verified web deployment", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com"],
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      ...vercelWebRecordResolvers(),
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
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      ...vercelWebRecordResolvers(),
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
    expect(result.dns.authority.provider).toBe("cloudflare");
    expect(result.dns.nsSource).toContain("dns");
    expect(result.dns.mxSource).toContain("dns");
    expect(result.warnings).toEqual([]);
  });

  it("classifies Isimtescil/Natro nameservers as the active DNS authority", async () => {
    const { evaluateDomainReadiness } = await loadDomainReadinessModule();
    const result = await evaluateDomainReadiness({
      canonicalOrigins: ["https://kozbeylikonagi.com"],
      brandOrigins: [],
      previewOrigin: "https://kozbeyli-konagi.vercel.app",
      expectedCommit: "abc123def456",
      ...vercelWebRecordResolvers(),
      fetchImpl: async (url: string | URL | Request) => {
        const href = String(url);
        if (href.endsWith("/api/health")) return jsonResponse(healthyBody);
        return appShellResponse(href.includes("www.") ? "WWW" : "Kozbeyli Konağı");
      },
      resolveNsImpl: async () => ["ns1.natrohost.com", "ns2.natrohost.com"],
      resolveMxImpl: async () => [{ exchange: "mx.kozbeylikonagi.com", preference: 0 }],
    });

    expect(result.decision).toBe("CANONICAL DOMAIN GO");
    expect(result.dns.authority).toMatchObject({
      provider: "isimtescil",
      label: "Isimtescil/Natro",
    });
    expect(result.dns.authority.action).toContain("Isimtescil/Natro DNS zone");
  });
});
