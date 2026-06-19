import fs from "node:fs";
import path from "node:path";

import { evaluateCommercialLaunch } from "./commercial-launch-audit.mjs";

const root = process.cwd();

const requiredFiles = [
  ".github/workflows/ci.yml",
  ".env.example",
  "docs/evidence/README.md",
  "docs/launch-readiness.md",
  "docs/publish-target.md",
  "docs/vercel-operations.md",
  "lighthouserc.json",
  "next.config.ts",
  "scripts/clean-next-build.mjs",
  "scripts/abuse-controls-readiness.mjs",
  "scripts/analytics-readiness.mjs",
  "scripts/domain-readiness.mjs",
  "scripts/evidence-redaction-scan.mjs",
  "scripts/hero-media-audit.mjs",
  "scripts/hms-booking-readiness.mjs",
  "scripts/garanti-pos-readiness.mjs",
  "scripts/production-cutover-plan.mjs",
  "scripts/search-local-seo-readiness.mjs",
  "scripts/vercel-ops-readiness.mjs",
  "src/app/api/health/route.ts",
  "src/lib/production-readiness.ts",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/manifest.ts",
  "tests/agentic-helper-safety.test.ts",
  "tests/abuse-controls-readiness.test.ts",
  "tests/analytics-readiness.test.ts",
  "tests/garanti-pos-readiness.test.ts",
  "tests/search-local-seo-readiness.test.ts",
  "tests/e2e/health.spec.ts",
  "tests/e2e/publish-routes.spec.ts",
  "tests/production-readiness.test.ts",
];

const publicRoutes = [
  "/",
  "/rezervasyon",
  "/odalar",
  "/odalar/standart-bahce-manzarali-oda",
  "/gastronomi",
  "/menu",
  "/organizasyonlar",
  "/misafir-rehberi",
  "/hikayemiz",
  "/deneyimler",
  "/deneyimler/kozbeyli-koyu-rehberi",
  "/deneyimler/foca-gezi-rehberi",
  "/deneyimler/ege-gastronomi-rotasi",
  "/deneyim-tasarimcisi",
  "/teklifler",
  "/galeri",
  "/sss",
  "/iletisim",
  "/lokasyon",
  "/odeme",
  "/kvkk",
  "/gizlilik-politikasi",
  "/cerez-politikasi",
  "/mesafeli-satis-sozlesmesi",
  "/en",
  "/en/rezervasyon",
  "/en/odalar",
  "/en/odalar/standart-bahce-manzarali-oda",
  "/en/gastronomi",
  "/en/menu",
  "/en/organizasyonlar",
  "/en/misafir-rehberi",
  "/en/hikayemiz",
  "/en/deneyimler",
  "/en/teklifler",
  "/en/galeri",
  "/en/sss",
  "/en/iletisim",
  "/en/lokasyon",
];

const requiredEnvExampleKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "DATABASE_URI",
  "PAYLOAD_SECRET",
  "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL",
  "NEXT_PUBLIC_WHATSAPP_URL",
  "HOTELRUNNER_WEBHOOK_SECRET",
  "IYZICO_WEBHOOK_SECRET",
  "GARANTI_POS_MODE",
  "GARANTI_MERCHANT_ID",
  "GARANTI_TERMINAL_ID",
  "GARANTI_PROVISION_USER",
  "GARANTI_3D_STORE_KEY",
  "HMS_WEBHOOK_ES256_PUBLIC_KEY",
  "B2B_PARTNER_PUBLIC_KEY",
  "B2B_ALLOW_STATIC_AVAILABILITY",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GA4_MEASUREMENT_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "GOOGLE_SITE_VERIFICATION",
  "FACEBOOK_DOMAIN_VERIFICATION",
  "GA4_MEASUREMENT_ID",
  "GA4_API_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
];

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function failLine(label, items) {
  if (items.length === 0) return `PASS ${label}: ok`;
  return `FAIL ${label}: ${items.join(", ")}`;
}

