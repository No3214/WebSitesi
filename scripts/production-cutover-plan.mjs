import { pathToFileURL } from "node:url";

import { evaluateCommercialLaunch } from "./commercial-launch-audit.mjs";
import { evaluateVercelOpsReadiness } from "./vercel-ops-readiness.mjs";

const VERCEL_INSTALL_COMMAND = "npm i -g vercel";
const VERCEL_LOGIN_COMMAND = "vercel login";
const VERCEL_AUTH_CHECK_COMMAND = "vercel whoami";
const VERCEL_AUTH_COMMANDS = [VERCEL_INSTALL_COMMAND, VERCEL_LOGIN_COMMAND, VERCEL_AUTH_CHECK_COMMAND];

const gateActionCatalog = {
  canonical_domain: {
    owner: "Vercel/DNS operator",
    timing: "Before public domain announcement",
    objective: "Serve the current Vercel deployment on kozbeylikonagi.com and www.kozbeylikonagi.com.",
    diagnostics: [
      "Run npm run domain:verify before DNS edits; it must report preview PASS and canonical origins PASS before this gate is ready.",
      "If domain:verify reports legacy Joomla/Seagull template or legacy HotelRunner hosted landing surface, the canonical domain is still routed to the old host even if Vercel shows an alias.",
      "Treat NS/MX DNS PASS separately from web serving readiness; mail/nameserver success does not clear a legacy host surface.",
      "Registrar ownership is not the same as live DNS authority. If nameservers are Cloudflare, edit Cloudflare DNS records; Isimtescil DNS-zone records will not affect traffic until nameservers move to Isimtescil/Natro.",
      "The .com and .com.tr domains can be delegated to different DNS zones or nameserver pairs; verify and edit each authoritative zone separately before assuming a single DNS panel controls both.",
      "Vercel domains inspect currently expects A records to 76.76.21.21 for the apex and www hosts in this project; re-run vercel domains inspect before editing DNS because Vercel can return project-specific values.",
      "The active Turkish ccTLD brand origins are part of the public launch gate; they must serve the current app or securely redirect to the chosen canonical app without stale menu/legacy content.",
    ],
    actions: [
      "Install and authenticate Vercel CLI if it is missing.",
      "Attach the canonical and Turkish ccTLD brand domains to the kozbeyli-konagi Vercel project, or explicitly redirect the brand domains to the chosen canonical origin.",
      "Set NEXT_PUBLIC_SITE_URL to the chosen canonical HTTPS origin in Vercel production env.",
        "Confirm active nameservers before editing DNS; make changes at the authoritative DNS provider, not just the registrar panel.",
        "Check the canonical .com and Turkish ccTLD .com.tr zones independently; do not assume both domains use the same Cloudflare zone or nameserver pair.",
        "Correct Cloudflare DNS so canonical and brand domains resolve to the Vercel production deployment, not the old landing host.",
        "If choosing Isimtescil DNS instead of Cloudflare, first change nameservers and copy existing MX/TXT/SPF/DKIM/DMARC records before adding the Vercel A/CNAME records shown by vercel domains inspect.",
      "Remove old Joomla/Seagull and HotelRunner hosted landing routing from the canonical web origin.",
      "Remove any HTTPS-to-HTTP first-hop redirect on canonical or brand origins before marking the domain gate ready.",
      "Run npm run domain:verify:strict and npm run launch:smoke:live before marking evidence ready.",
    ],
    commands: [
      ...VERCEL_AUTH_COMMANDS,
      "vercel env pull",
      "vercel env add NEXT_PUBLIC_SITE_URL production",
      "npm run domain:verify",
      "npm run domain:verify:strict",
      "npm run launch:smoke:live",
    ],
    evidence: ["docs/evidence/canonical-domain.md"],
    kpi: "Canonical and brand origins return /api/health service=kozbeyli-konagi at the current commit, expose /videos/hero.mp4 on the homepage or securely redirect to an origin that does, and report no legacy host signatures.",
  },
  production_abuse_controls: {
    owner: "Security / platform operator",
    timing: "Before enabling public lead capture at scale",
    objective: "Protect public forms and booking-adjacent APIs with production Turnstile and shared replay/rate-limit controls.",
    actions: [
      "Create production Cloudflare Turnstile keys for the canonical domain.",
      "Provision shared Upstash Redis REST credentials for production rate-limit and replay checks.",
      "Add all abuse-control env keys in Vercel production.",
      "Submit a real lead-form UAT and verify blocked/allowed behavior without logging secrets.",
    ],
    commands: [
      ...VERCEL_AUTH_COMMANDS,
      "vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production",
      "vercel env add TURNSTILE_SECRET_KEY production",
      "vercel env add UPSTASH_REDIS_REST_URL production",
      "vercel env add UPSTASH_REDIS_REST_TOKEN production",
      "npm run launch:audit",
    ],
    evidence: ["docs/evidence/production-abuse-controls.md"],
    kpi: "Lead capture accepts a valid Turnstile token and blocks replay/abusive submissions without exposing secret values.",
  },
  hms_booking_engine: {
    owner: "Revenue / booking operator",
    timing: "Before replacing WhatsApp fallback as primary reservation path",
    objective: "Use the approved HMS handoff and prove a booking UAT path.",
    actions: [
      "Run npm run hms:verify:strict to confirm the public target is the approved Kozbeyli HMS host, not another hotel/vendor URL.",
      "Verify the public reservation CTA opens the approved HTTPS HMS engine in a new tab.",
      "Run a live booking-engine UAT for dates, guests, room availability and fallback behavior.",
      "Document date, guest, room/rate selection, fallback and modification/refund handling in redacted evidence.",
      "Keep WhatsApp/phone support available until the live booking engine evidence is ready.",
    ],
    commands: [
      VERCEL_INSTALL_COMMAND,
      "npm run hms:verify:strict",
      "npm run launch:smoke:live",
      "npm run launch:audit",
    ],
    evidence: ["docs/evidence/hms-booking-engine.md"],
    kpi: "Reservation CTA opens the hotel-specific live booking engine and a redacted UAT proves date/guest selection works.",
  },
  garanti_pos: {
    owner: "Finance / payment operator",
    timing: "Before accepting card payments",
    objective: "Configure Garanti Sanal POS and prove payment, failure and refund/cancel flows.",
    actions: [
      "Collect production/sandbox Merchant ID, Terminal ID, provision user and 3D Store Key outside the repo.",
      "Add POS env keys in Vercel production or sandbox environment as appropriate.",
      "Run successful payment, failed payment, callback verification and refund/cancel UAT.",
      "Store only redacted evidence references in the repository.",
    ],
    commands: [
      ...VERCEL_AUTH_COMMANDS,
      "vercel env add GARANTI_POS_MODE production",
      "vercel env add GARANTI_MERCHANT_ID production",
      "vercel env add GARANTI_TERMINAL_ID production",
      "vercel env add GARANTI_PROVISION_USER production",
      "vercel env add GARANTI_3D_STORE_KEY production",
      "npm run launch:audit",
    ],
    evidence: ["docs/evidence/garanti-pos.md"],
    kpi: "Payment UAT proves success, failure, callback signature handling and refund/cancel without storing card or bank secrets.",
  },
  analytics_purchase: {
    owner: "Growth / analytics operator",
    timing: "Before paid acquisition or revenue reporting",
    objective: "Enable production analytics and prove purchase/lead events end to end.",
    actions: [
      "Create or confirm GTM or direct Google tag, GA4 Measurement Protocol, Google Ads and Meta Pixel production IDs.",
      "Add analytics env keys in Vercel production.",
      "Validate consent-gated pageview, lead and purchase events in debug tools.",
      "Keep proof redacted; do not commit API secrets or raw visitor data.",
    ],
    commands: [
      ...VERCEL_AUTH_COMMANDS,
      "vercel env add NEXT_PUBLIC_GTM_ID production",
      "vercel env add NEXT_PUBLIC_GA4_MEASUREMENT_ID production",
      "vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production",
      "vercel env add NEXT_PUBLIC_META_PIXEL_ID production",
      "vercel env add GA4_MEASUREMENT_ID production",
      "vercel env add GA4_API_SECRET production",
      "npm run launch:audit",
    ],
    evidence: ["docs/evidence/analytics-purchase.md"],
    kpi: "Consent-gated analytics events appear in GTM/GA4/Meta debug views and purchase validation is referenced without PII.",
  },
  search_local_seo: {
    owner: "SEO / local listings operator",
    timing: "Before final canonical launch sign-off",
    objective: "Verify Search Console, Google Business Profile and hotel/local SEO surfaces.",
    actions: [
      "Add Google site verification token in Vercel production.",
      "Submit sitemap after canonical DNS points to the new app.",
      "Verify Google Business Profile and Hotel Center ownership/status.",
      "Record external console/listing references in evidence.",
    ],
    commands: [
      ...VERCEL_AUTH_COMMANDS,
      "vercel env add GOOGLE_SITE_VERIFICATION production",
      "npm run domain:verify:strict",
      "npm run launch:audit",
    ],
    evidence: ["docs/evidence/search-local-seo.md"],
    kpi: "Search Console sees the canonical property, sitemap is submitted and GBP/Hotel Center ownership is referenced.",
  },
  legal_dpa: {
    owner: "Legal / operations owner",
    timing: "Before full booking/payment launch",
    objective: "Prove vendor DPA, privacy and data-transfer approval for booking, analytics and payment vendors.",
    actions: [
      "Collect DPA or equivalent legal approval references for Vercel, booking, analytics, payment and messaging vendors.",
      "Confirm KVKK/privacy notices cover the enabled vendor set.",
      "Mark evidence ready only with source references and residual risk notes.",
      "Keep contracts and private documents outside the repository.",
    ],
    commands: ["npm run evidence:scan", "npm run launch:audit"],
    evidence: ["docs/evidence/legal-dpa.md"],
    kpi: "All active production vendors have legal approval references and no private contract material is committed.",
  },
};

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function hasEnvIssue(gate, envKey) {
  return gate.missingEnv.some((item) => item.startsWith(envKey));
}

