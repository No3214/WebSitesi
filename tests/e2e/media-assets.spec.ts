import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const publicDir = path.join(process.cwd(), "public");
const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".mp4"]);
const mobileRoutes = ["/", "/odalar", "/gastronomi", "/menu", "/galeri", "/rezervasyon", "/en/menu"];
const visualRoutes = ["/", "/gastronomi", "/galeri", "/odalar", "/odalar/standart-bahce-manzarali-oda", "/en/menu"];

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

  for (const route of visualRoutes) {
    test(`${route} renders without broken visible images`, async ({ page }) => {
      const assetFailures: string[] = [];

      page.on("requestfailed", (request) => {
        const url = request.url();
        if (url.includes("/images/") || url.includes("/videos/") || url.includes("/_next/image")) {
          assetFailures.push(`${request.failure()?.errorText || "request failed"} ${url}`);
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
        await page.waitForTimeout(250);
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
