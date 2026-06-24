import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REQUIRED_DOCS = [
  "docs/codex/design-brief.md",
  "docs/codex/site-audit.md",
  "docs/codex/tooling-report.md",
  "docs/codex/web-guidelines-review.md",
];

const REQUIRED_PACKAGE_SCRIPTS = [
  "codex:tooling",
  "codex:tooling:json",
];

function readFile(rootDir, relPath) {
  return fs.readFileSync(path.join(rootDir, relPath), "utf8");
}

function readJson(rootDir, relPath) {
  return JSON.parse(readFile(rootDir, relPath));
}

function exists(rootDir, relPath) {
  return fs.existsSync(path.join(rootDir, relPath));
}

function parseTomlValue(rawValue) {
  const value = rawValue.replace(/\s+#.*$/, "").trim();

  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (value.startsWith("\"") && value.endsWith("\"")) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }

  return value;
}

export function parseTomlSections(text) {
  const sections = {};
  let currentSection = "";

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      sections[currentSection] ||= {};
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (!keyMatch || !currentSection) continue;

    sections[currentSection][keyMatch[1]] = parseTomlValue(keyMatch[2]);
  }

  return sections;
}

function checkProjectConfig(rootDir) {
  const relPath = ".codex/config.toml";

  if (!exists(rootDir, relPath)) {
    return {
      id: "codex_config_exists",
      status: "fail",
      detail: ".codex/config.toml is missing.",
      remediation: "Restore the project-scoped Codex MCP configuration.",
    };
  }

  return {
    id: "codex_config_exists",
    status: "pass",
    detail: ".codex/config.toml is present.",
  };
}

function getServer(sections, name) {
  return sections[`mcp_servers.${name}`];
}

function includesAll(values, requiredValues) {
  return requiredValues.every((requiredValue) => values.includes(requiredValue));
}

function checkMcpServer({ sections, name, requiredArgs, requiredDisabled = false }) {
  const server = getServer(sections, name);

  if (!server) {
    return {
      id: `mcp_${name}`,
      status: "fail",
      detail: `${name} MCP server is not configured.`,
      remediation: `Restore [mcp_servers.${name}] in .codex/config.toml.`,
    };
  }

  const args = Array.isArray(server.args) ? server.args : [];
  const failures = [];

  if (requiredDisabled) {
    if (server.enabled !== false) failures.push("enabled must be false");
  } else {
    if (server.enabled !== true) failures.push("enabled must be true");
  }

  if (server.required !== false) failures.push("required must be false");
  if (server.command !== "cmd") failures.push("command must be cmd on this Windows project");
  if (!includesAll(args, requiredArgs)) failures.push(`args missing ${requiredArgs.join(", ")}`);

  return failures.length === 0
    ? {
        id: `mcp_${name}`,
        status: "pass",
        detail: `${name} MCP server is configured with the expected non-blocking guardrails.`,
      }
    : {
        id: `mcp_${name}`,
        status: "fail",
        detail: failures.join("; "),
        remediation: `Fix [mcp_servers.${name}] in .codex/config.toml.`,
      };
}

function checkNoMotionServer(sections) {
  return getServer(sections, "motion-ai")
    ? {
        id: "motion_not_live_mcp",
        status: "fail",
        detail: "motion-ai is configured as a live MCP server.",
        remediation: "Remove [mcp_servers.motion-ai]; the official motion-ai command is an authenticated installer, not a verified project MCP server.",
      }
    : {
        id: "motion_not_live_mcp",
        status: "pass",
        detail: "Motion AI Kit is gated as an authenticated installer, not declared as a live MCP server.",
      };
}

function checkMotionDocs(rootDir, env) {
  const relPath = "docs/codex/tooling-report.md";

  if (!exists(rootDir, relPath)) {
    return {
      id: "motion_tooling_report",
      status: "fail",
      detail: `${relPath} is missing.`,
      remediation: "Restore Motion AI Kit installation guidance before enabling Motion.",
    };
  }

  const text = readFile(rootDir, relPath);
  const requiredText = ["npx motion-ai", "MOTION_TOKEN", "Motion+"];
  const missing = requiredText.filter((item) => !text.includes(item));

  if (missing.length > 0) {
    return {
      id: "motion_tooling_report",
      status: "fail",
      detail: `Motion tooling report is missing: ${missing.join(", ")}.`,
      remediation: "Document the official installer, token gate and review requirement.",
    };
  }

  return {
    id: "motion_tooling_report",
    status: "pass",
    detail: env.MOTION_TOKEN
      ? "Motion AI Kit is documented and MOTION_TOKEN is available for a reviewed manual installer run."
      : "Motion AI Kit is documented and remains safely gated because MOTION_TOKEN is not set.",
  };
}

