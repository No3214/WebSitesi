# Kozbeyli Konagi Media Usage Inventory

Date: 2026-06-24

## Current Public Media Roots

- `public/videos`: hero and gastronomy/event video assets.
- `public/images/odalar`: room photography used by homepage, room catalog and room detail pages.
- `public/images/galeri`: mixed property, food, room and experience gallery assets.
- `public/images/organizasyonlar`: event and wedding imagery.

There is currently no dedicated `public/images/gastronomi` folder. Gastronomy pages rely on video posters and gallery food assets. The next media curation wave should move selected real food photos into a stable gastronomy folder before wiring more static food visuals into the page.

## Video Assets

| Asset | Approx. size | Current role | Note |
| --- | ---: | --- | --- |
| `public/videos/hero.mp4` | 6.69 MB | Desktop opening hero | Largest LCP-adjacent media risk; keep poster fallback and consider future compression pass. |
| `public/videos/hero-mobile.mp4` | 3.25 MB | Mobile opening hero | Correct mobile-specific source; verify crop on 390px and 430px viewports. |
| `public/videos/mihlama.mp4` | 1.29 MB | Gastronomy clip | User reported mobile playback concern; keep lazy autoplay/playback controls tested. |
| `public/videos/kahvalti.mp4` | 4.04 MB | Gastronomy/breakfast clip | Candidate for compression before heavier gastronomy redesign. |
| `public/videos/chef.mp4` | 1.83 MB | Gastronomy/chef clip | Suitable for editorial split sections. |
| `public/videos/sunset.mp4` | 0.99 MB | Atmosphere/experience clip | Keep below fold; no preload on first paint. |

## Room Media

Room media is already organized by slug under `public/images/odalar`. The homepage room mosaic continues to use each room's first image and keeps `unoptimized` because these are approved direct public assets.

## Curation Rules

- Use only real Kozbeyli Konagi media for rooms, property, food, weddings and staff.
- Do not fill missing sections with generated or stock-like hotel imagery.
- Do not add fixed room prices unless pulled from an approved live source or explicitly provided by operations.
- Preserve existing alt text intent and improve it only when the source media is verified.
