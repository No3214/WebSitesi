import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { evaluateCommercialLaunch, loadEnvSnapshot } from "./commercial-launch-audit.mjs";

const root = process.cwd();

const REQUIRED_ENV = [
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

const CONTRACT_FILES = {
  leadRoute: "src/app/api/lead/route.ts",
  leadForm: "src/components/lead-form.tsx",
  trackingScripts: "src/components/tracking-scripts.tsx",
  rateLimit: "src/lib/rate-limit.ts",
  productionReadiness: "src/lib/production-readiness.ts",
  publicEnv: "src/lib/public-env.ts",
  envExample: ".env.example",
  legacyLeadService: "src/services/lead.ts",
};

const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;

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

  const upstashUrl = String(env.UPSTASH_REDIS_REST_URL || "").trim();
  if (hasMeaningfulValue(upstashUrl) && !/^https:\/\//i.test(upstashUrl)) {
    invalid.push("UPSTASH_REDIS_REST_URL must use HTTPS");
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
  const gate = commercialLaunch.gateResults.find((item) => item.id === "production_abuse_controls");
  return {
    ready: Boolean(gate?.ready && gate.missingEvidence.length === 0),
    missingEvidence: gate?.missingEvidence ?? [{ path: "docs/evidence/production-abuse-controls.md", ready: false, reason: "missing gate" }],
  };
}

function fileCheck(id, label, status, detail = "") {
  return { id, label, status, detail };
}

function sourceContracts(baseDir) {
  const leadRoute = read(baseDir, CONTRACT_FILES.leadRoute);
  const leadForm = read(baseDir, CONTRACT_FILES.leadForm);
  const trackingScripts = read(baseDir, CONTRACT_FILES.trackingScripts);
  const rateLimit = read(baseDir, CONTRACT_FILES.rateLimit);
  const productionReadiness = read(baseDir, CONTRACT_FILES.productionReadiness);
  const publicEnv = read(baseDir, CONTRACT_FILES.publicEnv);
  const envExample = read(baseDir, CONTRACT_FILES.envExample);
  const legacyLeadService = read(baseDir, CONTRACT_FILES.legacyLeadService);
  const rateLimitCallIndex = leadRoute.indexOf("const rateLimit = await enforceRateLimit(");
  const turnstileCallIndex = leadRoute.indexOf("const turnstileOk = await verifyTurnstile(");
  const payloadCreateIndex = leadRoute.indexOf("await payload.create(");

  const checks = [
    fileCheck(
      "lead_route_same_origin",
      "Lead API keeps same-origin protection before persistence",
      leadRoute.includes("validateSameOrigin(req)") && leadRoute.includes("status: 403") ? "PASS" : "FAIL",
      CONTRACT_FILES.leadRoute,
    ),
    fileCheck(
      "lead_route_rate_limit",
      "Lead API enforces shared rate-limit before Turnstile and Payload writes",
      rateLimitCallIndex > -1 &&
        turnstileCallIndex > -1 &&
        payloadCreateIndex > -1 &&
        rateLimitCallIndex < turnstileCallIndex &&
        turnstileCallIndex < payloadCreateIndex
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.leadRoute,
    ),
    fileCheck(
      "lead_route_turnstile_secret",
      "Lead API uses the documented TURNSTILE_SECRET_KEY env name",
      leadRoute.includes("env.TURNSTILE_SECRET_KEY") && !leadRoute.includes("CLOUDFLARE_TURNSTILE_SECRET_KEY")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.leadRoute,
    ),
    fileCheck(
      "lead_route_turnstile_fail_closed",
      "Lead API blocks missing Turnstile token when the production secret is configured",
      leadRoute.includes("if (!env.TURNSTILE_SECRET_KEY) return true") && leadRoute.includes("if (!token) return false")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.leadRoute,
    ),
    fileCheck(
      "lead_form_turnstile_widget",
      "Lead form renders Cloudflare Turnstile only when the public site key exists",
      leadForm.includes("publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY") &&
        leadForm.includes('className="cf-turnstile"') &&
        leadForm.includes("data-sitekey={publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}") &&
        leadForm.includes("turnstileToken")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.leadForm,
    ),
    fileCheck(
      "turnstile_script_loader",
      "Turnstile browser script is loaded from Cloudflare when configured",
      trackingScripts.includes("https://challenges.cloudflare.com/turnstile/v0/api.js") &&
        trackingScripts.includes("publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.trackingScripts,
    ),
    fileCheck(
      "upstash_rate_limit_backend",
      "Rate-limit and replay store can use shared Upstash Redis REST in production",
      rateLimit.includes("UPSTASH_REDIS_REST_URL") &&
        rateLimit.includes("UPSTASH_REDIS_REST_TOKEN") &&
        rateLimit.includes("/pipeline") &&
        rateLimit.includes('rateLimitBackend(): "upstash" | "memory"')
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.rateLimit,
    ),
    fileCheck(
      "runtime_readiness_gate",
      "Runtime readiness exposes the production abuse-control env group",
      productionReadiness.includes('"production_abuse_controls"') &&
        REQUIRED_ENV.every((key) => productionReadiness.includes(`"${key}"`))
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.productionReadiness,
    ),
    fileCheck(
      "public_env_boundary",
      "Client public-env helper exposes only the public Turnstile site key",
      publicEnv.includes("NEXT_PUBLIC_TURNSTILE_SITE_KEY") && !publicEnv.includes("TURNSTILE_SECRET_KEY")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.publicEnv,
    ),
    fileCheck(
      "env_example_documentation",
      "Example env documents every production abuse-control key",
      REQUIRED_ENV.every((key) => new RegExp(`^${key}=`, "m").test(envExample)) ? "PASS" : "FAIL",
      CONTRACT_FILES.envExample,
    ),
    fileCheck(
      "legacy_env_name_removed",
      "Legacy Cloudflare Turnstile env alias is not used in lead code",
      ![leadRoute, legacyLeadService, envExample, productionReadiness, publicEnv].join("\n").includes("CLOUDFLARE_TURNSTILE_SECRET_KEY")
        ? "PASS"
        : "FAIL",
      "lead sources",
    ),
  ];

  return {
    ready: checks.every((check) => check.status === "PASS"),
    checks,
  };
}

export function evaluateAbuseControlsReadiness({ env = loadEnvSnapshot(), baseDir = root } = {}) {
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
    decision: blockers.length === 0 ? "PRODUCTION ABUSE CONTROLS PASS" : "PRODUCTION ABUSE CONTROLS BLOCKED",
    env: envState,
    evidence,
    sourceContracts: contracts,
    blockers,
  };
}

export function formatAbuseControlsReadiness(result) {
  const lines = [
    "Kozbeyli Konagi production abuse-control readiness",
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
  const result = evaluateAbuseControlsReadiness();

  console.log(json ? JSON.stringify(result, null, 2) : formatAbuseControlsReadiness(result));
  process.exitCode = strict && result.decision !== "PRODUCTION ABUSE CONTROLS PASS" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
