import { describe, expect, it } from "vitest";

import { menuSections } from "@/data/menu";

// Not: Menü içeriği işletmenin güncel menü kaynağından senkronlanır (T7).
// Bu testler veri bütünlüğünü doğrular; ürün/fiyat içeriği src/data/menu.ts'te tutulur.

describe("menu data (src/data/menu.ts)", () => {
  const allItems = menuSections.flatMap((section) =>
    section.items.map((item) => ({ ...item, section: section.title })),
  );

  function findItem(name: string) {
    return allItems.find((item) => item.name === name);
  }

  it("zip kaynaklı güncel menü bölümlerini içerir", () => {
    expect(menuSections).toHaveLength(12);
    expect(menuSections.map((section) => section.title)).toEqual([
      "Kahvaltı",
      "Mezeler",
      "Ara Sıcaklar & Başlangıçlar",
      "Taş Fırın Pizza & Sandviç",
      "Peynir Tabakları",
      "Ana Yemekler",
      "Tatlılar",
      "Şaraplar",
      "Rakı",
      "Kokteyl & Bira",
      "Viskiler",
      "İçecekler",
    ]);
  });

  it("kaynak menüdeki geniş ürün kapsamını korur", () => {
    expect(allItems.length).toBeGreaterThanOrEqual(115);
  });

  it("her ürünün adı boş olmamalı", () => {
    for (const section of menuSections) {
      for (const item of section.items) {
        expect(item.name.length).toBeGreaterThan(0);
      }
    }
  });

  it("kaynak dosyadaki kritik ürün ve fiyatları korur", () => {
    expect(findItem("Gurme Serpme Kahvaltı (kişi başı)")?.price).toBe("750 TL");
    expect(findItem("Konağın Meze Tabağı (2 kişilik - 5 çeşit)")?.price).toBe("2.400 TL");
    expect(findItem("Paçanga Böreği (adet)")?.price).toBe("200 TL");
    expect(findItem("Hindi Füme Pizza")?.price).toBe("900 TL");
    expect(findItem("Konak Saç Kavurma")?.price).toBe("1.000 TL");
    expect(findItem("Beyaz Şarap Tadımı")?.price).toBe("1.600 TL");
    expect(findItem("Beylerbeyi Göbek 100cl")?.price).toBe("3.850 TL");
    expect(findItem("Jack Daniel's 35cl")?.price).toBe("2.500 TL");
    expect(findItem("Türk Kahvesi")?.price).toBe("150 TL");
  });

  it("doğrulanmamış eski tarih iddialarını menü verisine taşımaz", () => {
    const serializedMenu = JSON.stringify(menuSections);
    expect(serializedMenu).not.toContain("500 yıllık taş konak");
    expect(serializedMenu).not.toContain("200 yıllık");
  });
});
