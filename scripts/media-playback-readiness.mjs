import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const liveTarget = process.env.PW_BASE_URL;
const playwrightSpecs = ["tests/e2e/media-assets.spec.ts"];
const videoPlaybackGrep =
  "homepage editorial videos|/gastronomi videos can play real frames|mobile /gastronomi video controls";
const nodeBin = process.execPath;
const playwrightCli = "node_modules/@playwright/test/cli.js";
const outputRoot = path.join("test-results", "media-playback-readiness");
const workers = process.env.MEDIA_PLAYBACK_WORKERS || "1";

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

function makeRunScopedOutputDir() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(outputRoot, `${stamp}-${process.pid}`);
}

function runDomainPreflight() {
  if (!liveTarget) return { status: 0 };

  console.log("INFO media playback preflight: live domain readiness");
  return run(nodeBin, ["scripts/domain-readiness.mjs", "--json"]);
}

function printSpecList() {
  console.log(playwrightSpecs.join("\n"));
  console.log(`--grep ${videoPlaybackGrep}`);
}

function main() {
  if (process.argv.includes("--list")) {
    printSpecList();
    return;
  }

  const target = liveTarget || "local production server via Playwright webServer";
  console.log("Kozbeyli Konagi media playback readiness");
  console.log(`Target: ${target}`);
  console.log("Scope: homepage kitchen clips and /gastronomi breakfast, mihlama and chef video playback");

  if (!liveTarget && !fs.existsSync(".next/BUILD_ID")) {
    console.error("FAIL local media playback readiness needs a production build. Run `npm run build` first or set PW_BASE_URL.");
    process.exit(1);
  }

  const preflight = runDomainPreflight();
  if (preflight.status !== 0) process.exit(preflight.status ?? 1);

  if (!fs.existsSync(playwrightCli)) {
    console.error("FAIL Playwright CLI is missing. Run `npm install --include=dev`.");
    process.exit(1);
  }

  const outputDir = makeRunScopedOutputDir();
  const result = run(nodeBin, [
    playwrightCli,
    "test",
    ...playwrightSpecs,
    "--grep",
    videoPlaybackGrep,
    "--reporter=line",
    "--workers",
    workers,
    "--output",
    outputDir,
  ]);

  process.exit(result.status ?? 1);
}

main();
