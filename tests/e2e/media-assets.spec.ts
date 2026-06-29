import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const publicDir = path.join(process.cwd(), "public");
const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".mp4"]);
const mobileRoutes = [
  "/",
  "/odalar",
  "/gastronomi",
  "/menu",
  "/galeri",
  "/rezervasyon",
  "/organizasyonlar",
  "/hikayemiz",
  "/en/menu",
  "/en/dining",
  "/en/events",
  "/en/our-story",
];
const visualRoutes = [
  "/",
  "/gastronomi",
  "/galeri",
  "/odalar",
  "/organizasyonlar",
  "/hikayemiz",
  "/odalar/standart-bahce-manzarali-oda",
  "/en/menu",
  "/en/dining",
  "/en/events",
  "/en/our-story",
];
const playableVideoSelector = 'video[data-event^="video_play_"]';
const kitchenVideoSources = ["/videos/kahvalti.mp4", "/videos/mihlama.mp4", "/videos/chef.mp4"];
const consentStorageKey = "cookie_consent_v2";
const necessaryOnlyConsent = {
  version: "2026-03",
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: "2026-06-29T00:00:00.000Z",
};

test.describe.configure({ mode: "serial", timeout: 120000 });

async function seedNecessaryCookieConsent(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    [consentStorageKey, necessaryOnlyConsent] as const
  );
}

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
  return page.locator("img").evaluateAll(async (images) => {
    const visibleImages = images
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
      });

    const probes = visibleImages.map(async (image) => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) return null;

      const source = image.currentSrc || image.getAttribute("src") || "";
      if (!source) return image.getAttribute("alt") || "unknown image";

      return new Promise<string | null>((resolve) => {
        const probe = new Image();
        const timeout = window.setTimeout(() => resolve(source), 5000);
        probe.onload = () => {
          window.clearTimeout(timeout);
          resolve(null);
        };
        probe.onerror = () => {
          window.clearTimeout(timeout);
          resolve(source);
        };
        probe.src = source;
      });
    });

    return (await Promise.all(probes)).filter((source): source is string => Boolean(source));
  });
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

  test("mobile homepage editorial videos expose controls and can start real clips", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedNecessaryCookieConsent(page);
    const response = await page.goto("/", { waitUntil: "load" });

    expect(response?.status(), "/ should return usable HTML on mobile").toBeLessThan(400);

    for (const clip of [
      { testId: "editorial-video-kahvalti", source: "/videos/kahvalti.mp4", index: 0 },
      { testId: "editorial-video-mihlama", source: "/videos/mihlama.mp4", index: 1 },
    ]) {
      const button = page.getByTestId(clip.testId);
      const video = page.locator(".gastronomy-editorial-section video").nth(clip.index);

      await button.scrollIntoViewIfNeeded();
      await expect(button, `${clip.source} should keep a visible mobile play control`).toBeVisible();
      await expect(button).toHaveAttribute("data-state", /paused|blocked|playing/);

      const isClipPlaying = () =>
        video.evaluate((element, expectedSource) => {
          const media = element as HTMLVideoElement;
          const source = media.currentSrc || media.querySelector("source")?.getAttribute("src") || "";
          return (
            source.includes(expectedSource) &&
            media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            media.currentTime > 0 &&
            !media.paused
          );
        }, clip.source);

      if (!(await isClipPlaying())) {
        await button.click({ force: true });
      }

      await expect
        .poll(isClipPlaying, { timeout: 15000 })
        .toBe(true);

      await expect(button).toHaveAttribute("data-state", "playing");
      await button.click();
      await expect(button).toHaveAttribute("data-state", "paused");
    }
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

  for (const route of [
    {
      path: "/gastronomi",
      liveHeading: "Mutfaktan Canlı Kareler",
      menuHeading: "Konağın Seçili Lezzetleri",
      sampleHeadings: ["Kahvaltı", "Mezeler"],
      menuCta: "MENÜNÜN TAMAMINI GÖR",
      menuHref: "/menu",
    },
    {
      path: "/en/dining",
      liveHeading: "Live Frames from the Kitchen",
      menuHeading: "Selected Tastes of the Mansion",
      sampleHeadings: ["Breakfast", "Mezes"],
      menuCta: "VIEW FULL MENU",
      menuHref: "/en/menu",
    },
  ]) {
    test(`${route.path} gastronomy videos can play real frames`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: "load" });
      expect(response?.status(), `${route.path} should return usable HTML`).toBeLessThan(400);
      await expect(page.getByRole("heading", { name: route.liveHeading })).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByRole("heading", { name: route.menuHeading })).toBeVisible();
      for (const heading of route.sampleHeadings) {
        await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
      }
      await expect(page.getByRole("link", { name: route.menuCta })).toHaveAttribute("href", route.menuHref);

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
        expect.arrayContaining(
          kitchenVideoSources.map((source) => expect.objectContaining({ source: expect.stringContaining(source) }))
        )
      );

      for (const result of playbackResults) {
        expect(result.error, `${result.source} should not fail play()`).toBeUndefined();
        expect(result.readyState, `${result.source} should decode playable data`).toBeGreaterThanOrEqual(2);
        expect(result.currentTime, `${result.source} should advance playback`).toBeGreaterThan(0);
      }
    });
  }

  for (const route of [
    { path: "/gastronomi", heading: "Mutfaktan Canlı Kareler", playPattern: /oynat/i },
    { path: "/en/dining", heading: "Live Frames from the Kitchen", playPattern: /play/i },
  ]) {
    test(`mobile ${route.path} gastronomy video controls play breakfast, mihlama and chef clips`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await seedNecessaryCookieConsent(page);
      const response = await page.goto(route.path, { waitUntil: "load" });

      expect(response?.status(), `${route.path} should return usable HTML on mobile`).toBeLessThan(400);
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible({
        timeout: 15000,
      });

      for (const clip of [
        { event: "video_play_kahvalti", testId: "kitchen-video-play-kahvalti", source: "/videos/kahvalti.mp4" },
        { event: "video_play_mihlama", testId: "kitchen-video-play-mihlama", source: "/videos/mihlama.mp4" },
        { event: "video_play_chef", testId: "kitchen-video-play-chef", source: "/videos/chef.mp4" },
      ]) {
        const video = page.locator(`video[data-event="${clip.event}"]`);
        const button = page.getByTestId(clip.testId);

        await button.scrollIntoViewIfNeeded();
        await expect(button, `${clip.event} should expose a visible mobile play control`).toBeVisible();
        await expect(button).toHaveAttribute("aria-label", route.playPattern);
        await button.click();

        await expect
          .poll(
            async () =>
              video.evaluate((element, expectedSource) => {
                const media = element as HTMLVideoElement;
                const source = media.currentSrc || media.querySelector("source")?.getAttribute("src") || "";
                return (
                  source.includes(expectedSource) &&
                  media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
                  media.currentTime > 0 &&
                  !media.paused
                );
              }, clip.source),
            { timeout: 15000 }
          )
          .toBe(true);

        const playback = await video.evaluate((element) => {
          const media = element as HTMLVideoElement;
          const result = {
            currentTime: media.currentTime,
            readyState: media.readyState,
          };
          media.pause();
          return result;
        });

        expect(playback.readyState, `${clip.source} should decode data on mobile`).toBeGreaterThanOrEqual(2);
        expect(playback.currentTime, `${clip.source} should advance on mobile`).toBeGreaterThan(0);
      }
    });
  }

  test("story sunset video plays real frames on TR and EN story routes", async ({ page }) => {
    for (const route of [
      { path: "/hikayemiz", heading: "Kozbeyli'de Gün Batımı" },
      { path: "/en/our-story", heading: "Sunset in Kozbeyli" },
    ]) {
      const response = await page.goto(route.path, { waitUntil: "load" });
      expect(response?.status(), `${route.path} should return usable HTML`).toBeLessThan(400);
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible({ timeout: 15000 });

      const result = await page.locator('video[data-event="video_play_sunset"]').evaluate(async (video) => {
        const element = video as HTMLVideoElement;
        element.muted = true;
        element.preload = "auto";
        element.load();

        try {
          await element.play();
          await new Promise((resolve) => window.setTimeout(resolve, 900));
        } catch (error) {
          return {
            source: element.currentSrc || element.querySelector("source")?.getAttribute("src") || "unknown",
            readyState: element.readyState,
            currentTime: element.currentTime,
            paused: element.paused,
            error: error instanceof Error ? error.message : String(error),
          };
        } finally {
          element.pause();
        }

        return {
          source: element.currentSrc || element.querySelector("source")?.getAttribute("src") || "unknown",
          readyState: element.readyState,
          currentTime: element.currentTime,
          paused: element.paused,
        };
      });

      expect(result.source).toContain("/videos/sunset.mp4");
      expect(result.error, `${route.path} sunset video should not fail play()`).toBeUndefined();
      expect(result.readyState, `${route.path} sunset video should decode playable data`).toBeGreaterThanOrEqual(2);
      expect(result.currentTime, `${route.path} sunset video should advance playback`).toBeGreaterThan(0);
    }
  });

  test("mobile fixed contact controls do not overlap the bottom action bar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto("/rezervasyon?oda=standart-deniz-manzarali-oda", { waitUntil: "load" });

    expect(response?.status(), "/rezervasyon should return usable HTML").toBeLessThan(400);
    await expect(page.getByTestId("mobile-action-bar")).toBeVisible();
    await expect(page.getByTestId("floating-contact")).toBeVisible();

    const actionBar = await page.getByTestId("mobile-action-bar").boundingBox();
    const floatingContact = await page.getByTestId("floating-contact").boundingBox();

    expect(actionBar, "mobile action bar should have a box").not.toBeNull();
    expect(floatingContact, "floating contact should have a box").not.toBeNull();

    const overlap =
      Math.max(0, Math.min(actionBar!.x + actionBar!.width, floatingContact!.x + floatingContact!.width) - Math.max(actionBar!.x, floatingContact!.x)) *
      Math.max(0, Math.min(actionBar!.y + actionBar!.height, floatingContact!.y + floatingContact!.height) - Math.max(actionBar!.y, floatingContact!.y));

    expect(overlap, "floating contact should not cover the mobile bottom action bar").toBe(0);
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
