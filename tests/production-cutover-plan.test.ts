import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type CommercialLaunchModule = {
  commercialLaunchGates: Array<{
    id: string;
    env: string[];
    envAnyOf?: Array<{ keys: string[]; label: string }>;
    evidence: string[];
  }>;
  evaluateCommercialLaunch: (args?: {
    env?: Record<string, string>;
    baseDir?: string;
    runtimeReadiness?: {
      status: string;
      ready: boolean;
      configuredGates: string[];
      blockedGates: string[];
      checks: Array<{
        id: string;
        ready: boolean;
        requiredCount: number;
        configuredCount: number;
        missingCount: number;
        invalidCount: number;
        placeholderCount: number;
        fallbackApplied: boolean;
        configurationSource: string;
      }>;
    };
    runtimeSource?: string;
  }) => {
    score: number;
    target: number;
    gateResults: Array<{
      id: string;
      ready: boolean;
      points: number;
      awardedPoints: number;
      label: string;
      env: string[];
      evidence: string[];
      missingEnv: string[];
      missingEvidence: Array<{
        path: string;
        ready: boolean;
        reason: string;
        redactionFindingCount?: number;
        redactionCategories?: string[];
        missingEvidenceSignals?: string[];
      }>;
    }>;
  };
};

type CutoverModule = {
  buildProductionCutoverPlan: (args?: {
    launchResult?: ReturnType<CommercialLaunchModule["evaluateCommercialLaunch"]>;
    vercelOpsResult?: {
      decision: string;
      warnings: Array<{ id: string; detail: string; remediation?: string }>;
      checks?: Array<{ id: string; status: string; detail: string; remediation?: string }>;
      failures?: Array<{ id: string; detail: string; remediation?: string }>;
    };
  }) => {
    decision: string;
    currentScore: number;
    targetScore: number;
    blockedPoints: number;
    vercelCliInstallCommand: string;
    nextGateOrder: string[];
    gateSteps: Array<{
      id: string;
      owner: string;
      timing: string;
      missingEnv: string[];
      diagnostics: string[];
      envDiagnostics: {
        source: string;
        requiredCount: number;
        configuredCount: number;
        missingCount: number;
        invalidCount: number;
        placeholderCount: number;
        fallbackApplied: boolean;
      };
      runtimeDiagnostics?: {
        source: string;
        status: string;
        ready: boolean;
        configurationSource: string;
        requiredCount: number;
        configuredCount: number;
        missingCount: number;
        invalidCount: number;
        placeholderCount: number;
        fallbackApplied: boolean;
      };
      missingEvidence: Array<{
        path: string;
        ready: boolean;
        reason: string;
        redactionFindingCount: number;
        redactionCategories: string[];
        redactionSummary: string;
        redactionAction: string;
        missingEvidenceSignals?: string[];
      }>;
      commands: string[];
      checklist: string[];
      dnsTargetNote: string;
      dnsTargetRecords: Array<{
        group: string;
        type: string;
        host: string;
        value: string;
        acceptedPattern: string;
        expectedDescription: string;
        purpose: string;
      }>;
      kpiAndReviewLoop: string;
    }>;
    finalVerificationCommands: string[];
  };
  formatProductionCutoverPlan: (plan: ReturnType<CutoverModule["buildProductionCutoverPlan"]>) => string;
};

async function loadAuditModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/commercial-launch-audit.mjs")).href
  )) as CommercialLaunchModule;
}

async function loadCutoverModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/production-cutover-plan.mjs")).href
  )) as CutoverModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "production-cutover-plan-"));
  tmpDirs.push(dir);
  return dir;
}

