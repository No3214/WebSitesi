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
});

test.describe("Iletisim sayfasi", () => {
  test("baslik, header ve footer render olur", async ({ page }) => {
    await page.goto("/iletisim");

    await expect(page.getByRole("heading", { name: "Konağa Ulaşın" })).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
  });
});
