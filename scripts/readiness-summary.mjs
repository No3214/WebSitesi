import { pathToFileURL } from "node:url";

import { evaluateAdminSurfaceReadiness } from "./admin-surface-readiness.mjs";
import {
  DEFAULT_RUNTIME_HEALTH_URL,
  evaluateCommercialLaunch,
  fetchRuntimeReadiness,
} from "./commercial-launch-audit.mjs";
import { evaluateDomainReadiness } from "./domain-readiness.mjs";
import { collectGithubCiReadiness } from "./github-ci-readiness.mjs";
import { evaluateVercelOpsReadiness } from "./vercel-ops-readiness.mjs";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function shortSha(sha = "") {
  return sha ? sha.slice(0, 12) : "";
}

function compactChecks(checks = []) {
  return checks.map((check) => ({
    id: check.id,
    status: check.status,
    detail: check.detail,
    ...(check.remediation ? { remediation: check.remediation } : {}),
  }));
}

function compactDomain(result) {
  return {
    decision: result.decision,
    expectedCommit: shortSha(result.expectedCommit),
    canonicalReady: Boolean(result.canonicalReady),
    brandReady: Boolean(result.brandReady),
    previewReady: Boolean(result.previewReady),
    dnsReady: Boolean(result.dnsReady),
    origins: [...result.canonical, ...result.brand].map((item) => ({
      origin: item.origin,
      ready: Boolean(item.ready),
      healthStatus: item.health?.status || 0,
      homeStatus: item.home?.status || 0,
      deploymentCommit: shortSha(item.health?.deploymentCommit || ""),
      openingHeroVideo: Boolean(item.home?.hasOpeningHeroVideo),
    })),
    blockers: [...(result.blockers || [])],
    warnings: [...(result.warnings || [])],
  };
}

function compactLaunch(result) {
  const blockedGates = result.gateResults
    .filter((gate) => !gate.ready)
    .map((gate) => ({
      id: gate.id,
      label: gate.label,
      pointsBlocked: Math.max(0, Number(gate.points || 0) - Number(gate.awardedPoints || 0)),
      missingEvidenceCount: gate.missingEvidence?.length || 0,
      missingEnvCount: gate.missingEnvCount || gate.missingEnv?.length || 0,
    }));

  return {
    score: result.score,
    target: result.target,
    decision: result.decision,
    runtimeReadiness: result.runtimeReadiness
      ? {
          source: result.runtimeReadiness.source,
          status: result.runtimeReadiness.status,
          ready: Boolean(result.runtimeReadiness.ready),
          configuredGates: [...(result.runtimeReadiness.configuredGates || [])],
          blockedGates: [...(result.runtimeReadiness.blockedGates || [])],
          ...(result.runtimeReadiness.error ? { error: result.runtimeReadiness.error } : {}),
        }
      : undefined,
    readyGates: result.gateResults.filter((gate) => gate.ready).map((gate) => gate.id),
    blockedGates,
  };
}

function compactGithub(result) {
  return {
    decision: result.decision,
    repo: result.repo,
    branch: result.branch,
    runId: result.runId,
    runUrl: result.runUrl,
    status: result.status,
    conclusion: result.conclusion,
    workflowName: result.workflowName,
    headSha: shortSha(result.headSha),
    expectedHeadSha: shortSha(result.expectedHeadSha),
    headShaMatches: Boolean(result.headShaMatches),
    failedJobCount: result.failedJobs?.length || 0,
    blockers: [...(result.blockers || [])],
    remediation: [...(result.remediation || [])],
    errors: [...(result.errors || [])],
  };
}

function compactVercel(result) {
  return {
    decision: result.decision,
    installCommand: result.installCommand,
    failures: compactChecks(result.failures || []),
    warnings: compactChecks(result.warnings || []),
    checks: compactChecks(result.checks || []),
  };
}

function compactAdmin(result) {
  return {
    decision: result.decision,
    target: result.live?.target || "",
    status: result.live?.status || 0,
    location: result.live?.location || "",
    blockers: [...(result.blockers || [])],
  };
}

function overallDecision(summary) {
  const runtimeBlocking =
    summary.domain.decision !== "CANONICAL DOMAIN GO" ||
    summary.vercel.decision === "FAIL" ||
    summary.admin.decision !== "ADMIN SURFACE READY";

  if (runtimeBlocking) return "PUBLIC RELEASE BLOCKED";
  if (summary.launch.score < summary.launch.target) return "PUBLIC SITE LIVE; FULL COMMERCIAL LAUNCH BLOCKED";
  if (summary.github.decision !== "GITHUB CI PASS") return "FULL COMMERCIAL READY; CI EVIDENCE BLOCKED";
  return "FULL COMMERCIAL GO";
}

