import { expect, test } from "@playwright/test";

test.describe("Cookie preferences control", () => {
  test("guest can reopen and downgrade cookie consent after accepting", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const dialog = page.getByRole("dialog", { name: "Çerez tercihleri" });
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await dialog.getByRole("button", { name: "Tümünü Kabul Et" }).click();
    await expect(dialog).toBeHidden();

    await page.locator("footer.footer").scrollIntoViewIfNeeded();
    await page.locator("footer.footer").getByRole("button", { name: "Çerez Tercihleri" }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Analitik çerezler")).toBeChecked();
    await expect(dialog.getByLabel("Pazarlama çerezleri")).toBeChecked();

    await dialog.getByLabel("Analitik çerezler").uncheck();
    await dialog.getByLabel("Pazarlama çerezleri").uncheck();
    await dialog.getByRole("button", { name: "Tercihleri Kaydet" }).click();
    await expect(dialog).toBeHidden();

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("cookie_consent_v2") || "{}"));
    expect(stored.analytics).toBe(false);
    expect(stored.marketing).toBe(false);
    expect(stored.necessary).toBe(true);
  });

  test("cookie policy page exposes the same preference control", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "cookie_consent_v2",
        JSON.stringify({
          version: "2026-03",
          necessary: true,
          analytics: false,
          marketing: false,
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto("/cerez-politikasi", { waitUntil: "load" });
    await page.getByRole("button", { name: "Çerez Tercihlerini Aç" }).click();

    const dialog = page.getByRole("dialog", { name: "Çerez tercihleri" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Tercihleri Kaydet" })).toBeVisible();
  });

  test("funnel helpers write dataLayer events only while analytics consent is active", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => {
      localStorage.setItem(
        "cookie_consent_v2",
        JSON.stringify({
          version: "2026-03",
          necessary: true,
          analytics: true,
          marketing: false,
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto("/odalar/standart-bahce-manzarali-oda", { waitUntil: "load" });
    await expect
      .poll(async () =>
        page.evaluate(() =>
          Boolean((window as typeof window & { dataLayer?: Array<{ event?: string }> }).dataLayer?.some((item) => item.event === "view_item")),
        ),
      )
      .toBe(true);

    await page.evaluate(() => {
      (window as typeof window & { dataLayer?: Array<{ event?: string }> }).dataLayer = [];
      localStorage.setItem(
        "cookie_consent_v2",
        JSON.stringify({
          version: "2026-03",
          necessary: true,
          analytics: false,
          marketing: false,
          updatedAt: new Date().toISOString(),
        }),
      );
      window.dispatchEvent(new CustomEvent("consent:updated"));
    });

    await page.goto("/odalar/standart-deniz-manzarali-oda", { waitUntil: "load" });
    await page.waitForTimeout(800);

    const events = await page.evaluate(
      () => (window as typeof window & { dataLayer?: Array<{ event?: string }> }).dataLayer?.map((item) => item.event) ?? [],
    );
    expect(events).not.toContain("view_item");
  });
});
