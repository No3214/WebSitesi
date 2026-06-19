import { OFFICIAL_HMS_BOOKING_ENGINE_URL } from "@/lib/booking-engine-url";

type RuntimeGate = {
  id: string;
  requiredEnv: string[];
  expected?: Record<string, RegExp>;
  fallbackUrl?: string;
};

type RuntimeConfigurationSource = "env" | "code_fallback" | "missing" | "partial" | "invalid" | "not_applicable";

const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;

const runtimeGates: RuntimeGate[] = [
  {
    id: "canonical_domain",
    requiredEnv: ["NEXT_PUBLIC_SITE_URL"],
    expected: {
      NEXT_PUBLIC_SITE_URL: /^https:\/\/(www\.)?kozbeylikonagi\.com$/,
    },
  },
  {
    id: "production_abuse_controls",
    requiredEnv: [
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      "TURNSTILE_SECRET_KEY",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ],
  },
  {
    id: "hms_booking_engine",
    requiredEnv: ["NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"],
    fallbackUrl: OFFICIAL_HMS_BOOKING_ENGINE_URL,
    expected: {
      NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL: /^https:\/\//,
    },
  },
  {
    id: "garanti_pos",
    requiredEnv: [
      "GARANTI_POS_MODE",
      "GARANTI_MERCHANT_ID",
      "GARANTI_TERMINAL_ID",
      "GARANTI_PROVISION_USER",
      "GARANTI_3D_STORE_KEY",
    ],
  },
  {
    id: "analytics_purchase",
    requiredEnv: [
      "NEXT_PUBLIC_GTM_ID",
      "NEXT_PUBLIC_META_PIXEL_ID",
      "GA4_MEASUREMENT_ID",
      "GA4_API_SECRET",
    ],
  },
  {
    id: "search_local_seo",
    requiredEnv: ["GOOGLE_SITE_VERIFICATION"],
  },
];

function hasMeaningfulValue(value: string | undefined) {
  return Boolean(value && value.trim() && !placeholderPattern.test(value));
}

function hasExplicitValue(value: string | undefined) {
  return Boolean(value && value.trim());
}

function hasValidFallback(gate: RuntimeGate) {
  return Boolean(gate.fallbackUrl && /^https:\/\//.test(gate.fallbackUrl));
}

function evaluateGate(gate: RuntimeGate, env: NodeJS.ProcessEnv) {
  const explicitValues = gate.requiredEnv.filter((key) => hasExplicitValue(env[key]));
  const meaningfulValues = gate.requiredEnv.filter((key) => hasMeaningfulValue(env[key]));
  const placeholderCount = explicitValues.length - meaningfulValues.length;
  const invalidCount = meaningfulValues.filter((key) => {
    const expected = gate.expected?.[key];
    return expected ? !expected.test(env[key] || "") : false;
  }).length;
  const missingCount = gate.requiredEnv.length - explicitValues.length;
  const fallbackApplied = missingCount > 0 && explicitValues.length === 0 && hasValidFallback(gate);
  const ready =
    gate.requiredEnv.length === 0 ||
    fallbackApplied ||
    (missingCount === 0 && placeholderCount === 0 && invalidCount === 0);

  let configurationSource: RuntimeConfigurationSource = "missing";
  if (gate.requiredEnv.length === 0) {
    configurationSource = "not_applicable";
  } else if (fallbackApplied) {
    configurationSource = "code_fallback";
  } else if (ready) {
    configurationSource = "env";
  } else if (invalidCount > 0 || placeholderCount > 0) {
    configurationSource = "invalid";
  } else if (meaningfulValues.length > 0) {
    configurationSource = "partial";
  }

  return {
    ready,
    requiredCount: gate.requiredEnv.length,
    configuredCount: fallbackApplied ? gate.requiredEnv.length : meaningfulValues.length,
    missingCount: fallbackApplied ? 0 : missingCount,
    invalidCount,
    placeholderCount,
    fallbackApplied,
    configurationSource,
  };
}

export function getRuntimeReadiness(env: NodeJS.ProcessEnv = process.env) {
  const checks = runtimeGates.map((gate) => {
    const evaluation = evaluateGate(gate, env);

    return {
      id: gate.id,
      ...evaluation,
    };
  });
  const blockedGates = checks.filter((check) => !check.ready).map((check) => check.id);

  return {
    status: blockedGates.length === 0 ? "ready" : "blocked",
    ready: blockedGates.length === 0,
    blockedGates,
    configuredGates: checks.filter((check) => check.ready).map((check) => check.id),
    checks,
  };
}
