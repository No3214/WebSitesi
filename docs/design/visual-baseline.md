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
- `src/components/animations.tsx`: `Parallax` is now clamped to a 24px travel budget and disabled on touch/mobile-width contexts; `TiltCard` is available for later real-artifact storytelling without WebGL.
- `src/components/home/home-hero.tsx`: opening video contract preserved, editorial signature added, primary booking CTA gets the only magnetic interaction.
- `src/components/home/rooms-showcase.tsx`: equal homepage room grid replaced with editorial mosaic while keeping existing room facts and links.
- `src/components/home/gallery-strip.tsx`: homepage gallery keeps approved real media and now uses a native cinematic filmstrip rhythm with focusable captions.
- `src/app/globals.css`: Stone & Light surface tokens, hero reveal timing, magnetic CTA inner motion, responsive room mosaic.
- `src/app/globals.css`: gallery filmstrip aspect-ratio rhythm, native snap scroll, keyboard focus states and mobile-safe fallback.
- `src/stories/MotionPrimitives.stories.tsx`: Storybook now exposes the brand motion primitives for review before wider rollout.

Deferred by design:

- gallery lightbox;
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

## Prompt-drift kaydı (2026-07-01, FAZ V.3 oturumu)

Prompt v2 (`codex-visual-transformation-prompt-v2.md`) ile HEAD arasında tespit
edilen sapmalar — §0.4 kuralı gereği repo kazandı:

1. §4.1 "rooms-showcase eşit kart gridi" iddiası bayat: HEAD'te `room-mosaic`
   (featured + wide kart, 29 CSS referansı) zaten uygulanmış; `8a45c11` ile
   data-driven featured seçimi eklendi.
2. §8.3-8.4 "EKSİK TiltCard/MagneticLink" iddiası bayat: her ikisi
   `animations.tsx`'te mevcut ve MagneticLink hero CTA'da kullanılıyordu.
   Eksik olan TiltCard'ın ÜRETİM kullanımıydı — bu oturumda `/hikayemiz`
   "Taş & Işık" spatial pilotu ile kapatıldı.
3. Wave sıralaması fiili durumla örtüşmüyor: lightbox (Wave 4) ve room-detail
   iyileştirmeleri (Wave 5) ilk-oturum sınırından önce zaten mevcuttu/kapandı.
   Bu oturum V.3 izine (story rail + spatial pilot + native view transitions)
   ilerledi.
4. §15 experimental `viewTransition` bayrağı DEĞERLENDİRİLDİ ve alınmadı:
   launch-kritik repoda deneysel React bayrağı yerine CSS-only cross-document
   `@view-transition` (@supports korumalı) tercih edildi. SPA client-nav'ları
   etkilenmez; hard navigasyonlarda 200-220ms fade. Kayıt: bilinçli karar.
5. Ortam notu: `globals.css` working-tree kopyası OneDrive senkronu sırasında
   bir kez kuyruğu kırpılmış okundu (".men" yarım satır); HEAD'ten onarıldı ve
   commit içerikleriyle birebir doğrulandı. Ayrıca `.git` multi-pack-index
   "improper chunk offset" uyarısı veriyor — `git multi-pack-index repair`
   önerilir (OneDrive + .git birlikteliği riskli).
