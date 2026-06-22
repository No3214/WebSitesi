import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const defaultOrigin = "https://www.kozbeylikonagi.com";
const adminGrowthPath = "/admin/growth";
const adminLoginPath = "/admin";
const adminGrowthSourcePath = "src/app/admin/growth/page.tsx";

const requiredSourceSignals = [
  {
    id: "force_dynamic",
    label: "admin growth page must not be statically cached",
    pattern: /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/,
  },
  {
    id: "noindex_nofollow",
    label: "admin growth page must stay out of search indexes",
    pattern: /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/s,
  },
  {
    id: "payload_auth_headers",
    label: "Payload auth must receive request headers",
    pattern: /payload\.auth\(\{\s*headers:\s*requestHeaders\s*\}\)/,
  },
  {
    id: "admin_role_guard",
    label: "admin growth page must require the admin role",
    pattern: /authenticated\s*=\s*user\?\.role\s*===\s*["']admin["']/,
  },
  {
    id: "redirect_to_payload_admin",
    label: "unauthenticated users must be redirected to Payload admin login",
    pattern: /redirect\(["']\/admin["']\)/,
  },
];

const forbiddenSourceSignals = [
  {
    id: "boolean_user_guard",
    label: "plain authenticated user checks are insufficient for this admin panel",
    pattern: /authenticated\s*=\s*Boolean\(user\)/,
  },
  {
    id: "public_export_guard_bypass",
    label: "GrowthDashboardClient must not render before the auth redirect guard",
    pattern: /return\s+<GrowthDashboardClient\s*\/>[\s\S]*if\s*\(\s*!authenticated\s*\)/,
  },
];

const sensitiveLiveSignatures = [
  "Kozbeyli Commercial Launch Control",
  "Commercial readiness",
  "Launch SOP",
  "Gate sequence",
  "EVIDENCE_GATED",
  "docs/evidence",
  "No secrets in repo evidence",
  "Payload database proof",
];

function readIfExists(relPath, baseDir = root) {
  const fullPath = path.join(baseDir, relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function buildCheck(id, ready, detail) {
  return { id, ready, detail };
}

function normalizeOrigin(origin) {
  return String(origin || defaultOrigin).replace(/\/+$/, "");
}

function adminGrowthUrl(origin) {
  return `${normalizeOrigin(origin)}${adminGrowthPath}`;
}

function sameOriginAdminLogin(location, target) {
  if (!location) return false;

  try {
    const resolved = new URL(location, target);
    const base = new URL(target);
    return resolved.origin === base.origin && resolved.pathname === adminLoginPath;
  } catch {
    return false;
  }
}

export function evaluateAdminSurfaceSource({ baseDir = root } = {}) {
  const source = readIfExists(adminGrowthSourcePath, baseDir);
  const checks = [
    buildCheck("source_present", Boolean(source), adminGrowthSourcePath),
    ...requiredSourceSignals.map((signal) =>
      buildCheck(signal.id, signal.pattern.test(source), signal.label),
    ),
    ...forbiddenSourceSignals.map((signal) =>
      buildCheck(signal.id, !signal.pattern.test(source), signal.label),
    ),
  ];

  return {
    ready: checks.every((check) => check.ready),
    path: adminGrowthSourcePath,
    checks,
  };
}

export async function evaluateAdminSurfaceLive({
  target = adminGrowthUrl(process.env.NEXT_PUBLIC_SITE_URL || defaultOrigin),
  fetchImpl = fetch,
} = {}) {
  const checks = [];
  let response;
  let body = "";
  let location = "";

  try {
    response = await fetchImpl(target, {
      redirect: "manual",
      headers: { accept: "text/html,application/xhtml+xml" },
    });
    location = response.headers?.get?.("location") || "";
    body = await response.text();
  } catch (error) {
    return {
      ready: false,
      target,
      status: 0,
      location: "",
      checks: [buildCheck("live_fetch", false, error instanceof Error ? error.message : String(error))],
    };
  }

  const status = Number(response.status || 0);
  const redirectsToAdmin = sameOriginAdminLogin(location, target);
  const deniesDirectAccess = status === 401 || status === 403;
  const protectedStatus = redirectsToAdmin || deniesDirectAccess;
  const leakedSignatures = sensitiveLiveSignatures.filter((signature) => body.includes(signature));

  checks.push(buildCheck("live_protected_status", protectedStatus, `HTTP ${status}${location ? ` -> ${location}` : ""}`));
  checks.push(
    buildCheck(
      "live_same_origin_admin_redirect",
      redirectsToAdmin || deniesDirectAccess,
      deniesDirectAccess ? `HTTP ${status}` : location || "missing location",
    ),
  );
  checks.push(
    buildCheck(
      "live_no_admin_dashboard_body",
      leakedSignatures.length === 0,
      leakedSignatures.length === 0 ? "no sensitive dashboard signatures" : leakedSignatures.join(", "),
    ),
  );

  return {
    ready: checks.every((check) => check.ready),
    target,
    status,
    location,
    checks,
  };
}

export async function evaluateAdminSurfaceReadiness(args = {}) {
  const source = evaluateAdminSurfaceSource(args);
  const live = await evaluateAdminSurfaceLive(args);
  const blockers = [
    ...source.checks.filter((check) => !check.ready).map((check) => `source ${check.id}: ${check.detail}`),
    ...live.checks.filter((check) => !check.ready).map((check) => `live ${check.id}: ${check.detail}`),
  ];

  return {
    decision: blockers.length === 0 ? "ADMIN SURFACE READY" : "ADMIN SURFACE BLOCKED",
    source,
    live,
    blockers,
  };
}

export function formatAdminSurfaceReadiness(result) {
  const lines = [
    "Kozbeyli Konagi admin surface readiness",
    `Decision: ${result.decision}`,
    `Target: ${result.live.target}`,
    `HTTP: ${result.live.status}, location=${result.live.location || "n/a"}`,
    "",
    "Source guard:",
  ];

  result.source.checks.forEach((check) => {
    lines.push(`- ${check.ready ? "PASS" : "FAIL"} ${check.id} (${check.detail})`);
  });

  lines.push("");
  lines.push("Live unauthenticated access:");
  result.live.checks.forEach((check) => {
    lines.push(`- ${check.ready ? "PASS" : "FAIL"} ${check.id} (${check.detail})`);
  });

  if (result.blockers.length > 0) {
    lines.push("");
    lines.push("Blockers:");
    result.blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  }

  return lines.join("\n");
}

async function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const result = await evaluateAdminSurfaceReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatAdminSurfaceReadiness(result));
  process.exitCode = strict && result.decision !== "ADMIN SURFACE READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void main();
}
