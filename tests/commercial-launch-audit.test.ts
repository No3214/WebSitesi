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
      missingEvidence: Array<{ path: string; ready: boolean; reason: string }>;
    }>;
  };
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
      gate.env.map((key) => [
        key,
        key === "GARANTI_POS_MODE"
          ? "production"
          : key === "NEXT_PUBLIC_SITE_URL"
            ? "https://kozbeylikonagi.com"
            : key === "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"
              ? "https://kozbeyli-konagi.hmshotel.net/bv3/search"
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
  it("starts from 82/100 when no external environment or evidence is present", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const result = audit.evaluateCommercialLaunch({ env: {}, baseDir });

    expect(result.baseScore).toBe(82);
    expect(result.score).toBe(82);
    expect(result.decision).toBe("NO-GO for full booking/payment launch");
    expect(result.gateResults).toHaveLength(audit.commercialLaunchGates.length);
    expect(result.gateResults.every((gate) => !gate.ready)).toBe(true);
    expect(result.gateResults.some((gate) => gate.missingEnv.length > 0)).toBe(true);
    expect(result.gateResults.every((gate) => gate.missingEvidence.length > 0)).toBe(true);
  });

  it("reaches 100/100 only when every env key and evidence file is ready", async () => {
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

    expect(result.score).toBeLessThan(100);
    expect(garantiGate?.ready).toBe(false);
    expect(garantiGate?.missingEvidence).toEqual([
      {
        path: "docs/evidence/garanti-pos.md",
        ready: false,
        reason: "redaction findings",
      },
    ]);
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
  });
});
