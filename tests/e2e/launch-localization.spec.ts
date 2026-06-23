import { expect, test } from "@playwright/test";

const HMS_BOOKING_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";

test.describe("Launch localization smoke", () => {
  test("mobile English room browsing does not expose Turkish room copy", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/odalar");

    const main = page.locator("main");
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("en");
    await expect(page.getByRole("heading", { name: "Refined Rooms & Suites" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Triple Room", exact: true })).toBeVisible();
    await expect(main.getByText("3 Adults · Village & Nature")).toBeVisible();
    await expect(main.getByText("Üç Kişilik Oda")).toHaveCount(0);
    await expect(main.getByText("3 Yetişkin")).toHaveCount(0);
    await expect(main.getByText("Köy ve Doğa")).toHaveCount(0);

    await page.goto("/en/odalar/uc-kisilik-oda");

    await expect(page.getByRole("heading", { name: "Triple Room" })).toBeVisible();
    await expect(page.getByText("3 Adults")).toBeVisible();
    await expect(page.getByText("Village & Nature")).toBeVisible();
    await expect(page.getByText("Üç Kişilik Oda")).toHaveCount(0);
    await expect(page.getByText("Yetişkin")).toHaveCount(0);
    await expect(page.getByText("Köy ve Doğa")).toHaveCount(0);
  });

  test("Turkish room routes override stale English locale cookies", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => {
      document.cookie = "NEXT_LOCALE=en; path=/; max-age=31536000";
    });

    await page.goto("/odalar");

    const main = page.locator("main");
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("tr");
    await expect(page.getByRole("heading", { name: "Rafine Oda ve Süitler" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Üç Kişilik Oda", exact: true })).toBeVisible();
    await expect(main.getByText("3 Yetişkin · Köy ve Doğa")).toBeVisible();
    await expect(main.getByRole("link", { name: "Müsaitlik Sorgula" })).toHaveAttribute(
      "href",
      HMS_BOOKING_URL,
    );
    await expect(main.getByText("Triple Room")).toHaveCount(0);
    await expect(main.getByText("3 Adults")).toHaveCount(0);
    await expect(main.getByText("Village & Nature")).toHaveCount(0);
  });
});
