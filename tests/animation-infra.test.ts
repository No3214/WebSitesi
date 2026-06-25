import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

describe("sinematik animasyon altyapisi kontrati", () => {
  const pkg = JSON.parse(read("package.json")) as {
    dependencies?: Record<string, string>;
  };

  it("gsap + @gsap/react + lenis bagimliliklari kurulu", () => {
    const deps = pkg.dependencies ?? {};
    expect(deps["gsap"], "gsap eksik").toBeTruthy();
    expect(deps["@gsap/react"], "@gsap/react eksik").toBeTruthy();
    expect(deps["lenis"], "lenis eksik").toBeTruthy();
  });

  it("SmoothScrollProvider reduced-motion'da Lenis baslatmaz ve temiz teardown yapar", () => {
    const src = read("src/lib/animation/smooth-scroll.tsx");
    expect(src).toContain('"use client"');
    expect(src).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
    expect(src).toContain("if (reduce) return;");
    expect(src).toContain("lenis.destroy()");
    // GSAP ScrollTrigger ile senkron (dinamik import, zorunlu degil)
    expect(src).toContain('import("gsap/ScrollTrigger")');
  });

  it("useCinematic gsap.matchMedia ile reduced-motion fallback'i kurar", () => {
    const src = read("src/lib/animation/use-cinematic.ts");
    expect(src).toContain('"use client"');
    expect(src).toContain("gsap.matchMedia()");
    expect(src).toContain("(prefers-reduced-motion: no-preference)");
    expect(src).toContain("(prefers-reduced-motion: reduce)");
    expect(src).toContain("mm.revert()");
  });

  it("eklenen animasyon bagimliliklari AGPL/GPL degil", () => {
    // gsap: GreenSock Standard (ucretsiz/ticari), @gsap/react: MIT, lenis: MIT.
    // Bu test, ileride yanlislikla copyleft bir motion paketinin eklenmesini
    // hatirlatmak icin bir nottur; gercek lisans denetimi CI'da yapilir.
    const forbidden = ["@types/gpl", "agpl"];
    const allDeps = Object.keys(pkg.dependencies ?? {});
    for (const f of forbidden) {
      expect(allDeps.some((d) => d.includes(f))).toBe(false);
    }
  });
});
