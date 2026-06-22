import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const gates = [
  {
    script: "security:audit",
    label: "Runtime dependency audit",
    transientRetry: {
      maxRetries: 1,
      reason: "npm audit registry/network timeout",
    },
  },
  {
    script: "evidence:scan",
    label: "Commercial evidence redaction scan",
  },
  {
    script: "brand:verify:json",
    label: "Brand integrity and public-copy truthfulness diagnosis",
  },
  {
    script: "evidence:handoff:json",
    label: "Commercial evidence handoff manifest",
  },
  {
    script: "media:hero:json",
    label: "Opening hero media quality audit",
  },
  {
    script: "security:headers:json",
    label: "Production security headers diagnosis",
  },
  {
    script: "admin:verify:json",
    label: "Admin-only growth dashboard access diagnosis",
  },
  {
    script: "abuse:verify:json",
    label: "Production abuse-control readiness diagnosis",
  },
  {
    script: "analytics:verify:json",
    label: "Analytics purchase readiness diagnosis",
  },
  {
    script: "search:verify:json",
    label: "Search and local SEO readiness diagnosis",
  },
  {
    script: "garanti:verify:json",
    label: "Garanti POS readiness diagnosis",
  },
  {
    script: "supabase:verify:json",
    label: "Supabase/Payload database security diagnosis",
  },
  {
    script: "hms:verify:json",
    label: "HMS booking target readiness diagnosis",
  },
  {
    script: "domain:verify:json",
    label: "Canonical domain readiness diagnosis",
  },
  {
    script: "vercel:ops:json",
    label: "Vercel project and CLI operations diagnosis",
  },
  {
    script: "vercel:env:json",
    label: "Vercel production env inventory diagnosis",
  },
  {
    script: "github:ci:json",
    label: "GitHub Actions CI readiness diagnosis",
  },
  {
    script: "publish:verify",
    label: "Full publish verification",
  },
  {
    script: "launch:smoke",
    label: "Local launch smoke",
  },
  {
    script: "test:stress",
    label: "Monkey and chaos stress tests",
  },
  {
    script: "launch:audit:json",
    label: "Commercial launch evidence audit",
  },
  {
    script: "launch:cutover:json",
    label: "Commercial production cutover plan",
  },
];

const isWindows = process.platform === "win32";
const transientFailurePatterns = [
  /\bETIMEDOUT\b/i,
  /\bECONNRESET\b/i,
  /\bEAI_AGAIN\b/i,
  /\bENOTFOUND\b/i,
  /audit endpoint returned an error/i,
  /request to .* failed/i,
  /socket hang up/i,
  /fetch failed/i,
];

export function isTransientReleaseFailure(result) {
  const output = [
    result.error,
    result.stdout,
    result.stderr,
    result.output,
  ].filter(Boolean).join("\n");

  return transientFailurePatterns.some((pattern) => pattern.test(output));
}

export function runNpmScript(script, { captureOutput = false } = {}) {
  const startedAt = Date.now();
  const command = isWindows ? process.env.ComSpec || "cmd.exe" : "npm";
  const args = isWindows ? ["/d", "/s", "/c", `npm run ${script}`] : ["run", script];

  const result = spawnSync(command, args, {
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || "1",
    },
    shell: false,
    stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    maxBuffer: 200 * 1024 * 1024,
  });
  const stdout = typeof result.stdout === "string" ? result.stdout : "";
  const stderr = typeof result.stderr === "string" ? result.stderr : "";

  if (captureOutput) {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  }

  return {
    script,
    status: result.status ?? 1,
    signal: result.signal,
    durationMs: Date.now() - startedAt,
    error: result.error?.message,
    stdout,
    stderr,
    output: `${stdout}\n${stderr}`.trim(),
  };
}

export function runGate(gate, { runScript = runNpmScript, log = console.log } = {}) {
  const maxRetries = gate.transientRetry?.maxRetries ?? 0;
  const captureOutput = Boolean(gate.transientRetry);
  let result = runScript(gate.script, { captureOutput });

  for (let retry = 1; result.status !== 0 && retry <= maxRetries; retry += 1) {
    if (!isTransientReleaseFailure(result)) break;

    log(
      `WARN ${gate.script} failed with ${gate.transientRetry.reason}; retrying ${retry}/${maxRetries}.`,
    );
    result = runScript(gate.script, { captureOutput });
    result.retryCount = retry;
  }

  return result;
}

function formatDuration(ms) {
  return `${Math.round(ms / 1000)}s`;
}

function printList() {
  console.log(gates.map((gate) => gate.script).join("\n"));
}

function printSummary(results) {
  console.log("\nKozbeyli Konagi release verification summary");

  for (const result of results) {
    const status = result.status === 0 ? "PASS" : "FAIL";
    const signal = result.signal ? ` signal=${result.signal}` : "";
    const error = result.error ? ` error=${result.error}` : "";
    console.log(`${status} ${result.script} (${formatDuration(result.durationMs)})${signal}${error}`);
  }
}

function main() {
  if (process.argv.includes("--list")) {
    printList();
    return;
  }

  if (process.argv.includes("--help")) {
    console.log("Usage: node scripts/release-verify.mjs [--list]");
    console.log("Runs the local release gate: security, evidence scan, evidence handoff, hero media audit, readiness diagnostics, domain/HMS/Vercel diagnostics, publish verify, launch smoke, stress, audit json and cutover plan.");
    return;
  }

  console.log("Kozbeyli Konagi release verification");
  console.log("Target: security + evidence scan + evidence handoff + hero media audit + readiness diagnostics + domain/HMS/Vercel diagnostics + publish verification + launch smoke + stress + commercial audit + cutover plan");

  const results = [];

  for (const gate of gates) {
    console.log(`\n--- ${gate.label}: npm run ${gate.script} ---`);
    const result = runGate(gate);
    results.push(result);

    if (result.status !== 0) {
      printSummary(results);
      process.exit(result.status);
    }
  }

  printSummary(results);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
