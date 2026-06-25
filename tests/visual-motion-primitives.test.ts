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

  it("keeps the homepage gallery as a real-media native cinematic filmstrip", () => {
    const galleryStrip = read("src/components/home/gallery-strip.tsx");
    const globals = read("src/app/globals.css");

    expect(galleryStrip).toContain("filmstripRhythm");
    expect(galleryStrip).toContain("gallery-item-hero");
    expect(galleryStrip).toContain("gallery-item-portrait");
    expect(galleryStrip).toContain("gallery-item-wide");
    expect(galleryStrip).toContain("galleryShots.map");
    expect(galleryStrip).toContain("unoptimized");
    expect(galleryStrip).not.toContain("autoPlay");
    expect(galleryStrip).not.toContain("framer-motion");

    expect(globals).toContain(".gallery-item-hero");
    expect(globals).toContain(".gallery-item:focus-visible");
    expect(globals).toContain("scroll-snap-type: x mandatory;");
    expect(globals).toContain("width: clamp(320px, 46vw, 640px);");
    expect(globals).toContain(".gallery-item,\n    .gallery-item-hero,\n    .gallery-item-portrait,\n    .gallery-item-wide");
  });

  it("keeps homepage gastronomy videos tactile without adding heavy motion dependencies", () => {
    const gastronomyEditorial = read("src/components/home/gastronomy-editorial.tsx");
    const gastronomyPage = read("src/components/gastronomy-page-content.tsx");
    const globals = read("src/app/globals.css");

    expect(gastronomyEditorial).toContain("FadeIn, Parallax");
    expect(gastronomyEditorial).toContain('className="editorial-media" distance={10}');
    expect(gastronomyEditorial).toContain('className="editorial-media" distance={12}');
    expect(gastronomyEditorial).toContain('data-video-state={isPlaying ? "playing" : playbackBlocked ? "blocked" : "paused"}');
    expect(gastronomyEditorial).toContain("video-control-label");
    expect(gastronomyEditorial).not.toContain("framer-motion");
    expect(gastronomyEditorial).not.toContain("autoPlay");

    expect(gastronomyPage).toContain("toggleVideo");
    expect(gastronomyPage).toContain("video-control-label");
    expect(gastronomyPage).toContain('data-testid={`kitchen-video-play-${event.replace("video_play_", "")}`}');
    expect(globals).toContain(".video-control-label");
    expect(globals).toContain('video[data-video-state="paused"]');
  });

  it("documents the first visual wave and the deferred heavy media work", () => {
    const baseline = read("docs/design/visual-baseline.md");
    const inventory = read("docs/design/media-usage-inventory.md");

    expect(baseline).toContain("Stone & Light Editorial");
    expect(baseline).toContain("real lightweight `StaggerContainer`, `Parallax`, `RevealLines`, and `MagneticLink`");
    expect(baseline).toContain("native cinematic filmstrip rhythm");
    expect(baseline).toContain("gallery lightbox");
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
