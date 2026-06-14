import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
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
  it("keeps Meta Pixel on the documented env key", () => {
    const trackedFiles = [
      "src/components/tracking-scripts.tsx",
      "src/components/consent-gated-scripts.tsx",
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

  it("keeps publish readiness aware of payment and stress gates", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const readinessScript = read("scripts/publish-readiness.mjs");

    expect(readinessScript).toContain('"IYZICO_WEBHOOK_SECRET"');
    expect(readinessScript).toContain('"GARANTI_3D_STORE_KEY"');
    expect(readinessScript).toContain('"test:monkey"');
    expect(readinessScript).toContain('"test:chaos"');
    expect(readinessScript).toContain('"test:stress"');
    expect(readinessScript).toContain('"launch:audit"');
    expect(readinessScript).toContain('"launch:audit:json"');
    expect(readinessScript).toContain('"launch:audit:strict"');
    expect(readinessScript).toContain('"launch:smoke"');
    expect(readinessScript).toContain('"launch:smoke:live"');
    expect(readinessScript).toContain('"release:verify"');
    expect(packageJson.scripts?.["launch:smoke"]).toBe("node scripts/launch-smoke.mjs");
    expect(packageJson.scripts?.["launch:smoke:live"]).toBe(
      "cross-env PW_BASE_URL=https://kozbeyli-konagi.vercel.app node scripts/launch-smoke.mjs",
    );
    expect(packageJson.scripts?.["release:verify"]).toBe("node scripts/release-verify.mjs");
    expect(readinessScript).toContain('"src/app/api/health/route.ts"');
    expect(readinessScript).toContain('"tests/e2e/health.spec.ts"');
    expect(readinessScript).toContain('"docs/evidence/README.md"');
    expect(readinessScript).toContain("evaluateCommercialLaunch");
  });

  it("keeps release verification orchestrating the full local release gate", () => {
    const releaseScript = read("scripts/release-verify.mjs");
    const ciWorkflow = read(".github/workflows/ci.yml");

    for (const gate of [
      "security:audit",
      "publish:verify",
      "launch:smoke",
      "test:stress",
      "launch:audit:json",
    ]) {
      expect(releaseScript).toContain(`script: "${gate}"`);
    }

    expect(releaseScript).toContain("--list");
    expect(releaseScript).toContain("process.env.ComSpec");
    expect(releaseScript).not.toContain("launch:audit:strict");
    expect(ciWorkflow).toContain("Release gate manifest");
    expect(ciWorkflow).toContain("node scripts/release-verify.mjs --list");
  });

  it("keeps the commercial launch audit executable and evidence-based", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const auditScript = read("scripts/commercial-launch-audit.mjs");
    const evidenceReadme = read("docs/evidence/README.md");

    expect(packageJson.scripts?.["launch:audit"]).toBe(
      "node scripts/commercial-launch-audit.mjs",
    );
    expect(packageJson.scripts?.["launch:audit:json"]).toBe(
      "node scripts/commercial-launch-audit.mjs --json",
    );
    expect(packageJson.scripts?.["launch:audit:strict"]).toBe(
      "node scripts/commercial-launch-audit.mjs --strict",
    );
    expect(auditScript).toContain("--json");

    for (const gate of [
      "hms-booking-engine.md",
      "garanti-pos.md",
      "analytics-purchase.md",
      "search-local-seo.md",
      "legal-dpa.md",
    ]) {
      expect(auditScript).toContain(gate);
      expect(evidenceReadme).toContain(gate);
    }
  });

  it("keeps launch smoke focused on public routes, hero video, location and media", () => {
    const launchSmokeScript = read("scripts/launch-smoke.mjs");

    expect(launchSmokeScript).toContain("tests/e2e/publish-routes.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/health.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/hero-video.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/contact-location.spec.ts");
    expect(launchSmokeScript).toContain("tests/e2e/media-assets.spec.ts");
    expect(launchSmokeScript).toContain("PW_BASE_URL");
    expect(launchSmokeScript).toContain("npm i -g vercel");
    expect(launchSmokeScript).toContain(".next/BUILD_ID");
    expect(launchSmokeScript).toContain("node_modules/@playwright/test/cli.js");
  });

  it("keeps CI running the launch smoke gate before publish verification", () => {
    const ciWorkflow = read(".github/workflows/ci.yml");
    const launchSmokeIndex = ciWorkflow.indexOf("npm run launch:smoke");
    const publishVerifyIndex = ciWorkflow.indexOf("Publish verification tests");

    expect(ciWorkflow).toContain("Launch smoke gate");
    expect(launchSmokeIndex).toBeGreaterThan(-1);
    expect(publishVerifyIndex).toBeGreaterThan(-1);
    expect(launchSmokeIndex).toBeLessThan(publishVerifyIndex);
    expect(ciWorkflow).toMatch(/quality:[\s\S]*timeout-minutes: 60/);
    expect(ciWorkflow).not.toContain("--with-deps");
  });

  it("keeps the health endpoint safe for uptime monitors", () => {
    const healthRoute = read("src/app/api/health/route.ts");

    expect(healthRoute).toContain('status: "ok"');
    expect(healthRoute).toContain('service: "kozbeyli-konagi"');
    expect(healthRoute).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(healthRoute).not.toContain("DATABASE_URI");
    expect(healthRoute).not.toContain("PAYLOAD_SECRET");
    expect(healthRoute).not.toContain("GARANTI_3D_STORE_KEY");
    expect(healthRoute).not.toContain("GA4_API_SECRET");
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
    expect(sunsetMode).toContain(".card .card-body h3");
    expect(sunsetMode).toContain(".card .card-body p");
    expect(sunsetMode).toContain(".card .card-body .meta");
    expect(sunsetMode).toContain("#f4efe6");
    expect(sunsetMode).toContain("#d7d1c7");
    expect(sunsetMode).toContain("#e0bf7a");
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
