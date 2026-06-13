import { expect, test } from "@playwright/test";

// T19: prefers-reduced-motion emülasyonu altında ana sayfa erişilebilirliği.
// globals.css (@media (prefers-reduced-motion: reduce)) animasyon/geçiş
// sürelerini 0.01ms'e indirir ve `.hero-video { display: none !important; }`
// uygular (src/app/globals.css). Hero başlığı RevealLines ile `.hero` içinde
// h1 olarak render edilir (src/components/home/home-hero.tsx).

test.describe("Reduced Motion", () => {
  test("reduce modunda hero basligi gorunur, hero videosu gizlenir", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // (1) Animasyonlar kısaltılmış olsa da içerik görünür kalmalı.
    await expect(page.locator(".hero h1")).toBeVisible({ timeout: 15000 });

    // (2) Hero videosu: globals.css reduce modunda `.hero-video`'ya
    // display:none!important uyguladığından element DOM'daysa gizli olmalı.
    // HeroVideo client component'i hiç mount edilmemişse (ör. koşullu render)
    // count 0 da geçerli bir sonuçtur — bu durumda assertion atlanır.
    const v = page.locator(".hero-video");
    if ((await v.count()) > 0) {
      await expect(v).toBeHidden();
    }
  });
});
