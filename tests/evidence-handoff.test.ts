import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type CommercialLaunchModule = {
  commercialLaunchGates: Array<{
    id: string;
    env: string[];
    envAnyOf?: Array<{ keys: string[]; label: string }>;
    evidence: string[];
  }>;
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
      missingEnv: string[];
      missingEvidence: Array<{
        path: string;
        ready: boolean;
        reason: string;
        redactionFindingCount?: number;
        redactionCategories?: string[];
      }>;
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
    blockedPoints: number;
    gateSteps: Array<{
      id: string;
      owner: string;
      timing: string;
      commands: string[];
      kpiAndReviewLoop: string;
    }>;
    finalVerificationCommands: string[];
  };
};

type EvidenceHandoffModule = {
  buildEvidenceHandoff: (args?: {
    launchResult?: ReturnType<CommercialLaunchModule["evaluateCommercialLaunch"]>;
    cutoverPlan?: ReturnType<CutoverModule["buildProductionCutoverPlan"]>;
  }) => {
    decision: string;
    currentScore: number;
    targetScore: number;
    blockedPoints: number;
    files: Array<{
      path: string;
      gateId: string;
      reason: string;
      pointsBlocked: number;
      owner: string;
      timing: string;
      missingEnv: string[];
      commands: string[];
      redactionFindingCount: number;
      redactionCategories: string[];
      redactionSummary: string;
      redactionAction: string;
      requiredSections: string[];
      sourceRefsPolicy: string;
    }>;
    safeEvidenceRules: string[];
    requiredSections: string[];
    finalVerificationCommands: string[];
  };
  formatEvidenceHandoff: (
    result: ReturnType<EvidenceHandoffModule["buildEvidenceHandoff"]>,
  ) => string;
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

async function loadHandoffModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/evidence-handoff.mjs")).href
  )) as EvidenceHandoffModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "evidence-handoff-"));
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
      "date: 2026-06-21",
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
      [
        ...gate.env,
        ...(gate.envAnyOf ?? []).map((group) => group.keys[0]),
      ].map((key) => [
        key,
        key === "NEXT_PUBLIC_SITE_URL"
          ? "https://kozbeylikonagi.com"
          : key === "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"
            ? "https://kozbeyli-konagi.hmshotel.net/bv3/search"
            : key === "NEXT_PUBLIC_GTM_ID"
              ? "GTM-ABCDE1"
              : key === "NEXT_PUBLIC_GA4_MEASUREMENT_ID" || key === "GA4_MEASUREMENT_ID"
                ? "G-ABCDE12345"
                : key === "NEXT_PUBLIC_GOOGLE_ADS_ID"
                  ? "AW-800024713"
                  : key === "DATABASE_URI"
                    ? "postgresql://postgres:password@db.supabase.co:6543/postgres"
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

describe("evidence handoff", () => {
  it("turns blocked evidence into a safe operator handoff", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const handoff = await loadHandoffModule();
    const launchResult = audit.evaluateCommercialLaunch({ env: {}, baseDir: makeTmpDir() });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS_WITH_WARNINGS", warnings: [] },
    });
    const result = handoff.buildEvidenceHandoff({ launchResult, cutoverPlan });

    expect(result.decision).toBe("EVIDENCE_HANDOFF_ACTION_REQUIRED");
    expect(result.currentScore).toBe(80);
    expect(result.blockedPoints).toBe(20);
    expect(result.files).toHaveLength(8);

    const canonical = result.files.find((file) => file.path === "docs/evidence/canonical-domain.md");
    expect(canonical).toMatchObject({
      gateId: "canonical_domain",
      reason: "missing",
      pointsBlocked: 2,
      owner: "Vercel/DNS operator",
      timing: "Before public domain announcement",
    });
    expect(canonical?.missingEnv).toEqual(["NEXT_PUBLIC_SITE_URL"]);
    expect(canonical?.commands).toEqual(
      expect.arrayContaining(["npm run domain:verify:strict", "npm run launch:smoke:live"]),
    );
    expect(canonical?.requiredSections).toContain("source_refs: <redacted-source-ids>");
    expect(canonical?.sourceRefsPolicy).toContain("never raw credentials");
    expect(canonical?.sourceRefsPolicy).toContain("database URLs");
    expect(canonical?.sourceRefsPolicy).toContain("access tokens");

    const database = result.files.find((file) => file.path === "docs/evidence/production-database.md");
    expect(database).toMatchObject({
      gateId: "production_database",
      reason: "missing",
      pointsBlocked: 2,
      owner: "Platform / CMS operator",
    });
    expect(database?.missingEnv).toEqual(["DATABASE_URI", "PAYLOAD_SECRET"]);

    const hms = result.files.find((file) => file.path === "docs/evidence/hms-booking-engine.md");
    expect(hms?.missingEnv).toEqual([]);
    expect(hms?.commands).toContain("npm run hms:verify:strict");
    expect(result.safeEvidenceRules.join(" ")).toContain("Do not commit secrets");
    expect(result.safeEvidenceRules.join(" ")).toContain("database URLs");
    expect(result.safeEvidenceRules.join(" ")).toContain("JWT/access tokens");
    expect(result.safeEvidenceRules.join(" ")).toContain("service-role keys");
    expect(result.safeEvidenceRules.join(" ")).toContain("raw callback/log dumps");
    expect(JSON.stringify(result)).not.toContain("super-secret-value");
  });

  it("reports ready when all evidence and safe env keys are present", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const handoff = await loadHandoffModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const launchResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });
    const result = handoff.buildEvidenceHandoff({ launchResult, cutoverPlan });

    expect(result.decision).toBe("EVIDENCE_HANDOFF_READY");
    expect(result.currentScore).toBe(100);
    expect(result.files).toEqual([]);
    expect(result.finalVerificationCommands).toContain("npm run release:verify");
    expect(result.finalVerificationCommands).toContain("npm run release:verify:commercial");
  });

  it("carries redaction findings into the safe operator handoff", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const handoff = await loadHandoffModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const garantiPath = path.join(baseDir, "docs/evidence/garanti-pos.md");
    fs.writeFileSync(
      garantiPath,
      [
        fs.readFileSync(garantiPath, "utf8"),
        `masked regression fixture: 4242 ${"4242"} 4242 4242`,
      ].join("\n"),
    );

    const launchResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });
    const result = handoff.buildEvidenceHandoff({ launchResult, cutoverPlan });
    const garanti = result.files.find((file) => file.path === "docs/evidence/garanti-pos.md");
    const formatted = handoff.formatEvidenceHandoff(result);

    expect(result.decision).toBe("EVIDENCE_HANDOFF_ACTION_REQUIRED");
    expect(garanti).toMatchObject({
      gateId: "garanti_pos",
      reason: "redaction findings",
      redactionFindingCount: 1,
      redactionCategories: ["payment_card"],
      redactionSummary: "redaction categories: payment_card; count: 1",
    });
    expect(garanti?.redactionAction).toContain("npm run evidence:scan");
    expect(garanti?.redactionAction).toContain("npm run launch:audit");
    expect(formatted).toContain("redaction: redaction categories: payment_card; count: 1");
    expect(formatted).toContain("redaction action:");
    expect(JSON.stringify(result)).not.toContain("4242");
    expect(formatted).not.toContain("4242");
  });

  it("formats a readable handoff for non-technical owners", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const handoff = await loadHandoffModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: { GA4_API_SECRET: "super-secret-value" },
      baseDir: makeTmpDir(),
    });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS_WITH_WARNINGS", warnings: [] },
    });
    const text = handoff.formatEvidenceHandoff(
      handoff.buildEvidenceHandoff({ launchResult, cutoverPlan }),
    );

    expect(text).toContain("Kozbeyli Konagi evidence handoff");
    expect(text).toContain("Required safe evidence rules");
    expect(text).toContain("database URLs");
    expect(text).toContain("JWT/access tokens");
    expect(text).toContain("docs/evidence/hms-booking-engine.md");
    expect(text).toContain("missing env names:");
    expect(text).not.toContain("super-secret-value");
  });
});
