import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

type LiveVerifyResult = {
  ok: boolean;
  failedRequiredScript: string;
  results: Array<{
    script: string;
    status: number;
    timedOut?: boolean;
  }>;
};

type LiveVerifyModule = {
  resolveScriptTimeoutMs: (env?: Record<string, string | undefined>) => number;
  runLiveProductionVerification: (input?: {
    verbose?: boolean;
    runScript?: (script: string) => {
      script: string;
      status: number;
      signal?: string | null;
      durationMs?: number;
      timeoutMs?: number;
      timedOut?: boolean;
      error?: string;
    };
  }) => LiveVerifyResult;
};

async function loadLiveVerifyModule() {
  return (await import(
    pathToFileURL(path.join(process.cwd(), "scripts/live-production-verify.mjs")).href
  )) as LiveVerifyModule;
}

describe("live production verification", () => {
  it("stops immediately when a required live gate fails", async () => {
    const { runLiveProductionVerification } = await loadLiveVerifyModule();
    const seenScripts: string[] = [];
    const result = runLiveProductionVerification({
      verbose: false,
      runScript: (script) => {
        seenScripts.push(script);
        return {
          script,
          status: script === "launch:smoke:live" ? 124 : 0,
          timedOut: script === "launch:smoke:live",
        };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.failedRequiredScript).toBe("launch:smoke:live");
    expect(result.results).toHaveLength(2);
    expect(result.results[1].timedOut).toBe(true);
    expect(seenScripts).toEqual(["domain:verify:strict", "launch:smoke:live"]);
  });

  it("treats diagnostic gate failures as warnings after required gates pass", async () => {
    const { runLiveProductionVerification } = await loadLiveVerifyModule();
    const result = runLiveProductionVerification({
      verbose: false,
      runScript: (script) => ({
        script,
        status: script === "github:ci:json" ? 1 : 0,
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.failedRequiredScript).toBe("");
    expect(result.results.at(-1)?.script).toBe("github:ci:json");
    expect(result.results.at(-1)?.status).toBe(1);
  });

  it("uses a configurable per-gate timeout with a safe default", async () => {
    const { resolveScriptTimeoutMs } = await loadLiveVerifyModule();

    expect(resolveScriptTimeoutMs({ LIVE_VERIFY_SCRIPT_TIMEOUT_MS: "1500" })).toBe(1500);
    expect(resolveScriptTimeoutMs({ LIVE_VERIFY_SCRIPT_TIMEOUT_MS: "0" })).toBe(600000);
    expect(resolveScriptTimeoutMs({ LIVE_VERIFY_SCRIPT_TIMEOUT_MS: "bad" })).toBe(600000);
  });
});
