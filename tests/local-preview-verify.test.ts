import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const localPreviewModule = await import(pathToFileURL(path.join(root, "scripts/local-preview-verify.mjs")).href);
const { evaluateLocalPreview, formatLocalPreview } = localPreviewModule as {
  evaluateLocalPreview: (options: {
    baseUrl: string;
    fetchImpl: typeof fetch;
  }) => Promise<{
    ready: boolean;
    blockers: string[];
    health: { service: string };
    home: { hasOpeningHeroVideo: boolean; title: string };
  }>;
  formatLocalPreview: (result: {
    ready: boolean;
    origin: string;
    expectedHeroVideoSrc: string;
    health: { status: number; service: string };
    home: { status: number; title: string; hasOpeningHeroVideo: boolean };
    forbiddenSignatures: Array<{ id: string }>;
    blockers: string[];
  }) => string;
};

function makeFetch(routes: Record<string, { body: string; contentType?: string; status?: number }>) {
  return async (input: string | URL | Request) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const route = routes[url.pathname === "/" ? "/" : url.pathname];

    if (!route) {
      return new Response("not found", { status: 404 });
    }

    return new Response(route.body, {
      status: route.status ?? 200,
      headers: { "content-type": route.contentType ?? "text/plain" },
    });
  };
}

describe("local preview verifier", () => {
  it("passes only when the preview serves Kozbeyli health, title and hero video", async () => {
    const result = await evaluateLocalPreview({
      baseUrl: "http://localhost:3001",
      fetchImpl: makeFetch({
        "/api/health": {
          body: JSON.stringify({ status: "ok", service: "kozbeyli-konagi" }),
          contentType: "application/json",
        },
        "/": {
          body: "<html><head><title>Kozbeyli Konağı | Taş Otel</title></head><body>/videos/hero.mp4</body></html>",
          contentType: "text/html",
        },
      }) as typeof fetch,
    });

    expect(result.ready).toBe(true);
    expect(result.health.service).toBe("kozbeyli-konagi");
    expect(result.home.hasOpeningHeroVideo).toBe(true);
    expect(formatLocalPreview({
      ready: result.ready,
      origin: "http://localhost:3001",
      expectedHeroVideoSrc: "/videos/hero.mp4",
      health: { status: 200, service: result.health.service },
      home: { status: 200, title: result.home.title, hasOpeningHeroVideo: result.home.hasOpeningHeroVideo },
      forbiddenSignatures: [],
      blockers: [],
    })).toContain("LOCAL PREVIEW PASS");
  });

  it("blocks cross-project Ela Ebeoglu content even when health is otherwise valid", async () => {
    const result = await evaluateLocalPreview({
      baseUrl: "http://localhost:3001",
      fetchImpl: makeFetch({
        "/api/health": {
          body: JSON.stringify({ status: "ok", service: "kozbeyli-konagi" }),
          contentType: "application/json",
        },
        "/": {
          body: "<html><head><title>Ela Ebeoglu</title></head><body>/videos/hero.mp4</body></html>",
          contentType: "text/html",
        },
      }) as typeof fetch,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers.join("\n")).toContain("forbidden signature detected");
  });

  it("blocks non-Kozbeyli health services", async () => {
    const result = await evaluateLocalPreview({
      baseUrl: "http://localhost:3001",
      fetchImpl: makeFetch({
        "/api/health": {
          body: JSON.stringify({ status: "ok", service: "other-site" }),
          contentType: "application/json",
        },
        "/": {
          body: "<html><head><title>Kozbeyli Konagi</title></head><body>/videos/hero.mp4</body></html>",
          contentType: "text/html",
        },
      }) as typeof fetch,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers.join("\n")).toContain("expected kozbeyli-konagi");
  });
});
