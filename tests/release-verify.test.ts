import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const root = process.cwd();

type ReleaseVerifyModule = {
  buildReleaseGates: (options?: { commercialStrict?: boolean }) => ReleaseVerifyModule["gates"];
  gates: Array<{
    script: string;
    label: string;
    transientRetry?: {
      maxRetries: number;
      reason: string;
    };
  }>;
  isTransientReleaseFailure: (result: { stderr?: string; stdout?: string; output?: string; error?: string }) => boolean;
  runGate: (
    gate: ReleaseVerifyModule["gates"][number],
    args: {
      runScript: (script: string, opts: { captureOutput?: boolean }) => {
        script: string;
        status: number;
        durationMs: number;
        stderr?: string;
        stdout?: string;
        output?: string;
        retryCount?: number;
      };
      log?: (message: string) => void;
    },
  ) => {
    script: string;
    status: number;
    durationMs: number;
    retryCount?: number;
  };
};

async function loadReleaseVerify() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/release-verify.mjs")).href
  )) as ReleaseVerifyModule;
}

describe("release verification runner", () => {
  it("keeps the default release gate diagnostic while offering a commercial strict gate list", async () => {
    const releaseVerify = await loadReleaseVerify();

    const defaultScripts = releaseVerify.buildReleaseGates().map((gate) => gate.script);
    const commercialScripts = releaseVerify
      .buildReleaseGates({ commercialStrict: true })
      .map((gate) => gate.script);

    expect(defaultScripts).toContain("launch:audit:json");
    expect(defaultScripts).toContain("launch:cutover:json");
    expect(defaultScripts).toContain("analytics:verify:json");
    expect(defaultScripts).toContain("supabase:verify:json");
    expect(defaultScripts).toContain("vercel:env:json");
    expect(defaultScripts).not.toContain("launch:audit:strict");
    expect(defaultScripts).not.toContain("launch:cutover:strict");
    expect(defaultScripts).not.toContain("vercel:env:values:strict");
    expect(releaseVerify.gates.map((gate) => gate.script)).toEqual(defaultScripts);

    expect(commercialScripts).toContain("launch:audit:live:strict");
    expect(commercialScripts).toContain("launch:cutover:strict");
    expect(commercialScripts).toContain("vercel:env:values:strict");
    expect(commercialScripts).toContain("vercel:supabase:verify");
    expect(commercialScripts).toContain("vercel:commercial:verify");
    expect(commercialScripts).toContain("vercel:hms:verify");
    expect(commercialScripts).toContain("vercel:garanti:verify");
    expect(commercialScripts).toContain("vercel:analytics:verify");
    expect(commercialScripts).toContain("vercel:search:verify");
    expect(commercialScripts).not.toContain("launch:audit:json");
    expect(commercialScripts).not.toContain("launch:audit:strict");
    expect(commercialScripts).not.toContain("launch:cutover:json");
    expect(commercialScripts).not.toContain("analytics:verify:json");
    expect(commercialScripts).not.toContain("supabase:verify:json");
    expect(commercialScripts).not.toContain("vercel:env:json");
  });

  it("retries npm audit once when the registry audit endpoint times out", async () => {
    const releaseVerify = await loadReleaseVerify();
    const securityAudit = releaseVerify.gates.find((gate) => gate.script === "security:audit");
    const calls: Array<{ script: string; captureOutput?: boolean }> = [];

    expect(securityAudit?.transientRetry).toMatchObject({
      maxRetries: 1,
      reason: expect.stringContaining("npm audit"),
    });
    expect(
      releaseVerify.isTransientReleaseFailure({
        stderr: "npm error audit endpoint returned an error\nFetchError: ETIMEDOUT",
      }),
    ).toBe(true);

    const result = releaseVerify.runGate(securityAudit!, {
      log: () => undefined,
      runScript: (script, opts) => {
        calls.push({ script, captureOutput: opts.captureOutput });
        if (calls.length === 1) {
          return {
            script,
            status: 1,
            durationMs: 10,
            stderr: "npm error audit endpoint returned an error\nFetchError: ETIMEDOUT",
          };
        }
        return { script, status: 0, durationMs: 12, stdout: "found 0 vulnerabilities" };
      },
    });

    expect(calls).toEqual([
      { script: "security:audit", captureOutput: true },
      { script: "security:audit", captureOutput: true },
    ]);
    expect(result.status).toBe(0);
    expect(result.retryCount).toBe(1);
  });

  it("does not retry non-transient audit failures", async () => {
    const releaseVerify = await loadReleaseVerify();
    const securityAudit = releaseVerify.gates.find((gate) => gate.script === "security:audit");
    const calls: string[] = [];

    expect(
      releaseVerify.isTransientReleaseFailure({
        stdout: "found 1 high severity vulnerability",
      }),
    ).toBe(false);

    const result = releaseVerify.runGate(securityAudit!, {
      log: () => undefined,
      runScript: (script) => {
        calls.push(script);
        return {
          script,
          status: 1,
          durationMs: 10,
          stdout: "found 1 high severity vulnerability",
        };
      },
    });

    expect(calls).toEqual(["security:audit"]);
    expect(result.status).toBe(1);
    expect(result.retryCount).toBeUndefined();
  });
});
