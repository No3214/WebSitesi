import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const BASE_COMMERCIAL_SCORE = 82;

export const commercialLaunchGates = [
  {
    id: "canonical_domain",
    points: 2,
    label: "Canonical kozbeylikonagi.com domains serve current Vercel production health",
    env: ["NEXT_PUBLIC_SITE_URL"],
    expectedEnv: {
      NEXT_PUBLIC_SITE_URL: {
        pattern: "^https://(www\\.)?kozbeylikonagi\\.com$",
        label: "https://kozbeylikonagi.com or https://www.kozbeylikonagi.com",
      },
    },
    evidence: ["docs/evidence/canonical-domain.md"],
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
  },
  {
    id: "hms_booking_engine",
    points: 4,
    label: "HMS booking engine live URL and booking UAT evidence",
    env: ["NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL"],
    evidence: ["docs/evidence/hms-booking-engine.md"],
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
  },
  {
    id: "analytics_purchase",
    points: 3,
    label: "GTM/GA4/Meta production IDs and purchase validation evidence",
    env: [
      "NEXT_PUBLIC_GTM_ID",
      "NEXT_PUBLIC_META_PIXEL_ID",
      "GA4_MEASUREMENT_ID",
      "GA4_API_SECRET",
    ],
    evidence: ["docs/evidence/analytics-purchase.md"],
  },
  {
    id: "search_local_seo",
    points: 2,
    label: "Search Console, GBP and Hotel Center verification evidence",
    env: ["GOOGLE_SITE_VERIFICATION"],
    evidence: ["docs/evidence/search-local-seo.md"],
  },
  {
    id: "legal_dpa",
    points: 2,
    label: "Vendor DPA and legal approval evidence",
    env: [],
    evidence: ["docs/evidence/legal-dpa.md"],
  },
];

const envFiles = [".env.production.local", ".env.production", ".env.local", ".env"];
const placeholderPattern = /(replace_with|changeme|change-me|dummy|example|todo|tbd|test_only)/i;

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

function envIssues(gate, env) {
  return gate.env.flatMap((key) => {
    const value = env[key];
    if (!hasMeaningfulValue(value)) return [key];

    const expected = gate.expectedEnv?.[key];
    if (expected && !new RegExp(expected.pattern).test(value)) {
      return [`${key} (expected ${expected.label})`];
    }

    return [];
  });
}

function evidenceState(relPath, baseDir) {
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

  return { path: relPath, ready: true, reason: "present" };
}

export function evaluateCommercialLaunch({ env = loadEnvSnapshot(), baseDir = root } = {}) {
  const gateResults = commercialLaunchGates.map((gate) => {
    const missingEnv = envIssues(gate, env);
    const evidence = gate.evidence.map((file) => evidenceState(file, baseDir));
    const missingEvidence = evidence.filter((item) => !item.ready);
    const ready = missingEnv.length === 0 && missingEvidence.length === 0;

    return {
      ...gate,
      ready,
      awardedPoints: ready ? gate.points : 0,
      missingEnv,
      missingEvidence,
    };
  });

  const score = BASE_COMMERCIAL_SCORE + gateResults.reduce((total, gate) => total + gate.awardedPoints, 0);

  return {
    baseScore: BASE_COMMERCIAL_SCORE,
    score,
    target: 100,
    decision: score >= 100 ? "FULL COMMERCIAL GO" : "NO-GO for full booking/payment launch",
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
    if (gate.missingEnv.length > 0) {
      lines.push(`  missing env: ${gate.missingEnv.join(", ")}`);
    }
    if (gate.missingEvidence.length > 0) {
      lines.push(
        `  missing evidence: ${gate.missingEvidence
          .map((item) => `${item.path} (${item.reason})`)
          .join(", ")}`,
      );
    }
  }

  return lines.join("\n");
}

function main() {
  const strict = process.argv.includes("--strict");
  const json = process.argv.includes("--json");
  const result = evaluateCommercialLaunch();
  console.log(json ? JSON.stringify(result, null, 2) : formatCommercialLaunchReport(result));
  process.exit(strict && result.score < result.target ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
