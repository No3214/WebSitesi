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

export function runNpmScript(script) {
  const startedAt = Date.now();
  const command = isWindows ? process.env.ComSpec || "cmd.exe" : "npm";
  const args = isWindows ? ["/d", "/s", "/c", `npm run ${script}`] : ["run", script];
  const result = spawnSync(command, args, {
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || "1",
    },
    shell: false,
    stdio: "inherit",
  });

  return {
    script,
    status: result.status ?? 1,
    signal: result.signal,
    durationMs: Date.now() - startedAt,
    error: result.error?.message || "",
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
    const error = result.error ? ` error=${result.error}` : "";
    console.log(`${status} ${result.script} (${requirement}, ${formatDuration(result.durationMs)})${signal}${error}`);
  }
}

export function runLiveProductionVerification({ runScript = runNpmScript } = {}) {
  const results = [];

  for (const gate of liveProductionGates) {
    const requirement = gate.required ? "required" : "diagnostic";
    console.log(`\n--- ${gate.label}: npm run ${gate.script} (${requirement}) ---`);
    const result = runScript(gate.script);
    results.push(result);

    if (result.status !== 0 && gate.required) {
      printSummary(results);
      return {
        results,
        ok: false,
        failedRequiredScript: gate.script,
      };
    }
  }

  printSummary(results);
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
  if (process.argv.includes("--list")) {
    printList();
    return;
  }

  if (process.argv.includes("--help")) {
    console.log("Usage: node scripts/live-production-verify.mjs [--list]");
    console.log("Runs public live production gates for the canonical domain, live routes, localization and video playback.");
    console.log("Readiness summary and GitHub CI are diagnostic so external account blockers do not mask public site health.");
    return;
  }

  console.log("Kozbeyli Konagi live production verification");
  console.log("Target: canonical domain + live public route smoke + EN/TR localization + real video playback");

  const result = runLiveProductionVerification();
  process.exitCode = result.ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
