import { describe, expect, it } from "vitest";

import { menuSections } from "@/data/menu";

// Not: Menü içeriği işletmenin güncel menü kaynağından senkronlanır (T7).
// Bu testler veri bütünlüğünü doğrular; ürün/fiyat içeriği src/data/menu.ts'te tutulur.

describe("menu data (src/data/menu.ts)", () => {
  it("en az 4 menü bölümü içerir", () => {
    expect(menuSections.length).toBeGreaterThanOrEqual(4);
  });

  it("toplam ürün sayısı en az 20 olmalı", () => {
    const totalItems = menuSections.reduce(
      (sum, section) => sum + section.items.length,
      0,
    );
    expect(totalItems).toBeGreaterThanOrEqual(20);
  });

  it("her ürünün adı boş olmamalı", () => {
    for (const section of menuSections) {
      for (const item of section.items) {
        expect(item.name.length).toBeGreaterThan(0);
      }
    }
  });
});
