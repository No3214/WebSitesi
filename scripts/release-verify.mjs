import { spawnSync } from "node:child_process";

const gates = [
  {
    script: "security:audit",
    label: "Runtime dependency audit",
  },
  {
    script: "evidence:scan",
    label: "Commercial evidence redaction scan",
  },
  {
    script: "media:hero:json",
    label: "Opening hero media quality audit",
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

function runNpmScript(script) {
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
    error: result.error?.message,
  };
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
    console.log("Runs the local release gate: security, evidence scan, hero media audit, readiness diagnostics, publish verify, launch smoke, stress, audit json and cutover plan.");
    return;
  }

  console.log("Kozbeyli Konagi release verification");
  console.log("Target: security + evidence scan + hero media audit + readiness diagnostics + publish verification + launch smoke + stress + commercial audit + cutover plan");

  const results = [];

  for (const gate of gates) {
    console.log(`\n--- ${gate.label}: npm run ${gate.script} ---`);
    const result = runNpmScript(gate.script);
    results.push(result);

    if (result.status !== 0) {
      printSummary(results);
      process.exit(result.status);
    }
  }

  printSummary(results);
}

main();
