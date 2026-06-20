import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function readBytes(relPath: string) {
  return fs.readFileSync(path.join(root, relPath));
}

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(relPath);
    if (!/\.(ts|tsx)$/.test(entry.name)) return [];
    return [relPath];
  });
}

describe("production readiness contracts", () => {
  it("keeps source files free from embedded NUL bytes", () => {
    const filesWithNulBytes = listSourceFiles("src")
      .concat(listSourceFiles("tests"))
      .filter((file) => readBytes(file).includes(0));

    expect(filesWithNulBytes).toEqual([]);
  });

  it("keeps public new-tab exits hardened against opener access", () => {
    const weakAnchors: string[] = [];
    const weakWindowOpens: string[] = [];

    for (const file of listSourceFiles("src")) {
      const source = read(file);

      for (const match of source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
        const tag = match[0];
        const rel = tag.match(/rel="([^"]+)"/)?.[1] ?? "";
        const relTokens = new Set(rel.split(/\s+/).filter(Boolean));

        if (!relTokens.has("noopener") || !relTokens.has("noreferrer")) {
          weakAnchors.push(`${file}: ${tag.replace(/\s+/g, " ").trim()}`);
        }
      }

      for (const match of source.matchAll(/window\.open\([^;\n]+/g)) {
        const call = match[0];
        if (call.includes("\"_blank\"") && (!call.includes("noopener") || !call.includes("noreferrer"))) {
          weakWindowOpens.push(`${file}: ${call}`);
        }
      }
    }

    expect(weakAnchors).toEqual([]);
    expect(weakWindowOpens).toEqual([]);
  });

  it("keeps Meta Pixel on the documented env key", () => {
    const trackedFiles = [
      "src/components/tracking-scripts.tsx",
      ".env.example",
      "README.md",
    ];

    const combined = trackedFiles.map(read).join("\n");

    expect(combined).toContain("NEXT_PUBLIC_META_PIXEL_ID");
    expect(combined).not.toContain("NEXT_PUBLIC_FB_PIXEL_ID");
  });

  it("keeps local stress tests exposed as package scripts", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["test:monkey"]).toBe(
      "playwright test tests/monkey.spec.ts --reporter=line",
    );
    expect(packageJson.scripts?.["test:chaos"]).toBe(
      "playwright test tests/destructive-chaos.spec.ts --reporter=line",
    );
    expect(packageJson.scripts?.["test:stress"]).toBe("npm run test:monkey && npm run test:chaos");
  });

  it("keeps cookie banner policy copy readable in Turkish and English", () => {
    const cookieConsent = read("src/components/cookie-consent.tsx");
    const footer = read("src/components/site-footer.tsx");

    expect(cookieConsent).toContain('policy: "Çerez Politikamızı"');
    expect(cookieConsent).toContain('suffix: " inceleyebilirsiniz."');
    expect(cookieConsent).toContain('policy: "Cookie Policy"');
    expect(cookieConsent).toContain('suffix: "."');
    expect(cookieConsent).not.toContain("Politikamızıinceleyebilirsiniz");
    expect(cookieConsent).not.toContain("opacity: 0.8");
    expect(cookieConsent).toContain("CONSENT_OPEN_EVENT");
    expect(footer).toContain("CookiePreferencesButton");
    expect(footer).toContain("Cookie Preferences");
    expect(footer).toContain("Çerez Tercihleri");
  });

  it("keeps publish readiness aware of payment and stress gates", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const readinessScript = read("scripts/publish-readiness.mjs");

    expect(readinessScript).toContain('"IYZICO_WEBHOOK_SECRET"');
    expect(readinessScript).toContain('"GARANTI_3D_STORE_KEY"');
    expect(readinessScript).toContain('"NEXT_PUBLIC_GA4_MEASUREMENT_ID"');
    expect(readinessScript).toContain('"NEXT_PUBLIC_GOOGLE_ADS_ID"');
    expect(readinessScript).toContain('"quality"');
    expect(readinessScript).toContain('"test:e2e"');
    expect(readinessScript).toContain('"test:monkey"');
    expect(readinessScript).toContain('"test:chaos"');
    expect(readinessScript).toContain('"test:stress"');
    expect(readinessScript).toContain('"security:audit"');
    expect(readinessScript).toContain('"evidence:scan"');
    expect(readinessScript).toContain('"evidence:scan:json"');
    expect(readinessScript).toContain('"media:hero"');
    expect(readinessScript).toContain('"media:hero:json"');
    expect(readinessScript).toContain('"media:hero:strict"');
    expect(readinessScript).toContain('"abuse:verify"');
    expect(readinessScript).toContain('"abuse:verify:json"');
    expect(readinessScript).toContain('"abuse:verify:strict"');
    expect(readinessScript).toContain('"analytics:verify"');
    expect(readinessScript).toContain('"analytics:verify:json"');
    expect(readinessScript).toContain('"analytics:verify:strict"');
    expect(readinessScript).toContain('"search:verify"');
    expect(readinessScript).toContain('"search:verify:json"');
    expect(readinessScript).toContain('"search:verify:strict"');
    expect(readinessScript).toContain('"garanti:verify"');
    expect(readinessScript).toContain('"garanti:verify:json"');
    expect(readinessScript).toContain('"garanti:verify:strict"');
    expect(readinessScript).toContain('"launch:audit"');
    expect(readinessScript).toContain('"launch:audit:json"');
    expect(readinessScript).toContain('"launch:audit:strict"');
    expect(readinessScript).toContain('"hms:verify"');
    expect(readinessScript).toContain('"hms:verify:json"');
    expect(readinessScript).toContain('"hms:verify:strict"');
    expect(readinessScript).toContain('"domain:verify"');
    expect(readinessScript).toContain('"domain:verify:json"');
    expect(readinessScript).toContain('"domain:verify:strict"');
    expect(readinessScript).toContain('"vercel:ops"');
    expect(readinessScript).toContain('"vercel:ops:json"');
    expect(readinessScript).toContain('"vercel:ops:strict"');
    expect(readinessScript).toContain('"vercel:env"');
    expect(readinessScript).toContain('"vercel:env:json"');
    expect(readinessScript).toContain('"vercel:env:strict"');
    expect(readinessScript).toContain('"github:ci"');
    expect(readinessScript).toContain('"github:ci:json"');
    expect(readinessScript).toContain('"github:ci:strict"');
    expect(readinessScript).toContain('"launch:smoke"');
    expect(readinessScript).toContain('"launch:smoke:live"');
    expect(readinessScript).toContain('"release:verify"');
    expect(packageJson.scripts?.["launch:smoke"]).toBe("node scripts/launch-smoke.mjs");
    expect(packageJson.scripts?.["launch:smoke:live"]).toBe(
      "cross-env PW_BASE_URL=https://kozbeyli-konagi.vercel.app node scripts/launch-smoke.mjs",
    );
    expect(packageJson.scripts?.["hms:verify"]).toBe("node scripts/hms-booking-readiness.mjs");
    expect(packageJson.scripts?.["hms:verify:json"]).toBe(
      "node scripts/hms-booking-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["hms:verify:strict"]).toBe(
      "node scripts/hms-booking-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["domain:verify"]).toBe("node scripts/domain-readiness.mjs");
    expect(packageJson.scripts?.["domain:verify:strict"]).toBe(
      "node scripts/domain-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["evidence:scan"]).toBe("node scripts/evidence-redaction-scan.mjs");
    expect(packageJson.scripts?.["evidence:scan:json"]).toBe(
      "node scripts/evidence-redaction-scan.mjs --json",
    );
    expect(packageJson.scripts?.["media:hero"]).toBe("node scripts/hero-media-audit.mjs");
    expect(packageJson.scripts?.["media:hero:json"]).toBe(
      "node scripts/hero-media-audit.mjs --json",
    );
    expect(packageJson.scripts?.["media:hero:strict"]).toBe(
      "node scripts/hero-media-audit.mjs --strict",
    );
    expect(packageJson.scripts?.["abuse:verify"]).toBe("node scripts/abuse-controls-readiness.mjs");
    expect(packageJson.scripts?.["abuse:verify:json"]).toBe(
      "node scripts/abuse-controls-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["abuse:verify:strict"]).toBe(
      "node scripts/abuse-controls-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["analytics:verify"]).toBe("node scripts/analytics-readiness.mjs");
    expect(packageJson.scripts?.["analytics:verify:json"]).toBe(
      "node scripts/analytics-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["analytics:verify:strict"]).toBe(
      "node scripts/analytics-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["search:verify"]).toBe("node scripts/search-local-seo-readiness.mjs");
    expect(packageJson.scripts?.["search:verify:json"]).toBe(
      "node scripts/search-local-seo-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["search:verify:strict"]).toBe(
      "node scripts/search-local-seo-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["garanti:verify"]).toBe("node scripts/garanti-pos-readiness.mjs");
    expect(packageJson.scripts?.["garanti:verify:json"]).toBe(
      "node scripts/garanti-pos-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["garanti:verify:strict"]).toBe(
      "node scripts/garanti-pos-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:ops"]).toBe("node scripts/vercel-ops-readiness.mjs");
    expect(packageJson.scripts?.["vercel:ops:json"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["vercel:ops:strict"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:env"]).toBe("node scripts/vercel-env-readiness.mjs");
    expect(packageJson.scripts?.["vercel:env:json"]).toBe(
      "node scripts/vercel-env-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["vercel:env:strict"]).toBe(
      "node scripts/vercel-env-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["github:ci"]).toBe("node scripts/github-ci-readiness.mjs");
    expect(packageJson.scripts?.["github:ci:json"]).toBe(
      "node scripts/github-ci-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["github:ci:strict"]).toBe(
      "node scripts/github-ci-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.quality).toBe("npm run lint && npm run typecheck && npm run test:unit && npm run build");
    expect(packageJson.scripts?.["test:e2e"]).toBe("playwright test");
    expect(packageJson.scripts?.["security:audit"]).toBe("npm audit --omit=dev --audit-level=high");
    expect(packageJson.scripts?.prebuild).toBe("node scripts/clean-next-build.mjs");
    expect(packageJson.scripts?.["release:verify"]).toBe("node scripts/release-verify.mjs");
    expect(readinessScript).toContain('"scripts/clean-next-build.mjs"');
    expect(readinessScript).toContain('"src/app/api/health/route.ts"');
    expect(readinessScript).toContain('"src/lib/production-readiness.ts"');
    expect(readinessScript).toContain('"tests/agentic-helper-safety.test.ts"');
    expect(readinessScript).toContain('"tests/abuse-controls-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/analytics-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/garanti-pos-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/search-local-seo-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/e2e/health.spec.ts"');
    expect(readinessScript).toContain('"tests/production-readiness.test.ts"');
    expect(readinessScript).toContain('"docs/evidence/README.md"');
    expect(readinessScript).toContain('"docs/github-actions-readiness.md"');
    expect(readinessScript).toContain('"docs/vercel-operations.md"');
    expect(readinessScript).toContain('"scripts/evidence-redaction-scan.mjs"');
    expect(readinessScript).toContain('"scripts/hero-media-audit.mjs"');
    expect(readinessScript).toContain('"scripts/abuse-controls-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/analytics-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/garanti-pos-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/search-local-seo-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/hms-booking-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/vercel-ops-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/vercel-env-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/github-ci-readiness.mjs"');
    expect(readinessScript).toContain("evaluateCommercialLaunch");
  });

  it("keeps release verification orchestrating the full local release gate", () => {
    const releaseScript = read("scripts/release-verify.mjs");
    const ciWorkflow = read(".github/workflows/ci.yml");

    for (const gate of [
      "security:audit",
      "evidence:scan",
      "media:hero:json",
      "abuse:verify:json",
      "analytics:verify:json",
      "search:verify:json",
      "garanti:verify:json",
      "hms:verify:json",
      "domain:verify:json",
      "vercel:ops:json",
      "vercel:env:json",
      "github:ci:json",
      "publish:verify",
      "launch:smoke",
      "test:stress",
      "launch:audit:json",
    ]) {
      expect(releaseScript).toContain(`script: "${gate}"`);
    }

    expect(releaseScript).toContain("--list");
    expect(releaseScript).toContain("Commercial evidence redaction scan");
    expect(releaseScript).toContain("Production abuse-control readiness diagnosis");
    expect(releaseScript).toContain("Analytics purchase readiness diagnosis");
    expect(releaseScript).toContain("Search and local SEO readiness diagnosis");
    expect(releaseScript).toContain("Garanti POS readiness diagnosis");
    expect(releaseScript).toContain("HMS booking target readiness diagnosis");
    expect(releaseScript).toContain("Canonical domain readiness diagnosis");
    expect(releaseScript).toContain("Vercel project and CLI operations diagnosis");
    expect(releaseScript).toContain("Vercel production env inventory diagnosis");
    expect(releaseScript).toContain("GitHub Actions CI readiness diagnosis");
    expect(releaseScript).toContain("domain/HMS/Vercel diagnostics");
    expect(releaseScript).toContain("process.env.ComSpec");
    expect(releaseScript).not.toContain("launch:audit:strict");
    expect(ciWorkflow).toContain("Release gate manifest");
    expect(ciWorkflow).toContain("node scripts/release-verify.mjs --list");
    expect(ciWorkflow).toContain("Evidence redaction scan");
    expect(ciWorkflow).toContain("npm run evidence:scan");
    expect(ciWorkflow).toContain("Hero media audit");
    expect(ciWorkflow).toContain("npm run media:hero:json");
    expect(ciWorkflow).toContain("Commercial readiness diagnostics");
    for (const diagnostic of [
      "abuse:verify:json",
      "analytics:verify:json",
      "search:verify:json",
      "garanti:verify:json",
      "hms:verify:json",
      "domain:verify:json",
    ]) {
      expect(ciWorkflow).toContain(`npm run ${diagnostic}`);
    }
    expect(ciWorkflow).toContain("Stress tests");
    expect(ciWorkflow).toContain("npm run test:stress");
    expect(ciWorkflow).toContain("Commercial launch audit and cutover plan");
    expect(ciWorkflow).toContain("npm run launch:audit:json");
    expect(ciWorkflow).toContain("npm run launch:cutover:json");
  });

  it("keeps the commercial launch audit executable and evidence-based", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const auditScript = read("scripts/commercial-launch-audit.mjs");
    const evidenceReadme = read("docs/evidence/README.md");

    expect(packageJson.scripts?.["launch:audit"]).toBe(
      "node scripts/commercial-launch-audit.mjs",
    );
    expect(packageJson.scripts?.["launch:audit:json"]).toBe(
      "node scripts/commercial-launch-audit.mjs --json",
    );
    expect(packageJson.scripts?.["launch:audit:strict"]).toBe(
      "node scripts/commercial-launch-audit.mjs --strict",
    );
    expect(auditScript).toContain("--json");
    expect(auditScript).toContain("NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL");
    expect(auditScript).toContain("OFFICIAL_HMS_BOOKING_ENGINE_URL");
    expect(auditScript).toContain("HMS booking engine handoff and booking UAT evidence");
    expect(auditScript).toContain("code_fallback");
    expect(auditScript).toContain("^https://");
    expect(auditScript).toContain("source_refs");
    expect(auditScript).toContain("missing source refs");
    expect(auditScript).toContain("scanEvidenceSource");
    expect(auditScript).toContain("redaction findings");
    expect(auditScript).toContain("process.exitCode");
    expect(auditScript).not.toContain("process.exit(strict");
    expect(evidenceReadme).toContain("source_refs:");
    expect(evidenceReadme).toContain("Ready evidence must include redacted source-system references");

    for (const gate of [
      "hms-booking-engine.md",
      "canonical-domain.md",
      "production-abuse-controls.md",
      "garanti-pos.md",
      "analytics-purchase.md",
      "search-local-seo.md",
      "legal-dpa.md",
    ]) {
      expect(auditScript).toContain(gate);
      expect(evidenceReadme).toContain(gate);
      const evidenceFile = read(`docs/evidence/${gate}`);
      expect(evidenceFile.length, `${gate} should be a real evidence template`).toBeGreaterThan(300);
      expect(evidenceFile, `${gate} must not be marked ready without source-system proof`).toMatch(
        /status:\s*pending/i,
      );
      expect(evidenceFile).toContain("## Residual Risk");
    }
  });

  it("keeps production abuse-control verification source-bound and evidence-gated", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const abuseReadiness = read("scripts/abuse-controls-readiness.mjs");
    const leadRoute = read("src/app/api/lead/route.ts");
    const legacyLeadService = read("src/services/lead.ts");
    const leadForm = read("src/components/lead-form.tsx");
    const trackingScripts = read("src/components/tracking-scripts.tsx");

    expect(packageJson.scripts?.["abuse:verify:strict"]).toBe(
      "node scripts/abuse-controls-readiness.mjs --strict",
    );
    expect(abuseReadiness).toContain("PRODUCTION ABUSE CONTROLS BLOCKED");
    expect(abuseReadiness).toContain("production_abuse_controls");
    expect(abuseReadiness).toContain("docs/evidence/production-abuse-controls.md");
    expect(abuseReadiness).toContain("UPSTASH_REDIS_REST_URL must use HTTPS");
    expect(abuseReadiness).toContain("legacy_env_name_removed");
    expect(abuseReadiness).toContain("process.exitCode");
    expect(abuseReadiness).not.toContain("process.exit(strict");
    expect(leadRoute).toContain("env.TURNSTILE_SECRET_KEY");
    expect(leadRoute).toContain("if (!token) return false");
    expect(legacyLeadService).toContain("process.env.TURNSTILE_SECRET_KEY");
    expect(legacyLeadService).not.toContain("process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY");
    expect(leadForm).toContain("cf-turnstile");
    expect(leadForm).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    expect(trackingScripts).toContain("https://challenges.cloudflare.com/turnstile/v0/api.js");
  });

  it("keeps analytics purchase verification consent-bound and evidence-gated", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const analyticsReadiness = read("scripts/analytics-readiness.mjs");
    const layout = read("src/app/layout.tsx");
    const trackingScripts = read("src/components/tracking-scripts.tsx");
    const gtm = read("src/lib/gtm.ts");
    const ga4Server = read("src/lib/ga4-server.ts");
    const hotelrunnerWebhook = read("src/app/api/webhook/hotelrunner/route.ts");
    const publicEnv = read("src/lib/public-env.ts");

    expect(packageJson.scripts?.["analytics:verify:strict"]).toBe(
      "node scripts/analytics-readiness.mjs --strict",
    );
    expect(analyticsReadiness).toContain("ANALYTICS PURCHASE TRACKING BLOCKED");
    expect(analyticsReadiness).toContain("analytics_purchase");
    expect(analyticsReadiness).toContain("docs/evidence/analytics-purchase.md");
    expect(analyticsReadiness).toContain("NEXT_PUBLIC_GTM_ID must look like GTM-XXXX");
    expect(analyticsReadiness).toContain("NEXT_PUBLIC_META_PIXEL_ID must be the numeric Meta Pixel ID");
    expect(analyticsReadiness).toContain("GA4_MEASUREMENT_ID must look like G-XXXX");
    expect(analyticsReadiness).toContain("NEXT_PUBLIC_GA4_MEASUREMENT_ID must look like G-XXXX");
    expect(analyticsReadiness).toContain("NEXT_PUBLIC_GOOGLE_ADS_ID must look like AW-XXXXXXXXX");
    expect(analyticsReadiness).toContain("direct_google_tag_fallback");
    expect(analyticsReadiness).toContain("meta_legacy_key_removed");
    expect(analyticsReadiness).toContain("process.exitCode");
    expect(analyticsReadiness).not.toContain("process.exit(strict");
    expect(layout).toContain("<TrackingScripts />");
    expect(trackingScripts).toContain("consent.analytics && publicEnv.NEXT_PUBLIC_GTM_ID");
    expect(trackingScripts).toContain("shouldLoadDirectGoogleTag");
    expect(trackingScripts).toContain("!publicEnv.NEXT_PUBLIC_GTM_ID");
    expect(trackingScripts).toContain("NEXT_PUBLIC_GA4_MEASUREMENT_ID");
    expect(trackingScripts).toContain("NEXT_PUBLIC_GOOGLE_ADS_ID");
    expect(trackingScripts).toContain("direct-google-tag");
    expect(trackingScripts).toContain("consent.marketing && publicEnv.NEXT_PUBLIC_META_PIXEL_ID");
    expect(gtm).toContain("window.gtag");
    expect(gtm).toContain('window.gtag("event", event, params)');
    expect(trackingScripts).toContain("https://challenges.cloudflare.com/turnstile/v0/api.js");
    expect(gtm).toContain("trackViewItem");
    expect(gtm).toContain("trackBeginCheckout");
    expect(gtm).toContain("trackGenerateLead");
    expect(ga4Server).toContain("sendGa4Purchase");
    expect(ga4Server).toContain("https://www.google-analytics.com/mp/collect");
    expect(hotelrunnerWebhook).toContain("sendGa4Purchase");
    expect(hotelrunnerWebhook).toContain("if (!isCancelled)");
    expect(publicEnv).not.toContain("GA4_API_SECRET");
  });

  it("keeps search and local SEO verification source-bound and truthfulness-gated", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const searchReadiness = read("scripts/search-local-seo-readiness.mjs");
    const metadata = read("src/lib/metadata.ts");
    const envSource = read("src/lib/env.ts");
    const sitemap = read("src/app/sitemap.ts");
    const robots = read("src/app/robots.ts");
    const schema = read("src/lib/schema.ts");
    const locationContent = read("src/components/location-page-content.tsx");
    const evidence = read("docs/evidence/search-local-seo.md");

    expect(packageJson.scripts?.["search:verify:strict"]).toBe(
      "node scripts/search-local-seo-readiness.mjs --strict",
    );
    expect(searchReadiness).toContain("SEARCH LOCAL SEO BLOCKED");
    expect(searchReadiness).toContain("search_local_seo");
    expect(searchReadiness).toContain("docs/evidence/search-local-seo.md");
    expect(searchReadiness).toContain("GOOGLE_SITE_VERIFICATION must be the raw Search Console token");
    expect(searchReadiness).toContain("structured_data_truthfulness");
    expect(searchReadiness).toContain("process.exitCode");
    expect(searchReadiness).not.toContain("process.exit(strict");
    expect(metadata).toContain("env.GOOGLE_SITE_VERIFICATION");
    expect(metadata).toContain("{ google: env.GOOGLE_SITE_VERIFICATION }");
    expect(envSource).toContain("GOOGLE_SITE_VERIFICATION");
    expect(sitemap).toContain("alternates");
    expect(sitemap).toContain("'/lokasyon'");
    expect(sitemap).toContain("'/deneyimler/foca-gezi-rehberi'");
    expect(robots).toContain("sitemap: `${siteUrl}/sitemap.xml`");
    expect(schema).toContain('"@type": ["Hotel", "LodgingBusiness", "Restaurant"]');
    expect(schema).toContain('"@type": "PostalAddress"');
    expect(schema).toContain('"@type": "GeoCoordinates"');
    expect(schema).not.toContain("starRating");
    expect(schema).not.toContain("aggregateRating");
    expect(schema).not.toContain("review:");
    expect(schema).not.toContain("award:");
    expect(locationContent).toContain('"@type": "LodgingBusiness"');
    expect(locationContent).toContain('"@type": "BreadcrumbList"');
    expect(evidence).toContain("Google Business Profile");
    expect(evidence).toContain("Hotel Center");
    expect(evidence).toContain("npm run search:verify");
  });

  it("keeps Garanti POS verification card-data-free and evidence-gated", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const garantiReadiness = read("scripts/garanti-pos-readiness.mjs");
    const checkoutRoute = read("src/app/api/checkout/route.ts");
    const wizardHook = read("src/components/payment-wizard/use-payment-wizard.ts");
    const paymentStep = read("src/components/payment-wizard/steps/payment-step.tsx");
    const wizardTypes = read("src/components/payment-wizard/types.ts");
    const checkoutContract = read("tests/e2e/checkout-contract.spec.ts");
    const evidence = read("docs/evidence/garanti-pos.md");
    const paymentDecision = read("docs/odeme-karari.md");
    const paymentUiSource = [wizardHook, paymentStep, wizardTypes].join("\n");

    expect(packageJson.scripts?.["garanti:verify:strict"]).toBe(
      "node scripts/garanti-pos-readiness.mjs --strict",
    );
    expect(garantiReadiness).toContain("GARANTI POS READINESS BLOCKED");
    expect(garantiReadiness).toContain("garanti_pos");
    expect(garantiReadiness).toContain("docs/evidence/garanti-pos.md");
    expect(garantiReadiness).toContain("GARANTI_POS_MODE must be one of");
    expect(garantiReadiness).toContain("checkout_route_card_data_rejected");
    expect(garantiReadiness).toContain("wizard_collects_no_card_data");
    expect(garantiReadiness).toContain("process.exitCode");
    expect(garantiReadiness).not.toContain("process.exit(strict");
    expect(checkoutRoute).toContain("}).strict();");
    expect(checkoutRoute).toContain("forbiddenPaymentFields");
    expect(checkoutRoute).toContain("checkout.card_data_rejected");
    expect(checkoutRoute).toContain("validateSameOrigin");
    expect(checkoutRoute).toContain("enforceRateLimit");
    expect(checkoutRoute).toContain("calculateBookingQuote");
    expect(checkoutRoute).toContain("Tahsilat bu route'ta YAPILMAZ");
    expect(checkoutRoute).toContain("Garanti BBVA Sanal POS 3D Secure");
    expect(checkoutRoute).not.toContain("cardNumber:");
    expect(checkoutRoute).not.toContain("cvv:");
    expect(paymentUiSource).toContain("Kart state'i YOK");
    expect(paymentUiSource).toContain("Kart alanlari KASITLI olarak yok");
    expect(paymentUiSource).toContain("We do not ask for card details here");
    expect(paymentStep).not.toContain('type="password"');
    expect(checkoutContract).toContain("Kart alanı gönderilirse 400 ile reddedilir");
    expect(checkoutContract).toContain("cardNumber");
    expect(evidence).toContain("npm run garanti:verify");
    expect(evidence).toContain("Do not paste raw credentials, card numbers, customer PII");
    expect(paymentDecision).toContain("kart bilgisi ASLA istemez");
    expect(paymentDecision).toContain("Garanti BBVA Sanal POS'un 3D Secure");
    expect(paymentDecision).toContain("SAQ-A");
  });

  it("keeps the HMS booking engine as a new-tab handoff instead of a cramped iframe", () => {
    const bookingEmbed = read("src/components/hms-booking-embed.tsx");
    const bookingUrlHelper = read("src/lib/booking-engine-url.ts");
    const siteHeader = read("src/components/site-header.tsx");
    const mobileActionBar = read("src/components/mobile-action-bar.tsx");
    const homeHero = read("src/components/home/home-hero.tsx");
    const finalCta = read("src/components/home/final-cta.tsx");
    const roomsClient = read("src/components/rooms-client.tsx");
    const roomDetail = read("src/components/room-detail-client.tsx");
    const faqPageContent = read("src/components/faq-page-content.tsx");
    const envExample = read(".env.example");
    const hmsReadiness = read("scripts/hms-booking-readiness.mjs");
    const primaryBookingCtas = [
      siteHeader,
      mobileActionBar,
      homeHero,
      finalCta,
      roomsClient,
      roomDetail,
      faqPageContent,
    ];

    expect(bookingEmbed).toContain("getConfiguredBookingEngineHref");
    expect(bookingEmbed).toContain("bookingHref");
    expect(bookingEmbed).toContain('target="_blank"');
    expect(bookingEmbed).toContain('rel="noopener noreferrer"');
    expect(bookingEmbed).toContain("Rezervasyon");
    expect(bookingEmbed).not.toContain("Rezervasyon Ekranı Ayrı Sekmede");
    expect(bookingEmbed).not.toContain("Rezervasyonu Ayrı Sekmede Aç");
    expect(bookingEmbed).toContain("Booking");
    expect(bookingEmbed).toContain("Resmi HMS ekranı yeni sekmede açılır");
    expect(bookingEmbed).toContain("Kart bilgisi bu sitede saklanmaz");
    expect(bookingEmbed).toContain("Official HMS screen opens in a new tab");
    expect(bookingEmbed).toContain("Card details are not stored on this site");
    expect(read("src/app/globals.css")).toContain(".booking-handoff-trust");
    expect(roomDetail).toContain("Resmi HMS rezervasyon ekranı");
    expect(roomDetail).toContain("Kart bilgisi bu sitede saklanmaz");
    expect(bookingEmbed).not.toContain("<iframe");
    expect(siteHeader).toContain("getConfiguredBookingEngineHref");
    expect(siteHeader).toContain('target="_blank"');
    expect(siteHeader).toContain('data-event="booking_engine_open"');
    for (const ctaSource of primaryBookingCtas) {
      expect(ctaSource).toContain("getConfiguredBookingEngineHref");
      expect(ctaSource).toContain('target="_blank"');
      expect(ctaSource).toContain('rel="noopener noreferrer"');
      expect(ctaSource).toContain('data-event="booking_engine_open"');
    }
    expect(mobileActionBar).not.toContain('bookingHref: "/rezervasyon"');
    expect(mobileActionBar).not.toContain('bookingHref: "/en/rezervasyon"');
    expect(homeHero).not.toContain('locale === "en" ? "/en/rezervasyon" : "/rezervasyon"');
    expect(finalCta).not.toContain('locale === "en" ? "/en/rezervasyon" : "/rezervasyon"');
    expect(roomsClient).not.toContain('href={locale === "en" ? "/en/rezervasyon" : "/rezervasyon"}');
    expect(roomDetail).not.toContain('href={`/rezervasyon?oda=${slug}`}');
    expect(bookingUrlHelper).toContain("OFFICIAL_HMS_BOOKING_ENGINE_URL");
    expect(bookingUrlHelper).toContain("OFFICIAL_HMS_BOOKING_ENGINE_HOST");
    expect(bookingUrlHelper).toContain("https://kozbeyli-konagi.hmshotel.net/");
    expect(bookingUrlHelper).toContain('url.protocol !== "https:"');
    expect(bookingUrlHelper).toContain("url.hostname !== OFFICIAL_HMS_BOOKING_ENGINE_HOST");
    expect(bookingUrlHelper).toContain('utm_source", "website"');
    expect(bookingUrlHelper).toContain('utm_medium", "booking_engine"');
    expect(hmsReadiness).toContain("HMS BOOKING TARGET PASS");
    expect(hmsReadiness).toContain("OFFICIAL_HMS_BOOKING_ENGINE_HOST");
    expect(hmsReadiness).toContain("kozbeyli-konagi.hmshotel.net");
    expect(hmsReadiness).toContain("soleil-mansion");
    expect(hmsReadiness).toContain("wrong-property signal");
    expect(envExample).toContain("NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL=https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine");
  });

  it("keeps the CSP frame surface narrow after moving booking to new-tab handoff", () => {
    const nextConfig = read("next.config.ts");

    expect(nextConfig).toContain('"object-src \'none\'"');
    expect(nextConfig).toContain('"base-uri \'self\'"');
    expect(nextConfig).toContain('"form-action \'self\'"');
    expect(nextConfig).toContain('process.env.NODE_ENV !== "production" ? "\'unsafe-eval\'" : ""');
    expect(nextConfig).toContain(
      '"frame-src \'self\' https://www.openstreetmap.org https://www.googletagmanager.com https://challenges.cloudflare.com"',
    );
    expect(nextConfig).toContain("https://www.googleadservices.com");
    expect(nextConfig).toContain("https://googleads.g.doubleclick.net");
    expect(nextConfig).toContain("https://stats.g.doubleclick.net");
    expect(nextConfig).not.toContain("frame-src https: blob:");
    expect(nextConfig).not.toContain("allows the HMS booking engine iframe");
  });

  it("keeps canonical domain readiness executable and out of the green release gate until DNS is ready", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const domainScript = read("scripts/domain-readiness.mjs");
    const releaseScript = read("scripts/release-verify.mjs");

    expect(packageJson.scripts?.["domain:verify:json"]).toBe(
      "node scripts/domain-readiness.mjs --json",
    );
    expect(domainScript).toContain("CANONICAL DOMAIN NO-GO");
    expect(domainScript).toContain("/api/health");
    expect(domainScript).toContain('EXPECTED_HERO_VIDEO_SRC = "/videos/hero.mp4"');
    expect(domainScript).toContain("hasOpeningHeroVideo");
    expect(domainScript).toContain("homepage does not expose opening hero video");
    expect(domainScript).toContain("firstHopInsecure");
    expect(domainScript).toContain("redirects first hop to insecure HTTP");
    expect(domainScript).toContain("insecure first-hop redirect");
    expect(domainScript).toContain("queryDnsOverHttps");
    expect(domainScript).toContain("DNS_FALLBACK_ENDPOINTS");
    expect(domainScript).toContain("dnsFallbackFetchImpl");
    expect(domainScript).toContain("LEGACY_HOST_SIGNATURES");
    expect(domainScript).toContain("legacy Joomla/Seagull template");
    expect(domainScript).toContain("legacy HotelRunner hosted landing surface");
    expect(domainScript).toContain("serves legacy host surface");
    expect(domainScript).toContain("process.exitCode");
    expect(domainScript).not.toContain("process.exit(strict");
    expect(domainScript).toContain("kozbeylikonagi.com");
    expect(domainScript).toContain("kozbeyli-konagi.vercel.app");
    expect(releaseScript).not.toContain("domain:verify:strict");
  });

  it("keeps launch readiness evidence current after the light-theme and domain hardening passes", () => {
    const launchReadiness = read("docs/launch-readiness.md");
    const publishTarget = read("docs/publish-target.md");
    const canonicalEvidence = read("docs/evidence/canonical-domain.md");

    expect(launchReadiness).toContain("Son revizyon: 2026-06-20.");
    expect(launchReadiness).toContain("2026-06-20 canonical legacy host güncellemesi");
    expect(launchReadiness).toContain("2026-06-20 public light theme güncellemesi");
    expect(launchReadiness).toContain("31 files / 186 tests");
    expect(launchReadiness).toContain("68 routes generated");
    expect(launchReadiness).toContain("170 Playwright tests (168 passed / 2 skipped)");
    expect(launchReadiness).toContain("current commit'i `/api/health` üzerinden doğruluyor");
    expect(launchReadiness).toContain("https://kozbeyli-konagi.vercel.app");
    expect(launchReadiness).toContain("legacy Joomla/Seagull template");
    expect(launchReadiness).not.toContain("9 files / 29 tests");
    expect(launchReadiness).not.toContain("66 routes generated");
    expect(launchReadiness).not.toContain("113 passed / 2 skipped");

    expect(publishTarget).toContain("Son revizyon: 2026-06-20");
    expect(publishTarget).toContain("168 passed / 2 skipped");
    expect(publishTarget).toContain("31 files / 186 tests");
    expect(publishTarget).toContain("68 routes");
    expect(publishTarget).toContain("legacy Joomla/HotelRunner host imzası");
    expect(publishTarget).not.toContain("113 passed / 2 skipped");
    expect(publishTarget).not.toContain("http://127.0.0.1:3010");

    expect(canonicalEvidence).toContain("date: 2026-06-20");
    expect(canonicalEvidence).toContain("legacy Joomla/Seagull template");
    expect(canonicalEvidence).toContain("legacy HotelRunner hosted landing surface");
    expect(canonicalEvidence).toContain("DNS NS/MX can be verified through DNS-over-HTTPS");
  });

  it("keeps Vercel operational prerequisites visible without hiding the global CLI requirement", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const vercelOps = read("scripts/vercel-ops-readiness.mjs");
    const vercelEnv = read("scripts/vercel-env-readiness.mjs");
    const cutover = read("scripts/production-cutover-plan.mjs");
    const runbook = read("docs/vercel-operations.md");

    expect(packageJson.scripts?.["vercel:ops"]).toBe("node scripts/vercel-ops-readiness.mjs");
    expect(packageJson.scripts?.["launch:cutover"]).toBe("node scripts/production-cutover-plan.mjs");
    expect(packageJson.scripts?.["launch:cutover:json"]).toBe(
      "node scripts/production-cutover-plan.mjs --json",
    );
    expect(packageJson.scripts?.["launch:cutover:strict"]).toBe(
      "node scripts/production-cutover-plan.mjs --strict",
    );
    expect(packageJson.scripts?.["hms:verify:strict"]).toBe(
      "node scripts/hms-booking-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:ops:strict"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:env:strict"]).toBe(
      "node scripts/vercel-env-readiness.mjs --strict",
    );
    expect(vercelOps).toContain("Kozbeyli Konagi Vercel operations readiness");
    expect(vercelEnv).toContain("Kozbeyli Konagi Vercel production env readiness");
    expect(vercelEnv).toContain("parseVercelEnvList");
    expect(vercelEnv).toContain("VERCEL PRODUCTION ENV INCOMPLETE");
    expect(vercelEnv).toContain("VERCEL ENV INVENTORY UNAVAILABLE");
    expect(vercelEnv).toContain("Production env names configured");
    expect(vercelEnv).toContain("values are not read or validated");
    expect(vercelEnv).toContain("valueValidation: \"not_performed\"");
    expect(vercelEnv).not.toContain("process.env.");
    expect(cutover).toContain("VERCEL_AUTH_COMMANDS");
    expect(cutover).toContain("vercel whoami");
    expect(cutover).toContain("npm run hms:verify:strict");
    expect(vercelOps).toContain("PASS_WITH_WARNINGS");
    expect(vercelOps).toContain("npm i -g vercel");
    expect(vercelOps).toContain("APPDATA");
    expect(vercelOps).toContain("Only npx Vercel fallback is available");
    expect(vercelOps).toContain("persistent global CLI is not installed on PATH");
    expect(vercelOps).toContain("resolveVercelCmdTarget");
    expect(vercelOps).not.toContain("candidates.push(path.join(npmPrefix, \"node_modules\", \"vercel\", \"dist\", \"vc.js\"");
    expect(vercelOps).toContain('"vercel_auth"');
    expect(vercelOps).toContain('"whoami"');
    expect(vercelOps).toContain("env, deploy and logs operations");
    expect(vercelOps).toContain("Run vercel login");
    expect(vercelOps).toContain("is required for vercel env pull, vercel deploy and vercel logs");
    expect(vercelOps).toContain("canonical-domain.md");
    expect(vercelOps).toContain("kozbeyli-konagi");
    expect(runbook).toContain("npm run vercel:ops");
    expect(runbook).toContain("npm run vercel:env");
    expect(runbook).toContain("npm run vercel:env:strict");
    expect(runbook).toContain("never prints values");
    expect(runbook).toContain("npm run launch:cutover");
    expect(runbook).toContain("KPI and review loop");
    expect(runbook).toContain("npm run vercel:ops:strict");
    expect(runbook).toContain("npm i -g vercel");
    expect(runbook).toContain("vercel whoami");
    expect(runbook).toContain("Do not store secrets in this repository");
  });

  it("keeps B2B availability fail-closed without a live inventory source", () => {
    const availabilityRoute = read("src/app/api/v1/availability/route.ts");

    expect(availabilityRoute).toContain("Live availability source is not configured.");
    expect(availabilityRoute).toContain("B2B_ALLOW_STATIC_AVAILABILITY");
    expect(availabilityRoute).toContain('process.env.NODE_ENV !== "production"');
    expect(availabilityRoute.indexOf("ALLOW_STATIC_AVAILABILITY")).toBeLessThan(
      availabilityRoute.indexOf("available: true"),
    );
  });

  it("keeps Iyzico webhook verification independent from HMS ES256 signing", () => {
    const iyzicoRoute = read("src/app/api/webhook/iyzico/route.ts");

    expect(iyzicoRoute).toContain("createDigest(bodyText)");
    expect(iyzicoRoute).not.toContain("HMS_WEBHOOK_ES256_PUBLIC_KEY");
    expect(iyzicoRoute).not.toContain("verifyEs256Signature");
  });

  it("keeps admin growth dashboard restricted to Payload admins", () => {
    const growthPage = read("src/app/admin/growth/page.tsx");

    expect(growthPage).toContain('user?.role === "admin"');
    expect(growthPage).not.toContain("authenticated = Boolean(user)");
  });

  it("keeps legal copy aligned with no-card-data payment architecture", () => {
    const privacy = read("src/app/gizlilik-politikasi/page.tsx");
    const kvkk = read("src/app/kvkk/page.tsx");

    expect(privacy).toContain("kart numarası veya CVV");
    expect(privacy).toContain("kart verileri");
    expect(kvkk).toContain("Web sitesi");
    expect(kvkk).toContain("kart numarası veya CVV");
    expect(kvkk).not.toContain("banka/kredi kartı bilgileri");
  });

  it("keeps generative design guidance out of product media placement", () => {
    const designSkill = read("agent/growth-engine/sub-skills/design-agent/SKILL.md");
    const mediaAudit = read("docs/media-placement-audit.md");

    expect(designSkill.toLowerCase()).toContain("concept exploration only");
    expect(designSkill).toContain("never product media");
    expect(mediaAudit).toContain("Any generated or hallucinated image");
  });

  it("keeps growth and SEO helper scripts evidence-based and read-only", () => {
    const leadGen = read("scripts/lead-gen.ts");
    const seoAudit = read("scripts/seo-audit.ts");
    const seoPilot = read("scripts/seo-auto-pilot.ts");
    const adCopyOptimizer = read("scripts/ad-copy-optimizer.ts");
    const geoRefactor = read("scripts/geo-refactor.ts");
    const adOptimizer = read("src/lib/agents/ad-optimizer.ts");
    const leadService = read("src/lib/ai/lead-service.ts");
    const combined = [leadGen, seoAudit, seoPilot, adCopyOptimizer, geoRefactor, adOptimizer, leadService].join("\n");

    for (const forbidden of [
      "mockLeads",
      "mockStats",
      "SYSTEM_PILOT",
      "AI-Generated outreach",
      "Simulated Logic",
      "FOUND (Optimized",
      "score: 95",
      "payload.create",
      "agent_discovery",
      "renderHeritageVideo",
      "fs.writeFileSync",
      "Math.random",
      "Syncing lead",
    ]) {
      expect(combined, `production helper scripts must not contain ${forbidden}`).not.toContain(forbidden);
    }

    expect(leadGen).toContain("writesPerformed: 0");
    expect(leadGen).toContain("This script never writes to Payload/CRM");
    expect(seoAudit).toContain("failures");
    expect(seoAudit).toContain("metadataBase");
    expect(seoPilot).toContain("Evidence-based content gap scan only");
    expect(seoPilot).toContain("nextEditorialBacklog");
    expect(adCopyOptimizer).toContain("This script never renders video or publishes ads.");
    expect(adOptimizer).toContain("generatedAssets: []");
    expect(geoRefactor).toContain("writesPerformed: 0");
    expect(geoRefactor).toContain("No files are written and no generated claims are inserted.");
    expect(leadService).toContain("CRM writes are disabled in LeadService");
  });

  it("keeps launch smoke focused on public routes, hero video, location and media", () => {
    const launchSmokeScript = read("scripts/launch-smoke.mjs");

    expect(launchSmokeScript).toContain("tests/e2e/publish-routes.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/health.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/hero-video.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/contact-location.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/media-assets.spec.ts");
    expect(launchSmokeScript).toContain("PW_BASE_URL");
    expect(launchSmokeScript).toContain("npm i -g vercel");
    expect(launchSmokeScript).toContain("where.exe");
    expect(launchSmokeScript).toContain("dist\", \"vc.js");
    expect(launchSmokeScript).toContain(".next/BUILD_ID");
    expect(launchSmokeScript).toContain("node_modules/@playwright/test/cli.js");
    expect(launchSmokeScript).toContain("test-results\", \"launch-smoke");
    expect(launchSmokeScript).toContain("makeRunScopedOutputDir");
    expect(launchSmokeScript).toContain("process.pid");
    expect(launchSmokeScript).toContain("--output");
  });

  it("keeps stress tests reproducible with seeded interaction plans", () => {
    const monkeySpec = read("tests/monkey.spec.ts");
    const chaosSpec = read("tests/destructive-chaos.spec.ts");

    expect(monkeySpec).toContain("function seededRandom");
    expect(monkeySpec).not.toContain("Math.random");
    expect(chaosSpec).toContain("function seededRandom");
    expect(chaosSpec).toContain("seed=20260619");
    expect(chaosSpec).not.toContain("Math.random");
  });

  it("keeps release verification producing the commercial cutover plan", () => {
    const releaseScript = read("scripts/release-verify.mjs");
    const publishReadiness = read("scripts/publish-readiness.mjs");
    const cutoverPlan = read("scripts/production-cutover-plan.mjs");

    expect(releaseScript).toContain("launch:cutover:json");
    expect(publishReadiness).toContain("scripts/production-cutover-plan.mjs");
    expect(publishReadiness).toContain("launch:cutover:strict");
    expect(cutoverPlan).toContain("Kozbeyli Konagi production cutover plan");
    expect(cutoverPlan).toContain("npm i -g vercel");
    expect(cutoverPlan).toContain("HTTPS-to-HTTP first-hop redirect");
    expect(cutoverPlan).toContain("legacy Joomla/Seagull template");
    expect(cutoverPlan).toContain("legacy HotelRunner hosted landing surface");
    expect(cutoverPlan).toContain("Remove old Joomla/Seagull and HotelRunner hosted landing routing");
    expect(cutoverPlan).toContain("no legacy host signatures");
    expect(cutoverPlan).toContain("Treat NS/MX DNS PASS separately from web serving readiness");
    expect(cutoverPlan).toContain("A records to 76.76.21.21 for the apex and www hosts");
    expect(cutoverPlan).toContain("re-run vercel domains inspect before editing DNS");
    expect(cutoverPlan).toContain("Turkish ccTLD brand origins");
    expect(cutoverPlan).toContain("remove the bad override to use the official code fallback");
    expect(cutoverPlan).toContain("Run npm run hms:verify:strict");
    expect(cutoverPlan).toContain("Verify the public reservation CTA opens the approved HTTPS HMS engine");
    expect(cutoverPlan).toContain("vercel env add NEXT_PUBLIC_GA4_MEASUREMENT_ID production");
    expect(cutoverPlan).toContain("vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production");
    expect(cutoverPlan).toContain("npm run domain:verify:strict");
    expect(cutoverPlan).toContain("npm run hms:verify:strict");
    expect(cutoverPlan).toContain("npm run launch:audit:strict");
  });

  it("keeps homepage Foça positioning broad instead of only Eski or Yeni Foça", () => {
    const homepageCopy = [
      read("src/dictionaries/tr.json"),
      read("src/dictionaries/en.json"),
      read("src/components/home/home-hero.tsx"),
      read("src/components/home/experiences-teaser.tsx"),
      read("src/components/home/marquee-band.tsx"),
      read("src/components/site-footer.tsx"),
    ].join("\n");

    expect(homepageCopy).toContain('"eyebrow": "FOÇA"');
    expect(homepageCopy).toContain("Foça kıyı rotalarına yakın");
    expect(homepageCopy).toContain("Foça sahil yürüyüşleri");
    expect(homepageCopy).toContain('"Foça"');
    expect(homepageCopy).not.toContain("FOÇA, KOZBEYLİ");
    expect(homepageCopy).not.toMatch(/Foça Kozbeyli['’]de/);
    expect(homepageCopy).not.toContain("Foça — Kozbeyli Köyü");
    expect(homepageCopy).not.toContain("Foça — Kozbeyli Village");
    expect(homepageCopy).not.toMatch(/ESKİ FOÇA|OLD FOÇA|Eski Foça|Old Foça|Yeni Foça|New Foça/);
    expect(homepageCopy).not.toMatch(/Foça'ya 12 dakika|12 minutes from Foça/i);
  });

  it("keeps homepage hero video available during the opening viewport", () => {
    const homeHero = read("src/components/home/home-hero.tsx");
    const globals = read("src/app/globals.css");
    const heroVideoCss = globals.match(/\.hero-video\s*\{[\s\S]*?\n  \}/)?.[0] ?? "";

    // LCP guvenligi: poster priority eleman kalir; video da ilk HTML'de yer
    // alir. Onceki load + idle/timeout bekleme isletme sahibinin tarayicisinda
    // videoyu tamamen yok gibi gosteriyordu. CSS de React event'i bekleyip
    // oynayan videoyu opacity:0'da birakmamali.
    expect(homeHero).toContain('preload="auto"');
    // Onayli hero asseti kilitle: 15.78s montaj hero.mp4 (eski 2.75s hero-property
    // klibi superseded). Bkz docs/media-placement-audit.md.
    expect(homeHero).toContain('HERO_VIDEO_SRC = "/videos/hero.mp4"');
    expect(homeHero).not.toContain("hero-property.mp4");
    expect(homeHero).not.toContain("HERO_VIDEO_BOOT_DELAY_MS");
    expect(homeHero).not.toContain("requestIdleCallback");
    expect(homeHero).not.toContain("prefers-reduced-motion: reduce");
    expect(homeHero).not.toContain("setShouldRender");
    expect(homeHero).not.toContain("if (!shouldRender) return null");
    expect(homeHero).not.toContain("const [shouldRender");
    expect(heroVideoCss).toContain("opacity: 1");
    expect(heroVideoCss).not.toContain("opacity: 0");
    expect(homeHero).toContain('fetchPriority="high"');
    expect(homeHero).toContain("hero-video-poster-1280.webp");
    expect(homeHero).toContain('data-testid="hero-video-toggle"');
    expect(homeHero).toContain("video.defaultMuted = true");
    expect(homeHero).toContain("userPausedRef.current && !force");
    expect(globals).toContain(".hero-video-control");
    expect(globals).toContain("rgba(61, 74, 59, 0.88)");
    expect(globals).toContain(".hero-title-accent");
    expect(globals).toContain("color: var(--gold-soft)");
    expect(globals).toContain("font-style: italic");
    expect(globals).toContain("font-size: clamp(1.75rem, 7vw, 2.25rem)");
    expect(globals).toContain("color: #fff");
    expect(globals).toContain("0 2px 34px rgba(0, 0, 0, 0.5)");
    expect(globals).toContain("text-shadow: 0 2px 40px rgba(0, 0, 0, 0.3)");
    expect(homeHero).toContain("srcSet=");
    expect(homeHero).not.toContain("RevealLines");
    expect(homeHero).not.toContain("<motion.div");
    expect(homeHero).not.toContain('from "next/image"');
  });

  it("keeps the homepage critical path free from framer-motion", () => {
    const criticalFiles = [
      "src/components/home/home-hero.tsx",
      "src/components/site-header.tsx",
      "src/components/home/faq-section.tsx",
      "src/components/animations.tsx",
      "src/components/floating-contact.tsx",
      "src/components/exit-intent.tsx",
      "src/components/loading-bar.tsx",
      "src/components/sunset-mode.tsx",
    ];

    for (const file of criticalFiles) {
      const source = read(file);
      expect(source).not.toContain("framer-motion");
      expect(source).not.toContain("AnimatePresence");
      expect(source).not.toContain("<motion.");
    }
  });

  it("keeps below-fold homepage sections split out of the initial client path", () => {
    const homeClient = read("src/components/home-client.tsx");

    expect(homeClient).toContain('import dynamic from "next/dynamic"');
    for (const section of [
      "marquee-band",
      "kpi-band",
      "rooms-showcase",
      "gastronomy-editorial",
      "experiences-section",
      "gallery-strip",
      "experiences-teaser",
      "testimonials-section",
      "booking-section",
      "faq-section",
      "final-cta",
    ]) {
      expect(homeClient).toContain(`import("@/components/home/${section}")`);
    }
  });

  it("keeps below-fold homepage videos from preloading on first paint", () => {
    const gastronomyEditorial = read("src/components/home/gastronomy-editorial.tsx");

    expect(gastronomyEditorial).toContain("function LazyEditorialVideo");
    expect(gastronomyEditorial).toContain("IntersectionObserver");
    expect(gastronomyEditorial).toContain('preload="none"');
    expect(gastronomyEditorial).not.toContain('preload="metadata"');
  });

  it("keeps the homepage gastronomy editorial copy inside a safe text column", () => {
    const gastronomyEditorial = read("src/components/home/gastronomy-editorial.tsx");
    const globals = read("src/app/globals.css");

    expect(gastronomyEditorial).toContain("gastronomy-editorial-section");
    expect(globals).toContain(".gastronomy-editorial-section > .container");
    expect(globals).toContain('grid-template-areas: "copy media"');
    expect(globals).not.toContain(".editorial.reverse {\n    direction: rtl;");
  });

  it("keeps the full gallery from blocking first load on image optimizer work", () => {
    const galleryPage = read("src/app/galeri/page.tsx");
    const globals = read("src/app/globals.css");

    expect(galleryPage).not.toContain('from "next/image"');
    expect(galleryPage).toContain("<img");
    expect(galleryPage).toContain('loading={i === 0 ? "eager" : "lazy"}');
    expect(galleryPage).toContain('decoding="async"');
    expect(globals).toContain(".gallery-grid-item img {\n    width: 100%;\n    height: 100%;\n    display: block;");
  });

  it("keeps homepage KPI values truthful in server-rendered HTML", () => {
    const kpiBand = read("src/components/home/kpi-band.tsx");

    expect(kpiBand).not.toContain("Counter");
    expect(kpiBand).toContain('"9,4/10"');
    expect(kpiBand).toContain('"9.4/10"');
    expect(kpiBand).toContain("<strong>500+</strong>");
    expect(kpiBand).toContain('"24 Saat"');
    expect(kpiBand).not.toContain('to={500}');
  });

  it("keeps production builds independent from Google Fonts network fetches", () => {
    const layout = read("src/app/layout.tsx");
    const globals = read("src/app/globals.css");

    expect(layout).not.toContain("next/font/google");
    expect(layout).not.toContain("Inter(");
    expect(layout).not.toContain("Playfair_Display(");
    expect(globals).toContain("--font-playfair:");
    expect(globals).toContain("--font-inter:");
  });

  it("keeps language switching on hydration-safe href navigation", () => {
    const switcher = read("src/components/language-switcher.tsx");

    expect(switcher).toContain("function getTurkishHref");
    expect(switcher).toContain("function getEnglishHref");
    expect(switcher).toContain("href={trHref}");
    expect(switcher).toContain("href={enHref}");
    expect(switcher).not.toContain("router.push");
    expect(switcher).not.toContain("window.location.assign");
  });

  it("keeps Lighthouse CI as a realistic hard release budget", () => {
    const lighthouseConfig = JSON.parse(read("lighthouserc.json")) as {
      ci?: {
        collect?: {
          numberOfRuns?: number;
        };
        assert?: {
          assertions?: Record<string, [string, { minScore?: number }]>;
        };
      };
    };
    const assertions = lighthouseConfig.ci?.assert?.assertions ?? {};

    expect(lighthouseConfig.ci?.collect?.numberOfRuns).toBeGreaterThanOrEqual(3);
    expect(assertions["categories:performance"]?.[0]).toBe("error");
    expect(assertions["categories:performance"]?.[1].minScore).toBeGreaterThanOrEqual(0.5);
    expect(assertions["categories:accessibility"]?.[1].minScore).toBeGreaterThanOrEqual(0.95);
    expect(assertions["categories:seo"]?.[1].minScore).toBeGreaterThanOrEqual(0.95);
  });

  it("keeps CI running the launch smoke gate before publish verification", () => {
    const ciWorkflow = read(".github/workflows/ci.yml");
    const playwrightConfig = read("playwright.config.ts");
    const launchSmokeIndex = ciWorkflow.indexOf("npm run launch:smoke");
    const publishVerifyIndex = ciWorkflow.indexOf("Publish verification tests");

    expect(ciWorkflow).toContain("Launch smoke gate");
    expect(ciWorkflow).toContain("actions/checkout@v6");
    expect(ciWorkflow).toContain("actions/setup-node@v6");
    expect(ciWorkflow).not.toContain("FORCE_JAVASCRIPT_ACTIONS_TO_NODE24");
    expect(launchSmokeIndex).toBeGreaterThan(-1);
    expect(publishVerifyIndex).toBeGreaterThan(-1);
    expect(launchSmokeIndex).toBeLessThan(publishVerifyIndex);
    expect(ciWorkflow).toMatch(/quality:[\s\S]*timeout-minutes: 60/);
    expect(ciWorkflow).toContain('PW_USE_SYSTEM_CHROME: "1"');
    expect(ciWorkflow).toContain("google-chrome --version");
    expect(ciWorkflow).not.toContain("npx playwright install");
    expect(playwrightConfig).toContain("PW_USE_SYSTEM_CHROME");
    expect(playwrightConfig).toContain('channel: "chrome"');
  });

  it("keeps the health endpoint safe for uptime monitors", () => {
    const healthRoute = read("src/app/api/health/route.ts");
    const productionReadiness = read("src/lib/production-readiness.ts");
    const commercialAudit = read("scripts/commercial-launch-audit.mjs");

    expect(healthRoute).toContain('status: "ok"');
    expect(healthRoute).toContain('service: "kozbeyli-konagi"');
    expect(healthRoute).toContain("getRuntimeReadiness");
    expect(productionReadiness).toContain("canonical_domain");
    expect(productionReadiness).toContain("production_abuse_controls");
    expect(productionReadiness).toContain("hms_booking_engine");
    expect(productionReadiness).toContain("OFFICIAL_HMS_BOOKING_ENGINE_URL");
    expect(productionReadiness).toContain("code_fallback");
    expect(productionReadiness).toContain("fallbackApplied");
    expect(productionReadiness).toContain("invalidCount");
    expect(productionReadiness).toContain("placeholderCount");
    expect(productionReadiness).toContain("partial");
    expect(commercialAudit).toContain("configuredEnvCount");
    expect(commercialAudit).toContain("invalidEnvCount");
    expect(commercialAudit).toContain("placeholderEnvCount");
    expect(commercialAudit).toContain("fallbackApplied");
    expect(read("scripts/production-cutover-plan.mjs")).toContain("envDiagnostics");
    expect(healthRoute).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(healthRoute).not.toContain("DATABASE_URI");
    expect(healthRoute).not.toContain("PAYLOAD_SECRET");
    expect(healthRoute).not.toContain("GARANTI_3D_STORE_KEY");
    expect(healthRoute).not.toContain("GA4_API_SECRET");
    expect(healthRoute).not.toContain("TURNSTILE_SECRET_KEY");
  });

  it("keeps unknown room slugs returning page-level 404s without static fallback errors", () => {
    const roomDetailRoute = read("src/app/odalar/[slug]/page.tsx");

    expect(roomDetailRoute).toContain("export const dynamicParams = true");
    expect(roomDetailRoute).toContain("notFound()");
    expect(roomDetailRoute).not.toContain("dynamicParams = false");
  });

  it("keeps sunset mode from degrading room-card text contrast", () => {
    const sunsetMode = read("src/components/sunset-mode.tsx");

    expect(sunsetMode).not.toContain("mix-blend-multiply");
    expect(sunsetMode).not.toContain("--soft: #1a1a1a");
    expect(sunsetMode).not.toContain("--white: #121212");
    expect(sunsetMode).not.toContain("background-color: #121212");
    expect(sunsetMode).not.toContain(".card, .section-alt, .feature-box");
    expect(sunsetMode).toContain("--soft: #efe7d9");
    expect(sunsetMode).toContain("--white: #fffaf2");
    expect(sunsetMode).toContain("--ivory: #fbf6eb");
    expect(sunsetMode).toContain("--gold: #8f611e");
    expect(sunsetMode).toContain("background-color: #fbf6eb");
    expect(sunsetMode).toContain('aria-hidden="true"');
  });

  it("keeps room browsing in a light product-inspection theme", () => {
    const roomsClient = read("src/components/rooms-client.tsx");
    const roomsPage = read("src/app/odalar/page.tsx");
    const enRoomsPage = read("src/app/en/odalar/page.tsx");
    const pageHero = read("src/components/page-hero.tsx");
    const globals = read("src/app/globals.css");
    const layout = read("src/app/layout.tsx");

    expect(roomsPage).toContain('await getDictionary("tr")');
    expect(roomsPage).toContain('initialLocale="tr"');
    expect(enRoomsPage).toContain('await getDictionary("en")');
    expect(enRoomsPage).toContain('initialLocale="en"');
    expect(roomsClient).toContain("initialDict");
    expect(roomsClient).toContain('<SiteHeader variant="solid" />');
    expect(roomsClient).toContain('tone="light"');
    expect(roomsClient).toContain("rooms-catalog-section");
    expect(roomsClient).toContain("room-card");
    expect(roomsClient).toContain('id="icerik-odalar"');
    expect(layout).toContain('<div id="icerik">{children}</div>');
    expect(pageHero).toContain('tone?: "dark" | "light"');
    expect(pageHero).toContain("page-hero-light");
    expect(globals).toContain(".page-hero-light");
    expect(globals).toContain("background-image: linear-gradient(180deg, #fbf7ed 0%, #f2ecdf 100%)");
    expect(globals).toContain(".rooms-catalog-section");
    expect(globals).toContain(".rooms-catalog-section .room-card .card-media");
    expect(globals).toContain("aspect-ratio: 4 / 3");
    expect(globals).toContain("#f7f1e7");
    expect(globals).toContain("rgba(255, 252, 246, 0.92)");
    expect(layout).toContain('{ media: "(prefers-color-scheme: dark)", color: "#fbf6eb" }');
  });

  it("keeps cancellation and route-time claims legally conservative", () => {
    const trGuide = read("src/app/misafir-rehberi/page.tsx");
    const enGuide = read("src/app/en/misafir-rehberi/page.tsx");
    const llms = read("src/app/llms.txt/route.ts");
    const contactPage = read("src/app/iletisim/page.tsx");
    const enContactPage = read("src/app/en/iletisim/page.tsx");
    const contactClient = read("src/components/contact-client.tsx");
    const salesAgreement = read("src/app/mesafeli-satis-sozlesmesi/page.tsx");
    const dictionary = read("src/lib/dictionary.ts");

    for (const source of [trGuide, enGuide, llms, contactPage, enContactPage, contactClient, salesAgreement, dictionary]) {
      expect(source).not.toMatch(/48\s*(saat|hours)/i);
      expect(source).not.toMatch(/72\s*(saat|hours)/i);
      expect(source).not.toMatch(/ücretsiz iptal|free cancellation/i);
      expect(source).not.toMatch(/55\s*(dk|dakika|min|minutes)/i);
      expect(source).not.toMatch(/10[–-]15\s*(dk|dakika|min|minutes)/i);
    }

    expect(trGuide).toContain("rezervasyon kanalı, seçilen teklif, ödeme tipi");
    expect(enGuide).toContain("booking channel, selected offer, payment type");
    expect(dictionary).not.toContain("Esnek İptal");
    expect(dictionary).not.toContain("Flexible Cancellation");
    expect(dictionary).toContain("Koşullar Yazılı Teyit");
    expect(dictionary).toContain("Terms Confirmed in Writing");
    expect(contactClient).toContain("canlı yol tarifini");
    expect(llms).toContain("canlı yol tarifi önerilir");
  });

  it("keeps public LLM and agent context evidence-gated", () => {
    const llms = read("src/app/llms.txt/route.ts");
    const llmContextGenerator = read("src/lib/ai/llm-context-generator.ts");
    const specialistHospitality = read("src/lib/ai/specialist-hospitality.ts");
    const llmContextRoute = read("src/app/api/llm-context/route.ts");
    const combined = [llms, llmContextGenerator, specialistHospitality, llmContextRoute].join("\n");

    for (const forbidden of [
      "Web sitesi üzerinden kredi kartıyla rezervasyon yapılabilir",
      "book directly through the website's reservation engine",
      "booking_engine_url",
      "https://kozbeylikonagi.com/rezervasyon",
      "Registered Cultural Heritage Site Class-1",
      "Ancient Cedar",
      "9.6/10",
      "9.7/10",
      "tripadvisor_score",
      "Acidity 0.2-0.4",
      "Asidite 0.2 - 0.4",
      "72 saatte",
      "Sismik dirençli",
      "Patronaj",
      "Antigravity-V1",
    ]) {
      expect(combined, `public LLM context must not contain ${forbidden}`).not.toContain(forbidden);
    }

    expect(llms).toContain("rezervasyon ekranı, WhatsApp, telefon veya e-posta");
    expect(llms).toContain("canlı online rezervasyon motoru yalnızca production HMS bağlantısı");
    expect(llms).toContain("A live online booking engine is used only when the production HMS URL is configured.");
    expect(llmContextGenerator).toContain("availability_confirmation_required");
    expect(llmContextGenerator).toContain("NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL");
    expect(llmContextGenerator).toContain("evidence_boundaries");
    expect(llmContextGenerator).toContain("Do not claim every room has sea view.");
    expect(specialistHospitality).toContain("avoid precise origin, age, acidity or process claims unless sourced");
    expect(specialistHospitality).toContain("never imply completed online booking or payment");
    expect(llmContextRoute).toContain("'X-Content-Policy': 'evidence-gated'");
    expect(llmContextRoute).not.toContain("X-Agentic-Architecture");
  });

  it("publishes a dedicated location route with schema, hreflang and inventory coverage", () => {
    const trLocation = read("src/app/lokasyon/page.tsx");
    const enLocation = read("src/app/en/lokasyon/page.tsx");
    const locationContent = read("src/components/location-page-content.tsx");
    const sitemap = read("src/app/sitemap.ts");
    const footer = read("src/components/site-footer.tsx");
    const languageSwitcher = read("src/components/language-switcher.tsx");
    const publishReadiness = read("scripts/publish-readiness.mjs");
    const publishRoutes = read("tests/e2e/publish-routes.spec.ts");

    expect(trLocation).toContain('canonical: "/lokasyon"');
    expect(enLocation).toContain('canonical: "/en/lokasyon"');
    expect(locationContent).toContain('"@type": "LodgingBusiness"');
    expect(locationContent).toContain('"@type": "GeoCoordinates"');
    expect(locationContent).toContain('"@type": "BreadcrumbList"');
    expect(locationContent).toContain("KOZBEYLI_COORDS");
    expect(locationContent).toContain("MAPS_URL");
    expect(sitemap).toContain("'/lokasyon'");
    expect(footer).toContain('localizedHref("/lokasyon", englishPath)');
    expect(languageSwitcher).toContain('"/lokasyon"');
    expect(publishReadiness).toContain('"/lokasyon"');
    expect(publishReadiness).toContain('"/en/lokasyon"');
    expect(publishRoutes).toContain('"/lokasyon"');
    expect(publishRoutes).toContain('"/en/lokasyon"');
  });

  it("keeps server env helpers out of client components", () => {
    const clientFilesImportingServerEnv = listSourceFiles("src")
      .filter((file) => read(file).startsWith('"use client";'))
      .filter((file) => /from\s+["']@\/lib\/env["']/.test(read(file)));

    expect(clientFilesImportingServerEnv).toEqual([]);
  });

  it("keeps direct process.env reads out of client components", () => {
    const clientFilesReadingProcessEnv = listSourceFiles("src")
      .filter((file) => read(file).startsWith('"use client";'))
      .filter((file) => read(file).includes("process.env"));

    expect(clientFilesReadingProcessEnv).toEqual([]);
  });

  it("keeps the public env helper limited to public keys", () => {
    const publicEnvSource = read("src/lib/public-env.ts");
    const referencedEnvKeys = Array.from(publicEnvSource.matchAll(/process\.env\.([A-Z0-9_]+)/g))
      .map((match) => match[1]);
    const forbiddenServerEnvKeys = [
      "DATABASE_URI",
      "PAYLOAD_SECRET",
      "HOTELRUNNER_WEBHOOK_SECRET",
      "IYZICO_WEBHOOK_SECRET",
      "GA4_API_SECRET",
      "TURNSTILE_SECRET_KEY",
      "B2B_PARTNER_PUBLIC_KEY",
      "HMS_WEBHOOK_ES256_PUBLIC_KEY",
    ];

    expect(referencedEnvKeys.length).toBeGreaterThan(0);
    expect(referencedEnvKeys.every((key) => key.startsWith("NEXT_PUBLIC_"))).toBe(true);

    for (const key of forbiddenServerEnvKeys) {
      expect(publicEnvSource).not.toContain(key);
    }
  });
});
