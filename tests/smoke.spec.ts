import { test, expect } from "@playwright/test";

test("anasayfa açılıyor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("KOZBEYLİ KONAĞI", { exact: false })).toBeVisible({ timeout: 15000 });
});

test("odalar sayfası açılıyor", async ({ page }) => {
  page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()));
  page.on("pageerror", (err) => console.log("BROWSER ERROR:", err.message));
  await page.goto("/odalar");
  await expect(page).toHaveTitle(/Oda/i);
  await expect(page.locator("main").first()).toBeVisible({ timeout: 15000 });
});

test("menü sayfası açılıyor", async ({ page }) => {
  await page.goto("/menu");
  await expect(page.getByText("Doğadan Tabağa Ege Lezzetleri", { exact: false })).toBeVisible();
});

test("organizasyonlar sayfası açılıyor", async ({ page }) => {
  await page.goto("/organizasyonlar");
  await expect(page.getByText(/Sizin Hikayeniz, Bizim Mek[aâ]nımız/i)).toBeVisible();
});
