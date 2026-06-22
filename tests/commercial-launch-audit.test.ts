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
      }>;
      configurationSource?: string;
      requiredEnvCount: number;
      configuredEnvCount: number;
      missingEnvCount: number;
      invalidEnvCount: number;
      placeholderEnvCount: number;
      fallbackApplied: boolean;
      progressNotes: string[];
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
        expect.stringContaining("hms:verify:json"),
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
