import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type GarantiPosReadinessModule = {
  evaluateGarantiPosReadiness: (args?: {
    env?: Record<string, string>;
    baseDir?: string;
  }) => {
    decision: string;
    env: {
      configuredCount: number;
      missing: string[];
      placeholders: string[];
      invalid: string[];
      ready: boolean;
    };
    evidence: {
      ready: boolean;
      missingEvidence: Array<{ path: string; ready: boolean; reason: string }>;
    };
    sourceContracts: {
      ready: boolean;
      checks: Array<{ id: string; status: string; label: string }>;
    };
    blockers: string[];
  };
};

const contractFiles = [
  ".env.example",
  "src/lib/production-readiness.ts",
  "scripts/commercial-launch-audit.mjs",
  "src/app/api/checkout/route.ts",
  "src/components/payment-wizard/use-payment-wizard.ts",
  "src/components/payment-wizard/steps/payment-step.tsx",
  "src/components/payment-wizard/types.ts",
  "docs/evidence/README.md",
  "docs/evidence/garanti-pos.md",
  "docs/odeme-karari.md",
  "tests/e2e/checkout-contract.spec.ts",
];

const readyEnv = {
  GARANTI_POS_MODE: "production",
  GARANTI_MERCHANT_ID: "merchant-live-ref",
  GARANTI_TERMINAL_ID: "terminal-live-ref",
  GARANTI_PROVISION_USER: "provision-live-ref",
  GARANTI_3D_STORE_KEY: "store-key-live-ref",
};

async function loadModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/garanti-pos-readiness.mjs")).href
  )) as GarantiPosReadinessModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "garanti-pos-readiness-"));
  tmpDirs.push(dir);
  return dir;
}

function copyContractFiles(baseDir: string) {
  for (const relPath of contractFiles) {
    const target = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, relPath), target);
  }
}

function writeEvidence(baseDir: string, status = "ready") {
  const fullPath = path.join(baseDir, "docs/evidence/garanti-pos.md");
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(
    fullPath,
    [
      "# Evidence: Garanti Sanal POS",
      "",
      `status: ${status}`,
      "date: 2026-06-19",
      "owner: finance-ops",
      "source_refs: GARANTI-UAT-123, CALLBACK-LOG-456, FINANCE-APPROVAL-789",
      "",
      "## Summary",
      "Redacted source-system references prove the sandbox payment setup.",
      "",
      "## Proof",
      "GARANTI_POS_MODE and related terminal references are stored outside the repository.",
      "Successful 3D Secure, failed payment, callback signature and refund/cancel sandbox cases are referenced outside the repository.",
      "",
      "## Residual Risk",
      "Do not paste raw credentials, card numbers, bank account details, customer PII, full bank portal screenshots or raw callback payloads into this fixture.",
    ].join("\n"),
  );
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("Garanti POS readiness", () => {
  it("keeps current source contracts passing while production POS env and evidence are pending", async () => {
    const mod = await loadModule();
    const result = mod.evaluateGarantiPosReadiness({ env: {}, baseDir: root });

    expect(result.decision).toBe("GARANTI POS READINESS BLOCKED");
    expect(result.env).toMatchObject({
      configuredCount: 0,
      missing: [
        "GARANTI_POS_MODE",
        "GARANTI_MERCHANT_ID",
        "GARANTI_TERMINAL_ID",
        "GARANTI_PROVISION_USER",
        "GARANTI_3D_STORE_KEY",
      ],
      ready: false,
    });
    expect(result.evidence.missingEvidence).toEqual([
      {
        path: "docs/evidence/garanti-pos.md",
        ready: false,
        reason: "pending status",
      },
    ]);
    expect(result.sourceContracts.ready).toBe(true);
    expect(result.sourceContracts.checks.every((check) => check.status === "PASS")).toBe(true);
  });

  it("passes only when env, source contracts and redacted sandbox payment evidence are ready", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");

    const result = mod.evaluateGarantiPosReadiness({
      env: readyEnv,
      baseDir,
    });

    expect(result.decision).toBe("GARANTI POS READINESS PASS");
    expect(result.env.ready).toBe(true);
    expect(result.evidence.ready).toBe(true);
    expect(result.sourceContracts.ready).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("blocks invalid mode values and card-collection regressions", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");

    const checkoutRoutePath = path.join(baseDir, "src/app/api/checkout/route.ts");
    fs.writeFileSync(
      checkoutRoutePath,
      fs.readFileSync(checkoutRoutePath, "utf8")
        .replace("}).strict();", "});")
        .replace("guestPhone: z.string().trim().min(8).max(25),", "guestPhone: z.string().trim().min(8).max(25),\n  cardNumber: z.string(),"),
    );

    const result = mod.evaluateGarantiPosReadiness({
      env: {
        ...readyEnv,
        GARANTI_POS_MODE: "live-bank-portal",
      },
      baseDir,
    });

    expect(result.decision).toBe("GARANTI POS READINESS BLOCKED");
    expect(result.env.invalid).toEqual([
      "GARANTI_POS_MODE must be one of test, sandbox, production, prod",
    ]);
    expect(result.sourceContracts.checks.find((check) => check.id === "checkout_route_card_data_rejected")).toMatchObject({
      status: "FAIL",
    });
  });
});
