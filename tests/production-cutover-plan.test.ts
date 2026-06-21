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
      missingEvidence: Array<{ path: string; ready: boolean; reason: string }>;
    }>;
  };
};

type CutoverModule = {
  buildProductionCutoverPlan: (args?: {
    launchResult?: ReturnType<CommercialLaunchModule["evaluateCommercialLaunch"]>;
    vercelOpsResult?: {
      decision: string;
      warnings: Array<{ id: string; detail: string; remediation?: string }>;
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
    expect(plan.currentScore).toBe(82);
    expect(plan.blockedPoints).toBe(18);
    expect(plan.vercelCliInstallCommand).toBe("npm i -g vercel");
    expect(plan.nextGateOrder).toEqual([
      "canonical_domain",
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
      "Remove any HTTPS-to-HTTP first-hop redirect on canonical or brand origins before marking the domain gate ready.",
    );
    expect(canonical?.diagnostics).toContain(
      "If domain:verify reports legacy Joomla/Seagull template or legacy HotelRunner hosted landing surface, the canonical domain is still routed to the old host even if Vercel shows an alias.",
    );
    expect(canonical?.diagnostics).toContain(
      "Treat NS/MX DNS PASS separately from web serving readiness; mail/nameserver success does not clear a legacy host surface.",
    );
    expect(canonical?.diagnostics).toContain(
      "Registrar ownership is not the same as live DNS authority. If nameservers are Cloudflare, edit Cloudflare DNS records; Isimtescil DNS-zone records will not affect traffic until nameservers move to Isimtescil/Natro.",
    );
    expect(canonical?.diagnostics).toContain(
      "The .com and .com.tr domains can be delegated to different DNS zones or nameserver pairs; verify and edit each authoritative zone separately before assuming a single DNS panel controls both.",
    );
    expect(canonical?.diagnostics).toContain(
      "Vercel DNS uses A records for apex hosts and CNAME records for www/subdomains; re-run vercel domains inspect or check Project Settings before editing DNS because Vercel can return project-specific values.",
    );
    expect(canonical?.diagnostics).toContain(
      "If Cloudflare proxy is enabled, public DNS lookups can show Cloudflare anycast IPs instead of the Vercel target; the final proof is /api/health plus the opening hero video on the public origin.",
    );
    expect(canonical?.diagnostics).toContain(
      "The active Turkish ccTLD brand origins are part of the public launch gate; they must serve the current app or securely redirect to the chosen canonical app without stale menu/legacy content.",
    );
    expect(canonical?.checklist).toContain(
      "Attach the canonical and Turkish ccTLD brand domains to the kozbeyli-konagi Vercel project, or explicitly redirect the brand domains to the chosen canonical origin.",
    );
    expect(canonical?.checklist).toContain(
      "Confirm active nameservers before editing DNS; make changes at the authoritative DNS provider, not just the registrar panel.",
    );
    expect(canonical?.checklist).toContain(
      "Check the canonical .com and Turkish ccTLD .com.tr zones independently; do not assume both domains use the same Cloudflare zone or nameserver pair.",
    );
    expect(canonical?.checklist).toContain(
      "For first verification on Cloudflare, use DNS-only records or rerun npm run domain:verify:strict after enabling proxy to prove the proxied origin still serves the current app.",
    );
    expect(canonical?.checklist).toContain(
      "If choosing Isimtescil DNS instead of Cloudflare, first change nameservers and copy existing MX/TXT/SPF/DKIM/DMARC records before adding the Vercel apex A and subdomain CNAME records shown by vercel domains inspect.",
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
        expect.objectContaining({
          group: "brand",
          type: "A",
          host: "kozbeylikonagi.com.tr",
          value: "76.76.21.21",
        }),
        expect.objectContaining({
          group: "brand",
          type: "CNAME",
          host: "www.kozbeylikonagi.com.tr",
          value: "cname.vercel-dns.com",
        }),
      ]),
    );
    expect(canonical?.kpiAndReviewLoop).toContain("/api/health");
    expect(canonical?.kpiAndReviewLoop).toContain("no legacy host signatures");
    expect(canonical?.kpiAndReviewLoop).toContain("Canonical and brand origins");

    const abuseControls = plan.gateSteps.find((step) => step.id === "production_abuse_controls");
    expect(abuseControls?.commands).toEqual(
      expect.arrayContaining(["vercel login", "vercel whoami", "vercel env add TURNSTILE_SECRET_KEY production"]),
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
      "Run npm run hms:verify:strict to confirm the public target is the approved Kozbeyli HMS host, not another hotel/vendor URL.",
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
    expect(formatted).toContain("[brand] CNAME www.kozbeylikonagi.com.tr");
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
    expect(hms?.commands).toEqual(expect.arrayContaining(["vercel login", "vercel whoami"]));
    expect(hms?.commands).toContain("vercel env add NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL production");
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
    expect(plan.finalVerificationCommands).toContain("npm run vercel:env:strict");
    expect(plan.finalVerificationCommands).toContain("npm run hms:verify:strict");
    expect(plan.finalVerificationCommands).toContain("npm run launch:audit:strict");
  });
});
