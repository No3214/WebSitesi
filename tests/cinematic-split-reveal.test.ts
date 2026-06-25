import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

const COMPONENT = "src/components/cinematic/split-reveal.tsx";

describe("CinematicSplitText kontrati", () => {
  const src = read(COMPONENT);

  it("client component ve GSAP SplitText kullanir", () => {
    expect(src).toContain('"use client"');
    expect(src).toContain('from "gsap/SplitText"');
    expect(src).toContain("gsap.registerPlugin(SplitText)");
  });

  it("reduced-motion'da animasyon kurmaz (gsap.matchMedia + no-preference)", () => {
    expect(src).toContain("gsap.matchMedia()");
    expect(src).toContain('"(prefers-reduced-motion: no-preference)"');
    expect(src).toContain("split.revert()");
    expect(src).toContain("mm.revert()");
  });

  it("metin erisilebilir kalir (server-render edilen children, gercek baslik etiketi)", () => {
    expect(src).toContain("{children}");
    expect(src).toMatch(/as\?:\s*"h1"\s*\|\s*"h2"\s*\|\s*"h3"/);
  });

  it("provenance kaydi mevcut", () => {
    const prov = read("docs/design/external-component-provenance.md");
    expect(prov).toContain("CinematicSplitText");
    expect(prov).toContain("GreenSock Standard");
    expect(prov).toContain("prefers-reduced-motion");
  });
});
