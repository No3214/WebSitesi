import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

const COMPONENT = "src/components/room-detail-client.tsx";

// Oda detay galerisi god-tier erisilebilirlik kontrati.
// Bu testler ileride klavye/swipe/aria/reduced-motion ozelliklerinin
// sessizce kaldirilmasini engeller.
describe("oda detay galerisi erisilebilirlik kontrati", () => {
  const src = read(COMPONENT);

  it("klavye ok navigasyonu var (ArrowLeft/ArrowRight)", () => {
    expect(src).toContain("onKeyDown");
    expect(src).toContain('"ArrowRight"');
    expect(src).toContain('"ArrowLeft"');
    expect(src).toContain("e.preventDefault()");
  });

  it("dokunmatik swipe navigasyonu var", () => {
    expect(src).toContain("onTouchStart");
    expect(src).toContain("onTouchEnd");
    expect(src).toContain("changedTouches");
  });

  it("gorunur ve etiketli onceki/sonraki butonlari var", () => {
    expect(src).toContain("gallery-nav-prev");
    expect(src).toContain("gallery-nav-next");
    expect(src).toContain("aria-label={copy.prevImage}");
    expect(src).toContain("aria-label={copy.nextImage}");
    // prev/next etiketleri her iki dilde tanimli
    expect(src).toContain('prevImage: "Önceki görsel"');
    expect(src).toContain('nextImage: "Next image"');
  });

  it("aria-roledescription ve aria-live duyurusu var", () => {
    expect(src).toContain("aria-roledescription");
    expect(src).toContain('aria-live="polite"');
    expect(src).toContain("visually-hidden");
  });

  it("reduced-motion'a saygi gosterir", () => {
    expect(src).toContain("useReducedMotion");
    expect(src).toContain("prefers-reduced-motion");
    expect(src).toContain("duration: reduced ? 0 : 0.6");
  });

  it("coarse-pointer ve focus-visible guvenli", () => {
    expect(src).toContain("@media (pointer: coarse)");
    expect(src).toContain(":focus-visible");
    // 44px minimum dokunma hedefi
    expect(src).toMatch(/width:\s*44px/);
    expect(src).toMatch(/height:\s*44px/);
  });
});
