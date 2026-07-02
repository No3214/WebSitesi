import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { rooms, getShowcaseRooms } from "@/data/rooms";

const root = process.cwd();
const read = (relPath: string) => fs.readFileSync(path.join(root, relPath), "utf8");

/**
 * OWNER KARARI KİLİDİ (2026-07-02) — ana sayfa oda vitrini video-first.
 *
 * Karar: oda videoları görünür kontrol tuşu OLMADAN, görünüme girince
 * kendiliğinden oynar (sessiz + döngülü). Bilinçli sınırlar:
 *  - `autoplay` HTML attribute'u kullanılmaz; oynatmayı IntersectionObserver
 *    tetikler → ilk viewport'ta hiçbir oda videosu ağ isteği üretmez
 *    (tests/e2e/media-assets.spec.ts ilk-viewport sözleşmesiyle uyumlu).
 *  - `prefers-reduced-motion` ve Data Saver'da video render edilmez; poster
 *    fotoğraf kalır (WCAG hareket güvenliği).
 *  - Kart videosu dekoratiftir (aria-hidden, tabIndex=-1, pointer-events:none);
 *    kartın erişilebilir adı ve tıklama davranışı Link üzerinde kalır.
 */

describe("vitrin kartlarında tuşsuz otomatik oda videosu", () => {
  const src = read("src/components/home/rooms-showcase.tsx");

  it("video autoplay attribute'suz, IO tabanlı hook ile oynar", () => {
    expect(src).toContain("useAutoplayInView");
    expect(src).not.toContain("autoPlay");
  });

  it("görünür kontrol yok; sessiz + döngülü + inline", () => {
    expect(src).not.toMatch(/\scontrols\b/);
    expect(src).toContain("muted");
    expect(src).toContain("loop");
    expect(src).toContain("playsInline");
  });

  it("ilk viewport ağ bütçesi: preload none + koşullu render", () => {
    expect(src).toContain('preload="none"');
    expect(src).toContain("autoplayAllowed &&");
  });

  it("video dekoratif; erişilebilir ad karttan gelir", () => {
    expect(src).toContain("aria-hidden");
    expect(src).toContain("tabIndex={-1}");
    expect(src).toContain("pointer-events: none");
  });

  it("poster her zaman gerçek oda fotoğrafı (CLS/fallback güvenliği)", () => {
    expect(src).toContain("poster={room.images[0]}");
  });
});

describe("vitrin veri sözleşmesi (video kapsamı)", () => {
  it("vitrindeki 6 odanın tamamında gerçek video dosyası var", () => {
    const showcase = getShowcaseRooms("tr");
    expect(showcase).toHaveLength(6);
    for (const room of showcase) {
      expect(room.video, room.slug).toMatch(/^\/videos\/rooms\/.+\.mp4$/);
      const fp = path.join(root, "public", room.video!.replace(/^\//, ""));
      expect(fs.existsSync(fp), `eksik video: ${room.video}`).toBe(true);
    }
  });

  it("veri katmanında video yolu tanımlı olmayan oda vitrine video koymaz", () => {
    // Koruma: video alanı opsiyonel kalır; bileşen room.video && ile sarılıdır.
    const src = read("src/components/home/rooms-showcase.tsx");
    expect(src).toContain("room.video &&");
    expect(rooms.every((room) => room.video === undefined || room.video.length > 0)).toBe(true);
  });
});
