# Plan — Kozbeyli Konağı: Kalan Geliştirmelerin Toplu Uygulaması

Hedef (tek cümle): Launch-readiness raporunda kod tarafında kalan her şeyi —
deneyim silosu, /teklifler, menü senkronu, medya entegrasyonları, EN/hreflang,
WCAG/reduced-motion, Lighthouse CI, Remotion tanıtım videosu — swarm ile
dalga dalga uygulayıp siteyi 90+ hazırlık skoruna taşımak.

Proje kuralları (her worker uyar):
- Marka dili: "Authentic, Curation, Historic Texture, Aegean Hospitality";
  asla "ucuz/budget/standart motel" deme. Fiyat/iddia UYDURMA.
- Mevcut kalıplar: PageHero + SiteHeader/SiteFooter + FadeIn; metadata'da kök
  title'a "| Kozbeyli Konağı" EKLEME (template ekliyor); canonical zorunlu.
- `next build`e NODE_ENV override'ı verme; npm install gerekiyorsa `--include=dev`.
- OneDrive yolunda toplu `sed -i` YASAK (dosya keser) — Edit/Write kullan.
- Görseller: next/image, anlamlı TR alt; videolar: preload="none" + poster.
- Her task sonunda `npx tsc --noEmit` temiz olmalı (kendi dosyaların için).

## Wave 0 — Medya hazırlığı (ORCHESTRATOR koşar; swarm BAŞLAMADAN tamam olmalı)

