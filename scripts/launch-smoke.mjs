import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const liveTarget = process.env.PW_BASE_URL;
const playwrightSpecs = [
  "tests/e2e/publish-routes.spec.ts",
  "tests/e2e/health.spec.ts",
  "tests/e2e/hero-video.spec.ts",
  "tests/e2e/contact-location.spec.ts",
  "tests/e2e/media-assets.spec.ts",
];

const isWindows = process.platform === "win32";
const nodeBin = process.execPath;
const playwrightCli = "node_modules/@playwright/test/cli.js";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) {
    console.error(`FAIL command could not start: ${command} ${args.join(" ")}`);
    console.error(result.error.message);
  }

  return result;
}

function checkVercelCli() {
  const result = isWindows ? checkWindowsVercelCli() : runVersionCommand("vercel", ["--version"]);

  if (result.status === 0) {
    const version = result.stdout.trim() || result.stderr.trim();
    console.log(`INFO Vercel CLI: ${version}`);
    return;
  }

  console.log(
    "WARN Vercel CLI not installed. Install with `npm i -g vercel` to enable `vercel env pull`, `vercel deploy` and `vercel logs` checks.",
  );
}

function checkWindowsVercelCli() {
  const vercelScript = resolveWindowsVercelScript();
  if (!vercelScript) {
    return { status: 1, stdout: "", stderr: "" };
  }

  return spawnSync(nodeBin, [vercelScript, "--version"], {
    encoding: "utf8",
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function resolveWindowsVercelScript() {
  const where = spawnSync("where.exe", ["vercel.cmd"], {
    encoding: "utf8",
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (where.status !== 0) return null;

  const commandPath = where.stdout.split(/\r?\n/).find(Boolean);
  if (!commandPath) return null;

  const scriptPath = path.join(path.dirname(commandPath), "node_modules", "vercel", "dist", "vc.js");
  return fs.existsSync(scriptPath) ? scriptPath : null;
}

function runVersionCommand(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function printSpecList() {
  console.log(playwrightSpecs.join("\n"));
}

function main() {
  if (process.argv.includes("--list")) {
    printSpecList();
    return;
  }

  const target = liveTarget || "local production server via Playwright webServer";
  console.log("Kozbeyli Konagi launch smoke");
  console.log(`Target: ${target}`);
  checkVercelCli();

  if (!liveTarget && !fs.existsSync(".next/BUILD_ID")) {
    console.error("FAIL local launch smoke needs a production build. Run `npm run build` first or set PW_BASE_URL.");
    process.exit(1);
  }

  const audit = run(nodeBin, ["scripts/commercial-launch-audit.mjs", "--json"]);
  if (audit.status !== 0) process.exit(audit.status ?? 1);

  if (!fs.existsSync(playwrightCli)) {
    console.error("FAIL Playwright CLI is missing. Run `npm install --include=dev`.");
    process.exit(1);
  }

  const smoke = run(nodeBin, [playwrightCli, "test", ...playwrightSpecs, "--reporter=line"]);
  process.exit(smoke.status ?? 1);
}

main();
