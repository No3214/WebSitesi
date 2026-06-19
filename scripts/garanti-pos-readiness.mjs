import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { evaluateCommercialLaunch, loadEnvSnapshot } from "./commercial-launch-audit.mjs";

const root = process.cwd();

const REQUIRED_ENV = [
  "GARANTI_POS_MODE",
  "GARANTI_MERCHANT_ID",
  "GARANTI_TERMINAL_ID",
  "GARANTI_PROVISION_USER",
  "GARANTI_3D_STORE_KEY",
];

const VALID_POS_MODES = ["test", "sandbox", "production", "prod"];

const CONTRACT_FILES = {
  envExample: ".env.example",
  runtimeReadiness: "src/lib/production-readiness.ts",
  commercialAudit: "scripts/commercial-launch-audit.mjs",
  checkoutRoute: "src/app/api/checkout/route.ts",
  wizardHook: "src/components/payment-wizard/use-payment-wizard.ts",
  paymentStep: "src/components/payment-wizard/steps/payment-step.tsx",
  wizardTypes: "src/components/payment-wizard/types.ts",
  evidenceReadme: "docs/evidence/README.md",
  evidence: "docs/evidence/garanti-pos.md",
  paymentDecision: "docs/odeme-karari.md",
  checkoutContract: "tests/e2e/checkout-contract.spec.ts",
};

const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;
const forbiddenCardIdentifiers = /\b(cardNumber|card_number|cvv|cvc|expiry|expireMonth|expireYear)\b/i;

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

  const mode = String(env.GARANTI_POS_MODE || "").trim().toLowerCase();
  if (hasMeaningfulValue(mode) && !VALID_POS_MODES.includes(mode)) {
    invalid.push(`GARANTI_POS_MODE must be one of ${VALID_POS_MODES.join(", ")}`);
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
  const gate = commercialLaunch.gateResults.find((item) => item.id === "garanti_pos");
  return {
    ready: Boolean(gate?.ready && gate.missingEvidence.length === 0),
    missingEvidence: gate?.missingEvidence ?? [{ path: "docs/evidence/garanti-pos.md", ready: false, reason: "missing gate" }],
  };
}

function fileCheck(id, label, status, detail = "") {
  return { id, label, status, detail };
}

