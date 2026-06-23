# Kozbeyli Konağı — Publish Target & Gate

Son revizyon: 2026-06-22

Bu dosya yayın hedefini tek yerde tanımlar. Amaç: "hazır mı?" sorusuna
ölçülebilir kapılarla cevap vermek ve dış bağımlılıkları kod kalitesiyle
karıştırmamaktır.

## Net Hedef

| Hedef | Skor | Karar | Anlamı |
| --- | ---: | --- | --- |
| Repo/Kod Kalitesi | 95/100 | Zorunlu | Lint, typecheck, unit, build, route smoke, security ve a11y kapıları yeşil olacak. |
| Marketing Publish | 90/100 | GO | Site canlıya çıkabilir; HMS handoff veya WhatsApp/telefon destek yolu çalışır. |
| Booking & Payment Publish | 100/100 | NO-GO until external | HMS canlı UAT, Garanti Sanal POS, GA4 purchase ve dış kanıtlar tamamlanmadan "tam ticari yayın" denmez. |

## 100/100 Ticari Hedef Kapısı

Tam ticari yayın hedefi artık çalıştırılabilir bir gate ile izlenir:

```bash
npm run launch:audit
npm run launch:audit:json
npm run launch:cutover
npm run launch:cutover:json
npm run media:hero
npm run launch:audit:strict
npm run release:verify:commercial
npm run supabase:verify
npm run supabase:verify:strict
npm run domain:verify
```

`launch:audit` mevcut commercial launch skorunu ve eksik kanıtları listeler.
`launch:audit:json`, aynı sonucu CI, dashboard veya ajan denetimleri için
makine okunur JSON olarak verir. Her gate ayrıca `progressNotes` üretir; bu
notlar skor değiştirmez, fakat canlı `.com` doğrulaması, HMS handoff reachability
ve analytics public-ID kurulumu gibi tamamlanmış alt adımları evidence/secret
eksiklerinden ayırır.
`launch:cutover`, eksik ticari kapıları sahip, zamanlama, komut, kanıt ve KPI
kontrol döngüsüyle uygulanabilir cutover checklist'e çevirir.
`media:hero`, açılış videosunun onaylı hash, çözünürlük, süre, bitrate, poster
türevleri ve desktop/mobile Playwright playback sözleşmesini doğrular.
`supabase:verify`, Payload CMS'in `DATABASE_URI` / `PAYLOAD_SECRET` üretim
kapısını, local DB kullanımını ve service-role sızıntısı riskini ayrıca
denetler. Vercel Production değerleri local `.env` ile maskelenmeden
kanıtlanacaksa temp dosya kullan:
`vercel env pull %TEMP%\kozbeyli-supabase.env --environment=production` ve
`node scripts/supabase-security-readiness.mjs --env-file %TEMP%\kozbeyli-supabase.env`.
Komut değerleri yazdırmaz; işlem sonunda temp dosyayı sil veya önce boşalt.
`abuse:verify` aynı temp snapshot modeliyle production Turnstile/Upstash
değerlerini local `.env` ile maskelenmeden denetler:
`vercel env pull %TEMP%\kozbeyli-abuse.env --environment=production` ve
`node scripts/abuse-controls-readiness.mjs --env-file %TEMP%\kozbeyli-abuse.env`.
Snapshot içinde boş `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`,
`UPSTASH_REDIS_REST_URL` veya `UPSTASH_REDIS_REST_TOKEN` varsa gate bloklu kalır.
`analytics:verify` de aynı snapshot modeliyle GTM/GA4/Meta/Google Ads production
env değerlerini local `.env` yerine Vercel Production dosyasından doğrular:
`vercel env pull %TEMP%\kozbeyli-analytics.env --environment=production` ve
`node scripts/analytics-readiness.mjs --env-file %TEMP%\kozbeyli-analytics.env`.
Boş public ID'ler veya `GA4_API_SECRET` local değerlerle tamamlanmaz; işlem
sonunda temp dosyayı sil veya önce boşalt.
`launch:audit:strict`, aşağıdaki kanıtlar tamamlanmadan bilinçli olarak fail verir:

- Canonical domain health + current Vercel commit: `docs/evidence/canonical-domain.md`
- Payload CMS managed Postgres + secret controls: `docs/evidence/production-database.md`
- Turnstile + Upstash production abuse-control kanıtı: `docs/evidence/production-abuse-controls.md`
- HMS booking engine handoff + canlı booking UAT: `docs/evidence/hms-booking-engine.md`
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
  (168 passed / 2 skipped), unit PASS (31 files / 186 tests), build PASS
  (68 routes), `npm audit --omit=dev --audit-level=high` PASS.
