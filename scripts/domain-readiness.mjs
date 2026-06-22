import { execFileSync } from "node:child_process";
import { resolve4, resolveCname, resolveMx, resolveNs } from "node:dns/promises";
import { pathToFileURL } from "node:url";

const DEFAULT_CANONICAL_ORIGINS = ["https://kozbeylikonagi.com", "https://www.kozbeylikonagi.com"];
const DEFAULT_BRAND_ORIGINS = ["https://kozbeylikonagi.com.tr", "https://www.kozbeylikonagi.com.tr"];
const DEFAULT_PREVIEW_ORIGIN = "https://kozbeyli-konagi.vercel.app";
const EXPECTED_SERVICE = "kozbeyli-konagi";
const EXPECTED_HERO_VIDEO_SRC = "/videos/hero.mp4";
const VERCEL_APEX_A_VALUE = "76.76.21.21";
const VERCEL_SUBDOMAIN_CNAME_FALLBACK = "cname.vercel-dns.com";
const VERCEL_SUBDOMAIN_CNAME_PATTERN = "^[a-z0-9-]+\\.vercel-dns(?:-\\d+)?\\.com$";
export const VERCEL_DNS_TARGET_NOTE =
  "Use A records for apex domains and CNAME records for subdomains; copy the exact project-specific value shown in Vercel Project Settings or vercel domains inspect before editing DNS.";
export const VERCEL_TARGET_RECORDS = [
  {
    group: "canonical",
    type: "A",
    host: "kozbeylikonagi.com",
    value: VERCEL_APEX_A_VALUE,
    purpose: "Apex domain should point to Vercel production.",
  },
  {
    group: "canonical",
    type: "CNAME",
    host: "www.kozbeylikonagi.com",
    value: VERCEL_SUBDOMAIN_CNAME_FALLBACK,
    acceptedPattern: VERCEL_SUBDOMAIN_CNAME_PATTERN,
    purpose: "WWW subdomain should point to the project-specific Vercel CNAME target.",
  },
  {
    group: "brand",
    type: "A",
    host: "kozbeylikonagi.com.tr",
    value: VERCEL_APEX_A_VALUE,
    purpose: "Brand apex domain should serve or securely redirect to the current Vercel app.",
  },
  {
    group: "brand",
    type: "CNAME",
    host: "www.kozbeylikonagi.com.tr",
    value: VERCEL_SUBDOMAIN_CNAME_FALLBACK,
    acceptedPattern: VERCEL_SUBDOMAIN_CNAME_PATTERN,
    purpose: "Brand WWW subdomain should serve or securely redirect through the project-specific Vercel CNAME target.",
  },
];
const DNS_ZONES = [
  {
    group: "canonical",
    apexDomain: "kozbeylikonagi.com",
    mailRequired: true,
    expectedMx: "mx.kozbeylikonagi.com",
  },
  {
    group: "brand",
    apexDomain: "kozbeylikonagi.com.tr",
    mailRequired: false,
    expectedMx: "",
  },
];
const LEGACY_HOST_SIGNATURES = [
  {
    id: "joomla-seagull",
    label: "legacy Joomla/Seagull template",
    patterns: [
      /Seagull for Joomla/i,
      /Open Source Matters/i,
      /Sayfa Bulunamadi/i,
      /404 - Error: 404/i,
    ],
  },
  {
    id: "hotelrunner-legacy-landing",
    label: "legacy HotelRunner hosted landing surface",
    patterns: [
      /kozbeyli-konagi-1\.hotelrunner\.com/i,
      /renderPageSections/i,
      /window\.parent\.postMessage/i,
    ],
  },
];
const DNS_FALLBACK_ENDPOINTS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
];
const CLOUDFLARE_PROXY_CUTOVER_NOTE =
  "If Cloudflare proxy is enabled, public DNS can show Cloudflare anycast IPs instead of the Vercel target. For first cutover verification, use DNS only or prove the proxied host with /api/health and the opening hero video before marking the gate ready.";

function normalizeOrigin(origin) {
  return origin.replace(/\/+$/, "");
}

