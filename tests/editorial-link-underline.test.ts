import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

const COMPONENT = "src/components/editorial-link-underline.tsx";
const STYLES = "src/components/editorial-link-underline.module.css";

describe("EditorialLinkUnderline kontrat", () => {
  it("dosyalar mevcut", () => {
    expect(fs.existsSync(path.join(root, COMPONENT))).toBe(true);
    expect(fs.existsSync(path.join(root, STYLES))).toBe(true);
  });

  it("gercek <a> render eder ve anchor proplarini gecirir", () => {
    const src = read(COMPONENT);
    expect(src).toContain("<a");
    expect(src).toContain("AnchorHTMLAttributes<HTMLAnchorElement>");
    expect(src).toContain("{...rest}");
  });

  it("sifir yeni dependency: framer-motion/gsap/lenis/motion import etmez", () => {
    const src = read(COMPONENT);
    for (const dep of ["framer-motion", "gsap", "lenis", '"motion"', "from \"motion\""]) {
      expect(src.includes(dep), `yasak bagimlilik: ${dep}`).toBe(false);
    }
    // styled-jsx degil, CSS module kullanir (sifir JS server component)
    expect(src).not.toContain('"use client"');
    expect(src).toContain(".module.css");
  });

  it("CSS: transform tabanli, reduced-motion + coarse-pointer + focus-visible guvenli", () => {
    const css = read(STYLES);
    expect(css).toContain("scaleX");
    expect(css).toContain("transform-origin");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("pointer: coarse");
    expect(css).toContain(":focus-visible");
    // layout shift yaratan width animasyonu olmamali
    expect(css).not.toMatch(/transition:\s*[^;]*\bwidth\b/);
  });
});
