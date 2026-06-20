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
    const enLink = page.locator("header.site-header .lang-switcher").getByRole("link", { name: "EN", exact: true });
    await expect(enLink).toHaveAttribute("href", "/en");

    await Promise.all([page.waitForURL("**/en"), enLink.click()]);
    expect(new URL(page.url()).pathname).toBe("/en");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TR secimi /en onekini kaldirip Turkce rotaya dondurur", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("header.site-header")).toBeVisible();
    const trLink = page.locator("header.site-header .lang-switcher").getByRole("link", { name: "TR", exact: true });
    await expect(trLink).toHaveAttribute("href", "/");

    await Promise.all([page.waitForURL((url) => !url.pathname.startsWith("/en")), trLink.click()]);
    expect(page.url()).not.toContain("/en");
    await expect(page.locator("body")).toBeVisible();
  });

  test("EN secimi desteklenen alt rotanin /en karsiligina gider", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.locator("header.site-header")).toBeVisible();
    const enLink = page.locator("header.site-header .lang-switcher").getByRole("link", { name: "EN", exact: true });
    await expect(enLink).toHaveAttribute("href", "/en/menu");

    await Promise.all([page.waitForURL("**/en/menu"), enLink.click()]);
    expect(new URL(page.url()).pathname).toBe("/en/menu");
    await expect(page.locator("main .menu-book-subtitle")).toHaveText("Restaurant Menu");
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
