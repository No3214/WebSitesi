import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("Galeri smooth-scroll (Lenis) wiring kontrati", () => {
  it("galeri sayfasi SmoothScrollProvider ile sarmalanir", () => {
    const page = read("src/components/gallery-page-content.tsx");
    expect(page).toContain('import { SmoothScrollProvider } from "@/lib/animation/smooth-scroll"');
    expect(page).toContain("<SmoothScrollProvider>");
    expect(page).toContain("</SmoothScrollProvider>");
  });

  it("saglayici reduced-motion'da Lenis baslatmaz ve temiz teardown yapar", () => {
    const provider = read("src/lib/animation/smooth-scroll.tsx");
    expect(provider).toContain('"use client"');
    expect(provider).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
    expect(provider).toMatch(/if \(reduce\) return;/);
    expect(provider).toContain("lenis.destroy()");
    expect(provider).toContain("cancelAnimationFrame(raf)");
  });

  it("modal kilidi icin lenis ornegini window'a verir ve temizler", () => {
    const provider = read("src/lib/animation/smooth-scroll.tsx");
    expect(provider).toContain("__lenis");
    expect(provider).toMatch(/delete w\.__lenis/);
    const lightbox = read("src/components/gallery-lightbox.tsx");
    // lightbox acilinca Lenis duraklatir, kapaninca devam ettirir
    expect(lightbox).toContain("__lenis");
    expect(lightbox).toContain("lenis?.stop()");
    expect(lightbox).toContain("lenis?.start()");
  });
});
