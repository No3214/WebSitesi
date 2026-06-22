import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type WebhookSurfaceModule = {
  evaluateWebhookSurfaceReadiness: (args?: { baseDir?: string }) => {
    decision: string;
    blockers: string[];
    providers: Array<{
      id: string;
      checks: Array<{ id: string; ready: boolean; detail: string }>;
    }>;
  };
};

async function loadWebhookSurfaceModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/webhook-surface-readiness.mjs")).href
  )) as WebhookSurfaceModule;
}

function copyRequiredProjectFiles() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-webhook-surface-"));
  tmpDirs.push(dir);

  for (const relPath of [
    "src/lib/webhook-body-limit.ts",
    "src/app/api/webhook/hotelrunner/route.ts",
    "src/app/api/webhook/iyzico/route.ts",
    "tests/webhook-body-limit.test.ts",
  ]) {
    const target = path.join(dir, relPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, relPath), target);
  }

  return dir;
}

function readTmp(dir: string, relPath: string) {
  return fs.readFileSync(path.join(dir, relPath), "utf8");
}

function writeTmp(dir: string, relPath: string, source: string) {
  fs.writeFileSync(path.join(dir, relPath), source);
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("webhook surface readiness", () => {
  it("keeps HotelRunner and Iyzico webhook surfaces bounded and signed", async () => {
    const webhookSurface = await loadWebhookSurfaceModule();
    const result = webhookSurface.evaluateWebhookSurfaceReadiness();

    expect(result.decision).toBe("WEBHOOK SURFACE READY");
    expect(result.blockers).toEqual([]);
    expect(result.providers.map((provider) => provider.id)).toEqual(["hotelrunner", "iyzico"]);
  });

  it("blocks webhook routes that read unbounded request bodies", async () => {
    const webhookSurface = await loadWebhookSurfaceModule();
    const dir = copyRequiredProjectFiles();
    const hotelrunner = readTmp(dir, "src/app/api/webhook/hotelrunner/route.ts")
      .replace("import { readLimitedWebhookBody } from \"@/lib/webhook-body-limit\";\n", "")
      .replace(
        "const bodyResult = await readLimitedWebhookBody(req);\n  if (!bodyResult.ok) return bodyResult.response;\n  const bodyText = bodyResult.bodyText;",
        "const bodyText = await req.text();",
      );
    writeTmp(dir, "src/app/api/webhook/hotelrunner/route.ts", hotelrunner);

    const result = webhookSurface.evaluateWebhookSurfaceReadiness({ baseDir: dir });

    expect(result.decision).toBe("WEBHOOK SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("hotelrunner");
    expect(result.blockers.join("\n")).toContain("readLimitedWebhookBody");
    expect(result.blockers.join("\n")).toContain("const bodyText = await req.text();");
  });

  it("blocks helper regressions that remove the 64 KB payload ceiling", async () => {
    const webhookSurface = await loadWebhookSurfaceModule();
    const dir = copyRequiredProjectFiles();
    const helper = readTmp(dir, "src/lib/webhook-body-limit.ts").replace(
      "MAX_WEBHOOK_PAYLOAD_BYTES = 64_000",
      "MAX_WEBHOOK_PAYLOAD_BYTES = 640_000",
    );
    writeTmp(dir, "src/lib/webhook-body-limit.ts", helper);

    const result = webhookSurface.evaluateWebhookSurfaceReadiness({ baseDir: dir });

    expect(result.decision).toBe("WEBHOOK SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("64 KB webhook payload ceiling");
  });
});
