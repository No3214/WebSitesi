# plan.md — Review Orchestration Layer + Comprehensive Audit

Hedef: Kozbeyli Konağı (Next.js 15 App Router + Payload CMS v3 + Postgres, repo
No3214/WebSitesi) için Google-güvenli + KVKK-uyumlu Review Orchestration Layer'ı
fiilen kurmak; ardından A→Z kapsamlı denetim + düzeltme. Spec:
`docs/review-orchestration-claude-code-prompt.md`.

Genel kurallar (her task için geçerli):
- TS strict; `npx tsc --noEmit -p tsconfig.json` temiz kalmalı.
- Vitest "unit" suite yeşil kalmalı (mevcut taban 447). Her task kendi kontrat testini ekler.
- `console.*` değil `src/lib/logger.ts` `logEvent`. Sunucu sırları yalnız `src/lib/env.ts`(zod)+Vercel;
  public ID/flag yalnız `src/lib/public-env.ts`.
- Üçüncü-taraf puanı `AggregateRating`/`Review` JSON-LD'ye GİRMEZ. Booking metni onaysız gösterilmez.
  Tripadvisor metni source'a gömülmez. Halüsinasyon/gerçek-dışı/yasal-riskli içerik yok.
- Aynı dalgadaki iki task aynı dosyayı sahiplenemez.
- Her dalga sonunda gate: tsc + vitest; doğrulama geçince push; Vercel READY + (UI varsa) Chrome görsel.

---

## Wave 1 — Foundation (paralel; bağımsız dosyalar)

### T1 — reviews tipleri + normalization + sanitization (saf lib)
- id: T1
- depends_on: []
- location: `src/lib/reviews/types.ts`, `src/lib/reviews/normalize.ts`, `src/lib/reviews/sanitize.ts`
- description: Ortak `ReviewItem`/`ReviewSource` tipleri; `normalizeRating(value, scaleMax)` (10→5,
  clamp 1-5); `maskAuthor("Ayşe Kaya")→"Ayşe K."`; `sanitizeReviewBody(html)` → script/style/link/
  markup strip → düz metin, trim, uzunluk sınırı. Saf fonksiyonlar, yan etki yok.
- validation: `tests/reviews-normalize.test.ts` yeşil — 8.6/10→4.3; "Mehmet Yılmaz"→"Mehmet Y.";
  `<script>`/`<a href>` içeren gövde düz-metne iner; tsc temiz.

### T2 — env/config plumbing (server secret + public flag + örnek)
- id: T2
- depends_on: []
- location: `src/lib/env.ts`, `src/lib/public-env.ts`, `.env.example`
- description: `src/lib/env.ts` zod şemasına `GOOGLE_BUSINESS_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN`,
  `GOOGLE_BUSINESS_ACCOUNT_ID`, `GOOGLE_BUSINESS_LOCATION_ID` (hepsi optional, boş=no-op) ekle;
  `src/lib/public-env.ts`'e `NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL` (default `"false"`); `.env.example`
  dokümante et. Sır public-env'e ASLA girmez.
- validation: `tests/reviews-env.test.ts` — public-env yalnız NEXT_PUBLIC_ döner; BOOKING flag default
  "false"; env.ts Google alanlarını içerir; mevcut `tests/production-contracts.test.ts` "limited to
  public keys" yeşil kalır.

---

## Wave 2 — Persistence + adapters (depends T1,T2; paralel; farklı dosyalar)

### T3 — Payload collections + hooks + access + register
- id: T3
- depends_on: [T1, T2]
- location: `src/collections/review-sources.ts`, `src/collections/review-items.ts`,
  `src/collections/review-publication-rules.ts`, `src/collections/review-moderation-events.ts`,
  `payload.config.ts`
- description: Spec §4 collection'ları Payload v3 konvansiyonuyla; `review-items` `beforeChange` →
  T1 `sanitizeReviewBody`+`maskAuthor`; `afterChange` → status değişince `revalidateTag('reviews')`;
  access: review-items+moderation yalnız admin/editör, public read yalnız `status==="published"`.
  payload.config.ts'e collection'ları kaydet (mevcut config'i bozmadan).
- validation: `tests/reviews-collections.test.ts` — 4 slug mevcut; review-items beforeChange sanitize+
  mask çağırır; afterChange revalidateTag('reviews') içerir; public access published-only; tsc temiz.

### T4 — source adapters (Google env-gated no-op / manuel / first-party)
- id: T4
- depends_on: [T1, T2]
- location: `src/lib/reviews/adapters/google.ts`, `src/lib/reviews/adapters/manual.ts`,
  `src/lib/reviews/adapters/first-party.ts`, `src/lib/reviews/adapters/index.ts`
- description: `googleAdapter`: OAuth creds yoksa `logEvent("reviews.google.skipped_not_configured")`
  + `[]` döner (GA4/Meta deseni); creds varsa Business Profile API'den çeker (imza resmi dokümana
  göre, emin değilse işaretle), T1 ile normalize. `manualAdapter`/`firstPartyAdapter`: girilen kaydı
  normalize+sanitize. `displayPolicy==="score-and-link"` ise `reviewBody` boş döner.
