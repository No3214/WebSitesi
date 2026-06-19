import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

describe("public light theme contract", () => {
  it("keeps inner page heroes on the light stone theme by default", () => {
    const pageHero = read("src/components/page-hero.tsx");

    expect(pageHero).toContain('tone = "light"');
    expect(pageHero).toContain("page-hero-light");
    expect(pageHero).not.toContain("framer-motion");
    expect(pageHero).not.toContain('overflow: "hidden"');
  });

  it("keeps gastronomy and history story pages off the black ink background", () => {
    const files = [
      "src/components/gastronomy-page-content.tsx",
      "src/components/history-client.tsx",
      "src/components/storytelling.tsx",
      "src/components/living-museum-map.tsx",
      "src/components/heritage-archive.tsx",
    ];

    const combined = files.map(read).join("\n");

    expect(combined).not.toContain('background: "var(--ink)"');
    expect(combined).not.toContain("bg-zinc-950");
    expect(combined).not.toContain('y: "108%"');
    expect(combined).not.toContain('background: "#111"');
    expect(combined).toContain('background: "var(--stone-warm)"');
    expect(combined).toContain('variant="solid"');
    expect(combined).toContain("#fbf7ed");
  });

  it("keeps public event imagery placeholders in the warm stone palette", () => {
    const organizations = read("src/components/organizations-client.tsx");

    expect(organizations).not.toContain("background: var(--ink)");
    expect(organizations).toContain("background: var(--stone-warm)");
  });

  it("keeps home lower bands on warm light surfaces instead of section-dark", () => {
    const files = [
      "src/components/home/marquee-band.tsx",
      "src/components/home/testimonials-section.tsx",
      "src/components/home/final-cta.tsx",
    ];

    const combined = files.map(read).join("\n");

    expect(combined).not.toContain("section-dark");
    expect(combined).toContain("marquee-band");
    expect(combined).toContain("section-alt");
  });

  it("keeps the global footer on the warm stone theme", () => {
    const globals = read("src/app/globals.css");
    const footerBlock = globals.slice(globals.indexOf(".footer {"), globals.indexOf(".footer::before"));

    expect(footerBlock).toContain("background-color: #f7f1e7");
    expect(footerBlock).toContain("#fbf7ed");
    expect(footerBlock).toContain("color: var(--muted)");
    expect(footerBlock).not.toContain("background: var(--ink)");
    expect(footerBlock).not.toContain("var(--border-dark)");
    expect(footerBlock).not.toContain("rgba(250, 249, 246");
  });

  it("keeps guest guide and gastronomy route accent sections light", () => {
    const files = [
      "src/app/misafir-rehberi/page.tsx",
      "src/app/en/misafir-rehberi/page.tsx",
      "src/app/deneyimler/ege-gastronomi-rotasi/page.tsx",
    ];

    const combined = files.map(read).join("\n");

    expect(combined).not.toContain("section section-dark");
    expect(combined).toContain("section section-alt");
  });
});