function resolveGateChecklist(gate, catalog) {
  if (gate.id !== "hms_booking_engine") return catalog.actions;

  if (!hasEnvIssue(gate, "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL")) {
    return catalog.actions;
  }

  return [
    "Fix NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL in Vercel production so it is the approved HTTPS HMS URL, or remove the bad override to use the official code fallback.",
    ...catalog.actions,
  ];
}

function resolveGateCommands(gate, catalog) {
  if (gate.id !== "hms_booking_engine") return catalog.commands;

  if (!hasEnvIssue(gate, "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL")) {
    return catalog.commands;
  }

  return [
    ...VERCEL_AUTH_COMMANDS,
    "vercel env add NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL production",
    ...catalog.commands.filter((command) => command !== VERCEL_INSTALL_COMMAND),
  ];
}

function buildGateStep(gate) {
  const catalog = gateActionCatalog[gate.id] || {
    owner: "Launch operator",
    timing: "Before full launch",
    objective: gate.label,
    actions: ["Resolve the blocked launch gate and provide redacted evidence."],
    commands: ["npm run launch:audit"],
    evidence: gate.evidence || [],
    diagnostics: [],
    kpi: "Gate passes in npm run launch:audit.",
  };

  return {
    id: gate.id,
    pointsBlocked: gate.points - gate.awardedPoints,
    label: gate.label,
    owner: catalog.owner,
    timing: catalog.timing,
    operationalGoal: catalog.objective,
    envDiagnostics: {
      source: gate.configurationSource || "unknown",
      requiredCount: gate.requiredEnvCount || gate.env?.length || 0,
      configuredCount: gate.configuredEnvCount || 0,
      missingCount: gate.missingEnvCount || 0,
      invalidCount: gate.invalidEnvCount || 0,
      placeholderCount: gate.placeholderEnvCount || 0,
      fallbackApplied: Boolean(gate.fallbackApplied),
    },
    missingEnv: gate.missingEnv,
    missingEvidence: gate.missingEvidence,
    diagnostics: catalog.diagnostics || [],
    checklist: resolveGateChecklist(gate, catalog),
    commands: resolveGateCommands(gate, catalog),
    evidence: unique([...(gate.evidence || []), ...(catalog.evidence || [])]),
    kpiAndReviewLoop: catalog.kpi,
  };
}

