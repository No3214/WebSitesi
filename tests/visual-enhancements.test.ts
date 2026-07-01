import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relPath: string) => fs.readFileSync(path.join(root, relPath), "utf8");

/**
 * REGRESYON KİLİDİ — RESOURCES kaynak kiti görsel zenginleştirmesi.
 * "Uygun olanlar" (production-safe, bağımlılıksız, perf-nötr) uygulandı:
 * Haikei tarzı wave divider + Paper Shaders'in WebGL'siz CSS mesh-gradient
 * karşılığı. WebGL hero + Phosphor (bundle şişmesi) bilinçli olarak eklenmedi.
 */

describe("görsel zenginleştirme — wave divider (statik, bağımlılıksız, a11y)", () => {
  const wave = read("src/components/wave-divider.tsx");

  it("dekoratif ve erişilebilir gizli (aria-hidden)", () => {
    expect(wave).toContain('aria-hidden="true"');
  });

  it("statik SVG'dir — JS/animasyon bağımlılığı yok (perf-nötr)", () => {
    expect(wave).toContain("<svg");
    expect(wave).not.toContain("framer-motion");
    expect(wave).not.toContain("useEffect");
    expect(wave).not.toContain("use client");
  });

  it("CLS-güvenli sabit yükseklik alır", () => {
    expect(wave).toContain("height");
    expect(wave).toContain("var(--stone-warm)");
  });
});

describe("görsel zenginleştirme — CTA band mesh gradient (CSS, WebGL değil)", () => {
  const globals = read("src/app/globals.css");

  it("statik CSS radial mesh-gradient parıltı içerir (bağımlılıksız)", () => {
    expect(globals).toContain(".cta-banner::before");
    expect(globals).toContain("radial-gradient");
  });

  it("wave-divider konumlandırması tanımlı", () => {
    expect(globals).toContain(".wave-divider {");
  });
});

describe("görsel zenginleştirme — final CTA bütünlüğü korunur", () => {
  const finalCta = read("src/components/home/final-cta.tsx");

  it("WaveDivider render eder ama booking CTA'sını korur", () => {
    expect(finalCta).toContain("<WaveDivider");
    expect(finalCta).toContain("reservationHref");
    expect(finalCta).toContain('data-event="booking_engine_open"');
  });
});
