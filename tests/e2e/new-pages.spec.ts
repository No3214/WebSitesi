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

    await expect(page.getByRole("heading", { name: "Contact the Mansion" })).toBeVisible();
    await expect(page.getByText("Konağa Ulaşın")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "WhatsApp Support" })).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
    await expect(page.getByLabel("Estimated budget")).toBeVisible();
    await expect(page.getByText("Tahmini Bütçe")).toHaveCount(0);
    await expect(page.getByText("Butik Düğün")).toHaveCount(0);
  });

  test("EN organizasyon teklif formu Ingilizce kalir", async ({ page }) => {
    await page.goto("/en/organizasyonlar#teklif");

    await expect(page.getByRole("heading", { name: "Let Us Curate Your Event" })).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
    await expect(page.getByLabel("Event preference")).toBeVisible();
    await expect(page.getByText("Organizasyon Tercihi")).toHaveCount(0);
    await expect(page.getByText("Teklif Talebini Gönder")).toHaveCount(0);
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