function evidenceProofText(relPath: string) {
  const proofByPath: Record<string, string[]> = {
    "docs/evidence/canonical-domain.md": [
      "The current production deployment commit is verified through /api/health with service: \"kozbeyli-konagi\".",
      "The approved opening hero video /videos/hero.mp4 is visible on apex and www.",
      "Vercel DNS and secure redirect behavior are verified for the canonical domain.",
    ],
    "docs/evidence/production-database.md": [
      "Managed Supabase Postgres pooler DATABASE_URI and pooling mode are verified.",
      "PAYLOAD_SECRET is stored as a strong secret in production.",
      "Backup/PITR restore policy is confirmed.",
      "Restricted dashboard MFA access is confirmed for the database operator.",
      "Payload admin and lead persistence UAT completed without repository PII.",
    ],
    "docs/evidence/production-abuse-controls.md": [
      "Cloudflare Turnstile production keys are validated.",
      "Upstash Redis REST provides shared rate-limit and shared replay checks.",
      "A successful human lead submission is recorded.",
      "A blocked missing/invalid Turnstile token request is recorded.",
      "rateLimitBackend() reports upstash in production.",
    ],
    "docs/evidence/hms-booking-engine.md": [
      "The approved HTTPS HMS host kozbeyli-konagi.hmshotel.net is used.",
      "/rezervasyon and /en/rezervasyon CTAs open in a new tab.",
      "Live booking UAT covers date, guest, room and rate selection.",
      "Cancellation, refund and modification handling is confirmed.",
      "Room/rate availability sync and stale stock ownership are documented.",
    ],
    "docs/evidence/garanti-pos.md": [
      "GARANTI_POS_MODE and required POS environment names are configured in the source system.",
      "Successful 3D Secure payment proof is referenced.",
      "Failed/declined payment proof is referenced.",
      "Callback webhook signature verification is confirmed.",
      "Refund cancel handling is documented.",
    ],
    "docs/evidence/analytics-purchase.md": [
      "Production GTM, GA4, Google Ads and Meta Pixel IDs are verified.",
      "Consent mode and consent-gated behavior are validated before consent.",
      "GA4 Measurement Protocol sends server-side purchase booking_complete proof.",
      "Meta Event Manager production event proof is referenced.",
      "Test traffic is labeled and filtered.",
    ],
    "docs/evidence/search-local-seo.md": [
      "Search Console ownership and GOOGLE_SITE_VERIFICATION are confirmed.",
      "Production sitemap submitted and accepted.",
      "Google Business Profile ownership is verified.",
      "Google Hotel Center free booking links and hotel distribution are reviewed.",
    ],
    "docs/evidence/legal-dpa.md": [
      "Vendor DPA data-processing review is approved.",
      "KVKK cross-border transfer review is complete.",
      "Cookie tracking vendor inventory and consent behavior are approved.",
      "Cancellation payment refund and event proposal terms are approved.",
      "Final approval owner and date are recorded.",
    ],
  };

  return proofByPath[relPath] ?? [
    "Redacted operational evidence confirms this launch gate was validated in the source system.",
  ];
}

function writeEvidence(baseDir: string, relPath: string) {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(
    fullPath,
    [
      "# Evidence",
      "",
      "status: ready",
      "date: 2026-06-19",
      "owner: launch-qa",
      "source_refs: OPS-1234, UAT-5678",
      "",
      "## Summary",
      "Redacted operational evidence confirms this launch gate was validated in the source system.",
      "",
      "## Proof",
      ...evidenceProofText(relPath),
      "Ticket, screenshot and UAT references are stored outside the repository without secrets or PII.",
      "",
      "## Residual Risk",
      "No unresolved residual risk remains for this redacted test fixture.",
    ].join("\n"),
  );
}

function makeReadyEnv(audit: CommercialLaunchModule) {
  return Object.fromEntries(
    audit.commercialLaunchGates.flatMap((gate) =>
      [
        ...gate.env,
        ...(gate.envAnyOf ?? []).map((group) => group.keys[0]),
      ].map((key) => [
        key,
        key === "NEXT_PUBLIC_SITE_URL"
          ? "https://kozbeylikonagi.com"
          : key === "DATABASE_URI"
            ? "postgresql://postgres:password@db.supabase.co:6543/postgres"
          : key === "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"
            ? "https://kozbeyli-konagi.hmshotel.net/bv3/search"
            : key === "NEXT_PUBLIC_GTM_ID"
              ? "GTM-ABCDE1"
              : key === "NEXT_PUBLIC_GA4_MEASUREMENT_ID" || key === "GA4_MEASUREMENT_ID"
                ? "G-ABCDE12345"
                : key === "NEXT_PUBLIC_GOOGLE_ADS_ID"
                  ? "AW-800024713"
                  : `live_${key}`,
      ]),
    ),
  );
}