- validation: `tests/reviews-adapters.test.ts` — creds yokken google `[]`+skip log; manuel 10'luk puan
  5'e iner; score-and-link reviewBody düşürür; throw etmez.

---

## Wave 3 — Public internal API (depends T3,T4)

### T5 — Next.js Route Handlers (iç API; vendor API'leri front-end'e açılmaz)
- id: T5
- depends_on: [T3, T4]
- location: `src/app/api/review-summary/route.ts`, `src/app/api/review-cards/route.ts`,
  `src/app/api/review-refresh/[source]/route.ts`, `src/app/api/review-moderation/[id]/route.ts`,
  `src/app/api/review-health/route.ts`
- description: Spec §5. summary→kaynak bazında aggregate (ad, ortalama puan metni, sayı, link,
  displayPolicy); cards→yalnız published; refresh+moderation auth korumalı (mevcut admin/ECC auth
  desenine bağlan) + moderation-event yazar; health→sync/quota durumu. Public uçlar displayPolicy'ye
  uyar (score-and-link → reviewBody YOK). `logEvent` kullan; cache `revalidateTag('reviews')`.
- validation: `tests/reviews-api.test.ts` — summary aggregate şekli; cards published-only;
  score-and-link kaynağında reviewBody alanı bulunmaz; refresh/moderation auth'suz 401/403;
  route'larda `console.` yok.

---

## Wave 4 — Front-end + structured data + CSP (depends T5; paralel; farklı dosyalar)

### T6 — Widget'lar + ana sayfa/booking yerleşimi + stil
- id: T6
- depends_on: [T5]
- location: `src/components/reviews/review-summary.tsx`, `src/components/reviews/review-banner.tsx`,
  `src/app/globals.css`, `src/components/home/reviews-section.tsx`, ana sayfa kompozisyon dosyası,
  rezervasyon sayfası banner yerleşimi
- description: `ReviewSummary` (server-first, marka tokenları `--olive/--gold/--ivory` + Playfair/
  Cormorant/Raleway; kaynak rozetleri; `rel="nofollow noopener noreferrer" target="_blank"` linkler;
  full-text kaynaklarda öne çıkan kısa alıntı). `ReviewBanner` (booking funnel kompakt güven bandı).
  Üçüncü-taraf JS yükleyen kısım olursa "use client" + consent-gated (`src/lib/consent.ts`).
  Graceful fallback (API çökerse statik rozet+link). globals.css'e marka-uyumlu stiller.
- validation: `tests/reviews-widgets.test.ts` — bileşenler marka token'ı kullanır, dış linkler
  nofollow+noopener; consent-gated 3P JS deseni; ana sayfa + rezervasyon kompozisyonu widget'ı
  içerir; tsc temiz. Chrome: production'da ana sayfa + booking'de görsel doğrulama.

### T7 — hotelSchema sameAs genişletme (aggregateRating KORUNUR yok) + CSP
- id: T7
- depends_on: [T5]
- location: `src/lib/schema.ts`, `next.config.ts`, `tests/production-contracts.test.ts`,
  `scripts/security-headers-readiness.mjs`, `tests/security-headers-readiness.test.ts`,
  `tests/security.spec.ts`
- description: `hotelSchema()` `sameAs`'a yapı (gerçek URL'leri kullanıcı dolduracak, TODO işaretiyle)
  ekle; `aggregateRating`/`Review` EKLEME. Google Business Profile API veya Tripadvisor widget için
  yeni alan/JS gerekiyorsa CSP `connect-src`/`script-src`/`frame-src`'i dar şekilde güncelle ve TÜM
  CSP string kontratlarını (3 test + readiness script) birlikte eşitle.
- validation: `tests/schema.test.ts` + `tests/trust-claims.test.ts` yeşil (aggregateRating yok);
  CSP string'leri 4 dosyada tutarlı; security testleri yeşil.

---

