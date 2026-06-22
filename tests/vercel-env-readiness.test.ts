import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const root = process.cwd();

type VercelEnvModule = {
  parseVercelEnvList: (output: string) => Array<{ name: string; environments: string[] }>;
  parseVercelEnvFile: (source: string) => Record<string, string>;
  evaluateVercelEnvReadiness: (args?: {
    output?: string;
    available?: boolean;
    candidate?: string;
    errors?: string[];
    valueEnv?: Record<string, string>;
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
      valueValidationIssues: string[];
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

  it("parses pulled Vercel env files without requiring callers to print secret values", async () => {
    const mod = await loadEnvModule();
    const env = mod.parseVercelEnvFile(
      [
        "DATABASE_URI='postgresql://postgres:secret@db.supabase.co:6543/postgres'",
        'PAYLOAD_SECRET="payload-secret-value"',
        "NEXT_PUBLIC_SITE_URL=https://www.kozbeylikonagi.com",
      ].join("\n"),
    );

    expect(env).toMatchObject({
      DATABASE_URI: "postgresql://postgres:secret@db.supabase.co:6543/postgres",
      PAYLOAD_SECRET: "payload-secret-value",
      NEXT_PUBLIC_SITE_URL: "https://www.kozbeylikonagi.com",
    });
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
    expect(result.gateResults.find((gate) => gate.id === "production_database")).toMatchObject({
      namesReady: true,
      ready: false,
      configuredEnv: ["DATABASE_URI", "PAYLOAD_SECRET"],
      valueValidationKeys: ["DATABASE_URI"],
      valueValidationCommand: "npm run supabase:verify:strict",
    });
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

  it("blocks empty or invalid pulled production env values even when Vercel env names exist", async () => {
    const mod = await loadEnvModule();
    const result = mod.evaluateVercelEnvReadiness({
      candidate: "fixture",
      output: makeEnvList([
        "NEXT_PUBLIC_SITE_URL",
        "DATABASE_URI",
        "PAYLOAD_SECRET",
        "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL",
      ]),
      valueEnv: {
        NEXT_PUBLIC_SITE_URL: "https://www.kozbeylikonagi.com",
        DATABASE_URI: "",
        PAYLOAD_SECRET: "",
        NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL: "https://kozbeyli-konagi.hmshotel.net/bv3/search",
      },
    });

    const databaseGate = result.gateResults.find((gate) => gate.id === "production_database");
    expect(result.decision).toBe("VERCEL PRODUCTION ENV INCOMPLETE");
    expect(result.scope).toBe("vercel-production-env-names-and-pulled-values");
    expect(result.valueValidation).toBe("performed_without_value_output");
    expect(databaseGate).toMatchObject({
      namesReady: true,
      ready: false,
      valueValidationStatus: "performed_failed",
    });
    expect(databaseGate?.valueValidationIssues).toEqual(
      expect.arrayContaining([
        "DATABASE_URI is empty, placeholder or unavailable in the pulled Vercel Production env snapshot",
        "PAYLOAD_SECRET is empty, placeholder or unavailable in the pulled Vercel Production env snapshot",
      ]),
    );
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "production_database: DATABASE_URI is empty, placeholder or unavailable in the pulled Vercel Production env snapshot",
        "production_database: PAYLOAD_SECRET is empty, placeholder or unavailable in the pulled Vercel Production env snapshot",
      ]),
    );

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("payload-secret-value");
    expect(serialized).not.toContain("postgres:secret");
  });

  it("passes value validation only when pulled production env values are non-empty and valid", async () => {
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
    const valueEnv = Object.fromEntries(
      keys.map((key) => [
        key,
        key === "DATABASE_URI"
          ? "postgresql://postgres:secret@db.supabase.co:6543/postgres"
          : key === "NEXT_PUBLIC_SITE_URL"
            ? "https://www.kozbeylikonagi.com"
            : key === "NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"
              ? "https://kozbeyli-konagi.hmshotel.net/bv3/search"
              : key === "NEXT_PUBLIC_GTM_ID"
                ? "GTM-KCG6B4MJ"
                : key === "NEXT_PUBLIC_GA4_MEASUREMENT_ID" || key === "GA4_MEASUREMENT_ID"
                  ? "G-V3R66C3MEF"
                  : key === "NEXT_PUBLIC_GOOGLE_ADS_ID"
                    ? "AW-800024713"
                    : `live-${key.toLowerCase()}`,
      ]),
    );

    const result = mod.evaluateVercelEnvReadiness({
      output: makeEnvList(keys),
      valueEnv,
    });

    expect(result.decision).toBe("VERCEL PRODUCTION ENV PASS");
    expect(result.blockers).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.gateResults.every((gate) => gate.ready)).toBe(true);
    expect(JSON.stringify(result)).not.toContain("postgres:secret");
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