function checkCodexDocs(rootDir) {
  const missing = REQUIRED_DOCS.filter((relPath) => !exists(rootDir, relPath));

  return missing.length === 0
    ? {
        id: "codex_docs",
        status: "pass",
        detail: `Codex design/audit/tooling docs present: ${REQUIRED_DOCS.join(", ")}.`,
      }
    : {
        id: "codex_docs",
        status: "fail",
        detail: `Missing Codex docs: ${missing.join(", ")}.`,
        remediation: "Restore the repo-local Codex audit and tooling documentation.",
      };
}

function checkAgentsTooling(rootDir) {
  const relPath = "AGENTS.md";

  if (!exists(rootDir, relPath)) {
    return {
      id: "agents_tooling_rules",
      status: "fail",
      detail: "AGENTS.md is missing.",
      remediation: "Restore repo-local operating instructions.",
    };
  }

  const text = readFile(rootDir, relPath);
  const requiredText = ["### Project Tooling", ".codex/config.toml", "MOTION_TOKEN", "AI-generated output"];
  const missing = requiredText.filter((item) => !text.includes(item));

  return missing.length === 0
    ? {
        id: "agents_tooling_rules",
        status: "pass",
        detail: "AGENTS.md records the project tooling and Motion/media provenance guardrails.",
      }
    : {
        id: "agents_tooling_rules",
        status: "fail",
        detail: `AGENTS.md tooling rules missing: ${missing.join(", ")}.`,
        remediation: "Restore the Project Tooling section in AGENTS.md.",
      };
}

function checkPackageScripts(rootDir) {
  const packageJson = readJson(rootDir, "package.json");
  const missing = REQUIRED_PACKAGE_SCRIPTS.filter((script) => !packageJson.scripts?.[script]);

  return missing.length === 0
    ? {
        id: "package_scripts",
        status: "pass",
        detail: `Required Codex tooling scripts present: ${REQUIRED_PACKAGE_SCRIPTS.join(", ")}.`,
      }
    : {
        id: "package_scripts",
        status: "fail",
        detail: `Missing package scripts: ${missing.join(", ")}.`,
        remediation: "Restore codex:tooling scripts in package.json.",
      };
}

export function evaluateCodexToolingReadiness({ rootDir = process.cwd(), env = process.env } = {}) {
  const checks = [checkProjectConfig(rootDir)];
  let sections = {};

  if (checks[0].status === "pass") {
    sections = parseTomlSections(readFile(rootDir, ".codex/config.toml"));
    checks.push(
      checkMcpServer({
        sections,
        name: "shadcn",
        requiredArgs: ["npx", "-y", "shadcn@latest", "mcp"],
      }),
      checkMcpServer({
        sections,
        name: "chrome-devtools",
        requiredArgs: [
          "npx",
          "-y",
          "chrome-devtools-mcp@latest",
          "--no-usage-statistics",
          "--isolated",
          "--redact-network-headers",
        ],
      }),
      checkMcpServer({
        sections,
        name: "magic",
        requiredArgs: ["npx", "-y", "@21st-dev/magic@latest"],
        requiredDisabled: true,
      }),
      checkNoMotionServer(sections),
    );
  }

  checks.push(
    checkMotionDocs(rootDir, env),
    checkCodexDocs(rootDir),
    checkAgentsTooling(rootDir),
    checkPackageScripts(rootDir),
  );

  const failures = checks.filter((check) => check.status === "fail");
  const warnings = checks.filter((check) => check.status === "warn");

  return {
    decision: failures.length > 0 ? "FAIL" : warnings.length > 0 ? "PASS_WITH_WARNINGS" : "PASS",
    checks,
    failures,
    warnings,
  };
}

export function formatCodexToolingReadiness(result) {
  const lines = [
    "Kozbeyli Konagi Codex tooling readiness",
    `Decision: ${result.decision}`,
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
  const result = evaluateCodexToolingReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatCodexToolingReadiness(result));
  process.exit(result.failures.length > 0 || (strict && result.warnings.length > 0) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void main();
}
