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

---

# Revizyon — 2026-07-02: Google Drive Arşivi Triage + Oda Videosu v2

Kaynak: owner Drive kökü `1yjl-o_ZE5EO4069X8_TuoJix_SmbVNZC` (Drive MCP ile
metadata taraması: kök + Düğün + Akşam Yemeği Çekim + Odalar Mini/Minimini).
Kural: master'lar web bütçesine sıkıştırılmadan siteye GİRMEZ (foto → WebP
≤400KB, oda videosu → 720p ≤6MB — `tests/room-intro-video.test.ts` kilidi).

## R1. Drive yapısı → site rolü eşlemesi

| Drive kaynağı | İçerik (metadata kanıtı) | Kalite sınıfı | Önerilen rol |
|---|---|---|---|
| Kök AR-serisi (`_AR12759/12800/12972/14846 kopya.jpg`, 8-23MB) | Profesyonel kareler | hero/editorial | Galeri güçlendirme, gastronomi hero, OG varyantı |
| Kök `menu6-9.jpg` (16-25MB) + `Akşam Yemeği Çekim/` | Profesyonel yemek çekimi | editorial | /gastronomi + /menu editorial kareler |
| Kök gastronomi reel'leri (15 mp4, 15-65MB) | Master reel'ler (kahvaltı/mıhlama/şef/steak/pirzola/kruvasan/sunset/breakfast-show) | editorial video | Mevcut gastronomi videolarının yüksek kaliteli yeniden-türetim kaynağı |
| `Düğün/` (~15 foto 1-2MB + 4 mp4 ~2MB, WhatsApp) | Gerçek düğün kurulumları | card/detail | /organizasyonlar galerisi + düğün funnel sosyal kanıtı (misafir yüzü izni TEYİT ŞART) |
| `Odalar Mini/` (oda başına klasör, 150-450KB jpeg) | Oda + detay kareleri | card/detail | Oda galerilerine ek kare (4/oda → 6-8/oda); hero için YETERSİZ |
| `Odalar Minimini/` | Mini alt kümesi | duplicate | Kullanma (`duplicateOf: Odalar Mini`) |
| `WEB/ FOTO/ VIDEO/ MENU/ LOGO/` | Derin tarama bekliyor | ? | 2. tur triage |
| Sosyal medya klasörleri + Canva şablonları | Sosyal içerik | reject (site) | Siteye girmez |
| `kozbeyli_Ses.mp4`, `Kozbeyli_rakı_aday.mp4` | Sesli/içki odaklı reel | dikkat | Marka/uyum incelemesiz kullanma |

## R2. Boşluk analizi

1. **Oda videosu**: Drive'da gerçek oda video klibi YOK → videolar fotoğraftan
   üretilmeye devam eder; v2 reçetesi bu turda uygulandı (aşağıda). Kalıcı
   öneri: sonraki çekimde oda başına 2×8sn gerçek pan klibi.
2. **Organizasyon/düğün**: sitenin en zayıf medya alanı; Düğün klasörü kapatır
   (izin teyidiyle).
3. **Oda detay kare sayısı**: Odalar Mini ile 6-8/oda mümkün (kart/detay
   kalitesi; hero değil).
4. **Gastronomi**: acil değil; master'lar gelecekte daha yüksek bit hızlı
   türetim imkânı.

## R3. Oda videosu reçetesi v2 (owner geri bildirimi: v1 "kötü")

Teşhis → çözüm: (1) zoompan çıktı çözünürlüğünde render → subpiksel TİTREME →
şimdi 1920×1080 iç render + lanczos 1280×720 indirme; (2) yönlü smooth/slide
geçişler slayt hissi → 1.1s yumuşak crossfade; (3) 4.2s tempo aceleci → 5.5s +
push-in/pull-out ritmi (zoom tavanı 1.12→1.08); (4) hafif editoryal grade
(kontrast 1.02, doygunluk 1.05). Encode: x264 crf23 fast, faststart, ≤6MB.
Script: `scripts/make-room-video.sh` (v2). Üretim logu: `tmp/rooms-v2/`.

## R4. Owner kararları (bekleyen)

1. Düğün karelerinde misafir yüz izni yazılı mı?
2. AR-serisinden galeri/gastronomi hero seçimi (4 aday).
3. `WEB/` klasörünün amacı — 2. tur taramada öncelik.
