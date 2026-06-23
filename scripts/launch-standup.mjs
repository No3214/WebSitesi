import { pathToFileURL } from "node:url";

import {
  DEFAULT_RUNTIME_HEALTH_URL,
  evaluateCommercialLaunch,
  fetchRuntimeReadiness,
} from "./commercial-launch-audit.mjs";
import { buildProductionCutoverPlan } from "./production-cutover-plan.mjs";

function compactEvidenceStatus(items = []) {
  return items.map((item) => ({
    path: item.path,
    reason: item.reason,
    redactionFindingCount: item.redactionFindingCount || 0,
    redactionCategories: [...(item.redactionCategories || [])],
    missingEvidenceSignals: [...(item.missingEvidenceSignals || [])],
  }));
}

function summarizeStep(step, index) {
  const envBlocked = step.missingEnv.length > 0;
  const evidenceBlocked = step.missingEvidence.length > 0;
  const firstEvidence = step.missingEvidence[0];

  return {
    id: step.id,
    rank: index + 1,
    pointsBlocked: step.pointsBlocked,
    owner: step.owner,
    timing: step.timing,
    operationalGoal: step.operationalGoal,
    envBlocked,
    evidenceBlocked,
    envDiagnostics: { ...step.envDiagnostics },
    missingEnv: [...step.missingEnv],
    evidence: compactEvidenceStatus(step.missingEvidence),
    evidencePaths: [...step.evidence],
    nextAction: step.checklist[0] || "Re-run npm run launch:audit and resolve the blocked gate.",
    nextCommand: step.commands[0] || "npm run launch:audit",
    verificationCommand: step.commands.at(-1) || "npm run launch:audit",
    kpiAndReviewLoop: step.kpiAndReviewLoop,
    ...(firstEvidence?.redactionFindingCount
      ? {
          redactionAction:
            firstEvidence.redactionAction ||
            "Redact source-system evidence, then rerun npm run evidence:scan and npm run launch:audit.",
        }
      : {}),
  };
}

function buildOwnerQueues(blockedSteps) {
  const ownerMap = new Map();

  for (const step of blockedSteps) {
    if (!ownerMap.has(step.owner)) {
      ownerMap.set(step.owner, {
        owner: step.owner,
        totalBlockedPoints: 0,
        gates: [],
        nextAction: "",
        nextCommand: "",
      });
    }

    const queue = ownerMap.get(step.owner);
    queue.totalBlockedPoints += step.pointsBlocked;
    queue.gates.push({
      id: step.id,
      pointsBlocked: step.pointsBlocked,
      timing: step.timing,
      envBlocked: step.envBlocked,
      evidenceBlocked: step.evidenceBlocked,
      nextAction: step.nextAction,
      nextCommand: step.nextCommand,
      verificationCommand: step.verificationCommand,
      evidencePaths: step.evidencePaths,
    });
    if (!queue.nextAction) queue.nextAction = step.nextAction;
    if (!queue.nextCommand) queue.nextCommand = step.nextCommand;
  }

  return [...ownerMap.values()].sort((a, b) => b.totalBlockedPoints - a.totalBlockedPoints);
}

function summarizeLanes(blockedSteps) {
  const envBlocked = blockedSteps.filter((step) => step.envBlocked);
  const evidenceBlocked = blockedSteps.filter((step) => step.evidenceBlocked);
  const codeCoveredEvidenceOnly = blockedSteps.filter(
    (step) => !step.envBlocked && step.evidenceBlocked,
  );

  return {
    envBlockedCount: envBlocked.length,
    evidenceBlockedCount: evidenceBlocked.length,
    codeCoveredEvidenceOnlyCount: codeCoveredEvidenceOnly.length,
    envBlockedGates: envBlocked.map((step) => step.id),
    evidenceBlockedGates: evidenceBlocked.map((step) => step.id),
    codeCoveredEvidenceOnlyGates: codeCoveredEvidenceOnly.map((step) => step.id),
  };
}

