import { expect, test } from "@playwright/test";

const HMS_BOOKING_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";

// T17: LanguageSwitcher /en rota geçişi.
// Switcher header'da (`.lang-switcher` grubu) "TR" ve "EN" metinli iki link
// render eder — href navigasyonu hydration yarışlarından bağımsız kalır.

test.describe("Dil degistirici", () => {
  test("EN secimi ana sayfayi /en rotasina tasir", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header.site-header")).toBeVisible();

    await page.getByRole("link", { name: "EN", exact: true }).click();

    await page.waitForURL("**/en");
    expect(new URL(page.url()).pathname).toBe("/en");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TR secimi /en onekini kaldirip Turkce rotaya dondurur", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("header.site-header")).toBeVisible();

    await page.getByRole("link", { name: "TR", exact: true }).click();

    await page.waitForURL((url) => !url.pathname.startsWith("/en"));
    expect(page.url()).not.toContain("/en");
    await expect(page.locator("body")).toBeVisible();
  });

  test("EN secimi desteklenen alt rotanin /en karsiligina gider", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.locator("header.site-header")).toBeVisible();

    await page.getByRole("link", { name: "EN", exact: true }).click();

    await page.waitForURL("**/en/menu");
    expect(new URL(page.url()).pathname).toBe("/en/menu");
    await expect(page.getByText("Restaurant Menu")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Breakfast", exact: true })).toBeVisible();
  });

  test("EN header navigasyonu Turkce rotalara dusmez", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("header.site-header")).toBeVisible();

    await expect(page.locator("header.site-header .nav-link").first()).toHaveAttribute(
      "href",
      /^\/en\//
    );
    await expect(page.locator("header.site-header").getByRole("link", { name: "Booking" })).toHaveAttribute(
      "href",
      HMS_BOOKING_URL
    );
  });
});
