import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relPath: string) => fs.readFileSync(path.join(root, relPath), "utf8");

/**
 * REGRESYON KİLİDİ — "Stone & Light Editorial" görsel dil (ilk dalga).
 *
 * Ground-truth (plan vs repo): motion primitive'leri (FadeIn/StaggerContainer/
 * RevealLines/Parallax/TiltCard/MagneticLink), MagneticLink/TiltCard'ın hero +
 * Storybook kullanımı ve gallery-lightbox ZATEN mevcuttu — yeniden yazılmadı.
 *
 * Bu turda kapatılan GERÇEK boşluklar:
 *  - room-detail spec ikonları emoji yerine bağımlılıksız, aria-hidden inline SVG
 *    (marka/premium; "manzara" ikonu marka kemer motifiyle uyumlu),
 *  - tam radius ölçeği + --motion-cinematic (tasarım sistemi temeli, additive).
 *
 * KASITLI KARAR — `unoptimized` KORUNUR: 120px strip thumbnail'ları <10KB
 * (Next/Vercel optimizasyonundan fayda görmez) ve Vercel ücretsiz optimizasyon
 * kotasını (1000 görsel/ay) korur; kaldırmak owner'a gereksiz maliyet çıkarırdı.
 */

describe("Stone & Light — room detail spec ikonları (emoji değil, inline SVG)", () => {
  const rd = read("src/components/room-detail-client.tsx");

  it("emoji spec ikonu içermez", () => {
    expect(rd).not.toContain("\u{1F4CF}"); // 📏
    expect(rd).not.toContain("\u{1F465}"); // 👥
    expect(rd).not.toContain("\u{1FA9F}"); // 🪟
  });

  it("spec ikonları aria-hidden, dekoratif inline SVG'dir (currentColor)", () => {
    expect(rd).toContain('className="spec-icon" aria-hidden="true"');
    expect(rd).toContain('stroke="currentColor"');
  });

  it("görsel unoptimized bilinçli korunur (maliyet + <10KB thumbnail)", () => {
    expect(rd).toContain("unoptimized");
  });
});

describe("Stone & Light — tasarım token temeli", () => {
  const css = read("src/app/globals.css");

  it("tam radius ölçeği tanımlı", () => {
    for (const t of ["--radius-xs", "--radius-sm", "--radius-md", "--radius-lg", "--radius-pill"]) {
      expect(css).toContain(t);
    }
  });

  it("--motion-cinematic mevcut motion ölçeğini tamamlar", () => {
    expect(css).toContain("--motion-cinematic");
  });

  it("radius token'ı gerçek tüketiciye bağlıdır (dead token değil)", () => {
    const rd = read("src/components/room-detail-client.tsx");
    expect(rd).toContain("var(--radius-md)");
  });
});
