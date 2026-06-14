# Kozbeyli Konağı — Publish Target & Gate

Son revizyon: 2026-06-13

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
```

`launch:audit` mevcut commercial launch skorunu ve eksik kanıtları listeler.
`launch:audit:json`, aynı sonucu CI, dashboard veya ajan denetimleri için
makine okunur JSON olarak verir.
`launch:audit:strict`, aşağıdaki kanıtlar tamamlanmadan bilinçli olarak fail verir:

- HMS booking engine canlı URL + booking UAT: `docs/evidence/hms-booking-engine.md`
- Garanti Sanal POS sandbox/callback/refund kanıtı: `docs/evidence/garanti-pos.md`
- GTM/GA4/Meta production + purchase doğrulaması: `docs/evidence/analytics-purchase.md`
- Search Console / GBP / Hotel Center kanıtı: `docs/evidence/search-local-seo.md`
- Vendor DPA + hukuk onayı: `docs/evidence/legal-dpa.md`

## Mevcut Durum

- Repo/Kod Kalitesi: **95/100**
- Marketing Publish Readiness: **90/100**
- Ticari Launch Readiness: **86/100**
- Karar: **Marketing publish için koşullu hazır; gerçek booking/payment için NO-GO**
- Son doğrulama: `npm run publish:verify` PASS, tam normal Playwright kümesi PASS
  (113 passed / 2 skipped), monkey/chaos PASS (3/3), `npm audit --omit=dev
  --audit-level=high` PASS.
- Local production preview: `http://127.0.0.1:3010`.

## Publish Gate

Yayın öncesi yerel kapı:

```bash
npm run publish:verify
npm run launch:smoke
```

Bu komut aşağıdaki işleri kapsar:

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
kontrol eder. Aynı smoke gate her push/PR'da GitHub Actions içinde publish
verification'dan önce çalışır. Canlı Vercel deployment için:

```bash
npm run launch:smoke:live
```

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

- Vercel CLI bu makinede kurulu değil. Agentic deploy/env/log için:
  `npm i -g vercel`
- Google Business Profile, Hotel Center, Search Console doğrulamaları operasyonel
  hesap erişimi gerektirir.
