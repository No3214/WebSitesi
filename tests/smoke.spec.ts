import { test, expect } from "@playwright/test";

test("anasayfa açılıyor", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("KOZBEYLİ KONAĞI", { exact: false }).or(page.getByText("KOZBEYLI KONAGI", { exact: false })),
  ).toBeVisible({ timeout: 15000 });
});

test("odalar sayfası açılıyor", async ({ page }) => {
  await page.goto("/odalar");
  await expect(
    page.getByText("Rafine Oda ve Süitler", { exact: false }).or(page.getByText("Refined Rooms", { exact: false })),
  ).toBeVisible({ timeout: 15000 });
});

test("menü sayfası açılıyor", async ({ page }) => {
  await page.goto("/menu");
  await expect(
    page.getByText("Ege Lezzetleri", { exact: false }).or(page.getByText("Aegean Flavors", { exact: false })),
  ).toBeVisible({ timeout: 15000 });
});

test("organizasyonlar sayfası açılıyor", async ({ page }) => {
  await page.goto("/organizasyonlar");
  await expect(
    page
      .getByText("Sizin Hikayeniz, Bizim Mekanımız", { exact: false })
      .or(page.getByText("Your Story, Our Venue", { exact: false })),
  ).toBeVisible({ timeout: 15000 });
});
