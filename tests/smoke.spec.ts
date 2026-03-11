import { test, expect } from "@playwright/test";

test("anasayfa açılıyor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Kozbeyli Konağı")).toBeVisible();
});

test("odalar sayfası açılıyor", async ({ page }) => {
  await page.goto("/odalar");
  await expect(page.getByText("Kozbeyli Konağı oda tipleri")).toBeVisible();
});

test("menü sayfası açılıyor", async ({ page }) => {
  await page.goto("/menu");
  await expect(page.getByText("Mobil ve hızlı menü deneyimi")).toBeVisible();
});

test("organizasyonlar sayfası açılıyor", async ({ page }) => {
  await page.goto("/organizasyonlar");
  await expect(page.getByText("Organizasyonlar için ayrı satış alanı")).toBeVisible();
});
