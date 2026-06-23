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
    gateResults: Array<{
      id: string;
      ready: boolean;
      points: number;
      awardedPoints: number;
      label: string;
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
      checks?: Array<{ id: string; status: string; detail: string; remediation?: string }>;
      failures?: Array<{ id: string; detail: string; remediation?: string }>;
    };
  }) => {
    currentScore: number;
    targetScore: number;
    blockedPoints: number;
    gateSteps: Array<{
      id: string;
      pointsBlocked: number;
      owner: string;
      timing: string;
      operationalGoal: string;
      envDiagnostics: {
        source: string;
        requiredCount: number;
        configuredCount: number;
        missingCount: number;
        invalidCount: number;
        placeholderCount: number;
        fallbackApplied: boolean;
      };
      runtimeDiagnostics?: {
        source: string;
        status: string;
        ready: boolean;
        configurationSource: string;
        requiredCount: number;
        configuredCount: number;
        missingCount: number;
        invalidCount: number;
        placeholderCount: number;
        fallbackApplied: boolean;
      };
      missingEnv: string[];
      missingEvidence: Array<{ path: string; ready: boolean; reason: string }>;
      checklist: string[];
      commands: string[];
      evidence: string[];
      kpiAndReviewLoop: string;
    }>;
    finalVerificationCommands: string[];
  };
};

type LaunchStandupModule = {
  buildLaunchStandup: (args?: {
    launchResult?: ReturnType<CommercialLaunchModule["evaluateCommercialLaunch"]>;
    cutoverPlan?: ReturnType<CutoverModule["buildProductionCutoverPlan"]>;
  }) => {
    decision: string;
    currentScore: number;
    targetScore: number;
    blockedPoints: number;
    nextGate: null | {
      id: string;
      owner: string;
      pointsBlocked: number;
      timing: string;
      nextAction: string;
      nextCommand: string;
      verificationCommand: string;
      evidencePaths: string[];
      runtimeReady?: boolean;
      runtimeStatus?: string;
    };
    lanes: {
      envBlockedCount: number;
      evidenceBlockedCount: number;
      codeCoveredEvidenceOnlyCount: number;
      runtimeCoveredEvidenceCount: number;
      envBlockedGates: string[];
      evidenceBlockedGates: string[];
      codeCoveredEvidenceOnlyGates: string[];
      runtimeCoveredEvidenceGates: string[];
    };
    ownerQueues: Array<{
      owner: string;
      totalBlockedPoints: number;
      nextAction: string;
      nextCommand: string;
      gates: Array<{
        id: string;
        pointsBlocked: number;
        envBlocked: boolean;
        evidenceBlocked: boolean;
        runtimeReady?: boolean;
        runtimeStatus?: string;
        verificationCommand: string;
        evidencePaths: string[];
      }>;
    }>;
    blockedGates: Array<{
      id: string;
      rank: number;
      owner: string;
      envBlocked: boolean;
      evidenceBlocked: boolean;
      missingEnv: string[];
      evidencePaths: string[];
      nextAction: string;
      nextCommand: string;
      verificationCommand: string;
      runtimeDiagnostics?: {
        source: string;
        status: string;
        ready: boolean;
        configurationSource: string;
        requiredCount: number;
        configuredCount: number;
        missingCount: number;
        invalidCount: number;
        placeholderCount: number;
        fallbackApplied: boolean;
      };
    }>;
    finalVerificationCommands: string[];
  };
  formatLaunchStandup: (result: ReturnType<LaunchStandupModule["buildLaunchStandup"]>) => string;
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

async function loadStandupModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/launch-standup.mjs")).href
  )) as LaunchStandupModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "launch-standup-"));
  tmpDirs.push(dir);
  return dir;
}

