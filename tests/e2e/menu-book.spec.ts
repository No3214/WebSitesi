import { expect, test } from "@playwright/test";

test.describe("Restaurant menu book design", () => {
  test("TR menu uses the uploaded menu-book visual system with verified data", async ({ page }) => {
    await page.goto("/menu");

    const menuBook = page.locator(".menu-book");
    await expect(menuBook).toBeVisible();
    await expect(page.locator(".menu-book-header h1")).toHaveText("Kozbeyli Konağı");
    await expect(page.getByText("Restoran Menüsü")).toBeVisible();
    await expect(page.getByText("Gurme Serpme Kahvaltı", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Beylerbeyi Göbek 100cl")).toBeVisible();
    await expect(page.getByText("Termos Çay")).toBeVisible();
    await expect(page.getByText("500 yıllık taş konak")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Menü kategorileri" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Mezeler 5 ürün/ })).toHaveAttribute("href", "#mezeler");
    await expect(page.getByText("Şarap Eşleşmesi").first()).toBeVisible();
    await expect(page.getByText("Öneri: Paşaeli SYS veya CSKS")).toBeVisible();

    const backgroundImage = await menuBook.evaluate((element) => {
      return getComputedStyle(element).backgroundImage;
    });
    const titleColor = await page.locator(".menu-book-header h1").evaluate((element) => {
      return getComputedStyle(element).color;
    });

    expect(backgroundImage).toContain("linear-gradient");
    expect(titleColor).toBe("rgb(196, 162, 101)");
  });

  test("mobile menu book stays within the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/menu");

    await expect(page.locator(".menu-book")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Menü kategorileri" })).toBeVisible();
    const overflow = await page.evaluate(() => {
      return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth;
    });

    expect(overflow).toBeLessThanOrEqual(1);
  });
});
