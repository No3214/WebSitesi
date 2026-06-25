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

const guestFacingCopyByGate = {
  canonical_domain:
    "Web sitemiz guncel Kozbeyli Konagi deneyimini guvenli HTTPS adresinde sunar.",
  production_database:
    "Talebiniz guvenli sekilde alinir; ekibimiz rezervasyon ve teklif detaylarini yazili olarak teyit eder.",
  production_abuse_controls:
    "Misafir formlarini korumak icin kisa guvenlik dogrulamasi kullanilir.",
  hms_booking_engine:
    "Rezervasyon motoru yeni sekmede acilir; uygunluk ve kosullar canli ekranda teyit edilir.",
  garanti_pos:
    "Odeme kosullari yazili teyit sonrasi paylasilir; kart bilgileri web sitesinde saklanmaz.",
  analytics_purchase:
    "Analitik ve pazarlama olcumleri yalnizca izin tercihlerinize uygun sekilde calisir.",
  search_local_seo:
    "Konum, yol tarifi ve resmi isletme bilgileri arama ve harita kanallarinda tutarli tutulur.",
  legal_dpa:
    "Rezervasyon, etkinlik ve iletisim surecleri KVKK ve ticari kosullar cercevesinde yurutulur.",
};

const compactSourceRefsPolicy =
  "real redacted source-system IDs only; no copied examples, raw URLs, local file paths, secrets, card/bank data or guest PII";

function indexSteps(plan) {
  return new Map((plan.gateSteps || []).map((step) => [step.id, step]));
}

function indexGateCatalog() {
  return new Map(commercialLaunchGates.map((gate) => [gate.id, gate]));
}

function proofSignalsForGate(gate) {
  return (gate.evidenceSignals || []).map((signal) => signal.label);
}

function missingEvidenceForGate(gate, includeAll) {
  if (!includeAll) return gate.missingEvidence || [];

  const knownMissing = new Map((gate.missingEvidence || []).map((item) => [item.path, item]));
  return (gate.evidence || []).map(
    (path) =>
      knownMissing.get(path) || {
        path,
        ready: false,
        reason: "reference template",
        missingEvidenceSignals: [],
      },
  );
}

function gateIsIncluded(gate, gateId, includeAll) {
  if (gateId && gate.id !== gateId) return false;
  if (includeAll) return true;
  return (gate.missingEvidence || []).length > 0;
}