function buildNextActions(summary) {
  const actions = [];

  if (summary.domain.decision !== "CANONICAL DOMAIN GO") {
    actions.push("Restore canonical domain health, then run npm run domain:verify:strict.");
  }

  if (summary.vercel.decision === "FAIL") {
    const firstFailure = summary.vercel.failures[0];
    actions.push(firstFailure?.remediation || "Fix Vercel project/CLI readiness, then run npm run vercel:ops:strict.");
  } else if (summary.vercel.warnings.length > 0) {
    actions.push(summary.vercel.warnings[0]?.remediation || "Review Vercel warnings, then run npm run vercel:ops:strict.");
  }

  const adminDependencyBlocked = summary.admin.blockers.some((blocker) =>
    blocker.includes("live_payload_admin_dependency_ready") || blocker.includes("dependency-unavailable"),
  );

  if (adminDependencyBlocked) {
    actions.push(
      "Fix the Vercel Production DATABASE_URI/PAYLOAD_SECRET dependency for Payload admin, then run npm run vercel:supabase:verify and npm run admin:verify:strict.",
    );
  } else if (summary.admin.decision !== "ADMIN SURFACE READY") {
    actions.push("Protect the admin growth surface, then run npm run admin:verify:strict.");
  }

  if (summary.github.decision === "GITHUB CI ACCOUNT BLOCKED") {
    actions.push("Resolve GitHub Billing & plans / spending-limit blocker, then run npm run github:ci:strict.");
  } else if (summary.github.decision !== "GITHUB CI PASS") {
    actions.push(summary.github.remediation[0] || "Restore current-commit GitHub CI evidence, then run npm run github:ci:strict.");
  }

  if (summary.launch.score < summary.launch.target) {
    const gateIds = summary.launch.blockedGates.map((gate) => gate.id).join(", ");
    actions.push(`Close commercial launch gates (${gateIds}), then run npm run launch:audit:live:strict.`);
    actions.push("Use npm run launch:standup:live for owner queues and npm run evidence:handoff:live for redacted proof files.");
  }

  return unique(actions);
}

function readinessOrigins(result = {}) {
  return [result.preview, ...(result.canonical || []), ...(result.brand || [])].filter(Boolean);
}

function originHasTransportFailure(origin = {}) {
  return (origin.health?.status || 0) === 0 || (origin.home?.status || 0) === 0;
}

export function shouldRetryDomainReadiness(result) {
  if (!result || result.decision === "CANONICAL DOMAIN GO") return false;
  return readinessOrigins(result).some(originHasTransportFailure);
}

export function rankDomainReadiness(result) {
  if (!result) return -1;

  const origins = readinessOrigins(result);
  const decisionScore = result.decision === "CANONICAL DOMAIN GO" ? 1000000 : 0;
  const readyScore = origins.filter((origin) => origin.ready).length * 100;
  const responseScore = origins.reduce((score, origin) => {
    return score + ((origin.health?.status || 0) > 0 ? 1 : 0) + ((origin.home?.status || 0) > 0 ? 1 : 0);
  }, 0);
  const blockerPenalty = (result.blockers || []).length;

  return decisionScore + readyScore + responseScore - blockerPenalty;
}

