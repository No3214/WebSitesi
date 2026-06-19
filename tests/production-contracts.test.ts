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

  it("keeps cookie banner policy copy readable in Turkish and English", () => {
    const cookieConsent = read("src/components/cookie-consent.tsx");
    const footer = read("src/components/site-footer.tsx");

    expect(cookieConsent).toContain('policy: "Çerez Politikamızı"');
    expect(cookieConsent).toContain('suffix: " inceleyebilirsiniz."');
    expect(cookieConsent).toContain('policy: "Cookie Policy"');
    expect(cookieConsent).toContain('suffix: "."');
    expect(cookieConsent).not.toContain("Politikamızıinceleyebilirsiniz");
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
    expect(readinessScript).toContain('"test:monkey"');
    expect(readinessScript).toContain('"test:chaos"');
    expect(readinessScript).toContain('"test:stress"');
    expect(readinessScript).toContain('"evidence:scan"');
    expect(readinessScript).toContain('"evidence:scan:json"');
    expect(readinessScript).toContain('"media:hero"');
    expect(readinessScript).toContain('"media:hero:json"');
    expect(readinessScript).toContain('"media:hero:strict"');
    expect(readinessScript).toContain('"launch:audit"');
    expect(readinessScript).toContain('"launch:audit:json"');
    expect(readinessScript).toContain('"launch:audit:strict"');
    expect(readinessScript).toContain('"domain:verify"');
    expect(readinessScript).toContain('"domain:verify:json"');
    expect(readinessScript).toContain('"domain:verify:strict"');
    expect(readinessScript).toContain('"vercel:ops"');
    expect(readinessScript).toContain('"vercel:ops:json"');
    expect(readinessScript).toContain('"vercel:ops:strict"');
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
    expect(packageJson.scripts?.["vercel:ops"]).toBe("node scripts/vercel-ops-readiness.mjs");
    expect(packageJson.scripts?.["vercel:ops:json"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["vercel:ops:strict"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.prebuild).toBe("node scripts/clean-next-build.mjs");
    expect(packageJson.scripts?.["release:verify"]).toBe("node scripts/release-verify.mjs");
    expect(readinessScript).toContain('"scripts/clean-next-build.mjs"');
    expect(readinessScript).toContain('"src/app/api/health/route.ts"');
    expect(readinessScript).toContain('"src/lib/production-readiness.ts"');
    expect(readinessScript).toContain('"tests/agentic-helper-safety.test.ts"');
    expect(readinessScript).toContain('"tests/e2e/health.spec.ts"');
    expect(readinessScript).toContain('"tests/production-readiness.test.ts"');
    expect(readinessScript).toContain('"docs/evidence/README.md"');
    expect(readinessScript).toContain('"docs/vercel-operations.md"');
    expect(readinessScript).toContain('"scripts/evidence-redaction-scan.mjs"');
    expect(readinessScript).toContain('"scripts/hero-media-audit.mjs"');
    expect(readinessScript).toContain('"scripts/vercel-ops-readiness.mjs"');
    expect(readinessScript).toContain("evaluateCommercialLaunch");
  });

  it("keeps release verification orchestrating the full local release gate", () => {
    const releaseScript = read("scripts/release-verify.mjs");
    const ciWorkflow = read(".github/workflows/ci.yml");

    for (const gate of [
      "security:audit",
      "evidence:scan",
      "media:hero:json",
      "publish:verify",
      "launch:smoke",
      "test:stress",
      "launch:audit:json",
    ]) {
      expect(releaseScript).toContain(`script: "${gate}"`);
    }

    expect(releaseScript).toContain("--list");
    expect(releaseScript).toContain("Commercial evidence redaction scan");
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

  it("keeps the HMS booking engine as a new-tab handoff instead of a cramped iframe", () => {
    const bookingEmbed = read("src/components/hms-booking-embed.tsx");
    const bookingUrlHelper = read("src/lib/booking-engine-url.ts");
    const siteHeader = read("src/components/site-header.tsx");
    const envExample = read(".env.example");

    expect(bookingEmbed).toContain("getConfiguredBookingEngineHref");
    expect(bookingEmbed).toContain("bookingHref");
    expect(bookingEmbed).toContain('target="_blank"');
    expect(bookingEmbed).toContain('rel="noopener noreferrer"');
    expect(bookingEmbed).toContain("Rezervasyon");
    expect(bookingEmbed).not.toContain("Rezervasyon Ekranı Ayrı Sekmede");
    expect(bookingEmbed).not.toContain("Rezervasyonu Ayrı Sekmede Aç");
    expect(bookingEmbed).toContain("Booking");
    expect(bookingEmbed).not.toContain("<iframe");
    expect(siteHeader).toContain("getConfiguredBookingEngineHref");
    expect(siteHeader).toContain('target="_blank"');
    expect(siteHeader).toContain('data-event="booking_engine_open"');
    expect(bookingUrlHelper).toContain("OFFICIAL_HMS_BOOKING_ENGINE_URL");
    expect(bookingUrlHelper).toContain("https://kozbeyli-konagi.hmshotel.net/");
    expect(bookingUrlHelper).toContain('url.protocol !== "https:"');
    expect(bookingUrlHelper).toContain('utm_source", "website"');
    expect(bookingUrlHelper).toContain('utm_medium", "booking_engine"');
    expect(envExample).toContain("NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL=https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine");
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
    expect(domainScript).toContain('EXPECTED_HERO_VIDEO_SRC = "/videos/hero.mp4"');
    expect(domainScript).toContain("hasOpeningHeroVideo");
    expect(domainScript).toContain("homepage does not expose opening hero video");
    expect(domainScript).toContain("firstHopInsecure");
    expect(domainScript).toContain("redirects first hop to insecure HTTP");
    expect(domainScript).toContain("insecure first-hop redirect");
    expect(domainScript).toContain("process.exitCode");
    expect(domainScript).not.toContain("process.exit(strict");
    expect(domainScript).toContain("kozbeylikonagi.com");
    expect(domainScript).toContain("kozbeyli-konagi.vercel.app");
    expect(releaseScript).not.toContain("domain:verify:strict");
  });

  it("keeps Vercel operational prerequisites visible without hiding the global CLI requirement", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const vercelOps = read("scripts/vercel-ops-readiness.mjs");
    const runbook = read("docs/vercel-operations.md");

    expect(packageJson.scripts?.["vercel:ops"]).toBe("node scripts/vercel-ops-readiness.mjs");
    expect(packageJson.scripts?.["launch:cutover"]).toBe("node scripts/production-cutover-plan.mjs");
    expect(packageJson.scripts?.["launch:cutover:json"]).toBe(
      "node scripts/production-cutover-plan.mjs --json",
    );
    expect(packageJson.scripts?.["launch:cutover:strict"]).toBe(
      "node scripts/production-cutover-plan.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:ops:strict"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --strict",
    );
    expect(vercelOps).toContain("Kozbeyli Konagi Vercel operations readiness");
    expect(vercelOps).toContain("PASS_WITH_WARNINGS");
    expect(vercelOps).toContain("npm i -g vercel");
    expect(vercelOps).toContain("vercel env pull, vercel deploy and vercel logs");
    expect(vercelOps).toContain("canonical-domain.md");
    expect(vercelOps).toContain("kozbeyli-konagi");
    expect(runbook).toContain("npm run vercel:ops");
    expect(runbook).toContain("npm run launch:cutover");
    expect(runbook).toContain("KPI and review loop");
    expect(runbook).toContain("npm run vercel:ops:strict");
    expect(runbook).toContain("npm i -g vercel");
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
    expect(cutoverPlan).toContain("remove the bad override to use the official code fallback");
    expect(cutoverPlan).toContain("Verify the public reservation CTA opens the approved HTTPS HMS engine");
    expect(cutoverPlan).toContain("npm run domain:verify:strict");
    expect(cutoverPlan).toContain("npm run launch:audit:strict");
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
    const productionReadiness = read("src/lib/production-readiness.ts");

    expect(healthRoute).toContain('status: "ok"');
    expect(healthRoute).toContain('service: "kozbeyli-konagi"');
    expect(healthRoute).toContain("getRuntimeReadiness");
    expect(productionReadiness).toContain("canonical_domain");
    expect(productionReadiness).toContain("production_abuse_controls");
    expect(productionReadiness).toContain("hms_booking_engine");
    expect(productionReadiness).toContain("OFFICIAL_HMS_BOOKING_ENGINE_URL");
    expect(productionReadiness).toContain("code_fallback");
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
