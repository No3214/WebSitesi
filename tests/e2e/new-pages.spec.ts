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
    await expect(main.getByRole("link", { name: "Explore Rooms" })).toHaveAttribute("href", "/en/odalar");
    await expect(main.getByRole("link", { name: "Guest Guide" })).toHaveAttribute("href", "/en/misafir-rehberi");
    await expect(main.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/en/iletisim");
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
