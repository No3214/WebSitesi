import { pathToFileURL } from "node:url";

import { commercialLaunchGates } from "./commercial-launch-audit.mjs";
import { getVercelCliCandidates, runVercelCandidate } from "./vercel-ops-readiness.mjs";

const PRODUCTION_ENV = "Production";

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

function gateEnvState(gate, rows) {
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
  const valueValidationKeys = expectedValueKeys(gate).filter((key) => isProductionConfigured(rows, key));
  const valueValidationStatus = valueValidationKeys.length > 0 ? "required_not_performed" : "not_required";
  const ready = namesReady && valueValidationStatus !== "required_not_performed";

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
    valueValidationKeys,
    valueValidationStatus,
    valueValidationCommand: valueValidationKeys.length > 0 ? valueValidationCommand(gate.id) : "",
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

export function evaluateVercelEnvReadiness({ output, available = true, candidate = "fixture", errors = [] } = {}) {
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
  const gateResults = commercialLaunchGates.map((gate) => gateEnvState(gate, rows));
  const blockers = gateResults.flatMap((gate) => [
    ...gate.missingEnv.map((key) => `${gate.id}: ${key} is missing from Vercel Production env`),
    ...gate.missingAnyOf.map(
      (group) => `${gate.id}: ${group.keys.join(" or ")} is missing from Vercel Production env (${group.label})`,
    ),
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
    scope: "vercel-production-env-names-only",
    valueValidation: "not_performed",
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
    `Scope: ${result.scope}; values are not read or validated`,
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
  const inventory = runVercelEnvList();
  const result = evaluateVercelEnvReadiness(inventory);

  console.log(json ? JSON.stringify(result, null, 2) : formatVercelEnvReadiness(result));
  process.exitCode = strict && result.decision !== "VERCEL PRODUCTION ENV PASS" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
