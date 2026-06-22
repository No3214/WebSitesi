import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function exists(relPath: string) {
  return fs.existsSync(path.join(root, relPath));
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

  it("keeps legacy cinematic widgets on light stone surfaces", () => {
    const globals = read("src/app/globals.css");
    const atmospheric = read("src/components/atmospheric-immersion.tsx");
    const heritage = read("src/components/heritage-archive.tsx");
    const floatingContact = read("src/components/floating-contact.tsx");
    const exitIntent = read("src/components/exit-intent.tsx");
    const roomDetail = read("src/components/room-detail-client.tsx");
    const sectionDarkBlock = globals.slice(
      globals.indexOf(".section-dark {"),
      globals.indexOf(".section-dark .section-title h2")
    );

    expect(sectionDarkBlock).toContain("#fbf7ed");
    expect(sectionDarkBlock).not.toContain("var(--ink)");
    expect(sectionDarkBlock).not.toContain("color: var(--ivory)");

    const combined = [
      atmospheric,
      heritage,
      floatingContact,
      exitIntent,
      roomDetail,
    ].join("\n");

    expect(combined).not.toContain("bg-black");
    expect(combined).not.toContain("bg-zinc-900");
    expect(combined).not.toContain("border-zinc-900");
    expect(combined).not.toContain("rgba(20, 22, 26");
    expect(combined).toContain("bg-[#fffcf6]/95");
    expect(exists("src/components/reputation-ribbon.tsx")).toBe(false);
    expect(heritage).toContain("bg-[#fffcf6]/90");
    expect(exitIntent).toContain("bg-[rgba(61,74,59,0.38)]");
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

  it("keeps public chrome and conversion surfaces out of the old black theme", () => {
    const globals = read("src/app/globals.css");
    const roomDetail = read("src/components/room-detail-client.tsx");
    const exitIntent = read("src/components/exit-intent.tsx");
    const errorBoundary = read("src/components/error-boundary.tsx");
    const mobileMenuBlock = globals.slice(globals.indexOf(".mobile-menu {"), globals.indexOf("@keyframes mobileMenuIn"));
    const bookingCardBlock = roomDetail.slice(roomDetail.indexOf(".booking-card-premium {"), roomDetail.indexOf(".price-stack"));

    expect(mobileMenuBlock).toContain("linear-gradient(180deg, #fbf7ed 0%, #f2ecdf 100%)");
    expect(mobileMenuBlock).not.toContain("var(--ink)");
    expect(mobileMenuBlock).not.toContain("#14161a");
    expect(globals).toContain(".mobile-menu a");
    expect(globals).toContain("color: var(--olive)");

    expect(bookingCardBlock).toContain("linear-gradient(135deg, rgba(255, 252, 246, 0.98), rgba(241, 234, 220, 0.94))");
    expect(bookingCardBlock).not.toContain("var(--ink");
    expect(bookingCardBlock).not.toContain("#14161a");
    expect(roomDetail).toContain("color: var(--olive, #3d4a3b);");

    expect(exitIntent).toContain("exit-intent-offer-panel");
    expect(exitIntent).not.toContain("md:w-2/5 bg-zinc-900");
    expect(exitIntent).not.toContain("background: #18181b");
    expect(errorBoundary).not.toContain("bg-zinc-950");
    expect(errorBoundary).not.toContain("border-zinc-800");
    expect(errorBoundary).toContain("bg-[#fbf7ed]");
  });
});
