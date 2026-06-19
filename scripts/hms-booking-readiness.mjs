import { pathToFileURL } from "node:url";

export const OFFICIAL_HMS_BOOKING_ENGINE_HOST = "kozbeyli-konagi.hmshotel.net";
export const OFFICIAL_HMS_BOOKING_ENGINE_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";

const WRONG_PROPERTY_SIGNALS = [
  "soleil mansion",
  "soleil-mansion",
  "hotelrunner.com/bv3/search",
];

function parseBookingUrl(rawUrl) {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

function normalizeBookingUrl(rawUrl = "") {
  const source = String(rawUrl || "").trim();
  const explicit = Boolean(source);
  const parsed = parseBookingUrl(source || OFFICIAL_HMS_BOOKING_ENGINE_URL);

  if (!parsed) {
    return {
      source: "invalid_env",
      targetUrl: OFFICIAL_HMS_BOOKING_ENGINE_URL,
      configurationReady: false,
      blockers: ["NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL is not a valid URL"],
    };
  }

  const blockers = [];
  if (parsed.protocol !== "https:") {
    blockers.push("booking target must use HTTPS");
  }

  if (parsed.hostname !== OFFICIAL_HMS_BOOKING_ENGINE_HOST) {
    blockers.push(`booking target host must be ${OFFICIAL_HMS_BOOKING_ENGINE_HOST}`);
  }

  if (!parsed.searchParams.has("utm_source")) {
    parsed.searchParams.set("utm_source", "website");
  }

  if (!parsed.searchParams.has("utm_medium")) {
    parsed.searchParams.set("utm_medium", "booking_engine");
  }

  return {
    source: explicit ? (blockers.length > 0 ? "invalid_env" : "env") : "code_fallback",
    targetUrl: blockers.length > 0 ? OFFICIAL_HMS_BOOKING_ENGINE_URL : parsed.toString(),
    configurationReady: blockers.length === 0,
    blockers,
  };
}

async function fetchFirstRedirect(url, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: { accept: "text/html" },
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
      error: "",
    };
  } catch (error) {
    return {
      status: 0,
      location: "",
      resolvedLocation: "",
      firstHopInsecure: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFollowedHtml(url, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: { accept: "text/html" },
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      finalUrl: response.url || url,
      redirected: Boolean(response.redirected),
      text: await response.text(),
      error: "",
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

function extractTitle(html) {
  return html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function pageSignals(html) {
  const lower = html.toLowerCase();
  return {
    hasKozbeyli: lower.includes("kozbeyli konağı") || lower.includes("kozbeyli konagi"),
    hasReservation: lower.includes("reservation") || lower.includes("rezervasyon"),
    wrongPropertySignals: WRONG_PROPERTY_SIGNALS.filter((signal) => lower.includes(signal)),
  };
}

export async function evaluateHmsBookingReadiness({
  rawUrl = process.env.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL || "",
  fetchImpl = fetch,
  timeoutMs = 15000,
} = {}) {
  const target = normalizeBookingUrl(rawUrl);
  const [redirect, page] = await Promise.all([
    fetchFirstRedirect(target.targetUrl, fetchImpl, timeoutMs),
    fetchFollowedHtml(target.targetUrl, fetchImpl, timeoutMs),
  ]);
  const finalUrl = parseBookingUrl(page.finalUrl || target.targetUrl);
  const signals = pageSignals(page.text || "");

  const blockers = [...target.blockers];
  const warnings = [];

  if (redirect.firstHopInsecure) {
    blockers.push(`booking target redirects first hop to insecure HTTP: ${redirect.resolvedLocation}`);
  }

  if (!page.ok) {
    blockers.push(`booking target returned HTTP ${page.status || "0"}`);
  }

  if (!page.contentType.toLowerCase().includes("text/html")) {
    blockers.push(`booking target content-type is not HTML: ${page.contentType || "n/a"}`);
  }

  if (!finalUrl || finalUrl.protocol !== "https:") {
    blockers.push("booking target final URL is not HTTPS");
  }

  if (!finalUrl || finalUrl.hostname !== OFFICIAL_HMS_BOOKING_ENGINE_HOST) {
    blockers.push(`booking target final host must be ${OFFICIAL_HMS_BOOKING_ENGINE_HOST}`);
  }

  if (!signals.hasKozbeyli) {
    blockers.push("booking target page does not include Kozbeyli property copy");
  }

  if (!signals.hasReservation) {
    warnings.push("booking target page does not include an obvious reservation label");
  }

  if (signals.wrongPropertySignals.length > 0) {
    blockers.push(`booking target includes wrong-property signal: ${signals.wrongPropertySignals.join(", ")}`);
  }

  return {
    decision: blockers.length === 0 ? "HMS BOOKING TARGET PASS" : "HMS BOOKING TARGET FAIL",
    targetUrl: target.targetUrl,
    configurationSource: target.source,
    configurationReady: target.configurationReady,
    expectedHost: OFFICIAL_HMS_BOOKING_ENGINE_HOST,
    redirect,
    page: {
      status: page.status,
      contentType: page.contentType,
      finalUrl: page.finalUrl,
      redirected: page.redirected,
      title: extractTitle(page.text || ""),
      error: page.error || "",
      hasKozbeyli: signals.hasKozbeyli,
      hasReservation: signals.hasReservation,
      wrongPropertySignals: signals.wrongPropertySignals,
    },
    blockers,
    warnings,
  };
}

export function formatHmsBookingReadiness(result) {
  const lines = [
    "Kozbeyli Konagi HMS booking target readiness",
    `Decision: ${result.decision}`,
    `Target: ${result.targetUrl}`,
    `Configuration source: ${result.configurationSource}`,
    `Expected host: ${result.expectedHost}`,
    "",
    `HTTP: ${result.page.status}, final=${result.page.finalUrl || "n/a"}, content-type=${result.page.contentType || "n/a"}`,
    `Title: ${result.page.title || "n/a"}`,
    `Signals: kozbeyli=${result.page.hasKozbeyli ? "yes" : "no"}, reservation=${result.page.hasReservation ? "yes" : "no"}`,
  ];

  if (result.redirect.firstHopInsecure) {
    lines.push(`First-hop redirect: insecure -> ${result.redirect.resolvedLocation}`);
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
  const result = await evaluateHmsBookingReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatHmsBookingReadiness(result));
  process.exitCode = strict && result.decision !== "HMS BOOKING TARGET PASS" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  void main();
}
