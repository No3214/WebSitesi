import { pathToFileURL } from "node:url";

import {
  DEFAULT_RUNTIME_HEALTH_URL,
  evaluateCommercialLaunch,
  fetchRuntimeReadiness,
} from "./commercial-launch-audit.mjs";
import { buildProductionCutoverPlan } from "./production-cutover-plan.mjs";
import { buildVercelEnvSetupGuidance } from "./vercel-env-operator-guidance.mjs";

function compactEvidenceStatus(items = []) {
  return items.map((item) => ({
    path: item.path,
    reason: item.reason,
    redactionFindingCount: item.redactionFindingCount || 0,
    redactionCategories: [...(item.redactionCategories || [])],
    missingEvidenceSignals: [...(item.missingEvidenceSignals || [])],
  }));
}

function compactRuntimeDiagnostics(runtimeDiagnostics) {
  if (!runtimeDiagnostics) return undefined;

  return {
    source: runtimeDiagnostics.source,
    status: runtimeDiagnostics.status,
    ready: Boolean(runtimeDiagnostics.ready),
    configurationSource: runtimeDiagnostics.configurationSource,
    configuredCount: runtimeDiagnostics.configuredCount,
    requiredCount: runtimeDiagnostics.requiredCount,
    missingCount: runtimeDiagnostics.missingCount,
    invalidCount: runtimeDiagnostics.invalidCount,
    placeholderCount: runtimeDiagnostics.placeholderCount,
    fallbackApplied: Boolean(runtimeDiagnostics.fallbackApplied),
  };
}

function runtimeReady(step) {
  return Boolean(step.runtimeDiagnostics?.ready);
}

function runtimeStatusText(runtimeDiagnostics) {
  if (!runtimeDiagnostics) return "";

  const state = runtimeDiagnostics.ready ? "ready" : "blocked";
  return `${runtimeDiagnostics.source}: ${state} (${runtimeDiagnostics.configurationSource}, ${runtimeDiagnostics.configuredCount}/${runtimeDiagnostics.requiredCount} configured, ${runtimeDiagnostics.missingCount} missing)`;
}

