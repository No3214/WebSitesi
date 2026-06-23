import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const root = process.cwd();

type VercelProductionRunModule = {
  getProductionRunTargets: () => Array<{
    id: string;
    description: string;
    command: string[];
  }>;
  buildVercelEnvRunArgs: (targetId: string, options?: { environment?: string; strict?: boolean }) => string[];
};

async function loadModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/vercel-production-run.mjs")).href
  )) as VercelProductionRunModule;
}

describe("Vercel production runner", () => {
  it("builds shell-independent Vercel env run arguments for production value checks", async () => {
    const mod = await loadModule();
    const envScript = path.join(root, "scripts/vercel-env-readiness.mjs");
    const supabaseScript = path.join(root, "scripts/supabase-security-readiness.mjs");
    const hmsScript = path.join(root, "scripts/hms-booking-readiness.mjs");
    const garantiScript = path.join(root, "scripts/garanti-pos-readiness.mjs");
    const searchScript = path.join(root, "scripts/search-local-seo-readiness.mjs");

    expect(mod.buildVercelEnvRunArgs("env")).toEqual([
      "env",
      "run",
      "-e",
      "production",
      "--",
      "node",
      envScript,
      "--from-process-env",
    ]);
    expect(mod.buildVercelEnvRunArgs("env", { strict: true })).toEqual([
      "env",
      "run",
      "-e",
      "production",
      "--",
      "node",
      envScript,
      "--from-process-env",
      "--strict",
    ]);
    expect(mod.buildVercelEnvRunArgs("supabase")).toEqual([
      "env",
      "run",
      "-e",
      "production",
      "--",
      "node",
      supabaseScript,
      "--strict",
      "--from-process-env",
      "--base-dir",
      root,
    ]);
    expect(mod.buildVercelEnvRunArgs("hms")).toEqual([
      "env",
      "run",
      "-e",
      "production",
      "--",
      "node",
      hmsScript,
      "--strict",
    ]);
    expect(mod.buildVercelEnvRunArgs("garanti")).toEqual([
      "env",
      "run",
      "-e",
      "production",
      "--",
      "node",
      garantiScript,
      "--strict",
      "--from-process-env",
      "--base-dir",
      root,
    ]);
    expect(mod.buildVercelEnvRunArgs("search")).toEqual([
      "env",
      "run",
      "-e",
      "production",
      "--",
      "node",
      searchScript,
      "--strict",
      "--from-process-env",
      "--base-dir",
      root,
    ]);
  });

  it("exposes every operator target without secret values", async () => {
    const mod = await loadModule();
    const targets = mod.getProductionRunTargets();

    expect(targets.map((target) => target.id).sort()).toEqual([
      "abuse",
      "analytics",
      "env",
      "garanti",
      "hms",
      "search",
      "supabase",
    ]);
    expect(JSON.stringify(targets)).not.toContain("DATABASE_URI=");
    expect(JSON.stringify(targets)).not.toContain("GA4_API_SECRET=");
  });

  it("rejects unknown production run targets", async () => {
    const mod = await loadModule();

    expect(() => mod.buildVercelEnvRunArgs("unknown")).toThrow(
      "Unknown Vercel production run target: unknown",
    );
  });
});
