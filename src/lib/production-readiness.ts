type RuntimeGate = {
  id: string;
  requiredEnv: string[];
  expected?: Record<string, RegExp>;
};

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

function gateReady(gate: RuntimeGate, env: NodeJS.ProcessEnv) {
  return gate.requiredEnv.every((key) => {
    const value = env[key];
    if (!hasMeaningfulValue(value)) return false;
    const expected = gate.expected?.[key];
    return expected ? expected.test(value || "") : true;
  });
}

export function getRuntimeReadiness(env: NodeJS.ProcessEnv = process.env) {
  const checks = runtimeGates.map((gate) => {
    const ready = gateReady(gate, env);

    return {
      id: gate.id,
      ready,
      requiredCount: gate.requiredEnv.length,
      configuredCount: ready
        ? gate.requiredEnv.length
        : gate.requiredEnv.filter((key) => hasMeaningfulValue(env[key])).length,
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
