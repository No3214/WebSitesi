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
      missingEvidence: Array<{
        path: string;
        ready: boolean;
        reason: string;
        redactionFindingCount?: number;
        redactionCategories?: string[];
        missingEvidenceSignals?: string[];
      }>;
      runtimeConfiguration?: {
        source: string;
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
      runtimeStatus?: {
        source: string;
        ready: boolean;
        configurationSource: string;
        requiredCount: number;
        configuredCount: number;
        missingCount: number;
        invalidCount: number;
        placeholderCount: number;
        fallbackApplied: boolean;
      };
      runtimeAction: string;
      commands: string[];
      redactionFindingCount: number;
      redactionCategories: string[];
      redactionSummary: string;
      redactionAction: string;
      missingEvidenceSignals: string[];
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
      "date: 2026-06-21",
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
    expect(canonical?.envSetup).toMatchObject({
      provider: "Vercel",
      environment: "Production",
      dashboardPath: "Vercel Dashboard > kozbeyli-konagi > Settings > Environment Variables",
      envNames: ["NEXT_PUBLIC_SITE_URL"],
      cliInstallCommand: "npm i -g vercel",
      cliAuthCommands: ["vercel login", "vercel whoami"],
      cliCommands: ["vercel env add NEXT_PUBLIC_SITE_URL production"],
    });
    expect(canonical?.envSetup?.manualChecklist.join(" ")).toContain(
      "Keep secret values in Vercel/provider dashboards",
    );
    expect(canonical?.commands).toEqual(
      expect.arrayContaining(["npm run domain:verify:strict", "npm run launch:smoke:live"]),
    );
    expect(canonical?.requiredSections).toContain("source_refs: <redacted-source-ids>");
    expect(canonical?.sourceRefsPolicy).toContain("only redacted source-system IDs");
    expect(canonical?.sourceRefsPolicy).toContain("never raw URLs");
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
    expect(database?.envSetup?.cliCommands).toEqual([
      "vercel env add DATABASE_URI production",
      "vercel env add PAYLOAD_SECRET production",
    ]);

    const hms = result.files.find((file) => file.path === "docs/evidence/hms-booking-engine.md");
    expect(hms?.missingEnv).toEqual([]);
    expect(hms?.envSetup).toBeUndefined();
    expect(hms?.commands).toContain("npm run hms:verify:strict");
    expect(result.safeEvidenceRules.join(" ")).toContain("Do not commit secrets");
    expect(result.safeEvidenceRules.join(" ")).toContain("previous 45 days");
    expect(result.safeEvidenceRules.join(" ")).toContain("database URLs");
    expect(result.safeEvidenceRules.join(" ")).toContain("JWT/access tokens");
    expect(result.safeEvidenceRules.join(" ")).toContain("service-role keys");
    expect(result.safeEvidenceRules.join(" ")).toContain("bank account details");
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

  it("adds live runtime context to pending evidence handoff without exposing values", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const handoff = await loadHandoffModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {},
      baseDir: makeTmpDir(),
      runtimeReadiness: makeRuntimeReadinessFixture(),
      runtimeSource: "https://www.kozbeylikonagi.com/api/health",
    });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS_WITH_WARNINGS", warnings: [] },
    });
    const result = handoff.buildEvidenceHandoff({ launchResult, cutoverPlan });
    const database = result.files.find((file) => file.path === "docs/evidence/production-database.md");
    const abuse = result.files.find((file) => file.path === "docs/evidence/production-abuse-controls.md");
    const formatted = handoff.formatEvidenceHandoff(result);

    expect(database?.runtimeStatus).toMatchObject({
      source: "https://www.kozbeylikonagi.com/api/health",
      ready: true,
      configurationSource: "env",
      configuredCount: 2,
      requiredCount: 2,
    });
    expect(database?.runtimeAction).toContain("Production runtime reports this gate configured");
    expect(abuse?.runtimeStatus).toMatchObject({
      ready: false,
      configurationSource: "missing",
      missingCount: 4,
    });
    expect(abuse?.runtimeAction).toContain("Production runtime is still missing or invalid");
    expect(abuse?.envSetup).toMatchObject({
      envNames: [
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
        "TURNSTILE_SECRET_KEY",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
      ],
    });
    expect(formatted).toContain("runtime: https://www.kozbeylikonagi.com/api/health: ready");
    expect(formatted).toContain("runtime action:");
    expect(formatted).toContain("env setup: Vercel Dashboard > kozbeyli-konagi > Settings > Environment Variables");
    expect(formatted).toContain("cli fallback: npm i -g vercel; vercel login; vercel whoami");
    expect(JSON.stringify(result)).not.toContain("postgresql://");
    expect(formatted).not.toContain("postgresql://");
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

  it("carries missing gate-specific proof signals into the operator handoff", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const handoff = await loadHandoffModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const hmsPath = path.join(baseDir, "docs/evidence/hms-booking-engine.md");
    fs.writeFileSync(
      hmsPath,
      [
        "# Evidence",
        "",
        "status: ready",
        "date: 2026-06-22",
        "owner: reservations-ops",
        "source_refs: HMS-UAT-123",
        "",
        "## Summary",
        "A generic reservation evidence note was added.",
        "",
        "## Proof",
        "The source system stores redacted references outside the repository.",
        "",
        "## Residual Risk",
        "No raw guest data is included.",
      ].join("\n"),
    );

    const launchResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const cutoverPlan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });
    const result = handoff.buildEvidenceHandoff({ launchResult, cutoverPlan });
    const hms = result.files.find((file) => file.path === "docs/evidence/hms-booking-engine.md");
    const formatted = handoff.formatEvidenceHandoff(result);

    expect(hms?.reason).toContain("missing evidence signals:");
    expect(hms?.missingEvidenceSignals).toEqual(
      expect.arrayContaining([
        "approved HMS host proof",
        "new-tab CTA proof",
        "live booking UAT proof",
      ]),
    );
    expect(formatted).toContain("missing proof signals:");
    expect(formatted).not.toContain("HMS-UAT-123");
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
    expect(text).toContain("previous 45 days");
    expect(text).toContain("database URLs");
    expect(text).toContain("JWT/access tokens");
    expect(text).toContain("docs/evidence/hms-booking-engine.md");
    expect(text).toContain("missing env names:");
    expect(text).toContain("Vercel Dashboard > kozbeyli-konagi > Settings > Environment Variables");
    expect(text).not.toContain("super-secret-value");
  });
});
