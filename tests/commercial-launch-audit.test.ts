import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type CommercialLaunchGate = {
  id: string;
  env: string[];
  envAnyOf?: Array<{ keys: string[]; label: string }>;
  evidence: string[];
};

type CommercialLaunchModule = {
  commercialLaunchGates: CommercialLaunchGate[];
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
    runtimeReadinessError?: string;
    currentDate?: string | Date;
  }) => {
    baseScore: number;
    score: number;
    target: number;
    decision: string;
    gateResults: Array<{
      id: string;
      ready: boolean;
      missingEnv: string[];
      missingEvidence: Array<{
        path: string;
        ready: boolean;
        reason: string;
        redactionFindingCount?: number;
        redactionCategories?: string[];
        missingEvidenceSignals?: string[];
      }>;
      configurationSource?: string;
      requiredEnvCount: number;
      configuredEnvCount: number;
      missingEnvCount: number;
      invalidEnvCount: number;
      placeholderEnvCount: number;
      fallbackApplied: boolean;
      progressNotes: string[];
      runtimeConfiguration?: {
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
  };
  formatCommercialLaunchReport: (
    result: ReturnType<CommercialLaunchModule["evaluateCommercialLaunch"]>,
  ) => string;
};

async function loadAuditModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/commercial-launch-audit.mjs")).href
  )) as CommercialLaunchModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "commercial-launch-audit-"));
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
      "/rezervasyon and /en/booking CTAs open in a new tab.",
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

