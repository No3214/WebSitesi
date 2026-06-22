import {
  OFFICIAL_HMS_BOOKING_ENGINE_HOST,
  OFFICIAL_HMS_BOOKING_ENGINE_URL,
} from "@/lib/booking-engine-url";

type RuntimeGate = {
  id: string;
  requiredEnv: string[];
  requiredAnyEnv?: Array<{ keys: string[] }>;
  expected?: Record<string, RegExp>;
  fallbackUrl?: string;
};

type RuntimeConfigurationSource = "env" | "code_fallback" | "missing" | "partial" | "invalid" | "not_applicable";

const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;
const officialHmsBookingEnginePattern = new RegExp(
  `^https://${OFFICIAL_HMS_BOOKING_ENGINE_HOST.replace(/\./g, "\\.")}(?:/|\\?|$)`,
);

const runtimeGates: RuntimeGate[] = [
  {
    id: "canonical_domain",
    requiredEnv: ["NEXT_PUBLIC_SITE_URL"],
    expected: {
      NEXT_PUBLIC_SITE_URL: /^https:\/\/(www\.)?kozbeylikonagi\.com$/,
    },
  },
  {
    id: "production_database",
    requiredEnv: ["DATABASE_URI", "PAYLOAD_SECRET"],
    expected: {
      DATABASE_URI: /^postgres(?:ql)?:\/\/(?!(?:[^@/]+@)?(?:localhost|127(?:\.\d{1,3}){3}|\[?::1\]?)(?::|\/|$)).+/i,
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
      NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL: officialHmsBookingEnginePattern,
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
      "NEXT_PUBLIC_META_PIXEL_ID",
      "NEXT_PUBLIC_GOOGLE_ADS_ID",
      "GA4_MEASUREMENT_ID",
      "GA4_API_SECRET",
    ],
    requiredAnyEnv: [
      { keys: ["NEXT_PUBLIC_GTM_ID", "NEXT_PUBLIC_GA4_MEASUREMENT_ID"] },
    ],
    expected: {
      NEXT_PUBLIC_GTM_ID: /^GTM-[A-Z0-9]+$/,
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: /^G-[A-Z0-9]+$/,
      NEXT_PUBLIC_GOOGLE_ADS_ID: /^AW-\d{5,20}$/,
    },
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
  let anyExplicitCount = 0;
  let anyMeaningfulCount = 0;
  let anyPlaceholderCount = 0;
  let anyInvalidCount = 0;

  for (const group of gate.requiredAnyEnv ?? []) {
    const states = group.keys.map((key) => {
      const explicit = hasExplicitValue(env[key]);
      const meaningful = hasMeaningfulValue(env[key]);
      const expected = gate.expected?.[key];
      const valid = meaningful && (!expected || expected.test(env[key] || ""));
      return { explicit, meaningful, valid };
    });

    if (states.some((state) => state.valid)) {
      anyExplicitCount += 1;
      anyMeaningfulCount += 1;
      continue;
    }

    if (states.some((state) => state.explicit)) {
      anyExplicitCount += 1;
      if (states.some((state) => state.meaningful)) anyMeaningfulCount += 1;
      if (states.some((state) => state.explicit && !state.meaningful)) anyPlaceholderCount += 1;
      else anyInvalidCount += 1;
    }
  }

  const requiredCount = gate.requiredEnv.length + (gate.requiredAnyEnv?.length ?? 0);
  const totalExplicitCount = explicitValues.length + anyExplicitCount;
  const totalMeaningfulCount = meaningfulValues.length + anyMeaningfulCount;
  const totalPlaceholderCount = placeholderCount + anyPlaceholderCount;
  const totalInvalidCount = invalidCount + anyInvalidCount;
  const missingCount = requiredCount - totalExplicitCount;
  const fallbackApplied = missingCount > 0 && totalExplicitCount === 0 && hasValidFallback(gate);
  const ready =
    requiredCount === 0 ||
    fallbackApplied ||
    (missingCount === 0 && totalPlaceholderCount === 0 && totalInvalidCount === 0);

  let configurationSource: RuntimeConfigurationSource = "missing";
  if (gate.requiredEnv.length === 0) {
    configurationSource = "not_applicable";
  } else if (fallbackApplied) {
    configurationSource = "code_fallback";
  } else if (ready) {
    configurationSource = "env";
  } else if (totalInvalidCount > 0 || totalPlaceholderCount > 0) {
    configurationSource = "invalid";
  } else if (totalMeaningfulCount > 0) {
    configurationSource = "partial";
  }

  return {
    ready,
    requiredCount,
    configuredCount: fallbackApplied ? requiredCount : totalMeaningfulCount,
    missingCount: fallbackApplied ? 0 : missingCount,
    invalidCount: totalInvalidCount,
    placeholderCount: totalPlaceholderCount,
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
