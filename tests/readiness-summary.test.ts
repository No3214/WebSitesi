import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

type ReadinessSummaryModule = {
  buildReadinessSummary: (input: Record<string, unknown>) => {
    decision: string;
    launch: {
      score: number;
      target: number;
      blockedGates: Array<{ id: string; pointsBlocked: number }>;
      runtimeReadyEvidenceOnlyGates: Array<{ id: string; pointsBlocked: number; evidencePaths: string[] }>;
      providerOrOperatorBlockedGates: Array<{ id: string; pointsBlocked: number }>;
      runtimeReadiness?: { status: string; blockedGates: string[] };
    };
    domain: { origins: Array<{ origin: string; openingHeroVideo: boolean }> };
    github: { decision: string; headShaMatches: boolean };
    nextActions: string[];
    finalVerificationCommands: string[];
  };
  collectReadinessSummary: (input: Record<string, unknown>) => Promise<{
    decision: string;
    domain: { decision: string };
    nextActions: string[];
  }>;
  formatReadinessSummary: (summary: Record<string, unknown>) => string;
  shouldRetryDomainReadiness: (input: Record<string, unknown>) => boolean;
};

async function loadReadinessSummaryModule() {
  return (await import(
    pathToFileURL(path.join(process.cwd(), "scripts/readiness-summary.mjs")).href
  )) as ReadinessSummaryModule;
}

const domainResult = {
  decision: "CANONICAL DOMAIN GO",
  expectedCommit: "16dd4f9aea45cdeafe6a04fe8b6673caac754d9a",
  canonicalReady: true,
  brandReady: true,
  previewReady: true,
  dnsReady: true,
  canonical: [
    {
      origin: "https://www.kozbeylikonagi.com",
      ready: true,
      health: { status: 200, deploymentCommit: "16dd4f9aea45cdeafe6a04fe8b6673caac754d9a" },
      home: { status: 200, hasOpeningHeroVideo: true },
    },
  ],
  brand: [],
  blockers: [],
  warnings: [],
};

const launchResult = {
  score: 82,
  target: 100,
  decision: "NO-GO for full booking/payment launch",
  runtimeReadiness: {
    source: "https://www.kozbeylikonagi.com/api/health",
    status: "blocked",
    ready: false,
    configuredGates: ["canonical_domain", "production_database", "hms_booking_engine"],
    blockedGates: ["production_abuse_controls", "garanti_pos", "analytics_purchase"],
  },
  gateResults: [
    {
      id: "canonical_domain",
      label: "Canonical domain",
      ready: true,
      points: 3,
      awardedPoints: 3,
      missingEvidence: [],
      missingEnv: [],
    },
    {
      id: "analytics_purchase",
      label: "Analytics purchase evidence",
      ready: false,
      points: 3,
      awardedPoints: 0,
      missingEvidence: [{ path: "docs/evidence/analytics-purchase.md" }],
      missingEnv: ["GA4_API_SECRET"],
      missingEnvCount: 1,
    },
  ],
};

const launchResultWithRuntimeReadyEvidenceOnly = {
  ...launchResult,
  runtimeReadiness: {
    ...launchResult.runtimeReadiness,
    configuredGates: [
      "canonical_domain",
      "production_database",
      "hms_booking_engine",
    ],
    blockedGates: ["production_abuse_controls", "garanti_pos", "analytics_purchase"],
  },
  gateResults: [
    ...launchResult.gateResults,
    {
      id: "hms_booking_engine",
      label: "HMS booking engine handoff and booking UAT evidence",
      ready: false,
      points: 4,
      awardedPoints: 0,
      missingEvidence: [{ path: "docs/evidence/hms-booking-engine.md" }],
      missingEnv: [],
      missingEnvCount: 0,
      runtimeSatisfiedByProduction: true,
      runtimeConfiguration: {
        source: "https://www.kozbeylikonagi.com/api/health",
        status: "ready",
        ready: true,
        configurationSource: "env",
        requiredCount: 1,
        configuredCount: 1,
        missingCount: 0,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
      },
    },
  ],
};