function evidenceProofText(relPath: string) {
  const proofByPath: Record<string, string[]> = {
    "docs/evidence/canonical-domain.md": [
      "The current production deployment commit is verified through /api/health with service: \"kozbeyli-konagi\".",
      "The approved opening hero video /videos/hero.mp4 is visible on apex and www.",
      "Vercel DNS and secure redirect behavior are verified for the canonical domain.",
    ],
    "docs/evidence/production-database.md": [
      "Managed Supabase Postgres pooler DATABASE_URI and pooling mode are verified.",
      "PAYLOAD_SECRET is stored as a strong secret in production.",
      "Backup/PITR restore policy is confirmed.",
      "Restricted dashboard MFA access is confirmed for the database operator.",
      "Payload admin and lead persistence UAT completed without repository PII.",
    ],
    "docs/evidence/production-abuse-controls.md": [
      "Cloudflare Turnstile production keys are validated.",
      "Upstash Redis REST provides shared rate-limit and shared replay checks.",
      "A successful human lead submission is recorded.",
      "A blocked missing/invalid Turnstile token request is recorded.",
      "rateLimitBackend() reports upstash in production.",
    ],
    "docs/evidence/hms-booking-engine.md": [
      "The approved HTTPS HMS host kozbeyli-konagi.hmshotel.net is used.",
      "/rezervasyon and /en/rezervasyon CTAs open in a new tab.",
      "Live booking UAT covers date, guest, room and rate selection.",
      "Cancellation, refund and modification handling is confirmed.",
      "Room/rate availability sync and stale stock ownership are documented.",
    ],
    "docs/evidence/garanti-pos.md": [
      "GARANTI_POS_MODE and required POS environment names are configured in the source system.",
      "Successful 3D Secure payment proof is referenced.",
      "Failed/declined payment proof is referenced.",
      "Callback webhook signature verification is confirmed.",
      "Refund cancel handling is documented.",
    ],
    "docs/evidence/analytics-purchase.md": [
      "Production GTM, GA4, Google Ads and Meta Pixel IDs are verified.",
      "Consent mode and consent-gated behavior are validated before consent.",
      "GA4 Measurement Protocol sends server-side purchase booking_complete proof.",
      "Meta Event Manager production event proof is referenced.",
      "Test traffic is labeled and filtered.",
    ],
    "docs/evidence/search-local-seo.md": [
      "Search Console ownership and GOOGLE_SITE_VERIFICATION are confirmed.",
      "Production sitemap submitted and accepted.",
      "Google Business Profile ownership is verified.",
      "Google Hotel Center free booking links and hotel distribution are reviewed.",
    ],
    "docs/evidence/legal-dpa.md": [
      "Vendor DPA data-processing review is approved.",
      "KVKK cross-border transfer review is complete.",
      "Cookie tracking vendor inventory and consent behavior are approved.",
      "Cancellation payment refund and event proposal terms are approved.",
      "Final approval owner and date are recorded.",
    ],
  };

  return proofByPath[relPath] ?? [
    "Redacted operational evidence confirms this launch gate was validated in the source system.",
  ];
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
      "date: 2026-06-23",
      "owner: launch-qa",
      "source_refs: OPS-1234, UAT-5678",
      "",
      "## Summary",
      "Redacted operational evidence confirms this launch gate was validated in the source system.",
      "",
      "## Proof",
      ...evidenceProofText(relPath),
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
          : key === "DATABASE_URI"
            ? "postgresql://postgres:password@db.supabase.co:6543/postgres"
            : key === "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"
              ? "https://kozbeyli-konagi.hmshotel.net/bv3/search"
              : key === "NEXT_PUBLIC_GTM_ID"
                ? "GTM-ABCDE1"
                : key === "NEXT_PUBLIC_GA4_MEASUREMENT_ID" || key === "GA4_MEASUREMENT_ID"
                  ? "G-ABCDE12345"
                  : key === "NEXT_PUBLIC_GOOGLE_ADS_ID"
                    ? "AW-800024713"
                    : `live_${key}`,
      ]),
    ),
  );
}

