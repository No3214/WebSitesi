import { expect, test } from "@playwright/test";

type EditorialBounds = {
  containerLeft: number;
  containerRight: number;
  copyLeft: number;
  copyRight: number;
  headingLeft: number;
};

async function getKitchenEditorialBounds(page: import("@playwright/test").Page): Promise<EditorialBounds> {
  return page.getByRole("heading", { name: "İnci Hanım'ın Mutfağı" }).evaluate((heading) => {
    const section = heading.closest(".gastronomy-editorial-section");
    const container = section?.querySelector(".container");
    const copy = heading.closest(".editorial-copy");

    if (!section || !container || !copy) {
      throw new Error("Kitchen editorial layout nodes were not found");
    }

    const containerRect = container.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();

    return {
      containerLeft: containerRect.left,
      containerRight: containerRect.right,
      copyLeft: copyRect.left,
      copyRight: copyRect.right,
      headingLeft: headingRect.left,
    };
  });
}

test.describe("Homepage editorial layout", () => {
  test("kitchen copy keeps a safe left margin on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    const response = await page.goto("/", { waitUntil: "load" });

    expect(response?.status(), "/ should return usable HTML").toBeLessThan(400);
    const heading = page.getByRole("heading", { name: "İnci Hanım'ın Mutfağı" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 15000 });

    const bounds = await getKitchenEditorialBounds(page);
    expect(bounds.containerLeft, "editorial container should not be full-bleed").toBeGreaterThanOrEqual(24);
    expect(bounds.headingLeft, "heading should not be clipped against the viewport").toBeGreaterThanOrEqual(40);
    expect(bounds.copyLeft, "copy should stay inside the editorial container").toBeGreaterThanOrEqual(bounds.containerLeft - 1);
    expect(bounds.copyRight, "copy should stay inside the editorial container").toBeLessThanOrEqual(bounds.containerRight + 1);
  });

  test("kitchen copy keeps a safe left margin on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto("/", { waitUntil: "load" });

    expect(response?.status(), "/ should return usable HTML").toBeLessThan(400);
    const heading = page.getByRole("heading", { name: "İnci Hanım'ın Mutfağı" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 15000 });

    const bounds = await getKitchenEditorialBounds(page);
    expect(bounds.containerLeft, "mobile editorial container should keep page padding").toBeGreaterThanOrEqual(19);
    expect(bounds.headingLeft, "mobile heading should not touch the viewport edge").toBeGreaterThanOrEqual(19);
    expect(bounds.copyLeft, "mobile copy should stay inside the editorial container").toBeGreaterThanOrEqual(bounds.containerLeft - 1);
    expect(bounds.copyRight, "mobile copy should stay inside the editorial container").toBeLessThanOrEqual(bounds.containerRight + 1);
  });
});
