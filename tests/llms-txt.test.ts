import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const llms = fs.readFileSync(path.join(root, "public/llms.txt"), "utf8");

describe("public/llms.txt — AEO/GEO ground-truth (truthful, no hallucination)", () => {
  it("doğrulanmış NAP + koordinat + resmi booking yönlendirmesi içerir", () => {
    expect(llms).toContain("Küme Evler No:188");
    expect(llms).toContain("+90 532 234 26 86");
    expect(llms).toContain("38.713943"); // gerçek koordinat
    expect(llms).toContain("/rezervasyon"); // fiyat/müsaitlik yalnız resmi kanal
    expect(llms).toContain("İnci Hanım"); // marka-doğrulanmış gastronomi
  });

  it("AEO için konuşma-tarzı Soru/Cevap bloğu içerir", () => {
    expect(llms).toContain("## Frequently asked");
    expect(llms.match(/^Q: /gm)?.length ?? 0).toBeGreaterThanOrEqual(5);
  });

  it("DOĞRULUK BEKÇİSİ: fiyat/starRating/uydurma sayısal iddia İÇERMEZ", () => {
    // statik fiyat yok (HMS tek kaynak; bayat fiyat halüsinasyonunu önler)
    expect(llms).not.toMatch(/\d[\d.,]*\s*(TL|₺)/i);
    expect(llms).not.toMatch(/\bTL\b/);
    // self-serving yıldız puanı yok (Google self-serving review cezası riski)
    expect(llms.toLowerCase()).not.toContain("starrating");
    expect(llms).not.toMatch(/\b4[.,]5\b/);
    // doğrulanmamış spesifikler yok (oda sayısı, havalimanı mesafesi)
    expect(llms).not.toMatch(/16\s+(oda|room|boutique|butik)/i);
    expect(llms).not.toContain("81.6");
  });
});
