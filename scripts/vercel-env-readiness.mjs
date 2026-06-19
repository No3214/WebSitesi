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
  const ready = missingEnv.length === 0 && missingAnyOf.length === 0;

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

  return {
    decision: blockers.length === 0 ? "VERCEL PRODUCTION ENV PASS" : "VERCEL PRODUCTION ENV INCOMPLETE",
    scope: "vercel-production-env-names-only",
    valueValidation: "not_performed",
    candidate,
    productionEnvNames,
    configuredProductionCount: productionEnvNames.length,
    gateResults,
    blockers,
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
    lines.push(
      `${gate.ready ? "PASS" : "BLOCKED"} ${gate.id}: ${gate.configuredCount}/${gate.requiredCount} production env requirements covered`,
    );
    if (gate.configuredEnv.length > 0) lines.push(`  configured env: ${gate.configuredEnv.join(", ")}`);
    if (gate.fallbackEnv.length > 0) lines.push(`  code fallback: ${gate.fallbackEnv.join(", ")}`);
    if (gate.missingEnv.length > 0) lines.push(`  missing env: ${gate.missingEnv.join(", ")}`);
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
