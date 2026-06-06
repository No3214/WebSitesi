import { expect, test } from "@playwright/test";

const smokePages = [
  "/",
  "/odalar",
  "/gastronomi",
  "/menu",
  "/organizasyonlar",
  "/misafir-rehberi",
  "/hikayemiz"
];

test.describe("Site geneli smoke", () => {
  for (const path of smokePages) {
    test(`${path} sayfasi yuklenir ve baslik render olur`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response, `${path} icin response alinamadi`).toBeTruthy();
      expect(response?.status(), `${path} HTTP hata kodu dondurdu`).toBeLessThan(400);
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe("Oda detay sayfasi", () => {
  test("gercek slug yuklenir ve baslik render olur", async ({ page }) => {
    const response = await page.goto("/odalar/standart-bahce-manzarali-oda");

    expect(response, "oda detayi icin response alinamadi").toBeTruthy();
    expect(response?.status(), "oda detayi HTTP hata kodu dondurdu").toBeLessThan(400);
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
  });

  test("bilinmeyen slug 404 doner (500 degil)", async ({ page }) => {
    const response = await page.goto("/odalar/boyle-bir-oda-yok");

    expect(response?.status(), "bilinmeyen slug 404 dondurmeli").toBe(404);
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Rezervasyon fallback", () => {
  test("HMS URL tanimli degilken WhatsApp linki gorunur", async ({ page }) => {
    await page.goto("/rezervasyon");

    await expect(page.getByRole("link", { name: /WhatsApp/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("API kontrati", () => {
  test("/api/local-pulse 200 doner ve generatedAt string icerir", async ({ request }) => {
    const res = await request.get("/api/local-pulse");

    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(typeof j.generatedAt).toBe("string");
  });
});
