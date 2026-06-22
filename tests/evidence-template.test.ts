import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type CommercialLaunchModule = {
  evaluateCommercialLaunch: (args?: {
    env?: Record<string, string>;
    baseDir?: string;
  }) => {
    score: number;
    target: number;
    gateResults: Array<{ id: string; ready: boolean }>;
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
    gateSteps: Array<{ id: string }>;
  };
};

type EvidenceTemplateModule = {
  buildEvidenceTemplates: (args?: {
    launchResult?: ReturnType<CommercialLaunchModule["evaluateCommercialLaunch"]>;
    cutoverPlan?: ReturnType<CutoverModule["buildProductionCutoverPlan"]>;
    gateId?: string;
    includeAll?: boolean;
  }) => {
    decision: string;
    currentScore: number;
    targetScore: number;
    templates: Array<{
      path: string;
      gateId: string;
      owner: string;
      timing: string;
      requiredProofSignals: string[];
      guestFacingCopy: string;
      commands: string[];
      safeEvidenceRules: string[];
    }>;
  };
  formatEvidenceTemplates: (
    result: ReturnType<EvidenceTemplateModule["buildEvidenceTemplates"]>,
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

async function loadTemplateModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/evidence-template.mjs")).href
  )) as EvidenceTemplateModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "evidence-template-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("evidence templates", () => {
  it("builds safe pending templates for every blocked commercial evidence file", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const templates = await loadTemplateModule();
    const launchResult = audit.evaluateCommercialLaunch({ env: {}, baseDir: makeTmpDir() });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const result = templates.buildEvidenceTemplates({ launchResult, cutoverPlan });
    const formatted = templates.formatEvidenceTemplates(result);

    expect(result.decision).toBe("EVIDENCE_TEMPLATES_READY");
    expect(result.currentScore).toBe(80);
    expect(result.templates).toHaveLength(8);
    expect(formatted).toContain("status: pending");
    expect(formatted).toContain("## Operational Goal");
    expect(formatted).toContain("## SOP / Checklist");
    expect(formatted).toContain("## Required Proof Signals");
    expect(formatted).toContain("## Guest-Facing Copy / Fallback");
    expect(formatted).toContain("Do not commit secrets");
    expect(formatted).toContain("database URLs");
    expect(formatted).toContain("card data");
    expect(formatted).toContain("bank account details");
    expect(formatted).not.toContain("status: ready");
    expect(formatted).not.toContain("super-secret-value");
  });

  it("can focus one gate while preserving that gate's proof signals and commands", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const templates = await loadTemplateModule();
    const launchResult = audit.evaluateCommercialLaunch({ env: {}, baseDir: makeTmpDir() });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const result = templates.buildEvidenceTemplates({
      launchResult,
      cutoverPlan,
      gateId: "hms_booking_engine",
    });
    const hms = result.templates[0];
    const formatted = templates.formatEvidenceTemplates(result);

    expect(result.templates).toHaveLength(1);
    expect(hms.path).toBe("docs/evidence/hms-booking-engine.md");
    expect(hms.requiredProofSignals).toEqual(
      expect.arrayContaining([
        "approved HMS host proof",
        "new-tab CTA proof",
        "live booking UAT proof",
        "cancellation refund modification proof",
        "room or rate sync ownership proof",
      ]),
    );
    expect(hms.commands).toContain("npm run hms:verify:strict");
    expect(hms.guestFacingCopy).toContain("Rezervasyon motoru");
    expect(formatted).toContain("Gate filter: hms_booking_engine");
  });
});