function makeRuntimeReadinessFixture() {
  return {
    status: "blocked",
    ready: false,
    configuredGates: ["production_database", "hms_booking_engine"],
    blockedGates: ["production_abuse_controls"],
    checks: [
      {
        id: "production_database",
        ready: true,
        requiredCount: 2,
        configuredCount: 2,
        missingCount: 0,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
        configurationSource: "env",
      },
      {
        id: "production_abuse_controls",
        ready: false,
        requiredCount: 4,
        configuredCount: 0,
        missingCount: 4,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
        configurationSource: "missing",
      },
      {
        id: "hms_booking_engine",
        ready: true,
        requiredCount: 1,
        configuredCount: 1,
        missingCount: 0,
        invalidCount: 0,
        placeholderCount: 0,
        fallbackApplied: false,
        configurationSource: "env",
      },
    ],
  };
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("production cutover plan", () => {
  it("turns blocked commercial gates into an ordered operator checklist", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const launchResult = audit.evaluateCommercialLaunch({ env: {}, baseDir: makeTmpDir() });
    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: {
        decision: "PASS_WITH_WARNINGS",
        warnings: [
          {
            id: "global_vercel_cli",
            detail: "Global Vercel CLI is not available on PATH.",
            remediation: "npm i -g vercel unlocks vercel env pull, vercel deploy and vercel logs.",
          },
        ],
      },
    });

    expect(plan.decision).toBe("CUTOVER_ACTION_REQUIRED");
    expect(plan.currentScore).toBe(80);
    expect(plan.blockedPoints).toBe(20);
    expect(plan.vercelCliInstallCommand).toBe("npm i -g vercel");
    expect(plan.nextGateOrder).toEqual([
      "canonical_domain",
      "production_database",
      "production_abuse_controls",
      "hms_booking_engine",
      "garanti_pos",
      "analytics_purchase",
      "search_local_seo",
      "legal_dpa",
    ]);

    const canonical = plan.gateSteps.find((step) => step.id === "canonical_domain");
    expect(canonical?.owner).toBe("Vercel/DNS operator");
    expect(canonical?.missingEnv).toContain("NEXT_PUBLIC_SITE_URL");
    expect(canonical?.envDiagnostics).toMatchObject({
      source: "missing",
      requiredCount: 1,
      configuredCount: 0,
      missingCount: 1,
      fallbackApplied: false,
    });
    expect(canonical?.checklist).toContain(
      "Remove old Joomla/Seagull and HotelRunner hosted landing routing from the canonical web origin.",
    );
    expect(canonical?.checklist).toContain(
      "Remove any HTTPS-to-HTTP first-hop redirect on canonical origins before marking the domain gate ready.",
    );
    expect(canonical?.diagnostics).toContain(
      "If domain:verify reports legacy Joomla/Seagull template or legacy HotelRunner hosted landing surface, the canonical domain is still routed to the old host even if Vercel shows an alias.",
    );
    expect(canonical?.diagnostics).toContain(
      "Treat NS/MX DNS PASS separately from web serving readiness; mail/nameserver success does not clear a legacy host surface.",
    );
    expect(canonical?.diagnostics).toContain(
      "Registrar ownership is not the same as live DNS authority. Verify the active nameservers at Isimtescil and Vercel Domains before changing records; do not use an unrelated external DNS panel as the project source of truth.",
    );
    expect(canonical?.diagnostics).toContain(
      "Vercel DNS uses A records for apex hosts and CNAME records for www/subdomains; re-run vercel domains inspect or check Project Settings before editing DNS because Vercel can return project-specific values.",
    );
    expect(canonical?.diagnostics).toContain(
      "If public recursive DNS still shows an external DNS/CDN layer, treat it as resolver or delegation evidence only; the final proof is /api/health plus the opening hero video on the public origin.",
    );
    expect(canonical?.checklist).toContain(
      "Attach kozbeylikonagi.com and www.kozbeylikonagi.com to the kozbeyli-konagi Vercel project.",
    );
    expect(canonical?.checklist).toContain(
      "Confirm active nameservers before editing DNS; make changes at the authoritative DNS provider, not just the registrar panel.",
    );
    expect(canonical?.checklist).toContain(
      "For first verification, rerun npm run domain:verify:strict and prove the public origin serves the current app before marking evidence ready.",
    );
    expect(canonical?.checklist).toContain(
      "If choosing Isimtescil DNS, first change nameservers and copy existing MX/TXT/SPF/DKIM/DMARC records before adding the Vercel apex A and subdomain CNAME records shown by Vercel Project Settings.",
    );
    expect(canonical?.commands).toContain("npm run domain:verify");
    expect(canonical?.commands).toContain("npm run domain:verify:strict");
    expect(canonical?.commands).toContain("npm run launch:smoke:live");
    expect(canonical?.commands).toEqual(
      expect.arrayContaining(["npm i -g vercel", "vercel login", "vercel whoami"]),
    );
    expect(canonical?.dnsTargetNote).toContain("A records for apex domains and CNAME records for subdomains");
    expect(canonical?.dnsTargetRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: "canonical",
          type: "A",
          host: "kozbeylikonagi.com",
          value: "76.76.21.21",
          expectedDescription: "76.76.21.21",
        }),
        expect.objectContaining({
          group: "canonical",
          type: "CNAME",
          host: "www.kozbeylikonagi.com",
          value: "cname.vercel-dns.com",
          acceptedPattern: "^[a-z0-9-]+\\.vercel-dns(?:-\\d+)?\\.com$",
          expectedDescription: expect.stringContaining("project-specific Vercel CNAME"),
        }),
      ]),
    );
    expect(canonical?.kpiAndReviewLoop).toContain("/api/health");
    expect(canonical?.kpiAndReviewLoop).toContain("no legacy host signatures");
    expect(canonical?.kpiAndReviewLoop).toContain("Canonical apex and www origins");

    const database = plan.gateSteps.find((step) => step.id === "production_database");
    expect(database?.owner).toBe("Platform / CMS operator");
    expect(database?.missingEnv).toEqual(["DATABASE_URI", "PAYLOAD_SECRET"]);
    expect(database?.diagnostics).toContain(
      "The app uses @payloadcms/db-postgres; production runtime requires DATABASE_URI and PAYLOAD_SECRET.",
    );
    expect(database?.diagnostics).toContain(
      "Supabase is suitable as the managed Postgres provider when using the project pooler connection string as DATABASE_URI.",
    );
    expect(database?.checklist).toContain(
      "Use the Supabase pooled Postgres connection string, not a public anon key, as Vercel DATABASE_URI.",
    );
    expect(database?.commands).toEqual(
      expect.arrayContaining([
        "vercel env add DATABASE_URI production",
        "vercel env add PAYLOAD_SECRET production",
        "npm run vercel:supabase:verify",
      ]),
    );
    expect(database?.kpiAndReviewLoop).toContain("managed Postgres");

    const abuseControls = plan.gateSteps.find((step) => step.id === "production_abuse_controls");
    expect(abuseControls?.commands).toEqual(
      expect.arrayContaining([
        "vercel login",
        "vercel whoami",
        "vercel env add TURNSTILE_SECRET_KEY production",
        "npm run vercel:abuse:verify",
      ]),
    );

    const hms = plan.gateSteps.find((step) => step.id === "hms_booking_engine");
    expect(hms?.missingEnv).toEqual([]);
    expect(hms?.envDiagnostics).toMatchObject({
      source: "code_fallback",
      requiredCount: 1,
      configuredCount: 1,
      missingCount: 0,
      fallbackApplied: true,
    });
    expect(hms?.checklist).toContain(
      "Run npm run vercel:hms:verify to confirm the production public target is the approved Kozbeyli HMS host, not another hotel/vendor URL.",
    );
    expect(hms?.checklist).toContain(
      "Verify the public reservation CTA opens the approved HTTPS HMS engine in a new tab.",
    );
    expect(hms?.checklist).toContain(
      "Document date, guest, room/rate selection, fallback and modification/refund handling in redacted evidence.",
    );
    expect(hms?.commands).not.toContain("vercel env add NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL production");

    const formatted = cutover.formatProductionCutoverPlan(plan);
    expect(formatted).toContain("Kozbeyli Konagi production cutover plan");
    expect(formatted).toContain("Vercel CLI install: npm i -g vercel");
    expect(formatted).toContain("diagnostics:");
    expect(formatted).toContain("legacy Joomla/Seagull template");
    expect(formatted).toContain("legacy HotelRunner hosted landing surface");
    expect(formatted).toContain("env: missing");
    expect(formatted).toContain("fallback=yes");
    expect(formatted).toContain("DNS target records:");
    expect(formatted).toContain("[canonical] CNAME www.kozbeylikonagi.com");
    expect(formatted).not.toContain("www.kozbeylikonagi.com.tr");
    expect(formatted).toContain("Final verification commands:");
  });

  it("does not leak env values while building the cutover plan", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {
        NEXT_PUBLIC_SITE_URL: "https://kozbeylikonagi.com",
        GARANTI_3D_STORE_KEY: "super-secret-store-key",
        GA4_API_SECRET: "ga4-secret-value",
      },
      baseDir: makeTmpDir(),
    });

    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    const serialized = JSON.stringify(plan);
    expect(serialized).not.toContain("super-secret-store-key");
    expect(serialized).not.toContain("ga4-secret-value");
    expect(serialized).toContain("GARANTI_3D_STORE_KEY");
    expect(serialized).toContain("GA4_API_SECRET");
  });

  it("skips Vercel bootstrap commands when CLI, auth and project binding are already ready", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const launchResult = audit.evaluateCommercialLaunch({ env: {}, baseDir: makeTmpDir() });

    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: {
        decision: "PASS",
        warnings: [],
        checks: [
          { id: "global_vercel_cli", status: "pass", detail: "Vercel CLI available." },
          { id: "vercel_auth", status: "pass", detail: "Authenticated." },
          { id: "project_binding", status: "pass", detail: "Linked." },
        ],
      },
    });
    const canonical = plan.gateSteps.find((step) => step.id === "canonical_domain");
    const database = plan.gateSteps.find((step) => step.id === "production_database");
    const hms = plan.gateSteps.find((step) => step.id === "hms_booking_engine");

    for (const step of [canonical, database, hms]) {
      expect(step?.commands).not.toContain("npm i -g vercel");
      expect(step?.commands).not.toContain("vercel login");
      expect(step?.commands).not.toContain("vercel whoami");
    }
    expect(canonical?.checklist).not.toContain("Install and authenticate Vercel CLI if it is missing.");
    expect(canonical?.commands[0]).toBe("vercel env pull");
    expect(database?.commands[0]).toBe("vercel env add DATABASE_URI production");
    expect(hms?.commands[0]).toBe("npm run vercel:hms:verify");
    expect(plan.vercelCliInstallCommand).toBe("npm i -g vercel");
  });

  it("asks for HMS env repair only when an explicit override is invalid", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {
        NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL: "http://kozbeyli-invalid.invalid/search",
      },
      baseDir: makeTmpDir(),
    });

    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });
    const hms = plan.gateSteps.find((step) => step.id === "hms_booking_engine");

    expect(hms?.missingEnv).toEqual([
      "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL (expected approved HTTPS HMS booking engine URL)",
    ]);
    expect(hms?.envDiagnostics).toMatchObject({
      source: "invalid",
      configuredCount: 1,
      missingCount: 0,
      invalidCount: 1,
      fallbackApplied: false,
    });
    expect(hms?.checklist[0]).toBe(
      "Fix NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL in Vercel production so it is the approved HTTPS HMS URL, or remove the bad override to use the official code fallback.",
    );
    expect(hms?.commands).not.toContain("npm i -g vercel");
    expect(hms?.commands).not.toContain("vercel login");
    expect(hms?.commands).not.toContain("vercel whoami");
    expect(hms?.commands).toContain("vercel env add NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL production");
  });

  it("carries live runtime diagnostics separately from local env and evidence blockers", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const launchResult = audit.evaluateCommercialLaunch({
      env: {},
      baseDir: makeTmpDir(),
      runtimeReadiness: makeRuntimeReadinessFixture(),
      runtimeSource: "https://www.kozbeylikonagi.com/api/health",
    });

    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });
    const database = plan.gateSteps.find((step) => step.id === "production_database");
    const abuseControls = plan.gateSteps.find((step) => step.id === "production_abuse_controls");
    const hms = plan.gateSteps.find((step) => step.id === "hms_booking_engine");
    const legal = plan.gateSteps.find((step) => step.id === "legal_dpa");
    const formatted = cutover.formatProductionCutoverPlan(plan);

    expect(database?.runtimeDiagnostics).toMatchObject({
      source: "https://www.kozbeylikonagi.com/api/health",
      status: "ready",
      ready: true,
      configurationSource: "env",
      configuredCount: 2,
      requiredCount: 2,
    });
    expect(abuseControls?.runtimeDiagnostics).toMatchObject({
      status: "blocked",
      ready: false,
      configurationSource: "missing",
      missingCount: 4,
    });
    expect(hms?.runtimeDiagnostics).toMatchObject({
      ready: true,
      configuredCount: 1,
      requiredCount: 1,
    });
    expect(database?.commands).toContain("npm run launch:audit:live");
    expect(abuseControls?.commands).toContain("npm run launch:audit:live");
    expect(hms?.commands).toContain("npm run launch:audit:live");
    expect(legal?.commands).toContain("npm run launch:audit:live");
    expect(plan.finalVerificationCommands).toContain("npm run launch:audit:live:strict");
    expect(plan.finalVerificationCommands).not.toContain("npm run launch:audit:strict");
    expect(formatted).toContain("runtime: https://www.kozbeylikonagi.com/api/health: ready");
    expect(formatted).toContain("runtime: https://www.kozbeylikonagi.com/api/health: blocked");
    expect(formatted).toContain("npm run launch:audit:live:strict");
  });

  it("reports ready only when every commercial launch gate is proven ready", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const launchResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });

    expect(plan.decision).toBe("READY_FOR_FULL_COMMERCIAL_LAUNCH");
    expect(plan.currentScore).toBe(100);
    expect(plan.blockedPoints).toBe(0);
    expect(plan.gateSteps).toEqual([]);
    expect(plan.finalVerificationCommands).toContain("npm run vercel:env:values:strict");
    expect(plan.finalVerificationCommands).toContain("npm run vercel:supabase:verify");
    expect(plan.finalVerificationCommands).toContain("npm run vercel:abuse:verify");
    expect(plan.finalVerificationCommands).toContain("npm run vercel:hms:verify");
    expect(plan.finalVerificationCommands).toContain("npm run vercel:garanti:verify");
    expect(plan.finalVerificationCommands).toContain("npm run vercel:analytics:verify");
    expect(plan.finalVerificationCommands).toContain("npm run vercel:search:verify");
    expect(plan.finalVerificationCommands).toContain("npm run launch:audit:strict");
    expect(plan.finalVerificationCommands).not.toContain("npm run launch:audit:live:strict");
    expect(plan.finalVerificationCommands).toContain("npm run release:verify");
    expect(plan.finalVerificationCommands).toContain("npm run release:verify:commercial");
  });

  it("carries evidence redaction blockers into the cutover checklist without leaking values", async () => {
    const audit = await loadAuditModule();
    const cutover = await loadCutoverModule();
    const baseDir = makeTmpDir();
    const env = makeReadyEnv(audit);

    for (const gate of audit.commercialLaunchGates) {
      for (const evidence of gate.evidence) writeEvidence(baseDir, evidence);
    }

    const garantiPath = path.join(baseDir, "docs/evidence/garanti-pos.md");
    fs.writeFileSync(
      garantiPath,
      [
        fs.readFileSync(garantiPath, "utf8"),
        `masked regression fixture: 4242 ${"4242"} 4242 4242`,
      ].join("\n"),
    );

    const launchResult = audit.evaluateCommercialLaunch({ env, baseDir });
    const plan = cutover.buildProductionCutoverPlan({
      launchResult,
      vercelOpsResult: { decision: "PASS", warnings: [] },
    });
    const garanti = plan.gateSteps.find((step) => step.id === "garanti_pos");
    const formatted = cutover.formatProductionCutoverPlan(plan);

    expect(plan.decision).toBe("CUTOVER_ACTION_REQUIRED");
    expect(plan.nextGateOrder).toEqual(["garanti_pos"]);
    expect(garanti?.missingEvidence).toEqual([
      expect.objectContaining({
        path: "docs/evidence/garanti-pos.md",
        ready: false,
        reason: "redaction findings",
        redactionFindingCount: 1,
        redactionCategories: ["payment_card"],
        redactionSummary: "redaction categories: payment_card; count: 1",
      }),
    ]);
    expect(garanti?.missingEvidence[0]?.redactionAction).toContain("npm run evidence:scan");
    expect(garanti?.missingEvidence[0]?.redactionAction).toContain("npm run launch:audit");
    expect(garanti?.checklist).toContain(
      "Remove or redact evidence categories (payment_card) in the source system, then rerun npm run evidence:scan and npm run launch:audit before marking evidence ready.",
    );
    expect(formatted).toContain(
      "missing evidence: docs/evidence/garanti-pos.md (redaction findings; redaction categories: payment_card; count: 1)",
    );
    expect(JSON.stringify(plan)).not.toContain("4242");
    expect(formatted).not.toContain("4242");
  });
});
