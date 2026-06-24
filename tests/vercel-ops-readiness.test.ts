import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];
const scriptPath = path.join(root, "scripts/vercel-ops-readiness.mjs");
const requiredScripts = [
  "domain:verify",
  "domain:verify:strict",
  "live:verify",
  "launch:smoke:live",
  "release:verify",
];
const requiredEnvKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GA4_MEASUREMENT_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "GA4_MEASUREMENT_ID",
  "GA4_API_SECRET",
  "GOOGLE_SITE_VERIFICATION",
];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-vercel-ops-"));
  tmpDirs.push(dir);
  return dir;
}

function makeFixtureProject() {
  const dir = makeTmpDir();
  fs.mkdirSync(path.join(dir, "docs/evidence"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      type: "module",
      scripts: Object.fromEntries(requiredScripts.map((script) => [script, "node -e \"process.exit(0)\""])),
    }),
  );
  fs.writeFileSync(path.join(dir, ".env.example"), requiredEnvKeys.map((key) => `${key}=\n`).join(""));
  fs.writeFileSync(path.join(dir, "docs/evidence/canonical-domain.md"), "status: ready\n");
  return dir;
}

function runReadiness(cwd: string, env: NodeJS.ProcessEnv) {
  const output = execFileSync(process.execPath, [scriptPath, "--json"], {
    cwd,
    encoding: "utf8",
    env,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 20000,
  });

  return JSON.parse(output) as {
    decision: string;
    checks: Array<{ id: string; status: string; detail: string; remediation?: string; error?: string }>;
    failures: Array<{ id: string; status: string; detail: string }>;
    warnings: Array<{ id: string; status: string; detail: string }>;
  };
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("Vercel ops readiness", () => {
  it("does not execute npx fallback when the persistent CLI is missing by default", () => {
    const fixture = makeFixtureProject();
    const emptyPathDir = makeTmpDir();
    const fakeAppData = makeTmpDir();
    const result = runReadiness(fixture, {
      ...process.env,
      CI: "true",
      APPDATA: fakeAppData,
      PATH: emptyPathDir,
      Path: emptyPathDir,
    });
    const cliCheck = result.checks.find((check) => check.id === "global_vercel_cli");
    const scriptsCheck = result.checks.find((check) => check.id === "vercel_npm_scripts");

    expect(cliCheck).toMatchObject({
      status: "warn",
      detail: "Global Vercel CLI is not available on PATH; npx fallback was not executed.",
    });
    expect(scriptsCheck?.detail).toContain("live:verify");
    expect(JSON.stringify(result)).not.toContain("npx --yes vercel");
  });

  it("treats missing project binding as a CI warning because .vercel is intentionally uncommitted", () => {
    const fixture = makeFixtureProject();
    const emptyPathDir = makeTmpDir();
    const fakeAppData = makeTmpDir();
    const result = runReadiness(fixture, {
      ...process.env,
      CI: "true",
      APPDATA: fakeAppData,
      PATH: emptyPathDir,
      Path: emptyPathDir,
    });
    const bindingCheck = result.checks.find((check) => check.id === "project_binding");

    expect(result.failures).toEqual([]);
    expect(bindingCheck).toMatchObject({
      status: "warn",
      detail: ".vercel/project.json is not present in CI; this private operator link is intentionally not committed.",
    });
    expect(bindingCheck?.remediation).toContain("vercel:ops:strict");
  });

  it("still fails missing project binding outside CI for operator machines", () => {
    const fixture = makeFixtureProject();
    const emptyPathDir = makeTmpDir();
    const fakeAppData = makeTmpDir();

    expect(() =>
      execFileSync(process.execPath, [scriptPath, "--json"], {
        cwd: fixture,
        encoding: "utf8",
        env: {
          ...process.env,
          CI: "",
          APPDATA: fakeAppData,
          PATH: emptyPathDir,
          Path: emptyPathDir,
        },
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 20000,
      }),
    ).toThrow();

  });

  it("passes project binding checks when the private local Vercel link is valid", () => {
    const fixture = makeFixtureProject();
    const vercelDir = path.join(fixture, ".vercel");
    fs.mkdirSync(vercelDir, { recursive: true });
    fs.writeFileSync(
      path.join(vercelDir, "project.json"),
      JSON.stringify({
        projectName: "kozbeyli-konagi",
        projectId: "prj_test",
        orgId: "team_test",
      }),
    );
    const emptyPathDir = makeTmpDir();
    const fakeAppData = makeTmpDir();
    const result = runReadiness(fixture, {
      ...process.env,
      CI: "",
      APPDATA: fakeAppData,
      PATH: emptyPathDir,
      Path: emptyPathDir,
    });
    const bindingCheck = result.checks.find((check) => check.id === "project_binding");

    expect(bindingCheck).toMatchObject({
      status: "pass",
      detail: "Linked to kozbeyli-konagi (prj_test).",
    });
  });
});
