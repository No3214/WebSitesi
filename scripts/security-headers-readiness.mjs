import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const defaultTarget = "https://www.kozbeylikonagi.com";
const nextConfigPath = "next.config.ts";

const requiredHeaders = [
  {
    id: "content_security_policy",
    header: "content-security-policy",
    sourceSignals: ["Content-Security-Policy", "object-src 'none'", "base-uri 'self'", "form-action 'self'"],
    live: (value) => Boolean(value),
    expectation: "Content-Security-Policy is present",
  },
  {
    id: "strict_transport_security",
    header: "strict-transport-security",
    sourceSignals: ["Strict-Transport-Security", "max-age=63072000", "includeSubDomains", "preload"],
    live: (value) =>
      /max-age=63072000/i.test(value || "") &&
      /includeSubDomains/i.test(value || "") &&
      /preload/i.test(value || ""),
    expectation: "HSTS preload policy is present for HTTPS production traffic",
  },
  {
    id: "x_frame_options",
    header: "x-frame-options",
    sourceSignals: ["X-Frame-Options", "SAMEORIGIN"],
    live: (value) => /^SAMEORIGIN$/i.test(value || ""),
    expectation: "X-Frame-Options stays SAMEORIGIN",
  },
  {
    id: "x_content_type_options",
    header: "x-content-type-options",
    sourceSignals: ["X-Content-Type-Options", "nosniff"],
    live: (value) => /^nosniff$/i.test(value || ""),
    expectation: "X-Content-Type-Options stays nosniff",
  },
  {
    id: "referrer_policy",
    header: "referrer-policy",
    sourceSignals: ["Referrer-Policy", "strict-origin-when-cross-origin"],
    live: (value) => /^strict-origin-when-cross-origin$/i.test(value || ""),
    expectation: "Referrer-Policy limits cross-origin leakage",
  },
  {
    id: "permissions_policy",
    header: "permissions-policy",
    sourceSignals: ["Permissions-Policy", "camera=()", "microphone=()", "geolocation=()"],
    live: (value) =>
      /camera=\(\)/i.test(value || "") &&
      /microphone=\(\)/i.test(value || "") &&
      /geolocation=\(\)/i.test(value || ""),
    expectation: "Permissions-Policy disables unused device capabilities",
  },
];

const requiredCspDirectives = [
  "default-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "frame-src 'self' https://www.google.com https://maps.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
  "frame-ancestors 'self'",
];

const forbiddenCspPatterns = [
  {
    id: "production_unsafe_eval",
    label: "production CSP must not allow unsafe-eval",
    pattern: /(?:^|;)\s*script-src[^;]*'unsafe-eval'/i,
  },
  {
    id: "wide_frame_src_https",
    label: "frame-src must not allow every HTTPS origin",
    pattern: /(?:^|;)\s*frame-src[^;]*\shttps:(?!\/\/)(?:\s|;|$)/i,
  },
  {
    id: "wide_frame_src_blob",
    label: "frame-src must not allow blob frames",
    pattern: /(?:^|;)\s*frame-src[^;]*\sblob:(?:\s|;|$)/i,
  },
];

