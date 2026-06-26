import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { evaluateCommercialLaunch, loadEnvSnapshot } from "./commercial-launch-audit.mjs";

const root = process.cwd();

const REQUIRED_ENV = [
  "NEXT_PUBLIC_META_PIXEL_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "GA4_MEASUREMENT_ID",
  "GA4_API_SECRET",
];

const GOOGLE_TAG_ANY_OF = ["NEXT_PUBLIC_GTM_ID", "NEXT_PUBLIC_GA4_MEASUREMENT_ID"];

const DOCUMENTED_PUBLIC_ENV = [
  ...REQUIRED_ENV,
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GA4_MEASUREMENT_ID",
];

const CONTRACT_FILES = {
  layout: "src/app/layout.tsx",
  trackingScripts: "src/components/tracking-scripts.tsx",
  gtm: "src/lib/gtm.ts",
  ga4Server: "src/lib/ga4-server.ts",
  leadForm: "src/components/lead-form.tsx",
  bookingEmbed: "src/components/hms-booking-embed.tsx",
  roomViewTracker: "src/components/room-view-tracker.tsx",
  publicEnv: "src/lib/public-env.ts",
  envExample: ".env.example",
};

const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;

export function parseEnvFile(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        return [key, value];
      }),
  );
}

export function loadEnvFileSnapshot(envFile, baseEnv = loadEnvSnapshot()) {
  return {
    ...baseEnv,
    ...parseEnvFile(fs.readFileSync(envFile, "utf8")),
  };
}

