# FAZ V.3 + Wave 8 — Canlı Doğrulama Kanıtı (2026-07-02)

Kural: kanıt yoksa "kanıt yok". Tüm ölçümler bu oturumda alındı.

## 0. LCP iterasyonu (aynı gün, 3 adım — nihai durum)

Teşhis (lh-diag, sim. yavaş-4G mobil): LCP 9.6s'in kök nedeni bant yarışıydı —
t=0.9s'te 6 ham mozaik JPG (~1.2MB) + video `poster` attr'ının 101KB mükerrer
poster indirmesi + High öncelikli featured JPG, LCP posterinden önce bitiyordu
(poster bitişi 11.2s).

| Adım | Değişiklik | Sonuç |
| --- | --- | --- |
| `aceb3ec` | video poster attr kaldırıldı; Next/Image `fetchPriority` prop denendi | Poster dedupe ✓; prop Next tarafından markup'a GEÇİRİLMEDİ (servis HTML'de doğrulandı) |
| `f767046` | `ReactDOM.preload` (head'den `<link rel=preload as=image fetchpriority=high imagesrcset>`) | Canlıda link doğrulandı; poster High öncelikle ~1.3s'te bitiyor (önce 11.2s) |
| `ba07e6f` | `poster="...960w"` geri geldi | Poster attr'sız video İLK KARESİ LCP adayı olup LCP'yi ~10s'e sabitliyordu; 960w hem erken adayı geri getirir hem mobilde img'nin seçtiği DOSYANIN aynısı → tek indirme |

Mekanik kanıtlar (deterministik, makine yükünden bağımsız):
poster ağ isteği High öncelik + tüm mozaik Low/lazy'den önce bitiyor;
head preload linki canlı HTML'de; mükerrer 1280w poster isteği yok.

Lab ölçümü uyarısı: after koşumları paralel oturumun işleri (video encode,
test koşuları) makineyi doyururken alındı (TBT 230-470ms, FCP 1.9-3.3s
salınımı) — mutlak LCP değerleri bu koşullarda güvenilir A/B vermez. Nihai
sayısal doğrulama: PSI API (keyless kota yarın sıfırlanır) veya PostHog RUM
(`analytics_purchase` gate'i sonrası).

**CLS 0.3 bulgusu — KAPANDI (`cfcf3fb`):** kök neden `.room-mosaic-video`
için HİÇ CSS kuralı olmamasıydı — in-view mount olan video in-flow block gibi
kartı büyütüp footer'ı ~1400px itiyordu. Fix: `position:absolute; inset:0;
object-fit:cover` overlay (mount anında sıfır yerleşim etkisi) + regresyon
kilidi (`design-stone-light.test.ts`). Canlı doğrulama (deploy READY sonrası
Lighthouse, 2026-07-02): **CLS 0.3 → 0**, TBT 179ms; overlay kuralı prod
CSS'te birebir mevcut (`.room-mosaic-video{object-fit:cover;width:100%;
height:100%;position:absolute;inset:0}`). Lab LCP (~10.6s) makine yükü +
sim-4G altında ölçüldü; mutlak LCP doğrulaması PSI kotası/RUM'a bırakıldı.

## 1. Deploy kanıtı

| Alan | Değer |
| --- | --- |
| Deployment | `dpl_ExkyPHBumZhXca2mba8EhtXV43gN` |
| Commit | `1cb1911` (main) |
| Durum | READY (buildingAt→ready ~104s) |
| Alias | www.kozbeylikonagi.com, kozbeylikonagi.com |
| Target | production |

## 2. Canlı markup/CSS probu (curl, prod)

`GET /hikayemiz` HTML'inde doğrulandı: `stone-light-title` (id + aria-labelledby),
`story-rail-scenes`, `story-rail-artifact`, `arch-frame`, üç gerçek medya
(`tas-cephe.jpg`, `oda-detay-2.jpg`, `aksam-sofrasi.jpg`).

Prod CSS (`/_next/static/css/7afb996d87865e2b.css`) içinde minifier sonrası
korunmuş: `@view-transition{navigation:auto}`, `animation-timeline:view()`,
`story-scene-reveal`. Lightning CSS/Tailwind 4 pipeline'ı at-rule'ları bozmadı.

## 3. Lighthouse (prod, mobil emülasyon, --only-categories=performance)

| Route | Perf | LCP | CLS | TBT |
| --- | --- | --- | --- | --- |
| `/` | 59 | **9.0 s** | 0 | 140 ms |
| `/hikayemiz` | 71 | 5.6 s | 0 | 120 ms |

Okuma: **CLS 0** (FAZ V.3 aspect-ratio kararı dahil hiçbir yüzey kaymıyor) ve
TBT sağlıklı. **Mobil LCP bütçe dışı** (hedef <2.5s). Bu FAZ V.3'ten bağımsız,
hero kaynaklı: 1440×2560 poster + `preload="auto"` hero videosu simüle yavaş
4G'de bant genişliği yarışıyor. Öneri (owner kararı — "Stabilize homepage
editorial video playback" commit'i preload=auto'yu bilinçli seçmiş olabilir):
`preload="metadata"` denemesi + poster ağırlık optimizasyonu, RUM (PostHog
Core Web Vitals) ile karşılaştırmalı doğrulama. Not: `analytics_purchase`
gate'i kapanınca gerçek kullanıcı LCP'si RUM'dan izlenebilir.

## 4. Playwright görsel regresyon (Wave 8 kilidi)

- Spec: `tests/e2e/visual-regression.spec.ts` — 15/15 PASSED (1.2m), canlı prod'a
  karşı `PW_BASE_URL` + sistem Chrome ile.
- Matris: {`/`, `/odalar`, `/hikayemiz`, `/gastronomi`} × {360×800, 768×1024,
  1440×900} above-the-fold + 3 viewport'ta `story-rail-scenes` yakın çekim.
- Determinizm (prompt v2 §24): reduced-motion zorlandı; tüm animation/transition
  donduruldu; videolar gizlendi (zaman bağımlı kare farkı yok); cookie banner
  maskelendi; `document.fonts.ready` beklendi; `domcontentloaded` + sabit bekleme
  (canlı prod'da `networkidle` video preload + analytics nedeniyle hiç oturmuyor —
  ilk koşumun timeout dersi).
- Baseline: `tests/e2e/visual-regression.spec.ts-snapshots/` (15 PNG). Sonraki
  koşumlar `--update-snapshots` OLMADAN fark yakalar; `maxDiffPixelRatio: 0.02`.

## 5. Bilinen sapmalar / notlar

- Lighthouse CLI çıkışları `EPERM temp cleanup` ile exit 1 verdi (chrome-launcher
  Windows temp silme yarışı) — raporlar tam yazıldı, metrikler geçerli.
- Baseline canlı prod içeriğine bağlıdır: içerik değişince (ör. oda görseli
  güncellenince) baseline bilinçli yenilenmeli (`--update-snapshots`).
