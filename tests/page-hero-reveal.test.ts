import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

describe("PageHero revealTitle (sinematik baslik) kontrati", () => {
  const hero = read("src/components/page-hero.tsx");

  it("opt-in prop ve h1 her zaman server-render edilir (SEO/LCP korunur)", () => {
    expect(hero).toContain("revealTitle");
    // baslik metni h1 icinde dogrudan render edilir
    expect(hero).toMatch(/<h1[^>]*>\s*\{title\}/);
  });

  it("gsap RUNTIME'da lazy yuklenir (diger sayfalari sismez)", () => {
    expect(hero).toContain('import("gsap")');
    expect(hero).toContain('import("gsap/SplitText")');
    expect(hero).toContain("gsap.registerPlugin(SplitText)");
  });

  it("reduced-motion'da animasyon kurulmaz + temiz teardown", () => {
    expect(hero).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
    expect(hero).toContain("split.revert()");
    expect(hero).toContain("tween.kill()");
  });

  it("galeri sayfasi revealTitle'i etkinlestirir", () => {
    const gallery = read("src/components/gallery-page-content.tsx");
    expect(gallery).toContain("revealTitle");
  });
});