- Public domain durumu: Vercel production URL ve `.com` canonical origin'ler
  güncel; `kozbeylikonagi.com` ve `www` `/api/health` üzerinden current commit
  döndürüyor ve `/videos/hero.mp4` açılış videosunu gösteriyor.
  `.com.tr` bu projenin launch hedefi değildir. Production env/evidence
  kapıları tamamlanmadığı için tam ticari publish hâlâ NO-GO durumundadır.
- Local production preview: `http://127.0.0.1:3008`.

## Publish Gate

Yayın öncesi yerel kapı:

```bash
npm run release:verify
npm run release:verify:commercial # sadece 100/100 booking/payment sign-off için
```

Bu üst komut aşağıdaki kapıları sırayla çalıştırır:

- Runtime dependency audit (`npm run security:audit`)
- Açılış videosu kalite/provenance audit'i (`npm run media:hero:json`)
- Tam publish doğrulaması (`npm run publish:verify`)
- Lokal launch smoke (`npm run launch:smoke`)
- Monkey/chaos stres testleri (`npm run test:stress`)
- Makine okunur commercial launch audit (`npm run launch:audit:json`)
- Supabase/Payload database security diagnostic (`npm run supabase:verify:json`)
- Makine okunur commercial cutover planı (`npm run launch:cutover:json`)

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
kontrol eder. Lokal hedefte commercial launch audit'i okur; `PW_BASE_URL` ile
canlı hedef verildiğinde local `.env` dosyalarından etkilenmemek için preflight
olarak `domain:verify:json` çalıştırır. CI her push/PR'da release gate
manifestini doğrular ve aynı smoke gate'i publish verification'dan önce
çalıştırır. Canonical production domain için:

```bash
npm run launch:smoke:live
npm run domain:verify:strict
```

Vercel preview hostu ayrıca kontrol edilecekse:

```bash
npm run launch:smoke:preview
```

Not: `release:verify` lokal repo/release yeşil kapısıdır ve `launch:audit:json`
çıktısını raporlar; domain/commercial strict gate'leri dış kanıtlar hazır olana
kadar bilinçli olarak ayrı kırmızı kapı halinde tutulur.
`release:verify:commercial`, aynı release sırasını `launch:audit:strict` ve
`launch:cutover:strict` ile çalıştırır; bu komut sadece tam ticari
booking/payment yayını için yeşil kabul edilir.

`publish:target`, commercial launch blocker listesinin yanında kısa
`commercial launch progress notes` satırı da basar. Bu satır, kanıtı eksik olduğu
için puan almayan ama kod/canlı doğrulama tarafında ilerlemiş gate'leri görünür
kılar; tam GO kararı için yine strict evidence gate'leri esas alınır.

Ek genişletilmiş yerel kapılar:

```bash
PW_BASE_URL=http://127.0.0.1:3008 npx playwright test tests/e2e/ tests/security.spec.ts tests/prestige-verification.spec.ts tests/a11y.spec.ts tests/smoke.spec.ts
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
- Rezervasyon CTA'ları resmi HMS handoff'a veya kontrollü destek fallback'ine
  gider; iframe içine sıkışmış booking deneyimi kullanılmaz.
- `/robots.txt`, `/sitemap.xml`, `/llms.txt`, canonical ve hreflang çıktıları
  yayında erişilebilir.
- `/api/health` 200 JSON döner, `Cache-Control: no-store` taşır ve secret/env
  değeri sızdırmaz.
- Payload CMS için production `DATABASE_URI` ve güçlü `PAYLOAD_SECRET` Vercel
  env içinde tanımlı, managed Postgres backup/restore kanıtı hazır.
- Lead formunda Turnstile production anahtarları, rate-limit/replay için Upstash
  REST production değerleri tanımlıdır.

### Booking & Payment NO-GO

Aşağıdakiler tamamlanmadan "tam ticari yayın" yok:

- HMS canlı tarih/konuk/oda seçimi UAT kanıtı.
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

- Vercel domain/env/log kontrolü için Vercel CLI oturumunun (`vercel login`,
  `vercel whoami`)
  aktif olması veya panel erişimi gerekir.
- Google Business Profile, Hotel Center, Search Console doğrulamaları operasyonel
  hesap erişimi gerektirir.
