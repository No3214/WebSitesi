import { pathToFileURL } from "node:url";

import {
  DEFAULT_RUNTIME_HEALTH_URL,
  commercialLaunchGates,
  evaluateCommercialLaunch,
  fetchRuntimeReadiness,
} from "./commercial-launch-audit.mjs";
import { requiredEvidenceSections, safeEvidenceRules } from "./evidence-handoff.mjs";
import { buildProductionCutoverPlan } from "./production-cutover-plan.mjs";
import { writeSafeReportOutput } from "./safe-report-output.mjs";
import { buildVercelEnvSetupGuidance } from "./vercel-env-operator-guidance.mjs";

const gateCatalog = new Map(commercialLaunchGates.map((gate) => [gate.id, gate]));

const sourceRefsPolicy =
  "Use only redacted source-system IDs such as OPS-1234, UAT-5678 or VERCEL:ENV-20260623; never raw URLs, local files, screenshots, credentials, database URLs, access tokens, contracts, card data, bank account details or customer PII.";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

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
const VERCEL_REQUIRED_FOR = [
  "vercel env pull",
  "vercel deploy",
  "vercel logs",
  "production env edits",
];

function normalizeToolingWarnings(cutoverPlan) {
  return (cutoverPlan.vercelOpsWarnings || []).map((warning) => ({
    id: warning.id,
    detail: warning.detail,
    remediation: warning.remediation || "",
  }));
}

function resolveToolingNextCommand(warnings, installCommand) {
  const firstWarning = warnings[0];
  if (!firstWarning) return "npm run vercel:ops";
  if (firstWarning.id === "global_vercel_cli") return installCommand;
  if (firstWarning.id === "vercel_auth") return "vercel login";
  if (firstWarning.id === "project_binding") return "vercel link";

  return "npm run vercel:ops";
}

function buildToolingPrerequisites(cutoverPlan) {
  const warnings = normalizeToolingWarnings(cutoverPlan);
  const cliInstallCommand = cutoverPlan.vercelCliInstallCommand || "npm i -g vercel";

  return {
    vercelOpsDecision: cutoverPlan.vercelOpsDecision || "UNKNOWN",
    cliInstallCommand,
    requiredFor: [...VERCEL_REQUIRED_FOR],
    warnings,
    nextCommand: resolveToolingNextCommand(warnings, cliInstallCommand),
  };
}

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

function buildEvidenceSetupGuidance(step) {
  if (!step.evidence?.length) return undefined;

  const catalogGate = gateCatalog.get(step.id);
  const requiredProofSignals = (catalogGate?.evidenceSignals || []).map((signal) => signal.label);
  const missingProofSignals = unique(
    (step.missingEvidence || []).flatMap((item) => item.missingEvidenceSignals || []),
  );

  return {
    paths: [...step.evidence],
    requiredSections: [...requiredEvidenceSections],
    requiredProofSignals,
    missingProofSignals,
    sourceRefsPolicy,
    safeEvidenceRules: [...safeEvidenceRules],
  };
}

