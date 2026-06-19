import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type CommercialLaunchModule = {
  commercialLaunchGates: Array<{ id: string; env: string[]; evidence: string[] }>;
  evaluateCommercialLaunch: (args?: {
    env?: Record<string, string>;
    baseDir?: string;
  }) => {
    score: number;
    target: number;
    gateResults: Array<{
      id: string;
      ready: boolean;
      points: number;
      awardedPoints: number;
      label: string;
      env: string[];
      evidence: string[];
      missingEnv: string[];
      missingEvidence: Array<{ path: string; ready: boolean; reason: string }>;
    }>;
  };
};

type CutoverModule = {
  buildProductionCutoverPlan: (args?: {
    launchResult?: ReturnType<CommercialLaunchModule["evaluateCommercialLaunch"]>;
    vercelOpsResult?: {
      decision: string;
      warnings: Array<{ id: string; detail: string; remediation?: string }>;
    };
  }) => {
    decision: string;
    currentScore: number;
    targetScore: number;
    blockedPoints: number;
    vercelCliInstallCommand: string;
    nextGateOrder: string[];
    gateSteps: Array<{
      id: string;
      owner: string;
      timing: string;
      missingEnv: string[];
      commands: string[];
      checklist: string[];
      kpiAndReviewLoop: string;
    }>;
    finalVerificationCommands: string[];
  };
  formatProductionCutoverPlan: (plan: ReturnType<CutoverModule["buildProductionCutoverPlan"]>) => string;
};

async function loadAuditModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/commercial-launch-audit.mjs")).href
  )) as CommercialLaunchModule;
}

async function loadCutoverModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/production-cutover-plan.mjs")).href
  )) as CutoverModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "production-cutover-plan-"));
  tmpDirs.push(dir);
  return dir;
}

function writeEvidence(baseDir: string, relPath: string) {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(
    fullPath,
    [
      "# Evidence",
      "",
      "status: ready",
      "date: 2026-06-19",
      "owner: launch-qa",
      "source_refs: OPS-1234, UAT-5678",
      "",
      "## Summary",
      "Redacted operational evidence confirms this launch gate was validated in the source system.",
      "",
      "## Proof",
      "Ticket, screenshot and UAT references are stored outside the repository without secrets or PII.",
      "",
      "## Residual Risk",
      "No unresolved residual risk remains for this redacted test fixture.",
    ].join("\n"),
  );
}

function makeReadyEnv(audit: CommercialLaunchModule) {
  return Object.fromEntries(
    audit.commercialLaunchGates.flatMap((gate) =>
      gate.env.map((key) => [
        key,
        key === "NEXT_PUBLIC_SITE_URL"
          ? "https://kozbeylikonagi.com"
          : key === "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"
            ? "https://booking.kozbeylikonagi.com/search"
            : `live_${key}`,
      ]),
    ),
  );
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("production cutover plan", () => {
  it("turns blocked commercial gates into an ordered operator checklist", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const launchResult = audit.evaluateCommercialLaunch({ env: {}, baseDir: makeTmpDir() });
    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: {
        decision: "PASS_WITH_WARNINGS",
        warnings: [
          {
            id: "global_vercel_cli",
            detail: "Global Vercel CLI is not available on PATH.",
            remediation: "npm i -g vercel unlocks vercel env pull, vercel deploy and vercel logs.",
          },
        ],
      },
    });

    expect(plan.decision).toBe("CUTOVER_ACTION_REQUIRED");
    expect(plan.currentScore).toBe(82);
    expect(plan.blockedPoints).toBe(18);
    expect(plan.vercelCliInstallCommand).toBe("npm i -g vercel");
    expect(plan.nextGateOrder).toEqual([
      "canonical_domain",
      "production_abuse_controls",
      "hms_booking_engine",
      "garanti_pos",
      "analytics_purchase",
      "search_local_seo",
      "legal_dpa",
    ]);

    const canonical = plan.gateSteps.find((step) => step.id === "canonical_domain");
    expect(canonical?.owner).toBe("Vercel/DNS operator");
    expect(canonical?.missingEnv).toContain("NEXT_PUBLIC_SITE_URL");
    expect(canonical?.checklist).toContain(
      "Remove any HTTPS-to-HTTP first-hop redirect on kozbeylikonagi.com or www before marking the canonical gate ready.",
    );
    expect(canonical?.commands).toContain("npm run domain:verify:strict");
    expect(canonical?.commands).toContain("npm run launch:smoke:live");
    expect(canonical?.kpiAndReviewLoop).toContain("/api/health");

    const hms = plan.gateSteps.find((step) => step.id === "hms_booking_engine");
    expect(hms?.missingEnv).toEqual([]);
    expect(hms?.checklist).toContain(
      "Verify the public reservation CTA opens the approved HTTPS HMS engine in a new tab.",
    );
    expect(hms?.checklist).toContain(
      "Document date, guest, room/rate selection, fallback and modification/refund handling in redacted evidence.",
    );
    expect(hms?.commands).not.toContain("vercel env add NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL production");

    const formatted = cutover.formatProductionCutoverPlan(plan);
    expect(formatted).toContain("Kozbeyli Konagi production cutover plan");
    expect(formatted).toContain("Vercel CLI install: npm i -g vercel");
    expect(formatted).toContain("Final verification commands:");
  });

  it("does not leak env values while building the cutover plan", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {
        NEXT_PUBLIC_SITE_URL: "https://kozbeylikonagi.com",
        GARANTI_3D_STORE_KEY: "super-secret-store-key",
        GA4_API_SECRET: "ga4-secret-value",
      },
      baseDir: makeTmpDir(),
    });

    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const serialized = JSON.stringify(plan);
    expect(serialized).not.toContain("super-secret-store-key");
    expect(serialized).not.toContain("ga4-secret-value");
    expect(serialized).toContain("GARANTI_3D_STORE_KEY");
    expect(serialized).toContain("GA4_API_SECRET");
  });

  it("asks for HMS env repair only when an explicit override is invalid", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {
        NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL: "http://kozbeyli-invalid.invalid/search",
      },
      baseDir: makeTmpDir(),
    });

    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });
    const hms = plan.gateSteps.find((step) => step.id === "hms_booking_engine");

    expect(hms?.missingEnv).toEqual([
      "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL (expected HTTPS live booking engine URL)",
    ]);
    expect(hms?.checklist[0]).toBe(
      "Fix NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL in Vercel production so it is the approved HTTPS HMS URL, or remove the bad override to use the official code fallback.",
    );
    expect(hms?.commands).toContain("vercel env add NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL production");
  });

  it("reports ready only when every commercial launch gate is proven ready", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const launchResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    expect(plan.decision).toBe("READY_FOR_FULL_COMMERCIAL_LAUNCH");
    expect(plan.currentScore).toBe(100);
    expect(plan.blockedPoints).toBe(0);
    expect(plan.gateSteps).toEqual([]);
    expect(plan.finalVerificationCommands).toContain("npm run launch:audit:strict");
  });
});
