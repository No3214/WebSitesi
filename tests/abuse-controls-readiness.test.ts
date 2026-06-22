import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type AbuseReadinessModule = {
  parseEnvFile: (source: string) => Record<string, string>;
  loadEnvFileSnapshot: (envFile: string, baseEnv?: Record<string, string>) => Record<string, string>;
  evaluateAbuseControlsReadiness: (args?: {
    env?: Record<string, string>;
    baseDir?: string;
  }) => {
    decision: string;
    env: {
      configuredCount: number;
      missing: string[];
      placeholders: string[];
      invalid: string[];
      ready: boolean;
    };
    evidence: {
      ready: boolean;
      missingEvidence: Array<{ path: string; ready: boolean; reason: string }>;
    };
    sourceContracts: {
      ready: boolean;
      checks: Array<{ id: string; status: string; label: string }>;
    };
    blockers: string[];
  };
};

const contractFiles = [
  "src/app/api/lead/route.ts",
  "src/components/lead-form.tsx",
  "src/components/tracking-scripts.tsx",
  "src/lib/rate-limit.ts",
  "src/lib/production-readiness.ts",
  "src/lib/public-env.ts",
  ".env.example",
];

async function loadModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/abuse-controls-readiness.mjs")).href
  )) as AbuseReadinessModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "abuse-controls-readiness-"));
  tmpDirs.push(dir);
  return dir;
}

function copyContractFiles(baseDir: string) {
  for (const relPath of contractFiles) {
    const target = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, relPath), target);
  }
}

function writeEvidence(baseDir: string, status = "ready") {
  const fullPath = path.join(baseDir, "docs/evidence/production-abuse-controls.md");
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(
    fullPath,
    [
      "# Production Abuse Controls Evidence",
      "",
      `status: ${status}`,
      "date: 2026-06-19",
      "owner: launch-security",
      "source_refs: TURNSTILE-UAT-123, UPSTASH-UAT-456",
      "",
      "## Summary",
      "Redacted source-system references prove production Turnstile and Upstash controls.",
      "",
      "## Proof",
      "Live lead-form UAT accepted a successful human lead submission with a valid human token.",
      "The same run blocked missing/invalid Turnstile tokens and rateLimitBackend() reports `upstash` for shared replay storage.",
      "",
      "## Residual Risk",
      "No secrets, visitor PII or raw request bodies are stored in this evidence fixture.",
    ].join("\n"),
  );
}

const readyEnv = {
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0x4AA-real-site-key",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
  UPSTASH_REDIS_REST_URL: "https://upstash.kozbeylikonagi.com",
  UPSTASH_REDIS_REST_TOKEN: "upstash-token",
};

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("production abuse-control readiness", () => {
  it("parses pulled env files and keeps empty production values authoritative", async () => {
    const mod = await loadModule();
    const parsed = mod.parseEnvFile(
      [
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY=",
        'TURNSTILE_SECRET_KEY=""',
        "UPSTASH_REDIS_REST_URL=https://example.upstash.io",
        "UPSTASH_REDIS_REST_TOKEN=''",
      ].join("\n"),
    );

    expect(parsed).toEqual({
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
      TURNSTILE_SECRET_KEY: "",
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "",
    });
  });

  it("keeps current source contracts passing while external env and evidence are pending", async () => {
    const mod = await loadModule();
    const result = mod.evaluateAbuseControlsReadiness({ env: {}, baseDir: root });

    expect(result.decision).toBe("PRODUCTION ABUSE CONTROLS BLOCKED");
    expect(result.env).toMatchObject({
      configuredCount: 0,
      missing: [
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
        "TURNSTILE_SECRET_KEY",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
      ],
      ready: false,
    });
    expect(result.evidence.missingEvidence).toEqual([
      {
        path: "docs/evidence/production-abuse-controls.md",
        ready: false,
        reason: "pending status",
      },
    ]);
    expect(result.sourceContracts.ready).toBe(true);
    expect(result.sourceContracts.checks.every((check) => check.status === "PASS")).toBe(true);
  });

  it("passes only when env, source contracts and redacted evidence are ready", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");

    const result = mod.evaluateAbuseControlsReadiness({ env: readyEnv, baseDir });

    expect(result.decision).toBe("PRODUCTION ABUSE CONTROLS PASS");
    expect(result.env.ready).toBe(true);
    expect(result.evidence.ready).toBe(true);
    expect(result.sourceContracts.ready).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("uses a pulled Vercel env file over local fallback abuse-control values", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");
    const envFile = path.join(baseDir, "vercel-production.env");
    fs.writeFileSync(
      envFile,
      [
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY=",
        "TURNSTILE_SECRET_KEY=",
        "UPSTASH_REDIS_REST_URL=",
        "UPSTASH_REDIS_REST_TOKEN=",
      ].join("\n"),
    );

    const env = mod.loadEnvFileSnapshot(envFile, readyEnv);
    const result = mod.evaluateAbuseControlsReadiness({ env, baseDir });

    expect(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY).toBe("");
    expect(env.TURNSTILE_SECRET_KEY).toBe("");
    expect(env.UPSTASH_REDIS_REST_URL).toBe("");
    expect(env.UPSTASH_REDIS_REST_TOKEN).toBe("");
    expect(result.decision).toBe("PRODUCTION ABUSE CONTROLS BLOCKED");
    expect(result.env.missing).toEqual([
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      "TURNSTILE_SECRET_KEY",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ]);
    expect(JSON.stringify(result)).not.toContain("turnstile-secret");
    expect(JSON.stringify(result)).not.toContain("upstash-token");
  });

  it("blocks insecure Upstash URLs and legacy lead-service regressions", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");

    const legacyService = path.join(baseDir, "src/services/lead.ts");
    fs.mkdirSync(path.dirname(legacyService), { recursive: true });
    fs.writeFileSync(
      legacyService,
      "export const legacy = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;\n",
    );

    const result = mod.evaluateAbuseControlsReadiness({
      env: { ...readyEnv, UPSTASH_REDIS_REST_URL: "http://upstash.local" },
      baseDir,
    });

    expect(result.decision).toBe("PRODUCTION ABUSE CONTROLS BLOCKED");
    expect(result.env.invalid).toContain("UPSTASH_REDIS_REST_URL must use HTTPS");
    expect(result.sourceContracts.ready).toBe(false);
    expect(result.sourceContracts.checks.find((check) => check.id === "legacy_lead_service_removed")).toMatchObject({
      status: "FAIL",
    });
  });
});
