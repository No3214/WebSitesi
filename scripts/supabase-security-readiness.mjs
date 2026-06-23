import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const envFiles = [".env.production.local", ".env.production", ".env.local", ".env"];
const evidencePath = "docs/evidence/production-database.md";
const sourceDirs = ["src", "payload"];
const ignoredDirs = new Set(["node_modules", ".next", ".git", "test-results", "playwright-report"]);

export function parseEnvFile(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        return [key, value];
      }),
  );
}

export function loadEnvFileSnapshot(envFile, baseSnapshot = loadEnvSnapshot()) {
  const parsed = parseEnvFile(fs.readFileSync(envFile, "utf8"));
  const source = path.basename(envFile);

  return {
    env: {
      ...baseSnapshot.env,
      ...parsed,
    },
    sources: {
      ...baseSnapshot.sources,
      ...Object.fromEntries(Object.keys(parsed).map((key) => [key, source])),
    },
  };
}

export function loadProcessEnvSnapshot(source = process.env) {
  const env = {};
  const sources = {};

  for (const [key, value] of Object.entries(source)) {
    if (typeof value !== "string") continue;
    env[key] = value;
    sources[key] = "process-env";
  }

  return { env, sources };
}

export function loadEnvSnapshot(baseDir = root) {
  const snapshot = { ...process.env };
  const sources = {};

  for (const file of envFiles) {
    const fullPath = path.join(baseDir, file);
    if (!fs.existsSync(fullPath)) continue;
    const parsed = parseEnvFile(fs.readFileSync(fullPath, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (!snapshot[key]) {
        snapshot[key] = value;
        sources[key] = file;
      }
    }
  }

  return { env: snapshot, sources };
}

function classifyDatabaseUri(value) {
  if (!value) {
    return {
      configured: false,
      valid: false,
      provider: "missing",
      mode: "missing",
      problem: "DATABASE_URI is missing",
    };
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return {
      configured: true,
      valid: false,
      provider: "invalid",
      mode: "invalid",
      problem: "DATABASE_URI is not a valid URL",
    };
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return {
      configured: true,
      valid: false,
      provider: "invalid",
      mode: "invalid",
      problem: "DATABASE_URI must use postgres:// or postgresql://",
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
  const isLocal = localHosts.has(hostname) || hostname.startsWith("127.");
  if (isLocal) {
    return {
      configured: true,
      valid: false,
      provider: "local",
      mode: "local",
      problem: "DATABASE_URI points to localhost and is not production database evidence",
    };
  }

  const isSupabase = hostname.includes("supabase.co") || hostname.includes("pooler.supabase.com");
  const provider = isSupabase ? "supabase" : "managed-postgres";
  let mode = "managed";

  if (hostname.includes("pooler.supabase.com")) {
    mode = parsed.port === "6543" ? "supabase-shared-pooler-transaction" : "supabase-shared-pooler-session";
  } else if (hostname.startsWith("db.") && hostname.endsWith(".supabase.co")) {
    mode = parsed.port === "6543" ? "supabase-dedicated-pooler-transaction" : "supabase-direct";
  }

  return {
    configured: true,
    valid: true,
    provider,
    mode,
    problem: "",
  };
}

function readIfExists(relPath, baseDir = root) {
  const fullPath = path.join(baseDir, relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function evidenceState(baseDir = root) {
  const content = readIfExists(evidencePath, baseDir).trim();
  if (!content) return { ready: false, reason: "missing", path: evidencePath };

  const ready = /status:\s*ready/i.test(content);
  const sourceRefsReady =
    /^source_refs:\s*\S+/im.test(content) &&
    !/^source_refs:\s*(pending|todo|tbd|none|<.*>)\s*$/im.test(content);
  const requiredSectionsReady = ["## Summary", "## Proof", "## Residual Risk"].every((section) =>
    content.includes(section),
  );

  return {
    ready: ready && sourceRefsReady && requiredSectionsReady,
    reason: ready
      ? sourceRefsReady
        ? requiredSectionsReady
          ? "ready"
          : "missing required sections"
        : "missing source refs"
      : "pending status",
    path: evidencePath,
  };
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) files.push(...listFiles(fullPath));
    } else if (/\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function scanSourceForSecretBoundary(baseDir = root) {
  const findings = [];
  const sensitivePatterns = [
    { id: "service_role_env", pattern: /SUPABASE_SERVICE_ROLE_KEY/ },
    { id: "service_role_literal", pattern: /service[_-]?role/i },
    { id: "public_service_key", pattern: /NEXT_PUBLIC_SUPABASE_SERVICE/i },
  ];

  for (const relDir of sourceDirs) {
    for (const file of listFiles(path.join(baseDir, relDir))) {
      const content = fs.readFileSync(file, "utf8");
      for (const pattern of sensitivePatterns) {
        if (pattern.pattern.test(content)) {
          findings.push({
            id: pattern.id,
            file: path.relative(baseDir, file).replace(/\\/g, "/"),
          });
        }
      }
    }
  }

  return findings;
}

function payloadContracts(baseDir = root) {
  const payloadConfig = readIfExists("payload.config.ts", baseDir);
  const envSource = readIfExists("src/lib/env.ts", baseDir);

  const checks = [
    {
      id: "payload_uses_postgres_adapter",
      ready: payloadConfig.includes("postgresAdapter"),
      detail: "payload.config.ts",
    },
    {
      id: "payload_uses_database_uri",
      ready: payloadConfig.includes("connectionString: env.DATABASE_URI"),
      detail: "payload.config.ts",
    },
    {
      id: "payload_uses_payload_secret",
      ready: payloadConfig.includes("secret: env.PAYLOAD_SECRET"),
      detail: "payload.config.ts",
    },
    {
      id: "production_requires_database_uri",
      ready: envSource.includes('requireEnv("DATABASE_URI"'),
      detail: "src/lib/env.ts",
    },
    {
      id: "production_requires_payload_secret",
      ready: envSource.includes('requireEnv("PAYLOAD_SECRET"'),
      detail: "src/lib/env.ts",
    },
  ];

  return {
    ready: checks.every((check) => check.ready),
    checks,
  };
}

export function evaluateSupabaseSecurityReadiness({
  envSnapshot = loadEnvSnapshot(),
  baseDir = root,
} = {}) {
  const database = classifyDatabaseUri(envSnapshot.env.DATABASE_URI || "");
  const payload = payloadContracts(baseDir);
  const evidence = evidenceState(baseDir);
  const sourceFindings = scanSourceForSecretBoundary(baseDir);
  const publicServiceRoleEnv = Object.keys(envSnapshot.env).filter((key) =>
    /^NEXT_PUBLIC_.*SERVICE.*ROLE/i.test(key),
  );
  const serviceRoleConfigured = Boolean(envSnapshot.env.SUPABASE_SERVICE_ROLE_KEY);
  const payloadSecretConfigured = Boolean(envSnapshot.env.PAYLOAD_SECRET?.trim());
  const blockers = [];
  const warnings = [];

  if (!database.valid) blockers.push(database.problem);
  if (!payloadSecretConfigured) blockers.push("PAYLOAD_SECRET is missing");
  if (!payload.ready) blockers.push("Payload Postgres source contracts are incomplete");
  if (!evidence.ready) blockers.push(`${evidence.path} (${evidence.reason})`);
  for (const finding of sourceFindings) {
    blockers.push(`Potential Supabase service-role exposure in ${finding.file} (${finding.id})`);
  }
  for (const key of publicServiceRoleEnv) {
    blockers.push(`${key} must not be public`);
  }

  if (serviceRoleConfigured) {
    warnings.push("SUPABASE_SERVICE_ROLE_KEY is configured in this process; verify it exists only in backend/serverless environments.");
  }
  if (database.valid && database.provider !== "supabase") {
    warnings.push("DATABASE_URI is managed Postgres but not detected as a Supabase host; confirm backup, region and pooling evidence manually.");
  }
  if (database.valid && database.mode.includes("transaction")) {
    warnings.push("Supabase transaction pooler is suitable for serverless traffic; verify the Payload adapter does not rely on prepared statements in production.");
  }

  return {
    decision: blockers.length === 0 ? "SUPABASE PRODUCTION DATABASE READY" : "SUPABASE PRODUCTION DATABASE BLOCKED",
    database,
    envSources: {
      DATABASE_URI: envSnapshot.sources.DATABASE_URI || (envSnapshot.env.DATABASE_URI ? "process" : "missing"),
      PAYLOAD_SECRET: envSnapshot.sources.PAYLOAD_SECRET || (envSnapshot.env.PAYLOAD_SECRET ? "process" : "missing"),
    },
    payload,
    evidence,
    secretBoundary: {
      ready: sourceFindings.length === 0 && publicServiceRoleEnv.length === 0,
      sourceFindings,
      publicServiceRoleEnv,
      serviceRoleConfigured,
    },
    blockers,
    warnings,
  };
}

export function formatSupabaseSecurityReadiness(result) {
  const lines = [
    "Kozbeyli Konagi Supabase/Payload database security readiness",
    `Decision: ${result.decision}`,
    `Database provider: ${result.database.provider}`,
    `Database mode: ${result.database.mode}`,
    `DATABASE_URI source: ${result.envSources.DATABASE_URI}`,
    `PAYLOAD_SECRET source: ${result.envSources.PAYLOAD_SECRET}`,
    "",
    "Payload source contracts:",
  ];

  for (const check of result.payload.checks) {
    lines.push(`- ${check.ready ? "PASS" : "FAIL"} ${check.id} (${check.detail})`);
  }

  lines.push("");
  lines.push(`Evidence: ${result.evidence.ready ? "PASS" : "BLOCKED"} ${result.evidence.path} (${result.evidence.reason})`);
  lines.push(`Secret boundary: ${result.secretBoundary.ready ? "PASS" : "BLOCKED"}`);

  if (result.warnings.length > 0) {
    lines.push("");
    lines.push("Warnings:");
    result.warnings.forEach((warning) => lines.push(`- ${warning}`));
  }

  if (result.blockers.length > 0) {
    lines.push("");
    lines.push("Blockers:");
    result.blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  }

  return lines.join("\n");
}

function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const fromProcessEnv = process.argv.includes("--from-process-env");
  const envFileArgIndex = process.argv.indexOf("--env-file");
  const envFile = envFileArgIndex >= 0 ? process.argv[envFileArgIndex + 1] : "";
  const envSnapshot = envFile ? loadEnvFileSnapshot(envFile) : fromProcessEnv ? loadProcessEnvSnapshot() : loadEnvSnapshot();
  const result = evaluateSupabaseSecurityReadiness({ envSnapshot });
  console.log(json ? JSON.stringify(result, null, 2) : formatSupabaseSecurityReadiness(result));
  process.exitCode = strict && result.decision !== "SUPABASE PRODUCTION DATABASE READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
