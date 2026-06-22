import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

const files = {
  helper: "src/lib/webhook-body-limit.ts",
  hotelrunner: "src/app/api/webhook/hotelrunner/route.ts",
  iyzico: "src/app/api/webhook/iyzico/route.ts",
  helperTest: "tests/webhook-body-limit.test.ts",
  securitySpec: "tests/security.spec.ts",
};

const providerContracts = [
  {
    id: "hotelrunner",
    path: files.hotelrunner,
    requiredSignals: [
      "readLimitedWebhookBody",
      "if (!bodyResult.ok) return bodyResult.response;",
      "const bodyText = bodyResult.bodyText;",
      "x-message-uid",
      "x-payload-signature",
      "hasReplay(messageUid)",
      "markReplay(messageUid)",
      "safeCompare(signature, createDigest(bodyText))",
      "verifyEs256Signature(bodyText, signature, env.HMS_WEBHOOK_ES256_PUBLIC_KEY)",
      "HOTELRUNNER_WEBHOOK_SECRET",
      "x-message-delivery",
    ],
    forbiddenSignals: [
      "const bodyText = await req.text();",
      "timingSafeEqual(Buffer.from(a), Buffer.from(b))",
    ],
  },
  {
    id: "iyzico",
    path: files.iyzico,
    requiredSignals: [
      "readLimitedWebhookBody",
      "if (!bodyResult.ok) return bodyResult.response;",
      "const bodyText = bodyResult.bodyText;",
      "x-message-uid",
      "x-payload-signature",
      "hasReplay(messageUid)",
      "markReplay(messageUid)",
      "safeCompare(signature, createDigest(bodyText))",
      "IYZICO_WEBHOOK_SECRET",
      "x-message-delivery",
    ],
    forbiddenSignals: [
      "const bodyText = await req.text();",
      "HMS_WEBHOOK_ES256_PUBLIC_KEY",
      "timingSafeEqual(Buffer.from(a), Buffer.from(b))",
    ],
  },
];

function read(relPath, baseDir = root) {
  const fullPath = path.join(baseDir, relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function exists(relPath, baseDir = root) {
  return fs.existsSync(path.join(baseDir, relPath));
}

function check(id, ready, detail) {
  return { id, ready, detail };
}

function evaluateHelper(baseDir) {
  const source = read(files.helper, baseDir);
  const helperTest = read(files.helperTest, baseDir);
  const checks = [
    check("helper_present", exists(files.helper, baseDir), files.helper),
    check("helper_exports_limit", source.includes("MAX_WEBHOOK_PAYLOAD_BYTES = 64_000"), "64 KB webhook payload ceiling"),
    check("helper_reads_content_length", source.includes('req.headers.get("content-length")'), "pre-read content-length guard"),
    check("helper_checks_actual_byte_size", source.includes("new TextEncoder().encode(bodyText).byteLength"), "post-read byte-size guard"),
    check("helper_returns_413", source.includes("status: 413"), "oversized payloads return 413"),
    check("helper_no_store_response", source.includes('"Cache-Control": "no-store, max-age=0"'), "oversized responses are not cached"),
    check("helper_tests_present", exists(files.helperTest, baseDir), files.helperTest),
    check("helper_tests_cover_content_length", helperTest.includes("content-length"), "content-length rejection test"),
    check("helper_tests_cover_missing_content_length", helperTest.includes("content-length is absent"), "post-read rejection test"),
  ];

  return {
    ready: checks.every((item) => item.ready),
    checks,
  };
}

function evaluateProvider(provider, baseDir) {
  const source = read(provider.path, baseDir);
  const limitedReadIndex = source.indexOf("const bodyResult = await readLimitedWebhookBody(req);");
  const missingHeaderIndex = source.indexOf("if (!messageUid || !signature)");
  const bodyLimitAfterHeaderGuard =
    missingHeaderIndex >= 0 && limitedReadIndex > missingHeaderIndex;
  const checks = [
    check(`${provider.id}_present`, exists(provider.path, baseDir), provider.path),
    check(`${provider.id}_body_limit_after_header_guard`, bodyLimitAfterHeaderGuard, "missing signature headers fail before body read"),
    ...provider.requiredSignals.map((signal) =>
      check(`${provider.id}_requires_${signal.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`, source.includes(signal), signal),
    ),
    ...provider.forbiddenSignals.map((signal) =>
      check(`${provider.id}_forbids_${signal.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`, !source.includes(signal), signal),
    ),
  ];

  return {
    id: provider.id,
    path: provider.path,
    ready: checks.every((item) => item.ready),
    checks,
  };
}

export function evaluateWebhookSurfaceReadiness({ baseDir = root } = {}) {
  const helper = evaluateHelper(baseDir);
  const providers = providerContracts.map((provider) => evaluateProvider(provider, baseDir));
  const blockers = [
    ...helper.checks.filter((item) => !item.ready).map((item) => `helper ${item.id}: ${item.detail}`),
    ...providers.flatMap((provider) =>
      provider.checks.filter((item) => !item.ready).map((item) => `${provider.id} ${item.id}: ${item.detail}`),
    ),
  ];

  return {
    decision: blockers.length === 0 ? "WEBHOOK SURFACE READY" : "WEBHOOK SURFACE BLOCKED",
    maxPayloadBytes: 64_000,
    helper,
    providers,
    blockers,
  };
}

export function formatWebhookSurfaceReadiness(result) {
  const lines = [
    "Kozbeyli Konagi webhook surface readiness",
    `Decision: ${result.decision}`,
    `Max webhook payload bytes: ${result.maxPayloadBytes}`,
    "",
    "Shared body-limit helper:",
  ];

  result.helper.checks.forEach((item) => {
    lines.push(`- ${item.ready ? "PASS" : "FAIL"} ${item.id} (${item.detail})`);
  });

  for (const provider of result.providers) {
    lines.push("");
    lines.push(`${provider.id} webhook:`);
    provider.checks.forEach((item) => {
      lines.push(`- ${item.ready ? "PASS" : "FAIL"} ${item.id} (${item.detail})`);
    });
  }

  if (result.blockers.length > 0) {
    lines.push("");
    lines.push("Blockers:");
    result.blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  }

  return lines.join("\n");
}

function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const result = evaluateWebhookSurfaceReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatWebhookSurfaceReadiness(result));
  process.exitCode = strict && result.decision !== "WEBHOOK SURFACE READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
