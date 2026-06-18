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

  it("keeps Meta Pixel on the documented env key", () => {
    const trackedFiles = [
      "src/components/tracking-scripts.tsx",
      "src/components/consent-gated-scripts.tsx",
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

  it("keeps publish readiness aware of payment and stress gates", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const readinessScript = read("scripts/publish-readiness.mjs");

    expect(readinessScript).toContain('"IYZICO_WEBHOOK_SECRET"');
    expect(readinessScript).toContain('"GARANTI_3D_STORE_KEY"');
    expect(readinessScript).toContain('"test:monkey"');
    expect(readinessScript).toContain('"test:chaos"');
    expect(readinessScript).toContain('"test:stress"');
    expect(readinessScript).toContain('"launch:audit"');
    expect(readinessScript).toContain('"launch:audit:json"');
    expect(readinessScript).toContain('"launch:audit:strict"');
    expect(readinessScript).toContain('"domain:verify"');
    expect(readinessScript).toContain('"domain:verify:json"');
    expect(readinessScript).toContain('"domain:verify:strict"');
    expect(readinessScript).toContain('"launch:smoke"');
    expect(readinessScript).toContain('"launch:smoke:live"');
    expect(readinessScript).toContain('"release:verify"');
    expect(packageJson.scripts?.["launch:smoke"]).toBe("node scripts/launch-smoke.mjs");
    expect(packageJson.scripts?.["launch:smoke:live"]).toBe(
      "cross-env PW_BASE_URL=https://kozbeyli-konagi.vercel.app node scripts/launch-smoke.mjs",
    );
    expect(packageJson.scripts?.["domain:verify"]).toBe("node scripts/domain-readiness.mjs");
    expect(packageJson.scripts?.["domain:verify:strict"]).toBe(
      "node scripts/domain-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.prebuild).toBe("node scripts/clean-next-build.mjs");
    expect(packageJson.scripts?.["release:verify"]).toBe("node scripts/release-verify.mjs");
    expect(readinessScript).toContain('"scripts/clean-next-build.mjs"');
    expect(readinessScript).toContain('"src/app/api/health/route.ts"');
    expect(readinessScript).toContain('"tests/e2e/health.spec.ts"');
    expect(readinessScript).toContain('"docs/evidence/README.md"');
    expect(readinessScript).toContain("evaluateCommercialLaunch");
  });

  it("keeps release verification orchestrating the full local release gate", () => {
    const releaseScript = read("scripts/release-verify.mjs");
    const ciWorkflow = read(".github/workflows/ci.yml");

    for (const gate of [
      "security:audit",
      "publish:verify",
      "launch:smoke",
      "test:stress",
      "launch:audit:json",
    ]) {
      expect(releaseScript).toContain(`script: "${gate}"`);
    }

    expect(releaseScript).toContain("--list");
    expect(releaseScript).toContain("process.env.ComSpec");
    expect(releaseScript).not.toContain("launch:audit:strict");
    expect(ciWorkflow).toContain("Release gate manifest");
    expect(ciWorkflow).toContain("node scripts/release-verify.mjs --list");
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
    expect(auditScript).toContain("^https://");

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
    }
  });

  it("keeps the HMS booking engine as a new-tab handoff instead of a cramped iframe", () => {
    const bookingEmbed = read("src/components/hms-booking-embed.tsx");
    const bookingUrlHelper = read("src/lib/booking-engine-url.ts");

    expect(bookingEmbed).toContain("getBookingEngineHref");
    expect(bookingEmbed).toContain("bookingHref");
    expect(bookingEmbed).toContain('target="_blank"');
    expect(bookingEmbed).toContain('rel="noopener noreferrer"');
    expect(bookingEmbed).toContain("Rezervasyonu Ayrı Sekmede Aç");
    expect(bookingEmbed).toContain("Open Booking in New Tab");
    expect(bookingEmbed).not.toContain("<iframe");
    expect(bookingUrlHelper).toContain('url.protocol !== "https:"');
    expect(bookingUrlHelper).toContain('utm_source", "website"');
    expect(bookingUrlHelper).toContain('utm_medium", "booking_engine"');
  });

  it("keeps the CSP frame surface narrow after moving booking to new-tab handoff", () => {
    const nextConfig = read("next.config.ts");

    expect(nextConfig).toContain('"object-src \'none\'"');
    expect(nextConfig).toContain('"base-uri \'self\'"');
    expect(nextConfig).toContain('"form-action \'self\'"');
    expect(nextConfig).toContain(
      '"frame-src \'self\' https://www.openstreetmap.org https://www.googletagmanager.com https://challenges.cloudflare.com"',
    );
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
    expect(domainScript).toContain("kozbeylikonagi.com");
    expect(domainScript).toContain("kozbeyli-konagi.vercel.app");
    expect(releaseScript).not.toContain("domain:verify:strict");
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
    const combined = [leadGen, seoAudit, seoPilot].join("\n");

    for (const forbidden of [
      "mockLeads",
      "SYSTEM_PILOT",
      "AI-Generated outreach",
      "Simulated Logic",
      "FOUND (Optimized",
      "score: 95",
      "payload.create",
      "agent_discovery",
    ]) {
      expect(combined, `production helper scripts must not contain ${forbidden}`).not.toContain(forbidden);
    }

    expect(leadGen).toContain("writesPerformed: 0");
    expect(leadGen).toContain("This script never writes to Payload/CRM");
    expect(seoAudit).toContain("failures");
    expect(seoAudit).toContain("metadataBase");
    expect(seoPilot).toContain("Evidence-based content gap scan only");
    expect(seoPilot).toContain("nextEditorialBacklog");
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
  });

  it("keeps homepage hero video available during the opening viewport", () => {
    const homeHero = read("src/components/home/home-hero.tsx");

    // LCP guvenligi: poster priority eleman kalir; video ise acilista cok erken
    // devreye girer. Onceki load + idle bekleme isletme sahibinin tarayicisinda
    // videoyu tamamen yok gibi gosteriyordu.
    expect(homeHero).toContain('preload="auto"');
    // Onayli hero asseti kilitle: 15.78s montaj hero.mp4 (eski 2.75s hero-property
    // klibi superseded). Bkz docs/media-placement-audit.md.
    expect(homeHero).toContain('HERO_VIDEO_SRC = "/videos/hero.mp4"');
    expect(homeHero).not.toContain("hero-property.mp4");
    expect(homeHero).toContain("HERO_VIDEO_BOOT_DELAY_MS = 150");
    expect(homeHero).not.toContain("requestIdleCallback");
    expect(homeHero).not.toContain("prefers-reduced-motion: reduce");
    expect(homeHero).toContain("setShouldRender(true)");
    expect(homeHero).toContain('fetchPriority="high"');
    expect(homeHero).toContain("hero-video-poster-1280.webp");
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

  it("keeps first-visit hero rendering from waiting on late webfont swaps", () => {
    const layout = read("src/app/layout.tsx");

    expect(layout).toContain('display: "optional"');
    expect(layout).not.toContain('display: "swap"');
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

    expect(healthRoute).toContain('status: "ok"');
    expect(healthRoute).toContain('service: "kozbeyli-konagi"');
    expect(healthRoute).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(healthRoute).not.toContain("DATABASE_URI");
    expect(healthRoute).not.toContain("PAYLOAD_SECRET");
    expect(healthRoute).not.toContain("GARANTI_3D_STORE_KEY");
    expect(healthRoute).not.toContain("GA4_API_SECRET");
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
    expect(sunsetMode).toContain(".card .card-body h3");
    expect(sunsetMode).toContain(".card .card-body p");
    expect(sunsetMode).toContain(".card .card-body .meta");
    expect(sunsetMode).toContain("#f4efe6");
    expect(sunsetMode).toContain("#d7d1c7");
    expect(sunsetMode).toContain("#e0bf7a");
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
