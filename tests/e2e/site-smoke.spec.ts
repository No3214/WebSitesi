import { expect, test } from "@playwright/test";

const HMS_BOOKING_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";
const CONSENT_STORAGE_KEY = "cookie_consent_v2";
const CONSENT_VERSION = "2026-03";

const smokePages = [
  "/",
  "/odalar",
  "/gastronomi",
  "/menu",
  "/organizasyonlar",
  "/misafir-rehberi",
  "/hikayemiz",
  "/deneyim-tasarimcisi",
  "/rezervasyon"
];

async function prepareExitIntentTest(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ({ key, version }) => {
      window.sessionStorage.clear();
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version,
          necessary: true,
          analytics: false,
          marketing: false,
          updatedAt: new Date().toISOString(),
        }),
      );
    },
    { key: CONSENT_STORAGE_KEY, version: CONSENT_VERSION },
  );
}

test.describe("Site geneli smoke", () => {
  for (const path of smokePages) {
    test(`${path} sayfasi yuklenir ve baslik render olur`, async ({ page }) => {
      const cspErrors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && /Content Security Policy/i.test(m.text())) cspErrors.push(m.text());
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
    await expect(page.getByText("Resmi HMS ekranı yeni sekmede açılır")).toBeVisible();
    await expect(page.getByText("Kart bilgisi bu sitede saklanmaz").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /WhatsApp/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("exit-intent rezervasyon aksiyonu resmi HMS ekranina gider", async ({ page }) => {
    await prepareExitIntentTest(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.mouse.move(300, 300);
    await page.mouse.move(300, -10);

    const exitIntentDialog = page.getByRole("dialog", { name: "Direkt rezervasyon teklifi" });
    await expect(exitIntentDialog).toBeVisible();

    const exitIntentBooking = exitIntentDialog.getByRole("link", { name: "REZERVASYON YAP", exact: true });
    await expect(exitIntentBooking).toBeVisible();
    await expect(exitIntentBooking).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(exitIntentBooking).toHaveAttribute("target", "_blank");
  });

  test("ingilizce exit-intent resmi HMS ekranina ingilizce metinle gider", async ({ page }) => {
    await prepareExitIntentTest(page);
    await page.goto("/en");
    await page.waitForTimeout(500);

    await page.mouse.move(300, 300);
    await page.mouse.move(300, -10);

    const exitIntentDialog = page.getByRole("dialog", { name: "Direct booking offer" });
    await expect(exitIntentDialog).toBeVisible();
    await expect(exitIntentDialog.getByText("Official Direct Reservation")).toBeVisible();
    await expect(exitIntentDialog.getByText("Resmi Direkt Rezervasyon")).toHaveCount(0);

    const exitIntentBooking = exitIntentDialog.getByRole("link", { name: "BOOK NOW", exact: true });
    await expect(exitIntentBooking).toBeVisible();
    await expect(exitIntentBooking).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(exitIntentBooking).toHaveAttribute("target", "_blank");
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

    await expect(page.getByRole("link", { name: "EN İYİ FİYATLA YERİNİZİ AYIRIN" })).toHaveAttribute(
      "href",
      `${HMS_BOOKING_URL}&room=standart-bahce-manzarali-oda`,
    );
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
