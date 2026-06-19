import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type AnalyticsReadinessModule = {
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
  "src/app/api/webhook/hotelrunner/route.ts",
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
      "GTM, GA4 Measurement Protocol and Meta Event Manager proof lives outside the repo.",
      "",
      "## Residual Risk",
      "No API secrets, visitor PII or raw event payloads are stored in this fixture.",
    ].join("\n"),
  );
}

const readyEnv = {
  NEXT_PUBLIC_GTM_ID: "GTM-ABCDE1",
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
  it("keeps current source contracts passing while production analytics evidence is pending", async () => {
    const mod = await loadModule();
    const result = mod.evaluateAnalyticsReadiness({ env: {}, baseDir: root });

    expect(result.decision).toBe("ANALYTICS PURCHASE TRACKING BLOCKED");
    expect(result.env).toMatchObject({
      configuredCount: 0,
      missing: [
        "NEXT_PUBLIC_GTM_ID",
        "NEXT_PUBLIC_META_PIXEL_ID",
        "GA4_MEASUREMENT_ID",
        "GA4_API_SECRET",
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
    ]);
    expect(result.sourceContracts.ready).toBe(false);
    expect(result.sourceContracts.checks.find((check) => check.id === "meta_legacy_key_removed")).toMatchObject({
      status: "FAIL",
    });
  });
});