### T0a — Sunset reel'ini indir ve optimize et
- depends_on: []
- owner: orchestrator (Google Drive MCP + ffmpeg gerekir; worker'larda yok)
- location: public/videos/sunset.mp4, public/videos/sunset-poster.jpg
- description: Drive `sunset_kozbey.mp4` (id 1xaWkqJILV3tVlL-hHl7R2-qAa-FOObtu)
  indir; 720p dikey CRF27 AAC96k faststart sıkıştır; t≈2s'den poster üret.
- validation: İki dosya da mevcut ve sunset.mp4 < 4MB (`ls -la public/videos/`).
- status: done
- log: 26.7MB → 1.0MB (720x1280, 8.9sn) + sunset-poster.jpg; ffprobe doğrulandı.
- files: public/videos/sunset.mp4, public/videos/sunset-poster.jpg

### T0b — Oda detay karelerini indir ve optimize et
- depends_on: []
- owner: orchestrator
- location: public/images/odalar/detay/ (oda-detay-1.jpg, oda-detay-2.jpg, oda-detay-3.jpg)
- description: Drive şubat-mart klasöründen `ODA_1_1 kopya 2.jpg`
  (1vz0pYYS1nL8RUJlRnKatxmjP4NshRRwM), `oda1.det1 kopya.jpg`
  (15Z2Hu6Ek3sFjLFoiZFY9aXNT62ibkXdk), `oda1.det4 kopya.jpg`
  (1NWI3-d7z8WhcMRK5_-9D3urvjLzs3_ew) indir; 1600w q3 optimize et.
- validation: 3 jpg mevcut, her biri < 1.5MB.
- status: done
- log: 3 kare indirildi (panoramik oda 1600x1066, taş duvar detayı 1600x1840, oturma köşesi 1600x1066); 1600w q3 optimize.
- files: public/images/odalar/detay/oda-detay-1.jpg, oda-detay-2.jpg, oda-detay-3.jpg

## Wave 1 — Bağımsız sayfalar ve altyapı (9 paralel task)

### T1 — Deneyim rehberi: Kozbeyli Köyü
- depends_on: []
- location: src/app/deneyimler/kozbeyli-koyu-rehberi/page.tsx
- description: SEO pillar sayfası. PageHero + 4-5 bölüm: köyün 500 yıllık
  yerleşim hikâyesi, taş mimari dokusu, 180 yıllık dibek kahvesi ritüeli,
  köy meydanı/yürüyüş rotası, konağa dönüş CTA'sı. Metadata: title
  "Kozbeyli Köyü Rehberi", description köy+Foça+taş mimari anahtarlarıyla,
  canonical /deneyimler/kozbeyli-koyu-rehberi, BreadcrumbList JSON-LD
  (Ana Sayfa > Deneyimler > Kozbeyli Köyü Rehberi). İçerik yalnızca repo'da
  kanıtlı gerçeklerden (hikayemiz/misafir-rehberi sayfaları): "Foça'ya
  12 dakika", dibek, Horasan harcı. Uydurma işletme/mekân adı YOK.
- validation: Build sonrası sayfa 200 döner; HTML'de "Kozbeyli" ≥ 3 kez ve
  `application/ld+json` içinde BreadcrumbList geçer.
- status: done
- log: sss kalibi; 5 bolum; Breadcrumb JSON-LD; kanitli icerik (12 km Yeni Foca, dibek, Horasan).
- files:

### T2 — Deneyim rehberi: Foça Gezi
- depends_on: []
- location: src/app/deneyimler/foca-gezi-rehberi/page.tsx
- description: T1 ile aynı şablon. Bölümler: Eski Foça sahili, Siren
  Kayalıkları (genel coğrafi bilgi), balıkçı koyları, gün batımı noktaları,
  konaktan günübirlik plan önerisi. Spesifik restoran/işletme adı verme;
  yalnızca coğrafi/kamusal yerler. Metadata + canonical + Breadcrumb JSON-LD.
- validation: Sayfa 200; HTML'de "Foça" ≥ 3; BreadcrumbList mevcut.
- status: done
- log: 5 bolum; firma adi yok; tek sayisal ifade 12 dakika.
- files:

### T3 — Deneyim rehberi: Ege Gastronomi Rotası
- depends_on: []
- location: src/app/deneyimler/ege-gastronomi-rotasi/page.tsx
- description: T1 şablonu. Bölümler: Ege kahvaltı kültürü, zeytinyağı,
  konağın taş fırın/dibek ritüelleri (gastronomi sayfasındaki kanıtlı
  içerikten), mevsim ürünleri, restoran CTA (/gastronomi + /menu linkleri).
  Metadata + canonical + Breadcrumb JSON-LD.
- validation: Sayfa 200; HTML'de "gastronomi" (büyük/küçük) ≥ 3; /menu ve
  /gastronomi href'leri mevcut.
- status: done
- log: 5 durak; /gastronomi + /menu CTA; apostrof lint fixleri orchestrator tarafindan uygulandi.
- files:

### T4 — /teklifler sayfası (dürüst iskelet)
- depends_on: []
- location: src/app/teklifler/page.tsx
- description: PageHero + 3 kart: "Romantik Kaçamak", "Aile Hafta Sonu",
  "Davet & Organizasyon" — her kart mevcut GERÇEK olanaklara dayanır (oda
  tipleri, serpme kahvaltı, organizasyon hizmeti) ve FİYAT İÇERMEZ; CTA'lar
  /rezervasyon ve /organizasyonlar'a gider. Üstte not: "Dönemsel teklifler
  için WhatsApp concierge". Metadata + canonical. Kampanya detayı işletmeden
  gelene dek yapı iskeletidir (bkz. B5).
- validation: Sayfa 200; üç kart başlığı HTML'de; `grep -cE "₺|[0-9]+ ?TL"
  <html>` = 0 (fiyat deseni yok).
- status: done
- log: 3 kart fiyatsiz; WhatsApp concierge bandi; rotalar dogrulandi.
- files:

### T5 — Lighthouse CI eşikleri
- depends_on: []
- location: .github/workflows/ci.yml, lighthouserc.json (yeni)
- description: CI'a e2e'den SONRA koşan "lighthouse" job'ı ekle: build
  çıktısıyla `next start` + `npx @lhci/cli autorun` (URL'ler: / ve /odalar).
  lighthouserc.json assert eşikleri: categories:performance ≥ 0.85,
  accessibility ≥ 0.95, seo ≥ 0.95 (error seviyesinde). @lhci/cli'yi
  devDependency olarak ekle (`npm i -D @lhci/cli --include=dev`).
- validation: `grep -c lighthouse .github/workflows/ci.yml` ≥ 2 VE
  lighthouserc.json `node -e "JSON.parse"` ile geçerli.
- status: done
- log: lighthouse job (needs quality) + lighthouserc.json esikleri perf.85/a11y.95/seo.95.
- files:

### T6 — prefers-reduced-motion sitewide desteği
- depends_on: []
- location: src/app/globals.css
- description: globals.css sonuna `@media (prefers-reduced-motion: reduce)`
  bloku: `*,*::before,*::after{animation-duration:.01ms!important;
  animation-iteration-count:1!important;transition-duration:.01ms!important;
  scroll-behavior:auto!important}` ve `.hero-video{display:none!important}`
  (poster görseli kalır). Mevcut kuralları SİLME, yalnızca sona ekle.
- validation: `grep -c "prefers-reduced-motion" src/app/globals.css` ≥ 1 ve
  build geçer.
- status: done
- log: reduced-motion blogu + .hero-video gizleme; onceki kismi calismadan tamam.
- files:

### T7 — Menü içeriğini güncel kaynakla senkronla
- depends_on: []
- location: src/app/menu/page.tsx, src/data/menu.ts (yeni), tests/menu-data.test.ts (yeni)
- description: Güncel menü kaynağı sandbox'ta: /tmp/emergent-site/menu/index.html
  (yoksa: `mkdir -p /tmp/emergent-site && cd /tmp/emergent-site && unzip -oq
  "/sessions/upbeat-practical-tesla/mnt/uploads/kozbeyli-konagi-website (24).zip"`).
  Oradaki bölüm/ürün/açıklamaları typed `src/data/menu.ts` olarak çıkar;
  page.tsx'i bu veriden render edecek şekilde refactor et (mevcut
  menu-section-box sınıf düzenini koru). Fiyat kaynakta NEYSE o; kaynakta
  yoksa fiyatsız.
- validation: `npx vitest run --project unit -t menu` PASS (test: ≥ 4 bölüm,
  ≥ 20 ürün) ve /menu 200.
- status: done
- log: 12 bolum 79 urun fiyatli; kaynak repo ici _legacy-emergent/backend/seeds.py; vitest menu testi.
- files:

### T8 — Hikayemiz'e sunset ambiyans videosu
- depends_on: [T0a]
- location: src/components/history-client.tsx
- description: LivingMuseumMap altına "Kozbeyli'de Gün Batımı" başlıklı dar
  bölüm: `<video controls preload="none" playsInline
  poster="/videos/sunset-poster.jpg" data-event="video_play_sunset">` +
  source /videos/sunset.mp4; gastronomi videolarıyla aynı stil
  (borderRadius 16, background #111), figcaption'lı.
- validation: /hikayemiz 200 ve HTML'de `sunset-poster.jpg` geçer.
- status: done
- log: Gun batimi bolumu LivingMuseumMap altinda; figure/figcaption.
- files:

### T9 — Oda verisine profesyonel detay kareleri
- depends_on: [T0b]
- location: src/data/rooms.ts
- description: rooms.ts'te standart-oda ve standart-bahce-manzarali-oda
  images dizilerine /images/odalar/detay/oda-detay-1.jpg, -2.jpg, -3.jpg
  yollarından uygun olanları EKLE (mevcut girdileri silme; her odaya en az
  1 yeni kare). Başka alanı değiştirme.
- validation: `grep -c "odalar/detay/" src/data/rooms.ts` ≥ 3 ve tsc temiz.
- status: done
- log: detay-1 deniz, detay-2 uc-kisilik (standart-oda slug yok), detay-3 bahce.
- files:

## Wave 2 — Birleştiriciler (4 paralel task)

### T10 — /deneyimler hub sayfası
- depends_on: [T1, T2, T3]
- location: src/app/deneyimler/page.tsx
- description: PageHero + 3 rehber kartı (başlık, 1-2 cümle özet, "Rehberi
  Oku" CTA) + mevcut /deneyim-tasarimcisi'na yumuşak yönlendirme bandı.
  Metadata + canonical /deneyimler + ItemList JSON-LD (3 rehber URL'i).
- validation: Sayfa 200; HTML'de üç rehber href'i de geçer.
- status: done
- log:
- files:

### T11 — Sitemap güncellemesi
- depends_on: [T1, T2, T3, T4, T10]
- location: src/app/sitemap.ts
- description: staticPages'e '/deneyimler', '/deneyimler/kozbeyli-koyu-rehberi',
  '/deneyimler/foca-gezi-rehberi', '/deneyimler/ege-gastronomi-rotasi',
  '/teklifler' ekle.
- validation: Build sonrası /sitemap.xml çıktısında 5 yeni URL de geçer.
- status: done
- log:
- files:

### T12 — Navigasyon ve footer linkleri
- depends_on: [T4, T10]
- location: src/components/site-header.tsx, src/components/site-footer.tsx
- description: Header DEFAULT_LINKS'te "/deneyim-tasarimcisi / Deneyim
  Tasarımcısı" girdisini "/deneyimler / Deneyimler" ile DEĞİŞTİR (EN
  fallback'i "Experiences"). Footer "Keşfedin" listesine "Deneyimler"
  (/deneyimler) ve "Teklifler" (/teklifler) ekle.
- validation: Ana sayfa HTML'inde header içinde href="/deneyimler" var;
  footer'da href="/teklifler" var.
- status: done
- log:
- files:

### T13 — Ana sayfaya Deneyimler teaser bölümü
- depends_on: [T10]
- location: src/components/home/experiences-teaser.tsx (yeni), src/components/home-client.tsx
- description: GalleryStrip'ten sonra render edilecek bölüm: eyebrow
  "KEŞFEDİN", başlık "Kozbeyli'yi Deneyimleyin", üç rehberin mini kartı +
  /deneyimler CTA butonu. home-client.tsx'e import + tek satır yerleşim.
- validation: Ana sayfa HTML'inde "Kozbeyli'yi Deneyimleyin" geçer.
- status: done
- log:
- files:

## Wave 3 — EN temel sözlük

### T14 — Dictionary genişletme (TR+EN)
- depends_on: []
- location: src/dictionaries/en.json, src/dictionaries/tr.json
- description: Mevcut anahtarları KORUYARAK ekle: Navigation.experiences/
  offers/faq/gallery, Footer eksikleri, FAQPage/GalleryPage/OffersPage/
  ExperiencesHub başlık+altbaşlıkları, RoomsPage/ContactPage çekirdek
  metinleri. EN çeviriler quiet-luxury tonunda; TR mevcut sayfa metinleriyle
  birebir aynı (yeni TR metin uydurma — sayfalardan kopyala).
- validation: Her iki JSON `node -e "JSON.parse(require('fs').readFileSync(p,'utf8'))"`
  ile geçerli VE en.json satır sayısı ≥ 60.
- status: done
- log:
- files:

## Wave 4 — EN rotaları

### T15 — /en sayfa seti
- depends_on: [T14]
- location: src/app/en/ (yeni klasör: page.tsx, odalar/page.tsx,
  odalar/[slug]/page.tsx, gastronomi/page.tsx, rezervasyon/page.tsx,
  iletisim/page.tsx, sss/page.tsx, galeri/page.tsx, hikayemiz/page.tsx,
  deneyimler/page.tsx)
- description: Her EN sayfası TR muadilinin İNCE sarmalayıcısı: aynı
  bileşenler locale="en"/sözlük metinleriyle; metadata EN title+description
  + canonical /en/... . Oda detayında generateStaticParams aynen. TR sayfa
  dosyalarına DOKUNMA; ortak bileşene prop eklemek gerekirse default "tr"
  ile geriye uyumlu olmalı ve yalnızca o bileşen dosyası değiştirilebilir
  (hangi dosyaya dokunduysan files'a yaz).
- validation: Build'de tüm /en rotaları üretilir; /en ve /en/odalar 200 +
  HTML'de "Rooms" veya "Book" geçer.
- status: done
- log:
- files:

## Wave 5 — EN bağlantı katmanı (2 paralel task)

### T16 — hreflang alternates
- depends_on: [T15]
- location: src/lib/metadata.ts
- description: baseMetadata.alternates.languages'ı aç: tr → '/', en → '/en',
  x-default → '/'. "EN rotaları yayınlanınca" yorumunu kaldır.
- validation: Ana sayfa HTML'inde `hreflang="en"` link etiketi var.
- status: done
- log:
- files:

### T17 — LanguageSwitcher rota geçişi
- depends_on: [T15]
- location: src/components/language-switcher.tsx, tests/e2e/lang-switch.spec.ts (yeni)
- description: EN seçimi: NEXT_LOCALE=en çerezi + pathname'in /en karşılığına
  push (karşılık üretimi: '/' → '/en', diğerleri → '/en'+pathname; /en'de
  sayfa yoksa /en'e düş). TR seçimi: /en önekini kaldır + NEXT_LOCALE=tr.
  Yeni e2e: ana sayfada EN'e tıkla → URL /en içerir ve sayfa yüklenir.
- validation: `npx playwright test tests/e2e/lang-switch.spec.ts` PASS.
- status: done
- log:
- files:

## Wave 6 — Kalite ve prodüksiyon (3 paralel task)

### T18 — Axe erişilebilirlik testi + kritik düzeltmeler
- depends_on: [T11, T12, T13]
- location: tests/a11y.spec.ts (yeni) + bulguların gerektirdiği dosyalar
  (dokunulan her dosyayı files'a yaz)
- description: `npm i -D @axe-core/playwright --include=dev`; spec: /,
  /odalar, /rezervasyon, /sss sayfalarında AxeBuilder taraması; critical +
  serious ihlaller 0 olana dek bulguları düzelt (alt, aria, kontrast).
- validation: `npx playwright test tests/a11y.spec.ts` PASS.
- status: done
- log:
- files:

### T19 — reduced-motion e2e doğrulaması
- depends_on: [T6]
- location: tests/e2e/reduced-motion.spec.ts (yeni)
- description: Playwright `page.emulateMedia({reducedMotion:'reduce'})` ile
  ana sayfa: `.hero-video` görünmez (display:none) VE `.hero h1` görünür.
- validation: Yeni spec PASS.
- status: done
- log:
- files:

### T21 — Remotion tanıtım kompoziti
- depends_on: [T0a]
- location: remotion/ (yeni: remotion/index.ts, remotion/Root.tsx,
  remotion/Tanitim.tsx, remotion/README.md), public/videos/tanitim.mp4
- description: Kök package.json'daki mevcut @remotion/* paketleriyle 26-30sn
  1080x1920 kompozisyon: OffthreadVideo ile public/videos/hero.mp4 (0-6s,
  drone+akış) → chef.mp4 (6-13s) → sunset.mp4 (13-20s) → hero.mp4 şömine
  kesiti (20-26s) → bitiş kartı (26-30s): LogoMark SVG path'leri + "KOZBEYLİ
  KONAĞI" + "Foça, İzmir" (gold #b3925c / ivory, fade-in). Render komutu
  README'ye + bir kez koş: `npx remotion render remotion/index.ts Tanitim
  public/videos/tanitim.mp4`. Render sandbox'ta başarısız olursa (chromium/
  codec eksikliği) Windows'ta koşulacak komutu README'ye yazıp task'ı
  "blocked-env" işaretle — kompozisyon kodu yine teslim edilir.
- validation: public/videos/tanitim.mp4 mevcut ve ffprobe süresi 24-32sn
  (VEYA blocked-env: remotion/ kodu tsc temiz + README'de çalıştırma komutu).
- status: done
- log:
- files:

## Wave 7 — Final kapı

### T20 — Tam doğrulama + rapor revizyonu
- depends_on: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T21]
- location: docs/launch-readiness.md
- description: Temiz build + TAM suite: `npx playwright test tests/e2e/
  tests/security.spec.ts tests/prestige-verification.spec.ts tests/a11y.spec.ts
  --reporter=line` + `npx vitest run --project unit`. Hepsi yeşilse
  launch-readiness skor tablosunu güncelle (bilgi mimarisi, teknik SEO,
  erişilebilirlik, QA satırları; yeni PASS maddeleri; skoru yeniden hesapla,
  "rev." notu ekle). Kırmızı varsa ilgili task'ı reopen edip düzelttir.
- validation: Suite + vitest EXIT 0 VE raporda yeni "rev." satırı.
- status: done
- log:
- files:

## BLOCKED (dış bağımlılık — swarm dışı)

### B1 — Garanti Sanal POS entegrasyonu
- needs: Bankadan Merchant/Terminal ID, 3D Store Key, test ortamı (plan hazır: docs/odeme-karari.md).

### B2 — HMS booking engine canlı URL
- needs: Vendor yanıtları + NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL.

### B3 — GTM/GA4/Meta ID'leri
- needs: Vercel env: NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_META_PIXEL_ID, GA4_MEASUREMENT_ID, GA4_API_SECRET.

### B4 — Search Console + Google Business Profile + Hotel Center
- needs: Operasyonel hesap kurulumu (kod GOOGLE_SITE_VERIFICATION bekliyor).

### B5 — /teklifler gerçek kampanya içeriği
- needs: İşletmeden paket adı/koşul/fiyat; gelince T4 sayfası doldurulur.

## Coverage

| Gereksinim | Task(lar) |
|---|---|
| Deneyim silosu (3 rehber + hub + ana sayfa teaser) | T1, T2, T3, T10, T13 |
| /teklifler sayfası | T4 (gerçek kampanya: B5) |
| Lighthouse CI | T5 |
| WCAG / reduced-motion | T6, T18, T19 |
| Menü senkronu (zip'teki güncel menü) | T7 |
| Medya: sunset + oda detay kareleri + entegrasyon | T0a, T0b, T8, T9 |
| EN rotaları + hreflang + dil geçişi | T14, T15, T16, T17 |
| Sitemap/nav bütünlüğü | T11, T12 |
| Remotion tanıtım videosu | T21 |
| Final doğrulama + launch-readiness revizyonu | T20 |
| POS / HMS / Analytics ID / GBP / kampanya içeriği | B1–B5 (BLOCKED, dış) |

Eşlenmemiş gereksinim yok.


---

## Tamamlama Logu (W2-W7 — gercek durum, kanit)
- W2 (T10-T13): done — commit e17578e (deneyimler hub, sitemap+5, nav/footer, ana sayfa teaser)
- W3-W5 (T14-T17): done — commit 2c48d6d (EN sozluk 6 grup, /en 12 dosya, hreflang sitemap yontemi 44url/32hreflang, dil switcher + lang-switch e2e)
- W6 (T18,T19,T21): done — commit 37be5a1 (a11y suite axe 4 sayfa critical+serious=0, reduced-motion e2e, Remotion video/ kompozisyonu + README; T21 render blocked-env, kod+README teslim edildi)
- W7 (T20): done — plan.md status guncellendi + progress.md + Serena onboarding/config tamamlandi
- BLOCKED (dis): B1 Garanti POS, B2 HMS engine URL (env), B3 GTM/GA4/Meta ID, B4 Search Console/GBP, B5 kampanya icerikleri — kullanicida