function resolveNextAction(step, evidenceBlocked, envSetup) {
  if (runtimeReady(step) && evidenceBlocked) {
    return [
      "Production runtime is already configured for this gate.",
      `Attach redacted source-system evidence in ${step.evidence.join(", ")}.`,
      step.missingEnv.length > 0 ? "Then clean the local audit env snapshot so local checks do not report stale/invalid env." : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  const primaryAction = step.checklist[0] || "Re-run npm run launch:audit and resolve the blocked gate.";
  if (!envSetup?.envNames?.length) return primaryAction;

  const isPartialEnv =
    Number(step.envDiagnostics?.configuredCount ?? 0) > 0 &&
    Number(step.envDiagnostics?.missingCount ?? 0) > 0;
  const envActions = [
    `Add or update only these Vercel Production env names: ${envSetup.envNames.join(", ")}.`,
    "Keep secret values in Vercel/provider dashboards; do not paste values into repository evidence.",
    "Trigger a production redeploy, then rerun npm run launch:audit:live.",
  ];

  if (isPartialEnv) {
    return [
      "Production runtime is partially configured for this gate; resolve the remaining env gap before evidence can pass.",
      ...envActions,
    ].join(" ");
  }

  return [primaryAction, ...envActions].join(" ");
}

const VERCEL_BOOTSTRAP_COMMANDS = new Set(["npm i -g vercel", "vercel login", "vercel whoami"]);

function resolveNextCommand(step, evidenceBlocked, envSetup) {
  if (runtimeReady(step) && evidenceBlocked) {
    return "npm run evidence:handoff:live";
  }

  const bootstrapCommand = step.commands.find((command) => VERCEL_BOOTSTRAP_COMMANDS.has(command));
  if (bootstrapCommand) return bootstrapCommand;

  if (envSetup?.cliCommands?.length > 0) {
    return envSetup.cliCommands[0];
  }

  return step.commands[0] || "npm run launch:audit";
}

function summarizeStep(step, index) {
  const envBlocked = step.missingEnv.length > 0;
  const evidenceBlocked = step.missingEvidence.length > 0;
  const firstEvidence = step.missingEvidence[0];
  const runtimeDiagnostics = compactRuntimeDiagnostics(step.runtimeDiagnostics);
  const envSetup = buildVercelEnvSetupGuidance(step.missingEnv, step.commands);

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
    ...(runtimeDiagnostics ? { runtimeDiagnostics } : {}),
    missingEnv: [...step.missingEnv],
    ...(envSetup ? { envSetup } : {}),
    evidence: compactEvidenceStatus(step.missingEvidence),
    evidencePaths: [...step.evidence],
    nextAction: resolveNextAction(step, evidenceBlocked, envSetup),
    nextCommand: resolveNextCommand(step, evidenceBlocked, envSetup),
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
      runtimeReady: Boolean(step.runtimeDiagnostics?.ready),
      runtimeStatus: runtimeStatusText(step.runtimeDiagnostics),
      nextAction: step.nextAction,
      nextCommand: step.nextCommand,
      verificationCommand: step.verificationCommand,
      evidencePaths: step.evidencePaths,
      ...(step.envSetup ? { envSetup: step.envSetup } : {}),
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
  const runtimeCoveredEvidence = blockedSteps.filter(
    (step) => step.runtimeDiagnostics?.ready && step.evidenceBlocked,
  );

  return {
    envBlockedCount: envBlocked.length,
    evidenceBlockedCount: evidenceBlocked.length,
    codeCoveredEvidenceOnlyCount: codeCoveredEvidenceOnly.length,
    runtimeCoveredEvidenceCount: runtimeCoveredEvidence.length,
    envBlockedGates: envBlocked.map((step) => step.id),
    evidenceBlockedGates: evidenceBlocked.map((step) => step.id),
    codeCoveredEvidenceOnlyGates: codeCoveredEvidenceOnly.map((step) => step.id),
    runtimeCoveredEvidenceGates: runtimeCoveredEvidence.map((step) => step.id),
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
          ...(firstGate.envSetup ? { envSetup: firstGate.envSetup } : {}),
          ...(firstGate.runtimeDiagnostics
            ? {
                runtimeReady: Boolean(firstGate.runtimeDiagnostics.ready),
                runtimeStatus: runtimeStatusText(firstGate.runtimeDiagnostics),
              }
            : {}),
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
    if (result.nextGate.envSetup) {
      lines.push(`  env setup: ${result.nextGate.envSetup.dashboardPath}`);
      lines.push(`  env names: ${result.nextGate.envSetup.envNames.join(", ")}`);
      lines.push(
        `  cli fallback: ${result.nextGate.envSetup.cliInstallCommand}; ${result.nextGate.envSetup.cliAuthCommands.join("; ")}`,
      );
    }
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
    lines.push(
      `- runtime-covered evidence-needed: ${result.lanes.runtimeCoveredEvidenceCount} gates (${result.lanes.runtimeCoveredEvidenceGates.join(", ") || "none"})`,
    );
    lines.push("");
    lines.push("Owner queues:");

    for (const queue of result.ownerQueues) {
      lines.push(`- ${queue.owner}: ${queue.totalBlockedPoints} pts`);
      lines.push(`  next: ${queue.nextAction}`);
      lines.push(`  command: ${queue.nextCommand}`);
      const envSetupGates = queue.gates.filter((gate) => gate.envSetup);
      for (const gate of envSetupGates) {
        lines.push(`  env setup (${gate.id}): ${gate.envSetup.dashboardPath}`);
        lines.push(`  env names (${gate.id}): ${gate.envSetup.envNames.join(", ")}`);
      }
      const runtimeReadyGates = queue.gates.filter((gate) => gate.runtimeReady).map((gate) => gate.id);
      if (runtimeReadyGates.length > 0) lines.push(`  runtime ready: ${runtimeReadyGates.join(", ")}`);
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
