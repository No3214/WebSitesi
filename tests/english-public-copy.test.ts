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

  it("renders the English gallery through localized captions instead of the Turkish page default", () => {
    const englishGalleryPage = read("src/app/en/galeri/page.tsx");
    const galleryContent = read("src/components/gallery-page-content.tsx");

    expect(englishGalleryPage).toContain("<GalleryPageContent locale=\"en\" />");
    expect(englishGalleryPage).not.toContain("export default Page");
    expect(galleryContent).toContain("shot.caption[locale]");
    expect(galleryContent).toContain("FRAMES FROM THE MANSION");
  });

  it("does not let English room routes fall back to Turkish during client hydration", () => {
    const roomsClient = read("src/components/rooms-client.tsx");
    const roomDetailClient = read("src/components/room-detail-client.tsx");
    const englishRoomDetailPage = read("src/app/en/odalar/[slug]/page.tsx");
    const documentLocaleSync = read("src/components/document-locale-sync.tsx");
    const rootLayout = read("src/app/layout.tsx");

    expect(roomsClient).toContain(": initialLocale;");
    expect(roomDetailClient).toContain("initialLocale = \"tr\"");
    expect(roomDetailClient).toContain(": initialLocale;");
    expect(englishRoomDetailPage).toContain('<RoomDetailClient slug={slug} initialLocale="en" />');
    expect(rootLayout).toContain("<DocumentLocaleSync />");
    expect(documentLocaleSync).toContain("document.documentElement.lang = locale");
    expect(documentLocaleSync).toContain("document.documentElement.dataset.locale = locale");
  });
});
