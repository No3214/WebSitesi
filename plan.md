# Kozbeyli Konağı — Geliştirme Turu 2 (Autopilot + Swarm)

Hedef: Dönüşüm tutarlılığı + tam i18n + OG görselleri + dokümantasyon + ECC fonksiyonel testi + Playwright e2e koşusu.
Önceki tur: d1f6f31 (build EXIT:0).

## Wave 1 (paralel — dosya kapsamları ayrık)

### T1 — CTA tutarlılığı: tüm rezervasyon linkleri /rezervasyon sayfasına
- id: T1
- depends_on: []
- location: src/components/mobile-action-bar.tsx, src/components/exit-intent.tsx, src/components/floating-contact.tsx, src/components/conversion-motivators.tsx, src/components/conversion-velocity.tsx, src/components/home-client.tsx
- description: Bu bileşenlerde geçen "/#rezervasyon" href'lerini "/rezervasyon" yap (home-client içindeki section id="rezervasyon" KALSIN; yalnız href'ler değişir). data-event attribute'ları korunur.
- validation: location dosyalarında grep '"/#rezervasyon"' → 0; grep '"/rezervasyon"' → ≥3.
- status: pending
- log:

### T2 — /rezervasyon ve /iletisim tam i18n (TR/EN)
- id: T2
- depends_on: []
- location: src/app/rezervasyon/page.tsx, src/app/iletisim/page.tsx, src/components/reservation-client.tsx (yeni), src/components/contact-client.tsx (yeni)
- description: language-switcher + dictionary.ts mekanizmasını oku (locale saklama + tüketim deseni, home-client örnek). Sayfa gövdelerini bu deseni kullanan client bileşenlere taşı; metinler dictionary Reservation/Contact anahtarlarından, eksikse bileşen içi fallback. page.tsx'ler metadata + JSON-LD + client render eden ince kabuk kalır. HMSBookingEmbed, WeatherRibbon, LeadForm, OSM iframe aynen taşınır.
- validation: yeni iki bileşende "use client" var; rezervasyon/page.tsx "ReservationClient", iletisim/page.tsx "ContactClient" içerir; her iki page.tsx'te "export const metadata" durur.
- status: pending
- log:

### T3 — Sitewide OG/Twitter görselleri (gerçek fotoğraflarla)
- id: T3
- depends_on: []
- location: src/lib/metadata.ts
- description: public/images/odalar altından hero'ya uygun gerçek fotoğraf seç (ls ile listele). defaultMetadata'ya openGraph (type, locale tr_TR, siteName, images) ve twitter (summary_large_image) ekle; mevcut alanlar bozulmaz.
- validation: metadata.ts'te "openGraph", "twitter", "/images/odalar/" geçer.
- status: pending
- log:

### T4 — README yeniden yazımı (kurulum + env + deploy)
- id: T4
- depends_on: []
- location: README.md
- description: Proje tanıtımı (Next 15 + Payload 3 + Supabase), hızlı başlangıç, .env.example'daki TÜM değişkenlerin tablosu (HMS URL: HMS panelinden; boşken WhatsApp fallback), test komutları (vitest unit, playwright e2e, PW_BASE_URL), deploy (Vercel; railway legacy), /api/local-pulse özeti, klasör haritası. Türkçe.
- validation: README.md ≥80 satır; "HMS", "local-pulse", "Vercel" geçer.
- status: pending
- log:

### T5 — Oda detayında WeatherRibbon + CTA kontrolü
- id: T5
- depends_on: []
- location: src/components/room-detail-client.tsx
- description: Rezervasyon CTA'ları /rezervasyon'a gitsin (değilse düzelt; utm parametreleri korunur); WeatherRibbon'u CTA/fiyat bloğunun hemen üstüne ekle.
- validation: dosyada "WeatherRibbon" import+render var; '"/#rezervasyon"' yok.
- status: pending
- log:

### T7 — ECC fonksiyonel testi (verifyEs256Signature)
- id: T7
- depends_on: []
- location: tests/security-es256.test.ts (yeni)
- description: vitest (node env): WebCrypto ile P-256 keypair üret, payload'ı ECDSA SHA-256 ile imzala (raw r||s → base64), security.ts'teki verifyEs256Signature ile doğrula → true; payload'ı boz → false; geçersiz PEM → false (throw değil). Public key'i SPKI→PEM'e çevirip fonksiyonun beklediği formatta ver (önce src/lib/security.ts'i oku, imza/format sözleşmesine birebir uy).
- validation: dosyada ≥3 expect; "P-256" ve "verifyEs256Signature" geçer.
- status: pending
- log:

## Wave 2 (W1'e bağımlı)

### T6 — Gate: vitest + build + Playwright e2e + push
- id: T6
- depends_on: [T1, T2, T3, T4, T5, T7]
- location: (doğrulama + git; kod değişikliği yalnız hata düzeltmede)
- description: Windows'ta sırasıyla: (1) `npx vitest run --project unit` tüm testler PASS (T7 ECC testi dahil); (2) `npm run build` EXIT:0; (3) `npm run start` ile prod sunucu + `npx playwright test tests/e2e/ --project=chromium` (PW_BASE_URL=http://127.0.0.1:3000; tarayıcı yoksa önce `npx playwright install chromium`); (4) geçerse commit'ler + push origin/main. Kalansa ilgili task'a 1 retry, sonra blocked.
- validation: vitest "passed"; "BUILD_EXIT:0"; playwright çıktısında "passed" ve 0 failed; push çıktısında "main -> main".
- status: pending
- log:

## Coverage
- "Autopilot aç" → Stop/PreToolUse hook'ları + bu plan sözleşmesi.
- "ECC ile kontrol et/test et" → T7 (fonksiyonel ECC testi) + T6 gate'te koşulması.
- "Playwright ile çalıştır/geliştir" → T6 adım 3 (e2e gerçek koşu) + mevcut tests/e2e/new-pages.spec.ts.
- "Geliştirmeye devam" → T1, T2, T3, T4, T5.
- HMS URL / Supabase / Vercel login → BLOCKED-USER (kod hazır).
