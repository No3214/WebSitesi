import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const liveProductionGates = [
  {
    script: "domain:verify:strict",
    label: "Canonical domain serves the current Vercel deployment",
    required: true,
  },
  {
    script: "launch:smoke:live",
    label: "Live route, media, location and booking smoke",
    required: true,
  },
  {
    script: "localization:verify:live",
    label: "Live TR/EN localization and mobile CTA smoke",
    required: true,
  },
  {
    script: "media:playback:live",
    label: "Live video playback smoke",
    required: true,
  },
  {
    script: "readiness:summary:json",
    label: "Readiness score and owner queue summary",
    required: false,
  },
  {
    script: "github:ci:json",
    label: "GitHub Actions current-commit diagnostic",
    required: false,
  },
];

const isWindows = process.platform === "win32";
const DEFAULT_SCRIPT_TIMEOUT_MS = 10 * 60 * 1000;
const OUTPUT_TAIL_LIMIT = 4000;

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function resolveScriptTimeoutMs(env = process.env) {
  return parsePositiveInteger(env.LIVE_VERIFY_SCRIPT_TIMEOUT_MS) || DEFAULT_SCRIPT_TIMEOUT_MS;
}

function outputTail(value, limit = OUTPUT_TAIL_LIMIT) {
  const text = String(value || "");
  return text.length > limit ? text.slice(-limit) : text;
}

export function runNpmScript(script, { timeoutMs = resolveScriptTimeoutMs(), captureOutput = false } = {}) {
  const startedAt = Date.now();
  const command = isWindows ? process.env.ComSpec || "cmd.exe" : "npm";
  const args = isWindows ? ["/d", "/s", "/c", `npm run ${script}`] : ["run", script];
  const result = spawnSync(command, args, {
    encoding: captureOutput ? "utf8" : undefined,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || "1",
    },
    shell: false,
    stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
    timeout: timeoutMs,
  });
  const timedOut = result.error?.code === "ETIMEDOUT";

  return {
    script,
    status: timedOut ? 124 : result.status ?? 1,
    signal: result.signal,
    durationMs: Date.now() - startedAt,
    timeoutMs,
    timedOut,
    error: result.error?.message || "",
    stdoutTail: captureOutput ? outputTail(result.stdout) : "",
    stderrTail: captureOutput ? outputTail(result.stderr) : "",
  };
}

function formatDuration(ms) {
  return `${Math.round(ms / 1000)}s`;
}

function printList() {
  for (const gate of liveProductionGates) {
    const requirement = gate.required ? "required" : "diagnostic";
    console.log(`${gate.script}\t${requirement}\t${gate.label}`);
  }
}

function printSummary(results) {
  console.log("\nKozbeyli Konagi live production verification summary");

  for (const result of results) {
    const gate = liveProductionGates.find((item) => item.script === result.script);
    const status = result.status === 0 ? "PASS" : gate?.required ? "FAIL" : "WARN";
    const requirement = gate?.required ? "required" : "diagnostic";
    const signal = result.signal ? ` signal=${result.signal}` : "";
    const timeout = result.timedOut ? ` timeout=${formatDuration(result.timeoutMs)}` : "";
    const error = result.error ? ` error=${result.error}` : "";
    console.log(`${status} ${result.script} (${requirement}, ${formatDuration(result.durationMs)})${signal}${timeout}${error}`);
  }
}

export function runLiveProductionVerification({ runScript = runNpmScript, verbose = true } = {}) {
  const results = [];

  for (const gate of liveProductionGates) {
    const requirement = gate.required ? "required" : "diagnostic";
    if (verbose) {
      console.log(`\n--- ${gate.label}: npm run ${gate.script} (${requirement}) ---`);
    }
    const result = runScript(gate.script);
    results.push(result);

    if (result.status !== 0 && gate.required) {
      if (verbose) {
        printSummary(results);
      }
      return {
        results,
        ok: false,
        failedRequiredScript: gate.script,
      };
    }
  }

  if (verbose) {
    printSummary(results);
  }
  return {
    results,
    ok: results.every((result) => {
      const gate = liveProductionGates.find((item) => item.script === result.script);
      return !gate?.required || result.status === 0;
    }),
    failedRequiredScript: "",
  };
}

function main() {
  const json = process.argv.includes("--json");

  if (process.argv.includes("--list")) {
    printList();
    return;
  }

  if (process.argv.includes("--help")) {
    console.log("Usage: node scripts/live-production-verify.mjs [--list] [--json]");
    console.log("Runs public live production gates for the canonical domain, live routes, localization and video playback.");
    console.log("Readiness summary and GitHub CI are diagnostic so external account blockers do not mask public site health.");
    console.log("Set LIVE_VERIFY_SCRIPT_TIMEOUT_MS to override the default 10 minute timeout per child gate.");
    return;
  }

  if (!json) {
    console.log("Kozbeyli Konagi live production verification");
    console.log("Target: canonical domain + live public route smoke + EN/TR localization + real video playback");
    console.log(`Per-gate timeout: ${formatDuration(resolveScriptTimeoutMs())}`);
  }

  const result = runLiveProductionVerification({
    verbose: !json,
    runScript: json ? (script) => runNpmScript(script, { captureOutput: true }) : runNpmScript,
  });
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exitCode = result.ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
