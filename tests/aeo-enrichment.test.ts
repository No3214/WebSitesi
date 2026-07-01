import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relPath: string) => fs.readFileSync(path.join(root, relPath), "utf8");

/**
 * REGRESYON KİLİDİ — AEO/GEO zenginleştirmesi.
 * AI motorlarında (ChatGPT/Claude/Perplexity/Gemini) doğru alıntılanmak için
 * eklenen doğrulanmış yapısal veri + FAQ + bot izinleri. Tüm gerçekler
 * kozbeyli-facts.md SSOT ile tutarlıdır (sıfır halüsinasyon).
 */

describe("AEO — genişletilmiş FAQ korpusu (FAQPage schema + görünür /sss)", () => {
  const faqs = read("src/data/faqs.ts");
  const count = (faqs.match(/\bq:\s*\{/g) ?? []).length;

  it("en az 20 soru içerir (AI-alıntı yüzeyi)", () => {
    expect(count).toBeGreaterThanOrEqual(20);
  });

  it("yüksek-değerli dürüst-negatif ve profil soruları içerir", () => {
    expect(faqs).toContain("yüzme havuzu"); // havuz-yok (AI yanlış tanımlamasını önler)
    expect(faqs).toContain("kimler için uygundur"); // misafir profili
    expect(faqs).toContain("oda tipleri"); // oda envanteri
    expect(faqs).toContain("hangi mutfak"); // Antakya & Ege
  });

  it("yasak/hatalı iddia içermez (SSOT tutarlılığı)", () => {
    expect(faqs).not.toContain("48 saat");
    expect(faqs).not.toContain("ücretsiz iptal");
  });
});

describe("AEO — genişletilmiş Hotel/Restaurant schema", () => {
  const schema = read("src/lib/schema.ts");

  it("numberOfRooms (16) yayar", () => {
    expect(schema).toContain("numberOfRooms: 16");
  });

  it("resmi turizm işletme belge no'yu E-E-A-T güven sinyali olarak yayar", () => {
    expect(schema).toContain("2025-35-1824");
    expect(schema).toContain('"@type": "PropertyValue"');
  });

  it("check-in/out + priceRange + servesCuisine + hasMenu korunur", () => {
    expect(schema).toContain('checkinTime: "14:00"');
    expect(schema).toContain('checkoutTime: "12:00"');
    expect(schema).toContain("priceRange");
    expect(schema).toContain("servesCuisine");
    expect(schema).toContain("hasMenu");
  });

  it("self-serving yıldız/yorum yapısal verisi İÇERMEZ (Google ceza riski)", () => {
    expect(schema).not.toContain("aggregateRating");
    expect(schema).not.toContain("starRating");
  });
});

describe("AEO — robots AI arama/alıntı botlarını davet eder", () => {
  const robots = read("src/app/robots.ts");

  it("çekirdek arama/alıntı botlarını içerir", () => {
    for (const bot of [
      "OAI-SearchBot",
      "Claude-SearchBot",
      "PerplexityBot",
      "Bingbot",
      "Applebot",
    ]) {
      expect(robots).toContain(bot);
    }
  });
});
