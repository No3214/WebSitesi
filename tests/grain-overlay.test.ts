import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

const COMPONENT = "src/components/cinematic/grain-overlay.tsx";
const STYLES = "src/components/cinematic/grain-overlay.module.css";

describe("GrainOverlay kontrati", () => {
  it("saf CSS, sifir JS dependency (framer-motion/gsap import etmez)", () => {
    const src = read(COMPONENT);
    for (const dep of ["framer-motion", "gsap", "lenis"]) {
      expect(src.includes(dep), `yasak bagimlilik: ${dep}`).toBe(false);
    }
    expect(src).toContain(".module.css");
  });

  it("dekoratif: aria-hidden ve pointer-events yok", () => {
    const src = read(COMPONENT);
    const css = read(STYLES);
    expect(src).toContain("aria-hidden");
    expect(css).toContain("pointer-events: none");
  });

  it("marka paleti (amber/zeytin) ve reduced-motion statik", () => {
    const css = read(STYLES);
    expect(css).toContain("196, 162, 101"); // antik altin/amber
    expect(css).toContain("80, 93, 75"); // zeytin
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("animation: none");
  });
});