function sourceContracts(baseDir) {
  const envExample = read(baseDir, CONTRACT_FILES.envExample);
  const runtimeReadiness = read(baseDir, CONTRACT_FILES.runtimeReadiness);
  const commercialAudit = read(baseDir, CONTRACT_FILES.commercialAudit);
  const checkoutRoute = read(baseDir, CONTRACT_FILES.checkoutRoute);
  const wizardHook = read(baseDir, CONTRACT_FILES.wizardHook);
  const paymentStep = read(baseDir, CONTRACT_FILES.paymentStep);
  const wizardTypes = read(baseDir, CONTRACT_FILES.wizardTypes);
  const evidenceReadme = read(baseDir, CONTRACT_FILES.evidenceReadme);
  const evidence = read(baseDir, CONTRACT_FILES.evidence);
  const paymentDecision = read(baseDir, CONTRACT_FILES.paymentDecision);
  const checkoutContract = read(baseDir, CONTRACT_FILES.checkoutContract);
  const paymentUiSource = [wizardHook, paymentStep, wizardTypes].join("\n");

  const checks = [
    fileCheck(
      "env_keys_documented",
      "Example environment file documents every Garanti POS key without putting credentials in git",
      REQUIRED_ENV.every((key) => new RegExp(`^${key}=`, "m").test(envExample)) &&
        /^GARANTI_POS_MODE=test$/m.test(envExample)
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.envExample,
    ),
    fileCheck(
      "runtime_gate_registered",
      "Runtime readiness exposes the Garanti POS env group without leaking secret values",
      runtimeReadiness.includes('id: "garanti_pos"') &&
        REQUIRED_ENV.every((key) => runtimeReadiness.includes(`"${key}"`)) &&
        runtimeReadiness.includes("placeholderCount") &&
        runtimeReadiness.includes("configurationSource")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.runtimeReadiness,
    ),
    fileCheck(
      "commercial_gate_registered",
      "Commercial launch audit scores Garanti POS only with env plus redacted evidence",
      commercialAudit.includes('id: "garanti_pos"') &&
        commercialAudit.includes("Garanti Sanal POS credentials and sandbox evidence") &&
        commercialAudit.includes("docs/evidence/garanti-pos.md") &&
        commercialAudit.includes("scanEvidenceSource")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.commercialAudit,
    ),
    fileCheck(
      "checkout_route_card_data_rejected",
      "Checkout API is a strict pre-reservation endpoint and rejects card/payment fields",
        checkoutRoute.includes("checkoutSchema") &&
        checkoutRoute.includes("forbiddenPaymentFields") &&
        checkoutRoute.includes("checkout.card_data_rejected") &&
        checkoutRoute.includes("}).strict();") &&
        checkoutRoute.includes("validateSameOrigin") &&
        checkoutRoute.includes("enforceRateLimit") &&
        checkoutRoute.includes("calculateBookingQuote") &&
        checkoutRoute.includes("Tahsilat bu route'ta YAPILMAZ") &&
        checkoutRoute.includes("Garanti BBVA Sanal POS 3D Secure") &&
        !/\b(cardNumber|card_number|cvv|cvc|expiry|expireMonth|expireYear)\s*:\s*z\./i.test(checkoutRoute)
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.checkoutRoute,
    ),
    fileCheck(
      "wizard_collects_no_card_data",
      "Reservation wizard has no card state, no card inputs and tells guests payment happens on Garanti 3D Secure",
      paymentUiSource.includes("Kart state'i YOK") &&
        paymentUiSource.includes("Kart alanlari KASITLI olarak yok") &&
        paymentUiSource.includes("Garanti BBVA Sanal POS") &&
        paymentUiSource.includes("We do not ask for card details here") &&
        !forbiddenCardIdentifiers.test(paymentUiSource) &&
        !/type=["']password["']/.test(paymentStep)
        ? "PASS"
        : "FAIL",
      "src/components/payment-wizard/*",
    ),
    fileCheck(
      "evidence_policy_card_safe",
      "Evidence inbox forbids raw credentials, card data, guest PII and bank portal dumps",
      evidenceReadme.includes("garanti-pos.md") &&
        evidenceReadme.includes("Do not add secrets, card data, customer PII") &&
        /Do not paste raw credentials, card numbers, customer PII|No credentials, card data|No credentials, card numbers/i.test(evidence) &&
        evidence.includes("3D Secure") &&
        /Callback|callback/.test(evidence)
        ? "PASS"
        : "FAIL",
      "docs/evidence/*",
    ),
    fileCheck(
      "payment_decision_redirect_model",
      "Payment decision document keeps the site outside card collection and uses bank-hosted 3D Secure",
      paymentDecision.includes("kart bilgisi ASLA istemez") &&
        paymentDecision.includes("Garanti BBVA Sanal POS'un 3D Secure") &&
        paymentDecision.includes("PCI-DSS") &&
        paymentDecision.includes("SAQ-A") &&
        paymentDecision.includes("/api/payment/garanti/callback")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.paymentDecision,
    ),
    fileCheck(
      "checkout_contract_covers_card_tampering",
      "E2E checkout contract rejects client-sent card fields before any CMS write",
      checkoutContract.includes("Kart alanı gönderilirse 400 ile reddedilir") &&
        checkoutContract.includes("cardNumber") &&
        checkoutContract.includes("expect(res.status()).toBe(400)")
        ? "PASS"
        : "FAIL",
      CONTRACT_FILES.checkoutContract,
    ),
  ];

  return {
    ready: checks.every((check) => check.status === "PASS"),
    checks,
  };
}

export function evaluateGarantiPosReadiness({ env = loadEnvSnapshot(), baseDir = root } = {}) {
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
    decision: blockers.length === 0 ? "GARANTI POS READINESS PASS" : "GARANTI POS READINESS BLOCKED",
    env: envState,
    evidence,
    sourceContracts: contracts,
    blockers,
  };
}

export function formatGarantiPosReadiness(result) {
  const lines = [
    "Kozbeyli Konagi Garanti POS readiness",
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
  const result = evaluateGarantiPosReadiness();

  console.log(json ? JSON.stringify(result, null, 2) : formatGarantiPosReadiness(result));
  process.exitCode = strict && result.decision !== "GARANTI POS READINESS PASS" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