function summarizeStep(step, index) {
  const envBlocked = step.missingEnv.length > 0;
  const evidenceBlocked = step.missingEvidence.length > 0;
  const firstEvidence = step.missingEvidence[0];
  const runtimeDiagnostics = compactRuntimeDiagnostics(step.runtimeDiagnostics);
  const envSetup = buildVercelEnvSetupGuidance(step.missingEnv, step.commands);
  const evidenceSetup = buildEvidenceSetupGuidance(step);

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
    ...(evidenceSetup ? { evidenceSetup } : {}),
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
      ...(step.evidenceSetup ? { evidenceSetup: step.evidenceSetup } : {}),
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
  const toolingPrerequisites = buildToolingPrerequisites(cutoverPlan);

  return {
    generatedAt: new Date().toISOString(),
    decision: blockedSteps.length === 0 ? "LAUNCH_STANDUP_READY" : "LAUNCH_STANDUP_ACTION_REQUIRED",
    currentScore: cutoverPlan.currentScore,
    targetScore: cutoverPlan.targetScore,
    blockedPoints: cutoverPlan.blockedPoints,
    toolingPrerequisites,
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
          ...(firstGate.evidenceSetup ? { evidenceSetup: firstGate.evidenceSetup } : {}),
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
    `Generated: ${result.generatedAt}`,
    `Decision: ${result.decision}`,
    `Commercial score: ${result.currentScore}/${result.targetScore}`,
    `Blocked points: ${result.blockedPoints}`,
    `Vercel ops: ${result.toolingPrerequisites.vercelOpsDecision}`,
    `Vercel CLI install: ${result.toolingPrerequisites.cliInstallCommand}`,
    "",
  ];

  if (result.toolingPrerequisites.warnings.length > 0) {
    lines.push("Tooling prerequisites:");
    lines.push(`- next command: ${result.toolingPrerequisites.nextCommand}`);
    lines.push(`- required for: ${result.toolingPrerequisites.requiredFor.join(", ")}`);
    for (const warning of result.toolingPrerequisites.warnings) {
      lines.push(`- ${warning.id}: ${warning.detail}`);
      if (warning.remediation) lines.push(`  remediation: ${warning.remediation}`);
    }
    lines.push("");
  }

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
    if (result.nextGate.evidenceSetup) {
      lines.push(`  evidence files: ${result.nextGate.evidenceSetup.paths.join(", ")}`);
      lines.push(
        `  required proof: ${result.nextGate.evidenceSetup.requiredProofSignals.join(", ") || "redacted source-system proof"}`,
      );
      lines.push(`  source refs: ${result.nextGate.evidenceSetup.sourceRefsPolicy}`);
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
      const evidenceSetupGates = queue.gates.filter((gate) => gate.evidenceSetup);
      for (const gate of evidenceSetupGates) {
        lines.push(`  evidence files (${gate.id}): ${gate.evidenceSetup.paths.join(", ")}`);
        lines.push(
          `  required proof (${gate.id}): ${gate.evidenceSetup.requiredProofSignals.join(", ") || "redacted source-system proof"}`,
        );
      }
      lines.push(`  gates: ${queue.gates.map((gate) => gate.id).join(", ")}`);
    }
  }

  lines.push("");
  lines.push("Final verification commands:");
  result.finalVerificationCommands.forEach((command) => lines.push(`- ${command}`));

  return lines.join("\n");
}

function compactGate(gate) {
  return {
    id: gate.id,
    pointsBlocked: gate.pointsBlocked,
    timing: gate.timing,
    envBlocked: Boolean(gate.envBlocked),
    evidenceBlocked: Boolean(gate.evidenceBlocked),
    runtimeReady: Boolean(gate.runtimeReady),
    missingEnv: [...(gate.envSetup?.envNames || gate.missingEnv || [])],
    evidencePaths: [...(gate.evidencePaths || [])],
    nextCommand: gate.nextCommand,
    verificationCommand: gate.verificationCommand,
  };
}

function compactOwnerQueue(queue) {
  return {
    owner: queue.owner,
    totalBlockedPoints: queue.totalBlockedPoints,
    nextAction: queue.nextAction,
    nextCommand: queue.nextCommand,
    gates: queue.gates.map(compactGate),
  };
}

export function buildCompactLaunchStandup(result) {
  return {
    generatedAt: result.generatedAt,
    decision: result.decision,
    currentScore: result.currentScore,
    targetScore: result.targetScore,
    blockedPoints: result.blockedPoints,
    toolingPrerequisites: {
      vercelOpsDecision: result.toolingPrerequisites.vercelOpsDecision,
      nextCommand: result.toolingPrerequisites.nextCommand,
      warningCount: result.toolingPrerequisites.warnings.length,
      warnings: result.toolingPrerequisites.warnings.map((warning) => ({
        id: warning.id,
        detail: warning.detail,
        ...(warning.remediation ? { remediation: warning.remediation } : {}),
      })),
    },
    nextGate: result.nextGate
      ? {
          id: result.nextGate.id,
          owner: result.nextGate.owner,
          pointsBlocked: result.nextGate.pointsBlocked,
          runtimeReady: Boolean(result.nextGate.runtimeReady),
          nextAction: result.nextGate.nextAction,
          nextCommand: result.nextGate.nextCommand,
          verificationCommand: result.nextGate.verificationCommand,
          evidencePaths: [...(result.nextGate.evidencePaths || [])],
          envNames: [...(result.nextGate.envSetup?.envNames || [])],
        }
      : null,
    lanes: { ...result.lanes },
    ownerQueues: result.ownerQueues.map(compactOwnerQueue),
    finalVerificationCommands: [...result.finalVerificationCommands],
  };
}

