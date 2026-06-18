import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type Finding = {
  file: string;
  line: number;
  category: string;
  message: string;
};

type EvidenceScanModule = {
  scanEvidenceSource: (source: string, file?: string) => Finding[];
  scanEvidenceDirectory: (baseDir?: string) => {
    status: "pass" | "fail";
    scannedDir: string;
    scannedFiles: number;
    findings: Finding[];
  };
};

async function loadScanner() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/evidence-redaction-scan.mjs")).href
  )) as EvidenceScanModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "evidence-redaction-scan-"));
  tmpDirs.push(dir);
  return dir;
}

function writeEvidence(baseDir: string, relPath: string, source: string) {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, source);
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("evidence redaction scan", () => {
  it("passes the current repository evidence files", async () => {
    const scanner = await loadScanner();
    const report = scanner.scanEvidenceDirectory();

    expect(report.status).toBe("pass");
    expect(report.scannedDir).toBe("docs/evidence");
    expect(report.scannedFiles).toBeGreaterThan(0);
    expect(report.findings).toEqual([]);
  });

  it("allows redacted source-system references and placeholder env examples", async () => {
    const scanner = await loadScanner();
    const findings = scanner.scanEvidenceSource(
      [
        "# Evidence",
        "status: pending",
        "Ticket proof is stored in the source system.",
        "TURNSTILE_SECRET_KEY=replace_with_secret",
        "GA4_API_SECRET=",
        "Use `GARANTI_3D_STORE_KEY` as an env key name only.",
      ].join("\n"),
    );

    expect(findings).toEqual([]);
  });

  it("flags credential, payment, banking and identity material without leaking values", async () => {
    const scanner = await loadScanner();
    const privateKeyHeader = `-----BEGIN ${"PRIVATE"} KEY-----`;
    const githubLikeToken = `ghp_${"1234567890abcdefghijklmnopqrstuv"}`;
    const stripeLikeKey = `sk_${"live"}_1234567890abcdefghijklmnop`;
    const slackLikeToken = `xox${"b"}-123456789012-abcdefghijklmnopqrst`;
    const awsLikeKey = `AKIA${"IOSFODNN7EXAMPLE"}`;
    const googleLikeKey = `AI${"za"}SyA1234567890abcdefghijklmnop`;
    const ibanLikeValue = `TR${"86"} 0001 0003 4454 7464 5450 08`;
    const cardLikeValue = `4242 ${"4242"} 4242 4242`;
    const tcknLikeValue = `100000${"00146"}`;
    const secretSource = [
      privateKeyHeader,
      githubLikeToken,
      stripeLikeKey,
      slackLikeToken,
      awsLikeKey,
      googleLikeKey,
      `IBAN: ${ibanLikeValue}`,
      `card: ${cardLikeValue}`,
      "cvv: 123",
      `TCKN: ${tcknLikeValue}`,
      "GARANTI_3D_STORE_KEY=actual_live_secret_value",
    ].join("\n");

    const findings = scanner.scanEvidenceSource(secretSource, "docs/evidence/example.md");
    const categories = findings.map((finding) => finding.category);

    expect(categories).toEqual(
      expect.arrayContaining([
        "private_key",
        "github_token",
        "stripe_or_payment_secret",
        "slack_token",
        "aws_access_key",
        "google_api_key",
        "iban",
        "payment_card",
        "card_security_code",
        "turkish_identity_number",
        "secret_env_assignment",
      ]),
    );
    expect(JSON.stringify(findings)).not.toContain("actual_live_secret_value");
    expect(JSON.stringify(findings)).not.toContain("4242");
    expect(JSON.stringify(findings)).not.toContain("10000000146");
  });

  it("scans evidence docs relative to the provided base directory", async () => {
    const scanner = await loadScanner();
    const baseDir = makeTmpDir();

    writeEvidence(
      baseDir,
      "docs/evidence/safe.md",
      ["# Safe", "status: pending", "Proof remains in the external ticket system."].join("\n"),
    );
    writeEvidence(
      baseDir,
      "docs/evidence/nested/leak.md",
      ["# Leak", "status: pending", "PAYLOAD_SECRET=not_a_placeholder"].join("\n"),
    );

    const report = scanner.scanEvidenceDirectory(baseDir);

    expect(report.status).toBe("fail");
    expect(report.scannedFiles).toBe(2);
    expect(report.findings).toEqual([
      {
        file: path.join("docs/evidence/nested/leak.md"),
        line: 3,
        category: "secret_env_assignment",
        message: "Secret-looking env assignments must be redacted from launch evidence.",
      },
    ]);
  });
});
