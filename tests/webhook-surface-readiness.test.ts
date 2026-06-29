import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type WebhookSurfaceModule = {
  evaluateWebhookSurfaceSource: (args?: { baseDir?: string }) => {
    ready: boolean;
    checks: Array<{ id: string; ready: boolean; detail: string }>;
  };
  evaluateWebhookSurfaceReadiness: (args?: { baseDir?: string }) => Promise<{
    decision: string;
    blockers: string[];
  }>;
};

async function loadWebhookSurfaceModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/webhook-surface-readiness.mjs")).href
  )) as WebhookSurfaceModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-webhook-surface-"));
  tmpDirs.push(dir);
  return dir;
}

function copyRequiredFixture(baseDir: string) {
  const files = [
    "package.json",
    "scripts/publish-readiness.mjs",
    "tests/security.spec.ts",
    "src/lib/webhook-body-limit.ts",
    "tests/webhook-body-limit.test.ts",
    "src/lib/security.ts",
    "src/app/api/webhook/hotelrunner/route.ts",
    "src/app/api/webhook/iyzico/route.ts",
  ];

  for (const file of files) {
    const target = path.join(baseDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, file), target);
  }
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("webhook surface readiness", () => {
  it("keeps the current webhook source contract ready", async () => {
    const webhookSurface = await loadWebhookSurfaceModule();
    const result = webhookSurface.evaluateWebhookSurfaceSource();

    expect(result.ready).toBe(true);
    expect(result.checks.find((check) => check.id === "hotelrunner_missing_signature")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "iyzico_missing_signature")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "body_limit_constant")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "hotelrunner_post_missing_signature_401")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "iyzico_get_405")).toMatchObject({
      ready: true,
    });
  });

  it("blocks readiness when webhook E2E coverage is removed", async () => {
    const webhookSurface = await loadWebhookSurfaceModule();
    const dir = makeTmpDir();
    copyRequiredFixture(dir);
    fs.writeFileSync(path.join(dir, "tests/security.spec.ts"), "import { test } from '@playwright/test';\n");

    const result = await webhookSurface.evaluateWebhookSurfaceReadiness({ baseDir: dir });

    expect(result.decision).toBe("WEBHOOK SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("hotelrunner_missing_signature");
    expect(result.blockers.join("\n")).toContain("webhook_get_no_status_leak");
  });

  it("blocks readiness when the 64KB webhook body limit is removed", async () => {
    const webhookSurface = await loadWebhookSurfaceModule();
    const dir = makeTmpDir();
    copyRequiredFixture(dir);
    fs.writeFileSync(
      path.join(dir, "src/lib/webhook-body-limit.ts"),
      "export async function readLimitedWebhookBody(req: Request) { return { ok: true, bodyText: await req.text(), sizeBytes: 0 }; }\n",
    );

    const result = webhookSurface.evaluateWebhookSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "body_limit_constant")).toMatchObject({
      ready: false,
    });
    expect(result.checks.find((check) => check.id === "body_limit_no_store")).toMatchObject({
      ready: false,
    });
  });

  it("blocks readiness if webhook route files are removed", async () => {
    const webhookSurface = await loadWebhookSurfaceModule();
    const dir = makeTmpDir();
    copyRequiredFixture(dir);
    fs.rmSync(path.join(dir, "src/app/api/webhook/iyzico/route.ts"));

    const result = webhookSurface.evaluateWebhookSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "iyzicoRoute_present")).toMatchObject({
      ready: false,
    });
  });

  it("blocks readiness if a webhook route leaks active provider status over GET", async () => {
    const webhookSurface = await loadWebhookSurfaceModule();
    const dir = makeTmpDir();
    copyRequiredFixture(dir);
    fs.writeFileSync(
      path.join(dir, "src/app/api/webhook/iyzico/route.ts"),
      'export function GET() { return Response.json({ active: true }); }\nexport async function POST() { return Response.json({ ok: true }); }\n',
    );

    const result = webhookSurface.evaluateWebhookSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "iyzico_get_405")).toMatchObject({
      ready: false,
    });
  });
});
