import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { scanEvidenceSource } from "./evidence-redaction-scan.mjs";

const root = process.cwd();
const BASE_COMMERCIAL_SCORE = 80;
export const DEFAULT_RUNTIME_HEALTH_URL = "https://www.kozbeylikonagi.com/api/health";
const OFFICIAL_HMS_BOOKING_ENGINE_HOST = "kozbeyli-konagi\\.hmshotel\\.net";
const OFFICIAL_HMS_BOOKING_ENGINE_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";

export const commercialLaunchGates = [
  {
    id: "canonical_domain",
    points: 2,
    label: "Public .com and www domains serve current Vercel production health",
    env: ["NEXT_PUBLIC_SITE_URL"],
    expectedEnv: {
      NEXT_PUBLIC_SITE_URL: {
        pattern: "^https://(www\\.)?kozbeylikonagi\\.com$",
        label: "https://kozbeylikonagi.com or https://www.kozbeylikonagi.com",
      },
    },
    evidence: ["docs/evidence/canonical-domain.md"],
    evidenceSignals: [
      {
        label: "current health and commit proof",
        pattern: "/api/health|health endpoint|current (?:production )?deployment commit|service:\\s*[\"']kozbeyli-konagi[\"']",
      },
      {
        label: "opening hero video proof",
        pattern: "/videos/hero\\.mp4|opening hero video|approved opening video",
      },
      {
        label: "canonical DNS and redirect proof",
        pattern: "Vercel DNS|nameserver|DNS|HTTPS redirect|secure redirect",
      },
    ],
  },
  {
    id: "production_database",
    points: 2,
    label: "Payload CMS production Postgres database and secret controls",
    env: ["DATABASE_URI", "PAYLOAD_SECRET"],
    expectedEnv: {
      DATABASE_URI: {
        pattern: "^postgres(?:ql)?://(?!(?:[^@/]+@)?(?:localhost|127(?:\\.\\d{1,3}){3}|\\[?::1\\]?)(?::|/|$)).+",
        label: "production Postgres/Supabase connection string, not localhost",
      },
    },
    evidence: ["docs/evidence/production-database.md"],
    evidenceSignals: [
      {
        label: "managed Postgres or Supabase pooler proof",
        pattern: "managed Postgres|Supabase|pooler|pooling mode|DATABASE_URI",
      },
      {
        label: "Payload secret proof",
        pattern: "PAYLOAD_SECRET|Payload secret|strong secret",
      },
      {
        label: "backup or restore policy proof",
        pattern: "backup|PITR|restore",
      },
      {
        label: "restricted dashboard access proof",
        pattern: "restricted dashboard|dashboard access|MFA|operator access",
      },
      {
        label: "Payload persistence UAT proof",
        pattern: "Payload admin|lead persistence|persistence UAT|content writes",
      },
    ],
  },
  {
    id: "production_abuse_controls",
    points: 2,
    label: "Production Turnstile and shared Upstash rate-limit/replay controls",
    env: [
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      "TURNSTILE_SECRET_KEY",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ],
    evidence: ["docs/evidence/production-abuse-controls.md"],
    evidenceSignals: [
      {
        label: "production Turnstile proof",
        pattern: "Turnstile",
      },
      {
        label: "shared Upstash proof",
        pattern: "Upstash|shared rate-limit|shared replay",
      },
      {
        label: "successful human lead UAT proof",
        pattern: "successful human lead|valid human|human lead submission",
      },
      {
        label: "blocked invalid token proof",
        pattern: "blocked missing|blocked invalid|missing/invalid Turnstile",
      },
      {
        label: "production rate-limit backend proof",
        pattern: "rateLimitBackend\\(\\).*upstash|reports `?upstash`?|backend.*upstash",
      },
    ],
  },
  {
    id: "hms_booking_engine",
    points: 4,
    label: "HMS booking engine handoff and booking UAT evidence",
    env: ["NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"],
    fallbackUrl: OFFICIAL_HMS_BOOKING_ENGINE_URL,
    expectedEnv: {
      NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL: {
        pattern: `^https://${OFFICIAL_HMS_BOOKING_ENGINE_HOST}(?:/|\\?|$)`,
        label: "approved HTTPS HMS booking engine URL",
      },
    },
    evidence: ["docs/evidence/hms-booking-engine.md"],
    evidenceSignals: [
      {
        label: "approved HMS host proof",
        pattern: "kozbeyli-konagi\\.hmshotel\\.net|approved HTTPS HMS",
      },
      {
        label: "new-tab CTA proof",
        pattern: "new tab|yeni sekme|/rezervasyon|/en/rezervasyon",
      },
      {
        label: "live booking UAT proof",
        pattern: "booking UAT|live booking|date.*guest|room.*rate",
      },
      {
        label: "cancellation refund modification proof",
        pattern: "cancellation|refund|modification|cancel",
      },
      {
        label: "room or rate sync ownership proof",
        pattern: "availability sync|room/rate|rate availability|stock sync|stale stock",
      },
    ],
  },
  {
    id: "garanti_pos",
    points: 3,
    label: "Garanti Sanal POS credentials and sandbox evidence",
    env: [
      "GARANTI_POS_MODE",
      "GARANTI_MERCHANT_ID",
      "GARANTI_TERMINAL_ID",
      "GARANTI_PROVISION_USER",
      "GARANTI_3D_STORE_KEY",
    ],
    evidence: ["docs/evidence/garanti-pos.md"],
    evidenceSignals: [
      {
        label: "POS environment proof",
        pattern: "GARANTI_POS_MODE|GARANTI_MERCHANT_ID|GARANTI_TERMINAL_ID|GARANTI_PROVISION_USER|GARANTI_3D_STORE_KEY",
      },
      {
        label: "successful 3DS payment proof",
        pattern: "successful 3D Secure|successful 3DS|successful.*payment",
      },
      {
        label: "failed payment proof",
        pattern: "failed payment|declined payment|failed/declined",
      },
      {
        label: "callback verification proof",
        pattern: "callback|webhook|signature",
      },
      {
        label: "refund or cancel proof",
        pattern: "refund|cancel",
      },
    ],
  },
  {
    id: "analytics_purchase",
    points: 3,
    label: "GTM/GA4/Meta production IDs and purchase validation evidence",
    env: [
      "NEXT_PUBLIC_META_PIXEL_ID",
      "NEXT_PUBLIC_GOOGLE_ADS_ID",
      "GA4_MEASUREMENT_ID",
      "GA4_API_SECRET",
    ],
    envAnyOf: [
      {
        keys: ["NEXT_PUBLIC_GTM_ID", "NEXT_PUBLIC_GA4_MEASUREMENT_ID"],
        label: "GTM container or direct public GA4 tag",
      },
    ],
    expectedEnv: {
      NEXT_PUBLIC_GTM_ID: {
        pattern: "^GTM-[A-Z0-9]+$",
        label: "GTM-XXXX",
      },
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: {
        pattern: "^G-[A-Z0-9]+$",
        label: "G-XXXX",
      },
      NEXT_PUBLIC_GOOGLE_ADS_ID: {
        pattern: "^AW-\\d{5,20}$",
        label: "AW-XXXXXXXXX",
      },
    },
    evidence: ["docs/evidence/analytics-purchase.md"],
    evidenceSignals: [
      {
        label: "production analytics ID proof",
        pattern: "GTM|GA4|Google Ads|Meta Pixel|production ID",
      },
      {
        label: "consent behavior proof",
        pattern: "consent mode|consent-gated|consent behavior|before.*consent",
      },
      {
        label: "server-side purchase event proof",
        pattern: "Measurement Protocol|purchase|booking_complete|server-side",
      },
      {
        label: "Meta Event Manager proof",
        pattern: "Meta Event Manager|Events Manager|Meta.*event",
      },
      {
        label: "test traffic handling proof",
        pattern: "test traffic|filtered|labeled",
      },
    ],
  },
  {
    id: "search_local_seo",
    points: 2,
    label: "Search Console, GBP and Hotel Center verification evidence",
    env: ["GOOGLE_SITE_VERIFICATION"],
    evidence: ["docs/evidence/search-local-seo.md"],
    evidenceSignals: [
      {
        label: "Search Console ownership proof",
        pattern: "Search Console|GOOGLE_SITE_VERIFICATION",
      },
      {
        label: "sitemap submission proof",
        pattern: "sitemap.*submitted|submitted.*sitemap|sitemap.*accepted",
      },
      {
        label: "Google Business Profile proof",
        pattern: "Google Business Profile|GBP",
      },
      {
        label: "Hotel Center or booking links proof",
        pattern: "Hotel Center|free booking links|hotel distribution",
      },
    ],
  },
  {
    id: "legal_dpa",
    points: 2,
    label: "Vendor DPA and legal approval evidence",
    env: [],
    evidence: ["docs/evidence/legal-dpa.md"],
    evidenceSignals: [
      {
        label: "vendor DPA review proof",
        pattern: "Vendor DPA|data-processing|DPA",
      },
      {
        label: "KVKK transfer review proof",
        pattern: "KVKK|cross-border|transfer|yurtdisi",
      },
      {
        label: "cookie vendor inventory proof",
        pattern: "Cookie|tracking vendor|vendor inventory|consent",
      },
      {
        label: "commercial terms approval proof",
        pattern: "Cancellation|payment|refund|event proposal|terms",
      },
      {
        label: "final approval owner proof",
        pattern: "Final approval|approval owner|owner and date",
      },
    ],
  },
];