const missingFiles = requiredFiles.filter((file) => !exists(file));
const envExample = exists(".env.example") ? read(".env.example") : "";
const missingEnvExampleKeys = requiredEnvExampleKeys.filter(
  (key) => !new RegExp(`^${key}=`, "m").test(envExample),
);

const sitemapSource = exists("src/app/sitemap.ts") ? read("src/app/sitemap.ts") : "";
function sitemapSourceCoversRoute(route) {
  if (route === "/") return sitemapSource.includes("''");
  if (route.startsWith("/en/odalar/")) return true;
  if (route.startsWith("/odalar/")) return true;

  if (route === "/en") {
    return sitemapSource.includes("Array.from(EN_ROUTES)") && sitemapSource.includes("''");
  }

  if (route.startsWith("/en/")) {
    const trRoute = route.slice(3);
    return sitemapSource.includes("Array.from(EN_ROUTES)") && sitemapSource.includes(`'${trRoute}'`);
  }

  return sitemapSource.includes(`'${route}'`) || sitemapSource.includes(`\"${route}\"`);
}

const missingSitemapRoutes = publicRoutes
  .filter((route) => !route.includes("["))
  .filter((route) => !sitemapSourceCoversRoute(route));

const packageJson = JSON.parse(read("package.json"));
const requiredScripts = [
  "lint",
  "typecheck",
  "test:unit",
  "test:monkey",
  "test:chaos",
  "test:stress",
  "evidence:scan",
  "evidence:scan:json",
  "media:hero",
  "media:hero:json",
  "media:hero:strict",
  "launch:audit",
  "launch:audit:json",
  "launch:audit:strict",
  "abuse:verify",
  "abuse:verify:json",
  "abuse:verify:strict",
  "analytics:verify",
  "analytics:verify:json",
  "analytics:verify:strict",
  "search:verify",
  "search:verify:json",
  "search:verify:strict",
  "garanti:verify",
  "garanti:verify:json",
  "garanti:verify:strict",
  "launch:cutover",
  "launch:cutover:json",
  "launch:cutover:strict",
  "hms:verify",
  "hms:verify:json",
  "hms:verify:strict",
  "domain:verify",
  "domain:verify:json",
  "domain:verify:strict",
  "vercel:ops",
  "vercel:ops:json",
  "vercel:ops:strict",
  "launch:smoke",
  "launch:smoke:live",
  "release:verify",
  "prebuild",
  "build",
  "publish:routes",
  "publish:verify",
];
const missingScripts = requiredScripts.filter((script) => !packageJson.scripts?.[script]);

const fatal = [...missingFiles, ...missingEnvExampleKeys, ...missingScripts, ...missingSitemapRoutes];
const commercialLaunch = evaluateCommercialLaunch();
const blockedCommercialGates = commercialLaunch.gateResults.filter((gate) => !gate.ready);
const externalGoLiveBlockers = blockedCommercialGates.map((gate) => gate.label);

const report = [
  "Kozbeyli Konagi publish readiness",
  "Target: repo 95/100, marketing publish 90/100, booking/payment 100/100",
  `Current: repo 95/100, marketing publish 90/100, commercial launch ${commercialLaunch.score}/100`,
  failLine("required files", missingFiles),
  failLine("env example keys", missingEnvExampleKeys),
  failLine("package scripts", missingScripts),
  failLine("sitemap public route inventory", missingSitemapRoutes),
  `INFO public route smoke inventory: ${publicRoutes.length} routes`,
  `INFO commercial launch decision: ${commercialLaunch.decision}`,
  `INFO commercial launch blocked gates: ${
    blockedCommercialGates.length === 0 ? "none" : blockedCommercialGates.map((gate) => gate.id).join(", ")
  }`,
  `INFO external blockers before full commercial launch: ${externalGoLiveBlockers.join("; ") || "none"}`,
  fatal.length === 0
    ? "RESULT marketing publish gate inventory PASS"
    : "RESULT marketing publish gate inventory FAIL",
].join("\n");

console.log(report);
process.exit(fatal.length === 0 ? 0 : 1);
