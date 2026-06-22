import fs from "node:fs";
import { pathToFileURL } from "node:url";

import { commercialLaunchGates } from "./commercial-launch-audit.mjs";
import { getVercelCliCandidates, runVercelCandidate } from "./vercel-ops-readiness.mjs";

const PRODUCTION_ENV = "Production";
const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function parseVercelEnvList(output) {
  const rows = [];

  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    const [name] = trimmed.split(/\s+/);
    if (!/^[A-Z][A-Z0-9_]*$/.test(name || "")) continue;

    const environments = unique(
      [...trimmed.matchAll(/\b(Production|Preview|Development)\b/g)].map((match) => match[1]),
    );

    if (environments.length === 0) continue;
    rows.push({ name, environments });
  }

  return rows;
}

export function parseVercelEnvFile(source) {
  const env = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) continue;

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function isProductionConfigured(rows, key) {
  return rows.some((row) => row.name === key && row.environments.includes(PRODUCTION_ENV));
}

function expectedValueKeys(gate) {
  const expectedKeys = new Set(Object.keys(gate.expectedEnv ?? {}));
  return unique([
    ...gate.env.filter((key) => expectedKeys.has(key)),
    ...(gate.envAnyOf ?? []).flatMap((group) => group.keys.filter((key) => expectedKeys.has(key))),
  ]);
}

function valueValidationCommand(gateId) {
  return {
    canonical_domain: "npm run domain:verify:strict",
    production_database: "npm run supabase:verify:strict",
    hms_booking_engine: "npm run hms:verify:strict",
    analytics_purchase: "npm run analytics:verify:strict",
  }[gateId] ?? "npm run launch:audit:strict";
}

function hasMeaningfulValue(value) {
  return Boolean(value && value.trim() && !placeholderPattern.test(value));
}

function validateExpectedValue(gate, key, value) {
  const expected = gate.expectedEnv?.[key];
  if (!expected) return "";
  return new RegExp(expected.pattern).test(value) ? "" : `${key} must match ${expected.label}`;
}

function valueValidationState(gate, rows, valueEnv) {
  const validationKeys = expectedValueKeys(gate).filter((key) => isProductionConfigured(rows, key));
  const configuredRequiredKeys = gate.env.filter((key) => isProductionConfigured(rows, key));
  const configuredAlternativeKeys = (gate.envAnyOf ?? []).flatMap((group) =>
    group.keys.filter((key) => isProductionConfigured(rows, key)),
  );

  if (!valueEnv) {
    return {
      keys: validationKeys,
      status: validationKeys.length > 0 ? "required_not_performed" : "not_required",
      issues: [],
    };
  }

  const issues = [];

  if (configuredRequiredKeys.length === 0 && configuredAlternativeKeys.length === 0) {
    return {
      keys: [],
      status: "not_required",
      issues: [],
    };
  }

  for (const key of configuredRequiredKeys) {
    const value = valueEnv[key] ?? "";
    if (!hasMeaningfulValue(value)) {
      issues.push(`${key} is empty, placeholder or unavailable in the pulled Vercel Production env snapshot`);
      continue;
    }

    const expectedIssue = validateExpectedValue(gate, key, value);
    if (expectedIssue) issues.push(expectedIssue);
  }

  for (const group of gate.envAnyOf ?? []) {
    const configuredKeys = group.keys.filter((key) => isProductionConfigured(rows, key));
    if (configuredKeys.length === 0) continue;

    const validAlternatives = configuredKeys.filter((key) => {
      const value = valueEnv[key] ?? "";
      return hasMeaningfulValue(value) && !validateExpectedValue(gate, key, value);
    });

    if (validAlternatives.length === 0) {
      issues.push(`${configuredKeys.join(" or ")} has no valid non-empty ${group.label} value in the pulled Vercel Production env snapshot`);
    }
  }

  return {
    keys: unique([...configuredRequiredKeys, ...validationKeys]),
    status: issues.length > 0 ? "performed_failed" : "performed_pass",
    issues,
  };
}

function gateEnvState(gate, rows, valueEnv) {
  const missingEnv = [];
  const configuredEnv = [];
  const fallbackEnv = [];

  for (const key of gate.env) {
    if (isProductionConfigured(rows, key)) {
      configuredEnv.push(key);
      continue;
    }

    if (gate.fallbackUrl) {
      fallbackEnv.push(key);
      continue;
    }

    missingEnv.push(key);
  }

  const missingAnyOf = [];
  const configuredAnyOf = [];

  for (const group of gate.envAnyOf ?? []) {
    const configuredKeys = group.keys.filter((key) => isProductionConfigured(rows, key));
    if (configuredKeys.length > 0) {
      configuredAnyOf.push({ label: group.label, keys: configuredKeys });
    } else {
      missingAnyOf.push({ label: group.label, keys: group.keys });
    }
  }

  const requiredCount = gate.env.length + (gate.envAnyOf?.length ?? 0);
  const configuredCount = configuredEnv.length + fallbackEnv.length + configuredAnyOf.length;
  const namesReady = missingEnv.length === 0 && missingAnyOf.length === 0;
  const valueValidation = valueValidationState(gate, rows, valueEnv);
  const ready = namesReady && valueValidation.status !== "required_not_performed" && valueValidation.status !== "performed_failed";

  return {
    id: gate.id,
    label: gate.label,
    requiredCount,
    configuredCount,
    missingCount: requiredCount - configuredCount,
    configuredEnv,
    fallbackEnv,
    missingEnv,
    configuredAnyOf,
    missingAnyOf,
    namesReady,
    valueValidationKeys: valueValidation.keys,
    valueValidationStatus: valueValidation.status,
    valueValidationIssues: valueValidation.issues,
    valueValidationCommand: valueValidation.keys.length > 0 ? valueValidationCommand(gate.id) : "",
    ready,
  };
}

