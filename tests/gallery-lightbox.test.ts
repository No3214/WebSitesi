import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

const COMPONENT = "src/components/gallery-lightbox.tsx";
const PAGE = "src/components/gallery-page-content.tsx";
const CSS = "src/app/globals.css";

describe("Galeri lightbox kontrati", () => {
  it("client bileseni ve galeri sayfasina bagli", () => {
    const c = read(COMPONENT);
    expect(c).toContain('"use client"');
    const page = read(PAGE);
    expect(page).toContain("GalleryLightbox");
    expect(page).toContain("shots={galleryExtended}");
  });

  it("overlay createPortal ile body'ye tasinir (transform'lu ust kapsayicidan kacar)", () => {
    const c = read(COMPONENT);
    expect(c).toContain('import { createPortal } from "react-dom"');
    expect(c).toContain("createPortal(");
    expect(c).toContain("document.body");
  });

  it("erisilebilir: dialog/aria-modal, klavye gezinme ve odak yonetimi", () => {
    const c = read(COMPONENT);
    expect(c).toContain('role="dialog"');
    expect(c).toContain('aria-modal="true"');
    expect(c).toContain('e.key === "Escape"');
    expect(c).toContain('e.key === "ArrowRight"');
    expect(c).toContain('e.key === "ArrowLeft"');
    // acilinca kapatma butonuna, kapaninca tetikleyen kareye odak
    expect(c).toContain("closeRef.current?.focus()");
    expect(c).toContain("triggerRefs.current");
  });

  it("body scroll kilidi ve dokunma (swipe) destegi", () => {
    const c = read(COMPONENT);
    expect(c).toContain('document.body.style.overflow = "hidden"');
    expect(c).toContain("onTouchStart");
    expect(c).toContain("onTouchEnd");
    expect(c).toMatch(/Math\.abs\(dx\)\s*>\s*40/);
  });

  it("reduced-motion duyarli (JS hook + CSS)", () => {
    const c = read(COMPONENT);
    expect(c).toContain("prefers-reduced-motion: reduce");
    const css = read(CSS);
    expect(css).toContain(".gallery-lightbox");
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*\.gallery-lightbox[\s\S]*animation: none/);
  });

  it("marka paleti ve zoom imleci (Cult/Ruixen fikri, markaya uyarli)", () => {
    const css = read(CSS);
    expect(css).toContain("cursor: zoom-in");
    expect(css).toContain("cursor: zoom-out");
    expect(css).toContain(".gallery-lightbox-count");
    // altin parilti hero efekti
    expect(css).toContain(".page-hero-aurora .eyebrow");
    expect(css).toContain("eyebrow-shimmer");
  });

  it("yeni runtime bagimliligi IMPORT etmez (framer-motion/gsap/lenis)", () => {
    const c = read(COMPONENT);
    // Lenis ornegine yalniz window.__lenis uzerinden erisir; paket import etmez.
    for (const dep of ["framer-motion", "gsap", "lenis"]) {
      expect(c.includes(`from "${dep}"`), `yasak import: ${dep}`).toBe(false);
      expect(c.includes(`from '${dep}'`), `yasak import: ${dep}`).toBe(false);
    }
  });
});