function originsFromEnv(value, fallbackOrigins) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map(normalizeOrigin)
    : fallbackOrigins;
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

function detectLegacyHostSignatures(text) {
  return LEGACY_HOST_SIGNATURES
    .filter((signature) => signature.patterns.some((pattern) => pattern.test(text)))
    .map(({ id, label }) => ({ id, label }));
}

function mergeLegacyHostSignatures(...groups) {
  const seen = new Set();
  const merged = [];

  for (const group of groups.flat()) {
    if (!group?.id || seen.has(group.id)) continue;
    seen.add(group.id);
    merged.push(group);
  }

  return merged;
}

function hasInsecureFirstHop(response) {
  return Boolean(response.redirect?.firstHopInsecure);
}

function stripTrailingDot(value) {
  return String(value || "").replace(/\.+$/, "");
}

function classifyDnsAuthority(nsRecords) {
  const normalized = nsRecords.map((item) => item.toLowerCase());

  if (normalized.length === 0) {
    return {
      provider: "unknown",
      label: "Unknown",
      action: "Verify the nameserver delegation at the registrar before changing DNS records.",
    };
  }

  if (normalized.some((item) => item.includes("cloudflare.com"))) {
    return {
      provider: "cloudflare",
      label: "Cloudflare",
      action:
        "Edit the Cloudflare DNS zone, or change the domain nameservers away from Cloudflare before expecting registrar-zone DNS records to affect live traffic.",
    };
  }

  if (normalized.some((item) => item.includes("isimtescil") || item.includes("natro"))) {
    return {
      provider: "isimtescil",
      label: "Isimtescil/Natro",
      action:
        "Edit DNS records in the Isimtescil/Natro DNS zone and preserve existing mail and verification records.",
    };
  }

  if (normalized.some((item) => item.includes("vercel-dns.com"))) {
    return {
      provider: "vercel",
      label: "Vercel DNS",
      action: "Edit records in Vercel DNS and keep third-party mail records intact.",
    };
  }

  return {
    provider: "third-party",
    label: "Third-party DNS",
    action:
      "Edit records at the authoritative DNS provider shown by the nameservers, not necessarily the registrar.",
  };
}

function recordsForZone(zone) {
  return VERCEL_TARGET_RECORDS.filter(
    (record) =>
      record.group === zone.group &&
      (record.host === zone.apexDomain || record.host.endsWith(`.${zone.apexDomain}`)),
  );
}

export function describeVercelTarget(record) {
  return record.acceptedPattern
    ? `${record.value} or the project-specific Vercel CNAME shown in Project Settings / vercel domains inspect`
    : record.value;
}

function buildRecordChecklistItem(record) {
  return `Set ${record.type} ${record.host} to ${describeVercelTarget(record)}.`;
}