export function formatCompactLaunchStandup(result) {
  const lines = [
    "Kozbeyli Konagi compact launch standup",
    `Generated: ${result.generatedAt}`,
    `Decision: ${result.decision}`,
    `Commercial score: ${result.currentScore}/${result.targetScore}`,
    `Blocked points: ${result.blockedPoints}`,
    `Vercel ops: ${result.toolingPrerequisites.vercelOpsDecision}`,
    "",
  ];

  if (result.toolingPrerequisites.warningCount > 0) {
    lines.push(`Tooling next command: ${result.toolingPrerequisites.nextCommand}`);
    for (const warning of result.toolingPrerequisites.warnings) {
      lines.push(`- ${warning.id}: ${warning.detail}`);
    }
    lines.push("");
  }

  if (!result.nextGate) {
    lines.push("All commercial launch gates are ready.");
  } else {
    lines.push(
      `Next gate: ${result.nextGate.id} (+${result.nextGate.pointsBlocked} pts) owner=${result.nextGate.owner}`,
    );
    lines.push(`Action: ${result.nextGate.nextAction}`);
    lines.push(`Command: ${result.nextGate.nextCommand}`);
    if (result.nextGate.envNames.length > 0) {
      lines.push(`Env names: ${result.nextGate.envNames.join(", ")}`);
    }
    if (result.nextGate.evidencePaths.length > 0) {
      lines.push(`Evidence: ${result.nextGate.evidencePaths.join(", ")}`);
    }
    lines.push("");
    lines.push(
      `Lanes: env=${result.lanes.envBlockedCount}, evidence=${result.lanes.evidenceBlockedCount}, runtimeEvidence=${result.lanes.runtimeCoveredEvidenceCount}`,
    );
    lines.push("Owner queues:");
    for (const queue of result.ownerQueues) {
      lines.push(`- ${queue.owner}: ${queue.totalBlockedPoints} pts; command=${queue.nextCommand}`);
      lines.push(`  gates=${queue.gates.map((gate) => gate.id).join(", ")}`);
    }
  }

  lines.push("");
  lines.push("Verify:");
  result.finalVerificationCommands.slice(0, 5).forEach((command) => lines.push(`- ${command}`));

  return lines.join("\n");
}

export function writeLaunchStandupReport(
  result,
  outputPath,
  { json = false, compact = false, cwd = process.cwd() } = {},
) {
  const outputResult = compact ? buildCompactLaunchStandup(result) : result;
  const body = json
    ? JSON.stringify(outputResult, null, 2)
    : compact
      ? formatCompactLaunchStandup(outputResult)
      : formatLaunchStandup(outputResult);

  return writeSafeReportOutput(outputPath, body, { cwd });
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
  const compact = process.argv.includes("--compact");
  const outputPath = readArgValue("--output");
  const launchResult = await buildLaunchResultFromArgs();
  const result = buildLaunchStandup({ launchResult });
  const outputResult = compact ? buildCompactLaunchStandup(result) : result;

  if (outputPath) {
    const writtenPath = writeLaunchStandupReport(result, outputPath, { json, compact });
    console.log(`Wrote launch standup report: ${writtenPath}`);
  } else {
    console.log(
      json
        ? JSON.stringify(outputResult, null, 2)
        : compact
          ? formatCompactLaunchStandup(outputResult)
          : formatLaunchStandup(result),
    );
  }
  process.exitCode = strict && result.decision !== "LAUNCH_STANDUP_READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
