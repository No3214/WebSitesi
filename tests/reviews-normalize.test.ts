import { describe, expect, it } from "vitest";

import { maskAuthor, normalizeRating } from "@/lib/reviews/normalize";
import { sanitizeReviewBody } from "@/lib/reviews/sanitize";

describe("reviews normalize/mask (saf)", () => {
  it("10'luk puani 5'e normalize eder ve 1 ondaliga yuvarlar", () => {
    expect(normalizeRating(8.6, 10)).toBe(4.3);
    expect(normalizeRating(10, 10)).toBe(5);
    expect(normalizeRating(5, 5)).toBe(5);
  });

  it("puani 1-5 araligina clamp'ler, gecersiz girdide 0 doner", () => {
    expect(normalizeRating(0, 10)).toBe(1); // alt sinir
    expect(normalizeRating(12, 10)).toBe(5); // ust sinir
    expect(normalizeRating(Number.NaN, 10)).toBe(0);
    expect(normalizeRating(5, 0)).toBe(0);
  });

  it("yazar adini KVKK-uyumlu maskeler (tam soyad donmez)", () => {
    expect(maskAuthor("Ayşe Kaya")).toBe("Ayşe K.");
    expect(maskAuthor("Mehmet Yılmaz")).toBe("Mehmet Y.");
    expect(maskAuthor("Ahmet")).toBe("Ahmet"); // tek kelime
    expect(maskAuthor("")).toBe("Misafir");
    expect(maskAuthor(null)).toBe("Misafir");
    // tam soyad asla sizmaz
    expect(maskAuthor("Ayşe Kaya")).not.toContain("Kaya");
  });
});

describe("reviews sanitize (XSS/markup/link strip)", () => {
  it("script ve style bloklarini icerikleriyle siler", () => {
    const out = sanitizeReviewBody('Harika<script>alert(1)</script> bir yer');
    expect(out).not.toContain("script");
    expect(out).not.toContain("alert");
    expect(out).toContain("Harika");
    expect(out).toContain("yer");
  });

  it("tum HTML etiketlerini kaldirir ve linkleri silir", () => {
    const out = sanitizeReviewBody('<b>Muhteşem</b> kahvaltı, bilgi: https://spam.example/x');
    expect(out).not.toContain("<b>");
    expect(out).not.toContain("http");
    expect(out).not.toContain("spam.example");
    expect(out).toContain("Muhteşem");
    expect(out).toContain("kahvaltı");
  });

  it("entity cozer, bos/null guvenli, uzunlugu sinirlar", () => {
    expect(sanitizeReviewBody("Taş &amp; ahşap")).toBe("Taş & ahşap");
    expect(sanitizeReviewBody(null)).toBe("");
    expect(sanitizeReviewBody("a".repeat(5000)).length).toBeLessThanOrEqual(1201);
  });
});
