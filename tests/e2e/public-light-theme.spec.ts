import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/odalar",
  "/odalar/standart-bahce-manzarali-oda",
  "/gastronomi",
  "/deneyimler",
  "/hikayemiz",
  "/organizasyonlar",
  "/menu",
  "/misafir-rehberi",
  "/teklifler",
  "/iletisim",
  "/lokasyon",
  "/rezervasyon",
  "/en/odalar",
  "/en/gastronomi",
];

function luminance(rgb: string) {
  const channels = rgb.match(/\d+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
  const [r, g, b] = channels.map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function lightThemeSnapshot(page: Page) {
  return page.evaluate(() => {
    const footer = document.querySelector("footer.footer");
    const root = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);

    return {
      rootIvory: root.getPropertyValue("--ivory").trim(),
      rootOlive: root.getPropertyValue("--olive").trim(),
      bodyBackground: body.backgroundColor,
      footerBackground: footer ? getComputedStyle(footer).backgroundColor : "",
      footerColor: footer ? getComputedStyle(footer).color : "",
      scrollOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
    };
  });
}

test.describe("Public light theme", () => {
  for (const route of publicRoutes) {
    test(`${route} keeps the warm stone theme loaded`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("footer.footer")).toBeVisible({ timeout: 15000 });

      const colors = await lightThemeSnapshot(page);
      expect(["#faf9f6", "#fbf6eb"], "Global CSS variables must be loaded").toContain(colors.rootIvory);
      expect(["#3d4a3b", "#354632"], "Global CSS variables must be loaded").toContain(colors.rootOlive);
      expect(luminance(colors.bodyBackground), colors.bodyBackground).toBeGreaterThan(0.82);
      expect(luminance(colors.footerBackground), colors.footerBackground).toBeGreaterThan(0.78);
      expect(luminance(colors.footerColor), colors.footerColor).toBeLessThan(0.16);
    });
  }

  test("mobile gastronomy and experiences pages avoid dark-theme overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ["/gastronomi", "/deneyimler"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("footer.footer")).toBeVisible({ timeout: 15000 });

      const colors = await lightThemeSnapshot(page);
      expect(luminance(colors.bodyBackground), `${route} body ${colors.bodyBackground}`).toBeGreaterThan(0.82);
      expect(luminance(colors.footerBackground), `${route} footer ${colors.footerBackground}`).toBeGreaterThan(0.78);
      expect(colors.scrollOverflow, `${route} mobile horizontal overflow`).toBeLessThanOrEqual(1);
    }
  });

  test("mobile navigation and room booking card stay on light stone surfaces", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/gastronomi", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /menüyü aç|open menu/i }).click();
    const menuBackground = await page.locator("#mobile-menu").evaluate((el) => getComputedStyle(el).backgroundColor);
    const firstMenuLinkColor = await page.locator("#mobile-menu a").first().evaluate((el) => getComputedStyle(el).color);
    expect(luminance(menuBackground), `mobile menu ${menuBackground}`).toBeGreaterThan(0.78);
    expect(luminance(firstMenuLinkColor), `mobile menu link ${firstMenuLinkColor}`).toBeLessThan(0.16);

    await page.goto("/odalar/standart-bahce-manzarali-oda", { waitUntil: "domcontentloaded" });
    const cardBackground = await page.locator(".booking-card-premium").evaluate((el) => getComputedStyle(el).backgroundColor);
    const cardTextColor = await page.locator(".booking-card-premium").evaluate((el) => getComputedStyle(el).color);
    expect(luminance(cardBackground), `booking card ${cardBackground}`).toBeGreaterThan(0.78);
    expect(luminance(cardTextColor), `booking card text ${cardTextColor}`).toBeLessThan(0.2);
  });
});
