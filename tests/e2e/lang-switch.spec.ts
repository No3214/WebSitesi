import { expect, test } from "@playwright/test";

const HMS_BOOKING_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";

// T17: LanguageSwitcher /en rota geçişi.
// Switcher header'da (`.lang-switcher` grubu) "TR" ve "EN" metinli iki link
// render eder — href navigasyonu hydration yarışlarından bağımsız kalır.

test.describe("Dil degistirici", () => {
  test("EN secimi ana sayfayi /en rotasina tasir", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header.site-header")).toBeVisible();
    const enLink = page.locator("header.site-header .lang-switcher").getByRole("link", { name: "EN", exact: true });
    await expect(enLink).toHaveAttribute("href", "/en");

    await Promise.all([page.waitForURL("**/en", { waitUntil: "domcontentloaded" }), enLink.click()]);
    expect(new URL(page.url()).pathname).toBe("/en");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TR secimi /en onekini kaldirip Turkce rotaya dondurur", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header.site-header")).toBeVisible();
    const trLink = page.locator("header.site-header .lang-switcher").getByRole("link", { name: "TR", exact: true });
    await expect(trLink).toHaveAttribute("href", "/");

    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/en"), { waitUntil: "domcontentloaded" }),
      trLink.click(),
    ]);
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

  test("EN secimi mobil oda katalog kartlarini da Ingilizceye tasir", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/odalar");
    await expect(page.locator("header.site-header")).toBeVisible();
    const enLink = page.locator("header.site-header .lang-switcher").getByRole("link", { name: "EN", exact: true });
    await expect(enLink).toHaveAttribute("href", "/en/rooms");

    await Promise.all([page.waitForURL("**/en/rooms"), enLink.click()]);

    const main = page.locator("main");
    const mobileActionBar = page.getByTestId("mobile-action-bar");
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("en");
    await expect(page.getByRole("heading", { name: "Refined Rooms & Suites" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Triple Room", exact: true })).toBeVisible();
    await expect(main.getByText("3 Adults · Village & Nature")).toBeVisible();
    await expect(mobileActionBar.getByText("Booking", { exact: true })).toBeVisible();
    await expect(mobileActionBar.getByText("REZERVASYON", { exact: true })).toHaveCount(0);
    await expect(main.getByText("Üç Kişilik Oda")).toHaveCount(0);
    await expect(main.getByText("3 Yetişkin")).toHaveCount(0);
    await expect(main.getByText("Köy ve Doğa")).toHaveCount(0);
  });

  test("EN secimi oda detayinda oda metnini de Ingilizceye tasir", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/odalar/uc-kisilik-oda");
    await expect(page.locator("header.site-header")).toBeVisible();
    const enLink = page.locator("header.site-header .lang-switcher").getByRole("link", { name: "EN", exact: true });
    await expect(enLink).toHaveAttribute("href", "/en/rooms/uc-kisilik-oda");

    await Promise.all([page.waitForURL("**/en/rooms/uc-kisilik-oda"), enLink.click()]);

    await expect(page.getByRole("heading", { name: "Triple Room" })).toBeVisible();
    await expect(page.getByText("3 Adults")).toBeVisible();
    await expect(page.getByText("Village & Nature")).toBeVisible();
    await expect(page.getByText("Üç Kişilik Oda")).toHaveCount(0);
    await expect(page.getByText("Yetişkin")).toHaveCount(0);
    await expect(page.getByText("Köy ve Doğa")).toHaveCount(0);
  });

  test("EN header navigasyonu Turkce rotalara dusmez", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
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
