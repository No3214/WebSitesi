import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getVercelCliCandidates, runVercelCandidate } from "./vercel-ops-readiness.mjs";

const repoRoot = process.cwd();

export const productionRunTargets = {
  env: {
    description: "Validate Vercel Production env names and values without writing a snapshot file.",
    command: ["node", "scripts/vercel-env-readiness.mjs", "--from-process-env"],
  },
  supabase: {
    description: "Validate Payload/Supabase production DATABASE_URI and PAYLOAD_SECRET from Vercel env.",
    command: ["node", "scripts/supabase-security-readiness.mjs", "--strict", "--from-process-env", "--base-dir"],
  },
  abuse: {
    description: "Validate Turnstile and Upstash production abuse-control env from Vercel env.",
    command: ["node", "scripts/abuse-controls-readiness.mjs", "--strict", "--from-process-env", "--base-dir"],
  },
  hms: {
    description: "Validate the approved HMS booking engine target from Vercel env.",
    command: ["node", "scripts/hms-booking-readiness.mjs", "--strict"],
  },
  garanti: {
    description: "Validate Garanti POS production env from Vercel env.",
    command: ["node", "scripts/garanti-pos-readiness.mjs", "--strict", "--from-process-env", "--base-dir"],
  },
  analytics: {
    description: "Validate analytics and purchase tracking env from Vercel env.",
    command: ["node", "scripts/analytics-readiness.mjs", "--strict", "--from-process-env", "--base-dir"],
  },
  search: {
    description: "Validate Search Console and local SEO production env from Vercel env.",
    command: ["node", "scripts/search-local-seo-readiness.mjs", "--strict", "--from-process-env", "--base-dir"],
  },
};

function linkedProjectJsonPath(baseDir = repoRoot) {
  return path.join(baseDir, ".vercel", "project.json");
}

function createIsolatedVercelCwd(baseDir = repoRoot) {
  const projectJson = linkedProjectJsonPath(baseDir);
  if (!fs.existsSync(projectJson)) {
    throw new Error(".vercel/project.json is required before running Vercel production env checks.");
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-vercel-run-"));
  const tempVercelDir = path.join(tempDir, ".vercel");
  fs.mkdirSync(tempVercelDir, { recursive: true });
  fs.copyFileSync(projectJson, path.join(tempVercelDir, "project.json"));

  return tempDir;
}

function cleanupIsolatedCwd(tempDir) {
  if (!tempDir) return;
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Best effort cleanup; never print paths that may include usernames into strict JSON consumers.
  }
}

function commandForTarget(targetId, { baseDir = repoRoot, strict = false } = {}) {
  const command = [...productionRunTargets[targetId].command];
  const scriptIndex = command.findIndex((item) => item.startsWith("scripts/"));
  if (scriptIndex >= 0) command[scriptIndex] = path.join(baseDir, command[scriptIndex]);

  const baseDirIndex = command.indexOf("--base-dir");
  if (baseDirIndex >= 0) command.splice(baseDirIndex + 1, 0, baseDir);
  if (strict && targetId === "env" && !command.includes("--strict")) command.push("--strict");

  return command;
}

export function getProductionRunTargets() {
  return Object.entries(productionRunTargets).map(([id, target]) => ({
    id,
    description: target.description,
    command: [...target.command],
  }));
}

function assertKnownProductionRunTarget(targetId) {
  const target = productionRunTargets[targetId];
  if (!target) {
    throw new Error(`Unknown Vercel production run target: ${targetId}`);
  }

  return target;
}

export function buildVercelEnvRunArgs(targetId, { environment = "production", strict = false } = {}) {
  assertKnownProductionRunTarget(targetId);

  return ["env", "run", "-e", environment, "--", ...commandForTarget(targetId, { strict })];
}

function printUsage() {
  console.log("Kozbeyli Konagi Vercel production runner");
  console.log("Usage: node scripts/vercel-production-run.mjs <target>");
  console.log("");
  console.log("Targets:");
  for (const target of getProductionRunTargets()) {
    console.log(`- ${target.id}: ${target.description}`);
  }
}

function outputError(error) {
  const stdout = typeof error?.stdout === "string" ? error.stdout : error?.stdout?.toString?.() || "";
  const stderr = typeof error?.stderr === "string" ? error.stderr : error?.stderr?.toString?.() || "";

  if (stdout.trim()) console.error(stdout.trim());
  if (stderr.trim()) console.error(stderr.trim());
  console.error(error instanceof Error ? error.message : String(error));
}

function commandOutputFromError(error) {
  const stdout = typeof error?.stdout === "string" ? error.stdout : error?.stdout?.toString?.() || "";
  const stderr = typeof error?.stderr === "string" ? error.stderr : error?.stderr?.toString?.() || "";

  return [stdout, stderr].filter((part) => part.trim()).join("\n").trim();
}

function commandStarted(error) {
  const output = commandOutputFromError(error);

  return output.includes("Vercel CLI") || output.includes("Kozbeyli Konagi") || output.includes("Decision:");
}

export function runProductionTarget(targetId, { strict = false } = {}) {
  assertKnownProductionRunTarget(targetId);

  const isolatedCwd = createIsolatedVercelCwd();
  const args = ["--cwd", isolatedCwd, ...buildVercelEnvRunArgs(targetId, { strict })];
  const errors = [];

  try {
    for (const candidate of getVercelCliCandidates()) {
      try {
        const output = runVercelCandidate(candidate, args, 180000);
        return {
          candidate,
          args,
          output,
          ok: true,
        };
      } catch (error) {
        if (commandStarted(error)) {
          return {
            candidate,
            args,
            output: commandOutputFromError(error),
            error: error instanceof Error ? error.message : String(error),
            ok: false,
          };
        }
        errors.push({ candidate, error });
      }
    }

    const details = errors
      .map(({ candidate, error }) => `${candidate}: ${error instanceof Error ? error.message : String(error)}`)
      .join("; ");
    throw new Error(`No Vercel CLI candidate could run target ${targetId}. ${details}`);
  } finally {
    cleanupIsolatedCwd(isolatedCwd);
  }
}

function main() {
  const targetId = process.argv[2] || "";
  const strict = process.argv.includes("--strict");

  if (!targetId || targetId === "--help" || targetId === "-h") {
    printUsage();
    process.exitCode = targetId ? 0 : 1;
    return;
  }

  try {
    const result = runProductionTarget(targetId, { strict });
    if (result.output) console.log(result.output);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    outputError(error);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
