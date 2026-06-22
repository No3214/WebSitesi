import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type SupabaseSecurityModule = {
  evaluateSupabaseSecurityReadiness: (args?: {
    envSnapshot?: {
      env: Record<string, string>;
      sources: Record<string, string>;
    };
    baseDir?: string;
  }) => {
    decision: string;
    database: {
      provider: string;
      mode: string;
      valid: boolean;
      problem: string;
    };
    payload: {
      ready: boolean;
    };
    evidence: {
      ready: boolean;
      reason: string;
    };
    secretBoundary: {
      ready: boolean;
      sourceFindings: Array<{ id: string; file: string }>;
    };
    blockers: string[];
    warnings: string[];
  };
};

async function loadSupabaseSecurityModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/supabase-security-readiness.mjs")).href
  )) as SupabaseSecurityModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "supabase-security-"));
  tmpDirs.push(dir);
  fs.mkdirSync(path.join(dir, "src/lib"), { recursive: true });
  fs.mkdirSync(path.join(dir, "payload"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docs/evidence"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "payload.config.ts"),
    [
      "import { postgresAdapter } from '@payloadcms/db-postgres';",
      "export default {",
      "  secret: env.PAYLOAD_SECRET,",
      "  db: postgresAdapter({ pool: { connectionString: env.DATABASE_URI } }),",
      "};",
    ].join("\n"),
  );
  fs.writeFileSync(
    path.join(dir, "src/lib/env.ts"),
    [
      'requireEnv("DATABASE_URI", raw.DATABASE_URI);',
      'requireEnv("PAYLOAD_SECRET", raw.PAYLOAD_SECRET);',
    ].join("\n"),
  );
  return dir;
}

function writeEvidence(baseDir: string, status = "ready") {
  fs.writeFileSync(
    path.join(baseDir, "docs/evidence/production-database.md"),
    [
      "# Evidence: production database",
      "",
      `status: ${status}`,
      "date: 2026-06-22",
      "owner: platform",
      "source_refs: SUPABASE-PROJ-123, VERCEL-ENV-456, UAT-789",
      "",
      "## Summary",
      "Managed Postgres is confirmed.",
      "",
      "## Proof",
      "Redacted source-system references confirm production setup.",
      "",
      "## Residual Risk",
      "No unresolved fixture risk.",
    ].join("\n"),
  );
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("supabase security readiness", () => {
  it("blocks localhost DATABASE_URI from being counted as production database evidence", async () => {
    const securityModule = await loadSupabaseSecurityModule();
    const baseDir = makeTmpDir();
    writeEvidence(baseDir);

    const result = securityModule.evaluateSupabaseSecurityReadiness({
      baseDir,
      envSnapshot: {
        env: {
          DATABASE_URI: "postgresql://postgres:password@localhost:5432/kozbeyli",
          PAYLOAD_SECRET: "long-production-secret",
        },
        sources: { DATABASE_URI: ".env", PAYLOAD_SECRET: ".env" },
      },
    });

    expect(result.decision).toBe("SUPABASE PRODUCTION DATABASE BLOCKED");
    expect(result.database).toMatchObject({
      provider: "local",
      mode: "local",
      valid: false,
    });
    expect(result.blockers).toContain(
      "DATABASE_URI points to localhost and is not production database evidence",
    );
  });

  it("accepts a Supabase pooler DATABASE_URI only when source contracts and evidence are ready", async () => {
    const securityModule = await loadSupabaseSecurityModule();
    const baseDir = makeTmpDir();
    writeEvidence(baseDir);

    const result = securityModule.evaluateSupabaseSecurityReadiness({
      baseDir,
      envSnapshot: {
        env: {
          DATABASE_URI:
            "postgresql://postgres.projectref:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
          PAYLOAD_SECRET: "long-production-secret",
        },
        sources: { DATABASE_URI: "process", PAYLOAD_SECRET: "process" },
      },
    });

    expect(result.decision).toBe("SUPABASE PRODUCTION DATABASE READY");
    expect(result.database).toMatchObject({
      provider: "supabase",
      mode: "supabase-shared-pooler-transaction",
      valid: true,
    });
    expect(result.payload.ready).toBe(true);
    expect(result.evidence.ready).toBe(true);
    expect(result.secretBoundary.ready).toBe(true);
  });

  it("detects service-role material in client/server source before release", async () => {
    const securityModule = await loadSupabaseSecurityModule();
    const baseDir = makeTmpDir();
    writeEvidence(baseDir);
    fs.writeFileSync(
      path.join(baseDir, "src/lib/bad-client.ts"),
      "export const leaked = process.env.SUPABASE_SERVICE_ROLE_KEY;",
    );

    const result = securityModule.evaluateSupabaseSecurityReadiness({
      baseDir,
      envSnapshot: {
        env: {
          DATABASE_URI:
            "postgresql://postgres.projectref:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
          PAYLOAD_SECRET: "long-production-secret",
        },
        sources: { DATABASE_URI: "process", PAYLOAD_SECRET: "process" },
      },
    });

    expect(result.decision).toBe("SUPABASE PRODUCTION DATABASE BLOCKED");
    expect(result.secretBoundary.ready).toBe(false);
    expect(result.secretBoundary.sourceFindings).toEqual(
      expect.arrayContaining([
        { id: "service_role_env", file: "src/lib/bad-client.ts" },
        { id: "service_role_literal", file: "src/lib/bad-client.ts" },
      ]),
    );
  });
});
