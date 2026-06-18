# Kozbeyli Konağı — Publish Target & Gate

Son revizyon: 2026-06-18

Bu dosya yayın hedefini tek yerde tanımlar. Amaç: "hazır mı?" sorusuna
ölçülebilir kapılarla cevap vermek ve dış bağımlılıkları kod kalitesiyle
karıştırmamaktır.

## Net Hedef

| Hedef | Skor | Karar | Anlamı |
| --- | ---: | --- | --- |
| Repo/Kod Kalitesi | 95/100 | Zorunlu | Lint, typecheck, unit, build, route smoke, security ve a11y kapıları yeşil olacak. |
| Marketing Publish | 90/100 | GO | Site canlıya çıkabilir; rezervasyon motoru yoksa WhatsApp fallback çalışır. |
| Booking & Payment Publish | 100/100 | NO-GO until external | HMS booking engine, Garanti Sanal POS, GA4 purchase ve canlı UAT tamamlanmadan "tam ticari yayın" denmez. |

## 100/100 Ticari Hedef Kapısı

Tam ticari yayın hedefi artık çalıştırılabilir bir gate ile izlenir:

```bash
npm run launch:audit
npm run launch:audit:json
npm run launch:audit:strict
npm run domain:verify
```

`launch:audit` mevcut commercial launch skorunu ve eksik kanıtları listeler.
`launch:audit:json`, aynı sonucu CI, dashboard veya ajan denetimleri için
makine okunur JSON olarak verir.
`launch:audit:strict`, aşağıdaki kanıtlar tamamlanmadan bilinçli olarak fail verir:

- Canonical domain health + current Vercel commit: `docs/evidence/canonical-domain.md`
- Turnstile + Upstash production abuse-control kanıtı: `docs/evidence/production-abuse-controls.md`
- HMS booking engine canlı URL + booking UAT: `docs/evidence/hms-booking-engine.md`
- Garanti Sanal POS sandbox/callback/refund kanıtı: `docs/evidence/garanti-pos.md`
- GTM/GA4/Meta production + purchase doğrulaması: `docs/evidence/analytics-purchase.md`
- Search Console / GBP / Hotel Center kanıtı: `docs/evidence/search-local-seo.md`
- Vendor DPA + hukuk onayı: `docs/evidence/legal-dpa.md`

## Mevcut Durum

- Repo/Kod Kalitesi: **95/100**
- Marketing Publish Readiness: **90/100**
- Ticari Launch Readiness: **82/100**
- Karar: **Marketing publish için koşullu hazır; gerçek booking/payment için NO-GO**
- Son doğrulama: `npm run publish:verify` PASS, tam normal Playwright kümesi PASS
  (113 passed / 2 skipped), monkey/chaos PASS (3/3), `npm audit --omit=dev
  --audit-level=high` PASS.
- Local production preview: `http://127.0.0.1:3010`.

## Publish Gate

Yayın öncesi yerel kapı:

```bash
npm run release:verify
```

Bu üst komut aşağıdaki kapıları sırayla çalıştırır:

- Runtime dependency audit (`npm run security:audit`)
- Tam publish doğrulaması (`npm run publish:verify`)
- Lokal launch smoke (`npm run launch:smoke`)
- Monkey/chaos stres testleri (`npm run test:stress`)
- Makine okunur commercial launch audit (`npm run launch:audit:json`)

`publish:verify` içinde aşağıdaki işler kalır:

- ESLint
- TypeScript
- Vitest unit suite
- Next production build
- Tüm public TR/EN/legal/deneyim rotaları smoke kontrolü
- Security regression suite
- Prestige/mobile/a11y doğrulama
- Publish hedef envanteri (`scripts/publish-readiness.mjs`)

`launch:smoke` production build üstünde public rotaları, hero video playback,
iletişim koordinatı, düğün/organizasyon medyası ve görünür medya kırıklarını
kontrol eder. CI her push/PR'da release gate manifestini doğrular ve aynı smoke
gate'i publish verification'dan önce çalıştırır. Canlı Vercel deployment için:

```bash
npm run launch:smoke:live
npm run domain:verify:strict
```

Not: `release:verify` lokal repo/release yeşil kapısıdır ve `launch:audit:json`
çıktısını raporlar; domain/commercial strict gate'leri dış kanıtlar hazır olana
kadar bilinçli olarak ayrı kırmızı kapı halinde tutulur.

Ek genişletilmiş yerel kapılar:

```bash
PW_BASE_URL=http://127.0.0.1:3010 npx playwright test tests/e2e/ tests/security.spec.ts tests/prestige-verification.spec.ts tests/a11y.spec.ts tests/smoke.spec.ts
npx playwright test tests/monkey.spec.ts tests/destructive-chaos.spec.ts
npm audit --omit=dev --audit-level=high
```

## GO / NO-GO Kuralları

### Marketing Publish GO

Aşağıdakilerin tamamı sağlanırsa site marketing yayınına çıkarılabilir:

- `npm run publish:verify` PASS.
- Vercel production env içinde en az `NEXT_PUBLIC_SITE_URL`, `DATABASE_URI`,
  `PAYLOAD_SECRET`, `HOTELRUNNER_WEBHOOK_SECRET`, `IYZICO_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_WHATSAPP_URL`
  tanımlı.
- `NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` boşsa rezervasyon sayfası WhatsApp
  fallback gösterir.
- `/robots.txt`, `/sitemap.xml`, `/llms.txt`, canonical ve hreflang çıktıları
  yayında erişilebilir.
- `/api/health` 200 JSON döner, `Cache-Control: no-store` taşır ve secret/env
  değeri sızdırmaz.
- Lead formunda Turnstile production anahtarları, rate-limit/replay için Upstash
  REST production değerleri tanımlıdır.

### Booking & Payment NO-GO

Aşağıdakiler tamamlanmadan "tam ticari yayın" yok:

- HMS vendor canlı booking engine URL'i.
- Garanti Sanal POS Merchant/Terminal ID, 3D Store Key ve test ortamı.
- Başarılı ve başarısız ödeme sandbox testi.
- Canlı küçük tutarlı test rezervasyonu, iptal/iade ve stok düşümü doğrulaması.
- GA4 Measurement Protocol purchase event doğrulaması.
- Hukuki vendor DPA ve yurtdışı veri aktarımı onayı.

## Yayın Sonrası 30 Dakika Kontrolü

1. Ana sayfa, `/rezervasyon`, `/odalar`, `/en`, `/sitemap.xml`, `/robots.txt`, `/api/health`.
2. WhatsApp fallback linki.
3. Lead formu consent doğrulaması.
4. Admin giriş ekranı ve `/admin/growth` oturum guard.
5. Search Console sitemap submit.
6. Vercel logs: 4xx/5xx, webhook ve CSP hataları.

## Dış Blokajlar

- Vercel domain/env/log kontrolü için Vercel CLI oturumunun (`vercel login`)
  aktif olması veya panel erişimi gerekir.
- Google Business Profile, Hotel Center, Search Console doğrulamaları operasyonel
  hesap erişimi gerektirir.
