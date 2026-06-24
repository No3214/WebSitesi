import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

describe("Stone & Light motion primitives", () => {
  it("keeps motion bounded, dependency-free and touch-safe", () => {
    const animations = read("src/components/animations.tsx");
    const globals = read("src/app/globals.css");

    expect(animations).toContain("export function StaggerContainer");
    expect(animations).toContain("export function Parallax");
    expect(animations).toContain("export function RevealLines");
    expect(animations).toContain("export function MagneticLink");
    expect(animations).toContain("export function TiltCard");
    expect(animations).toContain("fallbackMs = 1600");
    expect(animations).toContain("window.setTimeout(() => setInView(true), fallbackMs)");
    expect(animations).not.toContain("framer-motion");
    expect(animations).not.toContain("gsap");
    expect(animations).not.toContain("lenis");

    expect(animations).toContain('window.matchMedia("(pointer: coarse)")');
    expect(animations).toContain("disabledBelow = 768");
    expect(animations).toContain("Math.max(-24, Math.min(24");
    expect(animations).toContain("Math.max(0, Math.min(8, maxOffset))");
    expect(animations).toContain("Math.max(0, Math.min(4, maxTilt))");

    expect(globals).toContain(".magnetic-link-inner");
    expect(globals).toContain(".tilt-card");
    expect(globals).toContain("@media (pointer: coarse)");
    expect(globals).toContain(".tilt-card-inner {\n    transform: none !important;");
  });

  it("keeps the homepage room mosaic editorial without moving the card hitbox aggressively", () => {
    const roomsShowcase = read("src/components/home/rooms-showcase.tsx");
    const globals = read("src/app/globals.css");

    expect(roomsShowcase).toContain("room-mosaic");
    expect(roomsShowcase).toContain("room-mosaic-featured");
    expect(roomsShowcase).toContain("priority={index === 0}");
    expect(roomsShowcase).not.toContain("autoPlay");

    expect(globals).toContain(".room-mosaic-card:hover");
    expect(globals).toContain("transform: translateY(-3px);");
    expect(globals).not.toContain("transform: translateY(-8px);");
    expect(globals).toContain(".room-mosaic-card:hover .card-link .arrow");
    expect(globals).toContain("transform: translateX(4px);");
  });

  it("documents the first visual wave and the deferred heavy media work", () => {
    const baseline = read("docs/design/visual-baseline.md");
    const inventory = read("docs/design/media-usage-inventory.md");

    expect(baseline).toContain("Stone & Light Editorial");
    expect(baseline).toContain("real lightweight `StaggerContainer`, `Parallax`, `RevealLines`, and `MagneticLink`");
    expect(baseline).toContain("gallery lightbox and cinematic filmstrip");
    expect(inventory).toContain("Use only real Kozbeyli Konagi media");
    expect(inventory).toContain("Do not fill missing sections with generated or stock-like hotel imagery");
  });

  it("exposes the visual primitives in Storybook for review", () => {
    const storybook = read("src/stories/MotionPrimitives.stories.tsx");

    expect(storybook).toContain('title: "Kozbeyli/Motion Primitives"');
    expect(storybook).toContain("MagneticLink");
    expect(storybook).toContain("RevealLines");
    expect(storybook).toContain("StaggerContainer");
    expect(storybook).toContain("Parallax");
    expect(storybook).toContain("TiltCard");
  });
});
