import { expect, test } from "@playwright/test";

async function waitForHeroVideoSource(page: import("@playwright/test").Page) {
  await expect
    .poll(
      async () =>
        page.locator(".hero-video").evaluate((video) => {
          const element = video as HTMLVideoElement;
          return element.currentSrc || element.getAttribute("src") || "";
        }),
      { timeout: 15000 }
    )
    .toContain("/videos/hero.mp4");
}

async function expectHeroVideoPlaying(page: import("@playwright/test").Page) {
  await waitForHeroVideoSource(page);
  await expect
    .poll(
      async () =>
        page.locator(".hero-video").evaluate((video) => {
          const element = video as HTMLVideoElement;
          return (
            !element.paused &&
            element.currentTime > 0 &&
            element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            getComputedStyle(element).opacity === "1"
          );
        }),
      { timeout: 15000 }
    )
    .toBe(true);
}

test.describe("Homepage hero video", () => {
  test("desktop shows the hero title and loads the cinematic intro video", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/", { waitUntil: "load" });

    await expect(page.locator(".hero h1")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".hero h1")).toContainText("Tarihin Kalbinde");
    await expectHeroVideoPlaying(page);
  });

  test("mobile also loads the cinematic intro video unless motion/data preferences block it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "load" });

    await expect(page.locator(".hero h1")).toBeVisible({ timeout: 15000 });
    await expectHeroVideoPlaying(page);

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      return Math.max(root.scrollWidth, body.scrollWidth) - window.innerWidth;
    });

    expect(overflow, "Homepage hero should not create mobile horizontal overflow").toBeLessThanOrEqual(1);
  });

  test("wedding event detail content and media are visible", async ({ page }) => {
    await page.goto("/organizasyonlar", { waitUntil: "load" });

    await expect(page.getByRole("heading", { name: "Hayalinizdeki Düğün İçin Kürasyon" })).toBeVisible();
    await expect(page.getByText("Her menü paketinde 6 çift konaklama ve kahvaltı dahildir.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fotoğraf & Video" })).toBeVisible();
    await expect(page.locator('img[alt*="düğün"]').first()).toBeVisible();
    await expect(page.locator('img[alt*="masa düzeni"]').first()).toBeVisible();
    await expect(page.locator("video.wedding-video")).toHaveCount(0);
  });
});