function makeRuntimeReadinessFixture() {
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
    ],
  };
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("launch standup", () => {
  it("turns cutover blockers into a daily owner queue", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const standup = await loadStandupModule();
    const launchResult = audit.evaluateCommercialLaunch({ env: {}, baseDir: makeTmpDir() });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const result = standup.buildLaunchStandup({ launchResult, cutoverPlan });

    expect(result.decision).toBe("LAUNCH_STANDUP_ACTION_REQUIRED");
    expect(result.currentScore).toBe(80);
    expect(result.blockedPoints).toBe(20);
    expect(result.nextGate).toMatchObject({
      id: "canonical_domain",
      owner: "Vercel/DNS operator",
      pointsBlocked: 2,
    });
    expect(result.nextGate?.nextAction).toContain("Attach kozbeylikonagi.com");
    expect(result.nextGate?.nextCommand).toBe("vercel env pull");
    expect(result.nextGate?.verificationCommand).toBe("npm run launch:smoke:live");
    expect(result.lanes.envBlockedGates).toContain("canonical_domain");
    expect(result.lanes.evidenceBlockedGates).toContain("hms_booking_engine");
    expect(result.lanes.codeCoveredEvidenceOnlyGates).toContain("hms_booking_engine");

    const revenue = result.ownerQueues.find((queue) => queue.owner === "Revenue / booking operator");
    expect(revenue).toMatchObject({
      totalBlockedPoints: 4,
      nextCommand: "npm run hms:verify:strict",
    });
    expect(revenue?.gates[0]).toMatchObject({
      id: "hms_booking_engine",
      envBlocked: false,
      evidenceBlocked: true,
    });

    const formatted = standup.formatLaunchStandup(result);
    expect(formatted).toContain("Kozbeyli Konagi launch standup");
    expect(formatted).toContain("Owner queues:");
    expect(formatted).toContain("code-covered evidence-only");
    expect(formatted).toContain("Final verification commands:");
  });

  it("does not leak secret env values into JSON or formatted output", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const standup = await loadStandupModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {
        DATABASE_URI: "postgresql://postgres:super-secret-password@db.supabase.co:6543/postgres",
        PAYLOAD_SECRET: "super-secret-payload-key",
        GA4_API_SECRET: "ga4-secret-value",
      },
      baseDir: makeTmpDir(),
    });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const result = standup.buildLaunchStandup({ launchResult, cutoverPlan });
    const serialized = JSON.stringify(result);
    const formatted = standup.formatLaunchStandup(result);

    expect(serialized).not.toContain("super-secret-password");
    expect(serialized).not.toContain("super-secret-payload-key");
    expect(serialized).not.toContain("ga4-secret-value");
    expect(formatted).not.toContain("super-secret-password");
    expect(formatted).not.toContain("super-secret-payload-key");
    expect(formatted).not.toContain("ga4-secret-value");
    expect(serialized).toContain("NEXT_PUBLIC_META_PIXEL_ID");
  });

  it("prioritizes evidence handoff when production runtime is already configured", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const standup = await loadStandupModule();
    const baseDir = makeTmpDir();
    writeEvidence(baseDir, "docs/evidence/canonical-domain.md");
    const launchResult = audit.evaluateCommercialLaunch({
      env: { NEXT_PUBLIC_SITE_URL: "https://kozbeylikonagi.com" },
      baseDir,
      runtimeReadiness: makeRuntimeReadinessFixture(),
      runtimeSource: "https://www.kozbeylikonagi.com/api/health",
    });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const result = standup.buildLaunchStandup({ launchResult, cutoverPlan });
    const database = result.blockedGates.find((gate) => gate.id === "production_database");
    const hms = result.blockedGates.find((gate) => gate.id === "hms_booking_engine");
    const legal = result.blockedGates.find((gate) => gate.id === "legal_dpa");
    const platform = result.ownerQueues.find((queue) => queue.owner === "Platform / CMS operator");
    const formatted = standup.formatLaunchStandup(result);

    expect(result.nextGate).toMatchObject({
      id: "production_database",
      runtimeReady: true,
      nextCommand: "npm run evidence:handoff:live",
      verificationCommand: "npm run launch:audit:live",
    });
    expect(result.nextGate?.nextAction).toContain("Production runtime is already configured");
    expect(result.nextGate?.nextAction).toContain("docs/evidence/production-database.md");
    expect(database?.runtimeDiagnostics).toMatchObject({ status: "ready", ready: true, configuredCount: 2 });
    expect(hms?.runtimeDiagnostics).toMatchObject({ ready: true, configuredCount: 1 });
    expect(legal?.verificationCommand).toBe("npm run launch:audit:live");
    expect(result.lanes.runtimeCoveredEvidenceGates).toEqual(
      expect.arrayContaining(["production_database", "hms_booking_engine"]),
    );
    expect(platform?.gates[0]).toMatchObject({
      id: "production_database",
      runtimeReady: true,
      nextCommand: "npm run evidence:handoff:live",
      verificationCommand: "npm run launch:audit:live",
    });
    expect(result.finalVerificationCommands).toContain("npm run launch:audit:live:strict");
    expect(result.finalVerificationCommands).not.toContain("npm run launch:audit:strict");
    expect(formatted).toContain("runtime-covered evidence-needed");
    expect(formatted).toContain("runtime ready: production_database");
    expect(formatted).toContain("npm run launch:audit:live:strict");
  });

  it("reports ready only when every commercial gate has env and evidence proof", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const standup = await loadStandupModule();
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
    const result = standup.buildLaunchStandup({ launchResult, cutoverPlan });

    expect(result.decision).toBe("LAUNCH_STANDUP_READY");
    expect(result.currentScore).toBe(100);
    expect(result.blockedPoints).toBe(0);
    expect(result.nextGate).toBeNull();
    expect(result.ownerQueues).toEqual([]);
    expect(result.blockedGates).toEqual([]);
    expect(result.finalVerificationCommands).toContain("npm run release:verify:commercial");
    expect(standup.formatLaunchStandup(result)).toContain("All commercial launch gates are ready.");
  });
});
