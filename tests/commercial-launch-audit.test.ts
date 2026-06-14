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
      "",
      "## Summary",
      "Redacted operational evidence confirms this launch gate was validated in the source system.",
      "",
      "## Proof",
      "Ticket, screenshot and UAT references are stored outside the repository without secrets or PII.",
    ].join("\n"),
  );
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("commercial launch audit", () => {
  it("starts from 86/100 when no external environment or evidence is present", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const result = audit.evaluateCommercialLaunch({ env: {}, baseDir });

    expect(result.score).toBe(86);
    expect(result.decision).toBe("NO-GO for full booking/payment launch");
    expect(result.gateResults).toHaveLength(audit.commercialLaunchGates.length);
    expect(result.gateResults.every((gate) => !gate.ready)).toBe(true);
    expect(result.gateResults.some((gate) => gate.missingEnv.length > 0)).toBe(true);
    expect(result.gateResults.every((gate) => gate.missingEvidence.length > 0)).toBe(true);
  });

  it("reaches 100/100 only when every env key and evidence file is ready", async () => {
    const audit = await loadAuditModule();
    const baseDir = makeTmpDir();
    const env = Object.fromEntries(
      audit.commercialLaunchGates.flatMap((gate) =>
        gate.env.map((key) => [key, key === "GARANTI_POS_MODE" ? "production" : `live_${key}`]),
      ),
    );

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
    const env = Object.fromEntries(
      audit.commercialLaunchGates.flatMap((gate) =>
        gate.env.map((key) => [key, key === "GARANTI_POS_MODE" ? "production" : `live_${key}`]),
      ),
    );

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
});
