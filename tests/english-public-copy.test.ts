import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { englishMenuSections } from "@/data/menu-en";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

const forbiddenEnglishMenuPatterns = [
  /Konağın Meze/i,
  /Konağımızda/i,
  /kişilik/i,
  /kişi başı/i,
  /\badet\b/i,
  /çeşit/i,
  /Şişe/i,
  /Kadeh/i,
  /Tereyağlı/i,
  /Kızarmış/i,
  /Baharatlı/i,
  /Peynir Tabağı/i,
  /Patates Kızartması/i,
  /Başlangıç Tabağı/i,
];

describe("English public copy contracts", () => {
  it("keeps the English menu free from unresolved Turkish menu labels", () => {
    const visibleCopy = englishMenuSections
      .flatMap((section) => [
        section.title,
        section.note,
        ...section.items.flatMap((item) => [item.name, item.description, item.price]),
      ])
      .filter(Boolean)
      .join("\n");

    for (const pattern of forbiddenEnglishMenuPatterns) {
      expect(visibleCopy, `English menu should not match ${pattern}`).not.toMatch(pattern);
    }
  });

  it("routes the English homepage menu call-to-action to the English menu", () => {
    const gastronomyEditorial = read("src/components/home/gastronomy-editorial.tsx");

    expect(gastronomyEditorial).toContain('href={locale === "en" ? "/en/menu" : "/menu"}');
    expect(gastronomyEditorial).not.toContain('href="/menu" className="button secondary"');
  });

  it("renders the English gallery through localized captions instead of the Turkish page default", () => {
    const englishGalleryPage = read("src/app/en/galeri/page.tsx");
    const galleryContent = read("src/components/gallery-page-content.tsx");

    const galleryLightbox = read("src/components/gallery-lightbox.tsx");
    expect(englishGalleryPage).toContain("<GalleryPageContent locale=\"en\" />");
    expect(englishGalleryPage).not.toContain("export default Page");
    // Yerellestirilmis basliklar lightbox bileseninde render edilir.
    expect(galleryLightbox).toContain("shot.caption[locale]");
    expect(galleryContent).toContain("FRAMES FROM THE MANSION");
  });

  it("does not let English room routes fall back to Turkish during client hydration", () => {
    const roomsClient = read("src/components/rooms-client.tsx");
    const roomDetailClient = read("src/components/room-detail-client.tsx");
    const englishRoomDetailPage = read("src/app/en/odalar/[slug]/page.tsx");
    const documentLocaleSync = read("src/components/document-locale-sync.tsx");
    const rootLayout = read("src/app/layout.tsx");

    expect(roomsClient).toContain("const locale = initialLocale;");
    expect(roomsClient).not.toContain("usePathname");
    expect(roomDetailClient).toContain("initialLocale = \"tr\"");
    expect(roomDetailClient).toContain("const locale = initialLocale;");
    expect(roomDetailClient).not.toContain("usePathname");
    expect(englishRoomDetailPage).toContain('<RoomDetailClient slug={slug} initialLocale="en" />');
    expect(rootLayout).toContain("<DocumentLocaleSync />");
    expect(documentLocaleSync).toContain("document.documentElement.lang = locale");
    expect(documentLocaleSync).toContain("document.documentElement.dataset.locale = locale");
  });

  it("keeps global English chrome free from Turkish-only utility copy", () => {
    const rootLayout = read("src/app/layout.tsx");
    const skipLink = read("src/components/skip-link.tsx");
    const footer = read("src/components/site-footer.tsx");
    const contactClient = read("src/components/contact-client.tsx");
    const locationPage = read("src/components/location-page-content.tsx");
    const sunsetMode = read("src/components/sunset-mode.tsx");
    const englishContactPage = read("src/app/en/iletisim/page.tsx");
    const englishLocationPage = read("src/app/en/lokasyon/page.tsx");
    const cookieConsent = read("src/components/cookie-consent.tsx");
    const paymentStep = read("src/components/payment-wizard/steps/payment-step.tsx");
    const englishCookiePolicy = read("src/app/en/cerez-politikasi/page.tsx");
    const englishPrivacy = read("src/app/en/gizlilik-politikasi/page.tsx");
    const englishKvkk = read("src/app/en/kvkk/page.tsx");
    const englishDistanceSales = read("src/app/en/mesafeli-satis-sozlesmesi/page.tsx");

    expect(rootLayout).toContain("<SkipLink />");
    expect(skipLink).toContain("Skip to content");
    expect(skipLink).toContain("İçeriğe atla");
    expect(footer).toContain("ADDRESS_EN");
    expect(footer).not.toContain("Kozbeyli Köyü Küme Evler No:188, Foça / İzmir");
    expect(contactClient).toContain("addressLine: ADDRESS_EN");
    expect(locationPage).toContain("address: ADDRESS_EN");
    expect(englishContactPage).toContain("ADDRESS_EN");
    expect(englishLocationPage).toContain("ADDRESS_EN");
    expect(footer).toContain('getLegalHref("cookies", "en")');
    expect(cookieConsent).toContain('getLegalHref("cookies", locale)');
    expect(paymentStep).toContain('getLegalHref("kvkk", wizard.locale)');
    expect(paymentStep).toContain('getLegalHref("privacy", wizard.locale)');
    expect(sunsetMode).toContain('group: "Appearance mode"');
    expect(sunsetMode).toContain('day: "Switch to morning view"');
    expect(sunsetMode).toContain('sunset: "Switch to evening view"');
    for (const source of [englishCookiePolicy, englishPrivacy, englishKvkk, englishDistanceSales]) {
      expect(source).toContain("EnglishLegalPage");
      expect(source).not.toContain("Çerez Politikası");
      expect(source).not.toContain("Gizlilik Politikası");
      expect(source).not.toContain("Mesafeli Satış Sözleşmesi");
    }
  });
});
