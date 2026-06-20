import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const root = process.cwd();

type VercelEnvModule = {
  parseVercelEnvList: (output: string) => Array<{ name: string; environments: string[] }>;
  evaluateVercelEnvReadiness: (args?: {
    output?: string;
    available?: boolean;
    candidate?: string;
    errors?: string[];
  }) => {
    decision: string;
    scope: string;
    valueValidation: string;
    productionEnvNames: string[];
    configuredProductionCount: number;
    blockers: string[];
    warnings: string[];
    gateResults: Array<{
      id: string;
      ready: boolean;
      namesReady: boolean;
      configuredEnv: string[];
      fallbackEnv: string[];
      missingEnv: string[];
      missingAnyOf: Array<{ label: string; keys: string[] }>;
      valueValidationKeys: string[];
      valueValidationStatus: string;
      valueValidationCommand: string;
    }>;
  };
};

type AuditModule = {
  commercialLaunchGates: Array<{
    env: string[];
    envAnyOf?: Array<{ keys: string[]; label: string }>;
    fallbackUrl?: string;
  }>;
};

async function loadEnvModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/vercel-env-readiness.mjs")).href
  )) as VercelEnvModule;
}

async function loadAuditModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/commercial-launch-audit.mjs")).href
  )) as AuditModule;
}

function makeEnvList(keys: string[]) {
  return [
    " name                                       value               environments                created",
    ...keys.map((key) => ` ${key.padEnd(42)} Encrypted           Production                  1m ago`),
    "",
    "Vercel CLI 54.14.2 (Node.js 24.15.0)",
  ].join("\n");
}

describe("Vercel production env readiness", () => {
  it("parses only env names and environments from vercel env ls output", async () => {
    const mod = await loadEnvModule();
    const rows = mod.parseVercelEnvList(
      [
        " name                                       value               environments                created",
        " NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL         Encrypted           Preview, Production         3d ago",
        " GA4_API_SECRET                             Encrypted           Production                  1d ago",
        "Common next commands:",
        "- `vercel env add`",
      ].join("\n"),
    );

    expect(rows).toEqual([
      {
        name: "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL",
        environments: ["Preview", "Production"],
      },
      {
        name: "GA4_API_SECRET",
        environments: ["Production"],
      },
    ]);
  });

  it("reports the current Vercel production env gaps without leaking values", async () => {
    const mod = await loadEnvModule();
    const result = mod.evaluateVercelEnvReadiness({
      candidate: "fixture",
      output: makeEnvList([
        "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL",
        "HOTELRUNNER_WEBHOOK_SECRET",
        "NEXT_PUBLIC_SITE_URL",
        "DATABASE_URI",
        "NEXT_PUBLIC_WHATSAPP_URL",
        "PAYLOAD_SECRET",
      ]),
    });

    expect(result.decision).toBe("VERCEL PRODUCTION ENV INCOMPLETE");
    expect(result.scope).toBe("vercel-production-env-names-only");
    expect(result.valueValidation).toBe("not_performed");
    expect(result.productionEnvNames).toContain("NEXT_PUBLIC_SITE_URL");
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "canonical_domain: NEXT_PUBLIC_SITE_URL present by name only; Vercel hides values",
        ),
        expect.stringContaining(
          "hms_booking_engine: NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL present by name only; Vercel hides values",
        ),
      ]),
    );
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "production_abuse_controls: NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing from Vercel Production env",
        "garanti_pos: GARANTI_3D_STORE_KEY is missing from Vercel Production env",
        "analytics_purchase: GA4_API_SECRET is missing from Vercel Production env",
        "search_local_seo: GOOGLE_SITE_VERIFICATION is missing from Vercel Production env",
      ]),
    );

    const hmsGate = result.gateResults.find((gate) => gate.id === "hms_booking_engine");
    expect(hmsGate?.namesReady).toBe(true);
    expect(hmsGate?.ready).toBe(false);
    expect(hmsGate?.configuredEnv).toEqual(["NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"]);
    expect(hmsGate).toMatchObject({
      valueValidationKeys: ["NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"],
      valueValidationStatus: "required_not_performed",
      valueValidationCommand: "npm run hms:verify:strict",
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("Encrypted");
    expect(serialized).not.toContain("secret-value");
  });

  it("accepts the approved HMS fallback when the Vercel env override is absent", async () => {
    const mod = await loadEnvModule();
    const result = mod.evaluateVercelEnvReadiness({
      output: makeEnvList(["NEXT_PUBLIC_SITE_URL"]),
    });
    const hmsGate = result.gateResults.find((gate) => gate.id === "hms_booking_engine");

    expect(hmsGate?.ready).toBe(true);
    expect(hmsGate?.namesReady).toBe(true);
    expect(hmsGate?.fallbackEnv).toEqual(["NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"]);
    expect(hmsGate?.valueValidationStatus).toBe("not_required");
    expect(result.blockers).not.toContain(
      "hms_booking_engine: NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL is missing from Vercel Production env",
    );
  });

  it("reports names-only pass with warnings when every commercial env name exists but values are hidden", async () => {
    const mod = await loadEnvModule();
    const audit = await loadAuditModule();
    const keys = [
      ...new Set(
        audit.commercialLaunchGates.flatMap((gate) => [
          ...gate.env,
          ...(gate.envAnyOf ?? []).map((group) => group.keys[0]),
        ]),
      ),
    ];

    const result = mod.evaluateVercelEnvReadiness({
      output: makeEnvList(keys),
    });

    expect(result.decision).toBe("VERCEL PRODUCTION ENV NAMES PASS - VALUE VALIDATION REQUIRED");
    expect(result.blockers).toEqual([]);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("canonical_domain: NEXT_PUBLIC_SITE_URL present by name only"),
        expect.stringContaining("analytics_purchase:"),
      ]),
    );
    expect(result.gateResults.every((gate) => gate.namesReady)).toBe(true);
    expect(result.gateResults.some((gate) => !gate.ready)).toBe(true);
  });

  it("does not fail non-strict inventory when CLI output is unavailable", async () => {
    const mod = await loadEnvModule();
    const result = mod.evaluateVercelEnvReadiness({
      available: false,
      errors: ["vercel.cmd: not found"],
    });

    expect(result.decision).toBe("VERCEL ENV INVENTORY UNAVAILABLE");
    expect(result.blockers[0]).toContain("npm i -g vercel");
    expect(result.warnings).toEqual([]);
    expect(result.gateResults).toEqual([]);
  });
});
