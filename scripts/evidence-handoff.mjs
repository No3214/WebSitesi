import { pathToFileURL } from "node:url";

import { evaluateCommercialLaunch } from "./commercial-launch-audit.mjs";
import { buildProductionCutoverPlan } from "./production-cutover-plan.mjs";

export const requiredEvidenceSections = [
  "status: ready",
  "date: YYYY-MM-DD",
  "owner: <person/team>",
  "source_refs: <redacted-source-ids>",
  "## Summary",
  "## Proof",
  "## Residual Risk",
];

export const safeEvidenceRules = [
  "Do not commit secrets, raw credentials, database URLs, JWT/access tokens, service-role keys, card data, customer PII, private contracts, bank portal dumps or private guest data.",
  "Use redacted ticket IDs, dashboard permalink IDs, approval note IDs, UAT run IDs or source-system references.",
  "Keep source screenshots, contracts, payment portal details, raw callback/log dumps and guest records in the source system; store only redacted summaries and references here.",
];

function blockedPointsForGate(gate) {
  return Math.max(0, Number(gate.points || 0) - Number(gate.awardedPoints || 0));
}

function indexSteps(plan) {
  return new Map((plan.gateSteps || []).map((step) => [step.id, step]));
}

function redactionSummary(evidence) {
  return evidence.redactionCategories?.length > 0
    ? `redaction categories: ${evidence.redactionCategories.join(", ")}; count: ${evidence.redactionFindingCount || 0}`
    : "";
}

function redactionAction(evidence) {
  return evidence.redactionCategories?.length > 0
    ? "Remove or redact the listed evidence categories in the source system, then rerun npm run evidence:scan and npm run launch:audit."
    : "";
}

export function buildEvidenceHandoff({
  launchResult = evaluateCommercialLaunch(),
  cutoverPlan = buildProductionCutoverPlan({ launchResult }),
} = {}) {
  const stepsById = indexSteps(cutoverPlan);
  const files = launchResult.gateResults.flatMap((gate) => {
    const step = stepsById.get(gate.id);

    return (gate.missingEvidence || []).map((evidence) => ({
      path: evidence.path,
      gateId: gate.id,
      gateLabel: gate.label,
      reason: evidence.reason,
      pointsBlocked: blockedPointsForGate(gate),
      owner: step?.owner || "Launch operator",
      timing: step?.timing || "Before full commercial launch",
      missingEnv: [...(gate.missingEnv || [])],
      commands: [...(step?.commands || ["npm run launch:audit"])],
      kpiAndReviewLoop: step?.kpiAndReviewLoop || "Gate passes in npm run launch:audit.",
      redactionFindingCount: evidence.redactionFindingCount || 0,
      redactionCategories: [...(evidence.redactionCategories || [])],
      redactionSummary: redactionSummary(evidence),
      redactionAction: redactionAction(evidence),
      requiredSections: [...requiredEvidenceSections],
      sourceRefsPolicy:
        "source_refs must contain redacted operational IDs or dashboard references, never raw credentials, database URLs, access tokens, contracts, card data or customer PII.",
    }));
  });

  return {
    generatedAt: new Date().toISOString(),
    decision: files.length === 0 ? "EVIDENCE_HANDOFF_READY" : "EVIDENCE_HANDOFF_ACTION_REQUIRED",
    currentScore: launchResult.score,
    targetScore: launchResult.target,
    blockedPoints: cutoverPlan.blockedPoints ?? Math.max(0, launchResult.target - launchResult.score),
    files,
    safeEvidenceRules: [...safeEvidenceRules],
    requiredSections: [...requiredEvidenceSections],
    finalVerificationCommands: [...(cutoverPlan.finalVerificationCommands || ["npm run launch:audit:strict"])],
  };
}

export function formatEvidenceHandoff(result) {
  const lines = [
    "Kozbeyli Konagi evidence handoff",
    `Decision: ${result.decision}`,
    `Commercial score: ${result.currentScore}/${result.targetScore}`,
    `Blocked points: ${result.blockedPoints}`,
    "",
    "Required safe evidence rules:",
  ];

  result.safeEvidenceRules.forEach((rule) => lines.push(`- ${rule}`));
  lines.push("");
  lines.push("Required ready-file sections:");
  result.requiredSections.forEach((section) => lines.push(`- ${section}`));

  if (result.files.length === 0) {
    lines.push("");
    lines.push("All evidence files are ready.");
  } else {
    lines.push("");
    lines.push("Pending evidence files:");

    for (const file of result.files) {
      lines.push("");
      lines.push(`${file.path} (${file.gateId}, +${file.pointsBlocked} pts blocked)`);
      lines.push(`  gate: ${file.gateLabel}`);
      lines.push(`  reason: ${file.reason}`);
      if (file.redactionSummary) lines.push(`  redaction: ${file.redactionSummary}`);
      if (file.redactionAction) lines.push(`  redaction action: ${file.redactionAction}`);
      lines.push(`  owner: ${file.owner}`);
      lines.push(`  timing: ${file.timing}`);
      if (file.missingEnv.length > 0) lines.push(`  missing env names: ${file.missingEnv.join(", ")}`);
      lines.push(`  commands: ${file.commands.join(" && ")}`);
      lines.push(`  KPI/review: ${file.kpiAndReviewLoop}`);
      lines.push(`  source_refs policy: ${file.sourceRefsPolicy}`);
    }
  }

  lines.push("");
  lines.push("Final verification commands:");
  result.finalVerificationCommands.forEach((command) => lines.push(`- ${command}`));

  return lines.join("\n");
}

function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const result = buildEvidenceHandoff();

  console.log(json ? JSON.stringify(result, null, 2) : formatEvidenceHandoff(result));
  process.exitCode = strict && result.decision !== "EVIDENCE_HANDOFF_READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
