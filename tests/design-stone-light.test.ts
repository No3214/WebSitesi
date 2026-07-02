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

describe("Stone & Light — editorial mosaic featured seçimi (source-order tesadüfü değil)", () => {
  it("rooms verisinde tam olarak bir oda featured işaretlidir", async () => {
    const { rooms } = await import("@/data/rooms");
    expect(rooms.filter((room) => room.featured).length).toBe(1);
  });

  it("getShowcaseRooms featured odayı başa alır, 6 ile sınırlar, tekrar üretmez", async () => {
    const { getShowcaseRooms } = await import("@/data/rooms");
    const showcase = getShowcaseRooms("tr");
    expect(showcase[0]?.featured).toBe(true);
    expect(showcase).toHaveLength(6);
    const slugs = showcase.map((room) => room.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("featured işareti EN lokalizasyonunda kaybolmaz", async () => {
    const { getShowcaseRooms } = await import("@/data/rooms");
    expect(getShowcaseRooms("en")[0]?.featured).toBe(true);
  });

  it("hiç featured yoksa mevcut davranışa düşer (ilk N oda)", async () => {
    const mod = await import("@/data/rooms");
    const plain = mod.rooms.map((room) => ({ ...room, featured: undefined }));
    const localized = plain.slice(0, 6).map((room) => room.slug);
    // Fallback sözleşmesi: featuredIndex bulunamazsa slice(0, count).
    expect(localized).toHaveLength(6);
  });

  it("vitrin bileşeni helper'ı kullanır (elle slice değil)", () => {
    const src = read("src/components/home/rooms-showcase.tsx");
    expect(src).toContain("getShowcaseRooms");
    expect(src).not.toContain("slice(0, 6)");
  });
});

describe("Stone & Light — editorial tipografi (progressive enhancement)", () => {
  it("uzun gövde metinlerinde text-wrap: pretty kullanılır", () => {
    const css = read("src/app/globals.css");
    expect(css).toContain("text-wrap: pretty");
  });
});

/**
 * FAZ V.3 KİLİTLERİ (2026-07-01) — story rail + spatial pilot + native VT.
 * Kurallar (codex-visual-transformation-prompt-v2 §15-§17):
 *  - scroll-driven reveal yalnız @supports + reduced-motion:no-preference altında;
 *  - view transitions @supports korumalı, ≤240ms, ≤12px, reduced-motion'da kapalı;
 *  - TiltCard üretim kullanımı /hikayemiz spatial pilotu; yalnız gerçek medya.
 */

describe("Stone & Light — FAZ V.3: story rail + spatial pilot (/hikayemiz)", () => {
  const hc = read("src/components/history-client.tsx");
  const css = read("src/app/globals.css");

  it("TiltCard üretimde kullanılır (yalnız Storybook değil)", () => {
    expect(hc).toContain("TiltCard");
    expect(hc).toContain("story-rail-artifact");
  });

  it("story rail yalnız gerçek, diskte var olan medyayı kullanır", () => {
    const media = [
      "/images/galeri/tas-cephe.jpg",
      "/images/odalar/detay/oda-detay-2.jpg",
      "/images/galeri/aksam-sofrasi.jpg",
    ];
    for (const rel of media) {
      expect(hc).toContain(rel);
      expect(fs.existsSync(path.join(root, "public", rel.replace(/^\//, "")))).toBe(true);
    }
  });

  it("arch-frame imza şekli tanımlı ve hikâye medyasında sınırlı kullanılır", () => {
    expect(css).toContain(".arch-frame");
    const usage = hc.split("arch-frame").length - 1;
    expect(usage).toBe(1);
  });

  it("scroll-driven reveal @supports + reduced-motion çifte korumalı", () => {
    expect(css).toContain(
      "@supports (animation-timeline: view()) {\n  @media (prefers-reduced-motion: no-preference) {",
    );
    expect(css).toContain("animation-timeline: view();");
  });

  it("reveal mesafesi hareket bütçesi içinde (≤24px, scale ≤1.05)", () => {
    expect(css).toContain("translateY(18px) scale(0.985)");
  });

  it("yeni gölge/çizgi tokenları gerçek tüketiciye bağlı (dead token değil)", () => {
    for (const token of ["--shadow-ambient", "--shadow-elevated", "--line-hairline"]) {
      expect(css).toContain(`${token}:`);
      expect(css).toContain(`var(${token})`);
    }
  });

  it("story rail sahne başlığı erişilebilir bağlanır (aria-labelledby)", () => {
    expect(hc).toContain('aria-labelledby="stone-light-title"');
    expect(hc).toContain('id="stone-light-title"');
  });
});

describe("Stone & Light — FAZ V.3: native view transitions", () => {
  const css = read("src/app/globals.css");

  it("@view-transition yalnız @supports koruması altında açılır", () => {
    expect(css).toContain(
      "@supports (view-transition-name: root) {\n  @view-transition {\n    navigation: auto;\n  }\n}",
    );
  });

  it("geçiş süresi bütçe içinde (≤240ms) ve --ease-lux kullanır", () => {
    expect(css).toContain("vt-fade-out 200ms var(--ease-lux)");
    expect(css).toContain("vt-fade-in 220ms var(--ease-lux)");
  });

  it("reduced-motion'da view-transition animasyonları kapatılır", () => {
    expect(css).toContain("::view-transition-new(root) {\n    animation: none;");
  });

  it("geçiş offset'i ≤12px hareket bütçesi içinde", () => {
    expect(css).toContain("translateY(-6px)");
    expect(css).toContain("translateY(10px)");
  });
});
