import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("review widget'lari + yerlesim + schema sameAs", () => {
  it("ReviewSummary + ReviewBanner mevcut, kendi ic API'mizden beslenir", () => {
    const summary = read("src/components/reviews/review-summary.tsx");
    const banner = read("src/components/reviews/review-banner.tsx");
    expect(summary).toContain('"use client"');
    expect(summary).toContain("/api/review-summary");
    expect(banner).toContain("/api/review-summary");
    // dis linkler nofollow + noopener
    expect(summary).toContain('rel="nofollow noopener noreferrer"');
    // graceful bos durum
    expect(summary).toContain("count === 0");
  });

  it("widget'lar marka token'larini kullanir (uydurma renk yok)", () => {
    const css = read("src/app/globals.css");
    expect(css).toContain(".review-summary");
    expect(css).toContain(".review-banner");
    expect(css).toContain("var(--gold");
    expect(css).toContain("var(--olive");
  });

  it("ana sayfa ve rezervasyon kompozisyonu widget'i icerir", () => {
    const home = read("src/components/home-client.tsx");
    expect(home).toContain("ReviewsSection");
    const reservation = read("src/components/reservation-page-content.tsx");
    expect(reservation).toContain("ReviewBanner");
  });

  it("yeni runtime bagimliligi IMPORT etmez (framer-motion/gsap/lenis)", () => {
    for (const f of [
      "src/components/reviews/review-summary.tsx",
      "src/components/reviews/review-banner.tsx",
    ]) {
      const src = read(f);
      for (const dep of ["framer-motion", "gsap", "lenis"]) {
        expect(src.includes(`from "${dep}"`), `${f} ${dep}`).toBe(false);
      }
    }
  });

  it("hotelSchema sameAs env'den gelir, AggregateRating/Review ASLA icermez", () => {
    const schema = read("src/lib/schema.ts");
    expect(schema).toContain("BRAND_PROFILE_URLS");
    expect(schema).toContain("sameAs");
    // ucuncu-taraf rating yasagi
    expect(schema).not.toContain("aggregateRating");
    expect(schema).not.toContain("AggregateRating");
    expect(schema).not.toContain('"@type": "Review"');
  });
});
