import { expect, test } from "@playwright/test";

// T19: prefers-reduced-motion emülasyonu altında ana sayfa erişilebilirliği.
// globals.css (@media (prefers-reduced-motion: reduce)) animasyon/geçiş
// sürelerini 0.01ms'e indirir. Açılış videosu ana ürün medyası olduğu için
// tamamen gizlenmez; poster ve video birlikte çalışır.

test.describe("Reduced Motion", () => {
  test("reduce modunda hero basligi gorunur ve acilis videosu erisilebilir kalir", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // (1) Animasyonlar kısaltılmış olsa da içerik görünür kalmalı.
    await expect(page.locator(".hero h1")).toBeVisible({ timeout: 15000 });

    // (2) Hero videosu açılışta görünür kalmalı; reduced-motion sadece geçişleri
    // kısaltır, ana ürün videosunu tamamen ortadan kaldırmaz.
    await expect(page.locator(".hero-video")).toBeVisible({ timeout: 6000 });
    await expect
      .poll(
        async () =>
          page.locator(".hero-video").evaluate((video) => {
            const element = video as HTMLVideoElement;
            return element.currentSrc || element.getAttribute("src") || "";
          }),
        { timeout: 6000 },
      )
      .toContain("/videos/hero.mp4");

    const mediaTransform = await page.locator(".hero-media").evaluate((element) => {
      return getComputedStyle(element).transform;
    });
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(mediaTransform);

    const lineTransforms = await page.locator(".hero h1 span").evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).transform)
    );
    expect(lineTransforms.every((value) => value === "none" || value === "matrix(1, 0, 0, 1, 0, 0)")).toBe(true);
  });
});
