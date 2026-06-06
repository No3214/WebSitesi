# Kozbeyli Konağı — Yayın Öncesi Swarm Planı

Hedef: Site HMS booking engine URL'i yapıştırılır yapıştırılmaz yayına hazır olsun.
Temel: WebSitesi repo HEAD 7a00336 + bu oturumda eklenen /rezervasyon, /iletisim,
free-API katmanı (Open-Meteo, sunrise-sunset, Frankfurter, Nager.Date), gastronomi videoları.

## Wave 1 (paralel, dosya kapsamları ayrık)

### T1 — i18n: Yeni sayfalar için EN sözlük + dil anahtarı uyumu
- status: done
- files: src/lib/dictionary.ts, src/app/rezervasyon/page.tsx, src/app/iletisim/page.tsx
- description: dictionary.ts yapısını oku. Navigation/Booking bölümlerine uyumlu şekilde
  rezervasyon ve iletişim sayfalarındaki sabit TR metinler için EN karşılıkları ekle.
  Sayfalar server component kalsın; mevcut locale mekanizması client'taysa sayfa
  metinlerini dictionary'ye taşımak yerine yalnızca dictionary'ye anahtarları ekle ve
  header/footer'ın yeni rotalarla (href="/rezervasyon", "/iletisim") tutarlı olduğunu doğrula.
  Footer'a /iletisim ve /rezervasyon linki yoksa ekle (site-footer.tsx'e dokunma izni bu taska aittir).
- validation: grep ile dictionary.ts içinde "reservation" ve "contact" EN anahtarları var;
  site-footer.tsx içinde /iletisim linki var; dosyalarda TS sözdizimi bariz bozulmamış.
- log: Worker tamam + validator pass. dictionary.ts'e Reservation/Contact blokları (TR+EN), footer'a Hızlı Bağlantılar (rezervasyon/iletisim/misafir-rehberi/gastronomi) eklendi.

### T2 — Güvenlik: header sertleştirme + webhook timing-safe doğrulama (ECC-ready)
- status: done
- files: next.config.ts, src/app/api/webhook/hotelrunner/route.ts, src/lib/security.ts
- description: next.config.ts'e güvenlik başlıkları ekle (X-Frame-Options yerine CSP
  frame-ancestors; frame-src'e HMS booking engine domain'leri için joker bırakma —
  yalnız https: kısıtı; openstreetmap.org embed'ine izin ver). Webhook route'unda imza
  karşılaştırması varsa crypto.timingSafeEqual kullanıldığını doğrula/yükselt.
  security.ts'e ES256 (ECC P-256) imza doğrulama yardımcı iskeleti ekle (ileride HMS
  webhook'ları ECC imzalı gelirse hazır olsun) — dışa aktarılan fonksiyon + JSDoc, mevcut
  davranışı bozma.
- validation: next.config.ts'te headers() tanımlı ve Content-Security-Policy veya
  frame-ancestors içeriyor; webhook route'unda timingSafeEqual geçiyor; security.ts'te
  ES256/P-256 referanslı export var.
- log: Worker tamam + validator pass (2. kontrolde). CSP frame-src https: + OSM, HSTS, Referrer-Policy, Permissions-Policy; webhook HMAC timingSafeEqual'a yükseltildi; security.ts'e verifyEs256Signature (WebCrypto, ECDSA P-256) eklendi.

### T3 — SEO: LodgingBusiness şeması + robots/alternates tamamlama
- status: done
- files: src/lib/schema.ts, src/app/robots.ts
- description: schema.ts'i oku; sitewide LodgingBusiness/Hotel JSON-LD üreticisini
  güçlendir: geo (38.737, 26.885), address (Kozbeyli Köyü, Foça, İzmir), telephone
  (+905322342686), email (info@kozbeylikonagi.com), checkinTime/checkoutTime alanları,
  potentialAction ReserveAction → https://www.kozbeylikonagi.com/rezervasyon.
  robots.ts'te /admin ve /api disallow edildiğinden, sitemap referansı olduğundan emin ol.
- validation: schema.ts'te ReserveAction ve GeoCoordinates geçiyor; robots.ts'te
  sitemap.xml referansı ve /admin disallow var.
- log: Worker tamam + validator pass. schema.ts'e geo/checkin-checkout/ReserveAction (rezervasyon hedefli), amenityFeature; robots.ts'e /api/, /odeme, /admin/growth disallow + host eklendi.

### T4 — Test: free-apis + sitemap + yeni rotalar için birim/smoke testleri
- status: done
- files: tests/free-apis.test.ts, tests/sitemap.test.ts, tests/e2e/new-pages.spec.ts
- description: vitest ile describeWeather kod aralıklarını (0,2,3,45,61,75,81,95) ve
  getNextHoliday'in 60 gün penceresi mantığını (fetch'i mock'la) test et. sitemap
  default export'unun /rezervasyon ve /iletisim içerdiğini test et. Playwright'a
  /rezervasyon ve /iletisim için sayfa-açılıyor + h2/başlık görünür smoke testi ekle
  (mevcut playwright.config.ts'e dokunma).
- validation: üç test dosyası mevcut ve import yolları @/lib/free-apis ile uyumlu;
  vitest dosyalarında en az 6 expect var.
- log: Worker tamam + validator pass (2. kontrolde, dosya adları .test.ts standardına çekildi). 21 expect; describeWeather sınırları, holiday 60g penceresi fetch-mock'la, sitemap rotaları, PW smoke.

## Wave 2 (ana oturum)
- V1: Her task için validator koşusu → plan.md log güncelle. [done — 4/4 pass]
- B1: Windows'ta npm install + next build (Desktop Commander) → EXIT:0 şart. [done — EXIT:0, 25 route]
- C1: Commit + push (origin/main, DC üzerinden kullanıcı kimliğiyle). [done — 1b66c41]

## Kurallar
- Worker'lar yalnız kendi files kapsamına dokunur; package.json/lock DOKUNULMAZ.
- Handoff: JSON {task, status, files_changed[], notes}.
- Validation fail → 1 retry (diagnostikle), sonra blocked.
