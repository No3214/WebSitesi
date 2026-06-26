import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type AnalyticsReadinessModule = {
  parseEnvFile: (source: string) => Record<string, string>;
  loadEnvFileSnapshot: (envFile: string, baseEnv?: Record<string, string>) => Record<string, string>;
  loadProcessEnvSnapshot: (source?: Record<string, string | undefined>) => Record<string, string>;
  evaluateAnalyticsReadiness: (args?: {
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
  "src/app/layout.tsx",
  "src/components/tracking-scripts.tsx",
  "src/lib/gtm.ts",
  "src/lib/ga4-server.ts",
  "src/components/lead-form.tsx",
  "src/components/hms-booking-embed.tsx",
  "src/components/room-view-tracker.tsx",
  "src/lib/public-env.ts",
  ".env.example",
];

async function loadModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/analytics-readiness.mjs")).href
  )) as AnalyticsReadinessModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "analytics-readiness-"));
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
  const fullPath = path.join(baseDir, "docs/evidence/analytics-purchase.md");
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(
    fullPath,
    [
      "# Evidence: Analytics Purchase Tracking",
      "",
      `status: ${status}`,
      "date: 2026-06-19",
      "owner: growth-ops",
      "source_refs: GTM-UAT-123, GA4-MP-456, META-789",
      "",
      "## Summary",
      "Redacted source-system references prove consent-gated analytics and purchase tracking.",
      "",
      "## Proof",
      "GTM, GA4 Measurement Protocol purchase and Meta Event Manager proof lives outside the repo.",
      "Consent-gated consent behavior was validated before consent and test traffic is filtered/labeled in analytics dashboards.",
      "",
      "## Residual Risk",
      "No API secrets, visitor PII or raw event payloads are stored in this fixture.",
    ].join("\n"),
  );
}