const githubCiResult = {
  decision: "GITHUB CI ACCOUNT BLOCKED",
  repo: "No3214/WebSitesi",
  branch: "main",
  runId: "28050981940",
  runUrl: "https://github.com/No3214/WebSitesi/actions/runs/28050981940",
  status: "completed",
  conclusion: "failure",
  workflowName: "CI",
  headSha: "16dd4f9aea45cdeafe6a04fe8b6673caac754d9a",
  expectedHeadSha: "16dd4f9aea45cdeafe6a04fe8b6673caac754d9a",
  headShaMatches: true,
  failedJobs: [{}],
  blockers: [
    "GitHub account billing/spending limit blocked CI: The job was not started because recent account payments have failed or your spending limit needs to be increased.",
  ],
  remediation: ["Resolve Billing and plans, then rerun npm run github:ci:strict."],
  errors: [],
};

const vercelOpsResult = {
  decision: "PASS",
  installCommand: "npm i -g vercel",
  checks: [{ id: "vercel_auth", status: "pass", detail: "Vercel CLI authenticated as no3214." }],
  failures: [],
  warnings: [],
};

const adminSurfaceResult = {
  decision: "ADMIN SURFACE READY",
  live: {
    target: "https://www.kozbeylikonagi.com/admin/growth",
    status: 307,
    location: "/admin/login",
  },
  blockers: [],
};

const transientDomainResult = {
  ...domainResult,
  decision: "CANONICAL DOMAIN NO-GO",
  canonicalReady: false,
  canonical: [
    {
      origin: "https://www.kozbeylikonagi.com",
      ready: false,
      health: {
        status: 0,
        deploymentCommit: "",
        error: "fetch failed",
      },
      home: {
        status: 0,
        hasOpeningHeroVideo: false,
        error: "fetch failed",
      },
    },
  ],
  blockers: ["https://www.kozbeylikonagi.com does not serve kozbeyli-konagi at current commit"],
};