function buildZoneCutoverGuidance(zone, authority) {
  const records = recordsForZone(zone);
  const checklist = [
    `Open the ${authority.label} authoritative DNS zone for ${zone.apexDomain}.`,
    VERCEL_DNS_TARGET_NOTE,
    ...records.map(buildRecordChecklistItem),
  ];

  if (authority.provider === "cloudflare") {
    checklist.push(CLOUDFLARE_PROXY_CUTOVER_NOTE);
  }

  if (zone.mailRequired) {
    checklist.push(
      `Preserve MX ${zone.expectedMx} and all existing TXT/SPF/DKIM/DMARC records during web cutover.`,
    );
  } else {
    checklist.push("Do not change mail records unless a separate mail migration is approved.");
  }

  return {
    records,
    checklist,
    cloudflareProxyNote:
      authority.provider === "cloudflare" ? CLOUDFLARE_PROXY_CUTOVER_NOTE : "",
  };
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

  if (recordType === "A" || recordType === "CNAME") {
    return records.sort();
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

function normalizeDnsValues(values) {
  return values.map((item) => stripTrailingDot(item).toLowerCase()).sort();
}

function webRecordMatches(record, actualValues) {
  const expected = stripTrailingDot(record.value).toLowerCase();
  const actual = normalizeDnsValues(actualValues);

  if (record.type === "A") {
    return actual.includes(expected);
  }

  if (record.type === "CNAME") {
    if (actual.includes(expected)) return true;
    if (record.acceptedPattern) {
      const accepted = new RegExp(record.acceptedPattern, "i");
      return actual.some((value) => accepted.test(value));
    }
    return false;
  }

  return false;
}

function describeActualDns(item) {
  if (item.actualValues.length > 0) return item.actualValues.join(", ");
  if (item.actualAValues?.length > 0) return `no CNAME; A records: ${item.actualAValues.join(", ")}`;
  return item.error || "n/a";
}

function hostnameForOrigin(origin) {
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function annotateWebRecordChecks({ dns, canonical, brand }) {
  const originsByHost = new Map();

  for (const item of [...canonical, ...brand]) {
    const hostname = hostnameForOrigin(item.origin);
    if (!hostname) continue;
    originsByHost.set(hostname, {
      origin: item.origin,
      ready: item.ready,
    });
  }

  const webRecordChecks = dns.webRecordChecks.map((item) => {
    const origin = originsByHost.get(item.host.toLowerCase());

    return {
      ...item,
      originVerified: Boolean(origin?.ready),
      origin: origin?.origin || "",
      propagationNote:
        !item.ready && origin?.ready
          ? "The web origin is verified on the current deployment; this DNS mismatch is treated as propagation, resolver-cache, or proxy-state evidence."
          : "",
    };
  });

  return {
    ...dns,
    webRecordChecks,
    webRecordsOk: webRecordChecks.every((item) => item.ready),
  };
}

function describeDnsRecordWarning(item) {
  const base = `${item.type} ${item.host} does not match Vercel target ${
    item.expectedDescription
  }; actual: ${describeActualDns(item)}`;

  if (!item.originVerified) return base;

  return `${base}; web origin ${item.origin} is already verified, so treat this as DNS propagation/proxy-state evidence`;
}

async function checkWebTargetRecord({
  record,
  resolve4Impl,
  resolveCnameImpl,
  dnsFallbackFetchImpl,
  dnsFallbackTimeoutMs,
}) {
  const nativeLookup = record.type === "A" ? resolve4Impl : resolveCnameImpl;
  const result = await resolveDnsRecord({
    apexDomain: record.host,
    recordType: record.type,
    nativeLookup,
    dnsFallbackFetchImpl,
    dnsFallbackTimeoutMs,
  });
  const actualValues = normalizeDnsValues(result.records);
  const expectedValue = stripTrailingDot(record.value).toLowerCase();
  const ready = webRecordMatches(record, result.records);
  let actualAValues = [];
  let aRecordSource = "";

  if (record.type === "CNAME" && !ready) {
    const aResult = await resolveDnsRecord({
      apexDomain: record.host,
      recordType: "A",
      nativeLookup: resolve4Impl,
      dnsFallbackFetchImpl,
      dnsFallbackTimeoutMs,
    });
    actualAValues = normalizeDnsValues(aResult.records);
    aRecordSource = aResult.source;
  }

  return {
    group: record.group,
    type: record.type,
    host: record.host,
    expectedValue,
    expectedDescription: describeVercelTarget(record),
    expectedPattern: record.acceptedPattern || "",
    actualValues,
    actualAValues,
    source: result.source,
    aRecordSource,
    error: result.error,
    ready,
    purpose: record.purpose,
    remediation: ready
      ? ""
      : `Set ${record.type} ${record.host} to ${describeVercelTarget(record)} at the active DNS authority, or use an explicit redirect after proving the web origin serves the current app.`,
  };
}

async function checkWebTargetRecords({
  resolve4Impl = resolve4,
  resolveCnameImpl = resolveCname,
  dnsFallbackFetchImpl,
  dnsFallbackTimeoutMs = 6000,
} = {}) {
  return Promise.all(
    VERCEL_TARGET_RECORDS.map((record) =>
      checkWebTargetRecord({
        record,
        resolve4Impl,
        resolveCnameImpl,
        dnsFallbackFetchImpl,
        dnsFallbackTimeoutMs,
      }),
    ),
  );
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
  const healthLegacySignatures = detectLegacyHostSignatures(health.text);
  const homeLegacySignatures = detectLegacyHostSignatures(home.text);
  const legacyHostSignatures = mergeLegacyHostSignatures(healthLegacySignatures, homeLegacySignatures);
  const legacyHostDetected = legacyHostSignatures.length > 0;
  const ready = Boolean(serviceOk && commitOk && homeOk && secureRedirectsOk && !legacyHostDetected);

  return {
    origin: normalizedOrigin,
    ready,
    legacyHost: {
      detected: legacyHostDetected,
      signatures: legacyHostSignatures,
    },
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
      legacySignatures: healthLegacySignatures,
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
      legacySignatures: homeLegacySignatures,
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

  if (item.legacyHost?.detected) {
    blockers.push(
      `${item.origin} serves legacy host surface: ${item.legacyHost.signatures
        .map((signature) => signature.label)
        .join(", ")}`,
    );
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

async function checkDnsZone({
  zone,
  resolveNsImpl = resolveNs,
  resolveMxImpl = resolveMx,
  dnsFallbackFetchImpl,
  dnsFallbackTimeoutMs = 6000,
}) {
  const nsResultPromise = resolveDnsRecord({
    apexDomain: zone.apexDomain,
    recordType: "NS",
    nativeLookup: resolveNsImpl,
    dnsFallbackFetchImpl,
    dnsFallbackTimeoutMs,
  });
  const mxResultPromise = zone.mailRequired
    ? resolveDnsRecord({
        apexDomain: zone.apexDomain,
        recordType: "MX",
        nativeLookup: resolveMxImpl,
        dnsFallbackFetchImpl,
        dnsFallbackTimeoutMs,
      })
    : Promise.resolve({ records: [], source: "not-required", error: "" });
  const [nsResult, mxResult] = await Promise.all([nsResultPromise, mxResultPromise]);
  const ns = nsResult.records;
  const mx = mxResult.records;
  const authority = classifyDnsAuthority(ns);
  const nsOk = ns.length > 0 && authority.provider !== "unknown";
  const mxOk = !zone.mailRequired || mx.some((item) => item.exchange === zone.expectedMx);
  const cutover = buildZoneCutoverGuidance(zone, authority);

  return {
    group: zone.group,
    apexDomain: zone.apexDomain,
    mailRequired: zone.mailRequired,
    expectedMx: zone.expectedMx,
    ns,
    mx,
    authority,
    nsOk,
    mxOk,
    cutover,
    nsSource: nsResult.source,
    mxSource: mxResult.source,
    nsError: nsResult.error,
    mxError: mxResult.error,
  };
}

async function checkDns({
  apexDomain = "kozbeylikonagi.com",
  resolve4Impl = resolve4,
  resolveCnameImpl = resolveCname,
  resolveNsImpl = resolveNs,
  resolveMxImpl = resolveMx,
  dnsFallbackFetchImpl,
  dnsFallbackTimeoutMs = 6000,
} = {}) {
  const zonesToCheck = DNS_ZONES.map((zone) =>
    zone.apexDomain === apexDomain || zone.group !== "canonical"
      ? zone
      : { ...zone, apexDomain },
  );
  const [zones, webRecordChecks] = await Promise.all([
    Promise.all(
      zonesToCheck.map((zone) =>
        checkDnsZone({
          zone,
          resolveNsImpl,
          resolveMxImpl,
          dnsFallbackFetchImpl,
          dnsFallbackTimeoutMs,
        }),
      ),
    ),
    checkWebTargetRecords({
      resolve4Impl,
      resolveCnameImpl,
      dnsFallbackFetchImpl,
      dnsFallbackTimeoutMs,
    }),
  ]);
  const canonicalZone = zones.find((zone) => zone.group === "canonical") || zones[0] || {
    apexDomain,
    ns: [],
    mx: [],
    authority: classifyDnsAuthority([]),
    nsOk: false,
    mxOk: false,
    nsSource: "",
    mxSource: "",
    nsError: "",
    mxError: "",
  };
  const zonesOk = zones.every((zone) => zone.nsOk && zone.mxOk);
  const webRecordsOk = webRecordChecks.every((item) => item.ready);

  return {
    apexDomain: canonicalZone.apexDomain,
    zones,
    zonesOk,
    ns: canonicalZone.ns,
    mx: canonicalZone.mx,
    authority: canonicalZone.authority,
    registrarVsDnsNote:
      "The registrar panel and the live DNS authority can be different. Nameservers decide where live DNS records must be edited.",
    isimtescilCaution:
      "If the domain is registered at Isimtescil but nameservers stay on Cloudflare, Isimtescil DNS-zone records will not control live web traffic. To use Isimtescil DNS, change nameservers first and preserve MX/TXT/SPF/DKIM/DMARC records.",
    vercelDnsTargetNote: VERCEL_DNS_TARGET_NOTE,
    vercelTargetRecords: VERCEL_TARGET_RECORDS,
    webRecordChecks,
    webRecordsOk,
    nsOk: canonicalZone.nsOk,
    mxOk: canonicalZone.mxOk,
    nsSource: canonicalZone.nsSource,
    mxSource: canonicalZone.mxSource,
    nsError: canonicalZone.nsError,
    mxError: canonicalZone.mxError,
  };
}

export async function evaluateDomainReadiness({
  canonicalOrigins = originsFromEnv(process.env.CANONICAL_DOMAIN_ORIGINS, DEFAULT_CANONICAL_ORIGINS),
  brandOrigins = originsFromEnv(process.env.BRAND_DOMAIN_ORIGINS, DEFAULT_BRAND_ORIGINS),
  previewOrigin = process.env.PW_BASE_URL || DEFAULT_PREVIEW_ORIGIN,
  expectedCommit = getExpectedCommit(),
  fetchImpl = fetch,
  timeoutMs = 10000,
  resolve4Impl = resolve4,
  resolveCnameImpl = resolveCname,
  resolveNsImpl = resolveNs,
  resolveMxImpl = resolveMx,
  dnsFallbackFetchImpl = fetch,
  dnsFallbackTimeoutMs = 6000,
} = {}) {
  const [preview, canonical, brand, rawDns] = await Promise.all([
    checkOrigin({ origin: previewOrigin, expectedCommit, fetchImpl, timeoutMs }),
    Promise.all(
      canonicalOrigins.map((origin) =>
        checkOrigin({ origin, expectedCommit, fetchImpl, timeoutMs }),
      ),
    ),
    Promise.all(
      brandOrigins.map((origin) =>
        checkOrigin({ origin, expectedCommit, fetchImpl, timeoutMs }),
      ),
    ),
    checkDns({
      resolve4Impl,
      resolveCnameImpl,
      resolveNsImpl,
      resolveMxImpl,
      dnsFallbackFetchImpl,
      dnsFallbackTimeoutMs,
    }),
  ]);

  const canonicalReady = canonical.every((item) => item.ready);
  const brandReady = brand.every((item) => item.ready);
  const previewReady = preview.ready;
  const dns = annotateWebRecordChecks({ dns: rawDns, canonical, brand });
  const warnings = [
    ...dns.zones
      .filter((zone) => !zone.nsOk)
      .map((zone) => `${zone.group} domain nameservers could not be verified for ${zone.apexDomain}`),
    ...dns.zones
      .filter((zone) => !zone.mxOk)
      .map((zone) => `${zone.group} domain MX record could not be verified as ${zone.expectedMx}`),
    ...dns.webRecordChecks
      .filter((item) => !item.ready)
      .map(describeDnsRecordWarning),
  ];
  const blockers = [
    ...canonical.flatMap(originBlockers),
    ...brand.flatMap(originBlockers),
    ...(previewReady ? [] : originBlockers(preview).map((blocker) => blocker.replace(preview.origin, `${preview.origin} preview`))),
  ];

  return {
    expectedService: EXPECTED_SERVICE,
    expectedCommit,
    decision: canonicalReady && brandReady && previewReady ? "CANONICAL DOMAIN GO" : "CANONICAL DOMAIN NO-GO",
    canonicalReady,
    brandReady,
    previewReady,
    dnsReady: dns.zonesOk && dns.webRecordsOk,
    preview,
    canonical,
    brand,
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
    if (item.legacyHost.detected) {
      lines.push(
        `  legacy host signatures: ${item.legacyHost.signatures
          .map((signature) => signature.label)
          .join(", ")}`,
      );
    }
    for (const redirect of [item.health.redirect, item.home.redirect]) {
      if (redirect?.firstHopInsecure) {
        lines.push(
          `  insecure first-hop redirect: ${redirect.location} -> ${redirect.resolvedLocation}`,
        );
      }
    }
  }

  if (result.brand.length > 0) {
    lines.push("");
    lines.push("Brand domains:");
    for (const item of result.brand) {
      lines.push(`${item.ready ? "PASS" : "FAIL"} ${item.origin}`);
      lines.push(
        `  health: HTTP ${item.health.status}, final=${item.health.finalUrl || "n/a"}, content-type=${item.health.contentType || "n/a"}, service=${item.health.service || "n/a"}, commit=${item.health.deploymentCommit || "n/a"}`,
      );
      lines.push(
        `  home: HTTP ${item.home.status}, final=${item.home.finalUrl || "n/a"}, title=${item.home.title || "n/a"}, heroVideo=${item.home.hasOpeningHeroVideo ? "yes" : "no"}`,
      );
      if (item.legacyHost.detected) {
        lines.push(
          `  legacy host signatures: ${item.legacyHost.signatures
            .map((signature) => signature.label)
            .join(", ")}`,
        );
      }
      for (const redirect of [item.health.redirect, item.home.redirect]) {
        if (redirect?.firstHopInsecure) {
          lines.push(
            `  insecure first-hop redirect: ${redirect.location} -> ${redirect.resolvedLocation}`,
          );
        }
      }
    }
  }

  lines.push("");
  lines.push(`DNS: ${result.dnsReady ? "PASS" : "WARN"}`);
  for (const zone of result.dns.zones) {
    lines.push(`  [${zone.group}] ${zone.apexDomain}`);
    lines.push(`    NS (${zone.nsSource || "unknown"}): ${zone.ns.join(", ") || zone.nsError || "n/a"}`);
    lines.push(
      `    MX (${zone.mxSource || "unknown"}): ${
        zone.mailRequired
          ? zone.mx.map((item) => `${item.preference} ${item.exchange}`).join(", ") || zone.mxError || "n/a"
          : "not required for this launch gate"
      }`,
    );
    lines.push(`    active DNS authority: ${zone.authority.label}`);
    lines.push(`    action: ${zone.authority.action}`);
    lines.push("    cutover checklist:");
    zone.cutover.checklist.forEach((item) => lines.push(`    - ${item}`));
  }
  lines.push(`  registrar/DNS note: ${result.dns.registrarVsDnsNote}`);
  lines.push(`  Isimtescil caution: ${result.dns.isimtescilCaution}`);
  lines.push(`  Vercel DNS target note: ${result.dns.vercelDnsTargetNote}`);
  lines.push("  Vercel target records:");
  for (const record of result.dns.vercelTargetRecords) {
    lines.push(`  - [${record.group}] ${record.type} ${record.host} ${describeVercelTarget(record)} (${record.purpose})`);
  }
  lines.push("  Live web records:");
  for (const record of result.dns.webRecordChecks) {
    lines.push(
      `  - ${record.ready ? "PASS" : "WARN"} [${record.group}] ${record.type} ${record.host} expected=${record.expectedDescription} actual=${
        describeActualDns(record)
      } source=${record.source} originVerified=${record.originVerified ? "yes" : "no"}`,
    );
    if (record.propagationNote) lines.push(`    note: ${record.propagationNote}`);
    if (!record.ready) lines.push(`    remediation: ${record.remediation}`);
  }

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
