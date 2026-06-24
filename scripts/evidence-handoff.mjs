import { pathToFileURL } from "node:url";

import {
  DEFAULT_RUNTIME_HEALTH_URL,
  evaluateCommercialLaunch,
  fetchRuntimeReadiness,
} from "./commercial-launch-audit.mjs";
import { buildProductionCutoverPlan } from "./production-cutover-plan.mjs";
import { buildVercelEnvSetupGuidance } from "./vercel-env-operator-guidance.mjs";

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
  "Do not commit secrets, raw credentials, database URLs, JWT/access tokens, service-role keys, card data, bank account details, customer PII, private contracts, bank portal dumps or private guest data.",
  "Use a real evidence date from today or the previous 45 days; future dates and evidence older than 45 days are rejected by the launch audit.",
  "Use redacted source-system IDs such as OPS-1234, UAT-5678 or VERCEL:ENV-20260623; do not paste raw dashboard URLs, local file paths, screenshot/PDF names or private artifact links into source_refs.",
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

function runtimeStatusSummary(runtimeConfiguration) {
  if (!runtimeConfiguration) return undefined;

  return {
    source: runtimeConfiguration.source,
    ready: Boolean(runtimeConfiguration.ready),
    configurationSource: runtimeConfiguration.configurationSource,
    configuredCount: runtimeConfiguration.configuredCount,
    requiredCount: runtimeConfiguration.requiredCount,
    missingCount: runtimeConfiguration.missingCount,
    invalidCount: runtimeConfiguration.invalidCount,
    placeholderCount: runtimeConfiguration.placeholderCount,
    fallbackApplied: Boolean(runtimeConfiguration.fallbackApplied),
    ...(runtimeConfiguration.operationalStatus
      ? { operationalStatus: runtimeConfiguration.operationalStatus }
      : {}),
  };
}

function formatRuntimeStatus(runtimeStatus) {
  if (!runtimeStatus) return "";

  const state = runtimeStatus.ready ? "ready" : "blocked";
  const operational = runtimeStatus.operationalStatus
    ? `, operational=${runtimeStatus.operationalStatus}`
    : "";
  return `${runtimeStatus.source}: ${state} (${runtimeStatus.configurationSource}, ${runtimeStatus.configuredCount}/${runtimeStatus.requiredCount} configured, ${runtimeStatus.missingCount} missing, ${runtimeStatus.invalidCount} invalid, ${runtimeStatus.placeholderCount} placeholder, fallback=${runtimeStatus.fallbackApplied ? "yes" : "no"}${operational})`;
}

function runtimeAction(runtimeStatus) {
  if (!runtimeStatus) return "Run npm run launch:audit:live after production env changes to compare live runtime state with the evidence gate.";
  if (runtimeStatus.ready) {
    return "Production runtime reports this gate configured; attach redacted source-system evidence before marking the evidence file ready.";
  }

  if (runtimeStatus.operationalStatus === "database_dns_unresolved") {
    return "Production runtime reports database_dns_unresolved; replace the Vercel Production DATABASE_URI host/connection string with the valid production Postgres/Supabase endpoint, trigger a production redeploy, then rerun npm run vercel:supabase:verify and npm run admin:verify:strict.";
  }

  if (runtimeStatus.operationalStatus) {
    return `Production runtime reports operational status ${runtimeStatus.operationalStatus}; resolve the provider dependency, redeploy production, then rerun npm run launch:audit:live.`;
  }

  return "Production runtime is still missing or invalid for this gate; configure the named production provider/env first, then attach redacted evidence.";
}

function nonMutatingCommands(commands) {
  return commands.filter((command) => !command.startsWith("vercel env add "));
}

function uniqueCommands(commands) {
  return [...new Set(commands)];
}

function commandListForHandoff(commands, envSetup, runtimeStatus) {
  const verificationCommands = nonMutatingCommands(commands);

  if (runtimeStatus?.ready) {
    return uniqueCommands([
      ...verificationCommands,
      "npm run evidence:handoff:live",
      "npm run launch:audit:live",
    ]);
  }

  if (envSetup) {
    return uniqueCommands([...envSetup.cliCommands, ...verificationCommands]);
  }

  return verificationCommands.length > 0 ? verificationCommands : commands;
}

export function buildEvidenceHandoff({
  launchResult = evaluateCommercialLaunch(),
  cutoverPlan = buildProductionCutoverPlan({ launchResult }),
} = {}) {
  const stepsById = indexSteps(cutoverPlan);
  const files = launchResult.gateResults.flatMap((gate) => {
    const step = stepsById.get(gate.id);
    const runtimeStatus = runtimeStatusSummary(gate.runtimeConfiguration);

    return (gate.missingEvidence || []).map((evidence) => {
      const sourceCommands = [...(step?.commands || ["npm run launch:audit"])];
      const envSetup = buildVercelEnvSetupGuidance(gate.missingEnv || [], sourceCommands);
      const commands = commandListForHandoff(sourceCommands, envSetup, runtimeStatus);

      return {
        path: evidence.path,
        gateId: gate.id,
        gateLabel: gate.label,
        reason: evidence.reason,
        pointsBlocked: blockedPointsForGate(gate),
        owner: step?.owner || "Launch operator",
        timing: step?.timing || "Before full commercial launch",
        missingEnv: [...(gate.missingEnv || [])],
        ...(envSetup ? { envSetup } : {}),
        runtimeStatus,
        runtimeAction: runtimeAction(runtimeStatus),
        commands,
        kpiAndReviewLoop: step?.kpiAndReviewLoop || "Gate passes in npm run launch:audit.",
        redactionFindingCount: evidence.redactionFindingCount || 0,
        redactionCategories: [...(evidence.redactionCategories || [])],
        redactionSummary: redactionSummary(evidence),
        redactionAction: redactionAction(evidence),
        missingEvidenceSignals: [...(evidence.missingEvidenceSignals || [])],
        requiredSections: [...requiredEvidenceSections],
        sourceRefsPolicy:
          "source_refs must contain only redacted source-system IDs, for example OPS-1234, UAT-5678 or VERCEL:ENV-20260623; never raw URLs, local files, screenshots, credentials, database URLs, access tokens, contracts, card data, bank account details or customer PII.",
      };
    });
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
      if (file.missingEvidenceSignals.length > 0) {
        lines.push(`  missing proof signals: ${file.missingEvidenceSignals.join(", ")}`);
      }
      lines.push(`  owner: ${file.owner}`);
      lines.push(`  timing: ${file.timing}`);
      if (file.missingEnv.length > 0) lines.push(`  missing env names: ${file.missingEnv.join(", ")}`);
      if (file.envSetup) {
        lines.push(`  env setup: ${file.envSetup.dashboardPath}`);
        lines.push(`  env names: ${file.envSetup.envNames.join(", ")}`);
        lines.push(
          `  cli fallback: ${file.envSetup.cliInstallCommand}; ${file.envSetup.cliAuthCommands.join("; ")}`,
        );
      }
      if (file.runtimeStatus) lines.push(`  runtime: ${formatRuntimeStatus(file.runtimeStatus)}`);
      lines.push(`  runtime action: ${file.runtimeAction}`);
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
  const result = buildEvidenceHandoff({ launchResult });

  console.log(json ? JSON.stringify(result, null, 2) : formatEvidenceHandoff(result));
  process.exitCode = strict && result.decision !== "EVIDENCE_HANDOFF_READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
