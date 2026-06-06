import { expect, test } from "@playwright/test";

test.describe("Rezervasyon sayfasi", () => {
  test("baslik, header ve footer render olur", async ({ page }) => {
    await page.goto("/rezervasyon");

    await expect(page.getByRole("heading", { name: "Konağınızı Şimdi Ayırtın" })).toBeVisible();
    await expect(page.locator("header.premium-header")).toBeVisible();
    await expect(page.locator("footer.footer-premium")).toBeVisible();
  });
});

test.describe("Iletisim sayfasi", () => {
  test("baslik, header ve footer render olur", async ({ page }) => {
    await page.goto("/iletisim");

    await expect(page.getByRole("heading", { name: "Size Nasıl Yardımcı Olabiliriz?" })).toBeVisible();
    await expect(page.locator("header.premium-header")).toBeVisible();
    await expect(page.locator("footer.footer-premium")).toBeVisible();
  });
});
