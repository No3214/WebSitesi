import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

/**
 * /en ana sayfasındaki bölüm CTA'ları, EN locale'de TR rotalarına SIZMAMALI
 * (canlıda "Gastronomy Story"→/gastronomi, "View Full Gallery"→/galeri,
 * "All Experiences"→/deneyimler sızıntısı tespit edildi). Hepsi locale'e göre
 * EN karşılığına yönlenir. Deneyim alt-rehberleri (kozbeyli-koyu-rehberi vb.)
 * yalnız TR içerikte var → bilinçli olarak TR'ye linklenir, burada test edilmez.
 */
describe("home bölüm CTA'ları locale-aware (EN→TR rota sızıntısı yok)", () => {
  it("gastronomy-editorial: EN'de /en/dining'e gider, ham /gastronomi href'i yok", () => {
    const src = read("src/components/home/gastronomy-editorial.tsx");
    expect(src).toContain("/en/dining");
    expect(src).not.toContain('href="/gastronomi"');
  });

  it("gallery-strip: EN'de /en/gallery'e gider, ham /galeri href'i yok", () => {
    const src = read("src/components/home/gallery-strip.tsx");
    expect(src).toContain("/en/gallery");
    expect(src).not.toContain('href="/galeri"');
  });

  it("experiences-teaser: 'Tümü' CTA EN'de /en/experiences'e gider, ham /deneyimler href'i yok", () => {
    const src = read("src/components/home/experiences-teaser.tsx");
    expect(src).toContain("/en/experiences");
    expect(src).not.toContain('href="/deneyimler"');
  });

  it("home-hero: etkinlik CTA'sı zaten locale-aware (/en/events) — regresyon guard'ı", () => {
    const src = read("src/components/home/home-hero.tsx");
    expect(src).toContain("/en/events");
  });
});
