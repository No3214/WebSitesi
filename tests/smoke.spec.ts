import { test, expect } from "@playwright/test";

test("anasayfa açılıyor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("KOZBEYLİ KONAĞI", { exact: false })).toBeVisible();
});

test("odalar sayfası açılıyor", async ({ page }) => {
  await page.goto("/odalar");
  await expect(page.getByText("Konaklamanın Ötesinde", { exact: false })).toBeVisible();
});

test("menü sayfası açılıyor", async ({ page }) => {
  await page.goto("/menu");
  await expect(page.getByText("Doğadan Tabağa Ege Lezzetleri", { exact: false })).toBeVisible();
});

test("organizasyonlar sayfası açılıyor", async ({ page }) => {
  await page.goto("/organizasyonlar");
  await expect(page.getByText("Sizin Hikayeniz, Bizim Mekanımız", { exact: false })).toBeVisible();
});
