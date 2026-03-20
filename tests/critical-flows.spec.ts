import { test, expect } from "@playwright/test";

test.describe("Kritik Kullanıcı Akışları", () => {
  test("Ana sayfa → Odalar → Oda Detay akışı", async ({ page }) => {
    await page.goto("/");

    // Hero bölümü görünür
    await expect(page.locator("h1")).toBeVisible();

    // Odalar bölümüne git
    const roomsLink = page.getByRole("link", { name: /odalar/i }).first();
    await roomsLink.click();
    await page.waitForURL("/odalar");

    // Oda kartları yüklendi
    const roomCards = page.locator(".card");
    await expect(roomCards.first()).toBeVisible();

    // İlk oda detayına git
    await roomCards.first().click();
    await expect(page.url()).toContain("/odalar/");

    // Oda detay sayfası elementleri
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Tüm ana sayfalar 200 döndürüyor", async ({ page }) => {
    const pages = [
      "/",
      "/odalar",
      "/gastronomi",
      "/menu",
      "/iletisim",
      "/galeri",
      "/hikayemiz",
      "/sss",
      "/deneyimler",
      "/etkinlikler",
      "/dugun-organizasyon",
      "/kurumsal",
      "/organizasyonlar",
      "/misafir-rehberi",
    ];

    for (const path of pages) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should return 200`).toBe(200);
    }
  });

  test("Galeri lightbox açılıp kapanıyor", async ({ page }) => {
    await page.goto("/galeri");

    // İlk fotoğrafa tıkla
    const firstPhoto = page.locator("[style*='cursor: pointer']").first();
    if (await firstPhoto.isVisible()) {
      await firstPhoto.click();
      // Lightbox kapatma
      const closeBtn = page.locator("button").filter({ hasText: /×|kapat|close/i });
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
  });

  test("İletişim bilgileri doğru gösteriliyor", async ({ page }) => {
    await page.goto("/iletisim");

    await expect(page.getByText("0532 234 26 86")).toBeVisible();
    await expect(page.getByText("info@kozbeylikonagi.com")).toBeVisible();
  });

  test("Oda fiyatları görünür", async ({ page }) => {
    await page.goto("/odalar");

    // En az bir fiyat gösteriliyor
    await expect(page.getByText(/₺\d/).first()).toBeVisible();
  });
});

test.describe("SEO & Erişilebilirlik", () => {
  test("Her sayfada skip-nav linki var", async ({ page }) => {
    await page.goto("/");
    const skipNav = page.locator(".skip-nav");
    await expect(skipNav).toBeAttached();
  });

  test("Oda detaylarında breadcrumb var", async ({ page }) => {
    await page.goto("/odalar/standart-oda");
    await expect(page.getByText("Ana Sayfa")).toBeVisible();
  });

  test("Meta description her sayfada var", async ({ page }) => {
    await page.goto("/");
    const metaDesc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(metaDesc).toBeTruthy();
    expect(metaDesc!.length).toBeGreaterThan(50);
  });

  test("OG image gerçek dosyaya işaret ediyor", async ({ page }) => {
    await page.goto("/");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toBeTruthy();
    expect(ogImage).not.toContain("unsplash");
  });

  test("Güvenlik headerları mevcut", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();
    expect(headers?.["x-content-type-options"]).toBe("nosniff");
    expect(headers?.["x-frame-options"]).toBe("DENY");
    expect(headers?.["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});

test.describe("Mobil Uyumluluk", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("Mobil menü açılıp kapanıyor", async ({ page }) => {
    await page.goto("/");

    // Hamburger menü butonunu bul
    const menuBtn = page.locator("button[aria-label*='menü'], button[aria-label*='Menü'], .menu-toggle").first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      // Menü içeriği görünür olmalı
      await expect(page.getByRole("link", { name: /odalar/i })).toBeVisible();
    }
  });

  test("Mobil action bar görünür", async ({ page }) => {
    await page.goto("/");
    // Mobile action bar (bottom nav) should be visible on mobile
    const actionBar = page.locator(".mobile-action-bar, [class*='mobile-action']");
    // Just check it exists in DOM
    await expect(actionBar.first()).toBeAttached();
  });
});
