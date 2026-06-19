import { expect, test, type Page } from "@playwright/test";

async function forceSunsetMode(page: Page) {
  await page.route("**/api/local-pulse", async (route) => {
    const now = Date.now();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        sun: {
          sunrise: new Date(now + 60 * 60 * 1000).toISOString(),
          sunset: new Date(now - 60 * 60 * 1000).toISOString(),
        },
      }),
    });
  });
}

function luminance(rgb: string) {
  const channels = rgb.match(/\d+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
  const [r, g, b] = channels.map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function colorSnapshot(page: Page) {
  return page.evaluate(() => {
    const hero = document.querySelector(".page-hero");
    const card = document.querySelector(".room-card");
    const cardBody = document.querySelector(".room-card .card-body");

    return {
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      heroBackground: hero ? getComputedStyle(hero).backgroundColor : "",
      cardBackground: card ? getComputedStyle(card).backgroundColor : "",
      cardBodyBackground: cardBody ? getComputedStyle(cardBody).backgroundColor : "",
      rootWhite: getComputedStyle(document.documentElement).getPropertyValue("--white").trim(),
      rootSoft: getComputedStyle(document.documentElement).getPropertyValue("--soft").trim(),
      rootIvory: getComputedStyle(document.documentElement).getPropertyValue("--ivory").trim(),
    };
  });
}

async function waitForSunsetPalette(page: Page) {
  await expect
    .poll(
      async () =>
        page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ivory").trim()),
      { timeout: 10000 },
    )
    .toBe("#fbf6eb");
}

test.describe("Sunset light theme", () => {
  test("rooms page stays warm and light when sunset mode is active", async ({ page }) => {
    await forceSunsetMode(page);
    await page.goto("/odalar", { waitUntil: "load" });

    await expect(page.locator(".page-hero h1")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".room-card").first()).toBeVisible();
    await waitForSunsetPalette(page);

    const colors = await colorSnapshot(page);
    expect(colors.rootWhite).toBe("#fffaf2");
    expect(colors.rootSoft).toBe("#efe7d9");
    expect(colors.rootIvory).toBe("#fbf6eb");
    expect(luminance(colors.bodyBackground), colors.bodyBackground).toBeGreaterThan(0.82);
    expect(luminance(colors.heroBackground), colors.heroBackground).toBeGreaterThan(0.78);
    expect(luminance(colors.cardBackground), colors.cardBackground).toBeGreaterThan(0.82);
    expect(luminance(colors.cardBodyBackground), colors.cardBodyBackground).toBeGreaterThan(0.82);

    await expect(page.locator(".sunset-mode-overlay")).toHaveCSS("pointer-events", "none");
    await expect(page.locator(".sunset-mode-indicator")).toHaveCount(1);
  });

  test("mobile rooms page keeps the light theme without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await forceSunsetMode(page);
    await page.goto("/odalar", { waitUntil: "load" });

    await expect(page.locator(".page-hero h1")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".room-card").first()).toBeVisible();
    await waitForSunsetPalette(page);

    const colors = await colorSnapshot(page);
    expect(luminance(colors.bodyBackground), colors.bodyBackground).toBeGreaterThan(0.82);
    expect(luminance(colors.cardBackground), colors.cardBackground).toBeGreaterThan(0.82);

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      return Math.max(root.scrollWidth, body.scrollWidth) - window.innerWidth;
    });

    expect(overflow, "Light room theme should not create mobile horizontal overflow").toBeLessThanOrEqual(1);

    const firstCardTop = await page.locator(".room-card").first().evaluate((node) => node.getBoundingClientRect().top);
    expect(firstCardTop, "First room card should not be buried below the mobile fold").toBeLessThan(844);
  });

  test("english rooms page and room detail keep sunset palette stable", async ({ page }) => {
    await forceSunsetMode(page);
    await page.goto("/en/odalar", { waitUntil: "load" });
    await expect(page.locator(".room-card").first()).toBeVisible({ timeout: 15000 });
    await waitForSunsetPalette(page);

    let colors = await colorSnapshot(page);
    expect(luminance(colors.bodyBackground), colors.bodyBackground).toBeGreaterThan(0.82);
    expect(luminance(colors.cardBodyBackground), colors.cardBodyBackground).toBeGreaterThan(0.82);

    await page.goto("/odalar/standart-bahce-manzarali-oda", { waitUntil: "load" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await waitForSunsetPalette(page);

    colors = await colorSnapshot(page);
    expect(luminance(colors.bodyBackground), colors.bodyBackground).toBeGreaterThan(0.82);
  });
});