export function buildProductionCutoverPlan({
  launchResult = evaluateCommercialLaunch(),
  vercelOpsResult = evaluateVercelOpsReadiness(),
} = {}) {
  const blockedGates = launchResult.gateResults.filter((gate) => !gate.ready);
  const blockedPoints = launchResult.target - launchResult.score;

  return {
    generatedAt: new Date().toISOString(),
    decision: blockedGates.length === 0 ? "READY_FOR_FULL_COMMERCIAL_LAUNCH" : "CUTOVER_ACTION_REQUIRED",
    currentScore: launchResult.score,
    targetScore: launchResult.target,
    blockedPoints,
    vercelCliInstallCommand: VERCEL_INSTALL_COMMAND,
    vercelOpsDecision: vercelOpsResult.decision,
    vercelOpsWarnings: vercelOpsResult.warnings.map((warning) => ({
      id: warning.id,
      detail: warning.detail,
      remediation: warning.remediation || "",
    })),
    nextGateOrder: blockedGates.map((gate) => gate.id),
    gateSteps: blockedGates.map(buildGateStep),
    finalVerificationCommands: [
      "npm run vercel:ops:strict",
      "npm run vercel:env:strict",
      "npm run domain:verify:strict",
      "npm run hms:verify:strict",
      "npm run launch:smoke:live",
      "npm run launch:audit:strict",
      "npm run release:verify",
    ],
  };
}

