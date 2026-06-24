# Kozbeyli Konagi Visual Baseline

Date: 2026-06-24

## Direction

The approved direction for the next visual wave is **Stone & Light Editorial**:

- warm stone, olive and brass tones;
- real hotel, room and food media only;
- cinematic movement limited to hero polish, reveal, stagger and small hover states;
- no global smooth-scroll hijack, custom cursor, audio, haptics, main-page 3D, Spline iframe, or WebGL background;
- no new frontend animation dependency for this wave.

## First Wave Scope

Implemented in this wave:

- `src/components/animations.tsx`: real lightweight `StaggerContainer`, `Parallax`, `RevealLines`, and `MagneticLink` primitives with reduced-motion fallbacks.
- `src/components/home/home-hero.tsx`: opening video contract preserved, editorial signature added, primary booking CTA gets the only magnetic interaction.
- `src/components/home/rooms-showcase.tsx`: equal homepage room grid replaced with editorial mosaic while keeping existing room facts and links.
- `src/app/globals.css`: Stone & Light surface tokens, hero reveal timing, magnetic CTA inner motion, responsive room mosaic.

Deferred by design:

- gallery lightbox and cinematic filmstrip;
- room detail swipe/keyboard viewer;
- optional real-asset 3D pilot for `/hikayemiz`;
- Storybook visual regression setup;
- CMS/schema, booking, or backend changes.

## Baseline Routes For Visual QA

- `/`: hero video, room mosaic, gastronomy handoff, sticky mobile CTA.
- `/odalar`: catalog card contrast and existing `card-grid` accessibility contract.
- `/gastronomi`: below-fold video behavior and food media placement.
- `/galeri`: existing image decode and lazy/eager contracts.
- `/en`: localized hero and CTA language.

## Acceptance Notes

- Hero video must remain visible on first paint and keep poster fallback.
- Main booking CTA must continue opening the configured HMS booking engine in a new tab.
- Room cards must not invent new amenities, awards, review scores or price claims.
- Motion must collapse under `prefers-reduced-motion: reduce`.
- Mobile layout must stack the room mosaic into a single readable column.
