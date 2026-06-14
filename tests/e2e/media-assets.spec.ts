import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const publicDir = path.join(process.cwd(), "public");
const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".mp4"]);
const mobileRoutes = ["/", "/odalar", "/gastronomi", "/menu", "/galeri", "/rezervasyon", "/organizasyonlar", "/en/menu", "/en/organizasyonlar"];
const visualRoutes = ["/", "/gastronomi", "/galeri", "/odalar", "/organizasyonlar", "/odalar/standart-bahce-manzarali-oda", "/en/menu", "/en/organizasyonlar"];
const playableVideoSelector = 'video[data-event^="video_play_"]';

test.describe.configure({ timeout: 120000 });

function listMediaFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMediaFiles(fullPath);
      if (!mediaExtensions.has(path.extname(entry.name).toLowerCase())) return [];
      return fullPath;
    })
    .sort();
}

function routeForFile(filePath: string) {
  return `/${path.relative(publicDir, filePath).replaceAll(path.sep, "/")}`;
}

async function collectVisibleBrokenImages(page: import("@playwright/test").Page) {
  return page.locator("img").evaluateAll((images) =>
    images
      .map((image) => image as HTMLImageElement)
      .filter((image) => {
        const rect = image.getBoundingClientRect();
        const style = window.getComputedStyle(image);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) !== 0
        );
      })
      .filter((image) => image.naturalWidth === 0 || image.naturalHeight === 0)
      .map((image) => image.currentSrc || image.getAttribute("src") || image.getAttribute("alt") || "unknown image")
  );
}

