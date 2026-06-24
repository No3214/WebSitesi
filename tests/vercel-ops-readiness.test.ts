import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-vercel-ops-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("Vercel ops readiness", () => {
  it("does not execute npx fallback when the persistent CLI is missing by default", () => {
    const emptyPathDir = makeTmpDir();
    const fakeAppData = makeTmpDir();
    const output = execFileSync(process.execPath, ["scripts/vercel-ops-readiness.mjs", "--json"], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        APPDATA: fakeAppData,
        PATH: emptyPathDir,
        Path: emptyPathDir,
      },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 20000,
    });
    const result = JSON.parse(output) as {
      checks: Array<{ id: string; status: string; detail: string; error?: string }>;
    };
    const cliCheck = result.checks.find((check) => check.id === "global_vercel_cli");
    const scriptsCheck = result.checks.find((check) => check.id === "vercel_npm_scripts");

    expect(cliCheck).toMatchObject({
      status: "warn",
      detail: "Global Vercel CLI is not available on PATH; npx fallback was not executed.",
    });
    expect(scriptsCheck?.detail).toContain("live:verify");
    expect(JSON.stringify(result)).not.toContain("npx --yes vercel");
  });
});
