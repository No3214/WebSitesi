import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type SearchLocalSeoReadinessModule = {
  evaluateSearchLocalSeoReadiness: (args?: {
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
  "src/lib/metadata.ts",
  "src/lib/env.ts",
  ".env.example",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/lib/schema.ts",
  "src/components/location-page-content.tsx",
  "docs/evidence/README.md",
];

async function loadModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/search-local-seo-readiness.mjs")).href
  )) as SearchLocalSeoReadinessModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "search-local-seo-readiness-"));
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
  const fullPath = path.join(baseDir, "docs/evidence/search-local-seo.md");
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(
    fullPath,
    [
      "# Evidence: Search And Local SEO",
      "",
      `status: ${status}`,
      "date: 2026-06-19",
      "owner: growth-ops",
      "source_refs: GSC-PROP-123, GBP-OWNER-456, HOTEL-CENTER-789",
      "",
      "## Summary",
      "Redacted source-system references prove search and local discovery setup.",
      "",
      "## Proof",
      "Search Console, Google Business Profile and Hotel Center proof lives outside the repo.",
      "",
      "## Residual Risk",
      "No account screenshots, private listing data or console secrets are stored in this fixture.",
    ].join("\n"),
  );
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("search and local SEO readiness", () => {
  it("keeps current source contracts passing while production search evidence is pending", async () => {
    const mod = await loadModule();
    const result = mod.evaluateSearchLocalSeoReadiness({ env: {}, baseDir: root });

    expect(result.decision).toBe("SEARCH LOCAL SEO BLOCKED");
    expect(result.env).toMatchObject({
      configuredCount: 0,
      missing: ["GOOGLE_SITE_VERIFICATION"],
      ready: false,
    });
    expect(result.evidence.missingEvidence).toEqual([
      {
        path: "docs/evidence/search-local-seo.md",
        ready: false,
        reason: "pending status",
      },
    ]);
    expect(result.sourceContracts.ready).toBe(true);
    expect(result.sourceContracts.checks.every((check) => check.status === "PASS")).toBe(true);
  });

  it("passes only when env, source contracts and redacted local SEO evidence are ready", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");

    const result = mod.evaluateSearchLocalSeoReadiness({
      env: { GOOGLE_SITE_VERIFICATION: "googleToken_12345" },
      baseDir,
    });

    expect(result.decision).toBe("SEARCH LOCAL SEO PASS");
    expect(result.env.ready).toBe(true);
    expect(result.evidence.ready).toBe(true);
    expect(result.sourceContracts.ready).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("blocks full meta tags and unverifiable structured-data claims", async () => {
    const mod = await loadModule();
    const baseDir = makeTmpDir();
    copyContractFiles(baseDir);
    writeEvidence(baseDir, "ready");

    const schemaPath = path.join(baseDir, "src/lib/schema.ts");
    fs.appendFileSync(schemaPath, "\nconst fakeLocalSeoClaim = { starRating: { ratingValue: '5' } };\n");

    const result = mod.evaluateSearchLocalSeoReadiness({
      env: {
        GOOGLE_SITE_VERIFICATION:
          '<meta name="google-site-verification" content="abc123" />',
      },
      baseDir,
    });

    expect(result.decision).toBe("SEARCH LOCAL SEO BLOCKED");
    expect(result.env.invalid).toEqual([
      "GOOGLE_SITE_VERIFICATION must be the raw Search Console token, not a full meta tag or URL",
    ]);
    expect(result.sourceContracts.ready).toBe(false);
    expect(result.sourceContracts.checks.find((check) => check.id === "structured_data_truthfulness")).toMatchObject({
      status: "FAIL",
    });
  });
});
