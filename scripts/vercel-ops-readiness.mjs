import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const INSTALL_COMMAND = "npm i -g vercel";

const REQUIRED_PROJECT = {
  projectName: "kozbeyli-konagi",
  projectIdPrefix: "prj_",
  orgIdPrefix: "team_",
};

const REQUIRED_SCRIPTS = [
  "domain:verify",
  "domain:verify:strict",
  "launch:smoke:live",
  "release:verify",
];

const REQUIRED_ENV_EXAMPLE_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "GA4_MEASUREMENT_ID",
  "GA4_API_SECRET",
  "GOOGLE_SITE_VERIFICATION",
];

function readFile(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function readJson(relPath) {
  return JSON.parse(readFile(relPath));
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function checkProjectBinding() {
  if (!exists(".vercel/project.json")) {
    return {
      id: "project_binding",
      status: "fail",
      detail: ".vercel/project.json is missing.",
      remediation: "Run vercel link after authenticating with the correct Vercel team.",
    };
  }

  try {
    const project = readJson(".vercel/project.json");
    const failures = [];

    if (project.projectName !== REQUIRED_PROJECT.projectName) {
      failures.push(`projectName=${project.projectName || "missing"}`);
    }
    if (!String(project.projectId || "").startsWith(REQUIRED_PROJECT.projectIdPrefix)) {
      failures.push("projectId is missing or invalid");
    }
    if (!String(project.orgId || "").startsWith(REQUIRED_PROJECT.orgIdPrefix)) {
      failures.push("orgId is missing or invalid");
    }

    return failures.length === 0
      ? {
          id: "project_binding",
          status: "pass",
          detail: `Linked to ${project.projectName} (${project.projectId}).`,
        }
      : {
          id: "project_binding",
          status: "fail",
          detail: failures.join("; "),
          remediation: "Run vercel link and select the kozbeyli-konagi project.",
        };
  } catch (error) {
    return {
      id: "project_binding",
      status: "fail",
      detail: `Could not parse .vercel/project.json: ${error instanceof Error ? error.message : String(error)}`,
      remediation: "Regenerate the project link with vercel link.",
    };
  }
}

function checkGlobalCli() {
  try {
    const version = execFileSync("vercel", ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10000,
    }).trim();

    return {
      id: "global_vercel_cli",
      status: "pass",
      detail: `Vercel CLI available: ${version}.`,
    };
  } catch (error) {
    return {
      id: "global_vercel_cli",
      status: "warn",
      detail: "Global Vercel CLI is not available on PATH.",
      remediation: `${INSTALL_COMMAND} unlocks vercel env pull, vercel deploy and vercel logs.`,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function checkPackageScripts() {
  const packageJson = readJson("package.json");
  const missing = REQUIRED_SCRIPTS.filter((script) => !packageJson.scripts?.[script]);

  return missing.length === 0
    ? {
        id: "vercel_npm_scripts",
        status: "pass",
        detail: `Required scripts present: ${REQUIRED_SCRIPTS.join(", ")}.`,
      }
    : {
        id: "vercel_npm_scripts",
        status: "fail",
        detail: `Missing scripts: ${missing.join(", ")}.`,
        remediation: "Restore the Vercel/domain verification scripts in package.json.",
      };
}

function checkEnvExample() {
  const envExample = exists(".env.example") ? readFile(".env.example") : "";
  const missing = REQUIRED_ENV_EXAMPLE_KEYS.filter(
    (key) => !new RegExp(`^${key}=`, "m").test(envExample),
  );

  return missing.length === 0
    ? {
        id: "vercel_env_contract",
        status: "pass",
        detail: "Production Vercel env keys are documented in .env.example.",
      }
    : {
        id: "vercel_env_contract",
        status: "fail",
        detail: `Missing .env.example keys: ${missing.join(", ")}.`,
        remediation: "Document required Vercel environment variables before deployment handoff.",
      };
}

function readEvidenceStatus(relPath) {
  if (!exists(relPath)) return "";
  return readFile(relPath).match(/^status:\s*(\w+)/im)?.[1]?.toLowerCase() || "";
}

function checkCanonicalEvidence() {
  const relPath = "docs/evidence/canonical-domain.md";
  const status = readEvidenceStatus(relPath);

  if (!status) {
    return {
      id: "canonical_domain_evidence",
      status: "warn",
      detail: `${relPath} is missing a status line.`,
      remediation: "Keep canonical domain evidence pending until domain:verify:strict passes.",
    };
  }

  return status === "ready"
    ? {
        id: "canonical_domain_evidence",
        status: "pass",
        detail: `${relPath} is marked ready.`,
      }
    : {
        id: "canonical_domain_evidence",
        status: "warn",
        detail: `${relPath} status is ${status}.`,
        remediation: "Run npm run domain:verify:strict after DNS/Vercel cutover, then update evidence.",
      };
}

export function evaluateVercelOpsReadiness() {
  const checks = [
    checkProjectBinding(),
    checkGlobalCli(),
    checkPackageScripts(),
    checkEnvExample(),
    checkCanonicalEvidence(),
  ];
  const failures = checks.filter((check) => check.status === "fail");
  const warnings = checks.filter((check) => check.status === "warn");

  return {
    decision: failures.length > 0 ? "FAIL" : warnings.length > 0 ? "PASS_WITH_WARNINGS" : "PASS",
    installCommand: INSTALL_COMMAND,
    checks,
    failures,
    warnings,
  };
}

export function formatVercelOpsReadiness(result) {
  const lines = [
    "Kozbeyli Konagi Vercel operations readiness",
    `Decision: ${result.decision}`,
    `Install command: ${result.installCommand}`,
    "",
    "Checks:",
  ];

  for (const check of result.checks) {
    lines.push(`${check.status.toUpperCase()} ${check.id}: ${check.detail}`);
    if (check.remediation) lines.push(`  remediation: ${check.remediation}`);
  }

  return lines.join("\n");
}

async function main() {
  const strict = process.argv.includes("--strict");
  const json = process.argv.includes("--json");
  const result = evaluateVercelOpsReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatVercelOpsReadiness(result));
  process.exit(result.failures.length > 0 || (strict && result.warnings.length > 0) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void main();
}