function readIfExists(relPath, baseDir = root) {
  const fullPath = path.join(baseDir, relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function headerFrom(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") return headers.get(name) || "";
  const lowerName = name.toLowerCase();
  return headers[lowerName] || headers[name] || "";
}

function buildCheck(id, ready, detail) {
  return { id, ready, detail };
}

export function evaluateSecurityHeaderSource({ baseDir = root } = {}) {
  const source = readIfExists(nextConfigPath, baseDir);
  const checks = [];

  checks.push(buildCheck("next_config_present", Boolean(source), nextConfigPath));
  checks.push(buildCheck("next_headers_hook", /async\s+headers\s*\(/.test(source), "Next.js headers() hook"));
  checks.push(buildCheck("global_header_source", /source:\s*["']\/\(\.\*\)["']/.test(source), "source: /(.*)"));

  for (const header of requiredHeaders) {
    const missingSignals = header.sourceSignals.filter((signal) => !source.includes(signal));
    checks.push(
      buildCheck(
        `source_${header.id}`,
        missingSignals.length === 0,
        missingSignals.length === 0 ? header.expectation : `missing: ${missingSignals.join(", ")}`,
      ),
    );
  }

  for (const directive of requiredCspDirectives) {
    checks.push(
      buildCheck(
        `source_csp_${directive.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`,
        source.includes(directive),
        directive,
      ),
    );
  }

  checks.push(
    buildCheck(
      "source_unsafe_eval_dev_only",
      source.includes('process.env.NODE_ENV !== "production" ? "\'unsafe-eval\'" : ""'),
      "unsafe-eval is gated to non-production builds",
    ),
  );
  checks.push(
    buildCheck(
      "source_no_wide_frame_src",
      !source.includes("frame-src https:") && !source.includes("frame-src https: blob:"),
      "HMS booking opens in a new tab; broad frame-src is not allowed",
    ),
  );

  return {
    ready: checks.every((check) => check.ready),
    checks,
  };
}

export async function evaluateSecurityHeaderLive({
  target = process.env.SECURITY_HEADERS_URL || process.env.NEXT_PUBLIC_SITE_URL || defaultTarget,
  fetchImpl = fetch,
} = {}) {
  const checks = [];
  let response;

  try {
    response = await fetchImpl(target, {
      redirect: "follow",
      headers: { accept: "text/html,application/xhtml+xml" },
    });
  } catch (error) {
    return {
      ready: false,
      target,
      status: 0,
      finalUrl: target,
      headers: {},
      checks: [buildCheck("live_fetch", false, error instanceof Error ? error.message : String(error))],
    };
  }

  const status = Number(response.status || 0);
  const finalUrl = response.url || target;
  const liveHeaders = Object.fromEntries(requiredHeaders.map((header) => [header.header, headerFrom(response.headers, header.header)]));
  const csp = liveHeaders["content-security-policy"] || "";

  checks.push(buildCheck("live_http_ok", status >= 200 && status < 400, `HTTP ${status}`));
  checks.push(buildCheck("live_https_url", finalUrl.startsWith("https://"), finalUrl));

  for (const header of requiredHeaders) {
    checks.push(
      buildCheck(
        `live_${header.id}`,
        header.live(liveHeaders[header.header]),
        liveHeaders[header.header] || `${header.header} missing`,
      ),
    );
  }

  for (const directive of requiredCspDirectives) {
    checks.push(
      buildCheck(
        `live_csp_${directive.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`,
        csp.includes(directive),
        directive,
      ),
    );
  }

  for (const forbidden of forbiddenCspPatterns) {
    checks.push(buildCheck(`live_no_${forbidden.id}`, !forbidden.pattern.test(csp), forbidden.label));
  }

  return {
    ready: checks.every((check) => check.ready),
    target,
    status,
    finalUrl,
    headers: liveHeaders,
    checks,
  };
}

export async function evaluateSecurityHeadersReadiness(args = {}) {
  const source = evaluateSecurityHeaderSource(args);
  const live = await evaluateSecurityHeaderLive(args);
  const blockers = [
    ...source.checks.filter((check) => !check.ready).map((check) => `source ${check.id}: ${check.detail}`),
    ...live.checks.filter((check) => !check.ready).map((check) => `live ${check.id}: ${check.detail}`),
  ];

  return {
    decision: blockers.length === 0 ? "SECURITY HEADERS READY" : "SECURITY HEADERS BLOCKED",
    source,
    live,
    blockers,
  };
}

export function formatSecurityHeadersReadiness(result) {
  const lines = [
    "Kozbeyli Konagi security headers readiness",
    `Decision: ${result.decision}`,
    `Target: ${result.live.target}`,
    `HTTP: ${result.live.status}, final=${result.live.finalUrl}`,
    "",
    "Source policy:",
  ];

  result.source.checks.forEach((check) => {
    lines.push(`- ${check.ready ? "PASS" : "FAIL"} ${check.id} (${check.detail})`);
  });

  lines.push("");
  lines.push("Live headers:");
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
  const result = await evaluateSecurityHeadersReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatSecurityHeadersReadiness(result));
  process.exitCode = strict && result.decision !== "SECURITY HEADERS READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
