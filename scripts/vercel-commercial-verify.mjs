import { pathToFileURL } from "node:url";

import { runProductionTarget } from "./vercel-production-run.mjs";

export const commercialVercelTargets = [
  {
    id: "env",
    label: "Production env value inventory",
    command: "npm run vercel:env:values:strict",
    strict: true,
  },
  {
    id: "supabase",
    label: "Payload/Supabase production database",
    command: "npm run vercel:supabase:verify",
  },
  {
    id: "abuse",
    label: "Turnstile and Upstash abuse controls",
    command: "npm run vercel:abuse:verify",
  },
  {
    id: "hms",
    label: "HMS booking engine handoff",
    command: "npm run vercel:hms:verify",
  },
  {
    id: "garanti",
    label: "Garanti POS production readiness",
    command: "npm run vercel:garanti:verify",
  },
  {
    id: "analytics",
    label: "Analytics and purchase tracking",
    command: "npm run vercel:analytics:verify",
  },
  {
    id: "search",
    label: "Search Console and local SEO",
    command: "npm run vercel:search:verify",
  },
];

const SECRET_KEY_PATTERN = /\b([A-Z0-9_]*(?:SECRET|TOKEN|KEY|PASSWORD|DATABASE_URI|WEBHOOK)[A-Z0-9_]*)=([^\s,;]+)/gi;
const AUTHORITY_URL_PATTERN = /\b([a-z][a-z0-9+.-]*:\/\/)([^/@\s]+)@/gi;

function redactLine(line) {
  return line
    .replace(SECRET_KEY_PATTERN, "$1=[redacted]")
    .replace(AUTHORITY_URL_PATTERN, "$1[redacted]@");
}

export function summarizeProductionOutput(output = "") {
  const lines = output
    .split(/\r?\n/)
    .map((line) => redactLine(line.trim()))
    .filter(Boolean);
  const decisionLine = lines.find((line) => line.startsWith("Decision:")) || "";
  const safeSignals = lines.filter((line) =>
    /^(Decision|Missing|Target|Configuration source|Expected host|HTTP|Title|Signals|FAIL|PASS|WARN|BLOCKED|INFO)\b/.test(line),
  );

  return {
    decision: decisionLine.replace(/^Decision:\s*/, ""),
    lines: [...new Set(safeSignals)].slice(0, 12),
  };
}

export function runCommercialVercelVerification({
  targets = commercialVercelTargets,
  runTarget = runProductionTarget,
} = {}) {
  const results = targets.map((target) => {
    try {
      const result = runTarget(target.id, { strict: Boolean(target.strict) });
      const summary = summarizeProductionOutput(result.output || "");

      return {
        id: target.id,
        label: target.label,
        command: target.command,
        ok: Boolean(result.ok),
        decision: summary.decision || (result.ok ? "PASS" : "ACTION_REQUIRED"),
        summary: summary.lines,
      };
    } catch (error) {
      return {
        id: target.id,
        label: target.label,
        command: target.command,
        ok: false,
        decision: "RUNNER_ERROR",
        summary: [redactLine(error instanceof Error ? error.message : String(error))],
      };
    }
  });
  const failed = results.filter((result) => !result.ok);

  return {
    decision: failed.length === 0 ? "VERCEL_COMMERCIAL_GATES_PASS" : "VERCEL_COMMERCIAL_GATES_ACTION_REQUIRED",
    targetCount: results.length,
    passedCount: results.length - failed.length,
    failedCount: failed.length,
    failedTargets: failed.map((result) => result.id),
    results,
  };
}

export function formatCommercialVercelVerification(report) {
  const lines = [
    "Kozbeyli Konagi Vercel commercial verification",
    `Decision: ${report.decision}`,
    `Targets: ${report.passedCount}/${report.targetCount} passed`,
  ];

  for (const result of report.results) {
    lines.push("");
    lines.push(`${result.ok ? "PASS" : "FAIL"} ${result.id} - ${result.label}`);
    lines.push(`Command: ${result.command}`);
    lines.push(`Decision: ${result.decision}`);
    for (const summaryLine of result.summary) {
      lines.push(`- ${summaryLine}`);
    }
  }

  return lines.join("\n");
}

function main() {
  const json = process.argv.includes("--json");
  const report = runCommercialVercelVerification();

  console.log(json ? JSON.stringify(report, null, 2) : formatCommercialVercelVerification(report));
  process.exitCode = report.failedCount > 0 ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
