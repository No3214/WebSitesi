# KOZBEYLİ KONAĞI — UI/UX, TEMA VE GÖRSEL DÖNÜŞÜM PROMPTU (v2)
## Codex'e Doğrudan Verilecek Uygulama Promptu — 2026-07-01

> v2 değişiklik özeti (v1'e göre):
> 1. **Bayat iddialar düzeltildi.** v1'deki "animations.tsx no-op" tespiti artık
>    yanlış — `StaggerContainer` gerçek stagger, `Parallax` ±24px clamp + rAF +
>    coarse-pointer devre dışı bırakma, `RevealLines` mask reveal + aria-label
>    uyguluyor (HEAD `b96ecdb` doğrulaması). v2 "önce doğrula, sonra değiştir"
>    kuralını zorunlu kılar.
> 2. **Platform araştırması enjekte edildi.** View Transitions API (same-document,
>    Baseline 2025, Firefox 144+ ile tüm büyük tarayıcılar) ve CSS scroll-driven
>    animations (2026'da geniş destek) — sayfa geçişleri ve story rail artık
>    kütüphanesiz, native çözülür. Kaynaklar §0.3.
> 3. **Bütçelere INP < 200ms eklendi**; mobil %70 rezervasyon gerçeği kabul
>    kriterlerine yansıdı.
> 4. Mevcut token gerçekleri işlendi: `--ease-lux` zaten var — motion tokenları
>    onu YENİDEN ADLANDIRMAZ, üzerine inşa eder. `--font-playfair` + `--font-inter`
>    doğrulandı; `globals.css` ~2000+ satır (bölme gerekçesi kanıtlı).
> 5. v1'deki yazım hataları temizlendi (ör. §22'deki "그대로" → "olduğu gibi").
> 6. Prompt engineering iskeleti: ROL, GİRDİLER, ÖN-UÇUŞ DOĞRULAMASI, dalga başına
>    KANIT ŞABLONU, DURMA KOŞULLARI eklendi.

---

# 0. ROL, GİRDİLER VE ZEMİN GERÇEKLERİ

## 0.1 Rol

Sen `No3214/WebSitesi` repo kökünde çalışan kıdemli bir tasarım-mühendisisin.
Görev: Kozbeyli Konağı'nın mevcut tasarım sistemini "Stone & Light Editorial"
yönünde rafine etmek. Yeni iş modeli, backend, e-ticaret, rezervasyon sistemi
veya AI ajanı KURMUYORSUN. Bu bir görsel/etkileşim sprintidir.

## 0.2 Girdiler (değiştirme, oku)

- `AGENTS.md` — çalışma kuralları
- `src/app/globals.css` — mevcut tokenlar (`--font-playfair`, `--font-inter`,
  `--ease-lux`, olive/gold/ivory paleti)
- `src/components/animations.tsx` — ÇALIŞAN hareket yardımcıları
- `src/components/home/` — `rooms-showcase.tsx`, `gallery-strip.tsx`,
  `gastronomy-editorial.tsx` (VAR — sıfırdan kurma), `final-cta.tsx` vb.
- `src/components/room-detail-client.tsx` — oda detay galerisi
- `docs/yol-haritasi-2026-07.md` — FAZ V bağlamı
- Canlı site: `https://www.kozbeylikonagi.com`

## 0.3 Zemin gerçekleri (2026-07-01 araştırma + repo kanıtı)

1. Rezervasyonların ~%70'i mobil; 3 sn üstü yüklenme yarı trafiği kaybettirir →
   her görsel karar önce mobilde kanıtlanır.
2. Video dönüşümü %80'e kadar artırabilir; ancak yalnız GERÇEK tesis medyası,
   poster'lı, autoplay'siz.
3. Butik otelde kazanan dil editorial/dergi yerleşimi (Hoxton, Casa Cook
   örüntüsü) — ödüllü sitelerde kinetik tipografi + scroll-anlatı var, core
   booking route'unda ağır WebGL yok.
4. View Transitions API same-document **Baseline 2025** — tüm büyük tarayıcılar
   (Firefox 144+). Sayfa geçişi için JS kütüphanesi GEREKMEZ.
5. CSS scroll-driven animations 2026'da geniş destekli; `@supports
   (animation-timeline: view())` koruması ile progressive enhancement zorunlu.
6. Repo: tsc temiz; 447+ unit test yeşil taban; `--ease-lux` easing tokenı ve
   `.stagger-item` deseni mevcut; `unoptimized` yalnız 3 dosyada
   (`gallery-strip`, `rooms-showcase`, `room-detail-client`).

## 0.4 ÖN-UÇUŞ DOĞRULAMASI (her oturum başında, ZORUNLU)

```bash
git status --short && git log --oneline -5
npm run typecheck
grep -n "ease-lux\|--motion-\|--surface-" src/app/globals.css | head -20
```

Ardından bu promptta adı geçen HER dosyanın güncel halini oku. **Bu promptun
herhangi bir iddiası HEAD ile çelişiyorsa: değişikliği yapma, çelişkiyi
`docs/design/visual-baseline.md`'ye "prompt-drift" başlığıyla yaz ve o maddeyi
mevcut koda göre uyarla.** Prompt talimatı ile repo gerçeği çatışırsa repo kazanır.

---

# 1. ANA TASARIM HEDEFİ

**Tarihi taş doku + Ege ışığı + zeytin gölgesi + editoryal sessiz lüks.**

Arayüz: sakin, premium, insani, dokunsal, fotoğraf/videoya dayalı, güçlü
tipografili, geniş nefes alan, erişilebilir, mobilde hızlı, rezervasyon amacını
asla gölgelemeyen.

Hedef "daha fazla efekt" değil:

- mevcut gerçek medya arşivini daha iyi kullanmak,
- tekrar eden kart görünümünü kırmak,
- hareket dilini TEK standarda bağlamak,
- görsel hiyerarşiyi kuvvetlendirmek,
- oda ve gastronomi deneyimini daha etkileyici göstermek,
- markaya özgü tek bir imza görsel dil kurmak,
- hepsini performans + erişilebilirlik bütçeleri içinde yapmak.

---

# 2. KESİN YASAK LİSTESİ (v1'den aynen, bağlayıcı)

Aşağıdakilerin hiçbiri eklenmez/uygulanmaz:

Starbucks-tarzı marka işbirliği kurguları; techno/DJ/festival platformu;
biletleme; influencer portalı; merch/e-ticaret; Ghost Kitchen; franchise SaaS;
şirketler grubu altyapısı; "AI imparatorluğu"; agentic concierge runtime;
otomatik fiyatlandırma ajanı; Supabase'te ikinci rezervasyon sistemi;
Directus/Sanity/MongoDB/Prisma; yeni ödeme sağlayıcısı; masa rezervasyon motoru;
VIP calendar mock verisi; PWA/offline rezervasyon; custom edge analytics;
IP/geo bazlı özel izleme; mikro ses (varsayılan); haptik; site-geneli custom
cursor; global scroll hijacking; root layout'a Lenis; GSAP + Framer Motion'ı
birlikte yaygınlaştırma; sürekli çalışan WebGL ambient canvas; ana sayfada 3D
oda modeli; 300vh scroll slideshow; her sayfada full-screen curtain transition;
neon/liquid glass/aşırı blur; her bölümde bento; emoji ile sahte 3D; kaynaksız
3D model; "Awwwards garantisi", "60fps garantisi", "LCP 1.2s garantisi",
"rezervasyon %35 artar" gibi KANITSIZ iddialar.

Yeni kütüphane kuralı: bu sprintte **GSAP, Lenis, React Three Fiber, Spline,
slider/carousel kütüphanesi eklenmez.** 3D Phase 2 ayrı onay gerektirir.
Yeni font eklenmez (Cormorant dahil — globals.css'teki `--font-serif` Cormorant
referansları yalnız bayat fallback string'idir; temizlenebilir, font YÜKLENMEZ).

---

# 3. KORUNACAK GÜÇLÜ PARÇALAR (önce doğrula, sonra dokunma)

| Parça | Durum (2026-07-01) | Kural |
| --- | --- | --- |
| Palet: olive/olive-deep/gold/ivory/soft-stone/warm-stone/deep-azure/ink | globals.css'te kanıtlı | Toplu hex değişimi YOK; yalnız §5.2 yardımcı tokenları eklenebilir |
| Tipografi: Playfair Display (display) + Inter (body) | `--font-playfair`, `--font-inter` kanıtlı | Yeni font yok; ölçü/leading/measure iyileştir |
| Hero: tam ekran gerçek video + poster + pause/play | mevcut | WebGL/3D/slideshow ile DEĞİŞTİRME |
| Header overlay→solid + mobil menü | mevcut | Yalnız polish + hareket standardizasyonu |
| `prefers-reduced-motion` desteği | mevcut, testli | Her yeni harekette korunur ve genişler |
| Framer Motion | mevcut bağımlılık | Kalır; ikinci hareket motoru eklenmez |
| `animations.tsx` yardımcıları | **ÇALIŞIYOR** (v1 iddiasının aksine) | Yeniden yazma; §8'deki rafine listesi uygulanır |
| `gastronomy-editorial.tsx` | **VAR** | Sıfırdan kurma; §12 üzerine rafine eder |

---

# 4. DOĞRULANAN GELİŞTİRME ALANLARI (v2 — güncel HEAD'e göre)

1. **Ana sayfa oda sunumu tekdüze**: `rooms-showcase.tsx` eşit kart gridi —
   editorial mosaic'e geçilecek (§11).
2. **Galeri stripi eşit ağırlıklı**: `gallery-strip.tsx` değişken aspect-ratio
   ve ritim kullanmıyor; tam ekran inceleme sınırlı (§13).
3. **Oda detay galerisi parçalı**: `room-detail-client.tsx` — swipe/drag yok,
   klavye sınırlı, lightbox yok, emoji spec ikonları ve `unoptimized` görseller
   var, inline/style-jsx yoğun (§14).
4. **Buton hareket dili jenerik**: sheen + translateY her butonda aynı; primary
   rezervasyon CTA'sı özel değil (§9).
5. **Route geçiş dili yok**: loading bar var, içerik geçişi tutarsız (§15 —
   native View Transitions ile çözülür).
6. **Tasarım değerleri dağınık**: globals.css ~2000+ satır; oda detay/gastronomi/
   rezervasyon/CTA'da inline style kümeleri (§21).
7. **Animasyon yardımcıları rafine edilebilir** (no-op DEĞİL): token hizalama,
   Storybook kapsamı, `TiltCard`/`MagneticLink` gibi EKSİK primitifler (§8).

---

# 5. HEDEF GÖRSEL KİMLİK — "STONE & LIGHT EDITORIAL"

## 5.1 Tema hissi

Açık taş yüzeyler, koyu zeytin tipografi, mat pirinç vurgu, Ege sabah ışığı,
editorial kadraj, kontrollü asimetri, ince çizgiler, fiziksel materyal hissi.

## 5.2 Renk sistemi (çekirdek korunur; yardımcılar İHTİYAÇ HALİNDE)

```css
:root {
  --surface-paper: #fffdf8;
  --surface-stone: #f3eee5;
  --surface-olive-wash: #eef0ea;
  --surface-dark-olive: #263322;
  --sage-muted: #8fa499;
  --brass-soft: #c3a36c;
  --line-hairline: rgba(61, 74, 59, 0.12);
  --line-strong: rgba(61, 74, 59, 0.24);
  --shadow-ambient: 0 20px 60px rgba(40, 34, 25, 0.08);
  --shadow-elevated: 0 34px 90px rgba(40, 34, 25, 0.14);
}
```

Kurallar: `--gold` uzun gövde metninde kullanılmaz (kontrast); pirinç yalnız
mikro vurgu/çizgi/ikon/CTA detayı; beyaz yerine warm paper; her section farklı
renge boyanmaz; en fazla üç yüzey ritmi (ivory/paper → stone → olive).
**Eklenen her token için WCAG AA kontrast kontrolü kanıtı** `visual-baseline.md`'ye.

## 5.3 Radius sistemi

```css
--radius-xs: 2px; --radius-sm: 6px; --radius-md: 12px;
--radius-lg: 18px; --radius-pill: 999px;
```

editorial medya 6–12px; bilgi kartı 8–12px; modal/lightbox 16–18px;
badge/control pill; tarihi form için `arch-frame`.

## 5.4 İmza şekli — Taş Kapı / Kemer

```css
.arch-frame { border-radius: 999px 999px 16px 16px; overflow: hidden; }
```

Sınırlı kullanım: hikâye medyası, BİR gastronomi portresi, oda detayında seçili
varyant, artifact pilotu. Her fotoğrafta KULLANILMAZ.

## 5.5 Doku

Mevcut grain korunabilir: tüm sayfayı kaplayan güçlü blend yok, çok düşük
opacity, GPU-heavy filter yok, yalnız büyük yüzeylerde.

---

# 6. TİPOGRAFİ SİSTEMİ (mevcut fontlarla)

Playfair: hero, page title, editorial quote, section title, oda isimleri.
Inter: nav, body, form, metadata, buttons, captions, specs.

```css
--type-display-xl: clamp(3rem, 7vw, 6.75rem);
--type-display-lg: clamp(2.4rem, 5vw, 4.8rem);
--type-title-lg: clamp(2rem, 3.4vw, 3.6rem);
--type-title-md: clamp(1.5rem, 2.4vw, 2.35rem);
--type-body-lg: clamp(1.05rem, 1.2vw, 1.25rem);
--type-body: 1rem; --type-small: 0.875rem; --type-micro: 0.72rem;
```

Measure: uzun metin 62–70ch; hero açıklama 54–62ch; kart 2–3 satır; section
intro ≤700px. Türkçe uzun başlıklarda `text-wrap: balance`. Kinetik tipografi
İSTEĞİ (Awwwards sinyali) yalnız RevealLines/opacity-mask düzeyinde karşılanır —
harf saçılması, cursor-reaktif harf, variable font YOK.

---

# 7. HAREKET DİLİ — "AEGEAN EASE"

Mevcut `--ease-lux` easing tokenı ANA easing olarak kalır; süre tokenları eklenir:

```css
--motion-fast: 160ms; --motion-base: 320ms;
--motion-slow: 700ms; --motion-cinematic: 950ms;
--ease-lux: cubic-bezier(0.16, 1, 0.3, 1); /* zaten varsa yeniden tanımlama */
```

Mesafe sınırları: mikro hover 2–4px; content reveal 16–24px; parallax ≤24px
(mevcut clamp korunur); tilt ≤4°; magnetic ≤6px; scale hover ≤1.02; cinematic
scale ≤1.05.

Kesin yasaklar: 30px manyetik sapma; sürekli dönen öğe; scroll hijacking; 300vh
sticky hero; sayfa-geneli parallax; ikinci hareket motoru; touch'ta hover
simülasyonu; reduced-motion'da transform animasyonu; hitbox'ı yer değiştiren
buton; okumayı geciktiren reveal.

**Native-first kuralı (v2):** Bir hareket CSS ile (scroll-driven animations,
transitions, `@keyframes`) çözülebiliyorsa JS kullanılmaz. CSS scroll-timeline
kullanılan her yerde `@supports (animation-timeline: view())` + hareketsiz
fallback zorunlu.

---

# 8. ANİMASYON PRİMİTİFLERİ (rafine + eksikler)

`animations.tsx` MEVCUT yardımcıları çalışıyor. Yapılacaklar:

1. **Token hizalama**: inline süre/easing değerleri `--motion-*`/`--ease-lux`
   tokenlarına bağlanır; davranış değişmez (görsel regresyonla kanıtla).
2. **Storybook kapsamı**: FadeIn/Stagger/Parallax/RevealLines her biri için
   reduced-motion + mobile + uzun içerik story'leri.
3. **YENİ — `TiltCard`**: CSS perspective, ≤4°, yalnız pointer:fine, spring,
   reduced-motion'da statik, semantik HTML. (3D artifact pilotunun temeli.)
4. **YENİ — `MagneticLink`**: hit-area SABİT, yalnız iç görsel katman 4–6px;
   pointer:fine; touch/reduced-motion'da pasif; focus görünür; analytics ve
   link davranışı değişmez.
5. Var olan bileşenlerde API kırılması YASAK — mevcut kullanım yerleri
   (`grep -rn "StaggerContainer\|RevealLines\|Parallax" src/`) etkilenmez.

---

# 9. PRIMARY CTA — SOFT MAGNETIC

Yalnız Hero "Hemen Rezervasyon" + final booking CTA. Diğer butonlarda kullanılmaz.

Teknik: §8.4 MagneticLink kuralları. Görsel: iki varyant test edilir —
Primary olive (deep olive fill + ivory text + brass hairline + subtle inner
highlight) ve Primary brass (yalnız hero; mat pirinç + yüksek kontrast koyu
yazı). Liquid efekt: gerçek sıvı/SVG filter yok; pseudo-element ink-wash fill,
320ms, tek yön.

Kabul: hitbox sabit (DevTools ile kanıt), klavye focus halkası görünür, GA4/
PostHog event'leri değişmedi, reduced-motion'da statik.

---

# 10. HERO GELİŞTİRMESİ

Korunur: full-screen gerçek video, responsive poster, mobile video, pause/play,
gradient overlay, iki CTA, scroll cue.

Geliştirilir:

1. **Başlık reveal**: iki satır mask'ten 16–20px yükselir; 700–900ms; satırlar
   arası 80–120ms; İLK PAINT GECİKTİRİLMEZ (SSR'da görünür başla, hydration
   sonrası animasyon sınıfı); reduced-motion'da direkt görünür.
2. **Ambient media scale**: 12–18sn'de 1→1.025; ping-pong yok; video zaten
   hareketliyse UYGULANMAZ; reduced-motion'da kapalı.
3. **Overlay rafinesi**: başlık altında yeterli kontrast (AA kanıtı), alt CTA
   bandında daha güçlü, görüntüyü çamurlaştırmayan.
4. **Tek imza detay**: ince kemer çizgisi VEYA konum/yıl etiketi VEYA scroll
   progress çizgisi — yalnız BİRİ. Badge kalabalığı yok.

Yasak: 3D/shader hero, multi-slide, scroll lock, custom cursor, autoplay ses,
hero'da widget.

LCP koruması: hero poster `priority` kalır; yeni animasyon LCP elementini
geciktirmiyor kanıtı (Lighthouse before/after).

---

# 11. ANA SAYFA ODA SUNUMU — EDITORIAL ROOM MOSAIC

Eşit 6'lı grid yerine kontrollü asimetri:

```text
[ FEATURED ROOM — 2 kolon ]
[ ROOM B ][ ROOM C ]
[ ROOM D ][ ROOM E ][ ALL ROOMS CTA ]
```

Mobile: tek kolon; featured 4:5 veya 3:4, diğerleri 4:3; native scroll.

Featured seçimi: CMS `featured` alanı veya açık config — source-order tesadüfü
değil. Kart: görsel alan büyük; okunabilir alt bilgi (title + kapasite +
manzara); hover'da image scale 1.02 + arrow 4px; container zıplamaz;
focus-visible outline; tüm kart tıklanabilir; reduced-motion statik.

Video card: EN FAZLA BİR featured kartta, gerçek oda videosu, muted, preload
none/metadata, yalnız desktop hover/focus'ta oynar, mobile poster, görünür play
kontrolü, reduced-motion'da poster.

Kabul: oda linkleri değişmez; sahte oda/özellik üretilmez; `sizes` doğru;
klavye ile tüm kartlar gezilebilir.

---

# 12. GASTRONOMİ — EDITORIAL SPLIT (mevcudun rafinesi)

`gastronomy-editorial.tsx` VAR — önce güncel halini oku; farkları uygula:

Desktop: `[ büyük dikey/landscape medya ] [ başlık + hikâye + 3 menü öğesi + CTA ]`;
ikinci satır `[ kahvaltı ][ mıhlama ][ şef ]` videoları — autoplay YOK, poster
ile başlar, aynı anda tek video, görünür kontrol, caption, reduced-motion.

Bir medya `arch-frame` kullanabilir (sitede toplam kullanım §5.4 sınırında).
Menü önizleme: dört eşit kart yerine iki kolonlu editorial liste, hairline
ayraçlar, price baseline hizası, "tam menü" CTA.

---

# 13. GALERİ — NATIVE CINEMATIC FILMSTRIP

Kütüphanesiz: CSS `scroll-snap` + native yatay scroll; pointer drag opsiyonel
ama native scroll bozulmaz; değişken genişlik/aspect-ratio; görsel ritim
(exterior → room → gastronomy → garden → event); caption hover/focus; görünür
scroll ipucu; klavye scroll butonları; reduced-motion statik.

Desktop genişlikler: hero 44vw, portrait 25vw, landscape 34vw, detay 22vw.
Mobile: 78–86vw item, 12–16px gap, snap center, sonraki öğenin kenarı görünür.

Lightbox (tam galeri sayfası): erişilebilir dialog — close, prev/next, Escape,
focus trap + restore, sayaç, alt/caption, swipe, arka plan scroll kilidi.
shadcn Dialog primitive'i KULLANILABİLİR (§22), görünümü Kozbeyli tokenlarıyla.

---

# 14. ODA DETAY — PREMIUM MEDIA VIEWER

Desktop: büyük ana görsel + filmstrip; prev/next; sayaç; fullscreen; caption;
pointer drag; klavye okları; thumbnail focus state.
Mobile: swipe (scroll-snap veya controlled drag); progress dots/sayaç; görsel
yüksekliği viewport'a göre; CTA görseli kapatmaz.

Motion: crossfade 320–450ms; scale 1.015→1; directional slide ≤12px;
reduced-motion yalnız opacity/instant.

Bilgi alanı: emoji spec ikonları KALDIRILIR → Lucide (mevcut bağımlılık) veya
metin; kutulu kart yerine hairline-ayraçlı facts row; description measure
sınırlı; booking kartı token sistemine alınır; inline/style-jsx blokları CSS
katmanına taşınır.

Görsel optimizasyon: `unoptimized` kullanımını dosya dosya gerekçelendir
(3 dosyada mevcut) — optimizer ile çalışabiliyorsa kaldır; doğru `sizes`; ilk
görsel priority, diğerleri lazy; width/height sabit → CLS 0.

---

# 15. SAYFA GEÇİŞLERİ — NATIVE VIEW TRANSITIONS (v2 değişikliği)

v1'in "opacity/translate wrapper" yaklaşımı yerine **native View Transitions
API** kullanılır (Baseline 2025, tüm büyük tarayıcılar):

1. Same-document geçişler için CSS `::view-transition-old/new(root)` ile
   180–240ms, opacity + ≤12px translate; `@media (prefers-reduced-motion)`
   içinde `::view-transition-*` animasyonları kapatılır (instant).
2. Next.js App Router entegrasyonu: önce `next.config.ts`'te deneysel
   `viewTransition` bayrağının mevcut Next sürümündeki durumunu DOĞRULA
   (`npx next --version` + resmi doküman). Deneysel bayrak riskliyse CSS-only
   cross-document view transitions (`@view-transition { navigation: auto; }`)
   ile başla — o da `@supports` korumalı.
3. Desteklemeyen tarayıcıda geçiş YOK (anında navigasyon) — bu kabul edilebilir
   fallback'tir; JS polyfill EKLENMEZ.
4. Loading bar kalır; scroll restoration ve browser navigasyonu bozulmaz;
   admin route'larında etkisiz.

Yasaklar: 1sn perde, logo splash, exit-animation route geciktirme, scroll lock.

---

# 16. STORY RAIL — TEK İMZA BÖLÜM

Yer (öncelik sırası): 1) `/hikayemiz` 2) ana sayfada gastronomi-galeri arası
3) `/gastronomi`. Hero'da ASLA.

Maks 2–3 sahne (taş mimari → oda/avlu → gastronomi/günbatımı); scroll alanı
160–190vh; sticky sahne; sahne başına 400–600ms opacity/scale; scroll
KİLİTLENMEZ; mobile + reduced-motion'da normal stacked içerik.

**v2 tekniği:** önce CSS scroll-driven animations (`animation-timeline: view()`)
+ `@supports` fallback dene; yetmezse mevcut Framer Motion `useScroll`. İkisi
birden değil.

Medya: yalnız mevcut gerçek medya (avlu/oda/kahvaltı/günbatımı/dış cephe);
AI-üretimi tesis medyası YASAK; görünüme yaklaşınca yükle; en fazla bir video.

---

# 17. 3D / SPATIAL PILOT

**Aşama 1 (bu sprint):** CSS `TiltCard` (§8.3) + gerçek artifact fotoğrafı
(dibek, tarihi anahtar, taş detay, bakır servis). Yalnız `/hikayemiz`, tek
section, pointer:fine'da tilt, mobile statik.

**Aşama 2 (AYRI ONAY):** gerçek 3D yalnız şu şartlarla: tesise ait obje +
photogrammetry/profesyonel model + kullanım hakkı + optimize GLB (Draco/
Meshopt, 500KB–1.5MB) + 1K–2K texture + dpr 1–1.5 + frameloop demand +
intersection sonrası dynamic import + fallback görsel + error boundary +
owner onayı. Yalnız `/hikayemiz`; ana sayfa ve booking path'inde WebGL YOK.

Yasak: sahte amphora, emoji placeholder, marketplace modeli, Spline iframe,
full 3D oda, otomatik 360 tur, WebGPU bağımlılığı, hero canvas.

---

# 18. CURSOR / SES / HAPTİK

Custom cursor: EKLENMEZ (erişilebilirlik, tutarlılık, latency, touch
anlamsızlığı). Alternatif: görsel üzerinde küçük "İncele / Menüyü Gör" badge.
Mikro ses: varsayılan EKLENMEZ; ancak kullanıcı aktifleştirirse + mute kontrolü
+ lisanslı ses + marka onayı ile ayrı deney olabilir (launch parçası değil).
Haptik: EKLENMEZ.

---

# 19. BENTO KURALI

"Bento" değil "editorial mosaic": oda mozaiği, deneyim özeti, story/medya
kolajında kullanılabilir. Her sayfada/her içerikte kart, SaaS dashboard
görünümü, aşırı radius, cam yüzey, tile başına farklı animasyon YASAK.

---

# 20. MEDIA CONTENT AUDIT

`docs/design/media-usage-inventory.md` oluştur; her medya için:

```ts
type MediaUsageRecord = {
  path: string;
  type: "image" | "video";
  subject: "exterior" | "room" | "food" | "garden" | "event" | "location" | "artifact";
  orientation: "landscape" | "portrait" | "square" | "vertical-video";
  width?: number; height?: number; fileSize: number;
  quality: "hero" | "editorial" | "card" | "detail-only" | "reject";
  provenance: "verified" | "unknown";
  currentRoutes: string[]; proposedRoutes: string[]; duplicateOf?: string;
};
```

Denetim soruları: en güçlü dış cephe/oda hero'su hangisi; her odada yeterli
medya var mı; tekrar eden kare; poster-video eşleşmesi; provenance + kullanım
hakkı; alt/caption doğruluğu. Her güçlü medyaya TEK rol ata (hero, featured
room, room detail, gastronomy hero, story rail, gallery, CTA background,
social/OG) — aynı görsel her yerde kullanılmaz.

---

# 21. TOKEN VE CSS ORGANİZASYONU

`globals.css` (~2000+ satır) kontrollü bölünür:

```text
src/styles/
  tokens.css  base.css  layout.css  motion.css
  components/ (buttons, header, cards, gallery, room-detail, media)
  pages/ (home, gastronomy, story)
```

Tek seferde full rewrite YASAK. Sıra: 1) tokens 2) motion 3) buttons 4) home
görsel bileşenleri 5) room detail. Her taşıma adımı sonrası görsel regresyon.
Inline style yalnız gerçek dinamik değer için; `style jsx` blokları reusable
katmana. Bayat `--font-serif` (Cormorant fallback) referansları temizlenir —
yeni font YÜKLENMEDEN.

---

# 22. SHADCN VE ÜRETİCİ ARAÇLAR

shadcn yalnız primitive olarak: Dialog/lightbox, Sheet/mobile panel, Tooltip,
Popover, Accordion + focus/keyboard davranışı. Görünüm olduğu gibi bırakılmaz —
Kozbeyli tokenlarıyla özelleştirilir.

Üretici araçlar (Magic vb.) ana tasarım sistemini ÜRETMEZ; yalnız aday fikir
(mosaic, story rail, lightbox) için. Üretilen kod dependency/a11y/responsive/
performance/semantics/token/gerçek-medya kontrolünden geçmeden girmez.

---

# 23. UYGULAMA DALGALARI

## WAVE 0 — VISUAL BASELINE
Screenshotlar: 360×800, 390×844, 768×1024, 1024×768, 1440×900 ×
{`/`, `/odalar`, bir oda detayı, `/gastronomi`, `/galeri`, `/hikayemiz`,
`/rezervasyon`, EN home/rooms}. Denetim: hiyerarşi, spacing, tekrar eden kart,
CTA belirginliği, mobile çakışma, tipografi, medya kadrajı, animasyon, CLS,
focus state. Çıktı: `docs/design/visual-baseline.md` (prompt-drift bölümü dahil).
Commit: `docs: capture visual baseline and design direction`

## WAVE 1 — TOKENS + MOTION PRIMITIVES
`globals.css` token ekleri, `styles/` iskeleti, `animations.tsx` rafinesi +
TiltCard + MagneticLink, Storybook, testler. Kabul: yeni bağımlılık yok, layout
shift yok, mevcut kullanım kırılmadı, unit/component test + snapshot.
Commit: `refactor: establish stone and light visual motion primitives`

## WAVE 2 — HERO + CTA POLISH
Line reveal, ambient scale, overlay rafinesi, tek imza detay, soft magnetic
booking CTA, video kontrol polish, mobile crop denetimi. Kabul: LCP gerilemedi
(Lighthouse kanıtı), pause/play erişilebilir, reduced-motion, metin gecikmesi
yok, 360/768/1440 snapshot.
Commit: `feat: refine cinematic hero and primary booking interaction`

## WAVE 3 — EDITORIAL ROOM MOSAIC
Eşit grid → mosaic; featured seçim mekanizması; değişken aspect-ratio; medya
hiyerarşisi; focus/hover; mobile stacked. Kabul: oda linkleri değişmedi, sahte
içerik yok, doğrulanmamış autoplay yok, klavye + `sizes` + görsel testler.
Commit: `feat: present rooms through an editorial media mosaic`

## WAVE 4 — GASTRONOMY + GALLERY
Gastronomi split rafinesi (mevcut bileşen üzerine), sadeleşmiş menü önizleme,
arch-frame tek kullanım; galeri native filmstrip + lightbox. Kabul: carousel
bağımlılığı yok, autoplay yok, touch/klavye, reduced-motion.
Commit: `feat: elevate gastronomy and gallery media storytelling`

## WAVE 5 — ROOM DETAIL MEDIA VIEWER
Swipe/klavye/fullscreen/lightbox; emoji spec'ler kalkar; facts row; CSS
extraction; `unoptimized` audit. Kabul: tüm oda görselleri çalışır, focus/
Escape/arka plan kilidi, CLS 0, booking CTA bozulmadı.
Commit: `feat: upgrade room detail into a premium media viewer`

## WAVE 6 — STORY RAIL + SPATIAL PILOT (Phase 1)
CSS scroll-driven (fallback'li) story rail + TiltCard artifact.
Commit: `feat: add a restrained spatial artifact story`

## WAVE 7 — NATIVE PAGE TRANSITIONS
§15 uygulanır. Commit: `feat: unify lightweight public page transitions`

## WAVE 8 — VISUAL REGRESSION + PERFORMANCE LOCK
Playwright screenshot suite (§24 determinizm kuralları) + bütçe doğrulaması.
Commit: `test: lock visual quality and motion performance`

---

# 24. QA PROTOKOLÜ (her wave sonrası)

1. `npm run typecheck && npm run test:unit && npm run brand:verify`
2. Chrome DevTools: temiz sayfa, console/network sıfırla, screenshot,
   hover/focus, mobile emülasyon, reduced-motion, CPU/network throttle, layout
   shift overlay, image/video istek sayısı, CTA post-condition (URL/DOM/state
   ile doğrula — tool "click success" dese bile).
3. Özel kontroller: magnetic CTA hitbox; galeri scroll; oda swipe; lightbox
   focus; view-transition çift-render; hero video; mobile action bar + cookie
   banner çakışması.
4. Playwright determinizm: reduced-motion zorla, video poster'da dondur,
   animasyonları devre dışı bırak/dondur, dinamik veri maskeleme, font ready
   bekle, saat/hava bağımsızlığı.

---

# 25. STORYBOOK MATRİSİ

Hero, MagneticLink, RevealLines, TiltCard, EditorialRoomCard, RoomMosaic,
GastronomySplit, GalleryFilmstrip, RoomMediaViewer, Lightbox, ArchFrame,
PageTransition. Her story: TR/EN, kısa/uzun copy, mobile/desktop,
reduced-motion, keyboard focus, eksik medya, loading. Varsayılan demo
story'leri kaldır.

---

# 26. KABUL BÜTÇELERİ

Core route: yeni WebGL yok; yeni smooth-scroll/carousel/font yok; yeni autoplay
video yok; **hero LCP gerilemez; CLS ≤ baseline; INP < 200ms**; klavye erişimi
korunur; reduced-motion geçer.
Motion: magnetic ≤6px; tilt ≤4°; parallax ≤24px; scale ≤1.05; route transition
≤240ms; video dışında sürekli animasyon yok.
3D pilot: yalnız story route, below-fold, dynamic import, fallback, mobile
statik, gerçek asset, performans onayı.

---

# 27. DEFINITION OF DONE

Gerçek medya güçlü + tekrarsız kullanılıyor; hero korunmuş + rafine; oda sunumu
eşit gridden çıkmış; gastronomi editorial hiyerarşide; galeri native + dokunsal
+ erişilebilir; oda detay swipe/lightbox/klavyeli; animasyon primitifleri token
hizalı + TiltCard/MagneticLink eklenmiş; buton hareketi markaya özgü + sınırlı;
geçişler native VT ile hafif; custom cursor yok; root Lenis yok; global WebGL
yok; 3D yalnız gerçek asset pilotu; reduced-motion tüm yeni harekette; visual
regression kurulu; Storybook gerçek tasarım sistemi; mobile CTA/cookie/header
çakışmıyor; LCP/CLS/INP gerilememiş; sahte iddia/içerik üretilmemiş; rezervasyon
yolu bozulmamış.

---

# 28. İLK OTURUM SINIRI VE DURMA KOŞULLARI

İlk oturumda YALNIZ Wave 0–3. Yapılmayacak: room detail büyük refactor, 3D
kütüphanesi, gallery lightbox, page transitions, Payload şeması, booking
refactor, Google reviews, backend, CMS migration.

**DURMA KOŞULLARI (herhangi biri gerçekleşirse dur, raporla):**
- typecheck/test/brand-verify kırmızı ve 2 denemede düzelmiyor;
- prompt-drift bulundu ve kapsamı belirsiz;
- LCP/CLS/INP bütçesi aşılıyor ve neden net değil;
- bir değişiklik rezervasyon yoluna dokunuyor.

Oturum sonu raporu: before/after screenshotlar, değişen dosyalar, Storybook
linki, görsel test sonucu, Lighthouse karşılaştırması, kalan wave'ler, rollback
talimatı (`git revert` sınırları).

---

# 29. BAŞLANGIÇ TALİMATI

1. §0.4 ön-uçuş doğrulamasını çalıştır ve çıktıyı rapora koy.
2. `AGENTS.md` + bu promptta adı geçen tüm dosyaları oku.
3. `docs/design/visual-baseline.md` oluştur (prompt-drift bölümü dahil).
4. Media inventory'yi başlat (§20).
5. Wave 1 → Wave 2 → Wave 3 sırayla; her wave sonunda §24 QA.
6. Yeni bağımlılık ekleme; gerçek olmayan görsel/3D üretme.
7. Reduced-motion + klavye test et; 360/768/1440 before/after al.
8. Lint, typecheck, hedefli testler, görsel testler, build çalıştır.
9. İlk oturum kapsamı bitince DUR ve raporla.

---

# EK A — 2026-07-02 DRIFT DÜZELTMELERİ (bağlayıcı)

Bu ek, v2'nin kendi bayat kalan iddialarını HEAD `8a45c11` gerçeğine bağlar.
§0.4 kuralı gereği ek, gövdeyle çelişirse EK KAZANIR.

1. **§8.3-8.4 geçersiz:** `TiltCard` ve `MagneticLink` ZATEN `animations.tsx`'te
   (sınırlar uyumlu: magnetic ≤6px, tilt ≤3°) ve MagneticLink hero booking
   CTA'da kullanımda. "Yeni ekle" değil "koru + Storybook/token cilası" oku.
2. **§11 büyük ölçüde tamam:** `.room-mosaic` (featured + wide varyantlı) ve
   mobil stacked düzen 2026-06-24 dalgasından beri canlıda. Kalan boşluk olan
   featured seçimi `8a45c11` ile veriye bağlandı (`Room.featured` +
   `getShowcaseRooms`). Wave 3'ü YENİDEN uygulama.
3. **§10 tamam:** hero kademeli reveal (`heroEditorialIn`), imza bandı
   (`hero-signature`), scroll-cue, pause/play mevcut — yalnız ileri polish
   (ambient scale, overlay ölçümü) opsiyonel kaldı.
4. **§13 kısmen tamam:** filmstrip ritmi + `gallery-lightbox.tsx` mevcut;
   Wave 4 = a11y/klavye cilası.
5. **§14 düzeltme:** `unoptimized` KALDIRILMAZ — <10KB thumbnail'lar ve Vercel
   1000 optimize görsel/ay kotası (gereksiz maliyet yasağı, §2). Kilit testi:
   `tests/design-stone-light.test.ts`.
6. **Ortam notu:** Cowork sandbox'ında vitest koşmaz (rollup Linux binary'si
   yok); testler Windows'ta `npx vitest run` ile koşulur. Git yazımları da
   OneDrive kilidi nedeniyle Windows tarafından yapılır.
7. Güncel durum kaydı ve kalan dalgalar: `docs/design/visual-baseline.md`
   (2026-07-02 revizyonu) + `docs/design/stone-light-editorial.md`.