const readyEnv = {
  NEXT_PUBLIC_GTM_ID: "GTM-ABCDE1",
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-ABCDE12345",
  NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-800024713",
  NEXT_PUBLIC_META_PIXEL_ID: "123456789012",
  GA4_MEASUREMENT_ID: "G-ABCDE12345",
  GA4_API_SECRET: "ga4-secret",
};

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("analytics purchase readiness", () => {
  it("parses pulled env files and keeps empty analytics values authoritative", async () => {
    const mod = await loadModule();
    const parsed = mod.parseEnvFile(
      [
        "NEXT_PUBLIC_META_PIXEL_ID=",
        "NEXT_PUBLIC_GOOGLE_ADS_ID=AW-800024713",
        'GA4_MEASUREMENT_ID=""',
        "GA4_API_SECRET=''",
        "NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-V3R66C3MEF",
      ].join("\n"),
    );

    expect(parsed).toEqual({
      NEXT_PUBLIC_META_PIXEL_ID: "",
      NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-800024713",
      GA4_MEASUREMENT_ID: "",
      GA4_API_SECRET: "",
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-V3R66C3MEF",
    });
  });

  it("keeps current source contracts passing while production analytics evidence is pending", async () => {
    const mod = await loadModule();
    const result = mod.evaluateAnalyticsReadiness({ env: {}, baseDir: root });

    expect(result.decision).toBe("ANALYTICS PURCHASE TRACKING BLOCKED");
    expect(result.env).toMatchObject({
      configuredCount: 0,
      missing: [
        "NEXT_PUBLIC_META_PIXEL_ID",
        "NEXT_PUBLIC_GOOGLE_ADS_ID",
        "GA4_MEASUREMENT_ID",
        "GA4_API_SECRET",
        "NEXT_PUBLIC_GTM_ID or NEXT_PUBLIC_GA4_MEASUREMENT_ID",
      ],
      ready: false,
    });
    expect(result.evidence.missingEvidence).toEqual([
      {
        path: "docs/evidence/analytics-purchase.md",
        ready: false,
        reason: "pending status",
      },
    ]);
    expect(result.sourceContracts.ready).toBe(true);
    expect(result.sourceContracts.checks.every((check) => check.status === "PASS")).toBe(true);
  });

  it("passes only when env, source contracts and redacted analytics evidence are ready", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");

    const result = mod.evaluateAnalyticsReadiness({ env: readyEnv, baseDir });

    expect(result.decision).toBe("ANALYTICS PURCHASE TRACKING PASS");
    expect(result.env.ready).toBe(true);
    expect(result.evidence.ready).toBe(true);
    expect(result.sourceContracts.ready).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("uses a pulled Vercel env file over local fallback analytics values", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");
    const envFile = path.join(baseDir, "vercel-production.env");
    fs.writeFileSync(
      envFile,
      [
        "NEXT_PUBLIC_GTM_ID=",
        "NEXT_PUBLIC_GA4_MEASUREMENT_ID=",
        "NEXT_PUBLIC_GOOGLE_ADS_ID=",
        "NEXT_PUBLIC_META_PIXEL_ID=",
        "GA4_MEASUREMENT_ID=",
        "GA4_API_SECRET=",
      ].join("\n"),
    );

    const env = mod.loadEnvFileSnapshot(envFile, readyEnv);
    const result = mod.evaluateAnalyticsReadiness({ env, baseDir });

    expect(env.NEXT_PUBLIC_GTM_ID).toBe("");
    expect(env.NEXT_PUBLIC_GA4_MEASUREMENT_ID).toBe("");
    expect(env.NEXT_PUBLIC_GOOGLE_ADS_ID).toBe("");
    expect(env.NEXT_PUBLIC_META_PIXEL_ID).toBe("");
    expect(env.GA4_MEASUREMENT_ID).toBe("");
    expect(env.GA4_API_SECRET).toBe("");
    expect(result.decision).toBe("ANALYTICS PURCHASE TRACKING BLOCKED");
    expect(result.env.missing).toEqual([
      "NEXT_PUBLIC_META_PIXEL_ID",
      "NEXT_PUBLIC_GOOGLE_ADS_ID",
      "GA4_MEASUREMENT_ID",
      "GA4_API_SECRET",
      "NEXT_PUBLIC_GTM_ID or NEXT_PUBLIC_GA4_MEASUREMENT_ID",
    ]);
    expect(JSON.stringify(result)).not.toContain("ga4-secret");
    expect(JSON.stringify(result)).not.toContain("GTM-ABCDE1");
  });

  it("uses process env snapshots as authoritative for Vercel env run checks", async () => {
    const mod = await loadModule();
    const env = mod.loadProcessEnvSnapshot({
      NEXT_PUBLIC_GTM_ID: "",
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: "",
      NEXT_PUBLIC_GOOGLE_ADS_ID: "",
      NEXT_PUBLIC_META_PIXEL_ID: "",
      GA4_MEASUREMENT_ID: "",
      GA4_API_SECRET: "",
      IGNORED_UNDEFINED: undefined,
    });

    expect(env).toEqual({
      NEXT_PUBLIC_GTM_ID: "",
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: "",
      NEXT_PUBLIC_GOOGLE_ADS_ID: "",
      NEXT_PUBLIC_META_PIXEL_ID: "",
      GA4_MEASUREMENT_ID: "",
      GA4_API_SECRET: "",
    });
  });

  it("blocks invalid IDs and legacy Facebook pixel env aliases", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");

    const envExample = path.join(baseDir, ".env.example");
    fs.appendFileSync(envExample, "\nNEXT_PUBLIC_FB_PIXEL_ID=legacy\n");

    const result = mod.evaluateAnalyticsReadiness({
      env: {
        ...readyEnv,
        NEXT_PUBLIC_GTM_ID: "G-LOOKS-LIKE-GA",
        NEXT_PUBLIC_GA4_MEASUREMENT_ID: "UA-ALSO-OLD",
        NEXT_PUBLIC_GOOGLE_ADS_ID: "274214371",
        NEXT_PUBLIC_META_PIXEL_ID: "pixel-abc",
        GA4_MEASUREMENT_ID: "UA-OLD",
      },
      baseDir,
    });

    expect(result.decision).toBe("ANALYTICS PURCHASE TRACKING BLOCKED");
    expect(result.env.invalid).toEqual([
      "NEXT_PUBLIC_GTM_ID must look like GTM-XXXX",
      "NEXT_PUBLIC_META_PIXEL_ID must be the numeric Meta Pixel ID",
      "GA4_MEASUREMENT_ID must look like G-XXXX",
      "NEXT_PUBLIC_GA4_MEASUREMENT_ID must look like G-XXXX",
      "NEXT_PUBLIC_GOOGLE_ADS_ID must look like AW-XXXXXXXXX",
    ]);
    expect(result.sourceContracts.ready).toBe(false);
    expect(result.sourceContracts.checks.find((check) => check.id === "meta_legacy_key_removed")).toMatchObject({
      status: "FAIL",
    });
  });
});