export function buildLaunchStandup({
  launchResult = evaluateCommercialLaunch(),
  cutoverPlan = buildProductionCutoverPlan({ launchResult }),
} = {}) {
  const blockedSteps = (cutoverPlan.gateSteps || []).map(summarizeStep);
  const firstGate = blockedSteps[0];

  return {
    generatedAt: new Date().toISOString(),
    decision: blockedSteps.length === 0 ? "LAUNCH_STANDUP_READY" : "LAUNCH_STANDUP_ACTION_REQUIRED",
    currentScore: cutoverPlan.currentScore,
    targetScore: cutoverPlan.targetScore,
    blockedPoints: cutoverPlan.blockedPoints,
    nextGate: firstGate
      ? {
          id: firstGate.id,
          owner: firstGate.owner,
          pointsBlocked: firstGate.pointsBlocked,
          timing: firstGate.timing,
          nextAction: firstGate.nextAction,
          nextCommand: firstGate.nextCommand,
          verificationCommand: firstGate.verificationCommand,
          evidencePaths: firstGate.evidencePaths,
        }
      : null,
    lanes: summarizeLanes(blockedSteps),
    ownerQueues: buildOwnerQueues(blockedSteps),
    blockedGates: blockedSteps,
    finalVerificationCommands: [...(cutoverPlan.finalVerificationCommands || ["npm run launch:audit:strict"])],
  };
}

export function formatLaunchStandup(result) {
  const lines = [
    "Kozbeyli Konagi launch standup",
    `Decision: ${result.decision}`,
    `Commercial score: ${result.currentScore}/${result.targetScore}`,
    `Blocked points: ${result.blockedPoints}`,
    "",
  ];

  if (!result.nextGate) {
    lines.push("All commercial launch gates are ready.");
  } else {
    lines.push("Next gate:");
    lines.push(`- ${result.nextGate.id} (+${result.nextGate.pointsBlocked} pts)`);
    lines.push(`  owner: ${result.nextGate.owner}`);
    lines.push(`  timing: ${result.nextGate.timing}`);
    lines.push(`  action: ${result.nextGate.nextAction}`);
    lines.push(`  command: ${result.nextGate.nextCommand}`);
    lines.push(`  verify: ${result.nextGate.verificationCommand}`);
    lines.push("");
    lines.push("Blocked lanes:");
    lines.push(`- env: ${result.lanes.envBlockedCount} gates (${result.lanes.envBlockedGates.join(", ") || "none"})`);
    lines.push(
      `- evidence: ${result.lanes.evidenceBlockedCount} gates (${result.lanes.evidenceBlockedGates.join(", ") || "none"})`,
    );
    lines.push(
      `- code-covered evidence-only: ${result.lanes.codeCoveredEvidenceOnlyCount} gates (${result.lanes.codeCoveredEvidenceOnlyGates.join(", ") || "none"})`,
    );
    lines.push("");
    lines.push("Owner queues:");

    for (const queue of result.ownerQueues) {
      lines.push(`- ${queue.owner}: ${queue.totalBlockedPoints} pts`);
      lines.push(`  next: ${queue.nextAction}`);
      lines.push(`  command: ${queue.nextCommand}`);
      lines.push(`  gates: ${queue.gates.map((gate) => gate.id).join(", ")}`);
    }
  }

  lines.push("");
  lines.push("Final verification commands:");
  result.finalVerificationCommands.forEach((command) => lines.push(`- ${command}`));

  return lines.join("\n");
}

function readArgValue(name) {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

async function buildLaunchResultFromArgs() {
  const runtimeHealthUrl =
    readArgValue("--runtime-health-url") || (process.argv.includes("--live-runtime") ? DEFAULT_RUNTIME_HEALTH_URL : "");

  if (!runtimeHealthUrl) return evaluateCommercialLaunch();

  try {
    const runtimeReadiness = await fetchRuntimeReadiness(runtimeHealthUrl);
    return evaluateCommercialLaunch({
      runtimeReadiness,
      runtimeSource: runtimeHealthUrl,
    });
  } catch (error) {
    return evaluateCommercialLaunch({
      runtimeReadinessError: error instanceof Error ? error.message : String(error),
      runtimeSource: runtimeHealthUrl,
    });
  }
}

async function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const launchResult = await buildLaunchResultFromArgs();
  const result = buildLaunchStandup({ launchResult });

  console.log(json ? JSON.stringify(result, null, 2) : formatLaunchStandup(result));
  process.exitCode = strict && result.decision !== "LAUNCH_STANDUP_READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