export function formatProductionCutoverPlan(plan) {
  const lines = [
    "Kozbeyli Konagi production cutover plan",
    `Decision: ${plan.decision}`,
    `Commercial score: ${plan.currentScore}/${plan.targetScore}`,
    `Blocked points: ${plan.blockedPoints}`,
    `Vercel ops: ${plan.vercelOpsDecision}`,
    `Vercel CLI install: ${plan.vercelCliInstallCommand}`,
    "",
  ];

  if (plan.vercelOpsWarnings.length > 0) {
    lines.push("Vercel ops warnings:");
    for (const warning of plan.vercelOpsWarnings) {
      lines.push(`- ${warning.id}: ${warning.detail}`);
      if (warning.remediation) lines.push(`  remediation: ${warning.remediation}`);
    }
    lines.push("");
  }

  if (plan.gateSteps.length === 0) {
    lines.push("All commercial launch gates are ready.");
  } else {
    lines.push("Cutover checklist:");
    for (const step of plan.gateSteps) {
      lines.push("");
      lines.push(`${step.id} (+${step.pointsBlocked} pts blocked) - ${step.label}`);
      lines.push(`  owner: ${step.owner}`);
      lines.push(`  timing: ${step.timing}`);
      lines.push(`  goal: ${step.operationalGoal}`);
      lines.push(
        `  env: ${step.envDiagnostics.source} (${step.envDiagnostics.configuredCount}/${step.envDiagnostics.requiredCount} configured, ${step.envDiagnostics.missingCount} missing, ${step.envDiagnostics.invalidCount} invalid, ${step.envDiagnostics.placeholderCount} placeholder, fallback=${step.envDiagnostics.fallbackApplied ? "yes" : "no"})`,
      );
      if (step.missingEnv.length > 0) lines.push(`  missing env: ${step.missingEnv.join(", ")}`);
      if (step.missingEvidence.length > 0) {
        lines.push(
          `  missing evidence: ${step.missingEvidence
            .map((item) => `${item.path} (${item.reason})`)
            .join(", ")}`,
        );
      }
      if (step.diagnostics.length > 0) {
        lines.push("  diagnostics:");
        step.diagnostics.forEach((item) => lines.push(`  - ${item}`));
      }
      lines.push("  checklist:");
      step.checklist.forEach((item) => lines.push(`  - ${item}`));
      lines.push(`  commands: ${step.commands.join(" && ")}`);
      lines.push(`  KPI/review: ${step.kpiAndReviewLoop}`);
    }
  }

  lines.push("");
  lines.push("Final verification commands:");
  plan.finalVerificationCommands.forEach((command) => lines.push(`- ${command}`));

  return lines.join("\n");
}

function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const plan = buildProductionCutoverPlan();

  console.log(json ? JSON.stringify(plan, null, 2) : formatProductionCutoverPlan(plan));
  process.exitCode = strict && plan.decision !== "READY_FOR_FULL_COMMERCIAL_LAUNCH" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