const envFiles = [".env.production.local", ".env.production", ".env.local", ".env"];
const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;
const requiredReadySections = ["## Summary", "## Proof", "## Residual Risk"];
const maxReadyEvidenceAgeDays = 45;
const blockedEvidenceFieldPattern = /^(<.*>|replace_with.*|todo|tbd|none|pending|draft)$/i;
const sourceRefIdPattern = /^(?:[A-Z][A-Z0-9]{1,24}-[A-Z0-9][A-Z0-9_-]{1,40}|[A-Z]{2,16}:[A-Z0-9][A-Z0-9_-]{1,40})$/;
const unsafeSourceRefPatterns = [
  /https?:\/\//i,
  /\b[A-Z]:[\\/]/i,
  /\.(?:png|jpe?g|webp|gif|pdf|docx?|xlsx?|csv|sql|log|har|zip)\b/i,
  /\b(?:screenshot|screen\s*shot|ekran\s*g[oö]r[uü]nt[uü]s[uü]|raw\s*log|contract|s[oö]zle[sş]me|invoice|fatura|iban|card|kart|credential|secret|token|password|parola)\b/i,
];

function parseEnvFile(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const rawValue = line.slice(index + 1).trim();
        const value = rawValue.replace(/^["']|["']$/g, "");
        return [key, value];
      }),
  );
}

