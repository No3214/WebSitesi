import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { evaluateCommercialLaunch, loadEnvSnapshot } from "./commercial-launch-audit.mjs";

const root = process.cwd();

const REQUIRED_ENV = ["GOOGLE_SITE_VERIFICATION"];

const CONTRACT_FILES = {
  metadata: "src/lib/metadata.ts",
  env: "src/lib/env.ts",
  envExample: ".env.example",
  sitemap: "src/app/sitemap.ts",
  robots: "src/app/robots.ts",
  schema: "src/lib/schema.ts",
  locationContent: "src/components/location-page-content.tsx",
  evidenceReadme: "docs/evidence/README.md",
};

const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;

function parseProcessEnv(source = process.env) {
  const env = {};

  for (const [key, value] of Object.entries(source)) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) continue;
    if (typeof value !== "string") continue;
    env[key] = value;
  }

  return env;
}

function read(baseDir, relPath) {
  const fullPath = path.join(baseDir, relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function hasMeaningfulValue(value) {
  return Boolean(value && String(value).trim() && !placeholderPattern.test(String(value)));
}

function envDiagnostics(env) {
  const configured = REQUIRED_ENV.filter((key) => hasMeaningfulValue(env[key]));
  const missing = REQUIRED_ENV.filter((key) => !String(env[key] || "").trim());
  const placeholders = REQUIRED_ENV.filter((key) => String(env[key] || "").trim() && !hasMeaningfulValue(env[key]));
  const invalid = [];

  const token = String(env.GOOGLE_SITE_VERIFICATION || "").trim();
  if (hasMeaningfulValue(token)) {
    const looksLikeRawToken = /^[A-Za-z0-9_-]{8,128}$/.test(token);
    const looksLikeMetaTagOrUrl = /<|>|google-site-verification|https?:\/\//i.test(token);
    if (!looksLikeRawToken || looksLikeMetaTagOrUrl) {
      invalid.push("GOOGLE_SITE_VERIFICATION must be the raw Search Console token, not a full meta tag or URL");
    }
  }

  return {
    required: REQUIRED_ENV,
    configuredCount: configured.length,
    missing,
    placeholders,
    invalid,
    ready: missing.length === 0 && placeholders.length === 0 && invalid.length === 0,
  };
}

function evidenceDiagnostics(commercialLaunch) {
  const gate = commercialLaunch.gateResults.find((item) => item.id === "search_local_seo");
  return {
    ready: Boolean(gate?.ready && gate.missingEvidence.length === 0),
    missingEvidence: gate?.missingEvidence ?? [{ path: "docs/evidence/search-local-seo.md", ready: false, reason: "missing gate" }],
  };
}

function fileCheck(id, label, status, detail = "") {
  return { id, label, status, detail };
}

function sourceContracts(baseDir) {
  const metadata = read(baseDir, CONTRACT_FILES.metadata);
  const env = read(baseDir, CONTRACT_FILES.env);
  const envExample = read(baseDir, CONTRACT_FILES.envExample);
  const sitemap = read(baseDir, CONTRACT_FILES.sitemap);
  const robots = read(baseDir, CONTRACT_FILES.robots);
  const schema = read(baseDir, CONTRACT_FILES.schema);
  const locationContent = read(baseDir, CONTRACT_FILES.locationContent);
  const evidenceReadme = read(baseDir, CONTRACT_FILES.evidenceReadme);
  const structuredDataSource = [schema, locationContent].join("\n");

  const checks = [
    fileCheck(
      "metadata_google_verification",
      "Default metadata emits the raw Google Search Console verification token only when configured",
      metadata.includes("verification") &&
        metadata.includes("env.GOOGLE_SITE_VERIFICATION") &&
        metadata.includes("{ google: env.GOOGLE_SITE_VERIFICATION }")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.metadata,
    ),
    fileCheck(
      "server_env_documents_google_token",
      "Server env schema and example file document GOOGLE_SITE_VERIFICATION",
      env.includes("GOOGLE_SITE_VERIFICATION") &&
        env.includes("raw.GOOGLE_SITE_VERIFICATION") &&
        /^GOOGLE_SITE_VERIFICATION=/m.test(envExample)
        ? "PASS"
        : "FAIL",
      "src/lib/env.ts + .env.example",
    ),
    fileCheck(
      "sitemap_hreflang_and_local_routes",
      "Sitemap covers canonical, hreflang, location and Foça guide URLs",
      sitemap.includes("siteUrl") &&
        sitemap.includes("alternates") &&
        sitemap.includes("EN_ROUTE_BY_TR_ROUTE") &&
        sitemap.includes("'/lokasyon': '/en/location'") &&
        sitemap.includes("'/lokasyon'") &&
        sitemap.includes("'/deneyimler/foca-gezi-rehberi'") &&
        sitemap.includes("rooms.flatMap")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.sitemap,
    ),
    fileCheck(
      "robots_points_to_sitemap",
      "Robots allows public crawling while pointing crawlers at the sitemap",
      robots.includes("allow: '/'") &&
        robots.includes("disallow: ['/admin', '/api']") &&
        robots.includes("sitemap: `${siteUrl}/sitemap.xml`")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.robots,
    ),
    fileCheck(
      "local_business_structured_data",
      "Hotel/local structured data includes NAP, postal address, coordinates and map context",
      structuredDataSource.includes('"@type": ["Hotel", "LodgingBusiness", "Restaurant"]') &&
        structuredDataSource.includes('"@type": "PostalAddress"') &&
        structuredDataSource.includes('"@type": "GeoCoordinates"') &&
        structuredDataSource.includes("telephone") &&
        structuredDataSource.includes("email") &&
        structuredDataSource.includes("KOZBEYLI_COORDS") &&
        structuredDataSource.includes("MAPS_URL")
        ? "PASS"
        : "FAIL",
      "src/lib/schema.ts + src/components/location-page-content.tsx",
    ),
    fileCheck(
      "structured_data_truthfulness",
      "Local SEO schema avoids unverifiable review, star rating and award claims",
      !/\baggregateRating\s*:|\breview\s*:|\bstarRating\s*:|\baward\s*:/.test(schema)
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.schema,
    ),
    fileCheck(
      "evidence_inventory",
      "Evidence inventory tells operators to prove Search Console, GBP and Hotel Center outside the repo",
      evidenceReadme.includes("search-local-seo.md") &&
        evidenceReadme.includes("Search Console ownership") &&
        evidenceReadme.includes("Google Business Profile") &&
        evidenceReadme.includes("Hotel Center")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.evidenceReadme,
    ),
  ];

  return {
    ready: checks.every((check) => check.status === "PASS"),
    checks,
  };
}

export function evaluateSearchLocalSeoReadiness({ env = loadEnvSnapshot(), baseDir = root } = {}) {
  const commercialLaunch = evaluateCommercialLaunch({ env, baseDir });
  const envState = envDiagnostics(env);
  const evidence = evidenceDiagnostics(commercialLaunch);
  const contracts = sourceContracts(baseDir);

  const blockers = [
    ...envState.missing.map((key) => `${key} is missing`),
    ...envState.placeholders.map((key) => `${key} is a placeholder`),
    ...envState.invalid,
    ...evidence.missingEvidence.map((item) => `${item.path} (${item.reason})`),
    ...contracts.checks.filter((check) => check.status !== "PASS").map((check) => check.label),
  ];

  return {
    decision: blockers.length === 0 ? "SEARCH LOCAL SEO PASS" : "SEARCH LOCAL SEO BLOCKED",
    env: envState,
    evidence,
    sourceContracts: contracts,
    blockers,
  };
}

export function formatSearchLocalSeoReadiness(result) {
  const lines = [
    "Kozbeyli Konagi search and local SEO readiness",
    `Decision: ${result.decision}`,
    `Env: ${result.env.configuredCount}/${result.env.required.length} configured, ${result.env.missing.length} missing, ${result.env.placeholders.length} placeholder, ${result.env.invalid.length} invalid`,
    `Evidence: ${result.evidence.ready ? "ready" : "blocked"}`,
    `Source contracts: ${result.sourceContracts.ready ? "pass" : "fail"}`,
    "",
    "Source checks:",
  ];

  for (const check of result.sourceContracts.checks) {
    lines.push(`${check.status} ${check.id} - ${check.label}`);
  }

  if (result.blockers.length > 0) {
    lines.push("");
    lines.push("Blockers:");
    result.blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  }

  return lines.join("\n");
}

function main() {
  const strict = process.argv.includes("--strict");
  const json = process.argv.includes("--json");
  const fromProcessEnv = process.argv.includes("--from-process-env");
  const baseDirArgIndex = process.argv.indexOf("--base-dir");
  const baseDir = baseDirArgIndex >= 0 ? process.argv[baseDirArgIndex + 1] : root;
  const result = evaluateSearchLocalSeoReadiness({
    env: fromProcessEnv ? parseProcessEnv() : loadEnvSnapshot(),
    baseDir,
  });

  console.log(json ? JSON.stringify(result, null, 2) : formatSearchLocalSeoReadiness(result));
  process.exitCode = strict && result.decision !== "SEARCH LOCAL SEO PASS" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
