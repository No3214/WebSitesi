import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
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
    const readinessScript = read("scripts/publish-readiness.mjs");

    expect(readinessScript).toContain('"IYZICO_WEBHOOK_SECRET"');
    expect(readinessScript).toContain('"test:monkey"');
    expect(readinessScript).toContain('"test:chaos"');
    expect(readinessScript).toContain('"test:stress"');
  });
});
