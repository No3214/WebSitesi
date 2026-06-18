import { execFileSync } from "node:child_process";
import { resolveMx, resolveNs } from "node:dns/promises";
import { pathToFileURL } from "node:url";

const DEFAULT_CANONICAL_ORIGINS = ["https://kozbeylikonagi.com", "https://www.kozbeylikonagi.com"];
const DEFAULT_PREVIEW_ORIGIN = "https://kozbeyli-konagi.vercel.app";
const EXPECTED_SERVICE = "kozbeyli-konagi";

function normalizeOrigin(origin) {
  return origin.replace(/\/+$/, "");
}

function originsFromEnv(value) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map(normalizeOrigin)
    : DEFAULT_CANONICAL_ORIGINS;
}

function getExpectedCommit() {
  if (process.env.EXPECTED_DEPLOYMENT_COMMIT) return process.env.EXPECTED_DEPLOYMENT_COMMIT;

  try {
    return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function commitMatches(actual, expected) {
  if (!expected) return true;
  if (!actual) return false;
  return actual.startsWith(expected) || expected.startsWith(actual);
}

async function fetchText(url, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: { accept: "text/html,application/json" },
      signal: controller.signal,
    });
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      text: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      contentType: "",
      text: "",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractTitle(html) {
  return html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || "";
}

async function checkOrigin({ origin, expectedCommit, fetchImpl = fetch, timeoutMs = 10000 }) {
  const normalizedOrigin = normalizeOrigin(origin);
  const healthUrl = `${normalizedOrigin}/api/health`;
  const homeUrl = normalizedOrigin;
  const [health, home] = await Promise.all([
    fetchText(healthUrl, fetchImpl, timeoutMs),
    fetchText(homeUrl, fetchImpl, timeoutMs),
  ]);

  let healthJson = null;
  if (health.ok && health.contentType.includes("application/json")) {
    try {
      healthJson = JSON.parse(health.text);
    } catch {
      healthJson = null;
    }
  }

  const serviceOk = healthJson?.service === EXPECTED_SERVICE && healthJson?.status === "ok";
  const actualCommit = String(healthJson?.deployment?.commit || "");
  const commitOk = commitMatches(actualCommit, expectedCommit);
  const ready = Boolean(serviceOk && commitOk);

  return {
    origin: normalizedOrigin,
    ready,
    health: {
      url: healthUrl,
      status: health.status,
      contentType: health.contentType,
      error: health.error || "",
      service: healthJson?.service || "",
      deploymentCommit: actualCommit,
      serviceOk,
      commitOk,
    },
    home: {
      url: homeUrl,
      status: home.status,
      contentType: home.contentType,
      title: extractTitle(home.text),
      error: home.error || "",
    },
  };
}

async function checkDns({
  apexDomain = "kozbeylikonagi.com",
  resolveNsImpl = resolveNs,
  resolveMxImpl = resolveMx,
} = {}) {
  const [nsResult, mxResult] = await Promise.allSettled([
    resolveNsImpl(apexDomain),
    resolveMxImpl(apexDomain),
  ]);

  const ns = nsResult.status === "fulfilled" ? nsResult.value.sort() : [];
  const mx = mxResult.status === "fulfilled" ? mxResult.value : [];

  return {
    apexDomain,
    ns,
    mx,
    nsOk: ns.some((item) => item.includes("cloudflare.com")),
    mxOk: mx.some((item) => item.exchange === "mx.kozbeylikonagi.com"),
    nsError: nsResult.status === "rejected" ? String(nsResult.reason?.message || nsResult.reason) : "",
    mxError: mxResult.status === "rejected" ? String(mxResult.reason?.message || mxResult.reason) : "",
  };
}

export async function evaluateDomainReadiness({
  canonicalOrigins = originsFromEnv(process.env.CANONICAL_DOMAIN_ORIGINS),
  previewOrigin = process.env.PW_BASE_URL || DEFAULT_PREVIEW_ORIGIN,
  expectedCommit = getExpectedCommit(),
  fetchImpl = fetch,
  timeoutMs = 10000,
  resolveNsImpl = resolveNs,
  resolveMxImpl = resolveMx,
} = {}) {
  const [preview, canonical, dns] = await Promise.all([
    checkOrigin({ origin: previewOrigin, expectedCommit, fetchImpl, timeoutMs }),
    Promise.all(
      canonicalOrigins.map((origin) =>
        checkOrigin({ origin, expectedCommit, fetchImpl, timeoutMs }),
      ),
    ),
    checkDns({ resolveNsImpl, resolveMxImpl }),
  ]);

  const canonicalReady = canonical.every((item) => item.ready);
  const previewReady = preview.ready;
  const warnings = [
    ...(dns.nsOk ? [] : ["canonical domain nameservers could not be verified as Cloudflare"]),
    ...(dns.mxOk ? [] : ["canonical domain MX record could not be verified as mx.kozbeylikonagi.com"]),
  ];
  const blockers = [
    ...canonical
      .filter((item) => !item.ready)
      .map((item) => `${item.origin} does not serve ${EXPECTED_SERVICE} at current commit`),
    ...(previewReady ? [] : [`${preview.origin} preview does not serve ${EXPECTED_SERVICE} at current commit`]),
  ];

  return {
    expectedService: EXPECTED_SERVICE,
    expectedCommit,
    decision: canonicalReady && previewReady ? "CANONICAL DOMAIN GO" : "CANONICAL DOMAIN NO-GO",
    canonicalReady,
    previewReady,
    dnsReady: dns.nsOk && dns.mxOk,
    preview,
    canonical,
    dns,
    warnings,
    blockers,
  };
}

export function formatDomainReadiness(result) {
  const lines = [
    "Kozbeyli Konagi canonical domain readiness",
    `Decision: ${result.decision}`,
    `Expected service: ${result.expectedService}`,
    `Expected commit: ${result.expectedCommit || "not checked"}`,
    "",
    `Preview: ${result.preview.ready ? "PASS" : "FAIL"} ${result.preview.origin}`,
    `  health: HTTP ${result.preview.health.status}, service=${result.preview.health.service || "n/a"}, commit=${result.preview.health.deploymentCommit || "n/a"}`,
    "",
    "Canonical domains:",
  ];

  for (const item of result.canonical) {
    lines.push(`${item.ready ? "PASS" : "FAIL"} ${item.origin}`);
    lines.push(
      `  health: HTTP ${item.health.status}, content-type=${item.health.contentType || "n/a"}, service=${item.health.service || "n/a"}, commit=${item.health.deploymentCommit || "n/a"}`,
    );
    lines.push(`  home: HTTP ${item.home.status}, title=${item.home.title || "n/a"}`);
  }

  lines.push("");
  lines.push(`DNS: ${result.dnsReady ? "PASS" : "WARN"} ${result.dns.apexDomain}`);
  lines.push(`  NS: ${result.dns.ns.join(", ") || result.dns.nsError || "n/a"}`);
  lines.push(
    `  MX: ${
      result.dns.mx.map((item) => `${item.preference} ${item.exchange}`).join(", ") ||
      result.dns.mxError ||
      "n/a"
    }`,
  );

  if (result.warnings.length > 0) {
    lines.push("");
    lines.push("Warnings:");
    result.warnings.forEach((warning) => lines.push(`- ${warning}`));
  }

  if (result.blockers.length > 0) {
    lines.push("");
    lines.push("Blockers:");
    result.blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  }

  return lines.join("\n");
}

async function main() {
  const strict = process.argv.includes("--strict");
  const json = process.argv.includes("--json");
  const result = await evaluateDomainReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatDomainReadiness(result));
  process.exit(strict && result.decision !== "CANONICAL DOMAIN GO" ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void main();
}
