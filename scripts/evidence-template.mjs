import { pathToFileURL } from "node:url";

import { commercialLaunchGates, evaluateCommercialLaunch } from "./commercial-launch-audit.mjs";
import { requiredEvidenceSections, safeEvidenceRules } from "./evidence-handoff.mjs";
import { buildProductionCutoverPlan } from "./production-cutover-plan.mjs";

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

function buildTemplateMarkdown(template) {
  return [
    `# Evidence Template: ${template.gateLabel}`,
    "",
    `target_file: ${template.path}`,
    `gate_id: ${template.gateId}`,
    "status: pending",
    "date: YYYY-MM-DD",
    `owner: ${template.owner}`,
    "source_refs: <redacted-ticket-id>, <dashboard-reference>, <uat-run-id>",
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
    commands,
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
    });

  return {
    generatedAt: new Date().toISOString(),
    decision: templates.length === 0 ? "EVIDENCE_TEMPLATES_EMPTY" : "EVIDENCE_TEMPLATES_READY",
    currentScore: launchResult.score,
    targetScore: launchResult.target,
    includeAll,
    gateId,
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

function readArgValue(name) {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

function main() {
  const json = process.argv.includes("--json");
  const includeAll = process.argv.includes("--all");
  const gateId = readArgValue("--gate");
  const result = buildEvidenceTemplates({ gateId, includeAll });

  console.log(json ? JSON.stringify(result, null, 2) : formatEvidenceTemplates(result));
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
