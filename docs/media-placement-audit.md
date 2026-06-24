# Kozbeyli Konağı Media Placement Audit

Last updated: 2026-06-18

Verification command:

```bash
npm run media:hero
```

This gate checks the approved opening video hash, MP4 dimensions, duration,
bitrate, poster derivatives, homepage component wiring, and the Playwright
desktop/mobile playback contract before a release is accepted.

## Placement Rules

- Do not use generated, stock-like, or uncertain venue imagery for product sections.
- Use existing site videos only where the video content matches the section:
  - Homepage: `/videos/hero.mp4` — 15.78s high-quality cinematic montage (1280x2276, ~3.39 Mbps; stone exterior + atmosphere). Mobile viewports use `/videos/hero-mobile.mp4`, a 720x1280 derivative from the same approved montage (~1.65 Mbps, 3.25 MB) to reduce first-visit bandwidth while preserving the desktop fallback. The LCP poster (`hero-video-poster-*`) already fixes the first-paint on the exterior, so the longer montage is the premium loop. The 2.75s `/videos/hero-property.mp4` exterior clip is **superseded** (too short to loop premium) and kept only as a historical derivative.
  - Gastronomy: `/videos/kahvalti.mp4`, `/videos/mihlama.mp4`, `/videos/chef.mp4`
  - History/atmosphere: `/videos/sunset.mp4`
- Do not present Instagram screenshot/PDF tiles as real videos. Reels covers can only be used as still references unless the original video file exists in `public/videos`.
- Avoid identifiable guest/couple photos as primary product images unless explicit publication approval is clear. Prefer venue, table setup, room, food, and atmosphere assets.

## Current Approved Mapping

| Placement | Asset | Source basis | Reason |
| --- | --- | --- | --- |
| Homepage hero poster | `/images/hero-video-poster-1280.webp` | Exterior frame from `/videos/hero.mp4` | Keeps poster and intro video consistent; carries the exterior-first LCP impression. |
| Homepage hero video | `/videos/hero.mp4` | Kozbeyli/Emergent high-quality montage (2026-06-18) | 15.78s, 1280x2276, ~3.39 Mbps cinematic loop; desktop/premium fallback. |
| Homepage hero mobile video | `/videos/hero-mobile.mp4` | Derived from `/videos/hero.mp4` with ffmpeg, no synthetic media | 15.78s, 720x1280, ~1.65 Mbps, 3.25 MB; selected on mobile viewports before the desktop MP4 fallback. |
| Organization wedding card | `/images/organizasyonlar/butik-dugun.jpg` | Kozbeyli wedding presentation PDF | Shows real terrace wedding table setup and view. |
| Organization wedding detail media | `/images/organizasyonlar/teras-davet.jpg` and `/images/organizasyonlar/butik-dugun.jpg` | Kozbeyli wedding presentation PDF | Uses real event setup instead of unrelated decorative video. |
| Organization wedding gallery | `/images/organizasyonlar/teras-davet.jpg`, `/images/organizasyonlar/butik-dugun.jpg`, `/images/organizasyonlar/dugun/dugun-4.jpg`, `/images/organizasyonlar/dugun/dugun-3.jpg` | Kozbeyli wedding presentation PDF | Opens with venue/table/product context; keeps close-detail images only when no face or clear personal identity is shown. |
| Corporate off-site card | `/images/organizasyonlar/kurumsal-offsite.jpg` | Kozbeyli corporate/toplanti PDF | Shows the actual meeting setup. |
| Gourmet celebration card | `/videos/kahvalti-poster.jpg` | Existing gastronomy video poster | Keeps food content tied to known restaurant media. |
| Experience designer cards | `/images/galeri/*`, `/images/odalar/*`, `/images/organizasyonlar/teras-davet.jpg`, `/images/hero-video-poster.jpg` | Existing local Kozbeyli media | Replaces previous generic Unsplash images with real venue/room/food assets. |

## Google Drive Intake Check

2026-06-18 read-only check of the shared Drive folder
`1yjl-o_ZE5EO4069X8_TuoJix_SmbVNZC` returned a Google Drive folder page named
`waw` and exposed 34 unique visible media filenames in the page markup. The
listing included `_AR12446 kopya.jpg` through `_AR16300 kopya.jpg`; the tool
could not authenticate or bulk-download originals from Drive, so production
placement remains limited to repo-local assets that were inspected, hashed and
tested. Any new Drive import must go through the same provenance and privacy
screen before being used on public pages.

## Rejected/Not Used

- Stock-like wedding table images from unrelated venues.
- DJ equipment closeups as a primary organization asset.
- Instagram grid screenshots as standalone product media.
- Wedding detail images with clearly readable guest names or direct personal identity markers (`dugun-1.jpg`, `dugun-2.jpg`) on public organization pages.
- Any generated or hallucinated image.
- Remote stock/generic image hosts such as Unsplash for product-facing modules.

## Source Hashes

Local source documents are user-provided media artifacts and are not committed
because they may contain private event or vendor material. Hashes below make the
current extraction auditable.

| Source / Asset | SHA-256 |
| --- | --- |
| `düğün 1/1 Kozbeyli Konağı Düğün Nişan Sunum.pdf` | `5CCBC6F7CCD1E4B9F5C19B8AA795A448C51AD8268BEBFAC97E8B36F28C99351B` |
| `düğün 1/2 Kozbeyli Konağı Düğün Nişan Sunum.pdf` | `0B0EDA554F490766487CA0DED6C80F6EEE7510B176F8443A359F9F49AD45C1CC` |
| `kozkon belgeler düğün şirket/Kozbeyli Konağı Toplantı Konaklama.pdf` | `215BD15E6CBDF68D6769C7CBD44EAB8B025F225A2C4894D7F63DAF8AD826BEAA` |
| `Downloads/screencapture-instagram-kozbeylikonagi-2026-06-13-13_06_01.pdf` | `9781225E83FDB03AC6E83D5325F9F680E348262ED1D4D5DC7FFA323A4D93CBA0` |
| `public/videos/hero.mp4` | `62BB0B9FC0C71912913D763D1446A768E0718F4F9DA689E76C4FE41D6F8B371E` |
| `public/videos/hero-mobile.mp4` | `5FE89E7AE4E96498278C79AD83A1F587594F0A714105587565D660521E028CC9` |
| `public/videos/hero-property.mp4` | `8CED7C302B0F684732C0F695958FBDA86EC07A5D630C558AF2F2B8FBED3DAD37` |
| `public/images/hero-video-poster.jpg` | `3ADB687855ACC49FAA0E26EE975A3E175FCB28AA5FD3DC2E0D263E9421305180` |
| `public/images/organizasyonlar/butik-dugun.jpg` | `5B7294E32076ECA11014009732E8F39793DFF8B7A26820B3BD16F9E61F94956F` |
| `public/images/organizasyonlar/teras-davet.jpg` | `424DF7D6CF546409AE5803FE62BA8A10F1E2ECF9A2114BBB76ACF292E42BFF0E` |
| `public/images/organizasyonlar/kurumsal-offsite.jpg` | `F7912E7A2B20BE1A5201FB701A5CA85DFF57CBE4ED18142416249FA1403986CC` |
| `public/images/organizasyonlar/dugun/dugun-4.jpg` | `E4701FFCA2A461757C2F182BC5268158508799F3302478F82155C18E9076CF40` |
| `public/images/organizasyonlar/dugun/dugun-3.jpg` | `D86C67FAD856899EF2B5D4761E29F27B732027F57103B1A094141544AF4C959C` |
