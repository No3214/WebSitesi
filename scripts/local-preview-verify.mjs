import { pathToFileURL } from "node:url";

const DEFAULT_BASE_URL = process.env.LOCAL_PREVIEW_URL || process.env.PW_BASE_URL || "http://localhost:3001";
const EXPECTED_SERVICE = "kozbeyli-konagi";
const EXPECTED_HERO_VIDEO_SRC = "/videos/hero.mp4";
const EXPECTED_TITLE_PATTERN = /Kozbeyli Konağı|Kozbeyli Konagi/i;
const FORBIDDEN_SIGNATURES = [
  {
    id: "ela-ebeoglu",
    label: "cross-project Ela Ebeoglu/Ebeoğlu content",
    pattern: /Ela\s+Ebe(?:oglu|oğlu)|Ebe(?:oglu|oğlu)/i,
  },
];

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, "");
}

async function fetchWithTimeout(fetchImpl, url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchImpl(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readText(response) {
  try {
    return await response.text();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

function detectForbiddenSignatures(text) {
  return FORBIDDEN_SIGNATURES.filter((signature) => signature.pattern.test(text)).map((signature) => ({
    id: signature.id,
    label: signature.label,
  }));
}

function titleFromHtml(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
}

export async function evaluateLocalPreview({
  baseUrl = DEFAULT_BASE_URL,
  fetchImpl = fetch,
  timeoutMs = 8000,
} = {}) {
  const origin = normalizeBaseUrl(baseUrl);
  const healthUrl = `${origin}/api/health`;
  const homeUrl = origin;
  const blockers = [];

  if (typeof fetchImpl !== "function") {
    throw new TypeError("fetchImpl must be a function");
  }

  let healthStatus = 0;
  let healthService = "";
  let healthText = "";
  let healthError = "";

  try {
    const healthResponse = await fetchWithTimeout(
      fetchImpl,
      healthUrl,
      { headers: { accept: "application/json" } },
      timeoutMs,
    );
    healthStatus = healthResponse.status;
    healthText = await readText(healthResponse);

    try {
      const healthJson = JSON.parse(healthText);
      healthService = typeof healthJson.service === "string" ? healthJson.service : "";
      if (healthJson.status !== "ok") blockers.push("/api/health does not report status ok");
    } catch {
      blockers.push("/api/health did not return parseable JSON");
    }
  } catch (error) {
    healthError = error instanceof Error ? error.message : String(error);
    blockers.push(`/api/health request failed: ${healthError}`);
  }

  if (healthStatus !== 200) blockers.push(`/api/health returned HTTP ${healthStatus || "n/a"}`);
  if (healthService !== EXPECTED_SERVICE) {
    blockers.push(`/api/health service is ${healthService || "missing"}, expected ${EXPECTED_SERVICE}`);
  }

  let homeStatus = 0;
  let homeHtml = "";
  let homeError = "";
  let title = "";

  try {
    const homeResponse = await fetchWithTimeout(
      fetchImpl,
      homeUrl,
      { headers: { accept: "text/html" } },
      timeoutMs,
    );
    homeStatus = homeResponse.status;
    homeHtml = await readText(homeResponse);
    title = titleFromHtml(homeHtml);
  } catch (error) {
    homeError = error instanceof Error ? error.message : String(error);
    blockers.push(`homepage request failed: ${homeError}`);
  }

  if (homeStatus !== 200) blockers.push(`homepage returned HTTP ${homeStatus || "n/a"}`);
  if (!EXPECTED_TITLE_PATTERN.test(title)) {
    blockers.push(`homepage title is not Kozbeyli: ${title || "missing"}`);
  }
  if (!homeHtml.includes(EXPECTED_HERO_VIDEO_SRC)) {
    blockers.push(`homepage does not expose ${EXPECTED_HERO_VIDEO_SRC}`);
  }

  const forbiddenSignatures = detectForbiddenSignatures(`${healthText}\n${homeHtml}`);
  for (const signature of forbiddenSignatures) {
    blockers.push(`forbidden signature detected: ${signature.label}`);
  }

  return {
    ready: blockers.length === 0,
    origin,
    expectedService: EXPECTED_SERVICE,
    expectedHeroVideoSrc: EXPECTED_HERO_VIDEO_SRC,
    health: {
      url: healthUrl,
      status: healthStatus,
      service: healthService,
      error: healthError,
    },
    home: {
      url: homeUrl,
      status: homeStatus,
      title,
      hasOpeningHeroVideo: homeHtml.includes(EXPECTED_HERO_VIDEO_SRC),
      error: homeError,
    },
    forbiddenSignatures,
    blockers,
  };
}

export function formatLocalPreview(result) {
  const lines = [
    result.ready ? "LOCAL PREVIEW PASS" : "LOCAL PREVIEW BLOCKED",
    `Target: ${result.origin}`,
    `Health: HTTP ${result.health.status || "n/a"}, service ${result.health.service || "missing"}`,
    `Home: HTTP ${result.home.status || "n/a"}, title ${result.home.title || "missing"}`,
    `Hero video: ${result.home.hasOpeningHeroVideo ? "present" : "missing"} (${result.expectedHeroVideoSrc})`,
  ];

  if (result.forbiddenSignatures.length > 0) {
    lines.push(`Forbidden signatures: ${result.forbiddenSignatures.map((item) => item.id).join(", ")}`);
  }

  if (result.blockers.length > 0) {
    lines.push("Blockers:");
    for (const blocker of result.blockers) lines.push(`- ${blocker}`);
  }

  return lines.join("\n");
}

async function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const result = await evaluateLocalPreview();

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatLocalPreview(result));
  }

  if (strict || !json) {
    process.exitCode = result.ready ? 0 : 1;
  }
}

const cliEntry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === cliEntry) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
