import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

const sourceFiles = {
  packageJson: "package.json",
  publishReadiness: "scripts/publish-readiness.mjs",
  securitySpec: "tests/security.spec.ts",
  bodyLimit: "src/lib/webhook-body-limit.ts",
  bodyLimitTest: "tests/webhook-body-limit.test.ts",
  securityLib: "src/lib/security.ts",
};

const requiredSignals = {
  packageJson: [
    {
      id: "package_webhook_verify",
      label: "package scripts must expose webhook:verify",
      pattern: /"webhook:verify"\s*:\s*"node scripts\/webhook-surface-readiness\.mjs"/,
    },
    {
      id: "package_webhook_verify_json",
      label: "package scripts must expose webhook:verify:json",
      pattern: /"webhook:verify:json"\s*:\s*"node scripts\/webhook-surface-readiness\.mjs --json"/,
    },
    {
      id: "package_webhook_verify_strict",
      label: "package scripts must expose webhook:verify:strict",
      pattern: /"webhook:verify:strict"\s*:\s*"node scripts\/webhook-surface-readiness\.mjs --strict"/,
    },
  ],
  publishReadiness: [
    {
      id: "publish_requires_webhook_script",
      label: "publish gate must require the webhook readiness script",
      pattern: /scripts\/webhook-surface-readiness\.mjs/,
    },
    {
      id: "publish_requires_webhook_test",
      label: "publish gate must require webhook surface unit tests",
      pattern: /tests\/webhook-surface-readiness\.test\.ts/,
    },
    {
      id: "publish_requires_body_limit",
      label: "publish gate must require webhook body-limit source and tests",
      pattern: /src\/lib\/webhook-body-limit\.ts[\s\S]*tests\/webhook-body-limit\.test\.ts/,
    },
  ],
  securitySpec: [
    {
      id: "hotelrunner_missing_signature",
      label: "HotelRunner webhook must reject missing signatures in E2E coverage",
      pattern: /hotelrunner webhook should reject missing signature[\s\S]*\/api\/webhook\/hotelrunner[\s\S]*toBe\(401\)/,
    },
    {
      id: "iyzico_missing_signature",
      label: "Iyzico webhook must reject missing signatures in E2E coverage",
      pattern: /iyzico webhook should reject missing signature[\s\S]*\/api\/webhook\/iyzico[\s\S]*toBe\(401\)/,
    },
    {
      id: "webhook_get_no_status_leak",
      label: "webhook GET endpoints must not expose active provider status",
      pattern: /webhook endpoints should not expose active status over GET[\s\S]*\/api\/webhook\/hotelrunner[\s\S]*\/api\/webhook\/iyzico[\s\S]*not\.toContain\("active"\)/,
    },
    {
      id: "live_legacy_hotelrunner_skip",
      label: "legacy HotelRunner POST probe must be skipped against live HMS migration",
      pattern: /test\.skip\(\s*!!process\.env\.PW_BASE_URL[\s\S]*HotelRunner legacy - HMS gecisi sonrasi canlida atlanir/,
    },
  ],
  bodyLimit: [
    {
      id: "body_limit_constant",
      label: "webhook body reader must cap payloads at 64KB by default",
      pattern: /MAX_WEBHOOK_PAYLOAD_BYTES\s*=\s*64_000/,
    },
    {
      id: "body_limit_preflight",
      label: "webhook body reader must reject oversized content-length before reading body",
      pattern: /content-length[\s\S]*contentLength\s*>?\s*maxBytes[\s\S]*payloadTooLargeResponse/,
    },
    {
      id: "body_limit_runtime_size",
      label: "webhook body reader must re-check actual byte length after reading body",
      pattern: /TextEncoder\(\)\.encode\(bodyText\)\.byteLength[\s\S]*sizeBytes\s*>\s*maxBytes/,
    },
    {
      id: "body_limit_no_store",
      label: "oversized webhook responses must be no-store",
      pattern: /"Cache-Control"\s*:\s*"no-store, max-age=0"/,
    },
  ],
  bodyLimitTest: [
    {
      id: "body_limit_test_content_length",
      label: "unit tests must cover content-length rejection",
      pattern: /rejects oversized webhook requests from content-length/,
    },
    {
      id: "body_limit_test_stream_size",
      label: "unit tests must cover oversized body rejection without content-length",
      pattern: /rejects oversized webhook requests even when content-length is absent/,
    },
    {
      id: "body_limit_test_boundary",
      label: "unit tests must cover the accepted byte-limit boundary",
      pattern: /accepts webhook bodies at the configured byte limit/,
    },
  ],
  securityLib: [
    {
      id: "es256_webcrypto",
      label: "security lib must expose WebCrypto ES256 verification for ECC webhooks",
      pattern: /verifyEs256Signature[\s\S]*crypto\.subtle\.importKey[\s\S]*ECDSA[\s\S]*P-256[\s\S]*SHA-256/,
    },
    {
      id: "timing_safe_equal",
      label: "security lib must expose timing-safe string comparison for webhook secrets",
      pattern: /timingSafeEqualStr[\s\S]*max\(a\.length,\s*b\.length\)[\s\S]*mismatch/,
    },
  ],
};

const forbiddenRouteFiles = [
  "src/app/api/webhook/hotelrunner/route.ts",
  "src/app/api/webhook/iyzico/route.ts",
  "src/app/api/webhook/route.ts",
];

function readIfExists(relPath, baseDir = root) {
  const fullPath = path.join(baseDir, relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function exists(relPath, baseDir = root) {
  return fs.existsSync(path.join(baseDir, relPath));
}

function buildCheck(id, ready, detail) {
  return { id, ready, detail };
}

function evaluateSignalGroup(groupId, relPath, baseDir) {
  const source = readIfExists(relPath, baseDir);
  const signals = requiredSignals[groupId] || [];

  return [
    buildCheck(`${groupId}_present`, Boolean(source), relPath),
    ...signals.map((signal) =>
      buildCheck(signal.id, signal.pattern.test(source), signal.label),
    ),
  ];
}

export function evaluateWebhookSurfaceSource({ baseDir = root } = {}) {
  const checks = Object.entries(sourceFiles).flatMap(([groupId, relPath]) =>
    evaluateSignalGroup(groupId, relPath, baseDir),
  );

  checks.push(
    ...forbiddenRouteFiles.map((relPath) =>
      buildCheck(
        `no_unowned_${relPath.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`,
        !exists(relPath, baseDir),
        relPath,
      ),
    ),
  );

  return {
    ready: checks.every((check) => check.ready),
    checks,
  };
}

export async function evaluateWebhookSurfaceReadiness(args = {}) {
  const source = evaluateWebhookSurfaceSource(args);
  const blockers = source.checks
    .filter((check) => !check.ready)
    .map((check) => `source ${check.id}: ${check.detail}`);

  return {
    decision: blockers.length === 0 ? "WEBHOOK SURFACE READY" : "WEBHOOK SURFACE BLOCKED",
    source,
    blockers,
  };
}

export function formatWebhookSurfaceReadiness(result) {
  const lines = [
    "Kozbeyli Konagi webhook surface readiness",
    `Decision: ${result.decision}`,
    "",
    "Source guard:",
  ];

  result.source.checks.forEach((check) => {
    lines.push(`- ${check.ready ? "PASS" : "FAIL"} ${check.id} (${check.detail})`);
  });

  if (result.blockers.length > 0) {
    lines.push("");
    lines.push("Blockers:");
    result.blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  }

  return lines.join("\n");
}

async function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const result = await evaluateWebhookSurfaceReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatWebhookSurfaceReadiness(result));
  process.exitCode = strict && result.decision !== "WEBHOOK SURFACE READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void main();
}
