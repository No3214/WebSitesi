import { expect, test } from "@playwright/test";

const htmlRoutes = [
  "/",
  "/rezervasyon",
  "/odalar",
  "/odalar/standart-bahce-manzarali-oda",
  "/gastronomi",
  "/menu",
  "/organizasyonlar",
  "/misafir-rehberi",
  "/hikayemiz",
  "/deneyimler",
  "/deneyimler/kozbeyli-koyu-rehberi",
  "/deneyimler/foca-gezi-rehberi",
  "/deneyimler/ege-gastronomi-rotasi",
  "/deneyim-tasarimcisi",
  "/teklifler",
  "/galeri",
  "/sss",
  "/iletisim",
  "/lokasyon",
  "/odeme",
  "/kvkk",
  "/gizlilik-politikasi",
  "/cerez-politikasi",
  "/mesafeli-satis-sozlesmesi",
  "/en",
  "/en/booking",
  "/en/rooms",
  "/en/rooms/standart-bahce-manzarali-oda",
  "/en/dining",
  "/en/menu",
  "/en/events",
  "/en/guest-guide",
  "/en/our-story",
  "/en/experiences",
  "/en/offers",
  "/en/gallery",
  "/en/faq",
  "/en/contact",
  "/en/location",
  "/en/kvkk",
  "/en/gizlilik-politikasi",
  "/en/cerez-politikasi",
  "/en/mesafeli-satis-sozlesmesi",
];

const assetRoutes = ["/robots.txt", "/sitemap.xml", "/llms.txt", "/manifest.webmanifest"];

const legacyRedirects = [
  { from: "/tr/room-type/1247610", to: "/odalar" },
  { from: "/tr/blog", to: "/deneyimler" },
  { from: "/en-US/pages/rooms-rates", to: "/en/rooms" },
  { from: "/en-US/room-type/1187066", to: "/en/rooms" },
  { from: "/en-US/blog", to: "/en/experiences" },
];

test.describe("Publish route inventory", () => {
  test.describe.configure({ timeout: 120000 });

  for (const route of htmlRoutes) {
    test(`${route} returns usable HTML`, async ({ page }) => {
      const cspErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error" && /Content Security Policy/i.test(message.text())) {
          cspErrors.push(message.text());
        }
      });

      const response = await page.goto(route, { waitUntil: "load" });

      expect(response, `${route} did not return a response`).toBeTruthy();
      expect(response?.status(), `${route} returned an error status`).toBeLessThan(400);
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });
      await expect(page).toHaveTitle(/Kozbeyli Konağı|Kozbeyli Konagi/i);
      expect(cspErrors, cspErrors.join("\n")).toHaveLength(0);
    });
  }

  for (const route of assetRoutes) {
    test(`${route} is reachable`, async ({ request }) => {
      const response = await request.get(route);

      expect(response.status(), `${route} returned an error status`).toBeLessThan(400);
      expect((await response.text()).length, `${route} body should not be empty`).toBeGreaterThan(20);
    });
  }

  for (const redirect of legacyRedirects) {
    test(`${redirect.from} permanently redirects to ${redirect.to}`, async ({ request }) => {
      const response = await request.get(redirect.from, { maxRedirects: 0 });

      expect(response.status()).toBe(308);
      expect(response.headers().location).toBe(redirect.to);
    });
  }
});