function wait(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectDomainReadinessWithRetry({
  compareDnsResolvers,
  evaluateDomainReadinessImpl,
  domainRetryDelayMs,
  domainMaxAttempts,
}) {
  let bestResult;

  for (let attempt = 0; attempt < domainMaxAttempts; attempt += 1) {
    const result = await evaluateDomainReadinessImpl({ compareDnsResolvers });
    if (!bestResult || rankDomainReadiness(result) > rankDomainReadiness(bestResult)) {
      bestResult = result;
    }

    if (!shouldRetryDomainReadiness(result) || attempt === domainMaxAttempts - 1) {
      return bestResult;
    }

    await wait(domainRetryDelayMs);
  }

  return bestResult;
}

export function buildReadinessSummary({
  generatedAt = new Date().toISOString(),
  domainResult,
  launchResult,
  githubCiResult,
  vercelOpsResult,
  adminSurfaceResult,
} = {}) {
  const summary = {
    generatedAt,
    scope: "canonical-domain-commercial-launch-github-ci-vercel-admin",
    domain: compactDomain(domainResult),
    launch: compactLaunch(launchResult),
    github: compactGithub(githubCiResult),
    vercel: compactVercel(vercelOpsResult),
    admin: compactAdmin(adminSurfaceResult),
  };

  return {
    ...summary,
    decision: overallDecision(summary),
    nextActions: buildNextActions(summary),
    finalVerificationCommands: [
      "npm run readiness:summary:json",
      "npm run live:verify",
      "npm run domain:verify:strict",
      "npm run github:ci:strict",
      "npm run launch:audit:live:strict",
    ],
  };
}

export async function collectReadinessSummary({
  runtimeHealthUrl = DEFAULT_RUNTIME_HEALTH_URL,
  compareDnsResolvers = true,
  allowNpxFallback = false,
  evaluateDomainReadinessImpl = evaluateDomainReadiness,
  collectGithubCiReadinessImpl = collectGithubCiReadiness,
  evaluateVercelOpsReadinessImpl = evaluateVercelOpsReadiness,
  evaluateAdminSurfaceReadinessImpl = evaluateAdminSurfaceReadiness,
  fetchRuntimeReadinessImpl = fetchRuntimeReadiness,
  evaluateCommercialLaunchImpl = evaluateCommercialLaunch,
  domainRetryDelayMs = 1500,
  domainMaxAttempts = 2,
} = {}) {
  const domainResult = await collectDomainReadinessWithRetry({
    compareDnsResolvers,
    evaluateDomainReadinessImpl,
    domainRetryDelayMs,
    domainMaxAttempts,
  });

  const [githubCiResult, vercelOpsResult, adminSurfaceResult] = await Promise.all([
    Promise.resolve(collectGithubCiReadinessImpl()),
    Promise.resolve(evaluateVercelOpsReadinessImpl({ allowNpxFallback })),
    Promise.resolve(evaluateAdminSurfaceReadinessImpl()),
  ]);

  let runtimeReadiness;
  let runtimeReadinessError;
  if (runtimeHealthUrl) {
    try {
      runtimeReadiness = await fetchRuntimeReadinessImpl(runtimeHealthUrl);
    } catch (error) {
      runtimeReadinessError = error instanceof Error ? error.message : String(error);
    }
  }

  const launchResult = evaluateCommercialLaunchImpl({
    ...(runtimeReadiness ? { runtimeReadiness, runtimeSource: runtimeHealthUrl } : {}),
    ...(runtimeReadinessError ? { runtimeReadinessError, runtimeSource: runtimeHealthUrl } : {}),
  });

  return buildReadinessSummary({
    domainResult,
    launchResult,
    githubCiResult,
    vercelOpsResult,
    adminSurfaceResult,
  });
}

export function formatReadinessSummary(summary) {
  const lines = [
    "Kozbeyli Konagi readiness summary",
    `Generated: ${summary.generatedAt}`,
    `Decision: ${summary.decision}`,
    `Commercial launch score: ${summary.launch.score}/${summary.launch.target}`,
    "",
    `Domain: ${summary.domain.decision} (dns=${summary.domain.dnsReady ? "ready" : "blocked"}, expectedCommit=${summary.domain.expectedCommit || "n/a"})`,
  ];

  for (const origin of summary.domain.origins) {
    lines.push(
      `  ${origin.ready ? "PASS" : "FAIL"} ${origin.origin} health=${origin.healthStatus} home=${origin.homeStatus} commit=${origin.deploymentCommit || "n/a"} heroVideo=${origin.openingHeroVideo ? "yes" : "no"}`,
    );
  }

  lines.push(
    `Launch: ${summary.launch.decision}; blocked=${summary.launch.blockedGates.length === 0 ? "none" : summary.launch.blockedGates.map((gate) => gate.id).join(", ")}`,
  );
  if (summary.launch.runtimeReadiness) {
    lines.push(
      `Runtime: ${summary.launch.runtimeReadiness.status} from ${summary.launch.runtimeReadiness.source}; configured=${summary.launch.runtimeReadiness.configuredGates.join(", ") || "none"}; blocked=${summary.launch.runtimeReadiness.blockedGates.join(", ") || "none"}`,
    );
  }

  lines.push(
    `GitHub CI: ${summary.github.decision}; headShaMatches=${summary.github.headShaMatches ? "yes" : "no"}; run=${summary.github.runId || "n/a"}`,
  );
  lines.push(`Vercel ops: ${summary.vercel.decision}`);
  lines.push(`Admin surface: ${summary.admin.decision} (HTTP ${summary.admin.status || "n/a"})`);

  const blockers = [
    ...summary.domain.blockers,
    ...summary.github.blockers,
    ...summary.admin.blockers,
    ...summary.vercel.failures.map((check) => check.detail),
  ];
  if (blockers.length > 0) {
    lines.push("");
    lines.push("Current blockers:");
    blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  }

  lines.push("");
  lines.push("Next actions:");
  if (summary.nextActions.length === 0) {
    lines.push("- No readiness actions are currently blocked.");
  } else {
    summary.nextActions.forEach((action) => lines.push(`- ${action}`));
  }

  lines.push("");
  lines.push("Final verification commands:");
  summary.finalVerificationCommands.forEach((command) => lines.push(`- ${command}`));

  return lines.join("\n");
}

function argValue(name) {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

async function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const runtimeHealthUrl = process.argv.includes("--no-live-runtime")
    ? ""
    : argValue("--runtime-health-url") || DEFAULT_RUNTIME_HEALTH_URL;
  const summary = await collectReadinessSummary({
    runtimeHealthUrl,
    compareDnsResolvers: !process.argv.includes("--no-dns-compare"),
    allowNpxFallback: process.argv.includes("--allow-npx-fallback"),
  });

  console.log(json ? JSON.stringify(summary, null, 2) : formatReadinessSummary(summary));
  process.exitCode = strict && summary.decision !== "FULL COMMERCIAL GO" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void main();
}