function runVercelEnvList() {
  const errors = [];

  for (const candidate of getVercelCliCandidates()) {
    try {
      return {
        available: true,
        candidate,
        output: runVercelCandidate(candidate, ["env", "ls"], 30000),
        errors: [],
      };
    } catch (error) {
      errors.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    available: false,
    candidate: "",
    output: "",
    errors,
  };
}

export function evaluateVercelEnvReadiness({ output, available = true, candidate = "fixture", errors = [], valueEnv } = {}) {
  if (!available) {
    return {
      decision: "VERCEL ENV INVENTORY UNAVAILABLE",
      scope: "vercel-production-env-names-only",
      valueValidation: "not_performed",
      candidate,
      productionEnvNames: [],
      configuredProductionCount: 0,
      gateResults: [],
      blockers: [
        "Vercel CLI production env inventory is unavailable; run npm i -g vercel, vercel login, then npm run vercel:env.",
      ],
      warnings: [],
      errors,
    };
  }

  const rows = parseVercelEnvList(output || "");
  const productionEnvNames = rows
    .filter((row) => row.environments.includes(PRODUCTION_ENV))
    .map((row) => row.name)
    .sort();
  const gateResults = commercialLaunchGates.map((gate) => gateEnvState(gate, rows, valueEnv));
  const blockers = gateResults.flatMap((gate) => [
    ...gate.missingEnv.map((key) => `${gate.id}: ${key} is missing from Vercel Production env`),
    ...gate.missingAnyOf.map(
      (group) => `${gate.id}: ${group.keys.join(" or ")} is missing from Vercel Production env (${group.label})`,
    ),
    ...gate.valueValidationIssues.map((issue) => `${gate.id}: ${issue}`),
  ]);
  const warnings = gateResults
    .filter((gate) => gate.valueValidationStatus === "required_not_performed")
    .map(
      (gate) =>
        `${gate.id}: ${gate.valueValidationKeys.join(", ")} present by name only; Vercel hides values, so validate deployed values with ${gate.valueValidationCommand}`,
    );

  let decision = "VERCEL PRODUCTION ENV PASS";
  if (blockers.length > 0) {
    decision = "VERCEL PRODUCTION ENV INCOMPLETE";
  } else if (warnings.length > 0) {
    decision = "VERCEL PRODUCTION ENV NAMES PASS - VALUE VALIDATION REQUIRED";
  }

  return {
    decision,
    scope: valueEnv ? "vercel-production-env-names-and-pulled-values" : "vercel-production-env-names-only",
    valueValidation: valueEnv ? "performed_without_value_output" : "not_performed",
    candidate,
    productionEnvNames,
    configuredProductionCount: productionEnvNames.length,
    gateResults,
    blockers,
    warnings,
    errors: [],
  };
}

export function formatVercelEnvReadiness(result) {
  const lines = [
    "Kozbeyli Konagi Vercel production env readiness",
    `Decision: ${result.decision}`,
    `Scope: ${result.scope}; secret values are never printed`,
    `CLI candidate: ${result.candidate || "unavailable"}`,
    `Production env names configured: ${result.configuredProductionCount}`,
    "",
    "Gates:",
  ];

  if (result.gateResults.length === 0) {
    lines.push("- no gate inventory available");
  }

  for (const gate of result.gateResults) {
    const status = gate.ready ? "PASS" : gate.namesReady ? "VERIFY" : "BLOCKED";
    lines.push(
      `${status} ${gate.id}: ${gate.configuredCount}/${gate.requiredCount} production env requirements covered`,
    );
    if (gate.configuredEnv.length > 0) lines.push(`  configured env: ${gate.configuredEnv.join(", ")}`);
    if (gate.fallbackEnv.length > 0) lines.push(`  code fallback: ${gate.fallbackEnv.join(", ")}`);
    if (gate.missingEnv.length > 0) lines.push(`  missing env: ${gate.missingEnv.join(", ")}`);
    if (gate.valueValidationKeys.length > 0) {
      lines.push(
        `  value validation required: ${gate.valueValidationKeys.join(", ")} (${gate.valueValidationCommand})`,
      );
    }
    if (gate.valueValidationIssues?.length > 0) {
      lines.push(`  value validation blockers: ${gate.valueValidationIssues.join("; ")}`);
    }
    if (gate.configuredAnyOf.length > 0) {
      lines.push(
        `  configured alternatives: ${gate.configuredAnyOf
          .map((group) => `${group.label} via ${group.keys.join(", ")}`)
          .join("; ")}`,
      );
    }
    if (gate.missingAnyOf.length > 0) {
      lines.push(
        `  missing alternatives: ${gate.missingAnyOf
          .map((group) => `${group.label} (${group.keys.join(" or ")})`)
          .join("; ")}`,
      );
    }
  }

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
  const strict = process.argv.includes("--strict");
  const json = process.argv.includes("--json");
  const envFileArgIndex = process.argv.indexOf("--env-file");
  const envFile = envFileArgIndex >= 0 ? process.argv[envFileArgIndex + 1] : "";
  const inventory = runVercelEnvList();
  const valueEnv = envFile ? parseVercelEnvFile(fs.readFileSync(envFile, "utf8")) : undefined;
  const result = evaluateVercelEnvReadiness({ ...inventory, valueEnv });

  console.log(json ? JSON.stringify(result, null, 2) : formatVercelEnvReadiness(result));
  process.exitCode = strict && result.decision !== "VERCEL PRODUCTION ENV PASS" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