async function waitForVisibleImages(page: import("@playwright/test").Page) {
  await page
    .waitForFunction(
      () =>
        Array.from(document.images)
          .filter((image) => {
            const rect = image.getBoundingClientRect();
            const style = window.getComputedStyle(image);

            return (
              rect.width > 0 &&
              rect.height > 0 &&
              rect.bottom >= 0 &&
              rect.right >= 0 &&
              rect.top <= window.innerHeight &&
              rect.left <= window.innerWidth &&
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              Number(style.opacity) !== 0
            );
          })
          .every((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0),
      undefined,
      { timeout: 20000 }
    )
    .catch(() => {});
}

function isIgnorableMediaAbort(errorText: string, url: string) {
  return errorText.includes("net::ERR_ABORTED") && url.includes("/videos/");
}

test.describe("Media, video and mobile publish readiness", () => {
  test("all public hospitality media assets are present and served", async ({ request }) => {
    const mediaFiles = listMediaFiles(publicDir);

    expect(mediaFiles.length, "Expected hospitality media assets in public/").toBeGreaterThan(20);

    for (const filePath of mediaFiles) {
      const route = routeForFile(filePath);
      const stat = fs.statSync(filePath);
      const isVideo = route.endsWith(".mp4");
      const response = await request.get(route, isVideo ? { headers: { Range: "bytes=0-1023" } } : undefined);
      const contentType = response.headers()["content-type"] || "";

      expect(stat.size, `${route} should not be empty`).toBeGreaterThan(isVideo ? 1024 : 512);
      expect([200, 206], `${route} should be reachable`).toContain(response.status());
      expect(
        contentType,
        `${route} should have image/video content type, received ${contentType}`
      ).toMatch(isVideo ? /video\/mp4|application\/octet-stream/i : /image\//i);
    }
  });

  test("homepage first viewport does not preload below-fold kitchen videos", async ({ page }) => {
    const videoRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/videos/kahvalti.mp4") || url.includes("/videos/mihlama.mp4")) {
        videoRequests.push(url);
      }
    });

    const response = await page.goto("/", { waitUntil: "load" });
    expect(response?.status(), "/ should return usable HTML").toBeLessThan(400);
    await expect(page.getByRole("heading", { name: /Tarihin Kalbinde/i })).toBeVisible({
      timeout: 15000,
    });
    await page.waitForTimeout(1500);

    expect(videoRequests, videoRequests.join("\n")).toEqual([]);
  });

  for (const route of visualRoutes) {
    test(`${route} renders without broken visible images`, async ({ page }) => {
      const assetFailures: string[] = [];

      page.on("requestfailed", (request) => {
        const url = request.url();
        if (url.includes("/images/") || url.includes("/videos/") || url.includes("/_next/image")) {
          const errorText = request.failure()?.errorText || "request failed";
          if (!isIgnorableMediaAbort(errorText, url)) {
            assetFailures.push(`${errorText} ${url}`);
          }
        }
      });

      const response = await page.goto(route, { waitUntil: "load" });

      expect(response?.status(), `${route} should return usable HTML`).toBeLessThan(400);
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });

      const brokenImages = new Set<string>();
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);

      for (let y = 0; y <= scrollHeight; y += Math.max(320, Math.floor(viewportHeight * 0.75))) {
        await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
        await waitForVisibleImages(page);
        for (const image of await collectVisibleBrokenImages(page)) {
          brokenImages.add(image);
        }
      }

      const videosMissingSource = await page.locator("video").evaluateAll((videos) =>
        videos
          .filter((video) => video.getClientRects().length > 0)
          .map((video) => video as HTMLVideoElement)
          .filter((video) => !video.currentSrc && !video.querySelector("source")?.getAttribute("src"))
          .map((video) => video.getAttribute("aria-label") || video.getAttribute("poster") || "unknown video")
      );

      expect(assetFailures, assetFailures.join("\n")).toEqual([]);
      expect([...brokenImages], [...brokenImages].join("\n")).toEqual([]);
      expect(videosMissingSource, videosMissingSource.join("\n")).toEqual([]);
    });
  }

  test("/gastronomi videos can play real frames", async ({ page }) => {
    const response = await page.goto("/gastronomi", { waitUntil: "load" });
    expect(response?.status(), "/gastronomi should return usable HTML").toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Mutfaktan Canlı Kareler" })).toBeVisible({
      timeout: 15000,
    });

    const playbackResults = await page.locator(playableVideoSelector).evaluateAll(async (videos) => {
      const results: Array<{
        source: string;
        readyState: number;
        currentTime: number;
        paused: boolean;
        error?: string;
      }> = [];

      for (const video of videos) {
        const element = video as HTMLVideoElement;
        element.muted = true;
        element.preload = "auto";
        element.load();

        try {
          await element.play();
          await new Promise((resolve) => window.setTimeout(resolve, 900));
        } catch (error) {
          results.push({
            source: element.currentSrc || element.querySelector("source")?.getAttribute("src") || "unknown",
            readyState: element.readyState,
            currentTime: element.currentTime,
            paused: element.paused,
            error: error instanceof Error ? error.message : String(error),
          });
          continue;
        } finally {
          element.pause();
        }

        results.push({
          source: element.currentSrc || element.querySelector("source")?.getAttribute("src") || "unknown",
          readyState: element.readyState,
          currentTime: element.currentTime,
          paused: element.paused,
        });
      }

      return results;
    });

    expect(playbackResults).toHaveLength(3);
    expect(playbackResults, JSON.stringify(playbackResults, null, 2)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: expect.stringContaining("/videos/kahvalti.mp4") }),
        expect.objectContaining({ source: expect.stringContaining("/videos/mihlama.mp4") }),
        expect.objectContaining({ source: expect.stringContaining("/videos/chef.mp4") }),
      ])
    );

    for (const result of playbackResults) {
      expect(result.error, `${result.source} should not fail play()`).toBeUndefined();
      expect(result.readyState, `${result.source} should decode playable data`).toBeGreaterThanOrEqual(2);
      expect(result.currentTime, `${result.source} should advance playback`).toBeGreaterThan(0);
    }
  });

  for (const route of mobileRoutes) {
    test(`${route} has no mobile horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const response = await page.goto(route, { waitUntil: "load" });

      expect(response?.status(), `${route} should return usable HTML`).toBeLessThan(400);
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });

      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        return Math.max(root.scrollWidth, body.scrollWidth) - window.innerWidth;
      });

      expect(overflow, `${route} should not overflow horizontally on a 390px mobile viewport`).toBeLessThanOrEqual(1);
    });
  }
});
