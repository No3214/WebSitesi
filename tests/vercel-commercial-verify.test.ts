import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const root = process.cwd();

type CommercialVerifyModule = {
  commercialVercelTargets: Array<{ id: string; command: string; strict?: boolean }>;
  runCommercialVercelVerification: (options?: {
    targets?: CommercialVerifyModule["commercialVercelTargets"];
    runTarget?: (targetId: string, options?: { strict?: boolean }) => { ok: boolean; output: string };
  }) => {
    decision: string;
    targetCount: number;
    passedCount: number;
    failedCount: number;
    failedTargets: string[];
    results: Array<{
      id: string;
      command: string;
      ok: boolean;
      decision: string;
      summary: string[];
    }>;
  };
  summarizeProductionOutput: (output: string) => { decision: string; lines: string[] };
};

async function loadModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/vercel-commercial-verify.mjs")).href
  )) as CommercialVerifyModule;
}

describe("commercial Vercel verification aggregator", () => {
  it("runs every production target and summarizes all blockers instead of stopping at the first failure", async () => {
    const mod = await loadModule();
    const calls: Array<{ targetId: string; strict?: boolean }> = [];

    const result = mod.runCommercialVercelVerification({
      runTarget: (targetId, options) => {
        calls.push({ targetId, strict: options?.strict });
        if (targetId === "env" || targetId === "garanti") {
          return {
            ok: false,
            output: `Kozbeyli Konagi ${targetId}\nDecision: ${targetId.toUpperCase()} ACTION_REQUIRED\nMissing env: GARANTI_3D_STORE_KEY`,
          };
        }

        return {
          ok: true,
          output: `Kozbeyli Konagi ${targetId}\nDecision: ${targetId.toUpperCase()} PASS`,
        };
      },
    });

    expect(calls.map((call) => call.targetId)).toEqual([
      "env",
      "supabase",
      "abuse",
      "hms",
      "garanti",
      "analytics",
      "search",
    ]);
    expect(calls[0]).toEqual({ targetId: "env", strict: true });
    expect(result.decision).toBe("VERCEL_COMMERCIAL_GATES_ACTION_REQUIRED");
    expect(result.targetCount).toBe(7);
    expect(result.passedCount).toBe(5);
    expect(result.failedCount).toBe(2);
    expect(result.failedTargets).toEqual(["env", "garanti"]);
    expect(result.results.find((item) => item.id === "garanti")?.summary).toContain(
      "Missing env: GARANTI_3D_STORE_KEY",
    );
  });

  it("keeps the aggregate target list aligned with the documented npm commands", async () => {
    const mod = await loadModule();

    expect(mod.commercialVercelTargets.map((target) => `${target.id}:${target.command}`)).toEqual([
      "env:npm run vercel:env:values:strict",
      "supabase:npm run vercel:supabase:verify",
      "abuse:npm run vercel:abuse:verify",
      "hms:npm run vercel:hms:verify",
      "garanti:npm run vercel:garanti:verify",
      "analytics:npm run vercel:analytics:verify",
      "search:npm run vercel:search:verify",
    ]);
  });

  it("redacts secret-looking values from safe summaries", async () => {
    const mod = await loadModule();
    const summary = mod.summarizeProductionOutput(
      [
        "Decision: BLOCKED",
        "Missing env: DATABASE_URI=postgres://user:secret@db.example.com/app",
        "FAIL TURNSTILE_SECRET_KEY=super-secret-value",
      ].join("\n"),
    );
    const rendered = summary.lines.join("\n");

    expect(rendered).toContain("DATABASE_URI=[redacted]");
    expect(rendered).toContain("TURNSTILE_SECRET_KEY=[redacted]");
    expect(rendered).not.toContain("super-secret-value");
    expect(rendered).not.toContain("user:secret");
  });
});