export function loadProcessEnvSnapshot(source = process.env) {
  return Object.fromEntries(
    Object.entries(source).filter((entry) => typeof entry[1] === "string"),
  );
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
  let googleTagConfigured = 0;

  const googleTagValues = GOOGLE_TAG_ANY_OF.map((key) => ({
    key,
    value: String(env[key] || "").trim(),
  }));
  const hasValidGoogleTag = googleTagValues.some(({ key, value }) => {
    if (!hasMeaningfulValue(value)) return false;
    if (key === "NEXT_PUBLIC_GTM_ID") return /^GTM-[A-Z0-9]+$/i.test(value);
    return /^G-[A-Z0-9]+$/i.test(value);
  });
  const hasExplicitGoogleTag = googleTagValues.some(({ value }) => Boolean(value));
  if (hasValidGoogleTag) {
    googleTagConfigured = 1;
  } else if (!hasExplicitGoogleTag) {
    missing.push(GOOGLE_TAG_ANY_OF.join(" or "));
  } else {
    googleTagConfigured = googleTagValues.some(({ value }) => hasMeaningfulValue(value)) ? 1 : 0;
    if (googleTagValues.some(({ value }) => value && !hasMeaningfulValue(value))) {
      placeholders.push(GOOGLE_TAG_ANY_OF.join(" or "));
    }
  }

  const gtmId = String(env.NEXT_PUBLIC_GTM_ID || "").trim();
  if (hasMeaningfulValue(gtmId) && !/^GTM-[A-Z0-9]+$/i.test(gtmId)) {
    invalid.push("NEXT_PUBLIC_GTM_ID must look like GTM-XXXX");
  }

  const metaPixelId = String(env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();
  if (hasMeaningfulValue(metaPixelId) && !/^\d{5,30}$/.test(metaPixelId)) {
    invalid.push("NEXT_PUBLIC_META_PIXEL_ID must be the numeric Meta Pixel ID");
  }

  const measurementId = String(env.GA4_MEASUREMENT_ID || "").trim();
  if (hasMeaningfulValue(measurementId) && !/^G-[A-Z0-9]+$/i.test(measurementId)) {
    invalid.push("GA4_MEASUREMENT_ID must look like G-XXXX");
  }

  const publicMeasurementId = String(env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "").trim();
  if (hasMeaningfulValue(publicMeasurementId) && !/^G-[A-Z0-9]+$/i.test(publicMeasurementId)) {
    invalid.push("NEXT_PUBLIC_GA4_MEASUREMENT_ID must look like G-XXXX");
  }

  const googleAdsId = String(env.NEXT_PUBLIC_GOOGLE_ADS_ID || "").trim();
  if (hasMeaningfulValue(googleAdsId) && !/^AW-\d{5,20}$/i.test(googleAdsId)) {
    invalid.push("NEXT_PUBLIC_GOOGLE_ADS_ID must look like AW-XXXXXXXXX");
  }

  return {
    required: [...REQUIRED_ENV, GOOGLE_TAG_ANY_OF.join(" or ")],
    configuredCount: configured.length + googleTagConfigured,
    missing,
    placeholders,
    invalid,
    ready: missing.length === 0 && placeholders.length === 0 && invalid.length === 0,
  };
}

function evidenceDiagnostics(commercialLaunch) {
  const gate = commercialLaunch.gateResults.find((item) => item.id === "analytics_purchase");
  return {
    ready: Boolean(gate?.ready && gate.missingEvidence.length === 0),
    missingEvidence: gate?.missingEvidence ?? [{ path: "docs/evidence/analytics-purchase.md", ready: false, reason: "missing gate" }],
  };
}

function fileCheck(id, label, status, detail = "") {
  return { id, label, status, detail };
}

function sourceContracts(baseDir) {
  const layout = read(baseDir, CONTRACT_FILES.layout);
  const trackingScripts = read(baseDir, CONTRACT_FILES.trackingScripts);
  const gtm = read(baseDir, CONTRACT_FILES.gtm);
  const ga4Server = read(baseDir, CONTRACT_FILES.ga4Server);
  const leadForm = read(baseDir, CONTRACT_FILES.leadForm);
  const bookingEmbed = read(baseDir, CONTRACT_FILES.bookingEmbed);
  const roomViewTracker = read(baseDir, CONTRACT_FILES.roomViewTracker);
  const publicEnv = read(baseDir, CONTRACT_FILES.publicEnv);
  const envExample = read(baseDir, CONTRACT_FILES.envExample);
  const combinedClientSource = [layout, trackingScripts, gtm, leadForm, bookingEmbed, roomViewTracker, publicEnv].join("\n");

  const checks = [
    fileCheck(
      "layout_mounts_tracking",
      "Root layout mounts the consent-aware tracking script component",
      layout.includes("import { TrackingScripts }") && layout.includes("<TrackingScripts />") ? "PASS" : "FAIL",
      CONTRACT_FILES.layout,
    ),
    fileCheck(
      "gtm_consent_gate",
      "GTM loads only after analytics consent and public GTM env are present",
      trackingScripts.includes("consent.analytics && publicEnv.NEXT_PUBLIC_GTM_ID") &&
        trackingScripts.includes("https://www.googletagmanager.com/gtm.js") &&
        trackingScripts.includes("googletagmanager.com/ns.html")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.trackingScripts,
    ),
    fileCheck(
      "direct_google_tag_fallback",
      "Direct Google tag fallback loads GA4/Google Ads only after analytics consent and only when GTM is absent",
      trackingScripts.includes("shouldLoadDirectGoogleTag") &&
        trackingScripts.includes("!publicEnv.NEXT_PUBLIC_GTM_ID") &&
        trackingScripts.includes("NEXT_PUBLIC_GA4_MEASUREMENT_ID") &&
        trackingScripts.includes("NEXT_PUBLIC_GOOGLE_ADS_ID") &&
        trackingScripts.includes("https://www.googletagmanager.com/gtag/js") &&
        trackingScripts.includes("direct-google-tag") &&
        gtm.includes("window.gtag") &&
        gtm.includes('window.gtag("event", event, params)')
        ? "PASS"
        : "FAIL",
      "src/components/tracking-scripts.tsx + src/lib/gtm.ts",
    ),
    fileCheck(
      "meta_consent_gate",
      "Meta Pixel loads only after marketing consent and the documented pixel env are present",
      trackingScripts.includes("consent.marketing && publicEnv.NEXT_PUBLIC_META_PIXEL_ID") &&
        trackingScripts.includes("connect.facebook.net/en_US/fbevents.js") &&
        trackingScripts.includes("fbq('init', '${publicEnv.NEXT_PUBLIC_META_PIXEL_ID}')")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.trackingScripts,
    ),
    fileCheck(
      "funnel_helper_consent_recheck",
      "Funnel helpers re-check consent at event time before writing GA4 or Meta events",
      gtm.includes('hasOptionalConsent("analytics")') &&
        gtm.includes('hasOptionalConsent("marketing")') &&
        gtm.includes("window.dataLayer.push") &&
        gtm.includes('window.fbq("track"')
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.gtm,
    ),
    fileCheck(
      "funnel_event_map",
      "Funnel event map includes view_item, begin_checkout, generate_lead and purchase semantics",
      ["view_item", "begin_checkout", "generate_lead", "Purchase"].every((needle) => gtm.includes(needle))
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.gtm,
    ),
    fileCheck(
      "client_event_call_sites",
      "Room, booking handoff and lead form call the standard funnel helpers",
      roomViewTracker.includes("trackViewItem") &&
        bookingEmbed.includes("trackBeginCheckout") &&
        leadForm.includes("trackGenerateLead") &&
        leadForm.includes("lead_submission")
        ? "PASS"
        : "FAIL",
      "client funnel call sites",
    ),
    fileCheck(
      "ga4_server_noop_safe",
      "GA4 server-side purchase no-ops safely when Measurement Protocol env is absent",
      ga4Server.includes("isGa4ServerConfigured") &&
        ga4Server.includes("ga4.purchase.skipped_not_configured") &&
        ga4Server.includes("return false")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.ga4Server,
    ),
    fileCheck(
      "ga4_server_purchase_payload",
      "GA4 Measurement Protocol purchase payload uses transaction_id, value, currency and items without PII",
      ga4Server.includes("https://www.google-analytics.com/mp/collect") &&
        ga4Server.includes('name: "purchase"') &&
        ga4Server.includes("transaction_id") &&
        ga4Server.includes("client_id: pseudoClientId") &&
        !/guest_(email|phone|first_name|last_name)|normalizedEmail|normalizedPhone/i.test(ga4Server)
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.ga4Server,
    ),
    fileCheck(
      "public_private_env_boundary",
      "Client-side public env exposes only public analytics IDs and never the GA4 API secret",
      publicEnv.includes("NEXT_PUBLIC_GTM_ID") &&
        publicEnv.includes("NEXT_PUBLIC_GA4_MEASUREMENT_ID") &&
        publicEnv.includes("NEXT_PUBLIC_GOOGLE_ADS_ID") &&
        publicEnv.includes("NEXT_PUBLIC_META_PIXEL_ID") &&
        !publicEnv.includes("GA4_API_SECRET") &&
        !combinedClientSource.includes("process.env.GA4_API_SECRET")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.publicEnv,
    ),
    fileCheck(
      "env_example_documentation",
      "Example env documents every analytics purchase key",
      DOCUMENTED_PUBLIC_ENV.every((key) => new RegExp(`^${key}=`, "m").test(envExample)) ? "PASS" : "FAIL",
      CONTRACT_FILES.envExample,
    ),
    fileCheck(
      "meta_legacy_key_removed",
      "Legacy Facebook pixel env alias is not used",
      ![trackingScripts, gtm, leadForm, bookingEmbed, roomViewTracker, publicEnv, envExample].join("\n").includes("NEXT_PUBLIC_FB_PIXEL_ID")
        ? "PASS"
        : "FAIL",
      "analytics client sources",
    ),
  ];

  return {
    ready: checks.every((check) => check.status === "PASS"),
    checks,
  };
}

export function evaluateAnalyticsReadiness({ env = loadEnvSnapshot(), baseDir = root } = {}) {
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
    decision: blockers.length === 0 ? "ANALYTICS PURCHASE TRACKING PASS" : "ANALYTICS PURCHASE TRACKING BLOCKED",
    env: envState,
    evidence,
    sourceContracts: contracts,
    blockers,
  };
}

export function formatAnalyticsReadiness(result) {
  const lines = [
    "Kozbeyli Konagi analytics purchase readiness",
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
  const envFileArgIndex = process.argv.indexOf("--env-file");
  const envFile = envFileArgIndex >= 0 ? process.argv[envFileArgIndex + 1] : "";
  const baseDirArgIndex = process.argv.indexOf("--base-dir");
  const baseDir = baseDirArgIndex >= 0 ? process.argv[baseDirArgIndex + 1] || root : root;
  const env = envFile
    ? loadEnvFileSnapshot(envFile, loadEnvSnapshot(baseDir))
    : fromProcessEnv
      ? loadProcessEnvSnapshot()
      : loadEnvSnapshot(baseDir);
  const result = evaluateAnalyticsReadiness({ env, baseDir });

  console.log(json ? JSON.stringify(result, null, 2) : formatAnalyticsReadiness(result));
  process.exitCode = strict && result.decision !== "ANALYTICS PURCHASE TRACKING PASS" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
