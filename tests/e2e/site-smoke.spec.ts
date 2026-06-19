import { expect, test } from "@playwright/test";

const HMS_BOOKING_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";

const smokePages = [
  "/",
  "/odalar",
  "/gastronomi",
  "/menu",
  "/organizasyonlar",
  "/misafir-rehberi",
  "/hikayemiz",
  "/deneyim-tasarimcisi",
  "/rezervasyon",
];

test.describe("Site geneli smoke", () => {
  for (const path of smokePages) {
    test(`${path} sayfasi yuklenir ve baslik render olur`, async ({ page }) => {
      const cspErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error" && /Content Security Policy/i.test(message.text())) {
          cspErrors.push(message.text());
        }
      });

      const response = await page.goto(path);

      expect(response, `${path} icin response alinamadi`).toBeTruthy();
      expect(response?.status(), `${path} HTTP hata kodu dondurdu`).toBeLessThan(400);
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
      expect(cspErrors, cspErrors.join("\n")).toHaveLength(0);
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

test.describe("Rezervasyon HMS handoff", () => {
  test("ana sayfa header ve rezervasyon bandi resmi HMS ekranina gider", async ({ page }) => {
    await page.goto("/");

    const headerBooking = page.locator("header.site-header").getByRole("link", { name: "Rezervasyon" });
    await expect(headerBooking).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(headerBooking).toHaveAttribute("target", "_blank");

    const heroBooking = page.locator(".hero").getByRole("link", { name: "Hemen Rezervasyon" });
    await expect(heroBooking).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(heroBooking).toHaveAttribute("target", "_blank");

    const bookingSection = page.locator("#rezervasyon");
    await expect(bookingSection.getByRole("heading", { name: "Rezervasyon", level: 2 })).toBeVisible();
    await expect(bookingSection.getByText("Rezervasyon Ekranı Ayrı Sekmede")).toHaveCount(0);
    await expect(bookingSection.getByText("Rezervasyonu Ayrı Sekmede Aç")).toHaveCount(0);
    await expect(bookingSection.getByRole("link", { name: "Rezervasyon" })).toHaveAttribute(
      "href",
      HMS_BOOKING_URL,
    );
  });

  test("mobil alt rezervasyon aksiyonu resmi HMS ekranina gider", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const mobileBooking = page
      .getByTestId("mobile-action-bar")
      .getByRole("link", { name: /Rezervasyon/i });
    await expect(mobileBooking).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(mobileBooking).toHaveAttribute("target", "_blank");
  });

  test("resmi HMS rezervasyon linki gorunur", async ({ page }) => {
    await page.goto("/rezervasyon");

    await expect(page.locator("main").getByRole("link", { name: "Rezervasyon" })).toHaveAttribute(
      "href",
      HMS_BOOKING_URL,
    );
    await expect(page.getByRole("link", { name: /WhatsApp/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Rezervasyon oda parametresi", () => {
  test("?oda= parametresi ile sayfa yuklenir ve WhatsApp linki gorunur", async ({ page }) => {
    const response = await page.goto("/rezervasyon?oda=standart-bahce-manzarali-oda");

    expect(response, "rezervasyon oda parametresi icin response alinamadi").toBeTruthy();
    expect(response?.status(), "rezervasyon oda parametresi HTTP hata kodu dondurdu").toBeLessThan(400);
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("main").getByRole("link", { name: "Rezervasyon" })).toHaveAttribute(
      "href",
      `${HMS_BOOKING_URL}&room=standart-bahce-manzarali-oda`,
    );
    await expect(page.getByRole("link", { name: /WhatsApp/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("oda detay rezervasyon CTA'si HMS'e oda parametresiyle gider", async ({ page }) => {
    await page.goto("/odalar/standart-bahce-manzarali-oda");

    await expect(page.getByRole("link", { name: "Müsaitliği Kontrol Et" })).toHaveAttribute(
      "href",
      `${HMS_BOOKING_URL}&room=standart-bahce-manzarali-oda`,
    );
  });

  test("English room detail CTA keeps the room parameter", async ({ page }) => {
    await page.goto("/en/odalar/standart-bahce-manzarali-oda");

    await expect(page.getByRole("link", { name: "Check Availability" })).toHaveAttribute(
      "href",
      `${HMS_BOOKING_URL}&room=standart-bahce-manzarali-oda`,
    );
  });
});

test.describe("API kontrati", () => {
  test("/api/local-pulse 200 doner ve generatedAt string icerir", async ({ request }) => {
    const response = await request.get("/api/local-pulse");

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(typeof json.generatedAt).toBe("string");
  });
});
