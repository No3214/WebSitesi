import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const defaultOrigin = "https://www.kozbeylikonagi.com";
const adminGrowthPath = "/admin/growth";
const adminLoginPath = "/admin";
const adminGrowthSourcePath = "src/app/admin/growth/page.tsx";
const adminGrowthClientSourcePath = "src/app/admin/growth/growth-client.tsx";
const adminPayloadPageSourcePath = "src/app/(payload)/admin/[[...segments]]/page.tsx";
const adminPayloadLayoutSourcePath = "src/app/(payload)/admin/[[...segments]]/layout.tsx";

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
  {
    id: "runtime_readiness_source",
    label: "admin growth page must source runtime readiness on the server",
    pattern: /getRuntimeReadiness\(\)/,
  },
  {
    id: "runtime_readiness_prop",
    label: "admin growth page must pass runtime readiness into the dashboard",
    pattern: /runtimeReadiness=\{getRuntimeReadiness\(\)\}/,
  },
];

const requiredClientSignals = [
  {
    id: "runtime_readiness_type",
    label: "admin dashboard must accept a runtime readiness snapshot",
    pattern: /type\s+RuntimeReadinessSnapshot\s*=/,
  },
  {
    id: "runtime_readiness_summary",
    label: "admin dashboard must render runtime readiness summary text",
    pattern: /Runtime readiness/,
  },
  {
    id: "runtime_blocked_gate_summary",
    label: "admin dashboard must render blocked runtime gate ids only",
    pattern: /Blocked runtime gates/,
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
    pattern: /return\s+<GrowthDashboardClient[\s\S]*\/>[\s\S]*if\s*\(\s*!authenticated\s*\)/,
  },
];

const forbiddenClientSignals = [
  {
    id: "runtime_secret_env_names",
    label: "admin dashboard runtime panel must not render secret env names",
    pattern:
      /\b(?:DATABASE_URI|PAYLOAD_SECRET|TURNSTILE_SECRET_KEY|UPSTASH_REDIS_REST_TOKEN|GA4_API_SECRET|GARANTI_3D_STORE_KEY)\b/,
  },
];

const requiredPayloadAdminSignals = [
  {
    id: "admin_dependency_guard_page",
    label: "Payload admin page must preflight dependencies before loading Payload",
    pattern: /getAdminDependencyStatus\(\)/,
  },
  {
    id: "admin_dependency_guard_layout",
    label: "Payload admin layout must skip Payload RootLayout when dependencies are unavailable",
    pattern: /getAdminDependencyStatus\(\)/,
  },
  {
    id: "admin_dependency_status_marker",
    label: "controlled admin dependency outage must expose a non-secret status marker",
    pattern: /data-admin-dependency-status/,
  },
];

