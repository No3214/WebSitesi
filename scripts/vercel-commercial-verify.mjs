import { pathToFileURL } from "node:url";

import { runProductionTarget } from "./vercel-production-run.mjs";

export const commercialVercelTargets = [
  {
    id: "env",
    label: "Production env value inventory",
    command: "npm run vercel:env:values:strict",
    strict: true,
    gateIds: [
      "canonical_domain",
      "production_database",
      "production_abuse_controls",
      "hms_booking_engine",
      "garanti_pos",
      "analytics_purchase",
      "search_local_seo",
    ],
    nextActions: [
      "Run npm run launch:cutover:json for the complete per-gate env, evidence and owner checklist.",
      "Add or repair the missing Production env names in Vercel without pulling secrets into the repository.",
      "Rerun npm run vercel:commercial:verify after every env group is updated.",
    ],
    evidence: [
      "docs/evidence/canonical-domain.md",
      "docs/evidence/production-database.md",
      "docs/evidence/production-abuse-controls.md",
      "docs/evidence/hms-booking-engine.md",
      "docs/evidence/garanti-pos.md",
      "docs/evidence/analytics-purchase.md",
      "docs/evidence/search-local-seo.md",
    ],
  },
  {
    id: "supabase",
    label: "Payload/Supabase production database",
    command: "npm run vercel:supabase:verify",
    gateIds: ["production_database"],
    nextActions: [
      "Set Vercel Production DATABASE_URI to the managed Supabase pooled Postgres connection string.",
      "Set a long random PAYLOAD_SECRET in Vercel Production.",
      "Complete redacted Payload admin and lead persistence evidence.",
    ],
    evidence: ["docs/evidence/production-database.md"],
  },
  {
    id: "abuse",
    label: "Turnstile and Upstash abuse controls",
    command: "npm run vercel:abuse:verify",
    gateIds: ["production_abuse_controls"],
    nextActions: [
      "Create production Turnstile keys for the canonical domain.",
      "Provision shared Upstash Redis REST credentials for rate-limit and replay controls.",
      "Run a real allowed and blocked lead-form UAT without logging secrets.",
    ],
    evidence: ["docs/evidence/production-abuse-controls.md"],
  },
  {
    id: "hms",
    label: "HMS booking engine handoff",
    command: "npm run vercel:hms:verify",
    gateIds: ["hms_booking_engine"],
    nextActions: [
      "Verify all reservation CTAs open the approved Kozbeyli HMS booking engine in a new tab.",
      "Run a redacted booking UAT for dates, guests, room/rate selection and fallback behavior.",
      "Keep WhatsApp and phone fallback visible until booking evidence is ready.",
    ],
    evidence: ["docs/evidence/hms-booking-engine.md"],
  },
  {
    id: "garanti",
    label: "Garanti POS production readiness",
    command: "npm run vercel:garanti:verify",
    gateIds: ["garanti_pos"],
    nextActions: [
      "Add Garanti POS mode, merchant, terminal, provision user and 3D Store Key in Vercel Production or approved sandbox.",
      "Prove success, declined, callback signature and refund/cancel payment flows with redacted evidence.",
      "Do not commit card, bank or POS secret material.",
    ],
    evidence: ["docs/evidence/garanti-pos.md"],
  },
  {
    id: "analytics",
    label: "Analytics and purchase tracking",
    command: "npm run vercel:analytics:verify",
    gateIds: ["analytics_purchase"],
    nextActions: [
      "Confirm GTM or direct Google tag, GA4, Google Ads and Meta Pixel production IDs.",
      "Add GA4 Measurement Protocol secret only in Vercel Production.",
      "Validate consent-gated pageview, lead and purchase events in provider debug tools.",
    ],
    evidence: ["docs/evidence/analytics-purchase.md"],
  },
  {
    id: "search",
    label: "Search Console and local SEO",
    command: "npm run vercel:search:verify",
    gateIds: ["search_local_seo"],
    nextActions: [
      "Add the Google site verification token in Vercel Production.",
      "Submit the production sitemap after canonical DNS is confirmed.",
      "Record Search Console, Google Business Profile and Hotel Center ownership/status evidence.",
    ],
    evidence: ["docs/evidence/search-local-seo.md"],
  },
];

const SECRET_KEY_PATTERN = /\b([A-Z0-9_]*(?:SECRET|TOKEN|KEY|PASSWORD|DATABASE_URI|WEBHOOK)[A-Z0-9_]*)=([^\s,;]+)/gi;
const AUTHORITY_URL_PATTERN = /\b([a-z][a-z0-9+.-]*:\/\/)([^/@\s]+)@/gi;

function redactLine(line) {
  return line
    .replace(SECRET_KEY_PATTERN, "$1=[redacted]")
    .replace(AUTHORITY_URL_PATTERN, "$1[redacted]@");
}

function redactList(items = []) {
  return items.map((item) => redactLine(String(item)));
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
        gateIds: [...(target.gateIds || [])],
        nextActions: result.ok ? [] : redactList(target.nextActions),
        evidence: result.ok ? [] : redactList(target.evidence),
      };
    } catch (error) {
      return {
        id: target.id,
        label: target.label,
        command: target.command,
        ok: false,
        decision: "RUNNER_ERROR",
        summary: [redactLine(error instanceof Error ? error.message : String(error))],
        gateIds: [...(target.gateIds || [])],
        nextActions: redactList(target.nextActions),
        evidence: redactList(target.evidence),
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
    if (!result.ok && result.gateIds.length > 0) {
      lines.push(`Gate IDs: ${result.gateIds.join(", ")}`);
    }
    if (!result.ok && result.nextActions.length > 0) {
      lines.push("Next actions:");
      for (const action of result.nextActions) {
        lines.push(`- ${action}`);
      }
    }
    if (!result.ok && result.evidence.length > 0) {
      lines.push("Evidence:");
      for (const item of result.evidence) {
        lines.push(`- ${item}`);
      }
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
