import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type BrandIntegrityModule = {
  evaluateBrandIntegritySource: (args?: { baseDir?: string }) => {
    ready: boolean;
    findings: Array<{ rule: string; location: string; label: string }>;
  };
  evaluateBrandIntegrityLive: (args?: {
    origin?: string;
    routes?: string[];
    fetchImpl?: typeof fetch;
  }) => Promise<{
    ready: boolean;
    findings: Array<{ rule: string; location: string; label: string }>;
  }>;
  evaluateBrandIntegrityReadiness: (args?: {
    baseDir?: string;
    origin?: string;
    routes?: string[];
    fetchImpl?: typeof fetch;
  }) => Promise<{
    decision: string;
    blockers: string[];
  }>;
};

async function loadBrandIntegrityModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/brand-integrity-readiness.mjs")).href
  )) as BrandIntegrityModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-brand-integrity-"));
  tmpDirs.push(dir);
  return dir;
}

function writeFile(baseDir: string, relPath: string, content: string) {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function mockFetchByRoute(routes: Record<string, { status?: number; body: string }>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    const route = `${url.pathname}${url.search}`;
    const result = routes[route] || { status: 404, body: "not found" };
    return {
      status: result.status ?? 200,
      text: async () => result.body,
    } as Response;
  }) as typeof fetch;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("brand integrity readiness", () => {
  it("passes the current source tree brand-truth contract", async () => {
    const brandIntegrity = await loadBrandIntegrityModule();
    const result = brandIntegrity.evaluateBrandIntegritySource();

    expect(result.ready).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it("blocks stale public domain, wrong-property and low-end positioning terms in source", async () => {
    const brandIntegrity = await loadBrandIntegrityModule();
    const dir = makeTmpDir();

    writeFile(
      dir,
      "src/app/page.tsx",
      [
        "export default function Page(){",
        "return <main>www.kozbeylikonagi.com.tr Soleil Mansion budget motel Dijital Kahya</main>",
        "}",
      ].join("\n"),
    );

    const result = brandIntegrity.evaluateBrandIntegritySource({ baseDir: dir });
    const rules = result.findings.map((finding) => finding.rule);

    expect(result.ready).toBe(false);
    expect(rules).toContain("legacy_com_tr_domain");
    expect(rules).toContain("wrong_property_booking");
    expect(rules).toContain("weak_positioning");
    expect(rules).toContain("digital_concierge");
  });

  it("blocks unsafe live public copy even when source files are clean", async () => {
    const brandIntegrity = await loadBrandIntegrityModule();
    const dir = makeTmpDir();
    writeFile(dir, "src/app/page.tsx", "export default function Page(){return <main>Kozbeyli Konağı</main>}\n");

    const result = await brandIntegrity.evaluateBrandIntegrityReadiness({
      baseDir: dir,
      origin: "https://www.kozbeylikonagi.com",
      routes: ["/", "/en/rezervasyon"],
      fetchImpl: mockFetchByRoute({
        "/": { body: "<html>Kozbeyli Konağı</html>" },
        "/en/rezervasyon": { body: "<html>Direct Concierge for a 200-year-old story</html>" },
      }),
    });

    expect(result.decision).toBe("BRAND INTEGRITY BLOCKED");
    expect(result.blockers.join("\n")).toContain("digital concierge wording");
    expect(result.blockers.join("\n")).toContain("heritage story as 200 years old");
  });

  it("accepts clean live public routes", async () => {
    const brandIntegrity = await loadBrandIntegrityModule();
    const result = await brandIntegrity.evaluateBrandIntegrityLive({
      origin: "https://www.kozbeylikonagi.com",
      routes: ["/", "/api/llm-context"],
      fetchImpl: mockFetchByRoute({
        "/": { body: "<html>Kozbeyli Konağı | Foça taş otel</html>" },
        "/api/llm-context": {
          body: JSON.stringify({
            property: "Kozbeyli Konağı",
            not_a: ["pool resort", "roadside lodging positioning"],
          }),
        },
      }),
    });

    expect(result.ready).toBe(true);
    expect(result.findings).toEqual([]);
  });
});
