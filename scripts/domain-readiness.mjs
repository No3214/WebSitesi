import { execFileSync } from "node:child_process";
import { resolveMx, resolveNs } from "node:dns/promises";
import { pathToFileURL } from "node:url";

const DEFAULT_CANONICAL_ORIGINS = ["https://kozbeylikonagi.com", "https://www.kozbeylikonagi.com"];
const DEFAULT_PREVIEW_ORIGIN = "https://kozbeyli-konagi.vercel.app";
const EXPECTED_SERVICE = "kozbeyli-konagi";
const EXPECTED_HERO_VIDEO_SRC = "/videos/hero.mp4";
const DNS_FALLBACK_ENDPOINTS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
];

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

async function fetchFirstRedirect(url, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: { accept: "text/html,application/json" },
      redirect: "manual",
      signal: controller.signal,
    });

    const location = response.headers.get("location") || "";
    const resolvedLocation = location ? new URL(location, url).href : "";

    return {
      status: response.status,
      location,
      resolvedLocation,
      firstHopInsecure: Boolean(resolvedLocation && new URL(resolvedLocation).protocol === "http:"),
      firstHopCrossOrigin: Boolean(
        resolvedLocation && new URL(resolvedLocation).origin !== new URL(url).origin,
      ),
      error: "",
    };
  } catch (error) {
    return {
      status: 0,
      location: "",
      resolvedLocation: "",
      firstHopInsecure: false,
      firstHopCrossOrigin: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFollowedText(url, fetchImpl, timeoutMs) {
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
      finalUrl: response.url || url,
      redirected: Boolean(response.redirected),
      text: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      contentType: "",
      finalUrl: "",
      redirected: false,
      text: "",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url, fetchImpl, timeoutMs) {
  const [redirect, followed] = await Promise.all([
    fetchFirstRedirect(url, fetchImpl, timeoutMs),
    fetchFollowedText(url, fetchImpl, timeoutMs),
  ]);

  return {
    ...followed,
    redirect,
  };
}

function extractTitle(html) {
  return html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || "";
}

function hasInsecureFirstHop(response) {
  return Boolean(response.redirect?.firstHopInsecure);
}

function stripTrailingDot(value) {
  return String(value || "").replace(/\.+$/, "");
}

function parseDohAnswers(payload, recordType) {
  const answers = Array.isArray(payload?.Answer) ? payload.Answer : [];
  const records = answers
    .map((answer) => stripTrailingDot(answer?.data))
    .filter(Boolean);

  if (recordType === "NS") {
    return records.sort();
  }

  if (recordType === "MX") {
    return records
      .map((record) => {
        const [preference, ...exchangeParts] = record.trim().split(/\s+/);
        const preferenceNumber = Number(preference);
        const exchange = stripTrailingDot(exchangeParts.join(" "));

        if (!Number.isFinite(preferenceNumber) || !exchange) return null;

        return {
          exchange,
          preference: preferenceNumber,
        };
      })
      .filter(Boolean);
  }

  return [];
}

async function queryDnsOverHttps({
  apexDomain,
  recordType,
  fetchImpl = fetch,
  timeoutMs = 6000,
}) {
  const errors = [];

  for (const endpoint of DNS_FALLBACK_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = new URL(endpoint);
      url.searchParams.set("name", apexDomain);
      url.searchParams.set("type", recordType);

      const response = await fetchImpl(url, {
        headers: { accept: "application/dns-json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        errors.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }

      const payload = await response.json();
      const records = parseDohAnswers(payload, recordType);

      return {
        records,
        source: endpoint,
        error: "",
      };
    } catch (error) {
      errors.push(`${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    records: [],
    source: "dns-over-https",
    error: errors.join("; "),
  };
}

async function resolveDnsRecord({
  apexDomain,
  recordType,
  nativeLookup,
  dnsFallbackFetchImpl,
  dnsFallbackTimeoutMs,
}) {
  try {
    const records = await nativeLookup(apexDomain);
    if (Array.isArray(records) && records.length > 0) {
      return {
        records: recordType === "NS" ? records.sort() : records,
        source: "system",
        error: "",
      };
    }
  } catch (error) {
    if (!dnsFallbackFetchImpl) {
      return {
        records: [],
        source: "system",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    const fallback = await queryDnsOverHttps({
      apexDomain,
      recordType,
      fetchImpl: dnsFallbackFetchImpl,
      timeoutMs: dnsFallbackTimeoutMs,
    });

    return {
      records: fallback.records,
      source: fallback.records.length > 0 ? fallback.source : "system+dns-over-https",
      error: fallback.records.length > 0 ? "" : `${error instanceof Error ? error.message : String(error)}; ${fallback.error}`,
    };
  }

  if (!dnsFallbackFetchImpl) {
    return {
      records: [],
      source: "system",
      error: "empty DNS response",
    };
  }

  const fallback = await queryDnsOverHttps({
    apexDomain,
    recordType,
    fetchImpl: dnsFallbackFetchImpl,
    timeoutMs: dnsFallbackTimeoutMs,
  });

  return {
    records: fallback.records,
    source: fallback.records.length > 0 ? fallback.source : "system+dns-over-https",
    error: fallback.records.length > 0 ? "" : fallback.error || "empty DNS response",
  };
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
  const hasOpeningHeroVideo = home.text.includes(EXPECTED_HERO_VIDEO_SRC);
  const homeOk = Boolean(home.ok && hasOpeningHeroVideo);
  const secureRedirectsOk = !hasInsecureFirstHop(health) && !hasInsecureFirstHop(home);
  const ready = Boolean(serviceOk && commitOk && homeOk && secureRedirectsOk);

  return {
    origin: normalizedOrigin,
    ready,
    health: {
      url: healthUrl,
      status: health.status,
      contentType: health.contentType,
      finalUrl: health.finalUrl,
      redirected: health.redirected,
      redirect: health.redirect,
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
      finalUrl: home.finalUrl,
      redirected: home.redirected,
      redirect: home.redirect,
      title: extractTitle(home.text),
      error: home.error || "",
      expectedHeroVideoSrc: EXPECTED_HERO_VIDEO_SRC,
      hasOpeningHeroVideo,
      homeOk,
    },
  };
}

function originBlockers(item) {
  const blockers = [];
  const insecureRedirects = new Set(
    [item.health.redirect, item.home.redirect]
      .filter((redirect) => redirect?.firstHopInsecure)
      .map((redirect) => redirect.resolvedLocation || redirect.location)
      .filter(Boolean),
  );

  for (const location of insecureRedirects) {
    blockers.push(`${item.origin} redirects first hop to insecure HTTP: ${location}`);
  }

  if (!item.health.serviceOk || !item.health.commitOk) {
    blockers.push(`${item.origin} does not serve ${EXPECTED_SERVICE} at current commit`);
  }

  if (!item.home.homeOk) {
    blockers.push(
      `${item.origin} homepage does not expose opening hero video ${EXPECTED_HERO_VIDEO_SRC}`,
    );
  }

  return blockers;
}

async function checkDns({
  apexDomain = "kozbeylikonagi.com",
  resolveNsImpl = resolveNs,
  resolveMxImpl = resolveMx,
  dnsFallbackFetchImpl,
  dnsFallbackTimeoutMs = 6000,
} = {}) {
  const [nsResult, mxResult] = await Promise.all([
    resolveDnsRecord({
      apexDomain,
      recordType: "NS",
      nativeLookup: resolveNsImpl,
      dnsFallbackFetchImpl,
      dnsFallbackTimeoutMs,
    }),
    resolveDnsRecord({
      apexDomain,
      recordType: "MX",
      nativeLookup: resolveMxImpl,
      dnsFallbackFetchImpl,
      dnsFallbackTimeoutMs,
    }),
  ]);

  const ns = nsResult.records;
  const mx = mxResult.records;

  return {
    apexDomain,
    ns,
    mx,
    nsOk: ns.some((item) => item.includes("cloudflare.com")),
    mxOk: mx.some((item) => item.exchange === "mx.kozbeylikonagi.com"),
    nsSource: nsResult.source,
    mxSource: mxResult.source,
    nsError: nsResult.error,
    mxError: mxResult.error,
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
  dnsFallbackFetchImpl = fetch,
  dnsFallbackTimeoutMs = 6000,
} = {}) {
  const [preview, canonical, dns] = await Promise.all([
    checkOrigin({ origin: previewOrigin, expectedCommit, fetchImpl, timeoutMs }),
    Promise.all(
      canonicalOrigins.map((origin) =>
        checkOrigin({ origin, expectedCommit, fetchImpl, timeoutMs }),
      ),
    ),
    checkDns({ resolveNsImpl, resolveMxImpl, dnsFallbackFetchImpl, dnsFallbackTimeoutMs }),
  ]);

  const canonicalReady = canonical.every((item) => item.ready);
  const previewReady = preview.ready;
  const warnings = [
    ...(dns.nsOk ? [] : ["canonical domain nameservers could not be verified as Cloudflare"]),
    ...(dns.mxOk ? [] : ["canonical domain MX record could not be verified as mx.kozbeylikonagi.com"]),
  ];
  const blockers = [
    ...canonical.flatMap(originBlockers),
    ...(previewReady ? [] : originBlockers(preview).map((blocker) => blocker.replace(preview.origin, `${preview.origin} preview`))),
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
    `  health: HTTP ${result.preview.health.status}, final=${result.preview.health.finalUrl || "n/a"}, service=${result.preview.health.service || "n/a"}, commit=${result.preview.health.deploymentCommit || "n/a"}`,
    `  home: HTTP ${result.preview.home.status}, final=${result.preview.home.finalUrl || "n/a"}, title=${result.preview.home.title || "n/a"}, heroVideo=${result.preview.home.hasOpeningHeroVideo ? "yes" : "no"}`,
    "",
    "Canonical domains:",
  ];

  for (const item of result.canonical) {
    lines.push(`${item.ready ? "PASS" : "FAIL"} ${item.origin}`);
    lines.push(
      `  health: HTTP ${item.health.status}, final=${item.health.finalUrl || "n/a"}, content-type=${item.health.contentType || "n/a"}, service=${item.health.service || "n/a"}, commit=${item.health.deploymentCommit || "n/a"}`,
    );
    lines.push(
      `  home: HTTP ${item.home.status}, final=${item.home.finalUrl || "n/a"}, title=${item.home.title || "n/a"}, heroVideo=${item.home.hasOpeningHeroVideo ? "yes" : "no"}`,
    );
    for (const redirect of [item.health.redirect, item.home.redirect]) {
      if (redirect?.firstHopInsecure) {
        lines.push(
          `  insecure first-hop redirect: ${redirect.location} -> ${redirect.resolvedLocation}`,
        );
      }
    }
  }

  lines.push("");
  lines.push(`DNS: ${result.dnsReady ? "PASS" : "WARN"} ${result.dns.apexDomain}`);
  lines.push(`  NS (${result.dns.nsSource || "unknown"}): ${result.dns.ns.join(", ") || result.dns.nsError || "n/a"}`);
  lines.push(
    `  MX (${result.dns.mxSource || "unknown"}): ${
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
  process.exitCode = strict && result.decision !== "CANONICAL DOMAIN GO" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void main();
}
