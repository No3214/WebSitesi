import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function readBytes(relPath: string) {
  return fs.readFileSync(path.join(root, relPath));
}

function exists(relPath: string) {
  return fs.existsSync(path.join(root, relPath));
}

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(relPath);
    if (!/\.(ts|tsx)$/.test(entry.name)) return [];
    return [relPath];
  });
}

describe("production readiness contracts", () => {
  it("keeps source files free from embedded NUL bytes", () => {
    const filesWithNulBytes = listSourceFiles("src")
      .concat(listSourceFiles("tests"))
      .filter((file) => readBytes(file).includes(0));

    expect(filesWithNulBytes).toEqual([]);
  });

  it("keeps public new-tab exits hardened against opener access", () => {
    const weakAnchors: string[] = [];
    const weakWindowOpens: string[] = [];

    for (const file of listSourceFiles("src")) {
      const source = read(file);

      for (const match of source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
        const tag = match[0];
        const rel = tag.match(/rel="([^"]+)"/)?.[1] ?? "";
        const relTokens = new Set(rel.split(/\s+/).filter(Boolean));

        if (!relTokens.has("noopener") || !relTokens.has("noreferrer")) {
          weakAnchors.push(`${file}: ${tag.replace(/\s+/g, " ").trim()}`);
        }
      }

      for (const match of source.matchAll(/window\.open\([^;\n]+/g)) {
        const call = match[0];
        if (call.includes("\"_blank\"") && (!call.includes("noopener") || !call.includes("noreferrer"))) {
          weakWindowOpens.push(`${file}: ${call}`);
        }
      }
    }

    expect(weakAnchors).toEqual([]);
    expect(weakWindowOpens).toEqual([]);
  });

  it("keeps Meta Pixel on the documented env key", () => {
    const trackedFiles = [
      "src/components/tracking-scripts.tsx",
      ".env.example",
      "README.md",
    ];

    const combined = trackedFiles.map(read).join("\n");

    expect(combined).toContain("NEXT_PUBLIC_META_PIXEL_ID");
    expect(combined).not.toContain("NEXT_PUBLIC_FB_PIXEL_ID");
  });

  it("keeps local stress tests exposed as package scripts", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["test:monkey"]).toBe(
      "playwright test tests/monkey.spec.ts --reporter=line",
    );
    expect(packageJson.scripts?.["test:chaos"]).toBe(
      "playwright test tests/destructive-chaos.spec.ts --reporter=line",
    );
    expect(packageJson.scripts?.["test:stress"]).toBe("npm run test:monkey && npm run test:chaos");
  });

  it("keeps Vercel as the only deploy target in the repo root", () => {
    const readme = read("README.md");
    const audit = read("AUDIT.md");

    expect(exists("railway.json")).toBe(false);
    expect(readme).toContain("Birincil ve tek hedef **Vercel**");
    expect(readme).toContain("eski Railway hedefi");
    expect(readme).toContain("npm i -g vercel");
    expect(readme).toContain("npm run evidence:handoff");
    expect(readme).toContain("npm run evidence:templates");
    expect(audit).toContain("F9/T13 deploy hedefi");
    expect(audit).toContain("legacy Railway config kaldırıldı");
  });

  it("keeps core security, analytics and URL helpers under publish-time test coverage", () => {
    const readinessScript = read("scripts/publish-readiness.mjs");
    const requiredFiles = [
      "src/lib/security.ts",
      "src/lib/gtm.ts",
      "src/lib/logger.ts",
      "src/lib/ecc-auth.ts",
      "src/lib/utils.ts",
      "tests/security-utils.test.ts",
      "tests/security-es256.test.ts",
      "tests/gtm.test.ts",
      "tests/logger.test.ts",
      "tests/ecc-auth.test.ts",
      "tests/utils.test.ts",
    ];

    for (const file of requiredFiles) {
      expect(exists(file)).toBe(true);
      expect(readinessScript).toContain(`"${file}"`);
    }
  });

  it("keeps cookie banner policy copy readable in Turkish and English", () => {
    const cookieConsent = read("src/components/cookie-consent.tsx");
    const footer = read("src/components/site-footer.tsx");
    const legalRoutes = read("src/lib/legal-routes.ts");
    const publishRoutes = read("tests/e2e/publish-routes.spec.ts");

    expect(cookieConsent).toContain('policy: "Çerez Politikamızı"');
    expect(cookieConsent).toContain('suffix: " inceleyebilirsiniz."');
    expect(cookieConsent).toContain('policy: "Cookie Policy"');
    expect(cookieConsent).toContain('suffix: "."');
    expect(cookieConsent).toContain('getLegalHref("cookies", locale)');
    expect(cookieConsent).not.toContain("Politikamızıinceleyebilirsiniz");
    expect(cookieConsent).not.toContain("opacity: 0.8");
    expect(cookieConsent).toContain("CONSENT_OPEN_EVENT");
    expect(footer).toContain("CookiePreferencesButton");
    expect(footer).toContain("Cookie Preferences");
    expect(footer).toContain("Çerez Tercihleri");
    expect(footer).toContain('getLegalHref("cookies", "en")');
    expect(legalRoutes).toContain('return locale === "en" ? `/en${route}` : route');
    expect(publishRoutes).toContain('"/en/cerez-politikasi"');
  });

  it("keeps publish readiness aware of payment and stress gates", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const readinessScript = read("scripts/publish-readiness.mjs");
    const supabaseReadinessScript = read("scripts/supabase-security-readiness.mjs");

    expect(readinessScript).toContain('"IYZICO_WEBHOOK_SECRET"');
    expect(readinessScript).toContain('"GARANTI_3D_STORE_KEY"');
    expect(readinessScript).toContain('"NEXT_PUBLIC_GA4_MEASUREMENT_ID"');
    expect(readinessScript).toContain('"NEXT_PUBLIC_GOOGLE_ADS_ID"');
    expect(readinessScript).toContain('"quality"');
    expect(readinessScript).toContain('"test:e2e"');
    expect(readinessScript).toContain('"test:monkey"');
    expect(readinessScript).toContain('"test:chaos"');
    expect(readinessScript).toContain('"test:stress"');
    expect(readinessScript).toContain('"security:audit"');
    expect(readinessScript).toContain('"evidence:scan"');
    expect(readinessScript).toContain('"evidence:scan:json"');
    expect(readinessScript).toContain('"evidence:handoff"');
    expect(readinessScript).toContain('"evidence:handoff:json"');
    expect(readinessScript).toContain('"evidence:handoff:live"');
    expect(readinessScript).toContain('"evidence:handoff:live:json"');
    expect(readinessScript).toContain('"evidence:handoff:strict"');
    expect(readinessScript).toContain('"evidence:templates"');
    expect(readinessScript).toContain('"evidence:templates:json"');
    expect(readinessScript).toContain('"evidence:templates:live"');
    expect(readinessScript).toContain('"evidence:templates:live:json"');
    expect(readinessScript).toContain('"evidence:templates:live:compact"');
    expect(readinessScript).toContain('"evidence:templates:live:compact:json"');
    expect(readinessScript).toContain('"evidence:templates:live:runtime-ready"');
    expect(readinessScript).toContain('"evidence:templates:live:runtime-ready:json"');
    expect(readinessScript).toContain('"evidence:templates:live:write"');
    expect(readinessScript).toContain('"evidence:templates:live:write:json"');
    expect(readinessScript).toContain('"evidence:templates:live:write:compact"');
    expect(readinessScript).toContain('"evidence:templates:live:write:compact:json"');
    expect(readinessScript).toContain('"evidence:templates:live:write:runtime-ready"');
    expect(readinessScript).toContain('"evidence:templates:live:write:runtime-ready:json"');
    expect(readinessScript).toContain('"media:hero"');
    expect(readinessScript).toContain('"media:hero:json"');
    expect(readinessScript).toContain('"media:hero:strict"');
    expect(readinessScript).toContain('"media:playback"');
    expect(readinessScript).toContain('"media:playback:preview"');
    expect(readinessScript).toContain('"media:playback:live"');
    expect(readinessScript).toContain('"admin:verify"');
    expect(readinessScript).toContain('"admin:verify:json"');
    expect(readinessScript).toContain('"admin:verify:strict"');
    expect(readinessScript).toContain('"webhook:verify"');
    expect(readinessScript).toContain('"webhook:verify:json"');
    expect(readinessScript).toContain('"webhook:verify:strict"');
    expect(readinessScript).toContain('"abuse:verify"');
    expect(readinessScript).toContain('"abuse:verify:json"');
    expect(readinessScript).toContain('"abuse:verify:strict"');
    expect(readinessScript).toContain('"analytics:verify"');
    expect(readinessScript).toContain('"analytics:verify:json"');
    expect(readinessScript).toContain('"analytics:verify:strict"');
    expect(readinessScript).toContain('"search:verify"');
    expect(readinessScript).toContain('"search:verify:json"');
    expect(readinessScript).toContain('"search:verify:strict"');
    expect(readinessScript).toContain('"garanti:verify"');
    expect(readinessScript).toContain('"garanti:verify:json"');
    expect(readinessScript).toContain('"garanti:verify:strict"');
    expect(readinessScript).toContain('"supabase:verify"');
    expect(readinessScript).toContain('"supabase:verify:json"');
    expect(readinessScript).toContain('"supabase:verify:strict"');
    expect(readinessScript).toContain('"launch:audit"');
    expect(readinessScript).toContain('"launch:audit:json"');
    expect(readinessScript).toContain('"launch:audit:live"');
    expect(readinessScript).toContain('"launch:audit:live:json"');
    expect(readinessScript).toContain('"launch:audit:live:strict"');
    expect(readinessScript).toContain('"launch:audit:strict"');
    expect(readinessScript).toContain('"launch:standup"');
    expect(readinessScript).toContain('"launch:standup:json"');
    expect(readinessScript).toContain('"launch:standup:compact"');
    expect(readinessScript).toContain('"launch:standup:compact:json"');
    expect(readinessScript).toContain('"launch:standup:live"');
    expect(readinessScript).toContain('"launch:standup:live:json"');
    expect(readinessScript).toContain('"launch:standup:live:compact"');
    expect(readinessScript).toContain('"launch:standup:live:compact:json"');
    expect(readinessScript).toContain('"launch:standup:live:write"');
    expect(readinessScript).toContain('"launch:standup:live:write:json"');
    expect(readinessScript).toContain('"launch:standup:live:write:compact"');
    expect(readinessScript).toContain('"launch:standup:live:write:compact:json"');
    expect(readinessScript).toContain('"launch:standup:strict"');
    expect(readinessScript).toContain('"hms:verify"');
    expect(readinessScript).toContain('"hms:verify:json"');
    expect(readinessScript).toContain('"hms:verify:strict"');
    expect(readinessScript).toContain('"domain:verify"');
    expect(readinessScript).toContain('"domain:verify:json"');
    expect(readinessScript).toContain('"domain:verify:strict"');
    expect(readinessScript).toContain('"vercel:ops"');
    expect(readinessScript).toContain('"vercel:ops:json"');
    expect(readinessScript).toContain('"vercel:ops:strict"');
    expect(readinessScript).toContain('"vercel:env"');
    expect(readinessScript).toContain('"vercel:env:json"');
    expect(readinessScript).toContain('"vercel:env:strict"');
    expect(readinessScript).toContain('"vercel:env:values"');
    expect(readinessScript).toContain('"vercel:env:values:strict"');
    expect(readinessScript).toContain('"vercel:supabase:verify"');
    expect(readinessScript).toContain('"vercel:abuse:verify"');
    expect(readinessScript).toContain('"vercel:hms:verify"');
    expect(readinessScript).toContain('"vercel:garanti:verify"');
    expect(readinessScript).toContain('"vercel:analytics:verify"');
    expect(readinessScript).toContain('"vercel:search:verify"');
    expect(readinessScript).toContain('"vercel:commercial:verify"');
    expect(readinessScript).toContain('"vercel:commercial:verify:json"');
    expect(readinessScript).toContain('"github:ci"');
    expect(readinessScript).toContain('"github:ci:json"');
    expect(readinessScript).toContain('"github:ci:strict"');
    expect(readinessScript).toContain('"readiness:summary"');
    expect(readinessScript).toContain('"readiness:summary:json"');
    expect(readinessScript).toContain('"readiness:summary:strict"');
    expect(readinessScript).toContain('"live:verify"');
    expect(readinessScript).toContain('"live:verify:list"');
    expect(readinessScript).toContain('"launch:smoke"');
    expect(readinessScript).toContain('"launch:smoke:preview"');
    expect(readinessScript).toContain('"launch:smoke:live"');
    expect(readinessScript).toContain('"localization:verify"');
    expect(readinessScript).toContain('"localization:verify:preview"');
    expect(readinessScript).toContain('"localization:verify:live"');
    expect(readinessScript).toContain('"preview:verify"');
    expect(readinessScript).toContain('"preview:verify:json"');
    expect(readinessScript).toContain('"preview:verify:strict"');
    expect(readinessScript).toContain('"release:verify"');
    expect(readinessScript).toContain('"release:verify:commercial"');
    expect(packageJson.scripts?.["launch:smoke"]).toBe("node scripts/launch-smoke.mjs");
    expect(packageJson.scripts?.["launch:smoke:preview"]).toBe(
      "cross-env PW_BASE_URL=https://kozbeyli-konagi.vercel.app node scripts/launch-smoke.mjs",
    );
    expect(packageJson.scripts?.["launch:smoke:live"]).toBe(
      "cross-env PW_BASE_URL=https://www.kozbeylikonagi.com node scripts/launch-smoke.mjs",
    );
    expect(packageJson.scripts?.["localization:verify"]).toBe("node scripts/localization-readiness.mjs");
    expect(packageJson.scripts?.["localization:verify:preview"]).toBe(
      "cross-env PW_BASE_URL=https://kozbeyli-konagi.vercel.app node scripts/localization-readiness.mjs",
    );
    expect(packageJson.scripts?.["localization:verify:live"]).toBe(
      "cross-env PW_BASE_URL=https://www.kozbeylikonagi.com node scripts/localization-readiness.mjs",
    );
    expect(packageJson.scripts?.["preview:verify"]).toBe("node scripts/local-preview-verify.mjs");
    expect(packageJson.scripts?.["preview:verify:json"]).toBe(
      "node scripts/local-preview-verify.mjs --json",
    );
    expect(packageJson.scripts?.["preview:verify:strict"]).toBe(
      "node scripts/local-preview-verify.mjs --strict",
    );
    expect(packageJson.scripts?.["hms:verify"]).toBe("node scripts/hms-booking-readiness.mjs");
    expect(packageJson.scripts?.["hms:verify:json"]).toBe(
      "node scripts/hms-booking-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["hms:verify:strict"]).toBe(
      "node scripts/hms-booking-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["domain:verify"]).toBe("node scripts/domain-readiness.mjs");
    expect(packageJson.scripts?.["domain:verify:strict"]).toBe(
      "node scripts/domain-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["evidence:scan"]).toBe("node scripts/evidence-redaction-scan.mjs");
    expect(packageJson.scripts?.["evidence:scan:json"]).toBe(
      "node scripts/evidence-redaction-scan.mjs --json",
    );
    expect(packageJson.scripts?.["evidence:handoff"]).toBe("node scripts/evidence-handoff.mjs");
    expect(packageJson.scripts?.["evidence:handoff:json"]).toBe(
      "node scripts/evidence-handoff.mjs --json",
    );
    expect(packageJson.scripts?.["evidence:handoff:live"]).toBe(
      "node scripts/evidence-handoff.mjs --live-runtime",
    );
    expect(packageJson.scripts?.["evidence:handoff:live:json"]).toBe(
      "node scripts/evidence-handoff.mjs --json --live-runtime",
    );
    expect(packageJson.scripts?.["evidence:handoff:strict"]).toBe(
      "node scripts/evidence-handoff.mjs --strict",
    );
    expect(packageJson.scripts?.["evidence:templates"]).toBe("node scripts/evidence-template.mjs");
    expect(packageJson.scripts?.["evidence:templates:json"]).toBe(
      "node scripts/evidence-template.mjs --json",
    );
    expect(packageJson.scripts?.["evidence:templates:live"]).toBe(
      "node scripts/evidence-template.mjs --live-runtime",
    );
    expect(packageJson.scripts?.["evidence:templates:live:json"]).toBe(
      "node scripts/evidence-template.mjs --json --live-runtime",
    );
    expect(packageJson.scripts?.["evidence:templates:live:compact"]).toBe(
      "node scripts/evidence-template.mjs --live-runtime --compact",
    );
    expect(packageJson.scripts?.["evidence:templates:live:compact:json"]).toBe(
      "node scripts/evidence-template.mjs --json --live-runtime --compact",
    );
    expect(packageJson.scripts?.["evidence:templates:live:runtime-ready"]).toBe(
      "node scripts/evidence-template.mjs --live-runtime --runtime-ready-only --compact",
    );
    expect(packageJson.scripts?.["evidence:templates:live:runtime-ready:json"]).toBe(
      "node scripts/evidence-template.mjs --json --live-runtime --runtime-ready-only --compact",
    );
    expect(packageJson.scripts?.["evidence:templates:live:write"]).toBe(
      "node scripts/evidence-template.mjs --live-runtime --output .codex-artifacts/evidence-templates.md",
    );
    expect(packageJson.scripts?.["evidence:templates:live:write:json"]).toBe(
      "node scripts/evidence-template.mjs --json --live-runtime --output .codex-artifacts/evidence-templates.json",
    );
    expect(packageJson.scripts?.["evidence:templates:live:write:compact"]).toBe(
      "node scripts/evidence-template.mjs --live-runtime --compact --output .codex-artifacts/evidence-templates-compact.md",
    );
    expect(packageJson.scripts?.["evidence:templates:live:write:compact:json"]).toBe(
      "node scripts/evidence-template.mjs --json --live-runtime --compact --output .codex-artifacts/evidence-templates-compact.json",
    );
    expect(packageJson.scripts?.["evidence:templates:live:write:runtime-ready"]).toBe(
      "node scripts/evidence-template.mjs --live-runtime --runtime-ready-only --compact --output .codex-artifacts/evidence-templates-runtime-ready.md",
    );
    expect(packageJson.scripts?.["evidence:templates:live:write:runtime-ready:json"]).toBe(
      "node scripts/evidence-template.mjs --json --live-runtime --runtime-ready-only --compact --output .codex-artifacts/evidence-templates-runtime-ready.json",
    );
    expect(packageJson.scripts?.["media:hero"]).toBe("node scripts/hero-media-audit.mjs");
    expect(packageJson.scripts?.["media:hero:json"]).toBe(
      "node scripts/hero-media-audit.mjs --json",
    );
    expect(packageJson.scripts?.["media:hero:strict"]).toBe(
      "node scripts/hero-media-audit.mjs --strict",
    );
    expect(packageJson.scripts?.["media:playback"]).toBe("node scripts/media-playback-readiness.mjs");
    expect(packageJson.scripts?.["media:playback:preview"]).toBe(
      "cross-env PW_BASE_URL=https://kozbeyli-konagi.vercel.app node scripts/media-playback-readiness.mjs",
    );
    expect(packageJson.scripts?.["media:playback:live"]).toBe(
      "cross-env PW_BASE_URL=https://www.kozbeylikonagi.com node scripts/media-playback-readiness.mjs",
    );
    expect(packageJson.scripts?.["admin:verify"]).toBe("node scripts/admin-surface-readiness.mjs");
    expect(packageJson.scripts?.["admin:verify:json"]).toBe(
      "node scripts/admin-surface-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["admin:verify:strict"]).toBe(
      "node scripts/admin-surface-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["webhook:verify"]).toBe("node scripts/webhook-surface-readiness.mjs");
    expect(packageJson.scripts?.["webhook:verify:json"]).toBe(
      "node scripts/webhook-surface-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["webhook:verify:strict"]).toBe(
      "node scripts/webhook-surface-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["abuse:verify"]).toBe("node scripts/abuse-controls-readiness.mjs");
    expect(packageJson.scripts?.["abuse:verify:json"]).toBe(
      "node scripts/abuse-controls-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["abuse:verify:strict"]).toBe(
      "node scripts/abuse-controls-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["analytics:verify"]).toBe("node scripts/analytics-readiness.mjs");
    expect(packageJson.scripts?.["analytics:verify:json"]).toBe(
      "node scripts/analytics-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["analytics:verify:strict"]).toBe(
      "node scripts/analytics-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["search:verify"]).toBe("node scripts/search-local-seo-readiness.mjs");
    expect(packageJson.scripts?.["search:verify:json"]).toBe(
      "node scripts/search-local-seo-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["search:verify:strict"]).toBe(
      "node scripts/search-local-seo-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["garanti:verify"]).toBe("node scripts/garanti-pos-readiness.mjs");
    expect(packageJson.scripts?.["garanti:verify:json"]).toBe(
      "node scripts/garanti-pos-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["garanti:verify:strict"]).toBe(
      "node scripts/garanti-pos-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["supabase:verify"]).toBe(
      "node scripts/supabase-security-readiness.mjs",
    );
    expect(packageJson.scripts?.["supabase:verify:json"]).toBe(
      "node scripts/supabase-security-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["supabase:verify:strict"]).toBe(
      "node scripts/supabase-security-readiness.mjs --strict",
    );
    expect(supabaseReadinessScript).toContain("loadEnvFileSnapshot");
    expect(supabaseReadinessScript).toContain("loadProcessEnvSnapshot");
    expect(supabaseReadinessScript).toContain("parseEnvFile");
    expect(supabaseReadinessScript).toContain('"--env-file"');
    expect(supabaseReadinessScript).toContain('"--from-process-env"');
    expect(supabaseReadinessScript).not.toContain("SUPABASE_SERVICE_ROLE_KEY=");
    expect(packageJson.scripts?.["vercel:ops"]).toBe("node scripts/vercel-ops-readiness.mjs");
    expect(packageJson.scripts?.["vercel:ops:json"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["vercel:ops:strict"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:env"]).toBe("node scripts/vercel-env-readiness.mjs");
    expect(packageJson.scripts?.["vercel:env:json"]).toBe(
      "node scripts/vercel-env-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["vercel:env:strict"]).toBe(
      "node scripts/vercel-env-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["github:ci"]).toBe("node scripts/github-ci-readiness.mjs");
    expect(packageJson.scripts?.["github:ci:json"]).toBe(
      "node scripts/github-ci-readiness.mjs --json",
    );
    expect(packageJson.scripts?.["github:ci:strict"]).toBe(
      "node scripts/github-ci-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["readiness:summary"]).toBe("node scripts/readiness-summary.mjs");
    expect(packageJson.scripts?.["readiness:summary:json"]).toBe(
      "node scripts/readiness-summary.mjs --json",
    );
    expect(packageJson.scripts?.["readiness:summary:strict"]).toBe(
      "node scripts/readiness-summary.mjs --strict",
    );
    expect(packageJson.scripts?.["live:verify"]).toBe("node scripts/live-production-verify.mjs");
    expect(packageJson.scripts?.["live:verify:list"]).toBe(
      "node scripts/live-production-verify.mjs --list",
    );
    const readinessSummary = read("scripts/readiness-summary.mjs");
    expect(readinessSummary).toContain("collectReadinessSummary");
    expect(readinessSummary).toContain("evaluateDomainReadiness");
    expect(readinessSummary).toContain("evaluateCommercialLaunch");
    expect(readinessSummary).toContain("collectGithubCiReadiness");
    expect(readinessSummary).toContain("evaluateVercelOpsReadiness");
    expect(readinessSummary).toContain("evaluateAdminSurfaceReadiness");
    expect(readinessSummary).toContain("PUBLIC SITE LIVE; FULL COMMERCIAL LAUNCH BLOCKED");
    expect(readinessSummary).toContain("GITHUB CI ACCOUNT BLOCKED");
    expect(readinessSummary).toContain("openingHeroVideo");
    const githubCi = read("scripts/github-ci-readiness.mjs");
    const githubCiRunbook = read("docs/github-actions-readiness.md");
    expect(githubCi).toContain("GITHUB CI STALE");
    expect(githubCi).toContain("expectedHeadSha");
    expect(githubCi).toContain("--expected-head-sha");
    expect(githubCi).toContain("Do not treat a green CI run on an older commit as release evidence");
    expect(githubCiRunbook).toContain("latest run's `headSha`");
    expect(githubCiRunbook).toContain("GITHUB CI STALE");
    expect(packageJson.scripts?.typecheck).toBe("tsc --noEmit --incremental false");
    expect(packageJson.scripts?.quality).toBe("npm run lint && npm run typecheck && npm run test:unit && npm run build");
    expect(packageJson.scripts?.["test:e2e"]).toBe("playwright test");
    expect(packageJson.scripts?.["security:audit"]).toBe("npm audit --omit=dev --audit-level=high");
    expect(packageJson.scripts?.prebuild).toBe("node scripts/clean-next-build.mjs");
    expect(packageJson.scripts?.["release:verify"]).toBe("node scripts/release-verify.mjs");
    expect(packageJson.scripts?.["release:verify:commercial"]).toBe(
      "node scripts/release-verify.mjs --commercial-strict",
    );
    expect(readinessScript).toContain('"scripts/clean-next-build.mjs"');
    expect(readinessScript).toContain('"scripts/live-production-verify.mjs"');
    expect(readinessScript).toContain('"src/app/api/health/route.ts"');
    expect(readinessScript).toContain('"src/lib/production-readiness.ts"');
    expect(readinessScript).toContain('"src/lib/webhook-body-limit.ts"');
    expect(readinessScript).toContain('"tests/agentic-helper-safety.test.ts"');
    expect(readinessScript).toContain('"tests/abuse-controls-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/analytics-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/garanti-pos-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/admin-surface-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/webhook-body-limit.test.ts"');
    expect(readinessScript).toContain('"tests/webhook-surface-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/search-local-seo-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/vercel-ops-readiness.test.ts"');
    expect(readinessScript).toContain('"tests/e2e/health.spec.ts"');
    expect(readinessScript).toContain('"tests/production-readiness.test.ts"');
    expect(readinessScript).toContain('"docs/evidence/README.md"');
    expect(readinessScript).toContain('"docs/github-actions-readiness.md"');
    expect(readinessScript).toContain('"docs/vercel-operations.md"');
    expect(readinessScript).toContain('"scripts/evidence-handoff.mjs"');
    expect(readinessScript).toContain('"scripts/vercel-env-operator-guidance.mjs"');
    expect(readinessScript).toContain('"scripts/evidence-template.mjs"');
    expect(readinessScript).toContain('"scripts/evidence-redaction-scan.mjs"');
    expect(readinessScript).toContain('"scripts/safe-report-output.mjs"');
    expect(readinessScript).toContain('"scripts/hero-media-audit.mjs"');
    expect(readinessScript).toContain('"scripts/admin-surface-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/webhook-surface-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/abuse-controls-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/analytics-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/garanti-pos-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/search-local-seo-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/hms-booking-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/vercel-ops-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/vercel-env-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/github-ci-readiness.mjs"');
    expect(readinessScript).toContain('"scripts/local-preview-verify.mjs"');
    expect(readinessScript).toContain('"scripts/live-production-verify.mjs"');
    expect(readinessScript).toContain('"scripts/readiness-summary.mjs"');
    expect(readinessScript).toContain("evaluateCommercialLaunch");
    expect(readinessScript).toContain("commercial launch progress notes");
    expect(readinessScript).toContain("live validation lane");
  });

  it("keeps local preview verification browser-free and guarded against cross-project content", () => {
    const localPreview = read("scripts/local-preview-verify.mjs");

    expect(localPreview).toContain("LOCAL PREVIEW BLOCKED");
    expect(localPreview).toContain("kozbeyli-konagi");
    expect(localPreview).toContain("/videos/hero.mp4");
    expect(localPreview).toContain("Ela");
    expect(localPreview).toContain("Ebe");
    expect(localPreview).toContain("fetchWithTimeout");
    expect(localPreview).not.toContain("Start-Process");
    expect(localPreview).not.toContain("playwright");
    expect(localPreview).not.toContain("page.goto");
  });

  it("keeps live production verification focused on public live gates", () => {
    const liveVerify = read("scripts/live-production-verify.mjs");

    for (const gate of [
      "domain:verify:strict",
      "launch:smoke:live",
      "localization:verify:live",
      "media:playback:live",
      "readiness:summary:json",
      "github:ci:json",
    ]) {
      expect(liveVerify).toContain(`script: "${gate}"`);
    }

    expect(liveVerify).toContain("Kozbeyli Konagi live production verification");
    expect(liveVerify).toContain("Kozbeyli Konagi live production verification summary");
    expect(liveVerify).toContain("required: true");
    expect(liveVerify).toContain("required: false");
    expect(liveVerify).toContain("Readiness summary and GitHub CI are diagnostic");
    expect(liveVerify).toContain("if (result.status !== 0 && gate.required)");
  });

  it("keeps release verification orchestrating the full local release gate", () => {
    const releaseScript = read("scripts/release-verify.mjs");
    const ciWorkflow = read(".github/workflows/ci.yml");

    for (const gate of [
      "security:audit",
      "evidence:scan",
      "evidence:handoff:json",
      "evidence:templates:json",
      "evidence:templates:live:runtime-ready:json",
      "media:hero:json",
      "admin:verify:json",
      "webhook:verify:json",
      "abuse:verify:json",
      "analytics:verify:json",
      "search:verify:json",
      "garanti:verify:json",
      "supabase:verify:json",
      "hms:verify:json",
      "domain:verify:json",
      "vercel:ops:json",
      "vercel:env:json",
      "github:ci:json",
      "readiness:summary:json",
      "publish:verify",
      "launch:smoke",
      "test:stress",
      "launch:audit:json",
    ]) {
      expect(releaseScript).toContain(`script: "${gate}"`);
    }

    expect(releaseScript).toContain("--list");
    expect(releaseScript).toContain("--commercial-strict");
    expect(releaseScript).toContain("buildReleaseGates");
    expect(releaseScript).toContain("commercialStrictGateOverrides");
    expect(releaseScript).toContain("Commercial evidence redaction scan");
    expect(releaseScript).toContain("Commercial evidence handoff manifest");
    expect(releaseScript).toContain("Commercial evidence template manifest");
    expect(releaseScript).toContain("Runtime-ready evidence template manifest");
    expect(releaseScript).toContain("Production readiness summary");
    expect(releaseScript).toContain("Admin-only growth dashboard access diagnosis");
    expect(releaseScript).toContain("Webhook signature, replay and body-limit diagnosis");
    expect(releaseScript).toContain("Production abuse-control readiness diagnosis");
    expect(releaseScript).toContain("Analytics purchase readiness diagnosis");
    expect(releaseScript).toContain("Search and local SEO readiness diagnosis");
    expect(releaseScript).toContain("Garanti POS readiness diagnosis");
    expect(releaseScript).toContain("Supabase/Payload database security diagnosis");
    expect(releaseScript).toContain("HMS booking target readiness diagnosis");
    expect(releaseScript).toContain("Canonical domain readiness diagnosis");
    expect(releaseScript).toContain("Vercel project and CLI operations diagnosis");
    expect(releaseScript).toContain("Vercel production env inventory diagnosis");
    expect(releaseScript).toContain("GitHub Actions CI readiness diagnosis");
    expect(releaseScript).toContain("domain/HMS/Vercel diagnostics");
    expect(releaseScript).toContain("process.env.ComSpec");
    expect(releaseScript).toContain("launch:audit:live:strict");
    expect(releaseScript).toContain("launch:cutover:strict");
    expect(releaseScript).toContain("vercel:env:values:strict");
    expect(releaseScript).toContain("vercel:commercial:verify");
    expect(releaseScript).toContain("vercel:supabase:verify");
    expect(releaseScript).toContain("vercel:hms:verify");
    expect(releaseScript).toContain("vercel:garanti:verify");
    expect(releaseScript).toContain("vercel:analytics:verify");
    expect(releaseScript).toContain("vercel:search:verify");
    expect(releaseScript).toContain("export const gates = buildReleaseGates();");
    expect(ciWorkflow).toContain("Release gate manifest");
    expect(ciWorkflow).toContain("node scripts/release-verify.mjs --list");
    expect(ciWorkflow).toContain("Evidence redaction scan");
    expect(ciWorkflow).toContain("npm run evidence:scan");
    expect(ciWorkflow).toContain("Hero media audit");
    expect(ciWorkflow).toContain("npm run media:hero:json");
    expect(ciWorkflow).toContain("Admin surface diagnosis");
    expect(ciWorkflow).toContain("npm run admin:verify:json");
    expect(ciWorkflow).toContain("Webhook surface diagnosis");
    expect(ciWorkflow).toContain("npm run webhook:verify:json");
    expect(ciWorkflow).toContain("Commercial readiness diagnostics");
    for (const diagnostic of [
      "abuse:verify:json",
      "analytics:verify:json",
      "search:verify:json",
      "garanti:verify:json",
      "supabase:verify:json",
      "hms:verify:json",
      "domain:verify:json",
    ]) {
      expect(ciWorkflow).toContain(`npm run ${diagnostic}`);
    }
    expect(ciWorkflow).toContain("Stress tests");
    expect(ciWorkflow).toContain("npm run test:stress");
    expect(ciWorkflow).toContain("Commercial launch audit and cutover plan");
    expect(ciWorkflow).toContain("npm run readiness:summary:json");
    expect(ciWorkflow).toContain("npm run launch:audit:json");
    expect(ciWorkflow).toContain("npm run launch:cutover:json");
    expect(ciWorkflow).toContain("npm run evidence:templates:live:runtime-ready:json");
  });

  it("keeps the commercial launch audit executable and evidence-based", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const auditScript = read("scripts/commercial-launch-audit.mjs");
    const evidenceHandoff = read("scripts/evidence-handoff.mjs");
    const evidenceReadme = read("docs/evidence/README.md");

    expect(packageJson.scripts?.["launch:audit"]).toBe(
      "node scripts/commercial-launch-audit.mjs",
    );
    expect(packageJson.scripts?.["launch:audit:json"]).toBe(
      "node scripts/commercial-launch-audit.mjs --json",
    );
    expect(packageJson.scripts?.["launch:audit:live"]).toBe(
      "node scripts/commercial-launch-audit.mjs --runtime-health-url https://www.kozbeylikonagi.com/api/health",
    );
    expect(packageJson.scripts?.["launch:audit:live:json"]).toBe(
      "node scripts/commercial-launch-audit.mjs --json --runtime-health-url https://www.kozbeylikonagi.com/api/health",
    );
    expect(packageJson.scripts?.["launch:audit:live:strict"]).toBe(
      "node scripts/commercial-launch-audit.mjs --strict --runtime-health-url https://www.kozbeylikonagi.com/api/health",
    );
    expect(packageJson.scripts?.["launch:audit:strict"]).toBe(
      "node scripts/commercial-launch-audit.mjs --strict",
    );
    expect(auditScript).toContain("--json");
    expect(auditScript).toContain("--runtime-health-url");
    expect(auditScript).toContain("runtime lane:");
    expect(auditScript).toContain("NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL");
    expect(auditScript).toContain("OFFICIAL_HMS_BOOKING_ENGINE_URL");
    expect(auditScript).toContain("HMS booking engine handoff and booking UAT evidence");
    expect(auditScript).toContain("code_fallback");
    expect(auditScript).toContain("^https://");
    expect(auditScript).toContain("source_refs");
    expect(auditScript).toContain("missing source refs");
    expect(auditScript).toContain("unsafe source refs");
    expect(auditScript).toContain("example source refs");
    expect(auditScript).toContain("exampleSourceRefs");
    expect(auditScript).toContain("future evidence date");
    expect(auditScript).toContain("stale evidence date");
    expect(auditScript).toContain("scanEvidenceSource");
    expect(auditScript).toContain("redaction findings");
    expect(auditScript).toContain("process.exitCode");
    expect(auditScript).not.toContain("process.exit(strict");
    expect(evidenceReadme).toContain("source_refs:");
    expect(evidenceReadme).toContain("Ready evidence must include redacted source-system references");
    expect(evidenceReadme).toContain("raw URLs");
    expect(evidenceReadme).toContain("OPS-1234");
    expect(evidenceReadme).toContain("format examples only");
    expect(evidenceReadme).toContain("uses the exact template examples");
    expect(evidenceReadme).toContain("more than 45 days old");
    expect(evidenceHandoff).toContain("previous 45 days");
    expect(evidenceHandoff).toContain("format examples only");

    const pendingEvidence = [
      "hms-booking-engine.md",
      "production-abuse-controls.md",
      "garanti-pos.md",
      "analytics-purchase.md",
      "search-local-seo.md",
      "legal-dpa.md",
    ];

    for (const gate of ["canonical-domain.md", ...pendingEvidence]) {
      expect(auditScript).toContain(gate);
      expect(evidenceReadme).toContain(gate);
      const evidenceFile = read(`docs/evidence/${gate}`);
      expect(evidenceFile.length, `${gate} should be a real evidence template`).toBeGreaterThan(300);
      if (gate === "canonical-domain.md") {
        expect(evidenceFile, `${gate} must be marked ready only with source-system proof`).toMatch(
          /status:\s*ready/i,
        );
        expect(evidenceFile).toMatch(/^source_refs:\s*\S+/im);
      } else {
        expect(evidenceFile, `${gate} must not be marked ready without source-system proof`).toMatch(
          /status:\s*pending/i,
        );
      }
      expect(evidenceFile).toContain("## Residual Risk");
    }
  });

  it("keeps production abuse-control verification source-bound and evidence-gated", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const abuseReadiness = read("scripts/abuse-controls-readiness.mjs");
    const leadRoute = read("src/app/api/lead/route.ts");
    const leadForm = read("src/components/lead-form.tsx");
    const trackingScripts = read("src/components/tracking-scripts.tsx");

    expect(packageJson.scripts?.["abuse:verify:strict"]).toBe(
      "node scripts/abuse-controls-readiness.mjs --strict",
    );
    expect(abuseReadiness).toContain("PRODUCTION ABUSE CONTROLS BLOCKED");
    expect(abuseReadiness).toContain("production_abuse_controls");
    expect(abuseReadiness).toContain("docs/evidence/production-abuse-controls.md");
    expect(abuseReadiness).toContain("UPSTASH_REDIS_REST_URL must use HTTPS");
    expect(abuseReadiness).toContain("legacy_lead_service_removed");
    expect(abuseReadiness).toContain("legacy_booking_service_removed");
    expect(abuseReadiness).toContain("loadEnvFileSnapshot");
    expect(abuseReadiness).toContain("loadProcessEnvSnapshot");
    expect(abuseReadiness).toContain("parseEnvFile");
    expect(abuseReadiness).toContain('"--env-file"');
    expect(abuseReadiness).toContain('"--from-process-env"');
    expect(abuseReadiness).not.toContain("TURNSTILE_SECRET_KEY=");
    expect(abuseReadiness).not.toContain("UPSTASH_REDIS_REST_TOKEN=");
    expect(abuseReadiness).toContain("process.exitCode");
    expect(abuseReadiness).not.toContain("process.exit(strict");
    expect(leadRoute).toContain("env.TURNSTILE_SECRET_KEY");
    expect(leadRoute).toContain("if (!token) return false");
    expect(exists("src/services/lead.ts")).toBe(false);
    expect(exists("src/services/booking.ts")).toBe(false);
    expect(leadForm).toContain("cf-turnstile");
    expect(leadForm).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    expect(trackingScripts).toContain("https://challenges.cloudflare.com/turnstile/v0/api.js");
  });

  it("keeps analytics purchase verification consent-bound and evidence-gated", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const analyticsReadiness = read("scripts/analytics-readiness.mjs");
    const layout = read("src/app/layout.tsx");
    const trackingScripts = read("src/components/tracking-scripts.tsx");
    const gtm = read("src/lib/gtm.ts");
    const ga4Server = read("src/lib/ga4-server.ts");
    const hotelrunnerWebhook = read("src/app/api/webhook/hotelrunner/route.ts");
    const iyzicoWebhook = read("src/app/api/webhook/iyzico/route.ts");
    const publicEnv = read("src/lib/public-env.ts");

    expect(packageJson.scripts?.["analytics:verify:strict"]).toBe(
      "node scripts/analytics-readiness.mjs --strict",
    );
    expect(analyticsReadiness).toContain("ANALYTICS PURCHASE TRACKING BLOCKED");
    expect(analyticsReadiness).toContain("analytics_purchase");
    expect(analyticsReadiness).toContain("docs/evidence/analytics-purchase.md");
    expect(analyticsReadiness).toContain("NEXT_PUBLIC_GTM_ID must look like GTM-XXXX");
    expect(analyticsReadiness).toContain("NEXT_PUBLIC_META_PIXEL_ID must be the numeric Meta Pixel ID");
    expect(analyticsReadiness).toContain("GA4_MEASUREMENT_ID must look like G-XXXX");
    expect(analyticsReadiness).toContain("NEXT_PUBLIC_GA4_MEASUREMENT_ID must look like G-XXXX");
    expect(analyticsReadiness).toContain("NEXT_PUBLIC_GOOGLE_ADS_ID must look like AW-XXXXXXXXX");
    expect(analyticsReadiness).toContain("direct_google_tag_fallback");
    expect(analyticsReadiness).toContain("iyzico_purchase_hook");
    expect(analyticsReadiness).toContain("meta_legacy_key_removed");
    expect(analyticsReadiness).toContain("loadEnvFileSnapshot");
    expect(analyticsReadiness).toContain("loadProcessEnvSnapshot");
    expect(analyticsReadiness).toContain("parseEnvFile");
    expect(analyticsReadiness).toContain('"--env-file"');
    expect(analyticsReadiness).toContain('"--from-process-env"');
    expect(analyticsReadiness).not.toContain("GA4_API_SECRET=");
    expect(analyticsReadiness).toContain("process.exitCode");
    expect(analyticsReadiness).not.toContain("process.exit(strict");
    expect(layout).toContain("<TrackingScripts />");
    expect(trackingScripts).toContain("consent.analytics && publicEnv.NEXT_PUBLIC_GTM_ID");
    expect(trackingScripts).toContain("shouldLoadDirectGoogleTag");
    expect(trackingScripts).toContain("!publicEnv.NEXT_PUBLIC_GTM_ID");
    expect(trackingScripts).toContain("NEXT_PUBLIC_GA4_MEASUREMENT_ID");
    expect(trackingScripts).toContain("NEXT_PUBLIC_GOOGLE_ADS_ID");
    expect(trackingScripts).toContain("direct-google-tag");
    expect(trackingScripts).toContain("consent.marketing && publicEnv.NEXT_PUBLIC_META_PIXEL_ID");
    expect(gtm).toContain("window.gtag");
    expect(gtm).toContain('window.gtag("event", event, params)');
    expect(trackingScripts).toContain("https://challenges.cloudflare.com/turnstile/v0/api.js");
    expect(gtm).toContain("trackViewItem");
    expect(gtm).toContain("trackBeginCheckout");
    expect(gtm).toContain("trackGenerateLead");
    expect(ga4Server).toContain("sendGa4Purchase");
    expect(ga4Server).toContain("https://www.google-analytics.com/mp/collect");
    expect(hotelrunnerWebhook).toContain("sendGa4Purchase");
    expect(hotelrunnerWebhook).toContain("if (!isCancelled)");
    expect(iyzicoWebhook).toContain("sendGa4Purchase");
    expect(iyzicoWebhook).toContain("reservationFound && paymentSucceeded");
    expect(iyzicoWebhook).toContain("transactionId: bookingId");
    expect(iyzicoWebhook).toContain('itemName: "Konaklama Rezervasyonu"');
    expect(hotelrunnerWebhook).toContain("return notFound();");
    expect(hotelrunnerWebhook).not.toContain('status: "active"');
    expect(publicEnv).not.toContain("GA4_API_SECRET");
  });

  it("keeps search and local SEO verification source-bound and truthfulness-gated", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const searchReadiness = read("scripts/search-local-seo-readiness.mjs");
    const metadata = read("src/lib/metadata.ts");
    const envSource = read("src/lib/env.ts");
    const sitemap = read("src/app/sitemap.ts");
    const robots = read("src/app/robots.ts");
    const schema = read("src/lib/schema.ts");
    const operationalPolicies = read("src/data/operational-policies.ts");
    const locationContent = read("src/components/location-page-content.tsx");
    const evidence = read("docs/evidence/search-local-seo.md");

    expect(packageJson.scripts?.["search:verify:strict"]).toBe(
      "node scripts/search-local-seo-readiness.mjs --strict",
    );
    expect(searchReadiness).toContain("SEARCH LOCAL SEO BLOCKED");
    expect(searchReadiness).toContain("search_local_seo");
    expect(searchReadiness).toContain("docs/evidence/search-local-seo.md");
    expect(searchReadiness).toContain("GOOGLE_SITE_VERIFICATION must be the raw Search Console token");
    expect(searchReadiness).toContain("structured_data_truthfulness");
    expect(searchReadiness).toContain("process.exitCode");
    expect(searchReadiness).not.toContain("process.exit(strict");
    expect(metadata).toContain("env.GOOGLE_SITE_VERIFICATION");
    expect(metadata).toContain("{ google: env.GOOGLE_SITE_VERIFICATION }");
    expect(envSource).toContain("GOOGLE_SITE_VERIFICATION");
    expect(sitemap).toContain("alternates");
    expect(sitemap).toContain("'/lokasyon'");
    expect(sitemap).toContain("'/deneyimler/foca-gezi-rehberi'");
    expect(robots).toContain("sitemap: `${siteUrl}/sitemap.xml`");
    expect(schema).toContain('"@type": ["Hotel", "LodgingBusiness", "Restaurant"]');
    expect(schema).toContain('"@type": "PostalAddress"');
    expect(schema).toContain('"@type": "GeoCoordinates"');
    expect(schema).toContain("Açık otopark alanı ve varış yönlendirmesi");
    expect(schema).toContain("operationalPolicies.tr.pets");
    expect(operationalPolicies).toContain("rezervasyon öncesinde yazılı teyit gerekir");
    expect(schema).not.toContain("Evcil Hayvan Dostu");
    expect(schema).not.toContain("Ücretsiz Otopark");
    expect(schema).not.toContain("starRating");
    expect(schema).not.toContain("aggregateRating");
    expect(schema).not.toContain("review:");
    expect(schema).not.toContain("award:");
    expect(locationContent).toContain('"@type": "LodgingBusiness"');
    expect(locationContent).toContain('"@type": "BreadcrumbList"');
    expect(evidence).toContain("Google Business Profile");
    expect(evidence).toContain("Hotel Center");
    expect(evidence).toContain("npm run search:verify");
  });

  it("keeps Garanti POS verification card-data-free and evidence-gated", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const garantiReadiness = read("scripts/garanti-pos-readiness.mjs");
    const checkoutRoute = read("src/app/api/checkout/route.ts");
    const paymentInfoPage = read("src/app/odeme/page.tsx");
    const wizardHook = read("src/components/payment-wizard/use-payment-wizard.ts");
    const paymentStep = read("src/components/payment-wizard/steps/payment-step.tsx");
    const sensoryStep = read("src/components/payment-wizard/steps/sensory-step.tsx");
    const wizardTypes = read("src/components/payment-wizard/types.ts");
    const checkoutContract = read("tests/e2e/checkout-contract.spec.ts");
    const evidence = read("docs/evidence/garanti-pos.md");
    const paymentDecision = read("docs/odeme-karari.md");
    const paymentUiSource = [wizardHook, paymentStep, wizardTypes].join("\n");

    expect(packageJson.scripts?.["garanti:verify:strict"]).toBe(
      "node scripts/garanti-pos-readiness.mjs --strict",
    );
    expect(garantiReadiness).toContain("GARANTI POS READINESS BLOCKED");
    expect(garantiReadiness).toContain("garanti_pos");
    expect(garantiReadiness).toContain("docs/evidence/garanti-pos.md");
    expect(garantiReadiness).toContain("GARANTI_POS_MODE must be one of");
    expect(garantiReadiness).toContain("checkout_route_card_data_rejected");
    expect(garantiReadiness).toContain("wizard_collects_no_card_data");
    expect(garantiReadiness).toContain("process.exitCode");
    expect(garantiReadiness).not.toContain("process.exit(strict");
    expect(checkoutRoute).toContain("}).strict();");
    expect(checkoutRoute).toContain("forbiddenPaymentFields");
    expect(checkoutRoute).toContain("checkout.card_data_rejected");
    expect(checkoutRoute).toContain("validateSameOrigin");
    expect(checkoutRoute).toContain("enforceRateLimit");
    expect(checkoutRoute).toContain("calculateBookingQuote");
    expect(checkoutRoute).toContain("Tahsilat bu route'ta YAPILMAZ");
    expect(checkoutRoute).toContain("Garanti BBVA Sanal POS 3D Secure");
    expect(checkoutRoute).not.toContain("cardNumber:");
    expect(checkoutRoute).not.toContain("cvv:");
    expect(paymentInfoPage).toContain("Güvenli Ödeme Bilgilendirmesi");
    expect(paymentInfoPage).toContain("Kart verisi bu sitede alınmaz");
    expect(paymentInfoPage).toContain("ön-rezervasyon ve teyit sürecini başlatır");
    expect(paymentInfoPage).toContain("ödeme başlatmaz");
    expect(paymentInfoPage).toContain("Ön-Rezervasyon Talebi Oluştur");
    expect(paymentInfoPage).not.toContain("Ödeme Simülasyonu");
    expect(paymentInfoPage).not.toContain("Demo");
    expect(paymentInfoPage).not.toContain("demonstrasyon");
    expect(paymentUiSource).toContain("Kart state'i YOK");
    expect(paymentUiSource).toContain("Kart alanlari KASITLI olarak yok");
    expect(paymentUiSource).toContain("We do not ask for card details here");
    expect(wizardTypes).toContain("Talep Bilgileri");
    expect(wizardTypes).toContain("Misafir & İletişim Bilgileri");
    expect(wizardTypes).toContain("Teyit Sonrası Netleşecek Tutar");
    expect(wizardTypes).toContain("HMS / ekip teyidi");
    expect(wizardTypes).toContain("Guest and Contact Details");
    expect(wizardTypes).toContain("Amount Confirmed After Review");
    expect(wizardTypes).toContain("HMS / team confirmation");
    expect(wizardTypes).not.toContain("Ödeme ve Fatura");
    expect(wizardTypes).not.toContain("Misafir & Fatura Bilgileri");
    expect(wizardTypes).not.toContain("Tahsil Edilen Tutar");
    expect(wizardTypes).not.toContain("Payment and Billing");
    expect(wizardTypes).not.toContain("Guest and Billing Details");
    expect(wizardTypes).not.toContain("Amount Collected");
    expect(paymentStep).not.toContain('type="password"');
    for (const field of ["guest-name", "guest-phone", "guest-email"]) {
      expect(paymentStep).toContain(`htmlFor={fieldId("${field}")}`);
      expect(paymentStep).toContain(`id={fieldId("${field}")}`);
    }
    expect(paymentStep).toContain('autoComplete="name"');
    expect(paymentStep).toContain('autoComplete="tel"');
    expect(paymentStep).toContain('autoComplete="email"');
    expect(paymentStep).toContain('<span aria-hidden="true">🌸</span>');
    expect(paymentStep).toContain('<span aria-hidden="true">💡</span>');
    for (const field of ["scent", "pillow", "sound", "light"]) {
      expect(sensoryStep).toContain(`htmlFor={fieldId("${field}")}`);
      expect(sensoryStep).toContain(`id={fieldId("${field}")}`);
    }
    expect(checkoutContract).toContain("Kart alanı gönderilirse 400 ile reddedilir");
    expect(checkoutContract).toContain("cardNumber");
    expect(evidence).toContain("npm run garanti:verify");
    expect(evidence).toContain("Do not paste raw credentials, card numbers");
    expect(evidence).toContain("bank account details");
    expect(evidence).toContain("customer PII");
    expect(paymentDecision).toContain("kart bilgisi ASLA istemez");
    expect(paymentDecision).toContain("Garanti BBVA Sanal POS'un 3D Secure");
    expect(paymentDecision).toContain("SAQ-A");
  });

  it("keeps the HMS booking engine as a new-tab handoff instead of a cramped iframe", () => {
    const bookingEmbed = read("src/components/hms-booking-embed.tsx");
    const bookingUrlHelper = read("src/lib/booking-engine-url.ts");
    const siteHeader = read("src/components/site-header.tsx");
    const mobileActionBar = read("src/components/mobile-action-bar.tsx");
    const homeHero = read("src/components/home/home-hero.tsx");
    const finalCta = read("src/components/home/final-cta.tsx");
    const roomsClient = read("src/components/rooms-client.tsx");
    const roomDetail = read("src/components/room-detail-client.tsx");
    const faqPageContent = read("src/components/faq-page-content.tsx");
    const envExample = read(".env.example");
    const hmsReadiness = read("scripts/hms-booking-readiness.mjs");
    const primaryBookingCtas = [
      siteHeader,
      mobileActionBar,
      homeHero,
      finalCta,
      roomsClient,
      roomDetail,
      faqPageContent,
    ];

    expect(bookingEmbed).toContain("getConfiguredBookingEngineHref");
    expect(bookingEmbed).toContain("bookingHref");
    expect(bookingEmbed).toContain('target="_blank"');
    expect(bookingEmbed).toContain('rel="noopener noreferrer"');
    expect(bookingEmbed).toContain("Rezervasyon");
    expect(bookingEmbed).not.toContain("Rezervasyon Ekranı Ayrı Sekmede");
    expect(bookingEmbed).not.toContain("Rezervasyonu Ayrı Sekmede Aç");
    expect(bookingEmbed).toContain("Booking");
    expect(bookingEmbed).toContain("Resmi HMS ekranı yeni sekmede açılır");
    expect(bookingEmbed).toContain("Kart bilgisi bu sitede saklanmaz");
    expect(bookingEmbed).toContain("Official HMS screen opens in a new tab");
    expect(bookingEmbed).toContain("Card details are not stored on this site");
    expect(read("src/app/globals.css")).toContain(".booking-handoff-trust");
    expect(roomDetail).toContain("Resmi HMS rezervasyon ekranı");
    expect(roomDetail).toContain("Kart bilgisi bu sitede saklanmaz");
    expect(bookingEmbed).not.toContain("<iframe");
    expect(siteHeader).toContain("getConfiguredBookingEngineHref");
    expect(siteHeader).toContain('target="_blank"');
    expect(siteHeader).toContain('data-event="booking_engine_open"');
    for (const ctaSource of primaryBookingCtas) {
      expect(ctaSource).toContain("getConfiguredBookingEngineHref");
      expect(ctaSource).toContain('target="_blank"');
      expect(ctaSource).toContain('rel="noopener noreferrer"');
      expect(ctaSource).toContain('data-event="booking_engine_open"');
    }
    expect(mobileActionBar).not.toContain('bookingHref: "/rezervasyon"');
    expect(mobileActionBar).not.toContain('bookingHref: "/en/rezervasyon"');
    expect(homeHero).not.toContain('locale === "en" ? "/en/rezervasyon" : "/rezervasyon"');
    expect(finalCta).not.toContain('locale === "en" ? "/en/rezervasyon" : "/rezervasyon"');
    expect(roomsClient).not.toContain('href={locale === "en" ? "/en/rezervasyon" : "/rezervasyon"}');
    expect(roomDetail).not.toContain('href={`/rezervasyon?oda=${slug}`}');
    expect(bookingUrlHelper).toContain("OFFICIAL_HMS_BOOKING_ENGINE_URL");
    expect(bookingUrlHelper).toContain("OFFICIAL_HMS_BOOKING_ENGINE_HOST");
    expect(bookingUrlHelper).toContain("https://kozbeyli-konagi.hmshotel.net/");
    expect(bookingUrlHelper).toContain('url.protocol !== "https:"');
    expect(bookingUrlHelper).toContain("url.hostname !== OFFICIAL_HMS_BOOKING_ENGINE_HOST");
    expect(bookingUrlHelper).toContain('utm_source", "website"');
    expect(bookingUrlHelper).toContain('utm_medium", "booking_engine"');
    expect(hmsReadiness).toContain("HMS BOOKING TARGET PASS");
    expect(hmsReadiness).toContain("OFFICIAL_HMS_BOOKING_ENGINE_HOST");
    expect(hmsReadiness).toContain("kozbeyli-konagi.hmshotel.net");
    expect(hmsReadiness).toContain("soleil-mansion");
    expect(hmsReadiness).toContain("wrong-property signal");
    expect(envExample).toContain("NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL=https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine");
  });

  it("keeps the public FAQ corpus rich enough for guest support and FAQ schema", () => {
    const faqs = read("src/data/faqs.ts");
    const questionCount = (faqs.match(/\bq:\s*\{/g) ?? []).length;

    expect(questionCount).toBeGreaterThanOrEqual(10);
    for (const requiredTopic of [
      "Kahvaltı",
      "Restoranı",
      "Otopark",
      "Evcil hayvan",
      "Düğün",
      "İptal ve tarih değişikliği",
      "Ödeme güvenliği",
    ]) {
      expect(faqs).toContain(requiredTopic);
    }
    expect(faqs).not.toContain("48 saat");
    expect(faqs).not.toContain("ücretsiz iptal");
  });

  it("keeps room-facing copy free from the old Superrior typo", () => {
    const rooms = read("src/data/rooms.ts");

    expect(rooms).toContain("Superior 2 Kişilik Oda");
    expect(rooms).toContain("Superior 3 Kişilik Oda");
    expect(rooms).not.toContain("Superrior");
  });

  it("keeps superior room media paths correctly spelled while redirecting legacy typo URLs", () => {
    const canonicalMediaFiles = [
      "src/data/rooms.ts",
      "src/data/gallery.ts",
      "src/components/experience-designer/data.ts",
      "src/components/history-client.tsx",
      "src/components/heritage-archive.tsx",
      "src/app/misafir-rehberi/page.tsx",
    ];
    const nextConfig = read("next.config.ts");

    for (const file of canonicalMediaFiles) {
      expect(read(file), `${file} should use superior, not superrior`).not.toContain("/superrior-");
    }

    expect(exists("public/images/odalar/superior-oda-deniz-manzarali")).toBe(true);
    expect(exists("public/images/odalar/superior-3-kisilik-oda-deniz-manzarali")).toBe(true);
    expect(exists("public/images/odalar/superrior-oda-deniz-manzarali")).toBe(false);
    expect(exists("public/images/odalar/superrior-3-kisilik-oda-deniz-manzarali")).toBe(false);
    expect(nextConfig).toContain('source: "/images/odalar/superrior-oda-deniz-manzarali/:path*"');
    expect(nextConfig).toContain('destination: "/images/odalar/superior-oda-deniz-manzarali/:path*"');
    expect(nextConfig).toContain('source: "/images/odalar/superrior-3-kisilik-oda-deniz-manzarali/:path*"');
    expect(nextConfig).toContain('destination: "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/:path*"');
  });

  it("keeps the CSP frame surface narrow after moving booking to new-tab handoff", () => {
    const nextConfig = read("next.config.ts");

    expect(nextConfig).toContain('"object-src \'none\'"');
    expect(nextConfig).toContain('"base-uri \'self\'"');
    expect(nextConfig).toContain('"form-action \'self\'"');
    expect(nextConfig).toContain('process.env.NODE_ENV !== "production" ? "\'unsafe-eval\'" : ""');
    expect(nextConfig).toContain(
      '"frame-src \'self\' https://www.google.com https://maps.google.com https://www.googletagmanager.com https://challenges.cloudflare.com"',
    );
    expect(nextConfig).toContain("https://www.googleadservices.com");
    expect(nextConfig).toContain("https://googleads.g.doubleclick.net");
    expect(nextConfig).toContain("https://stats.g.doubleclick.net");
    expect(nextConfig).not.toContain("frame-src https: blob:");
    expect(nextConfig).not.toContain("allows the HMS booking engine iframe");
  });

  it("keeps canonical domain readiness executable and out of the green release gate until DNS is ready", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const domainScript = read("scripts/domain-readiness.mjs");
    const releaseScript = read("scripts/release-verify.mjs");

    expect(packageJson.scripts?.["domain:verify:json"]).toBe(
      "node scripts/domain-readiness.mjs --json",
    );
    expect(domainScript).toContain("CANONICAL DOMAIN NO-GO");
    expect(domainScript).toContain("/api/health");
    expect(domainScript).toContain('EXPECTED_HERO_VIDEO_SRC = "/videos/hero.mp4"');
    expect(domainScript).toContain("hasOpeningHeroVideo");
    expect(domainScript).toContain("homepage does not expose opening hero video");
    expect(domainScript).toContain("firstHopInsecure");
    expect(domainScript).toContain("redirects first hop to insecure HTTP");
    expect(domainScript).toContain("insecure first-hop redirect");
    expect(domainScript).toContain("queryDnsOverHttps");
    expect(domainScript).toContain("DNS_FALLBACK_ENDPOINTS");
    expect(domainScript).toContain("dnsFallbackFetchImpl");
    expect(domainScript).toContain("LEGACY_HOST_SIGNATURES");
    expect(domainScript).toContain("legacy Joomla/Seagull template");
    expect(domainScript).toContain("legacy HotelRunner hosted landing surface");
    expect(domainScript).toContain("serves legacy host surface");
    expect(domainScript).toContain("EXTERNAL_DNS_RESOLVER_NOTE");
    expect(domainScript).toContain("buildZoneCutoverGuidance");
    expect(domainScript).toContain("external DNS/CDN layer");
    expect(domainScript).toContain("compareDnsResolvers");
    expect(domainScript).toContain("process.exitCode");
    expect(domainScript).not.toContain("process.exit(strict");
    expect(domainScript).toContain("kozbeylikonagi.com");
    expect(domainScript).toContain("kozbeyli-konagi.vercel.app");
    expect(releaseScript).not.toContain("domain:verify:strict");
  });

  it("keeps launch readiness evidence current after the light-theme and domain hardening passes", () => {
    const launchReadiness = read("docs/launch-readiness.md");
    const publishTarget = read("docs/publish-target.md");
    const canonicalEvidence = read("docs/evidence/canonical-domain.md");

    expect(launchReadiness).toContain("Son revizyon: 2026-06-22.");
    expect(launchReadiness).toContain("2026-06-20 canonical legacy host güncellemesi");
    expect(launchReadiness).toContain("2026-06-20 public resolver notu");
    expect(launchReadiness).toContain("2026-06-22 İsimtescil/Vercel nameserver güncellemesi");
    expect(launchReadiness).toContain("2026-06-20 public light theme güncellemesi");
    expect(launchReadiness).toContain("31 files / 186 tests");
    expect(launchReadiness).toContain("68 routes generated");
    expect(launchReadiness).toContain("170 Playwright tests (168 passed / 2 skipped)");
    expect(launchReadiness).toContain("current commit'i `/api/health` üzerinden doğruluyor");
    expect(launchReadiness).toContain("`launch:smoke:live` canonical production domain");
    expect(launchReadiness).toContain("`launch:smoke:preview` Vercel preview");
    expect(launchReadiness).toContain("legacy Joomla/Seagull template");
    expect(launchReadiness).toContain("`.com` canonical origins PASS");
    expect(launchReadiness).toContain("current production");
    expect(launchReadiness).not.toContain("9 files / 29 tests");
    expect(launchReadiness).not.toContain("66 routes generated");
    expect(launchReadiness).not.toContain("113 passed / 2 skipped");

    expect(publishTarget).toContain("Son revizyon: 2026-06-22");
    expect(publishTarget).toContain("168 passed / 2 skipped");
    expect(publishTarget).toContain("31 files / 186 tests");
    expect(publishTarget).toContain("68 routes");
    expect(publishTarget).toContain("`.com` canonical origin'ler");
    expect(publishTarget).toContain("`.com.tr` bu projenin launch hedefi değildir");
    expect(publishTarget).not.toContain("113 passed / 2 skipped");
    expect(publishTarget).not.toContain("http://127.0.0.1:3010");

    expect(canonicalEvidence).toContain("date: 2026-06-22");
    expect(canonicalEvidence).toContain("legacy Joomla/Seagull template");
    expect(canonicalEvidence).toContain("legacy HotelRunner hosted landing surface");
    expect(canonicalEvidence).toContain("The production web target for this project");
    expect(canonicalEvidence).toContain("commit reported by");
    expect(canonicalEvidence).toContain("DNS diagnostics preserve existing mail continuity checks");
    expect(canonicalEvidence).toContain("mail-continuity records");
    expect(canonicalEvidence).toContain("NS1.VERCEL-DNS.COM,NS2.VERCEL-DNS.COM");
    expect(canonicalEvidence).toContain("out of scope for this launch gate");
  });

  it("keeps Vercel operational prerequisites visible without hiding the global CLI requirement", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const vercelOps = read("scripts/vercel-ops-readiness.mjs");
    const vercelEnv = read("scripts/vercel-env-readiness.mjs");
    const cutover = read("scripts/production-cutover-plan.mjs");
    const runbook = read("docs/vercel-operations.md");

    expect(packageJson.scripts?.["vercel:ops"]).toBe("node scripts/vercel-ops-readiness.mjs");
    expect(packageJson.scripts?.["launch:cutover"]).toBe("node scripts/production-cutover-plan.mjs");
    expect(packageJson.scripts?.["launch:cutover:json"]).toBe(
      "node scripts/production-cutover-plan.mjs --json",
    );
    expect(packageJson.scripts?.["launch:cutover:strict"]).toBe(
      "node scripts/production-cutover-plan.mjs --strict",
    );
    expect(packageJson.scripts?.["launch:standup:live:write"]).toBe(
      "node scripts/launch-standup.mjs --live-runtime --output .codex-artifacts/launch-standup.md",
    );
    expect(packageJson.scripts?.["launch:standup:live:write:json"]).toBe(
      "node scripts/launch-standup.mjs --json --live-runtime --output .codex-artifacts/launch-standup.json",
    );
    expect(packageJson.scripts?.["launch:standup:compact"]).toBe(
      "node scripts/launch-standup.mjs --compact",
    );
    expect(packageJson.scripts?.["launch:standup:compact:json"]).toBe(
      "node scripts/launch-standup.mjs --compact --json",
    );
    expect(packageJson.scripts?.["launch:standup:live:compact"]).toBe(
      "node scripts/launch-standup.mjs --live-runtime --compact",
    );
    expect(packageJson.scripts?.["launch:standup:live:compact:json"]).toBe(
      "node scripts/launch-standup.mjs --live-runtime --compact --json",
    );
    expect(packageJson.scripts?.["launch:standup:live:write:compact"]).toBe(
      "node scripts/launch-standup.mjs --live-runtime --compact --output .codex-artifacts/launch-standup-compact.md",
    );
    expect(packageJson.scripts?.["launch:standup:live:write:compact:json"]).toBe(
      "node scripts/launch-standup.mjs --json --live-runtime --compact --output .codex-artifacts/launch-standup-compact.json",
    );
    expect(packageJson.scripts?.["hms:verify:strict"]).toBe(
      "node scripts/hms-booking-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:ops:strict"]).toBe(
      "node scripts/vercel-ops-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:env:strict"]).toBe(
      "node scripts/vercel-env-readiness.mjs --strict",
    );
    expect(packageJson.scripts?.["vercel:env:values"]).toBe(
      "node scripts/vercel-production-run.mjs env",
    );
    expect(packageJson.scripts?.["vercel:env:values:strict"]).toBe(
      "node scripts/vercel-production-run.mjs env --strict",
    );
    expect(packageJson.scripts?.["vercel:supabase:verify"]).toBe(
      "node scripts/vercel-production-run.mjs supabase",
    );
    expect(packageJson.scripts?.["vercel:abuse:verify"]).toBe(
      "node scripts/vercel-production-run.mjs abuse",
    );
    expect(packageJson.scripts?.["vercel:hms:verify"]).toBe(
      "node scripts/vercel-production-run.mjs hms",
    );
    expect(packageJson.scripts?.["vercel:garanti:verify"]).toBe(
      "node scripts/vercel-production-run.mjs garanti",
    );
    expect(packageJson.scripts?.["vercel:analytics:verify"]).toBe(
      "node scripts/vercel-production-run.mjs analytics",
    );
    expect(packageJson.scripts?.["vercel:search:verify"]).toBe(
      "node scripts/vercel-production-run.mjs search",
    );
    expect(packageJson.scripts?.["vercel:commercial:verify"]).toBe(
      "node scripts/vercel-commercial-verify.mjs",
    );
    expect(packageJson.scripts?.["vercel:commercial:verify:json"]).toBe(
      "node scripts/vercel-commercial-verify.mjs --json",
    );
    expect(vercelOps).toContain("Kozbeyli Konagi Vercel operations readiness");
    expect(vercelEnv).toContain("Kozbeyli Konagi Vercel production env readiness");
    expect(vercelEnv).toContain("parseVercelEnvList");
    expect(vercelEnv).toContain("VERCEL PRODUCTION ENV INCOMPLETE");
    expect(vercelEnv).toContain("VERCEL ENV INVENTORY UNAVAILABLE");
    expect(vercelEnv).toContain("Production env names configured");
    expect(vercelEnv).toContain("parseVercelEnvFile");
    expect(vercelEnv).toContain("parseProcessEnv");
    expect(vercelEnv).toContain("--env-file");
    expect(vercelEnv).toContain("--from-process-env");
    expect(vercelEnv).toContain("npm run vercel:env:values");
    expect(vercelEnv).toContain("npm run vercel:supabase:verify");
    expect(vercelEnv).toContain("npm run vercel:hms:verify");
    expect(vercelEnv).toContain("npm run vercel:analytics:verify");
    expect(vercelEnv).toContain("secret values are never printed");
    expect(vercelEnv).toContain("empty, placeholder or unavailable");
    expect(vercelEnv).toContain("valueValidation: \"not_performed\"");
    expect(vercelEnv).toContain("process.env");
    expect(cutover).toContain("VERCEL_AUTH_COMMANDS");
    expect(cutover).toContain("vercel whoami");
    expect(cutover).toContain("npm run vercel:hms:verify");
    expect(cutover).toContain("npm run vercel:garanti:verify");
    expect(cutover).toContain("npm run vercel:search:verify");
    expect(cutover).toContain("npm run vercel:env:values:strict");
    expect(cutover).toContain("external DNS/CDN layer");
    expect(cutover).toContain("For first verification");
    expect(vercelOps).toContain("PASS_WITH_WARNINGS");
    expect(vercelOps).toContain("npm i -g vercel");
    expect(vercelOps).toContain("APPDATA");
    expect(vercelOps).toContain("allowNpxFallback = false");
    expect(vercelOps).toContain("--allow-npx-fallback");
    expect(vercelOps).toContain("npx fallback was not executed");
    expect(vercelOps).toContain("Only npx Vercel fallback is available");
    expect(vercelOps).toContain("persistent global CLI is not installed on PATH");
    expect(vercelOps).toContain("resolveVercelCmdTarget");
    expect(vercelOps).toContain('process.env.CI === "true"');
    expect(vercelOps).toContain("private operator link is intentionally not committed");
    expect(vercelOps).not.toContain("candidates.push(path.join(npmPrefix, \"node_modules\", \"vercel\", \"dist\", \"vc.js\"");
    expect(vercelOps).toContain('"vercel_auth"');
    expect(vercelOps).toContain('"whoami"');
    expect(vercelOps).toContain("env, deploy and logs operations");
    expect(vercelOps).toContain("Run vercel login");
    expect(vercelOps).toContain("is required for vercel env pull, vercel deploy and vercel logs");
    expect(vercelOps).toContain("canonical-domain.md");
    expect(vercelOps).toContain("kozbeyli-konagi");
    expect(runbook).toContain("npm run vercel:ops");
    expect(runbook).toContain("does not execute `npx vercel` by default");
    expect(runbook).toContain("node scripts/vercel-ops-readiness.mjs --allow-npx-fallback");
    expect(runbook).toContain("`.vercel/project.json` is a private local operator link");
    expect(runbook).toContain("In GitHub Actions, its absence is reported as a warning");
    expect(runbook).toContain("npm run vercel:env");
    expect(runbook).toContain("npm run vercel:env:values");
    expect(runbook).toContain("npm run vercel:env:values:strict");
    expect(runbook).toContain("dnsTargetRecords");
    expect(runbook).toContain("never prints values");
    expect(runbook).toContain("no-disk `env run`");
    expect(runbook).toContain("argument-array execution");
    expect(runbook).toContain("isolated temporary `.vercel` workspace");
    expect(runbook).toMatch(/local `\.env` \/ `\.env\.local` files cannot mask the\s+real Production values/);
    expect(runbook).toContain("npm run vercel:supabase:verify");
    expect(runbook).toContain("npm run vercel:abuse:verify");
    expect(runbook).toContain("npm run vercel:hms:verify");
    expect(runbook).toContain("npm run vercel:garanti:verify");
    expect(runbook).toContain("npm run vercel:analytics:verify");
    expect(runbook).toContain("npm run vercel:search:verify");
    expect(runbook).toContain("npm run launch:cutover");
    expect(runbook).toContain("npm run launch:standup:live:write");
    expect(runbook).toContain("npm run launch:standup:live:write:json");
    expect(runbook).toContain("npm run launch:standup:live:compact");
    expect(runbook).toContain("npm run launch:standup:live:write:compact");
    expect(runbook).toContain("npm run launch:standup:live:write:compact:json");
    expect(runbook).toContain("npm run evidence:templates:live:write");
    expect(runbook).toContain("npm run evidence:templates:live:write:json");
    expect(runbook).toContain("npm run evidence:templates:live:compact");
    expect(runbook).toContain("npm run evidence:templates:live:runtime-ready");
    expect(runbook).toContain("npm run evidence:templates:live:write:runtime-ready");
    expect(runbook).toContain("npm run evidence:templates:live:write:runtime-ready:json");
    expect(runbook).toContain("only redacted source-system proof is missing");
    expect(runbook).toContain("copy-ready `status: pending` evidence templates");
    expect(runbook).toContain("not environment values");
    expect(runbook).toContain("KPI and review loop");
    expect(runbook).toContain("npm run vercel:ops:strict");
    expect(runbook).toContain("npm i -g vercel");
    expect(runbook).toContain("default `vercel:ops` command does not execute npx");
    expect(runbook).toContain("vercel whoami");
    expect(runbook).toContain("Do not store secrets in this repository");
    expect(read(".gitignore")).toContain("kozbeyli-vercel-production.env");
  });

  it("keeps B2B availability fail-closed without a live inventory source", () => {
    const availabilityRoute = read("src/app/api/v1/availability/route.ts");

    expect(availabilityRoute).toContain("Live availability source is not configured.");
    expect(availabilityRoute).toContain("B2B_ALLOW_STATIC_AVAILABILITY");
    expect(availabilityRoute).toContain('process.env.NODE_ENV !== "production"');
    expect(availabilityRoute.indexOf("ALLOW_STATIC_AVAILABILITY")).toBeLessThan(
      availabilityRoute.indexOf("available: true"),
    );
  });

  it("keeps Iyzico webhook verification independent from HMS ES256 signing", () => {
    const iyzicoRoute = read("src/app/api/webhook/iyzico/route.ts");

    expect(iyzicoRoute).toContain("createDigest(bodyText)");
    expect(iyzicoRoute).toContain("return notFound();");
    expect(iyzicoRoute).not.toContain('status: "active"');
    expect(iyzicoRoute).not.toContain("HMS_WEBHOOK_ES256_PUBLIC_KEY");
    expect(iyzicoRoute).not.toContain("verifyEs256Signature");
  });

  it("keeps admin growth dashboard restricted to Payload admins", () => {
    const growthPage = read("src/app/admin/growth/page.tsx");

    expect(growthPage).toContain('user?.role === "admin"');
    expect(growthPage).not.toContain("authenticated = Boolean(user)");
  });

  it("keeps admin growth operations evidence-bound instead of simulated agent theater", () => {
    const growthPage = read("src/app/admin/growth/page.tsx");
    const growthDashboard = read("src/app/admin/growth/growth-client.tsx");
    const growthEngine = read("src/lib/growth-engine.ts");
    const growthSmoke = read("scripts/stress-test-growth.ts");
    const combined = [growthPage, growthDashboard, growthEngine, growthSmoke].join("\n");

    expect(growthDashboard).toContain("Kozbeyli Commercial Launch Control");
    expect(growthDashboard).toContain("82/100");
    expect(growthDashboard).toContain(">18<");
    expect(growthPage).toContain("getRuntimeReadiness");
    expect(growthPage).toContain("runtimeReadiness={getRuntimeReadiness()}");
    expect(growthDashboard).toContain("Runtime env");
    expect(growthDashboard).toContain("Runtime readiness");
    expect(growthDashboard).toContain("Blocked runtime gates");
    expect(growthDashboard).toContain("docs/evidence/canonical-domain.md");
    expect(growthDashboard).toContain("docs/evidence/production-database.md");
    expect(growthDashboard).toContain("Payload database proof");
    expect(growthDashboard).toContain("npm run vercel:supabase:verify");
    expect(growthDashboard).toContain("Aggregate Vercel commercial gate");
    expect(growthDashboard).toContain("npm run vercel:commercial:verify");
    expect(growthDashboard).toContain("complete next-action report");
    expect(growthDashboard).toContain("bank account details");
    expect(growthEngine).toContain("database");
    expect(growthDashboard).toContain("npm run release:verify");
    expect(growthDashboard).toContain("npm run launch:cutover:json");
    expect(growthDashboard).toContain("No secrets or bank details in repo evidence");
    expect(growthEngine).toContain("EVIDENCE_GATED");
    expect(growthSmoke).toContain("Deterministic growth evidence smoke");

    for (const forbidden of [
      "SNAKEEZY",
      "DA_VINCI",
      "HOPPER",
      "VON_NEUMANN",
      "LOVELACE",
      "Math.random",
      "MCP PROXY ACTIVE",
      "SYSTEM_ORCHESTRATOR_LOGS",
      "Node-10.0.42.10",
      "geofence_boundary",
      "Edge Nodes",
      "Redis Sync",
      "@import url",
      "ACTIVE AGENTS",
      "CONVERSION VELOCITY",
      "TURNSTILE_SECRET_KEY",
      "GA4_API_SECRET",
      "PAYLOAD_SECRET",
    ]) {
      expect(combined, `growth operations must not contain ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("keeps legal copy aligned with no-card-data payment architecture", () => {
    const privacy = read("src/app/gizlilik-politikasi/page.tsx");
    const kvkk = read("src/app/kvkk/page.tsx");

    expect(privacy).toContain("kart numarası veya CVV");
    expect(privacy).toContain("kart verileri");
    expect(kvkk).toContain("Web sitesi");
    expect(kvkk).toContain("kart numarası veya CVV");
    expect(kvkk).not.toContain("banka/kredi kartı bilgileri");
  });

  it("keeps checkout reservation references generated by the server, not the browser", () => {
    const checkoutRoute = read("src/app/api/checkout/route.ts");
    const paymentWizard = read("src/components/payment-wizard/use-payment-wizard.ts");

    expect(checkoutRoute).toContain("function createBookingReference");
    expect(checkoutRoute).toContain("crypto.randomBytes");
    expect(checkoutRoute).toContain("bookingId: z.string().optional()");
    expect(checkoutRoute).toContain("const bookingId = createBookingReference()");
    expect(checkoutRoute).toContain("update(`booking:${bookingId}`)");
    expect(checkoutRoute).not.toContain("data.bookingId");

    expect(paymentWizard).toContain('const [bookingId, setBookingId] = useState("")');
    expect(paymentWizard).toContain('typeof result.bookingId === "string"');
    expect(paymentWizard).toContain("setBookingId(result.bookingId)");
    expect(paymentWizard).not.toContain("Math.random");
    expect(paymentWizard).not.toContain('setBookingId("KK-');
    expect(paymentWizard).not.toContain("bookingId,\n          checkIn");
  });

  it("keeps generative design guidance out of product media placement", () => {
    const designSkill = read("agent/growth-engine/sub-skills/design-agent/SKILL.md");
    const contentSkill = read("agent/growth-engine/sub-skills/content-architect/SKILL.md");
    const mediaAudit = read("docs/media-placement-audit.md");

    expect(designSkill.toLowerCase()).toContain("concept exploration only");
    expect(designSkill).toContain("never product media");
    expect(contentSkill).toContain("Do not add Stable Diffusion, Midjourney or generated-image prompts");
    expect(contentSkill).not.toContain("[VISUAL_PROMPT");
    expect(contentSkill).not.toContain("Magic-MCP");
    expect(mediaAudit).toContain("Any generated or hallucinated image");
  });

  it("removes legacy external AI, mock reputation and autonomous lead-hunter helpers", () => {
    const growthSkill = read("agent/growth-engine/SKILL.md");
    const guestRelations = read("agent/guest-relations-agent/SKILL.md");
    const layout = read("src/app/layout.tsx");

    for (const relPath of [
      "src/components/reputation-ribbon.tsx",
      "src/lib/ai/ads-optimizer.ts",
      "src/lib/ai/client.ts",
      "src/lib/ai/config.ts",
      "src/lib/ai/content-agent.ts",
      "src/lib/ai/content-architect.ts",
      "src/lib/ai/design-agent.ts",
      "src/lib/ai/reputation-intelligence.ts",
      "src/lib/ai/turkey-data.ts",
      "agent/growth-engine/scripts/audit-runner.mjs",
      "agent/growth-engine/scripts/audit-runner.ts",
      "agent/growth-engine/scripts/auto-pilot.mjs",
      "agent/growth-engine/scripts/event-hunter.mjs",
      "agent/growth-engine/scripts/lead-hunter.mjs",
      "agent/growth-engine/scripts/lead-hunter.ts",
    ]) {
      expect(exists(relPath), `${relPath} should stay removed`).toBe(false);
    }

    const combined = [growthSkill, guestRelations, layout].join("\n");

    for (const forbidden of [
      "OPENROUTER_API_KEY",
      "openrouter.ai",
      "chat/completions",
      "conversion_rate_sim",
      "performance_score: 98",
      "GlobalTech Solutions",
      "NOTIFICATION SENT",
      "best rate guarantee",
      "dominate the hospitality market",
    ]) {
      expect(combined, `legacy autonomous/generative helper text must not contain ${forbidden}`).not.toContain(forbidden);
    }

    expect(growthSkill).toContain("evidence-gated growth coordinator");
    expect(growthSkill).toContain("Never claim production readiness");
    expect(guestRelations).toContain("Treat availability as unconfirmed");
    expect(layout).toContain("Eski reputation ribbon");
  });

  it("keeps growth and SEO helper scripts evidence-based and read-only", () => {
    const leadGen = read("scripts/lead-gen.ts");
    const seoAudit = read("scripts/seo-audit.ts");
    const seoPilot = read("scripts/seo-auto-pilot.ts");
    const adCopyOptimizer = read("scripts/ad-copy-optimizer.ts");
    const geoRefactor = read("scripts/geo-refactor.ts");
    const adOptimizer = read("src/lib/agents/ad-optimizer.ts");
    const leadService = read("src/lib/ai/lead-service.ts");
    const combined = [leadGen, seoAudit, seoPilot, adCopyOptimizer, geoRefactor, adOptimizer, leadService].join("\n");

    for (const forbidden of [
      "mockLeads",
      "mockStats",
      "SYSTEM_PILOT",
      "AI-Generated outreach",
      "Simulated Logic",
      "FOUND (Optimized",
      "score: 95",
      "payload.create",
      "agent_discovery",
      "renderHeritageVideo",
      "fs.writeFileSync",
      "Math.random",
      "Syncing lead",
    ]) {
      expect(combined, `production helper scripts must not contain ${forbidden}`).not.toContain(forbidden);
    }

    expect(leadGen).toContain("writesPerformed: 0");
    expect(leadGen).toContain("This script never writes to Payload/CRM");
    expect(seoAudit).toContain("failures");
    expect(seoAudit).toContain("metadataBase");
    expect(seoPilot).toContain("Evidence-based content gap scan only");
    expect(seoPilot).toContain("nextEditorialBacklog");
    expect(adCopyOptimizer).toContain("This script never renders video or publishes ads.");
    expect(adOptimizer).toContain("generatedAssets: []");
    expect(geoRefactor).toContain("writesPerformed: 0");
    expect(geoRefactor).toContain("No files are written and no generated claims are inserted.");
    expect(leadService).toContain("CRM writes are disabled in LeadService");
  });

  it("keeps launch smoke focused on public routes, hero video, location and media", () => {
    const launchSmokeScript = read("scripts/launch-smoke.mjs");

    expect(launchSmokeScript).toContain("tests/e2e/publish-routes.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/health.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/hero-video.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/booking-handoff.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/contact-location.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/launch-localization.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/media-assets.spec.ts");
    expect(launchSmokeScript).toContain('process.env.LAUNCH_SMOKE_WORKERS || "1"');
    expect(launchSmokeScript).toContain('"--workers"');
    expect(launchSmokeScript).toContain("PW_BASE_URL");
    expect(launchSmokeScript).toContain("runReadinessPreflight");
    expect(launchSmokeScript).toContain("scripts/domain-readiness.mjs");
    expect(launchSmokeScript).toContain("scripts/commercial-launch-audit.mjs");
    expect(launchSmokeScript).toContain("live domain readiness");
    expect(launchSmokeScript).toContain("npm i -g vercel");
    expect(launchSmokeScript).toContain("where.exe");
    expect(launchSmokeScript).toContain("dist\", \"vc.js");
    expect(launchSmokeScript).toContain(".next/BUILD_ID");
    expect(launchSmokeScript).toContain("node_modules/@playwright/test/cli.js");
    expect(launchSmokeScript).toContain("test-results\", \"launch-smoke");
    expect(launchSmokeScript).toContain("makeRunScopedOutputDir");
    expect(launchSmokeScript).toContain("process.pid");
    expect(launchSmokeScript).toContain("--output");
  });

  it("keeps localization readiness focused on EN/TR public language regressions", () => {
    const localizationScript = read("scripts/localization-readiness.mjs");

    expect(localizationScript).toContain("Kozbeyli Konagi localization readiness");
    expect(localizationScript).toContain("tests/e2e/launch-localization.spec.ts");
    expect(localizationScript).toContain("tests/e2e/lang-switch.spec.ts");
    expect(localizationScript).toContain("tests/e2e/new-pages.spec.ts");
    expect(localizationScript).toContain("EN/TR room catalog");
    expect(localizationScript).toContain("public EN pages");
    expect(localizationScript).toContain("mobile action bar");
    expect(localizationScript).toContain("PW_BASE_URL");
    expect(localizationScript).toContain("scripts/domain-readiness.mjs");
    expect(localizationScript).toContain(".next/BUILD_ID");
    expect(localizationScript).toContain("node_modules/@playwright/test/cli.js");
    expect(localizationScript).toContain("test-results\", \"localization-readiness");
    expect(localizationScript).toContain("process.env.LOCALIZATION_VERIFY_WORKERS || \"1\"");
    expect(localizationScript).toContain("--output");
  });

  it("keeps media playback readiness focused on real public food videos", () => {
    const mediaPlaybackScript = read("scripts/media-playback-readiness.mjs");

    expect(mediaPlaybackScript).toContain("Kozbeyli Konagi media playback readiness");
    expect(mediaPlaybackScript).toContain("tests/e2e/media-assets.spec.ts");
    expect(mediaPlaybackScript).toContain("homepage editorial videos");
    expect(mediaPlaybackScript).toContain("/gastronomi videos can play real frames");
    expect(mediaPlaybackScript).toContain("mobile /gastronomi video controls");
    expect(mediaPlaybackScript).toContain("breakfast, mihlama and chef video playback");
    expect(mediaPlaybackScript).toContain("PW_BASE_URL");
    expect(mediaPlaybackScript).toContain("scripts/domain-readiness.mjs");
    expect(mediaPlaybackScript).toContain(".next/BUILD_ID");
    expect(mediaPlaybackScript).toContain("node_modules/@playwright/test/cli.js");
    expect(mediaPlaybackScript).toContain("test-results\", \"media-playback-readiness");
    expect(mediaPlaybackScript).toContain("process.env.MEDIA_PLAYBACK_WORKERS || \"1\"");
    expect(mediaPlaybackScript).toContain("--grep");
    expect(mediaPlaybackScript).toContain("--output");
  });

  it("keeps stress tests reproducible with seeded interaction plans", () => {
    const monkeySpec = read("tests/monkey.spec.ts");
    const chaosSpec = read("tests/destructive-chaos.spec.ts");

    expect(monkeySpec).toContain("function seededRandom");
    expect(monkeySpec).not.toContain("Math.random");
    expect(chaosSpec).toContain("function seededRandom");
    expect(chaosSpec).toContain("seed=20260619");
    expect(chaosSpec).not.toContain("Math.random");
  });

  it("keeps release verification producing the commercial cutover plan", () => {
    const releaseScript = read("scripts/release-verify.mjs");
    const publishReadiness = read("scripts/publish-readiness.mjs");
    const cutoverPlan = read("scripts/production-cutover-plan.mjs");

    expect(releaseScript).toContain("launch:cutover:json");
    expect(publishReadiness).toContain("scripts/production-cutover-plan.mjs");
    expect(publishReadiness).toContain("launch:cutover:strict");
    expect(cutoverPlan).toContain("Kozbeyli Konagi production cutover plan");
    expect(cutoverPlan).toContain("VERCEL_TARGET_RECORDS");
    expect(cutoverPlan).toContain("VERCEL_DNS_TARGET_NOTE");
    expect(cutoverPlan).toContain("dnsTargetRecords");
    expect(cutoverPlan).toContain("npm i -g vercel");
    expect(cutoverPlan).toContain("HTTPS-to-HTTP first-hop redirect");
    expect(cutoverPlan).toContain("legacy Joomla/Seagull template");
    expect(cutoverPlan).toContain("legacy HotelRunner hosted landing surface");
    expect(cutoverPlan).toContain("Remove old Joomla/Seagull and HotelRunner hosted landing routing");
    expect(cutoverPlan).toContain("no legacy host signatures");
    expect(cutoverPlan).toContain("Treat NS/MX DNS PASS separately from web serving readiness");
    expect(cutoverPlan).toContain("A records for apex hosts and CNAME records for www/subdomains");
    expect(cutoverPlan).toContain("subdomain CNAME records shown by Vercel Project Settings");
    expect(cutoverPlan).toContain("kozbeylikonagi.com and www.kozbeylikonagi.com");
    expect(cutoverPlan).toContain("remove the bad override to use the official code fallback");
    expect(cutoverPlan).toContain("Run npm run vercel:hms:verify");
    expect(cutoverPlan).toContain("Verify the public reservation CTA opens the approved HTTPS HMS engine");
    expect(cutoverPlan).toContain("vercel env add NEXT_PUBLIC_GA4_MEASUREMENT_ID production");
    expect(cutoverPlan).toContain("vercel env add NEXT_PUBLIC_GOOGLE_ADS_ID production");
    expect(cutoverPlan).toContain("npm run domain:verify:strict");
    expect(cutoverPlan).toContain("npm run vercel:commercial:verify");
    expect(cutoverPlan).toContain("npm run vercel:env:values:strict");
    expect(cutoverPlan).toContain("npm run vercel:supabase:verify");
    expect(cutoverPlan).toContain("npm run vercel:hms:verify");
    expect(cutoverPlan).toContain("npm run vercel:garanti:verify");
    expect(cutoverPlan).toContain("npm run vercel:analytics:verify");
    expect(cutoverPlan).toContain("npm run vercel:search:verify");
    expect(cutoverPlan).toContain("npm run launch:audit:live:strict");
    expect(cutoverPlan).toContain("npm run launch:audit:strict");
    expect(cutoverPlan).toContain("npm run release:verify:commercial");

    const exitIntent = read("src/components/exit-intent.tsx");
    expect(exitIntent).toContain("getConfiguredBookingEngineHref");
    expect(exitIntent).toContain("usePathname");
    expect(exitIntent).toContain('document.addEventListener("mousemove", handleTopExit');
    expect(exitIntent).toContain('document.addEventListener("mouseleave", handleTopExit');
    expect(exitIntent).toContain('target="_blank"');
    expect(exitIntent).not.toContain('|| "/rezervasyon"');
    expect(exitIntent).toContain("Kozbeyli Konağı");
    expect(exitIntent).toContain("Resmi Direkt Rezervasyon");
    expect(exitIntent).toContain("Direct booking offer");
    expect(exitIntent).toContain("Official Direct Reservation");
    expect(exitIntent).not.toContain("Kozbeyli Konagi");
    expect(exitIntent).not.toContain("Gitmeden Once");
    expect(exitIntent).not.toMatch(/En İyi Fiyat Garantisi|Best Rate Guarantee|Best Price Guarantee/i);
  });

  it("keeps homepage Foça positioning broad instead of only Eski or Yeni Foça", () => {
    const homepageCopy = [
      read("src/dictionaries/tr.json"),
      read("src/dictionaries/en.json"),
      read("src/components/home/home-hero.tsx"),
      read("src/components/home/experiences-teaser.tsx"),
      read("src/components/home/marquee-band.tsx"),
      read("src/components/site-footer.tsx"),
    ].join("\n");

    expect(homepageCopy).toContain('"eyebrow": "FOÇA"');
    expect(homepageCopy).toContain("Foça kıyı rotalarına yakın");
    expect(homepageCopy).toContain("Foça sahil yürüyüşleri");
    expect(homepageCopy).toContain('"Foça"');
    expect(homepageCopy).not.toContain("FOÇA, KOZBEYLİ");
    expect(homepageCopy).not.toMatch(/Foça Kozbeyli['’]de/);
    expect(homepageCopy).not.toContain("Foça — Kozbeyli Köyü");
    expect(homepageCopy).not.toContain("Foça — Kozbeyli Village");
    expect(homepageCopy).not.toMatch(/ESKİ FOÇA|OLD FOÇA|Eski Foça|Old Foça|Yeni Foça|New Foça/);
    expect(homepageCopy).not.toMatch(/Foça'ya 12 dakika|12 minutes from Foça/i);
  });

  it("keeps homepage hero video available during the opening viewport", () => {
    const homeHero = read("src/components/home/home-hero.tsx");
    const globals = read("src/app/globals.css");
    const heroVideoCss = globals.match(/\.hero-video\s*\{[\s\S]*?\n  \}/)?.[0] ?? "";

    // LCP guvenligi: poster priority eleman kalir; video da ilk HTML'de yer
    // alir. Onceki load + idle/timeout bekleme isletme sahibinin tarayicisinda
    // videoyu tamamen yok gibi gosteriyordu. CSS de React event'i bekleyip
    // oynayan videoyu opacity:0'da birakmamali.
    expect(homeHero).toContain('preload="auto"');
    // Onayli hero asseti kilitle: 15.78s montaj hero.mp4 (eski 2.75s hero-property
    // klibi superseded). Mobilde ayni gercek montajin 720x1280 turevi kullanilir.
    // Bkz docs/media-placement-audit.md.
    expect(homeHero).toContain('HERO_VIDEO_SRC = "/videos/hero.mp4"');
    expect(homeHero).toContain('HERO_MOBILE_VIDEO_SRC = "/videos/hero-mobile.mp4"');
    expect(homeHero).toContain('window.matchMedia("(max-width: 767px)")');
    expect(homeHero).toContain("data-desktop-src={HERO_VIDEO_SRC}");
    expect(homeHero).toContain("data-mobile-src={HERO_MOBILE_VIDEO_SRC}");
    expect(homeHero).not.toContain("hero-property.mp4");
    expect(homeHero).not.toContain("HERO_VIDEO_BOOT_DELAY_MS");
    expect(homeHero).not.toContain("requestIdleCallback");
    expect(homeHero).not.toContain("prefers-reduced-motion: reduce");
    expect(homeHero).not.toContain("setShouldRender");
    expect(homeHero).not.toContain("if (!shouldRender) return null");
    expect(homeHero).not.toContain("const [shouldRender");
    expect(heroVideoCss).toContain("opacity: 1");
    expect(heroVideoCss).not.toContain("opacity: 0");
    expect(homeHero).toContain('fetchPriority="high"');
    expect(homeHero).toContain("hero-video-poster-1280.webp");
    expect(homeHero).toContain('data-testid="hero-video-toggle"');
    expect(homeHero).toContain("video.defaultMuted = true");
    expect(homeHero).toContain("userPausedRef.current && !force");
    expect(globals).toContain(".hero-video-control");
    expect(globals).toContain("rgba(61, 74, 59, 0.88)");
    expect(globals).toContain(".hero-title-accent");
    expect(globals).toContain("color: var(--gold-soft)");
    expect(globals).toContain("font-style: italic");
    expect(globals).toContain("font-size: clamp(1.75rem, 7vw, 2.25rem)");
    expect(globals).toContain("color: #fff");
    expect(globals).toContain("0 2px 34px rgba(0, 0, 0, 0.5)");
    expect(globals).toContain("text-shadow: 0 2px 40px rgba(0, 0, 0, 0.3)");
    expect(homeHero).toContain("srcSet=");
    expect(homeHero).toContain("MagneticLink");
    expect(homeHero).toContain("hero-signature");
    expect(homeHero).toContain("magnetic-cta");
    expect(homeHero).not.toContain("RevealLines");
    expect(homeHero).not.toContain("<motion.div");
    expect(homeHero).not.toContain('from "next/image"');
  });

  it("keeps the homepage critical path free from framer-motion", () => {
    const criticalFiles = [
      "src/components/home/home-hero.tsx",
      "src/components/site-header.tsx",
      "src/components/home/faq-section.tsx",
      "src/components/animations.tsx",
      "src/components/floating-contact.tsx",
      "src/components/exit-intent.tsx",
      "src/components/loading-bar.tsx",
      "src/components/sunset-mode.tsx",
    ];

    for (const file of criticalFiles) {
      const source = read(file);
      expect(source).not.toContain("framer-motion");
      expect(source).not.toContain("AnimatePresence");
      expect(source).not.toContain("<motion.");
    }
  });

  it("keeps the first visual wave on lightweight native motion primitives", () => {
    const animations = read("src/components/animations.tsx");
    const globals = read("src/app/globals.css");

    expect(animations).toContain("export function StaggerContainer");
    expect(animations).toContain("export function Parallax");
    expect(animations).toContain("export function RevealLines");
    expect(animations).toContain("export function MagneticLink");
    expect(animations).toContain("prefers-reduced-motion: reduce");
    expect(animations).toContain("data-stagger-state");
    expect(animations).toContain("window.matchMedia(\"(pointer: coarse)\")");
    expect(globals).toContain("--ease-editorial");
    expect(globals).toContain(".magnetic-link-inner");
  });

  it("keeps below-fold homepage sections split out of the initial client path", () => {
    const homeClient = read("src/components/home-client.tsx");

    expect(homeClient).toContain('import dynamic from "next/dynamic"');
    for (const section of [
      "marquee-band",
      "kpi-band",
      "rooms-showcase",
      "gastronomy-editorial",
      "experiences-section",
      "gallery-strip",
      "experiences-teaser",
      "testimonials-section",
      "booking-section",
      "faq-section",
      "final-cta",
    ]) {
      expect(homeClient).toContain(`import("@/components/home/${section}")`);
    }
  });

  it("keeps homepage gallery and room media on direct approved public assets", () => {
    const galleryStrip = read("src/components/home/gallery-strip.tsx");
    const roomsShowcase = read("src/components/home/rooms-showcase.tsx");
    const roomDetail = read("src/components/room-detail-client.tsx");

    expect(galleryStrip).toContain("unoptimized");
    expect(galleryStrip).toContain('loading="lazy"');
    expect(roomsShowcase).toContain("unoptimized");
    expect(roomsShowcase).toContain("room-mosaic");
    expect(roomsShowcase).toContain("room-mosaic-featured");
    expect(roomsShowcase).not.toContain("card-grid");
    expect(roomDetail.match(/unoptimized/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(roomDetail).toContain("src={room.images[activeImg] ?? room.images[0]}");
    expect(roomDetail).toContain("src={img}");
  });

  it("keeps below-fold homepage videos from preloading on first paint", () => {
    const gastronomyEditorial = read("src/components/home/gastronomy-editorial.tsx");
    const globals = read("src/app/globals.css");

    expect(gastronomyEditorial).toContain("function LazyEditorialVideo");
    expect(gastronomyEditorial).toContain("IntersectionObserver");
    expect(gastronomyEditorial).toContain('preload={shouldLoad ? "metadata" : "none"}');
    expect(gastronomyEditorial).toContain('video.preload = "auto"');
    expect(gastronomyEditorial).toContain("controls={playbackBlocked}");
    expect(gastronomyEditorial).toContain("setPlaybackBlocked(true)");
    expect(gastronomyEditorial).toContain("editorial-video-control");
    expect(globals).toContain(".editorial-video-control");
    expect(gastronomyEditorial).not.toContain("autoPlay={shouldLoad}");
  });

  it("keeps the homepage gastronomy editorial copy inside a safe text column", () => {
    const gastronomyEditorial = read("src/components/home/gastronomy-editorial.tsx");
    const globals = read("src/app/globals.css");

    expect(gastronomyEditorial).toContain("gastronomy-editorial-section");
    expect(globals).toContain(".gastronomy-editorial-section > .container");
    expect(globals).toContain('grid-template-areas: "copy media"');
    expect(globals).not.toContain(".editorial.reverse {\n    direction: rtl;");
  });

  it("keeps the full gallery from blocking visible image decode on optimizer or lazy-load work", () => {
    const galleryPageContent = read("src/components/gallery-page-content.tsx");
    const galleryLightbox = read("src/components/gallery-lightbox.tsx");
    const globals = read("src/app/globals.css");

    // Sayfa, eager kaynak setini tanimlar ve lightbox'a aktarir.
    expect(galleryPageContent).not.toContain('from "next/image"');
    expect(galleryPageContent).toContain('const eagerImageSources = new Set(["/images/galeri/tas-firin-pide.jpg"])');
    expect(galleryPageContent).toContain("eager={eagerImageSources}");
    // Goruntu decode davranisi lightbox bileseninde dogrudan <img> ile korunur.
    expect(galleryLightbox).not.toContain('from "next/image"');
    expect(galleryLightbox).toContain("<img");
    expect(galleryLightbox).toContain('loading={i < 4 || eager?.has(shot.src) ? "eager" : "lazy"}');
    expect(galleryLightbox).toContain('decoding="async"');
    expect(galleryLightbox).toContain('fetchPriority={i < 4 || eager?.has(shot.src) ? "high" : "auto"}');
    expect(globals).toContain(".gallery-grid-item img {\n    width: 100%;\n    height: 100%;\n    display: block;");
  });

  it("keeps homepage KPI values truthful in server-rendered HTML", () => {
    const kpiBand = read("src/components/home/kpi-band.tsx");
    const testimonials = read("src/components/home/testimonials-section.tsx");
    const metadata = read("src/lib/metadata.ts");
    const homepage = read("src/app/page.tsx");

    expect(kpiBand).not.toContain("Counter");
    expect(kpiBand).toContain('const roomCount = "16"');
    expect(kpiBand).not.toContain('"9,4/10"');
    expect(kpiBand).not.toContain('"9.4/10"');
    expect(kpiBand).toContain("<strong>500+</strong>");
    expect(kpiBand).toContain('"12 Saat"');
    expect(kpiBand).toContain('"Resepsiyon · 24:00');
    expect(kpiBand).not.toContain('"24 Saat"');
    expect(kpiBand).not.toContain('to={500}');
    expect(testimonials).not.toContain("★★★★★");
    expect(testimonials).not.toContain("aria-label=\"5 yıldız\"");
    expect(metadata).not.toContain("ödüllü mutfak");
    expect(metadata).not.toContain("En Prestijli");
    expect(homepage).not.toContain("En Prestijli");
  });

  it("keeps production builds independent from Google Fonts network fetches", () => {
    const layout = read("src/app/layout.tsx");
    const globals = read("src/app/globals.css");
    const nextConfig = read("next.config.ts");
    const cleanNextBuild = read("scripts/clean-next-build.mjs");

    expect(layout).not.toContain("next/font/google");
    expect(layout).not.toContain("Inter(");
    expect(layout).not.toContain("Playfair_Display(");
    expect(globals).toContain("--font-playfair:");
    expect(globals).toContain("--font-inter:");
    expect(nextConfig).toContain("NEXT_DIST_DIR");
    expect(nextConfig).toContain('distDir: nextDistDir || ".next"');
    expect(cleanNextBuild).toContain("distDir = process.env.NEXT_DIST_DIR || \".next\"");
    expect(cleanNextBuild).toContain("Refusing unsafe Next.js build directory");
  });

  it("keeps language switching on hydration-safe href navigation", () => {
    const switcher = read("src/components/language-switcher.tsx");
    const localizedRoutes = read("src/lib/localized-routes.ts");

    expect(switcher).toContain('from "@/lib/localized-routes"');
    expect(localizedRoutes).toContain("function getTurkishHref");
    expect(localizedRoutes).toContain("function getEnglishHref");
    expect(localizedRoutes).toContain('"/odalar": "/en/rooms"');
    expect(switcher).toContain("href={trHref}");
    expect(switcher).toContain("href={enHref}");
    expect(switcher).not.toContain("router.push");
    expect(switcher).not.toContain("window.location.assign");
  });

  it("keeps Lighthouse CI as a realistic hard release budget", () => {
    const lighthouseConfig = JSON.parse(read("lighthouserc.json")) as {
      ci?: {
        collect?: {
          numberOfRuns?: number;
        };
        assert?: {
          assertions?: Record<string, [string, { minScore?: number }]>;
        };
      };
    };
    const assertions = lighthouseConfig.ci?.assert?.assertions ?? {};

    expect(lighthouseConfig.ci?.collect?.numberOfRuns).toBeGreaterThanOrEqual(3);
    expect(assertions["categories:performance"]?.[0]).toBe("error");
    expect(assertions["categories:performance"]?.[1].minScore).toBeGreaterThanOrEqual(0.5);
    expect(assertions["categories:accessibility"]?.[1].minScore).toBeGreaterThanOrEqual(0.95);
    expect(assertions["categories:seo"]?.[1].minScore).toBeGreaterThanOrEqual(0.95);
  });

  it("keeps CI running the launch smoke gate before publish verification", () => {
    const ciWorkflow = read(".github/workflows/ci.yml");
    const playwrightConfig = read("playwright.config.ts");
    const monkey = read("tests/monkey.spec.ts");
    const launchSmokeIndex = ciWorkflow.indexOf("npm run launch:smoke");
    const publishVerifyIndex = ciWorkflow.indexOf("Publish verification tests");

    expect(ciWorkflow).toContain("Launch smoke gate");
    expect(ciWorkflow).toContain("actions/checkout@v4");
    expect(ciWorkflow).toContain("actions/setup-node@v4");
    expect(ciWorkflow).not.toContain("FORCE_JAVASCRIPT_ACTIONS_TO_NODE24");
    expect(launchSmokeIndex).toBeGreaterThan(-1);
    expect(publishVerifyIndex).toBeGreaterThan(-1);
    expect(launchSmokeIndex).toBeLessThan(publishVerifyIndex);
    expect(ciWorkflow).toMatch(/quality:[\s\S]*timeout-minutes: 60/);
    expect(ciWorkflow).toContain('PW_USE_SYSTEM_CHROME: "1"');
    expect(ciWorkflow).toContain("google-chrome --version");
    expect(ciWorkflow).not.toContain("npx playwright install");
    expect(playwrightConfig).toContain("PW_USE_SYSTEM_CHROME");
    expect(playwrightConfig).toContain('channel: "chrome"');
    expect(monkey).toContain('waitUntil: "domcontentloaded"');
    expect(monkey).toContain('test.describe.configure({ mode: "serial" })');
    expect(monkey).toContain("await assertPageStillHealthy(page, errors)");
  });

  it("keeps the health endpoint safe for uptime monitors", () => {
    const healthRoute = read("src/app/api/health/route.ts");
    const productionReadiness = read("src/lib/production-readiness.ts");
    const commercialAudit = read("scripts/commercial-launch-audit.mjs");

    expect(healthRoute).toContain('status: "ok"');
    expect(healthRoute).toContain('service: "kozbeyli-konagi"');
    expect(healthRoute).toContain("getRuntimeReadiness");
    expect(productionReadiness).toContain("canonical_domain");
    expect(productionReadiness).toContain("production_database");
    expect(productionReadiness).toContain("DATABASE_URI");
    expect(productionReadiness).toContain("PAYLOAD_SECRET");
    expect(productionReadiness).toContain("localhost");
    expect(productionReadiness).toContain("production_abuse_controls");
    expect(productionReadiness).toContain("hms_booking_engine");
    expect(productionReadiness).toContain("OFFICIAL_HMS_BOOKING_ENGINE_HOST");
    expect(productionReadiness).toContain("OFFICIAL_HMS_BOOKING_ENGINE_URL");
    expect(productionReadiness).toContain("officialHmsBookingEnginePattern");
    expect(productionReadiness).toContain("code_fallback");
    expect(productionReadiness).toContain("fallbackApplied");
    expect(productionReadiness).toContain("invalidCount");
    expect(productionReadiness).toContain("placeholderCount");
    expect(productionReadiness).toContain("partial");
    expect(commercialAudit).toContain("configuredEnvCount");
    expect(commercialAudit).toContain("invalidEnvCount");
    expect(commercialAudit).toContain("production Postgres/Supabase connection string, not localhost");
    expect(commercialAudit).toContain("placeholderEnvCount");
    expect(commercialAudit).toContain("fallbackApplied");
    expect(read("scripts/production-cutover-plan.mjs")).toContain("envDiagnostics");
    expect(healthRoute).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(healthRoute).not.toContain("DATABASE_URI");
    expect(healthRoute).not.toContain("PAYLOAD_SECRET");
    expect(healthRoute).not.toContain("GARANTI_3D_STORE_KEY");
    expect(healthRoute).not.toContain("GA4_API_SECRET");
    expect(healthRoute).not.toContain("TURNSTILE_SECRET_KEY");
  });

  it("keeps unknown room slugs returning page-level 404s without static fallback errors", () => {
    const roomDetailRoute = read("src/app/odalar/[slug]/page.tsx");

    expect(roomDetailRoute).toContain("export const dynamicParams = true");
    expect(roomDetailRoute).toContain("notFound()");
    expect(roomDetailRoute).not.toContain("dynamicParams = false");
  });

  it("keeps sunset mode from degrading room-card text contrast", () => {
    const sunsetMode = read("src/components/sunset-mode.tsx");

    expect(sunsetMode).not.toContain("mix-blend-multiply");
    expect(sunsetMode).not.toContain("--soft: #1a1a1a");
    expect(sunsetMode).not.toContain("--white: #121212");
    expect(sunsetMode).not.toContain("background-color: #121212");
    expect(sunsetMode).not.toContain(".card, .section-alt, .feature-box");
    expect(sunsetMode).toContain("--soft: #efe7d9");
    expect(sunsetMode).toContain("--white: #fffaf2");
    expect(sunsetMode).toContain("--ivory: #fbf6eb");
    expect(sunsetMode).toContain("--gold: #8f611e");
    expect(sunsetMode).toContain("background-color: #fbf6eb");
    expect(sunsetMode).toContain('aria-hidden="true"');
  });

  it("keeps room browsing in a light product-inspection theme", () => {
    const roomsClient = read("src/components/rooms-client.tsx");
    const roomsPage = read("src/app/odalar/page.tsx");
    const enRoomsPage = read("src/app/en/odalar/page.tsx");
    const pageHero = read("src/components/page-hero.tsx");
    const globals = read("src/app/globals.css");
    const layout = read("src/app/layout.tsx");

    expect(roomsPage).toContain('await getDictionary("tr")');
    expect(roomsPage).toContain('initialLocale="tr"');
    expect(enRoomsPage).toContain('await getDictionary("en")');
    expect(enRoomsPage).toContain('initialLocale="en"');
    expect(roomsClient).toContain("initialDict");
    expect(roomsClient).toContain('<SiteHeader variant="solid" />');
    expect(roomsClient).toContain('tone="light"');
    expect(roomsClient).toContain("rooms-catalog-section");
    expect(roomsClient).toContain("room-card");
    expect(roomsClient).toContain('id="icerik-odalar"');
    expect(layout).toContain('<div id="icerik">{children}</div>');
    expect(pageHero).toContain('tone?: "dark" | "light"');
    expect(pageHero).toContain("page-hero-light");
    expect(globals).toContain(".page-hero-light");
    expect(globals).toContain("background-image: linear-gradient(180deg, #fbf7ed 0%, #f2ecdf 100%)");
    expect(globals).toContain(".rooms-catalog-section");
    expect(globals).toContain(".rooms-catalog-section .room-card .card-media");
    expect(globals).toContain("aspect-ratio: 4 / 3");
    expect(globals).toContain("#f7f1e7");
    expect(globals).toContain("rgba(255, 252, 246, 0.92)");
    expect(layout).toContain('{ media: "(prefers-color-scheme: dark)", color: "#fbf6eb" }');
  });

  it("keeps a repo-local design contract for brand and media decisions", () => {
    const design = read("DESIGN.md");
    const externalAudit = read("docs/external-agent-tooling-audit.md");
    const instagramReadiness = read("docs/instagram-integration-readiness.md");
    const globals = read("src/app/globals.css");

    expect(design).toContain("version: alpha");
    expect(design).toContain("Kozbeyli Konagi Heritage Hospitality");
    expect(design).toContain('primary: "#3D4A3B"');
    expect(design).toContain('accent: "#B3925C"');
    expect(design).toContain('textColor: "{colors.ink}"');
    expect(globals).toContain("--on-gold: #14161a");
    // Altin buton: fildisi yazi + derinlestirilmis altin (siyah-uzerine-altin
    // uyumsuzlugu giderildi). ::selection/video kontrolleri hala --on-gold (koyu) kullanir.
    expect(globals).toContain("background: linear-gradient(135deg, #a8824a, #74592e)");
    expect(globals).toContain("color: var(--ivory);\n    text-shadow: 0 1px 1px rgba(38, 28, 12, 0.28);");
    expect(design).toContain("real Kozbeyli Konagi property, food, room, event or approved brand assets");
    expect(design).toContain("reception until 24:00");
    expect(design).toContain("menu and room pricing conservative");
    expect(design).toContain("Don't let dark theme sections dominate rooms, gastronomy or product-inspection pages.");
    expect(externalAudit).toContain("No external repository was executed as an installer");
    expect(externalAudit).toContain("Added repo-local `DESIGN.md`");
    expect(externalAudit).toContain("Do not install as a live skill for this hotel site");
    expect(instagramReadiness).toContain("does not currently render a live Instagram feed");
    expect(instagramReadiness).toContain("Do not scrape Instagram HTML as a production dependency");
    expect(instagramReadiness).toContain("Do not use screenshots as if they were playable Reels");
  });

  it("keeps public menu pricing copy conservative because the menu is code-backed", () => {
    const trMenu = read("src/app/menu/page.tsx");
    const enMenu = read("src/app/en/menu/page.tsx");
    const menuData = read("src/data/menu.ts");
    const menuPageContent = read("src/components/menu-book.tsx");

    expect(menuData).toContain("price:");
    expect(menuPageContent).not.toContain("payload");
    expect(trMenu).toContain("Menü içerikleri, stok ve fiyatlar dönemsel olarak değişebilir");
    expect(trMenu).toContain("güncel bilgi ekibimizden teyit edilir");
    expect(enMenu).toContain("Menu items, availability and prices may change seasonally");
    expect(enMenu).toContain("confirms the current details before service");
  });

  it("keeps gastronomy story segments populated with real local media", () => {
    const gastronomy = read("src/components/gastronomy-page-content.tsx");

    for (const asset of [
      "/images/galeri/aksam-sofrasi.jpg",
      "/videos/mihlama-poster.jpg",
      "/videos/kahvalti-poster.jpg",
    ]) {
      expect(gastronomy).toContain(`image: "${asset}"`);
      expect(exists(`public${asset}`)).toBe(true);
    }

    expect(gastronomy).toContain('image: absoluteUrl("/images/galeri/aksam-sofrasi.jpg")');
    expect(gastronomy).toContain("image={segment.image}");
  });

  it("keeps cancellation and route-time claims legally conservative", () => {
    const trGuide = read("src/app/misafir-rehberi/page.tsx");
    const enGuide = read("src/app/en/misafir-rehberi/page.tsx");
    const llms = read("src/app/llms.txt/route.ts");
    const contactPage = read("src/app/iletisim/page.tsx");
    const enContactPage = read("src/app/en/iletisim/page.tsx");
    const contactClient = read("src/components/contact-client.tsx");
    const salesAgreement = read("src/app/mesafeli-satis-sozlesmesi/page.tsx");
    const dictionary = read("src/lib/dictionary.ts");
    const operationalPolicies = read("src/data/operational-policies.ts");

    for (const source of [trGuide, enGuide, llms, contactPage, enContactPage, contactClient, salesAgreement, dictionary]) {
      expect(source).not.toMatch(/48\s*(saat|hours)/i);
      expect(source).not.toMatch(/72\s*(saat|hours)/i);
      expect(source).not.toMatch(/ücretsiz iptal|free cancellation/i);
      expect(source).not.toMatch(/55\s*(dk|dakika|min|minutes)/i);
      expect(source).not.toMatch(/10[–-]15\s*(dk|dakika|min|minutes)/i);
    }

    expect(trGuide).toContain("rezervasyon kanalı, seçilen teklif, ödeme tipi");
    expect(enGuide).toContain("booking channel, selected offer, payment type");
    expect(dictionary).not.toContain("Esnek İptal");
    expect(dictionary).not.toContain("Flexible Cancellation");
    expect(dictionary).toContain("Koşullar Yazılı Teyit");
    expect(dictionary).toContain("Terms Confirmed in Writing");
    expect(contactClient).toContain("canlı yol tarifini");
    expect(llms).toContain("canlı yol tarifi önerilir");
    expect(llms).toContain("operationalPolicies.tr.parking");
    expect(llms).toContain("operationalPolicies.tr.pets");
    expect(operationalPolicies).toContain("Tesisin açık otopark alanı ve köy içi varış yönlendirmesi");
    expect(operationalPolicies).toContain("rezervasyon öncesinde yazılı teyit gerekir");
    expect(llms).not.toContain("Tesiste ücretsiz açık otopark");
    expect(llms).not.toContain("evcil hayvan dostu");
  });

  it("keeps public LLM and agent context evidence-gated", () => {
    const llms = read("src/app/llms.txt/route.ts");
    const llmContextGenerator = read("src/lib/ai/llm-context-generator.ts");
    const specialistHospitality = read("src/lib/ai/specialist-hospitality.ts");
    const llmContextRoute = read("src/app/api/llm-context/route.ts");
    const operationalPolicies = read("src/data/operational-policies.ts");
    const combined = [llms, llmContextGenerator, specialistHospitality, llmContextRoute].join("\n");

    for (const forbidden of [
      "Web sitesi üzerinden kredi kartıyla rezervasyon yapılabilir",
      "book directly through the website's reservation engine",
      "booking_engine_url",
      "https://kozbeylikonagi.com/rezervasyon",
      "Registered Cultural Heritage Site Class-1",
      "Ancient Cedar",
      "9.6/10",
      "9.7/10",
      "tripadvisor_score",
      "Acidity 0.2-0.4",
      "Asidite 0.2 - 0.4",
      "72 saatte",
      "Sismik dirençli",
      "Patronaj",
      "Antigravity-V1",
    ]) {
      expect(combined, `public LLM context must not contain ${forbidden}`).not.toContain(forbidden);
    }

    expect(llms).toContain("rezervasyon ekranı, WhatsApp, telefon veya e-posta");
    expect(llms).toContain("canlı online rezervasyon motoru yalnızca production HMS bağlantısı");
    expect(llms).toContain("operationalPolicies.en.parking");
    expect(llms).toContain("operationalPolicies.en.pets");
    expect(operationalPolicies).toContain("On-site open parking and village-arrival guidance are available");
    expect(operationalPolicies).toContain("Pet acceptance depends on room type");
    expect(llms).not.toContain("free open parking is available on site");
    expect(llms).not.toContain("the hotel is pet-friendly");
    expect(llms).toContain("A live online booking engine is used only when the production HMS URL is configured.");
    expect(llmContextGenerator).toContain("availability_confirmation_required");
    expect(llmContextGenerator).toContain("NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL");
    expect(llmContextGenerator).toContain("evidence_boundaries");
    expect(llmContextGenerator).toContain("Do not claim every room has sea view.");
    expect(specialistHospitality).toContain("avoid precise origin, age, acidity or process claims unless sourced");
    expect(specialistHospitality).toContain("never imply completed online booking or payment");
    expect(llmContextRoute).toContain("'X-Content-Policy': 'evidence-gated'");
    expect(llmContextRoute).not.toContain("X-Agentic-Architecture");
  });

  it("redirects indexed legacy HotelRunner paths to canonical public pages", () => {
    const nextConfig = read("next.config.ts");

    for (const expected of [
      '{ source: "/tr/room-type/:path*", destination: "/odalar", permanent: true }',
      '{ source: "/tr/blog", destination: "/deneyimler", permanent: true }',
      '{ source: "/en-US/pages/rooms-rates", destination: "/en/rooms", permanent: true }',
      '{ source: "/en-US/room-type/:path*", destination: "/en/rooms", permanent: true }',
      '{ source: "/en-US/blog", destination: "/en/experiences", permanent: true }',
    ]) {
      expect(nextConfig).toContain(expected);
    }
  });

  it("keeps lead API failure logging structured and free from raw payload dumps", () => {
    const leadRoute = read("src/app/api/lead/route.ts");

    expect(leadRoute).toContain('logEvent("error", "lead.submission_failed"');
    expect(leadRoute).toContain("maskIp(extractClientIp(req.headers))");
    expect(leadRoute).toContain('reason: error instanceof Error ? error.name : "UnknownError"');
    expect(leadRoute).not.toContain("console.error(\"Lead submission error:\"");
    expect(leadRoute).not.toContain("errField(error)");
  });

  it("keeps the client lead form from dumping submission errors to the browser console", () => {
    const leadForm = read("src/components/lead-form.tsx");

    expect(leadForm).toContain("} catch {");
    expect(leadForm).toContain("setStatus('error');");
    expect(leadForm).not.toContain("Lead submission failed");
    expect(leadForm).not.toContain("console.error");
    expect(leadForm).not.toContain("console.warn");
  });

  it("keeps the client lead form programmatically labelled and error-associated", () => {
    const leadForm = read("src/components/lead-form.tsx");

    for (const field of [
      "name",
      "phone",
      "email",
      "eventDate",
      "guestCount",
      "estimatedBudget",
      "type",
      "message",
    ]) {
      expect(leadForm).toContain(`htmlFor={fieldId("${field}")}`);
      expect(leadForm).toContain(`id={fieldId("${field}")}`);
      expect(leadForm).toContain(`aria-invalid={hasError("${field}") || undefined}`);
      expect(leadForm).toContain(`aria-describedby={hasError("${field}") ? errorId("${field}") : undefined}`);
    }

    expect(leadForm).toContain('className="sr-only"');
    expect(leadForm).toContain('role="alert"');
    expect(leadForm).toContain('color: "#c2410c"');
    expect(leadForm).not.toContain('color: "#b3925c"');
  });

  it("keeps retired urgency and immersion widgets deleted after trust review", () => {
    expect(exists("src/components/conversion-velocity.tsx")).toBe(false);
    expect(exists("src/components/atmospheric-immersion.tsx")).toBe(false);
  });

  it("keeps client error boundaries from dumping raw errors to the browser console", () => {
    const appError = read("src/app/error.tsx");
    const componentErrorBoundary = read("src/components/error-boundary.tsx");

    expect(appError).toContain('console.error("app_error_boundary")');
    expect(appError).not.toContain("console.error(error)");
    expect(componentErrorBoundary).toContain('console.error("client_error_boundary")');
    expect(componentErrorBoundary).not.toContain("Uncaught error:");
    expect(componentErrorBoundary).not.toContain("console.error(\"Uncaught error:\", error, errorInfo)");
    expect(componentErrorBoundary).not.toContain("errorInfo)");
  });

  it("publishes a dedicated location route with schema, hreflang and inventory coverage", () => {
    const trLocation = read("src/app/lokasyon/page.tsx");
    const enLocation = read("src/app/en/lokasyon/page.tsx");
    const locationContent = read("src/components/location-page-content.tsx");
    const sitemap = read("src/app/sitemap.ts");
    const footer = read("src/components/site-footer.tsx");
    const localizedRoutes = read("src/lib/localized-routes.ts");
    const publishReadiness = read("scripts/publish-readiness.mjs");
    const publishRoutes = read("tests/e2e/publish-routes.spec.ts");

    expect(trLocation).toContain('canonical: "/lokasyon"');
    expect(enLocation).toContain('canonical: "/en/location"');
    expect(locationContent).toContain('"@type": "LodgingBusiness"');
    expect(locationContent).toContain('"@type": "GeoCoordinates"');
    expect(locationContent).toContain('"@type": "BreadcrumbList"');
    expect(locationContent).toContain("KOZBEYLI_COORDS");
    expect(locationContent).toContain("MAPS_URL");
    expect(sitemap).toContain("'/lokasyon'");
    expect(footer).toContain('localizedHref("/lokasyon", englishPath)');
    expect(localizedRoutes).toContain('"/lokasyon": "/en/location"');
    expect(publishReadiness).toContain('"/lokasyon"');
    expect(publishReadiness).toContain('"/en/location"');
    expect(publishRoutes).toContain('"/lokasyon"');
    expect(publishRoutes).toContain('"/en/location"');
  });

  it("keeps server env helpers out of client components", () => {
    const clientFilesImportingServerEnv = listSourceFiles("src")
      .filter((file) => read(file).startsWith('"use client";'))
      .filter((file) => /from\s+["']@\/lib\/env["']/.test(read(file)));

    expect(clientFilesImportingServerEnv).toEqual([]);
  });

  it("keeps direct process.env reads out of client components", () => {
    const clientFilesReadingProcessEnv = listSourceFiles("src")
      .filter((file) => read(file).startsWith('"use client";'))
      .filter((file) => read(file).includes("process.env"));

    expect(clientFilesReadingProcessEnv).toEqual([]);
  });

  it("keeps the public env helper limited to public keys", () => {
    const publicEnvSource = read("src/lib/public-env.ts");
    const referencedEnvKeys = Array.from(publicEnvSource.matchAll(/process\.env\.([A-Z0-9_]+)/g))
      .map((match) => match[1]);
    const forbiddenServerEnvKeys = [
      "DATABASE_URI",
      "PAYLOAD_SECRET",
      "HOTELRUNNER_WEBHOOK_SECRET",
      "IYZICO_WEBHOOK_SECRET",
      "GA4_API_SECRET",
      "TURNSTILE_SECRET_KEY",
      "B2B_PARTNER_PUBLIC_KEY",
      "HMS_WEBHOOK_ES256_PUBLIC_KEY",
    ];

    expect(referencedEnvKeys.length).toBeGreaterThan(0);
    expect(referencedEnvKeys.every((key) => key.startsWith("NEXT_PUBLIC_"))).toBe(true);

    for (const key of forbiddenServerEnvKeys) {
      expect(publicEnvSource).not.toContain(key);
    }
  });
});
