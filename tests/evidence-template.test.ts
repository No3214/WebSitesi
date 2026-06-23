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
    envAnyOf?: Array<{ keys: string[] }>;
  }>;
  evaluateCommercialLaunch: (args?: {
    env?: Record<string, string>;
    baseDir?: string;
    runtimeReadiness?: {
      status: string;
      ready: boolean;
      configuredGates: string[];
      blockedGates: string[];
      checks: Array<{
        id: string;
        ready: boolean;
        requiredCount: number;
        configuredCount: number;
        missingCount: number;
        invalidCount: number;
        placeholderCount: number;
        fallbackApplied: boolean;
        configurationSource: string;
      }>;
    };
    runtimeSource?: string;
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
      envSetup?: {
        provider: string;
        environment: string;
        dashboardPath: string;
        envNames: string[];
        cliInstallCommand: string;
        cliAuthCommands: string[];
        cliCommands: string[];
        manualChecklist: string[];
      };
      runtimeStatusText: string;
      runtimeAction: string;
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

function makeRuntimeReadinessFixture() {
  return {
    status: "blocked",
    ready: false,
    configuredGates: ["hms_booking_engine"],
    blockedGates: ["production_abuse_controls"],
    checks: [
      {
        id: "hms_booking_engine",
        ready: true,
        requiredCount: 1,
        configuredCount: 1,
        missingCount: 0,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
        configurationSource: "env",
      },
      {
        id: "production_abuse_controls",
        ready: false,
        requiredCount: 4,
        configuredCount: 0,
        missingCount: 4,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
        configurationSource: "missing",
      },
    ],
  };
}

function makeRuntimeReadyEvidenceFixture() {
  return {
    status: "blocked",
    ready: false,
    configuredGates: ["production_database", "hms_booking_engine"],
    blockedGates: ["production_abuse_controls"],
    checks: [
      {
        id: "production_database",
        ready: true,
        requiredCount: 2,
        configuredCount: 2,
        missingCount: 0,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
        configurationSource: "env",
      },
      {
        id: "hms_booking_engine",
        ready: true,
        requiredCount: 1,
        configuredCount: 1,
        missingCount: 0,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
        configurationSource: "env",
      },
      {
        id: "production_abuse_controls",
        ready: false,
        requiredCount: 4,
        configuredCount: 0,
        missingCount: 4,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
        configurationSource: "missing",
      },
    ],
  };
}

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
    expect(formatted).toContain("## Runtime Status");
    expect(formatted).toContain("Not checked in this template run");
    expect(formatted).toContain("## Guest-Facing Copy / Fallback");
    expect(formatted).toContain("Do not commit secrets");
    expect(formatted).toContain("previous 45 days");
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

  it("adds live runtime context to focused evidence templates", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const templates = await loadTemplateModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {},
      baseDir: makeTmpDir(),
      runtimeReadiness: makeRuntimeReadinessFixture(),
      runtimeSource: "https://www.kozbeylikonagi.com/api/health",
    });
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

    expect(hms.runtimeStatusText).toContain("https://www.kozbeylikonagi.com/api/health: ready");
    expect(hms.runtimeAction).toContain("Production runtime reports this gate configured");
    expect(formatted).toContain("## Runtime Status");
    expect(formatted).toContain("Production runtime reports this gate configured");
    expect(formatted).not.toContain("postgresql://");
  });

  it("does not ask operators to re-add env values when runtime-ready gates only need evidence", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const templates = await loadTemplateModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {},
      baseDir: makeTmpDir(),
      runtimeReadiness: makeRuntimeReadyEvidenceFixture(),
      runtimeSource: "https://www.kozbeylikonagi.com/api/health",
    });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const result = templates.buildEvidenceTemplates({
      launchResult,
      cutoverPlan,
      gateId: "production_database",
    });
    const database = result.templates[0];
    const serialized = JSON.stringify(result);
    const formatted = templates.formatEvidenceTemplates(result);

    expect(result.templates).toHaveLength(1);
    expect(database.runtimeStatusText).toContain("https://www.kozbeylikonagi.com/api/health: ready");
    expect(database.runtimeAction).toContain("Production runtime reports this gate configured");
    expect(database.commands).toEqual(
      expect.arrayContaining(["npm run evidence:handoff:live", "npm run launch:audit:live"]),
    );
    expect(database.commands).not.toContain("vercel env add DATABASE_URI production");
    expect(database.commands).not.toContain("vercel env add PAYLOAD_SECRET production");
    expect(serialized).not.toContain("vercel env add DATABASE_URI production");
    expect(serialized).not.toContain("vercel env add PAYLOAD_SECRET production");
    expect(formatted).toContain("Production runtime reports this gate configured");
    expect(formatted).toContain("npm run evidence:handoff:live");
    expect(formatted).not.toContain("vercel env add DATABASE_URI production");
  });

  it("narrows partial analytics environment guidance to the actual missing secret", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const templates = await loadTemplateModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {
        NEXT_PUBLIC_GTM_ID: "GTM-KCG6B4MJ",
        NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-V3R66C3MEF",
        NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-800024713",
        NEXT_PUBLIC_META_PIXEL_ID: "1781546559309505",
        GA4_MEASUREMENT_ID: "G-V3R66C3MEF",
      },
      baseDir: makeTmpDir(),
    });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const result = templates.buildEvidenceTemplates({
      launchResult,
      cutoverPlan,
      gateId: "analytics_purchase",
    });
    const analytics = result.templates[0];
    const serialized = JSON.stringify(result);
    const formatted = templates.formatEvidenceTemplates(result);

    expect(result.templates).toHaveLength(1);
    expect(analytics).toMatchObject({
      gateId: "analytics_purchase",
      envSetup: {
        provider: "Vercel",
        environment: "Production",
        envNames: ["GA4_API_SECRET"],
        cliCommands: ["vercel env add GA4_API_SECRET production"],
      },
      commands: ["vercel env add GA4_API_SECRET production", "npm run launch:audit"],
    });
    expect(analytics.envSetup?.manualChecklist.join(" ")).toContain(
      "Add or update only these Production env names: GA4_API_SECRET",
    );
    expect(formatted).toContain("## Environment Setup");
    expect(formatted).toContain("Vercel Dashboard > kozbeyli-konagi > Settings > Environment Variables");
    expect(formatted).toContain("Env names: GA4_API_SECRET");
    expect(serialized).not.toContain("vercel env add NEXT_PUBLIC_GTM_ID production");
    expect(serialized).not.toContain("vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production");
    expect(serialized).not.toContain("vercel env add NEXT_PUBLIC_META_PIXEL_ID production");
    expect(serialized).not.toContain("vercel env add GA4_MEASUREMENT_ID production");
  });
});