## Wave 5 — Seed + dokümantasyon (depends T3)

### T8 — seed örnek veri + operasyon README
- id: T8
- depends_on: [T3]
- location: `scripts/seed-reviews.ts`, `docs/reviews-orchestration-README.md`
- description: Her kaynak tipinden (api/manual/first-party) birkaç ÖRNEK ("örnek" etiketli, uydurma
  marka iddiası içermeyen) review-source + review-item seed; README: yeni kaynak ekleme, moderasyon
  akışı, `BOOKING_PUBLIC_APPROVAL` açma, Google OAuth bağlama adımları.
- validation: `tests/reviews-seed.test.ts` — seed dosyası 3 kaynak-tipini içerir, gerçek-dışı
  puan/iddia yok; README zorunlu başlıkları içerir.

---

## Wave 6 — Doğrulama + kapsamlı denetim (depends T1..T8)

### T9 — uçtan uca doğrulama + production görsel QA
- id: T9
- depends_on: [T3, T5, T6, T7, T8]
- location: `docs/reviews-orchestration-verification.md`
- description: Tam `tsc` + vitest (yeni sayım, hepsi yeşil); push; Vercel READY; Chrome ile ana
  sayfa ReviewSummary + booking ReviewBanner görsel doğrulama; console hata taraması.
- validation: doc — tsc OK, vitest tüm yeşil sayısı, Vercel commit READY, 2 ekran görsel teyit,
  console hatasız.

### T10 — A→Z kapsamlı proje denetimi + düzeltmeler
- id: T10
- depends_on: [T9]
- location: `docs/comprehensive-audit-2026-06.md` + bulunan GERÇEK sorunların düzeltme commit'leri
- description: Kod kalitesi (ölü kod, god-file, tip güvenliği), güvenlik (CSP/headers/secret sızıntısı/
  webhook/rate-limit), SEO (metadata/canonical/sitemap/JSON-LD/hreflang), erişilebilirlik (a11y/kontrast/
  klavye/focus), performans (LCP/CLS/lazy/önbellek), içerik doğruluğu (gerçek-dışı iddia/yasal risk
  taraması). Yalnız KANITA dayalı GERÇEK sorunları düzelt (uydurma değişiklik yok). Her düzeltme test+
  doğrulama ile.
- validation: audit doc — her alan için bulgu listesi + kanıt; düzeltmeler tsc+vitest yeşil + Vercel
  READY; "yalan/yasal-riskli içerik" taraması temiz.

---

## BLOCKED (kullanıcı girişi/onayı gerekiyor — sessizce atlanmadı)

### B1 — Google Business Profile CANLI yorum çekimi
- id: B1
- depends_on: [T4]
- location: Vercel env (`GOOGLE_BUSINESS_*`)
- description: Adapter env-gated kuruludur ama CANLI çekim, kullanıcının Google OAuth (client/secret/
  refresh) + Business Profile API erişim onayını Vercel env'e girmesini gerektirir.
- validation: BLOCKED — creds girilene kadar doğrulanamaz; README'de adımlar belgelenir.

### B2 — Booking public metin + Tripadvisor lisanslı metin
- id: B2
- depends_on: [T6]
- location: `NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL`, içerik lisansı
- description: Booking yorum METNİ ancak yazılı partner onayı + flag=true ile; Tripadvisor metni ancak
  içerik lisansıyla. Onay/lisans gelene kadar yalnız puan+link.
- validation: BLOCKED — varsayılan flag=false T2/T6'da test edilir.

---

## Coverage (her gereksinim → task)

- Payload collections (4) + hooks + access → **T3**
- Route Handlers (summary/cards/refresh/moderation/health) → **T5**
- Source adapters (Google env-gated / manuel / first-party) → **T4** (canlı Google → **B1**)
- normalization + sanitization → **T1**
- ReviewSummary + ReviewBanner (server-first, marka, consent-gated) + yerleşim → **T6**
- mevcut hotelSchema() KORUNUR / aggregateRating YOK → **T7**
- seed data → **T8**
- .env.example + public-env/env(zod) → **T2**
- katı CSP string kontratları birlikte güncelleme → **T7**
- üçüncü-taraf yasal kısıt (Booking onaysız metin yok, Tripadvisor gömülmez) → **T4, T5, T6, T7** (+ **B2**)
- HER parça kontrat testi + 447+ yeşil + tsc temiz → her task validation + **T9**
- uçtan uca doğrulama (Vercel READY + Chrome) → **T9**
- A→Z kapsamlı denetim + düzeltme → **T10**
