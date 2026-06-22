import { expect, test } from "@playwright/test";

const HMS_BOOKING_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";

// Güncellendi (2026-06-10): tasarım sistemi 2.0 sonrası gerçek selector'lar —
// header `.site-header`, footer `.footer`, başlıklar PageHero'dan gelir.

test.describe("Rezervasyon sayfasi", () => {
  test("baslik, header ve footer render olur", async ({ page }) => {
    await page.goto("/rezervasyon");

    await expect(page.getByRole("heading", { name: "Rezervasyon" }).first()).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Rezervasyon" })).toHaveAttribute(
      "href",
      HMS_BOOKING_URL,
    );
  });

  test("EN rezervasyon sayfasi Ingilizce kalir ve destek linkleri /en rotalarina gider", async ({ page }) => {
    await page.goto("/en/rezervasyon?oda=uc-kisilik-oda");

    const main = page.locator("main");
    await expect(page.getByRole("heading", { name: "Booking", level: 1 })).toBeVisible();
    await expect(main.getByText("Your choice:")).toBeVisible();
    await expect(main.getByText("Triple Room")).toBeVisible();
    await expect(main.getByText("Seçiminiz:")).toHaveCount(0);
    await expect(main.getByText("Üç Kişilik Oda")).toHaveCount(0);
    await expect(main.getByRole("heading", { name: "Booking" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Booking" })).toHaveAttribute(
      "href",
      `${HMS_BOOKING_URL}&room=uc-kisilik-oda`,
    );
    await expect(main.getByText("Official HMS screen opens in a new tab")).toBeVisible();
    await expect(main.getByText("Card details are not stored on this site")).toBeVisible();
    await expect(main.getByRole("heading", { name: "Dates and Guests" })).toHaveCount(0);
    await expect(main.getByText("Check-in Date")).toHaveCount(0);
    await expect(main.getByRole("button", { name: "List Rooms" })).toHaveCount(0);
    await expect(main.getByText("Tarih ve Konuk Seçimi")).toHaveCount(0);
    await expect(main.getByRole("link", { name: "Explore Rooms" })).toHaveAttribute("href", "/en/odalar");
    await expect(main.getByRole("link", { name: "Guest Guide" })).toHaveAttribute("href", "/en/misafir-rehberi");
    await expect(main.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/en/iletisim");
  });
});

test.describe("EN public localization", () => {
  test("EN ana sayfa ilk icerikte Ingilizce kalir ve rezervasyon CTA'lari HMS'e gider", async ({ page }) => {
    await page.goto("/en");

    const main = page.locator("main");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.lang))
      .toBe("en");
    await expect(page.getByRole("heading", { name: "In the Heart of History An Elegant Aegean Escape" })).toBeVisible();
    await expect(main.getByText("Tarihin Kalbinde")).toHaveCount(0);
    await expect(main.getByRole("link", { name: "Book Now" })).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(main.getByRole("link", { name: "Book Now" })).toHaveAttribute("target", "_blank");
    await expect(main.getByRole("link", { name: "Plan an Event" })).toHaveAttribute("href", "/en/organizasyonlar");
    await expect(main.getByRole("link", { name: "Book Your Stay" })).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(main.getByRole("link", { name: "Book Your Stay" })).toHaveAttribute("target", "_blank");
  });

  test("EN rooms stay fully translated on mobile cards and detail pages", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/odalar");

    const main = page.locator("main");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.lang))
      .toBe("en");
    await expect(page.getByRole("heading", { name: "Refined Rooms & Suites" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Triple Room", exact: true })).toBeVisible();
    await expect(main.getByText("3 Adults · Village & Nature")).toBeVisible();
    await expect(main.getByText("Üç Kişilik Oda")).toHaveCount(0);
    await expect(main.getByText("3 Yetişkin")).toHaveCount(0);
    await expect(main.getByText("Köy ve Doğa")).toHaveCount(0);

    await page.goto("/en/odalar/uc-kisilik-oda");
    await expect(page.getByRole("heading", { name: "Triple Room" })).toBeVisible();
    await expect(page.getByText("3 Adults")).toBeVisible();
    await expect(page.getByText("Village & Nature")).toBeVisible();
    await expect(page.getByText("Üç Kişilik Oda")).toHaveCount(0);
    await expect(page.getByText("Yetişkin")).toHaveCount(0);
    await expect(page.getByText("Köy ve Doğa")).toHaveCount(0);
  });

  test("EN ana sayfa uppercase metinleri Ingilizce locale ile render eder", async ({ page }) => {
    await page.goto("/en");
    await page.waitForTimeout(1000);

    const bodyText = await page.locator("body").evaluate((element) => {
      return (element as HTMLElement).innerText;
    });

    expect(bodyText).toContain("FIVE-CENTURY VILLAGE TEXTURE");
    expect(bodyText).toContain("180-YEAR DIBEK RITUAL");
    expect(bodyText).toContain("AEGEAN & ANTAKYA CUISINE");
    expect(bodyText).not.toContain("ARCHİTECTURE");
    expect(bodyText).not.toContain("DİBEK");
    expect(bodyText).not.toContain("RİTUAL");
    expect(bodyText).not.toContain("CUİSİNE");
    expect(bodyText).not.toContain("VİLLAGE");
    expect(bodyText).not.toContain("LİVİNG");
    expect(bodyText).not.toContain("GUİDE");
    expect(bodyText).not.toContain("EXPERİENCE");
  });

  test("EN iletisim sayfasi Ingilizce destek metinleriyle acilir", async ({ page }) => {
    await page.goto("/en/iletisim");

    const footer = page.locator("footer.footer");

    await expect(page.getByRole("heading", { name: "Contact the Mansion" })).toBeVisible();
    await expect(page.getByText("Konağa Ulaşın")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "WhatsApp Support" })).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
    await expect(page.getByLabel("Estimated budget")).toBeVisible();
    await expect(footer.getByText("All rights reserved.")).toBeVisible();
    await expect(footer.getByText("Stone · Olive · Morning Sun")).toBeVisible();
    await expect(footer.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute("href", "/cerez-politikasi");
    await expect(footer.getByRole("button", { name: "Cookie Preferences" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open contact options" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Cookie preferences" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reject" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept All" })).toBeVisible();
    await expect(page.getByText("Tahmini Bütçe")).toHaveCount(0);
    await expect(page.getByText("Butik Düğün")).toHaveCount(0);
    await expect(page.getByText("Tüm hakları saklıdır")).toHaveCount(0);
    await expect(page.getByText("Taş · Zeytin · Sabah Güneşi")).toHaveCount(0);
    await expect(page.getByText("Çerez tercihleri")).toHaveCount(0);
    await expect(page.getByText("İletişim seçeneklerini aç")).toHaveCount(0);
  });

  test("EN organizasyon teklif formu Ingilizce kalir", async ({ page }) => {
    await page.goto("/en/organizasyonlar#teklif");

    await expect(page.getByRole("heading", { name: "Presentations and Information Forms" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Form" })).toHaveAttribute(
      "href",
      "/documents/events/kozbeyli-organizasyon-bilgi-formu.pdf",
    );
    await expect(page.getByRole("heading", { name: "Let Us Curate Your Event" })).toBeVisible();
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
    await expect(page.getByLabel("Event preference")).toBeVisible();
    await expect(page.getByText("Sunum ve Bilgi Formları")).toHaveCount(0);
    await expect(page.getByText("Organizasyon Tercihi")).toHaveCount(0);
    await expect(page.getByText("Teklif Talebini Gönder")).toHaveCount(0);
  });

  test("EN gastronomy page body is localized", async ({ page }) => {
    await page.goto("/en/gastronomi");

    await expect(page.getByRole("heading", { name: "Culinary Heritage" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Live Frames from the Kitchen" })).toBeVisible();
    await expect(page.getByText("Gastronomi Mirası")).toHaveCount(0);
    await expect(page.getByText("Mutfaktan Canlı Kareler")).toHaveCount(0);
  });

  test("EN story page body is localized", async ({ page }) => {
    await page.goto("/en/hikayemiz");

    await expect(page.getByRole("heading", { name: "Our Story" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Heritage Discovery Map" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Heritage Archive: Visual Memory" })).toBeVisible();
    await expect(page.getByText("Hikayemiz")).toHaveCount(0);
    await expect(page.getByText("Miras Keşif Haritası")).toHaveCount(0);
  });

  test("EN FAQ page body is localized", async ({ page }) => {
    await page.goto("/en/sss");

    await expect(page.getByRole("heading", { name: "Before You Arrive" })).toBeVisible();
    await expect(page.getByText("What are the check-in / check-out times?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Your Stay" })).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(page.getByRole("link", { name: "Book Your Stay" })).toHaveAttribute("target", "_blank");
    await expect(page.getByText("Merak Ettikleriniz")).toHaveCount(0);
    await expect(page.getByText("Organizasyon rezervasyonu nasıl yapılır?")).toHaveCount(0);
  });

  test("EN experiences page body is localized", async ({ page }) => {
    await page.goto("/en/deneyimler");

    await expect(page.getByRole("heading", { name: "Experience Kozbeyli" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aegean Gastronomy Route" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Read the Guide" }).first()).toBeVisible();
    await expect(page.getByText("Kozbeyli'yi Deneyimleyin")).toHaveCount(0);
    await expect(page.getByText("Ege Gastronomi Rotası")).toHaveCount(0);
  });

  test("EN restaurant menu uses English section and item copy", async ({ page }) => {
    await page.goto("/en/menu");

    const headerText = await page.locator("header.site-header").evaluate((element) => {
      return (element as HTMLElement).innerText;
    });

    expect(headerText).toContain("BOOKING");
    expect(headerText).toContain("EXPERIENCES");
    expect(headerText).not.toContain("BOOKİNG");
    expect(headerText).not.toContain("EXPERİENCES");
    await expect(page.getByRole("heading", { name: "Breakfast", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Warm Starters & Appetizers", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Main Courses", exact: true })).toBeVisible();
    await expect(page.getByText("Gourmet Village Breakfast")).toBeVisible();
    await expect(page.getByText("A Kozbeyli Morning")).toBeVisible();
    await expect(page.getByText("Kozbeyli'de Güne Başlamak")).toHaveCount(0);
    await expect(page.getByText("Gurme Serpme Kahvaltı")).toHaveCount(0);
    await expect(page.getByText("Akşam Yemeği Sonrası")).toHaveCount(0);
  });

  test("EN mobile conversion bar uses English uppercase casing", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/menu");

    const mobileActionText = await page.getByTestId("mobile-action-bar").evaluate((element) => {
      return (element as HTMLElement).innerText;
    });

    expect(mobileActionText).toContain("BOOKING");
    expect(mobileActionText).not.toContain("BOOKİNG");
  });
});

test.describe("Locale route precedence", () => {
  test("TR rotalar stale EN cookie varken de Turkce chrome ve sayfa metni kullanir", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.cookie = "NEXT_LOCALE=en; path=/; max-age=31536000";
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Tarihin Kalbinde Zarif Bir Ege Kaçamağı" })).toBeVisible();
    await expect(page.getByText("In the Heart of History")).toHaveCount(0);

    await page.goto("/odalar");
    await expect(page.getByRole("heading", { name: "Rafine Oda ve Süitler" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Müsaitlik Sorgula" })).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(page.getByRole("link", { name: "Müsaitlik Sorgula" })).toHaveAttribute("target", "_blank");
    await expect(page.locator("header.site-header").getByRole("link", { name: "Rezervasyon" })).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(page.locator("footer.footer").getByText("Tüm hakları saklıdır.")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Çerez tercihleri" })).toBeVisible();
    await expect(page.getByText("Refined Rooms & Suites")).toHaveCount(0);
    await expect(page.getByText("Cookie preferences")).toHaveCount(0);

    await page.goto("/iletisim");
    await expect(page.getByRole("heading", { name: "Konağa Ulaşın" })).toBeVisible();
    await expect(page.getByRole("link", { name: "WhatsApp Destek" })).toBeVisible();
    await expect(page.getByLabel("Tahmini bütçe")).toBeVisible();
    await expect(page.getByText("WhatsApp Support")).toHaveCount(0);
    await expect(page.getByLabel("Estimated budget")).toHaveCount(0);
  });
});

test.describe("Iletisim sayfasi", () => {
  test("baslik, header ve footer render olur", async ({ page }) => {
    await page.goto("/iletisim");

    await expect(page.getByRole("heading", { name: "Konağa Ulaşın" })).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
  });
});

test.describe("Global footer", () => {
  for (const route of ["/galeri", "/sss", "/deneyimler", "/teklifler", "/en/teklifler"]) {
    test(`${route} footer tek kez render olur`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator("footer.footer")).toHaveCount(1);
    });
  }
});
