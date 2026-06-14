import { expect, test } from "@playwright/test";

// Güncellendi (2026-06-10): tasarım sistemi 2.0 sonrası gerçek selector'lar —
// header `.site-header`, footer `.footer`, başlıklar PageHero'dan gelir.

test.describe("Rezervasyon sayfasi", () => {
  test("baslik, header ve footer render olur", async ({ page }) => {
    await page.goto("/rezervasyon");

    await expect(page.getByRole("heading", { name: "Yerinizi Ayırtın" }).first()).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
  });

  test("EN rezervasyon sayfasi Ingilizce kalir ve destek linkleri /en rotalarina gider", async ({ page }) => {
    await page.goto("/en/rezervasyon?oda=standart-deniz-manzarali-oda");

    const main = page.locator("main");
    await expect(page.getByRole("heading", { name: "Reserve Your Stay" })).toBeVisible();
    await expect(main.getByText("Your choice:")).toBeVisible();
    await expect(main.getByText("Seçiminiz:")).toHaveCount(0);
    await expect(main.getByRole("heading", { name: "Dates and Guests" })).toBeVisible();
    await expect(main.getByText("Check-in Date")).toBeVisible();
    await expect(main.getByRole("button", { name: "List Rooms" })).toBeVisible();
    await expect(main.getByText("Tarih ve Konuk Seçimi")).toHaveCount(0);
    await expect(main.getByRole("link", { name: "Explore Rooms" })).toHaveAttribute("href", "/en/odalar");
    await expect(main.getByRole("link", { name: "Guest Guide" })).toHaveAttribute("href", "/en/misafir-rehberi");
    await expect(main.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/en/iletisim");
  });
});

test.describe("EN public localization", () => {
  test("EN ana sayfa ilk icerikte Ingilizce kalir ve CTA linkleri /en rotalarina gider", async ({ page }) => {
    await page.goto("/en");

    const main = page.locator("main");
    await expect(page.getByRole("heading", { name: "In the Heart of History An Elegant Aegean Escape" })).toBeVisible();
    await expect(main.getByText("Tarihin Kalbinde")).toHaveCount(0);
    await expect(main.getByRole("link", { name: "Book Now" })).toHaveAttribute("href", "/en/rezervasyon");
    await expect(main.getByRole("link", { name: "Plan an Event" })).toHaveAttribute("href", "/en/organizasyonlar");
    await expect(main.getByRole("link", { name: "Book Your Stay" })).toHaveAttribute("href", "/en/rezervasyon");
  });

  test("EN iletisim sayfasi Ingilizce destek metinleriyle acilir", async ({ page }) => {
    await page.goto("/en/iletisim");

    const footer = page.locator("footer.footer");

    await expect(page.getByRole("heading", { name: "Contact the Mansion" })).toBeVisible();
    await expect(page.getByText("Konağa Ulaşın")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "WhatsApp Support" })).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
    await expect(page.getByLabel("Estimated budget")).toBeVisible();
    await expect(footer.getByText("All rights reserved.")).toBeVisible();
    await expect(footer.getByText("Stone · Olive · Morning Sun")).toBeVisible();
    await expect(footer.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute("href", "/cerez-politikasi");
    await expect(page.getByRole("button", { name: "Open contact options" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Cookie preferences" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reject" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept All" })).toBeVisible();
    await expect(page.getByText("Tahmini Bütçe")).toHaveCount(0);
    await expect(page.getByText("Butik Düğün")).toHaveCount(0);
    await expect(page.getByText("Tüm hakları saklıdır")).toHaveCount(0);
    await expect(page.getByText("Taş · Zeytin · Sabah Güneşi")).toHaveCount(0);
    await expect(page.getByText("Çerez tercihleri")).toHaveCount(0);
    await expect(page.getByText("İletişim seçeneklerini aç")).toHaveCount(0);
  });

  test("EN organizasyon teklif formu Ingilizce kalir", async ({ page }) => {
    await page.goto("/en/organizasyonlar#teklif");

    await expect(page.getByRole("heading", { name: "Let Us Curate Your Event" })).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
    await expect(page.getByLabel("Event preference")).toBeVisible();
    await expect(page.getByText("Organizasyon Tercihi")).toHaveCount(0);
    await expect(page.getByText("Teklif Talebini Gönder")).toHaveCount(0);
  });

  test("EN gastronomy page body is localized", async ({ page }) => {
    await page.goto("/en/gastronomi");

    await expect(page.getByRole("heading", { name: "Culinary Heritage" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Live Frames from the Kitchen" })).toBeVisible();
    await expect(page.getByText("Gastronomi Mirası")).toHaveCount(0);
    await expect(page.getByText("Mutfaktan Canlı Kareler")).toHaveCount(0);
  });

  test("EN story page body is localized", async ({ page }) => {
    await page.goto("/en/hikayemiz");

    await expect(page.getByRole("heading", { name: "Our Story" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Heritage Discovery Map" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Heritage Archive: Visual Memory" })).toBeVisible();
    await expect(page.getByText("Hikayemiz")).toHaveCount(0);
    await expect(page.getByText("Miras Keşif Haritası")).toHaveCount(0);
  });

  test("EN FAQ page body is localized", async ({ page }) => {
    await page.goto("/en/sss");

    await expect(page.getByRole("heading", { name: "Before You Arrive" })).toBeVisible();
    await expect(page.getByText("What are the check-in / check-out times?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Your Stay" })).toHaveAttribute("href", "/en/rezervasyon");
    await expect(page.getByText("Merak Ettikleriniz")).toHaveCount(0);
    await expect(page.getByText("Organizasyon rezervasyonu nasıl yapılır?")).toHaveCount(0);
  });

  test("EN experiences page body is localized", async ({ page }) => {
    await page.goto("/en/deneyimler");

    await expect(page.getByRole("heading", { name: "Experience Kozbeyli" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aegean Gastronomy Route" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Read the Guide" }).first()).toBeVisible();
    await expect(page.getByText("Kozbeyli'yi Deneyimleyin")).toHaveCount(0);
    await expect(page.getByText("Ege Gastronomi Rotası")).toHaveCount(0);
  });
});

test.describe("Iletisim sayfasi", () => {
  test("baslik, header ve footer render olur", async ({ page }) => {
    await page.goto("/iletisim");

    await expect(page.getByRole("heading", { name: "Konağa Ulaşın" })).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
  });
});

test.describe("Global footer", () => {
  for (const route of ["/galeri", "/sss", "/deneyimler", "/teklifler", "/en/teklifler"]) {
    test(`${route} footer tek kez render olur`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator("footer.footer")).toHaveCount(1);
    });
  }
});