function writeEvidence(baseDir: string, relPath: string, status = "ready") {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(
    fullPath,
    [
      "# Evidence",
      "",
      `status: ${status}`,
      "date: 2026-06-14",
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
        key === "GARANTI_POS_MODE"
          ? "production"
          : key === "DATABASE_URI"
            ? "postgresql://postgres:password@db.supabase.co:6543/postgres"
          : key === "NEXT_PUBLIC_SITE_URL"
            ? "https://kozbeylikonagi.com"
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
    configuredGates: ["canonical_domain", "production_database", "hms_booking_engine"],
    blockedGates: ["production_abuse_controls", "garanti_pos", "analytics_purchase", "search_local_seo"],
    checks: [
      {
        id: "canonical_domain",
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

describe("commercial launch audit", () => {
  it("starts from 80/100 when no external environment or evidence is present", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const result = audit.evaluateCommercialLaunch({ env: {}, baseDir });

    expect(result.baseScore).toBe(80);
    expect(result.score).toBe(80);
    expect(result.decision).toBe("NO-GO for full booking/payment launch");
    expect(result.gateResults).toHaveLength(audit.commercialLaunchGates.length);
    expect(result.gateResults.every((gate) => !gate.ready)).toBe(true);
    expect(result.gateResults.some((gate) => gate.missingEnv.length > 0)).toBe(true);
    expect(result.gateResults.every((gate) => gate.missingEvidence.length > 0)).toBe(true);

    const hmsGate = result.gateResults.find((gate) => gate.id === "hms_booking_engine");
    expect(hmsGate?.missingEnv).toEqual([]);
    expect(hmsGate?.configurationSource).toBe("code_fallback");
    expect(hmsGate?.progressNotes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("env/fallback lane"),
        expect.stringContaining("vercel:hms:verify"),
      ]),
    );
    expect(hmsGate).toMatchObject({
      requiredEnvCount: 1,
      configuredEnvCount: 1,
      missingEnvCount: 0,
      invalidEnvCount: 0,
      placeholderEnvCount: 0,
      fallbackApplied: true,
    });

    const canonicalGate = result.gateResults.find((gate) => gate.id === "canonical_domain");
    const databaseGate = result.gateResults.find((gate) => gate.id === "production_database");
    expect(canonicalGate).toMatchObject({
      configurationSource: "missing",
      requiredEnvCount: 1,
      configuredEnvCount: 0,
      missingEnvCount: 1,
      fallbackApplied: false,
    });
    expect(canonicalGate?.progressNotes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("domain:verify:json"),
        expect.stringContaining(".com apex and www"),
      ]),
    );
    expect(databaseGate).toMatchObject({
      configurationSource: "missing",
      requiredEnvCount: 2,
      configuredEnvCount: 0,
      missingEnvCount: 2,
      fallbackApplied: false,
    });
  });

  it("reports live runtime readiness without awarding commercial points before evidence is ready", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const result = audit.evaluateCommercialLaunch({
      env: {},
      baseDir,
      runtimeReadiness: makeRuntimeReadinessFixture(),
      runtimeSource: "https://www.kozbeylikonagi.com/api/health",
    });

    const databaseGate = result.gateResults.find((gate) => gate.id === "production_database");
    const abuseGate = result.gateResults.find((gate) => gate.id === "production_abuse_controls");
    const formatted = audit.formatCommercialLaunchReport(result);

    expect(result.score).toBe(80);
    expect(databaseGate).toMatchObject({
      ready: false,
      awardedPoints: 0,
      configurationSource: "runtime_env",
      missingEnv: [],
      missingEnvCount: 0,
      configuredEnvCount: 2,
      runtimeConfiguration: {
        source: "https://www.kozbeylikonagi.com/api/health",
        ready: true,
        configurationSource: "env",
        configuredCount: 2,
        requiredCount: 2,
      },
    });
    expect(databaseGate?.progressNotes).toEqual(
      expect.arrayContaining([
        "env/runtime lane: production runtime is configured via https://www.kozbeylikonagi.com/api/health; local audit env snapshot is not treated as the blocker",
        "runtime lane: https://www.kozbeylikonagi.com/api/health reports this gate configured in production; points still require the redacted evidence file",
      ]),
    );
    expect(abuseGate?.runtimeConfiguration).toMatchObject({
      ready: false,
      configurationSource: "missing",
      configuredCount: 0,
      requiredCount: 4,
    });
    expect(formatted).toContain("runtime: https://www.kozbeylikonagi.com/api/health: ready");
    expect(formatted).toContain("runtime lane:");
  });

  it("reaches 100/100 only when every required env group or official fallback and evidence file is ready", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const result = audit.evaluateCommercialLaunch({ env, baseDir });

    expect(result.score).toBe(100);
    expect(result.target).toBe(100);
    expect(result.decision).toBe("FULL COMMERCIAL GO");
    expect(result.gateResults.every((gate) => gate.ready)).toBe(true);
    expect(result.gateResults.find((gate) => gate.id === "legal_dpa")?.configurationSource).toBe(
      "not_applicable",
    );
    expect(result.gateResults.find((gate) => gate.id === "hms_booking_engine")).toMatchObject({
      configurationSource: "env",
      fallbackApplied: false,
    });
  });

  it("accepts the official HMS fallback when booking UAT evidence is ready", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);
    delete env.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL;

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const hmsGate = result.gateResults.find((gate) => gate.id === "hms_booking_engine");

    expect(result.score).toBe(100);
    expect(hmsGate?.ready).toBe(true);
    expect(hmsGate?.missingEnv).toEqual([]);
    expect(hmsGate?.configurationSource).toBe("code_fallback");
    expect(hmsGate?.fallbackApplied).toBe(true);
  });

  it("does not count a localhost DATABASE_URI as production database configuration", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);
    env.DATABASE_URI = "postgresql://postgres:password@localhost:5432/kozbeyli";

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const databaseGate = result.gateResults.find((gate) => gate.id === "production_database");

    expect(result.score).toBe(98);
    expect(databaseGate).toMatchObject({
      ready: false,
      configurationSource: "invalid",
      invalidEnvCount: 1,
    });
    expect(databaseGate?.missingEnv).toEqual([
      "DATABASE_URI (expected production Postgres/Supabase connection string, not localhost)",
    ]);
  });

  it("blocks an explicit invalid HMS env value even though the code fallback exists", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);
    env.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL = "http://kozbeyli-invalid.invalid/search";

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const hmsGate = result.gateResults.find((gate) => gate.id === "hms_booking_engine");

    expect(result.score).toBe(96);
    expect(hmsGate?.ready).toBe(false);
    expect(hmsGate?.missingEnv).toEqual([
      "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL (expected approved HTTPS HMS booking engine URL)",
    ]);
    expect(hmsGate?.missingEvidence).toEqual([]);
    expect(hmsGate).toMatchObject({
      configurationSource: "invalid",
      configuredEnvCount: 1,
      missingEnvCount: 0,
      invalidEnvCount: 1,
      fallbackApplied: false,
    });
  });

  it("blocks explicit HTTPS booking URLs that belong to another hotel or vendor host", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);
    env.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL = "https://soleil-mansion.hotelrunner.com/bv3/search";

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const hmsGate = result.gateResults.find((gate) => gate.id === "hms_booking_engine");

    expect(result.score).toBe(96);
    expect(hmsGate?.ready).toBe(false);
    expect(hmsGate?.missingEnv).toEqual([
      "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL (expected approved HTTPS HMS booking engine URL)",
    ]);
    expect(hmsGate).toMatchObject({
      configurationSource: "invalid",
      configuredEnvCount: 1,
      invalidEnvCount: 1,
    });
  });

  it("blocks a gate when its evidence is marked pending even if env is present", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) {
        writeEvidence(baseDir, evidence, gate.id === "hms_booking_engine" ? "pending" : "ready");
      }
    }

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const hmsGate = result.gateResults.find((gate) => gate.id === "hms_booking_engine");

    expect(result.score).toBeLessThan(100);
    expect(hmsGate?.ready).toBe(false);
    expect(hmsGate?.missingEnv).toEqual([]);
    expect(hmsGate?.progressNotes).toEqual(
      expect.arrayContaining([
        "env lane: configured for this local snapshot",
        "evidence lane: docs/evidence/hms-booking-engine.md (pending status)",
      ]),
    );
    expect(hmsGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/hms-booking-engine.md",
        ready: false,
        reason: "pending status",
      },
    ]);
  });

  it("blocks ready-looking evidence that has no source-system references", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const hmsPath = path.join(baseDir, "docs/evidence/hms-booking-engine.md");
    fs.writeFileSync(
      hmsPath,
      fs.readFileSync(hmsPath, "utf8").replace(/^source_refs:.*$/m, "source_refs: todo"),
    );

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const hmsGate = result.gateResults.find((gate) => gate.id === "hms_booking_engine");

    expect(result.score).toBeLessThan(100);
    expect(hmsGate?.ready).toBe(false);
    expect(hmsGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/hms-booking-engine.md",
        ready: false,
        reason: "missing source refs",
      },
    ]);
  });

  it("blocks ready evidence that uses pending source references", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const databasePath = path.join(baseDir, "docs/evidence/production-database.md");
    fs.writeFileSync(
      databasePath,
      fs.readFileSync(databasePath, "utf8").replace(/^source_refs:.*$/m, "source_refs: pending"),
    );

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const databaseGate = result.gateResults.find((gate) => gate.id === "production_database");

    expect(result.score).toBeLessThan(100);
    expect(databaseGate?.ready).toBe(false);
    expect(databaseGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/production-database.md",
        ready: false,
        reason: "missing source refs",
      },
    ]);
  });

  it("blocks ready evidence that points source references at raw URLs or files", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const hmsPath = path.join(baseDir, "docs/evidence/hms-booking-engine.md");
    fs.writeFileSync(
      hmsPath,
      fs
        .readFileSync(hmsPath, "utf8")
        .replace(
          /^source_refs:.*$/m,
          "source_refs: https://private.example.com/hms-uat-screenshot.png",
        ),
    );

    const urlResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const urlGate = urlResult.gateResults.find((gate) => gate.id === "hms_booking_engine");

    expect(urlResult.score).toBeLessThan(100);
    expect(urlGate?.ready).toBe(false);
    expect(urlGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/hms-booking-engine.md",
        ready: false,
        reason: "unsafe source refs",
      },
    ]);

    fs.writeFileSync(
      hmsPath,
      fs
        .readFileSync(hmsPath, "utf8")
        .replace(
          /^source_refs:.*$/m,
          "source_refs: C:\\Users\\operator\\Downloads\\booking-uat.pdf",
        ),
    );

    const fileResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const fileGate = fileResult.gateResults.find((gate) => gate.id === "hms_booking_engine");

    expect(fileGate?.ready).toBe(false);
    expect(fileGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/hms-booking-engine.md",
        ready: false,
        reason: "unsafe source refs",
      },
    ]);
  });

  it("blocks ready evidence without a valid date and named owner", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const seoPath = path.join(baseDir, "docs/evidence/search-local-seo.md");
    fs.writeFileSync(
      seoPath,
      fs.readFileSync(seoPath, "utf8").replace(/^date:.*$/m, "date: 22-06-2026"),
    );

    const dateResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const dateGate = dateResult.gateResults.find((gate) => gate.id === "search_local_seo");

    expect(dateGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/search-local-seo.md",
        ready: false,
        reason: "missing valid date",
      },
    ]);

    fs.writeFileSync(
      seoPath,
      fs
        .readFileSync(seoPath, "utf8")
        .replace(/^date:.*$/m, "date: 2026-06-22")
        .replace(/^owner:.*$/m, "owner: pending"),
    );

    const ownerResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const ownerGate = ownerResult.gateResults.find((gate) => gate.id === "search_local_seo");

    expect(ownerGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/search-local-seo.md",
        ready: false,
        reason: "missing owner",
      },
    ]);
  });

  it("blocks ready evidence dated in the future or outside the freshness window", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const legalPath = path.join(baseDir, "docs/evidence/legal-dpa.md");
    fs.writeFileSync(
      legalPath,
      fs.readFileSync(legalPath, "utf8").replace(/^date:.*$/m, "date: 2026-06-24"),
    );

    const futureResult = audit.evaluateCommercialLaunch({
      env,
      baseDir,
      currentDate: "2026-06-23",
    });
    const futureGate = futureResult.gateResults.find((gate) => gate.id === "legal_dpa");

    expect(futureGate?.ready).toBe(false);
    expect(futureGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/legal-dpa.md",
        ready: false,
        reason: "future evidence date",
      },
    ]);

    fs.writeFileSync(
      legalPath,
      fs.readFileSync(legalPath, "utf8").replace(/^date:.*$/m, "date: 2026-04-01"),
    );

    const staleResult = audit.evaluateCommercialLaunch({
      env,
      baseDir,
      currentDate: "2026-06-23",
    });
    const staleGate = staleResult.gateResults.find((gate) => gate.id === "legal_dpa");

    expect(staleGate?.ready).toBe(false);
    expect(staleGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/legal-dpa.md",
        ready: false,
        reason: "stale evidence date",
      },
    ]);
  });

  it("blocks ready evidence that omits gate-specific proof signals", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const garantiPath = path.join(baseDir, "docs/evidence/garanti-pos.md");
    fs.writeFileSync(
      garantiPath,
      [
        "# Evidence",
        "",
        "status: ready",
        "date: 2026-06-22",
        "owner: finance-ops",
        "source_refs: GARANTI-UAT-123",
        "",
        "## Summary",
        "A generic launch note says the payment gate has been reviewed.",
        "",
        "## Proof",
        "The source system stores redacted references outside the repository.",
        "",
        "## Residual Risk",
        "No raw credentials or card data are included.",
      ].join("\n"),
    );

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const garantiGate = result.gateResults.find((gate) => gate.id === "garanti_pos");
    const formatted = audit.formatCommercialLaunchReport(result);

    expect(result.score).toBeLessThan(100);
    expect(garantiGate?.ready).toBe(false);
    expect(garantiGate?.missingEvidence[0]).toMatchObject({
      path: "docs/evidence/garanti-pos.md",
      ready: false,
      reason: expect.stringContaining("missing evidence signals:"),
      missingEvidenceSignals: expect.arrayContaining([
        "POS environment proof",
        "successful 3DS payment proof",
        "failed payment proof",
        "callback verification proof",
        "refund or cancel proof",
      ]),
    });
    expect(formatted).toContain("missing evidence signals:");
    expect(formatted).not.toContain("GARANTI-UAT-123");
  });

  it("blocks ready evidence that contains redaction findings", async () => {
    const audit = await loadAuditModule();
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

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const garantiGate = result.gateResults.find((gate) => gate.id === "garanti_pos");
    const formatted = audit.formatCommercialLaunchReport(result);

    expect(result.score).toBeLessThan(100);
    expect(garantiGate?.ready).toBe(false);
    expect(garantiGate?.missingEvidence[0]).toMatchObject({
      path: "docs/evidence/garanti-pos.md",
      ready: false,
      reason: "redaction findings",
      redactionFindingCount: 1,
      redactionCategories: ["payment_card"],
    });
    expect(garantiGate?.progressNotes).toContain(
      "evidence lane: docs/evidence/garanti-pos.md (redaction findings; redaction categories: payment_card; count: 1)",
    );
    expect(formatted).toContain("redaction categories: payment_card; count: 1");
    expect(JSON.stringify(result)).not.toContain("4242");
    expect(formatted).not.toContain("4242");
  });

  it("blocks the canonical domain gate when NEXT_PUBLIC_SITE_URL is not the public domain", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);
    env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const result = audit.evaluateCommercialLaunch({ env, baseDir });
    const domainGate = result.gateResults.find((gate) => gate.id === "canonical_domain");

    expect(result.score).toBe(98);
    expect(domainGate?.ready).toBe(false);
    expect(domainGate?.missingEnv).toEqual([
      "NEXT_PUBLIC_SITE_URL (expected https://kozbeylikonagi.com or https://www.kozbeylikonagi.com)",
    ]);
    expect(domainGate).toMatchObject({
      configurationSource: "invalid",
      configuredEnvCount: 1,
      missingEnvCount: 0,
      invalidEnvCount: 1,
      fallbackApplied: false,
    });
  });

  it("classifies partial and placeholder env groups without exposing values", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const result = audit.evaluateCommercialLaunch({
      env: {
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0x4AA-real-site-key",
        GARANTI_POS_MODE: "replace_with_real_mode",
      },
      baseDir,
    });

    const abuseGate = result.gateResults.find((gate) => gate.id === "production_abuse_controls");
    const garantiGate = result.gateResults.find((gate) => gate.id === "garanti_pos");
    const serialized = JSON.stringify(result);

    expect(abuseGate).toMatchObject({
      ready: false,
      configurationSource: "partial",
      configuredEnvCount: 1,
      missingEnvCount: 3,
      invalidEnvCount: 0,
      placeholderEnvCount: 0,
    });
    expect(garantiGate).toMatchObject({
      ready: false,
      configurationSource: "invalid",
      configuredEnvCount: 0,
      missingEnvCount: 4,
      invalidEnvCount: 0,
      placeholderEnvCount: 1,
    });
    expect(serialized).not.toContain("replace_with_real_mode");
    expect(serialized).not.toContain("0x4AA-real-site-key");
    expect(abuseGate?.progressNotes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("env lane: partial (1/4)"),
      ]),
    );
  });
});
