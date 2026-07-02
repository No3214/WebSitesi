import { test, expect, type Page } from "@playwright/test";

/**
 * WAVE 8 — Görsel regresyon kilidi (Stone & Light Editorial).
 * Prompt v2 §24 determinizm kuralları:
 *  - reduced-motion zorlanır (animasyon/parallax/reveal devre dışı),
 *  - tüm CSS animasyon/transition'lar dondurulur,
 *  - videolar poster karesinde gizlenir (oynatma zamanına bağlı fark üretmesin),
 *  - cookie banner ve dinamik yüzeyler maskelenir,
 *  - font yüklenmesi beklenir.
 *
 * Koşum: PW_BASE_URL=<origin> PW_USE_SYSTEM_CHROME=1 npx playwright test tests/e2e/visual-regression.spec.ts
 * İlk koşumda baseline üretmek için: --update-snapshots
 */

// Canlı prod'da hero video preload + analytics nedeniyle "networkidle" hiç
// oturmaz; domcontentloaded + açık beklemeler kullanılır, süre 45s'e çıkarılır.
test.describe.configure({ timeout: 45_000 });

const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
] as const;

const ROUTES = [
  { name: "home", path: "/" },
  { name: "rooms", path: "/odalar" },
  { name: "story", path: "/hikayemiz" },
  { name: "gastronomy", path: "/gastronomi" },
] as const;

const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
  video { visibility: hidden !important; }
  .cookie-banner { display: none !important; }
`;

async function preparePage(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  // İlk ekran görsellerinin (lazy dahil) kararlı olması için sabit bekleme.
  await page.waitForTimeout(1200);
}

for (const viewport of VIEWPORTS) {
  test.describe(`visual @ ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of ROUTES) {
      test(`${route.name} above-the-fold stable`, async ({ page }) => {
        await preparePage(page, route.path);
        await expect(page).toHaveScreenshot(`${route.name}-${viewport.name}.png`, {
          fullPage: false,
          maxDiffPixelRatio: 0.02,
        });
      });
    }

    test("story rail section stable", async ({ page }) => {
      await preparePage(page, "/hikayemiz");
      const rail = page.locator(".story-rail-scenes");
      await rail.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await expect(rail).toHaveScreenshot(`story-rail-${viewport.name}.png`, {
        maxDiffPixelRatio: 0.02,
      });
    });
  });
}
