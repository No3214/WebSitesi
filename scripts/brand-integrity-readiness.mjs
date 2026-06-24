import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const defaultOrigin = "https://www.kozbeylikonagi.com";

const sourceTargets = [
  "src/app",
  "src/components",
  "src/data",
  "src/dictionaries",
  "src/lib/ai/llm-context-generator.ts",
  "src/lib/dictionary.ts",
  "brand/knowledge_base",
  "README.md",
  "public/robots.txt",
];

const liveRoutes = [
  "/",
  "/odalar",
  "/gastronomi",
  "/organizasyonlar",
  "/rezervasyon",
  "/iletisim",
  "/menu",
  "/misafir-rehberi",
  "/en",
  "/en/booking",
  "/api/llm-context",
  "/llms.txt",
];

const ignoredDirs = new Set(["node_modules", ".next", ".git", "test-results", "playwright-report"]);
const textFilePattern = /\.(?:ts|tsx|js|jsx|json|md|txt|html|xml)$/i;

const integrityRules = [
  {
    id: "legacy_com_tr_domain",
    label: "public copy must use kozbeylikonagi.com, not the old .com.tr domain",
    pattern: /kozbeylikonagi\.com\.tr/i,
  },
  {
    id: "wrong_property_booking",
    label: "public copy must not reference the Soleil Mansion booking property",
    pattern: /soleil(?:-|\s*)mansion|soleil-mansion\.hotelrunner\.com/i,
  },
  {
    id: "wrong_property_ela",
    label: "public copy must not reference unrelated Ela Ebeoglu material",
    pattern: /ela\s+ebe(?:oğ|og)lu/i,
  },
  {
    id: "digital_concierge",
    label: "public copy must not use removed digital concierge wording",
    pattern: /dijital\s*k[aâ]hya|whatsapp\s+concierge|direct\s+concierge|doğrudan\s+concierge|\bconcierge\b/i,
  },
  {
    id: "wrong_heritage_age_200",
    label: "public copy must not describe the heritage story as 200 years old",
    pattern: /200\s*yıllık\s+bir\s+hikaye|200-year-old\s+story|200\s*year\s+old\s+story/i,
  },
  {
    id: "wrong_heritage_age_500_building",
    label: "500-year wording is reserved for village texture, not the registered mansion or dibek",
    pattern:
      /500\s*yıllık[^.\n]*(?:konak|osmanlı\s+taş\s+mimarisi|tescilli\s+taş\s+mimari|dibek|kahve)|500-year-old[^.\n]*(?:registered\s+)?(?:stone\s+architecture|mansion|dibek|coffee)/i,
  },
  {
    id: "weak_positioning",
    label: "public copy must not use low-end positioning terms",
    pattern: /\bcheap\b|budget\s+(?:hotel|motel|stay|room|lodging)|basic\s+(?:motel|hotel|room)|standard\s+motel/i,
  },
  {
    id: "generated_media_claim",
    label: "public copy must not use generated, stock or placeholder hotel media claims",
    pattern: /generated\s+(?:hotel\s+)?image|stock\s+photo|placeholder\s+(?:hotel\s+)?image|hayali\s+g[oö]rsel/i,
  },
];

function readIfExists(relPath, baseDir = root) {
  const fullPath = path.join(baseDir, relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function listTextFiles(target, baseDir = root) {
  const fullPath = path.join(baseDir, target);
  if (!fs.existsSync(fullPath)) return [];
  const stat = fs.statSync(fullPath);
  if (stat.isFile()) return textFilePattern.test(fullPath) ? [fullPath] : [];

  const files = [];
  for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const child = path.join(fullPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTextFiles(path.relative(baseDir, child), baseDir));
    } else if (textFilePattern.test(entry.name)) {
      files.push(child);
    }
  }
  return files;
}

function scanText({ location, content }) {
  return integrityRules
    .filter((rule) => rule.pattern.test(content))
    .map((rule) => ({
      rule: rule.id,
      label: rule.label,
      location,
    }));
}

export function evaluateBrandIntegritySource({ baseDir = root } = {}) {
  const files = sourceTargets.flatMap((target) => listTextFiles(target, baseDir));
  const findings = files.flatMap((file) =>
    scanText({
      location: path.relative(baseDir, file).replace(/\\/g, "/"),
      content: fs.readFileSync(file, "utf8"),
    }),
  );

  return {
    ready: findings.length === 0,
    scannedFiles: files.length,
    findings,
  };
}

export async function evaluateBrandIntegrityLive({
  origin = process.env.BRAND_INTEGRITY_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || defaultOrigin,
  routes = liveRoutes,
  fetchImpl = fetch,
} = {}) {
  const findings = [];
  const responses = [];
  const normalizedOrigin = origin.replace(/\/$/, "");

  for (const route of routes) {
    const url = `${normalizedOrigin}${route}`;
    try {
      const response = await fetchImpl(url, {
        headers: {
          accept: route.startsWith("/api/") ? "application/json,text/plain,*/*" : "text/html,text/plain,*/*",
        },
      });
      const status = Number(response.status || 0);
      const content = await response.text();
      responses.push({ route, status, ok: status >= 200 && status < 400 });
      if (status < 200 || status >= 400) {
        findings.push({
          rule: "live_route_unavailable",
          label: "brand integrity live route must be reachable",
          location: `${route} HTTP ${status}`,
        });
        continue;
      }
      findings.push(...scanText({ location: route, content }));
    } catch (error) {
      findings.push({
        rule: "live_route_fetch_failed",
        label: "brand integrity live route fetch must succeed",
        location: `${route}: ${error instanceof Error ? error.message : String(error)}`,
      });
      responses.push({ route, status: 0, ok: false });
    }
  }

  return {
    ready: findings.length === 0,
    origin: normalizedOrigin,
    scannedRoutes: routes.length,
    responses,
    findings,
  };
}

export async function evaluateBrandIntegrityReadiness(args = {}) {
  const source = evaluateBrandIntegritySource(args);
  const live = await evaluateBrandIntegrityLive(args);
  const blockers = [
    ...source.findings.map((finding) => `${finding.location}: ${finding.label} (${finding.rule})`),
    ...live.findings.map((finding) => `live ${finding.location}: ${finding.label} (${finding.rule})`),
  ];

  return {
    decision: blockers.length === 0 ? "BRAND INTEGRITY READY" : "BRAND INTEGRITY BLOCKED",
    source,
    live,
    blockers,
  };
}

export function formatBrandIntegrityReadiness(result) {
  const lines = [
    "Kozbeyli Konagi brand integrity readiness",
    `Decision: ${result.decision}`,
    `Source files scanned: ${result.source.scannedFiles}`,
    `Live origin: ${result.live.origin}`,
    `Live routes scanned: ${result.live.scannedRoutes}`,
  ];

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
  const result = await evaluateBrandIntegrityReadiness();
  console.log(json ? JSON.stringify(result, null, 2) : formatBrandIntegrityReadiness(result));
  process.exitCode = strict && result.decision !== "BRAND INTEGRITY READY" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
