import { expect, test } from "@playwright/test";

const EXPECTED_LAT = "38.713943";
const EXPECTED_LNG = "26.896018";

test.describe("Contact location", () => {
  test("iletisim haritasi ve yol tarifi Kozbeyli Konagi bina koordinatina gider", async ({ page }) => {
    await page.goto("/iletisim", { waitUntil: "load" });

    const directions = page.locator('[data-event="directions_click"]').first();
    await expect(directions).toHaveAttribute("href", new RegExp(`${EXPECTED_LAT}.*${EXPECTED_LNG}`));

    const mapSrc = await page.locator('iframe[title*="Kozbeyli Konağı Konum"]').getAttribute("src");
    expect(mapSrc).toContain(`marker=${EXPECTED_LAT},${EXPECTED_LNG}`);

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toContain(`"latitude":${EXPECTED_LAT}`);
    expect(jsonLd).toContain(`"longitude":${EXPECTED_LNG}`);
    expect(jsonLd).toContain("Kozbeyli Köyü Küme Evler No:188");
  });
});