function markdownList(items) {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function checkboxList(items) {
  return items.length > 0 ? items.map((item) => `- [ ] ${item}`).join("\n") : "- [ ] Redacted source-system proof";
}

function commandListForTemplate(commands, envSetup, runtimeStatus) {
  const nonMutatingCommands = commands.filter((command) => !command.startsWith("vercel env add "));

  if (runtimeStatus?.ready) {
    return [...new Set([...nonMutatingCommands, "npm run evidence:handoff:live", "npm run launch:audit:live"])];
  }

  if (!envSetup) return commands;

  return [...new Set([...envSetup.cliCommands, ...nonMutatingCommands])];
}

function envSetupMarkdown(envSetup) {
  if (!envSetup) return [];

  return [
    "## Environment Setup",
    `Provider: ${envSetup.provider}`,
    `Environment: ${envSetup.environment}`,
    `Dashboard: ${envSetup.dashboardPath}`,
    `Env names: ${envSetup.envNames.join(", ")}`,
    "",
    "Manual checklist:",
    checkboxList(envSetup.manualChecklist),
    "",
    "CLI fallback:",
    markdownList([envSetup.cliInstallCommand, ...envSetup.cliAuthCommands, ...envSetup.cliCommands]),
    "",
  ];
}

function buildTemplateMarkdown(template) {
  return [
    `# Evidence Template: ${template.gateLabel}`,
    "",
    `target_file: ${template.path}`,
    `gate_id: ${template.gateId}`,
    "status: pending",
    "date: YYYY-MM-DD",
    `owner: ${template.owner}`,
    "source_refs: OPS-1234, UAT-5678, VERCEL:ENV-20260623",
    "<Replace the example source_refs above before changing status to ready. Copied examples are rejected by the launch audit.>",
    "",
    "## Operational Goal",
    template.operationalGoal,
    "",
    "## SOP / Checklist",
    markdownList(template.checklist),
    "",
    "## Required Proof Signals",
    checkboxList(template.requiredProofSignals),
    "",
    "## Runtime Status",
    template.runtimeStatusText,
    template.runtimeAction,
    "",
    ...envSetupMarkdown(template.envSetup),
    "## Guest-Facing Copy / Fallback",
    template.guestFacingCopy,
    "",
    "## Commands",
    markdownList(template.commands),
    "",
    "## KPI And Review Loop",
    template.kpiAndReviewLoop,
    "",
    "## Safety Rules",
    markdownList(template.safeEvidenceRules),
    "",
    "## Summary",
    "<Write a short redacted summary. Do not paste secrets, raw logs, guest PII, card data, bank account details or private contracts.>",
    "",
    "## Proof",
    ...template.requiredProofSignals.map(
      (signal) => `- ${signal}: <redacted source-system reference and result>`,
    ),
    "",
    "## Residual Risk",
    "<List what remains unproven, who owns it and when it will be reviewed.>",
  ].join("\n");
}

function buildTemplate({ gate, catalogGate, evidence, step }) {
  const requiredProofSignals = proofSignalsForGate(catalogGate);
  const owner = step?.owner || "Launch operator";
  const timing = step?.timing || "Before full commercial launch";
  const checklist = [...(step?.checklist || ["Resolve this commercial launch gate with redacted source-system proof."])];
  const commands = [...(step?.commands || ["npm run launch:audit"])];
  const envSetup = buildVercelEnvSetupGuidance(gate.missingEnv || [], commands);
  const runtimeStatus = gate.runtimeConfiguration
    ? {
        source: gate.runtimeConfiguration.source,
        ready: Boolean(gate.runtimeConfiguration.ready),
        configurationSource: gate.runtimeConfiguration.configurationSource,
        configuredCount: gate.runtimeConfiguration.configuredCount,
        requiredCount: gate.runtimeConfiguration.requiredCount,
        missingCount: gate.runtimeConfiguration.missingCount,
        invalidCount: gate.runtimeConfiguration.invalidCount,
        placeholderCount: gate.runtimeConfiguration.placeholderCount,
        fallbackApplied: Boolean(gate.runtimeConfiguration.fallbackApplied),
        ...(gate.runtimeConfiguration.operationalStatus
          ? { operationalStatus: gate.runtimeConfiguration.operationalStatus }
          : {}),
      }
    : undefined;
  const templateCommands = commandListForTemplate(commands, envSetup, runtimeStatus);
  const operational = runtimeStatus?.operationalStatus
    ? `, operational=${runtimeStatus.operationalStatus}`
    : "";
  const runtimeStatusText = runtimeStatus
    ? `${runtimeStatus.source}: ${runtimeStatus.ready ? "ready" : "blocked"} (${runtimeStatus.configurationSource}, ${runtimeStatus.configuredCount}/${runtimeStatus.requiredCount} configured, ${runtimeStatus.missingCount} missing, ${runtimeStatus.invalidCount} invalid, ${runtimeStatus.placeholderCount} placeholder, fallback=${runtimeStatus.fallbackApplied ? "yes" : "no"}${operational})`
    : "Not checked in this template run. Use --live-runtime or --runtime-health-url to add production runtime context.";
  const runtimeAction = runtimeStatus?.ready
    ? "Production runtime reports this gate configured; complete the redacted source-system evidence below before setting status: ready."
    : runtimeStatus
      ? runtimeStatus.operationalStatus === "database_dns_unresolved"
        ? "Production runtime reports database_dns_unresolved; replace the Vercel Production DATABASE_URI host/connection string with the valid production Postgres/Supabase endpoint, trigger a production redeploy, then rerun npm run vercel:supabase:verify and npm run admin:verify:strict."
        : runtimeStatus.operationalStatus
          ? `Production runtime reports operational status ${runtimeStatus.operationalStatus}; resolve the provider dependency, redeploy production, then complete the redacted source-system evidence below.`
          : "Production runtime is still missing or invalid for this gate; configure the production provider/env first, then complete the redacted source-system evidence below."
      : "Runtime context is diagnostic only and does not replace source-system evidence.";

  return {
    path: evidence.path,
    gateId: gate.id,
    gateLabel: gate.label,
    currentReason: evidence.reason,
    pointsBlocked: Math.max(0, Number(gate.points || 0) - Number(gate.awardedPoints || 0)),
    owner,
    timing,
    operationalGoal: step?.operationalGoal || gate.label,
    checklist,
    requiredProofSignals,
    missingProofSignals: [...(evidence.missingEvidenceSignals || [])],
    guestFacingCopy: guestFacingCopyByGate[gate.id] || "Ekibimiz talebinizi yazili olarak teyit eder.",
    ...(envSetup ? { envSetup } : {}),
    commands: templateCommands,
    runtimeStatus,
    runtimeStatusText,
    runtimeAction,
    kpiAndReviewLoop: step?.kpiAndReviewLoop || "Gate passes in npm run launch:audit.",
    requiredSections: [...requiredEvidenceSections],
    safeEvidenceRules: [...safeEvidenceRules],
  };
}

export function buildEvidenceTemplates({
  launchResult = evaluateCommercialLaunch(),
  cutoverPlan = buildProductionCutoverPlan({ launchResult }),
  gateId = "",
  includeAll = false,
  runtimeReadyOnly = false,
} = {}) {
  const stepsById = indexSteps(cutoverPlan);
  const catalogById = indexGateCatalog();
  const templates = launchResult.gateResults
    .filter((gate) => gateIsIncluded(gate, gateId, includeAll))
    .flatMap((gate) => {
      const catalogGate = catalogById.get(gate.id) || gate;
      const step = stepsById.get(gate.id);

      return missingEvidenceForGate(gate, includeAll).map((evidence) =>
        buildTemplate({ gate, catalogGate, evidence, step }),
      );
    })
    .filter((template) => !runtimeReadyOnly || Boolean(template.runtimeStatus?.ready));

  return {
    generatedAt: new Date().toISOString(),
    decision: templates.length === 0 ? "EVIDENCE_TEMPLATES_EMPTY" : "EVIDENCE_TEMPLATES_READY",
    currentScore: launchResult.score,
    targetScore: launchResult.target,
    includeAll,
    gateId,
    runtimeReadyOnly,
    templates,
  };
}

export function formatEvidenceTemplates(result) {
  const lines = [
    "Kozbeyli Konagi evidence templates",
    `Decision: ${result.decision}`,
    `Commercial score: ${result.currentScore}/${result.targetScore}`,
    result.gateId ? `Gate filter: ${result.gateId}` : `Gate filter: ${result.includeAll ? "all" : "pending"}`,
    "",
  ];

  if (result.templates.length === 0) {
    lines.push("No pending evidence templates.");
    return lines.join("\n");
  }

  result.templates.forEach((template, index) => {
    if (index > 0) lines.push("\n---\n");
    lines.push(buildTemplateMarkdown(template));
  });

  return lines.join("\n");
}

export function buildCompactEvidenceTemplates(result) {
  return {
    generatedAt: result.generatedAt,
    decision: result.decision,
    currentScore: result.currentScore,
    targetScore: result.targetScore,
    includeAll: Boolean(result.includeAll),
    gateId: result.gateId,
    runtimeReadyOnly: Boolean(result.runtimeReadyOnly),
    templateCount: result.templates.length,
    templates: result.templates.map((template) => ({
      path: template.path,
      gateId: template.gateId,
      pointsBlocked: template.pointsBlocked,
      owner: template.owner,
      timing: template.timing,
      currentReason: template.currentReason,
      runtimeReady: Boolean(template.runtimeStatus?.ready),
      ...(template.runtimeStatus?.operationalStatus
        ? { runtimeOperationalStatus: template.runtimeStatus.operationalStatus }
        : {}),
      runtimeStatusText: template.runtimeStatusText,
      envNames: [...(template.envSetup?.envNames || [])],
      requiredProofSignals: [...template.requiredProofSignals],
      sourceRefsPolicy: compactSourceRefsPolicy,
      commands: [...template.commands],
    })),
  };
}

export function formatCompactEvidenceTemplates(result) {
  const lines = [
    "Kozbeyli Konagi compact evidence templates",
    `Generated: ${result.generatedAt}`,
    `Decision: ${result.decision}`,
    `Commercial score: ${result.currentScore}/${result.targetScore}`,
    `Template count: ${result.templateCount}`,
    result.gateId
      ? `Gate filter: ${result.gateId}`
      : `Gate filter: ${result.includeAll ? "all" : "pending"}`,
    `Runtime-ready only: ${result.runtimeReadyOnly ? "yes" : "no"}`,
    "",
  ];

  if (result.templates.length === 0) {
    lines.push("No evidence templates matched the filters.");
    return lines.join("\n");
  }

  for (const template of result.templates) {
    lines.push(`${template.gateId}: ${template.path} (+${template.pointsBlocked} pts)`);
    lines.push(`  owner: ${template.owner}`);
    lines.push(`  timing: ${template.timing}`);
    lines.push(`  runtime: ${template.runtimeStatusText}`);
    if (template.envNames.length > 0) lines.push(`  env names: ${template.envNames.join(", ")}`);
    lines.push(`  proof: ${template.requiredProofSignals.join("; ") || "redacted source-system proof"}`);
    lines.push(`  source refs: ${template.sourceRefsPolicy}`);
    lines.push(`  commands: ${template.commands.join(" && ")}`);
  }

  return lines.join("\n");
}

export function writeEvidenceTemplateReport(
  result,
  outputPath,
  { json = false, compact = false, cwd = process.cwd() } = {},
) {
  const outputResult = compact ? buildCompactEvidenceTemplates(result) : result;
  const body = json
    ? JSON.stringify(outputResult, null, 2)
    : compact
      ? formatCompactEvidenceTemplates(outputResult)
      : formatEvidenceTemplates(outputResult);

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
  const includeAll = process.argv.includes("--all");
  const compact = process.argv.includes("--compact");
  const runtimeReadyOnly = process.argv.includes("--runtime-ready-only");
  const gateId = readArgValue("--gate");
  const outputPath = readArgValue("--output");
  const launchResult = await buildLaunchResultFromArgs();
  const result = buildEvidenceTemplates({ launchResult, gateId, includeAll, runtimeReadyOnly });
  const outputResult = compact ? buildCompactEvidenceTemplates(result) : result;

  if (outputPath) {
    const writtenPath = writeEvidenceTemplateReport(result, outputPath, { json, compact });
    console.log(`Wrote evidence template report: ${writtenPath}`);
  } else {
    console.log(
      json
        ? JSON.stringify(outputResult, null, 2)
        : compact
          ? formatCompactEvidenceTemplates(outputResult)
          : formatEvidenceTemplates(result),
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