const forbiddenPayloadAdminSignals = [
  {
    id: "top_level_payload_config_page",
    label: "Payload admin page must not import @payload-config before dependency preflight",
    pattern: /^import\s+config\s+from\s+["']@payload-config["']/m,
  },
  {
    id: "top_level_payload_config_layout",
    label: "Payload admin layout must not import @payload-config before dependency preflight",
    pattern: /^import\s+config\s+from\s+["']@payload-config["']/m,
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
  "Runtime readiness",
  "Blocked runtime gates",
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

function adminLoginUrlFromTarget(target) {
  try {
    return new URL(adminLoginPath, target).toString();
  } catch {
    return `${defaultOrigin}${adminLoginPath}`;
  }
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
  const clientSource = readIfExists(adminGrowthClientSourcePath, baseDir);
  const payloadAdminPageSource = readIfExists(adminPayloadPageSourcePath, baseDir);
  const payloadAdminLayoutSource = readIfExists(adminPayloadLayoutSourcePath, baseDir);
  const checks = [
    buildCheck("source_present", Boolean(source), adminGrowthSourcePath),
    buildCheck("client_source_present", Boolean(clientSource), adminGrowthClientSourcePath),
    buildCheck("payload_admin_page_source_present", Boolean(payloadAdminPageSource), adminPayloadPageSourcePath),
    buildCheck("payload_admin_layout_source_present", Boolean(payloadAdminLayoutSource), adminPayloadLayoutSourcePath),
    ...requiredSourceSignals.map((signal) =>
      buildCheck(signal.id, signal.pattern.test(source), signal.label),
    ),
    ...requiredClientSignals.map((signal) =>
      buildCheck(signal.id, signal.pattern.test(clientSource), signal.label),
    ),
    ...forbiddenSourceSignals.map((signal) =>
      buildCheck(signal.id, !signal.pattern.test(source), signal.label),
    ),
    ...forbiddenClientSignals.map((signal) =>
      buildCheck(signal.id, !signal.pattern.test(clientSource), signal.label),
    ),
    buildCheck(
      requiredPayloadAdminSignals[0].id,
      requiredPayloadAdminSignals[0].pattern.test(payloadAdminPageSource),
      requiredPayloadAdminSignals[0].label,
    ),
    buildCheck(
      requiredPayloadAdminSignals[1].id,
      requiredPayloadAdminSignals[1].pattern.test(payloadAdminLayoutSource),
      requiredPayloadAdminSignals[1].label,
    ),
    buildCheck(
      requiredPayloadAdminSignals[2].id,
      requiredPayloadAdminSignals[2].pattern.test(payloadAdminPageSource),
      requiredPayloadAdminSignals[2].label,
    ),
    buildCheck(
      forbiddenPayloadAdminSignals[0].id,
      !forbiddenPayloadAdminSignals[0].pattern.test(payloadAdminPageSource),
      forbiddenPayloadAdminSignals[0].label,
    ),
    buildCheck(
      forbiddenPayloadAdminSignals[1].id,
      !forbiddenPayloadAdminSignals[1].pattern.test(payloadAdminLayoutSource),
      forbiddenPayloadAdminSignals[1].label,
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
  const loginTarget = adminLoginUrlFromTarget(target);
  let loginStatus = 0;
  let loginBody = "";
  let loginLocation = "";

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

  if (redirectsToAdmin) {
    try {
      const loginResponse = await fetchImpl(loginTarget, {
        redirect: "manual",
        headers: { accept: "text/html,application/xhtml+xml" },
      });
      loginStatus = Number(loginResponse.status || 0);
      loginLocation = loginResponse.headers?.get?.("location") || "";
      loginBody = await loginResponse.text();
    } catch (error) {
      loginStatus = 0;
      loginBody = "";
      loginLocation = error instanceof Error ? error.message : String(error);
    }
  }

  const loginLeakedSignatures = sensitiveLiveSignatures.filter((signature) =>
    loginBody.includes(signature),
  );
  const loginDependencyUnavailable = loginBody.includes("data-admin-dependency-status");
  const loginRouteReachable =
    !redirectsToAdmin || (loginStatus > 0 && loginStatus < 500 && loginStatus !== 404);

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
  checks.push(
    buildCheck(
      "live_payload_admin_login_reachable",
      loginRouteReachable,
      redirectsToAdmin
        ? `${loginTarget}: HTTP ${loginStatus}${loginLocation ? ` -> ${loginLocation}` : ""}`
        : "not required because direct access was denied",
    ),
  );
  checks.push(
    buildCheck(
      "live_payload_admin_login_no_dashboard_leak",
      loginLeakedSignatures.length === 0,
      loginLeakedSignatures.length === 0
        ? "no sensitive dashboard signatures"
        : loginLeakedSignatures.join(", "),
    ),
  );
  checks.push(
    buildCheck(
      "live_payload_admin_dependency_ready",
      !loginDependencyUnavailable,
      loginDependencyUnavailable
        ? "Payload admin returned controlled dependency-unavailable screen"
        : "Payload admin did not report a dependency outage",
    ),
  );

  return {
    ready: checks.every((check) => check.ready),
    target,
    status,
    location,
    loginTarget,
    loginStatus,
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
    `Payload admin login: ${result.live.loginTarget || "n/a"}, HTTP ${result.live.loginStatus || "n/a"}`,
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
