# Kozbeyli Konağı Media Placement Audit

Last updated: 2026-06-17

## Placement Rules

- Do not use generated, stock-like, or uncertain venue imagery for product sections.
- Use existing site videos only where the video content matches the section:
  - Homepage: `/videos/hero.mp4` — 15.78s cinematic montage (stone exterior + atmosphere). The LCP poster (`hero-video-poster-*`) already fixes the first-paint on the exterior, so the longer montage is the premium loop. The 2.75s `/videos/hero-property.mp4` exterior clip is **superseded** (too short to loop premium) and kept only as a historical derivative.
  - Gastronomy: `/videos/kahvalti.mp4`, `/videos/mihlama.mp4`, `/videos/chef.mp4`
  - History/atmosphere: `/videos/sunset.mp4`
- Do not present Instagram screenshot/PDF tiles as real videos. Reels covers can only be used as still references unless the original video file exists in `public/videos`.
- Avoid identifiable guest/couple photos as primary product images unless explicit publication approval is clear. Prefer venue, table setup, room, food, and atmosphere assets.

## Current Approved Mapping

| Placement | Asset | Source basis | Reason |
| --- | --- | --- | --- |
| Homepage hero poster | `/images/hero-video-poster-1280.webp` | Exterior frame from `/videos/hero.mp4` | Keeps poster and intro video consistent; carries the exterior-first LCP impression. |
| Homepage hero video | `/videos/hero.mp4` | Kozbeyli montage (2026-06-16) | 15.78s cinematic loop; supersedes the 2.75s `hero-property.mp4` clip. |
| Organization wedding card | `/images/organizasyonlar/butik-dugun.jpg` | Kozbeyli wedding presentation PDF | Shows real terrace wedding table setup and view. |
| Organization wedding detail media | `/images/organizasyonlar/teras-davet.jpg` and `/images/organizasyonlar/butik-dugun.jpg` | Kozbeyli wedding presentation PDF | Uses real event setup instead of unrelated decorative video. |
| Corporate off-site card | `/images/organizasyonlar/kurumsal-offsite.jpg` | Kozbeyli corporate/toplanti PDF | Shows the actual meeting setup. |
| Gourmet celebration card | `/videos/kahvalti-poster.jpg` | Existing gastronomy video poster | Keeps food content tied to known restaurant media. |
| Experience designer cards | `/images/galeri/*`, `/images/odalar/*`, `/images/organizasyonlar/teras-davet.jpg`, `/images/hero-video-poster.jpg` | Existing local Kozbeyli media | Replaces previous generic Unsplash images with real venue/room/food assets. |

## Rejected/Not Used

- Stock-like wedding table images from unrelated venues.
- DJ equipment closeups as a primary organization asset.
- Instagram grid screenshots as standalone product media.
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
| `public/videos/hero.mp4` | `BEC54FD97185B0722BD9984382FA5C5EFB6FABFE423932FE4EE7DFFE1ACFBF67` |
| `public/videos/hero-property.mp4` | `8CED7C302B0F684732C0F695958FBDA86EC07A5D630C558AF2F2B8FBED3DAD37` |
| `public/images/hero-video-poster.jpg` | `3ADB687855ACC49FAA0E26EE975A3E175FCB28AA5FD3DC2E0D263E9421305180` |
| `public/images/organizasyonlar/butik-dugun.jpg` | `5B7294E32076ECA11014009732E8F39793DFF8B7A26820B3BD16F9E61F94956F` |
| `public/images/organizasyonlar/teras-davet.jpg` | `424DF7D6CF546409AE5803FE62BA8A10F1E2ECF9A2114BBB76ACF292E42BFF0E` |
| `public/images/organizasyonlar/kurumsal-offsite.jpg` | `F7912E7A2B20BE1A5201FB701A5CA85DFF57CBE4ED18142416249FA1403986CC` |