export function loadEnvSnapshot(baseDir = root) {
  const snapshot = { ...process.env };

  for (const file of envFiles) {
    const fullPath = path.join(baseDir, file);
    if (!fs.existsSync(fullPath)) continue;
    const parsed = parseEnvFile(fs.readFileSync(fullPath, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (!snapshot[key]) snapshot[key] = value;
    }
  }

  return snapshot;
}

function hasMeaningfulValue(value) {
  return Boolean(value && value.trim() && !placeholderPattern.test(value));
}

function hasExplicitValue(value) {
  return Boolean(value && value.trim());
}

function hasValidFallbackUrl(gate) {
  return Boolean(gate.fallbackUrl && /^https:\/\//.test(gate.fallbackUrl));
}

function sourceRefsIssue(rawValue) {
  const value = rawValue.trim();
  if (blockedEvidenceFieldPattern.test(value)) return "missing source refs";

  if (unsafeSourceRefPatterns.some((pattern) => pattern.test(value))) {
    return "unsafe source refs";
  }

  const refs = value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  if (refs.length === 0) return "missing source refs";
  if (refs.some((ref) => !sourceRefIdPattern.test(ref))) {
    return "unsafe source refs";
  }

  return "";
}

function dateOnlyUtc(value) {
  if (value instanceof Date) {
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return Number.NaN;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const parsed = new Date(time);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return Number.NaN;
  }

  return time;
}

function evidenceDateIssue(rawDate, currentDate = new Date()) {
  const evidenceTime = dateOnlyUtc(rawDate);
  const currentTime = dateOnlyUtc(currentDate);

  if (!Number.isFinite(evidenceTime) || !Number.isFinite(currentTime)) {
    return "missing valid date";
  }

  const ageDays = Math.floor((currentTime - evidenceTime) / 86_400_000);
  if (ageDays < 0) return "future evidence date";
  if (ageDays > maxReadyEvidenceAgeDays) return "stale evidence date";

  return "";
}

function envRequirementState(gate, env) {
  const issues = [];
  let explicitCount = 0;
  let meaningfulCount = 0;
  let invalidCount = 0;
  let placeholderCount = 0;
  const requiredEnvCount = gate.env.length + (gate.envAnyOf?.length ?? 0);

  for (const key of gate.env) {
    const value = env[key];
    if (!hasExplicitValue(value)) {
      if (!hasValidFallbackUrl(gate)) issues.push(key);
      continue;
    }

    explicitCount += 1;
    if (!hasMeaningfulValue(value)) {
      placeholderCount += 1;
      issues.push(key);
      continue;
    }

    meaningfulCount += 1;

    const expected = gate.expectedEnv?.[key];
    if (expected && !new RegExp(expected.pattern).test(value)) {
      invalidCount += 1;
      issues.push(`${key} (expected ${expected.label})`);
    }
  }

  for (const group of gate.envAnyOf ?? []) {
    const states = group.keys.map((key) => {
      const value = env[key];
      const explicit = hasExplicitValue(value);
      const meaningful = hasMeaningfulValue(value);
      const expected = gate.expectedEnv?.[key];
      const valid = meaningful && (!expected || new RegExp(expected.pattern).test(value));
      return { key, explicit, meaningful, valid, expected };
    });

    const hasValidAlternative = states.some((state) => state.valid);
    if (hasValidAlternative) {
      explicitCount += 1;
      meaningfulCount += 1;
      continue;
    }

    const hasExplicitAlternative = states.some((state) => state.explicit);
    if (hasExplicitAlternative) {
      explicitCount += 1;
      if (states.some((state) => state.meaningful)) meaningfulCount += 1;
      const hasPlaceholder = states.some((state) => state.explicit && !state.meaningful);
      if (hasPlaceholder) placeholderCount += 1;
      else invalidCount += 1;
    }

    issues.push(`${group.keys.join(" or ")} (expected ${group.label})`);
  }

  const fallbackApplied = requiredEnvCount > 0 && explicitCount === 0 && hasValidFallbackUrl(gate);
  const missingEnvCount = fallbackApplied ? 0 : requiredEnvCount - explicitCount;
  const configuredEnvCount = fallbackApplied ? requiredEnvCount : meaningfulCount;
  const ready = issues.length === 0;

  let configurationSource = "missing";
  if (gate.env.length === 0) {
    configurationSource = "not_applicable";
  } else if (fallbackApplied) {
    configurationSource = "code_fallback";
  } else if (ready) {
    configurationSource = "env";
  } else if (invalidCount > 0 || placeholderCount > 0) {
    configurationSource = "invalid";
  } else if (meaningfulCount > 0) {
    configurationSource = "partial";
  }

  return {
    missingEnv: issues,
    requiredEnvCount,
    configuredEnvCount,
    missingEnvCount,
    invalidEnvCount: invalidCount,
    placeholderEnvCount: placeholderCount,
    fallbackApplied,
    configurationSource,
  };
}

function evidenceState(relPath, baseDir, gate, currentDate) {
  const fullPath = path.join(baseDir, relPath);
  if (!fs.existsSync(fullPath)) {
    return { path: relPath, ready: false, reason: "missing" };
  }

  const content = fs.readFileSync(fullPath, "utf8").trim();
  if (content.length < 80) {
    return { path: relPath, ready: false, reason: "too short" };
  }

  if (/status:\s*(pending|todo|draft)/i.test(content)) {
    return { path: relPath, ready: false, reason: "pending status" };
  }

  if (!/status:\s*ready/i.test(content)) {
    return { path: relPath, ready: false, reason: "missing ready status" };
  }

  const dateMatch = content.match(/^date:\s*(\d{4}-\d{2}-\d{2})\s*$/im);
  const dateProblem = dateMatch ? evidenceDateIssue(dateMatch[1], currentDate) : "missing valid date";
  if (dateProblem) {
    return { path: relPath, ready: false, reason: dateProblem };
  }

  const ownerMatch = content.match(/^owner:\s*(.+)$/im);
  if (!ownerMatch || blockedEvidenceFieldPattern.test(ownerMatch[1].trim())) {
    return { path: relPath, ready: false, reason: "missing owner" };
  }

  const missingSections = requiredReadySections.filter((section) => !content.includes(section));
  if (missingSections.length > 0) {
    return { path: relPath, ready: false, reason: `missing sections: ${missingSections.join(", ")}` };
  }

  const sourceRefsMatch = content.match(/^source_refs:\s*(.+)$/im);
  const sourceRefsProblem = sourceRefsMatch ? sourceRefsIssue(sourceRefsMatch[1]) : "missing source refs";
  if (sourceRefsProblem) {
    return { path: relPath, ready: false, reason: sourceRefsProblem };
  }

  const missingSignals = (gate.evidenceSignals || [])
    .filter((signal) => !new RegExp(signal.pattern, "i").test(content))
    .map((signal) => signal.label);
  if (missingSignals.length > 0) {
    return {
      path: relPath,
      ready: false,
      reason: `missing evidence signals: ${missingSignals.join(", ")}`,
      missingEvidenceSignals: missingSignals,
    };
  }

  const redactionFindings = scanEvidenceSource(content, relPath);
  if (redactionFindings.length > 0) {
    return {
      path: relPath,
      ready: false,
      reason: "redaction findings",
      redactionFindingCount: redactionFindings.length,
      redactionCategories: [...new Set(redactionFindings.map((finding) => finding.category))],
    };
  }

  return { path: relPath, ready: true, reason: "present" };
}

function formatEvidenceIssue(item) {
  const redactionSummary =
    item.redactionCategories?.length > 0
      ? `; redaction categories: ${item.redactionCategories.join(", ")}; count: ${item.redactionFindingCount}`
      : "";

  return `${item.path} (${item.reason}${redactionSummary})`;
}

function runtimeConfigurationState(gate, runtimeReadiness, runtimeSource) {
  if (!runtimeReadiness?.checks || !Array.isArray(runtimeReadiness.checks)) return undefined;

  const check = runtimeReadiness.checks.find((item) => item?.id === gate.id);
  if (!check) return undefined;

  return {
    source: runtimeSource,
    status: check.ready ? "ready" : "blocked",
    ready: Boolean(check.ready),
    configurationSource: check.configurationSource || "unknown",
    requiredCount: Number(check.requiredCount ?? 0),
    configuredCount: Number(check.configuredCount ?? 0),
    missingCount: Number(check.missingCount ?? 0),
    invalidCount: Number(check.invalidCount ?? 0),
    placeholderCount: Number(check.placeholderCount ?? 0),
    fallbackApplied: Boolean(check.fallbackApplied),
  };
}

function applyRuntimeEnvState(envState, runtimeState) {
  if (!runtimeState?.ready || envState.configurationSource === "not_applicable") return envState;

  return {
    ...envState,
    missingEnv: [],
    configuredEnvCount: Math.max(
      envState.configuredEnvCount,
      runtimeState.configuredCount,
      envState.requiredEnvCount,
    ),
    missingEnvCount: 0,
    invalidEnvCount: 0,
    placeholderEnvCount: 0,
    fallbackApplied: runtimeState.fallbackApplied,
    configurationSource: `runtime_${runtimeState.configurationSource}`,
    runtimeSatisfiedByProduction: true,
  };
}

function formatRuntimeState(state) {
  return `${state.source}: ${state.ready ? "ready" : "blocked"} (${state.configurationSource}, ${state.configuredCount}/${state.requiredCount} configured, ${state.missingCount} missing, ${state.invalidCount} invalid, ${state.placeholderCount} placeholder, fallback=${state.fallbackApplied ? "yes" : "no"})`;
}

function gateProgressNotes(gate, envState, missingEvidence, runtimeState) {
  const notes = [];

  if (envState.runtimeSatisfiedByProduction) {
    notes.push(
      `env/runtime lane: production runtime is configured via ${runtimeState.source}; local audit env snapshot is not treated as the blocker`,
    );
  } else if (envState.configurationSource === "not_applicable") {
    notes.push("env lane: not applicable for this gate");
  } else if (envState.missingEnv.length === 0) {
    notes.push(
      envState.fallbackApplied
        ? "env/fallback lane: covered by approved code fallback; source-system evidence is still required"
        : "env lane: configured for this local snapshot",
    );
  } else if (envState.configurationSource === "partial") {
    notes.push(
      `env lane: partial (${envState.configuredEnvCount}/${envState.requiredEnvCount}); missing ${envState.missingEnv.join(", ")}`,
    );
  } else if (envState.configurationSource === "invalid") {
    notes.push(`env lane: invalid or placeholder configuration for ${envState.missingEnv.join(", ")}`);
  } else if (envState.missingEnv.length > 0) {
    notes.push(`env lane: missing ${envState.missingEnv.join(", ")}`);
  }

  if (missingEvidence.length === 0) {
    notes.push("evidence lane: redacted evidence file is ready");
  } else {
    notes.push(
      `evidence lane: ${missingEvidence
        .map(formatEvidenceIssue)
        .join(", ")}`,
    );
  }

  if (runtimeState) {
    const gateReady = envState.missingEnv.length === 0 && missingEvidence.length === 0;
    notes.push(
      runtimeState.ready
        ? gateReady
          ? `runtime lane: ${runtimeState.source} agrees this gate is configured in production`
          : `runtime lane: ${runtimeState.source} reports this gate configured in production; points still require the redacted evidence file`
        : `runtime lane: ${formatRuntimeState(runtimeState)}`,
    );
  }

  if (gate.id === "canonical_domain") {
    notes.push(
      "live validation lane: use npm run domain:verify:json; .com apex and www must serve the current Vercel app, opening hero video and health endpoint",
    );
  }

  if (gate.id === "hms_booking_engine") {
    notes.push(
      "live validation lane: use npm run hms:verify:json; reachable booking handoff is not the same as completed booking UAT",
    );
  }

  if (gate.id === "analytics_purchase") {
    notes.push(
      "live validation lane: public analytics IDs can be names-present while GA4_API_SECRET and purchase evidence remain blocked",
    );
  }

  return notes;
}

export function evaluateCommercialLaunch({
  env = loadEnvSnapshot(),
  baseDir = root,
  runtimeReadiness,
  runtimeSource = "not provided",
  runtimeReadinessError,
  currentDate = new Date(),
} = {}) {
  const gateResults = commercialLaunchGates.map((gate) => {
    const localEnvState = envRequirementState(gate, env);
    const evidence = gate.evidence.map((file) => evidenceState(file, baseDir, gate, currentDate));
    const missingEvidence = evidence.filter((item) => !item.ready);
    const runtimeConfiguration = runtimeConfigurationState(gate, runtimeReadiness, runtimeSource);
    const envState = applyRuntimeEnvState(localEnvState, runtimeConfiguration);
    const ready = envState.missingEnv.length === 0 && missingEvidence.length === 0;
    const progressNotes = gateProgressNotes(gate, envState, missingEvidence, runtimeConfiguration);

    return {
      ...gate,
      ready,
      awardedPoints: ready ? gate.points : 0,
      ...envState,
      missingEvidence,
      ...(runtimeConfiguration ? { runtimeConfiguration } : {}),
      progressNotes,
    };
  });

  const score = BASE_COMMERCIAL_SCORE + gateResults.reduce((total, gate) => total + gate.awardedPoints, 0);

  return {
    baseScore: BASE_COMMERCIAL_SCORE,
    score,
    target: 100,
    decision: score >= 100 ? "FULL COMMERCIAL GO" : "NO-GO for full booking/payment launch",
    ...(runtimeReadiness
      ? {
          runtimeReadiness: {
            source: runtimeSource,
            status: runtimeReadiness.status === "ready" ? "ready" : "blocked",
            ready: Boolean(runtimeReadiness.ready),
            configuredGates: runtimeReadiness.configuredGates || [],
            blockedGates: runtimeReadiness.blockedGates || [],
          },
        }
      : {}),
    ...(runtimeReadinessError
      ? {
          runtimeReadiness: {
            source: runtimeSource,
            status: "unavailable",
            ready: false,
            error: runtimeReadinessError,
          },
        }
      : {}),
    gateResults,
  };
}

export function formatCommercialLaunchReport(result) {
  const lines = [
    "Kozbeyli Konagi commercial launch audit",
    `Current commercial launch score: ${result.score}/${result.target}`,
    `Decision: ${result.decision}`,
    "",
    "Gates:",
  ];

  for (const gate of result.gateResults) {
    const status = gate.ready ? "PASS" : "BLOCKED";
    lines.push(`${status} ${gate.id} (+${gate.awardedPoints}/${gate.points}) - ${gate.label}`);
    lines.push(
      `  env source: ${gate.configurationSource} (${gate.configuredEnvCount}/${gate.requiredEnvCount} configured, ${gate.missingEnvCount} missing, ${gate.invalidEnvCount} invalid, ${gate.placeholderEnvCount} placeholder, fallback=${gate.fallbackApplied ? "yes" : "no"})`,
    );
    if (gate.missingEnv.length > 0) {
      lines.push(`  missing env: ${gate.missingEnv.join(", ")}`);
    }
    if (gate.missingEvidence.length > 0) {
      lines.push(
        `  missing evidence: ${gate.missingEvidence
          .map(formatEvidenceIssue)
          .join(", ")}`,
      );
    }
    if (gate.runtimeConfiguration) {
      lines.push(`  runtime: ${formatRuntimeState(gate.runtimeConfiguration)}`);
    }
    if (gate.progressNotes?.length > 0) {
      for (const note of gate.progressNotes) {
        lines.push(`  progress: ${note}`);
      }
    }
  }

  return lines.join("\n");
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

export async function fetchRuntimeReadiness(healthUrl) {
  const response = await fetch(healthUrl, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  const runtimeReadiness = payload?.readiness?.runtimeConfiguration;
  if (!runtimeReadiness?.checks || !Array.isArray(runtimeReadiness.checks)) {
    throw new Error("missing readiness.runtimeConfiguration.checks");
  }

  return runtimeReadiness;
}

async function main() {
  const strict = process.argv.includes("--strict");
  const json = process.argv.includes("--json");
  const runtimeHealthUrl = argValue("--runtime-health-url") || (process.argv.includes("--live-runtime") ? DEFAULT_RUNTIME_HEALTH_URL : undefined);
  let runtimeReadiness;
  let runtimeReadinessError;

  if (runtimeHealthUrl) {
    try {
      runtimeReadiness = await fetchRuntimeReadiness(runtimeHealthUrl);
    } catch (error) {
      runtimeReadinessError = error instanceof Error ? error.message : String(error);
    }
  }

  const result = evaluateCommercialLaunch({
    ...(runtimeReadiness ? { runtimeReadiness, runtimeSource: runtimeHealthUrl } : {}),
    ...(runtimeReadinessError ? { runtimeReadinessError, runtimeSource: runtimeHealthUrl } : {}),
  });
  console.log(json ? JSON.stringify(result, null, 2) : formatCommercialLaunchReport(result));
  process.exitCode = strict && result.score < result.target ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
