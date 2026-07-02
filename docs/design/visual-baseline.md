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

---

# Revizyon — 2026-07-02 (Wave 0 yeniden doğrulama + drift kaydı)

HEAD: `8a45c11`. Yöntem: kod-türevli denetim + `npm run brand:verify`
(BRAND INTEGRITY READY, 190 dosya + canlı 12 rota) + hedefli vitest
(`tests/design-stone-light.test.ts` → 12/12 yeşil) + `tsc --noEmit` temiz.

## R1. Prompt-drift kaydı (prompt iddiası vs repo gerçeği)

Dışarıdan gelen dönüşüm promptu (v1, Gemini kaynaklı) ve v2'nin bazı iddiaları
bu dosyanın 2026-06-24 dalgasında ZATEN uygulanmış işlerle çelişiyordu.
Kural: repo kazanır; çelişki değişiklik yapılmadan buraya işlendi.

| Prompt iddiası | Repo gerçeği (kanıt) | Karar |
|---|---|---|
| v1 §4.1: `animations.tsx` yardımcıları no-op | Stagger gerçek gecikmeli; Parallax rAF + ±24px clamp + coarse-pointer kapalı; RevealLines mask + aria (`animations.tsx:104/206/268`) | Yeniden yazılmadı |
| v2 §8.3-8.4: TiltCard + MagneticLink "yeni eklenecek" | İkisi de mevcut, sınırlar uyumlu (magnetic ≤6/clamp 8, tilt ≤3/clamp 4); MagneticLink hero CTA'da (`home-hero.tsx:220`) | Eklenmedi; prompt v2'ye drift eki yazıldı |
| v1/v2 §11: oda sunumu "eşit kart gridi" | `.room-mosaic` 2026-06-24'ten beri asimetrik (nth-child 1 featured, 4 wide; `globals.css:1065-1190`) | Kalan boşluk kapatıldı: featured artık VERİDEN — `getShowcaseRooms` + `featured: true` (Superior 2 Kişilik) |
| v2 §10: hero reveal + imza detay eklenecek | `heroEditorialIn` kademeli reveal (0.08/0.14/0.28s) + `hero-signature` "FOÇA · TAŞ · ZEYTİN" + scroll-cue mevcut | Dokunulmadı |
| v1 §13: gallery lightbox yok | `gallery-lightbox.tsx` mevcut; filmstrip ritmi de 06-24 dalgasında | Wave 4 = yalnız a11y/klavye cilası |
| v1/v2 §14: `unoptimized` kaldırılacak | <10KB strip thumbnail'ları + Vercel 1000 optimize görsel/ay kotası | KASITLI KORUNUR; kilit testi mevcut |
| v2 §0.3: globals.css ~2000+ satır | 3465+ satır | §21 bölme gerekçesi güçlendi |

## R2. Bu revizyonda değişenler (kanıtlı)

1. `4b8c8d6` — önceki oturumun bekleyen işi gate'lenip commit'lendi: tam radius
   ölçeği + `--motion-cinematic`, oda-detay spec ikonları emoji→aria-hidden SVG,
   `tests/design-stone-light.test.ts` regresyon kilidi, `stone-light-editorial.md`.
2. `8a45c11` — featured oda seçimi source-order'dan koparıldı:
   `Room.featured?: boolean` + `getShowcaseRooms()` (featured başa, ≤6, fallback
   korunur) + vitrin bileşeni helper'a geçti + 6 yeni sözleşme testi (12/12) +
   gövde metinlerinde `text-wrap: pretty` progressive enhancement.

## R3. Bütçe durumu

Yeni bağımlılık YOK (package.json değişmedi). tsc temiz. Hedefli unit 12/12.
brand:verify READY. LCP/CLS riski: değişiklikler additive CSS + veri sıralaması;
canlı Lighthouse karşılaştırması R4 protokolünde.

Bilinen ortam kısıtı: Cowork sandbox'ında vitest koşamaz (rollup'ın Windows
node_modules'unda Linux binary'si yok) — testler Windows'ta `npx vitest run`
ile koşulur ve koşuldu.

## R4. Canlı görsel QA protokolü (screenshot matrisi — beklemede)

360×800, 390×844, 768×1024, 1024×768, 1440×900 × {`/`, `/odalar`,
`/odalar/superior-2-kisilik-oda`, `/gastronomi`, `/galeri`, `/hikayemiz`,
`/rezervasyon`, `/en`} → `docs/design/baseline/` altına. Kontrol: hiyerarşi,
spacing, CTA belirginliği, cookie bar + mobil action bar çakışması, kadraj,
reduced-motion, focus halkaları, CLS overlay. Özel doğrulama: ana sayfa featured
kartı artık Superior 2 Kişilik Oda; mozaik ritmi ve oda linkleri bozulmadı.

## R5. Kalan dalgalar

1. **Wave 4** — filmstrip ritmine dokunma gerekmiyor; yalnız lightbox a11y/klavye
   cilası + gastronomi split rafinesi.
2. **Wave 5** — oda detay premium viewer: swipe/drag, klavye okları, fullscreen,
   inline/style-jsx söküm (`unoptimized` korunur).
3. **Wave 6** — `/hikayemiz` story rail (CSS scroll-driven + `@supports`) +
   TiltCard artifact pilotu (gerçek obje fotoğrafı: owner girdisi gerekli).
4. **Wave 7** — native View Transitions (`@view-transition` + `@supports`).
5. **Wave 8** — Playwright visual regression matrisi + Lighthouse kilidi.

## Prompt-drift kaydı (2026-07-01, FAZ V.3 oturumu — Claude/Cowork)

Prompt v2 ile HEAD arasında tespit edilen sapmalar — §0.4 kuralı gereği repo kazandı:

1. §4.1 "rooms-showcase eşit kart gridi" iddiası bayattı: HEAD'te `room-mosaic`
   zaten uygulanmıştı; `8a45c11` ile data-driven featured seçimi eklendi.
2. §8.3-8.4 "EKSİK TiltCard/MagneticLink" iddiası bayattı: her ikisi
   `animations.tsx`'te mevcuttu, MagneticLink hero CTA'da kullanılıyordu.
   Eksik olan TiltCard'ın ÜRETİM kullanımıydı — `/hikayemiz` "Taş & Işık"
   spatial pilotu ile kapatıldı (`74eb577`).
3. Wave sıralaması fiili durumla örtüşmüyordu: lightbox (W4) ve room-detail
   (W5) ilk-oturum sınırından önce zaten mevcuttu/kapandı; bu oturum V.3 izine
   (story rail + spatial pilot + native view transitions) ilerledi.
4. §15 experimental `viewTransition` bayrağı DEĞERLENDİRİLDİ ve alınmadı:
   launch-kritik repoda deneysel React bayrağı yerine CSS-only cross-document
   `@view-transition` (@supports korumalı, 200-220ms, ≤10px) tercih edildi.
   SPA client-nav'ları etkilenmez; reduced-motion'da kapalı.
5. Ortam notu: OneDrive senkronu sandbox mount'unda iki kez bayat/kırpık okuma
   üretti (`globals.css` kuyruğu, bu dosyanın be8e015 revizyonu). Kural:
   düzenlemeden önce dosyanın güncel halini git'ten doğrula; `.git`
   "improper chunk offset" uyarısı yalnız sandbox okumasında görülüyor,
   Windows tarafında git sağlıklı.
6. Eşzamanlılık kaydı: vt-fade-out başta -8px idi; motion-primitives kilidi
   (`translateY(-8px)` yasağı) ile çakıştı, -6px'e çekildi (bütçe ≤12px içinde).