describe("readiness summary", () => {
  it("summarizes live publish state without pretending commercial launch is complete", async () => {
    const { buildReadinessSummary } = await loadReadinessSummaryModule();

    const result = buildReadinessSummary({
      generatedAt: "2026-06-23T00:00:00.000Z",
      domainResult,
      launchResult,
      githubCiResult,
      vercelOpsResult,
      adminSurfaceResult,
    });

    expect(result.decision).toBe("PUBLIC SITE LIVE; FULL COMMERCIAL LAUNCH BLOCKED");
    expect(result.launch.score).toBe(82);
    expect(result.launch.blockedGates.map((gate) => gate.id)).toEqual(["analytics_purchase"]);
    expect(result.launch.blockedGates[0]?.pointsBlocked).toBe(3);
    expect(result.launch.runtimeReadiness?.blockedGates).toContain("garanti_pos");
    expect(result.domain.origins[0]?.openingHeroVideo).toBe(true);
    expect(result.github.decision).toBe("GITHUB CI ACCOUNT BLOCKED");
    expect(result.github.headShaMatches).toBe(true);
    expect(result.nextActions.join("\n")).toContain("Billing & plans");
    expect(result.nextActions.join("\n")).toContain("launch:audit:live:strict");
    expect(result.finalVerificationCommands).toContain("npm run readiness:summary:json");
    expect(result.finalVerificationCommands).toContain("npm run live:verify");
    expect(result.finalVerificationCommands.indexOf("npm run live:verify")).toBeLessThan(
      result.finalVerificationCommands.indexOf("npm run launch:audit:live:strict"),
    );
  });

  it("formats a concise operator report with the decisive blockers", async () => {
    const { buildReadinessSummary, formatReadinessSummary } = await loadReadinessSummaryModule();
    const summary = buildReadinessSummary({
      generatedAt: "2026-06-23T00:00:00.000Z",
      domainResult,
      launchResult,
      githubCiResult,
      vercelOpsResult,
      adminSurfaceResult,
    });

    const report = formatReadinessSummary(summary);

    expect(report).toContain("Kozbeyli Konagi readiness summary");
    expect(report).toContain("Commercial launch score: 82/100");
    expect(report).toContain("heroVideo=yes");
    expect(report).toContain("GitHub CI: GITHUB CI ACCOUNT BLOCKED; headShaMatches=yes");
    expect(report).toContain("Vercel ops: PASS");
    expect(report).toContain("Admin surface: ADMIN SURFACE READY");
    expect(report).toContain("analytics_purchase");
    expect(report).not.toContain("SUPABASE_SERVICE_ROLE_KEY=");
    expect(report).not.toContain("GARANTI_3D_STORE_KEY=");
    expect(report).not.toContain("GA4_API_SECRET=");
  });

  it("surfaces runtime-ready evidence-only gates as the fastest commercial closeout lane", async () => {
    const { buildReadinessSummary, formatReadinessSummary } = await loadReadinessSummaryModule();
    const summary = buildReadinessSummary({
      generatedAt: "2026-06-23T00:00:00.000Z",
      domainResult,
      launchResult: launchResultWithRuntimeReadyEvidenceOnly,
      githubCiResult: {
        ...githubCiResult,
        decision: "GITHUB CI PASS",
        conclusion: "success",
        failedJobs: [],
        blockers: [],
        remediation: [],
      },
      vercelOpsResult,
      adminSurfaceResult,
    });
    const report = formatReadinessSummary(summary);

    expect(summary.launch.runtimeReadyEvidenceOnlyGates).toEqual([
      expect.objectContaining({
        id: "hms_booking_engine",
        pointsBlocked: 4,
        evidencePaths: ["docs/evidence/hms-booking-engine.md"],
      }),
    ]);
    expect(summary.launch.providerOrOperatorBlockedGates.map((gate) => gate.id)).toEqual(["analytics_purchase"]);
    expect(summary.nextActions.join("\n")).toContain("runtime-ready evidence-only gates (hms_booking_engine)");
    expect(summary.nextActions.join("\n")).toContain("real redacted source_refs");
    expect(summary.nextActions.join("\n")).toContain("npm run evidence:templates:live:runtime-ready");
    expect(report).toContain("Runtime-ready evidence-only: hms_booking_engine (+4)");
    expect(report).toContain("Provider/operator blocked: analytics_purchase");
    expect(report).not.toContain("GA4_API_SECRET=");
  });

  it("points admin dependency outages at the production database env instead of the auth surface", async () => {
    const { buildReadinessSummary } = await loadReadinessSummaryModule();
    const summary = buildReadinessSummary({
      generatedAt: "2026-06-23T00:00:00.000Z",
      domainResult,
      launchResult,
      githubCiResult: {
        ...githubCiResult,
        decision: "GITHUB CI PASS",
        conclusion: "success",
        failedJobs: [],
        blockers: [],
        remediation: [],
      },
      vercelOpsResult,
      adminSurfaceResult: {
        decision: "ADMIN SURFACE BLOCKED",
        live: {
          target: "https://www.kozbeylikonagi.com/admin/growth",
          status: 307,
          location: "/admin",
        },
        blockers: [
          "live live_payload_admin_dependency_ready: Payload admin returned controlled dependency-unavailable screen",
        ],
      },
    });

    expect(summary.nextActions.join("\n")).toContain("DATABASE_URI/PAYLOAD_SECRET");
    expect(summary.nextActions.join("\n")).toContain("npm run vercel:supabase:verify");
    expect(summary.nextActions.join("\n")).not.toContain("Protect the admin growth surface");
  });

  it("retries transient domain transport failures before reporting public release blocked", async () => {
    const { collectReadinessSummary, shouldRetryDomainReadiness } =
      await loadReadinessSummaryModule();
    let domainCalls = 0;

    expect(shouldRetryDomainReadiness(transientDomainResult)).toBe(true);

    const summary = await collectReadinessSummary({
      generatedAt: "2026-06-23T00:00:00.000Z",
      compareDnsResolvers: true,
      allowNpxFallback: true,
      domainRetryDelayMs: 0,
      evaluateDomainReadinessImpl: async (input: { compareDnsResolvers?: boolean }) => {
        expect(input.compareDnsResolvers).toBe(true);
        domainCalls += 1;
        return domainCalls === 1 ? transientDomainResult : domainResult;
      },
      collectGithubCiReadinessImpl: () => githubCiResult,
      evaluateVercelOpsReadinessImpl: (input: { allowNpxFallback?: boolean }) => {
        expect(input.allowNpxFallback).toBe(true);
        return vercelOpsResult;
      },
      evaluateAdminSurfaceReadinessImpl: () => adminSurfaceResult,
      fetchRuntimeReadinessImpl: async () => launchResult.runtimeReadiness,
      evaluateCommercialLaunchImpl: () => launchResult,
    });

    expect(domainCalls).toBe(2);
    expect(summary.domain.decision).toBe("CANONICAL DOMAIN GO");
    expect(summary.decision).toBe("PUBLIC SITE LIVE; FULL COMMERCIAL LAUNCH BLOCKED");
    expect(summary.nextActions.join("\n")).not.toContain("Restore canonical domain health");
  });
});
