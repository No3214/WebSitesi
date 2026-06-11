import { expect, test } from "@playwright/test";

// T17: LanguageSwitcher /en rota geçişi.
// Switcher header'da (`.lang-switcher` grubu) "TR" ve "EN" metinli iki buton
// render eder — accessible name buton metnidir (src/components/language-switcher.tsx).

test.describe("Dil degistirici", () => {
  test("EN secimi ana sayfayi /en rotasina tasir", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header.site-header")).toBeVisible();

    await page.getByRole("button", { name: "EN", exact: true }).click();

    await page.waitForURL("**/en");
    expect(new URL(page.url()).pathname).toBe("/en");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TR secimi /en onekini kaldirip Turkce rotaya dondurur", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("header.site-header")).toBeVisible();

    await page.getByRole("button", { name: "TR", exact: true }).click();

    await page.waitForURL((url) => !url.pathname.startsWith("/en"));
    expect(page.url()).not.toContain("/en");
    await expect(page.locator("body")).toBeVisible();
  });
});
