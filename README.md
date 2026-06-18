# Kozbeyli Konağı — Taş Otel & Restaurant

Kozbeyli Köyü (Foça / İzmir) merkezli Kozbeyli Konağı Taş Otel & Restaurant'ın resmi web sitesi. Premium taş ev konaklaması, Antakya ve Ege mutfağı deneyimleri ile etkinlik organizasyonlarını dijitalde temsil eder; rezervasyon dönüşümü ve marka otoritesi odaklıdır.

## Teknoloji Yığını

| Katman | Teknoloji |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19) |
| CMS | Payload CMS 3 (`/admin` paneli, Lexical rich text) |
| Veritabanı | Supabase Postgres (`@payloadcms/db-postgres`) |
| Stil | Tailwind CSS 4, Framer Motion |
| Test | Vitest (unit), Playwright (e2e), Storybook |
| Hedef Platform | Vercel |

## Hızlı Başlangıç

```bash
git clone <repo-url>
cd Web-main
npm install
copy .env.example .env        # macOS/Linux: cp .env.example .env
# .env içindeki değerleri doldur (aşağıdaki tabloya bak)
npm run dev                   # http://localhost:3000
```

Payload admin paneli: `http://localhost:3000/admin` (ilk kullanıcı panelden oluşturulur).

> **Windows notu:** Makinede kalıcı `NODE_ENV=production` tanımlıysa `npm install`
> devDependencies'i atlar (build araçları eksik kalır). Kurulumda
> `npm install --include=dev` kullanın. `next build`'i ise NODE_ENV'e dokunmadan
> çalıştırın — `NODE_ENV=development` ile production build almak Next'te
> "non-standard NODE_ENV" tutarsızlığı yaratır ve /404 prerender'ını kırar.

## Ortam Değişkenleri (.env)

`.env.example` dosyasındaki tüm değişkenler ve açıklamaları:

| Değişken | Ne işe yarar | Nereden alınır |
| --- | --- | --- |
| `NODE_ENV` | Çalışma ortamı (`development` / `production`) | Manuel; Vercel otomatik ayarlar |
| `NEXT_PUBLIC_SITE_URL` | Canonical site adresi (SEO, sitemap, OG) | Lokalde `http://localhost:3000`, canlıda alan adı |
| `DATABASE_URI` | Postgres bağlantı dizesi (Payload CMS) | Supabase Dashboard > Project Settings > Database > Connection string |
| `PAYLOAD_SECRET` | Payload oturum/şifreleme anahtarı | Uzun rastgele dize üret (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` | Online rezervasyon motoru linki | HMS panelindeki booking engine linki. Boş bırakılırsa site WhatsApp fallback ile çalışır; yayını engellemez |
| `NEXT_PUBLIC_WHATSAPP_URL` | WhatsApp iletişim/rezervasyon fallback linki | `https://wa.me/<telefon>` formatında otel numarası |
| `HOTELRUNNER_WEBHOOK_SECRET` | HMS/legacy webhook HMAC imza doğrulama sırrı | HMS webhook ayarlarında tanımlanan secret |
| `IYZICO_WEBHOOK_SECRET` | Iyzico/PSP webhook HMAC imza doğrulama sırrı | Iyzico webhook ayarlarında tanımlanan ayrı secret |
| `GARANTI_POS_MODE` | Garanti Sanal POS çalışma modu (`test` / `production`) | Garanti BBVA Sanal POS paneli |
| `GARANTI_MERCHANT_ID` | Garanti üye işyeri kimliği | Garanti BBVA Sanal POS paneli |
| `GARANTI_TERMINAL_ID` | Garanti terminal kimliği | Garanti BBVA Sanal POS paneli |
| `GARANTI_PROVISION_USER` | Garanti provizyon kullanıcı adı | Garanti BBVA Sanal POS paneli |
| `GARANTI_3D_STORE_KEY` | Garanti 3D Secure store key | Garanti BBVA Sanal POS paneli |
| `HMS_WEBHOOK_ES256_PUBLIC_KEY` | HMS ECC imzalı webhook public key'i | HMS SPKI PEM public key |
| `B2B_PARTNER_PUBLIC_KEY` | B2B availability endpoint partner public key'i | Partner onboarding sonrası SPKI PEM |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID | GTM paneli (`GTM-XXXXXXX`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta (Facebook) Pixel kimliği | Meta Events Manager |
| `GOOGLE_SITE_VERIFICATION` | Search Console site doğrulama meta etiketi | Google Search Console > Ownership verification |
| `FACEBOOK_DOMAIN_VERIFICATION` | Meta alan adı doğrulama etiketi | Meta Business Manager > Brand Safety > Domains |
| `NEXT_PUBLIC_GOOGLE_MAPS_URL` | İşletmenin Google Haritalar linki | Google Maps > Paylaş > Bağlantıyı kopyala |
| `GA4_MEASUREMENT_ID` | Server-side GA4 Measurement Protocol stream ID | GA4 Admin > Data Streams |
| `GA4_API_SECRET` | Server-side purchase event secret | GA4 Admin > Measurement Protocol API secrets |
| `UPSTASH_REDIS_REST_URL` | Production rate-limit/replay shared backend | Upstash Redis REST |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token | Upstash Redis REST |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile bot koruması (istemci) | Cloudflare Dashboard > Turnstile > Site key |
| `TURNSTILE_SECRET_KEY` | Turnstile sunucu tarafı doğrulama anahtarı | Cloudflare Dashboard > Turnstile > Secret key |
Not: `NEXT_PUBLIC_` öneki olan değişkenler tarayıcıya açılır; sır içeren değerleri bu önekle tanımlamayın.

## Komutlar

```bash
npm run dev                      # Geliştirme sunucusu (port 3000)
npm run build                    # Üretim derlemesi
npm run start                    # Üretim sunucusu (port 3000)
npm run lint                     # ESLint
npm run typecheck                # TypeScript kontrolü
npm run test:unit                # Vitest unit suite
npm run test:monkey              # Lokal deterministik desktop/mobile monkey testi
npm run test:chaos               # Lokal sert etkileşim stres testi
npm run test:stress              # monkey + chaos
npm run launch:audit             # Ticari 100/100 hedefi için env/kanıt denetimi
npm run launch:audit:json        # Aynı ticari denetimin makine okunur JSON çıktısı
npm run launch:audit:strict      # Tüm ticari kanıtlar tamamlanmadan fail verir
npm run domain:verify            # Canonical domainler Vercel health/current commit veriyor mu?
npm run domain:verify:strict     # Canonical domain hazır değilse fail verir
npm run launch:smoke             # Lokal production build'e kritik launch smoke
npm run launch:smoke:live        # Canlı Vercel URL'ye kritik launch smoke
npm run quality                  # lint + typecheck + unit + build
npm run release:verify           # Lokal release gate: security + publish + smoke + stress + audit JSON
npm run publish:target           # Yayın hedef/env/rota envanteri
npm run publish:verify           # Tam publish kapısı
npm run payload:types            # Payload tip üretimi (payload-types.ts)
npm run seed                     # Örnek içerik tohumlama (scripts/seed.mjs)
npm run storybook                # Storybook (port 6006)
```

### Testler

```bash
npx vitest run --project unit    # Unit testler (free-apis, sitemap, güvenlik vb.)
npx playwright test              # E2E testler (lokal sunucuya karşı)
npm run test:stress              # Canlı prod'u yormadan lokal monkey/chaos paketi
npm run launch:audit             # Booking/payment 100/100 için kalan kanıtları listeler
npm run launch:audit:json        # CI/ajanlar için structured launch audit çıktısı
npm run domain:verify            # kozbeylikonagi.com ve www domain health/commit kontrolü
npm run launch:smoke             # Public rota, health, hero video, konum ve medya smoke
npm run launch:smoke:live        # https://kozbeyli-konagi.vercel.app üzerinde aynı smoke
npm run release:verify           # Lokal final release kapısı (commercial/domain strict ayrı)

# Canlı/staging ortamına karşı e2e koşmak için:
PW_BASE_URL=https://kozbeylikonagi.example npx playwright test tests/e2e/ --project=chromium
```

PowerShell'de ortam değişkeni: `$env:PW_BASE_URL="https://..."; npx playwright test`.

## Ücretsiz API Katmanı: /api/local-pulse

Site, API anahtarı gerektirmeyen dört kamu servisini tek uç noktadan sunar (`src/lib/free-apis.ts`):

| Servis | Veri |
| --- | --- |
| Open-Meteo | Kozbeyli güncel hava durumu ve günlük tahmin |
| sunrise-sunset.org | Gün doğumu / gün batımı saatleri |
| Frankfurter (ECB) | Döviz kurları |
| Nager.Date | Türkiye resmi tatilleri |

Tüm çağrılar server-side yapılır, 30 dakikalık Next.js fetch cache ile korunur ve hata durumunda `null` dönerek sayfayı düşürmez. Anahtar veya kota yönetimi gerekmez.

## Güvenlik

- **CSP / HSTS**: `next.config.ts` içinde Content-Security-Policy ve Strict-Transport-Security başlıkları tanımlıdır.
- **Timing-safe webhook**: HotelRunner ve iyzico webhook'ları (`src/app/api/webhook/*/route.ts`) imzayı sabit zamanlı karşılaştırma ile doğrular; zamanlama saldırılarına kapalıdır ve ayrı HMAC secret kullanır.
- **ECC imza doğrulama**: `src/lib/security.ts` içindeki `verifyEs256Signature`, ES256 (ECDSA, NIST P-256 + SHA-256) imzalarını SPKI PEM public key ile doğrular; gelecekteki imzalı entegrasyonlar için hazırdır.
- **Bot koruması**: Form uç noktaları Cloudflare Turnstile ile korunabilir (env anahtarları girildiğinde aktifleşir).

## Deploy

### Vercel (önerilen)

1. Repoyu Vercel'e bağla (framework otomatik Next.js algılanır).
2. Yukarıdaki tablodaki tüm env değişkenlerini Vercel panelinden (Project > Settings > Environment Variables) gir.
3. `DATABASE_URI` için Supabase connection pooler adresini kullan.
4. Deploy sonrası `NEXT_PUBLIC_SITE_URL` değerini canlı alan adıyla güncelle.
5. DNS/Vercel domain yönlendirmesi tamamlanınca `npm run domain:verify:strict`
   çalıştır; `kozbeylikonagi.com` ve `www` `/api/health` üzerinden aynı canlı
   commit'i göstermeden ticari launch evidence'i `ready` yapılmaz.

`NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` boşken de site sorunsuz yayınlanır; rezervasyon CTA'ları WhatsApp'a yönlenir.

### Publish hedefi

Yayın hedefi ve GO/NO-GO kapıları: `docs/publish-target.md`.

Özet:

- Repo/kod hedefi: **95/100**
- Marketing publish hedefi: **90/100**
- Booking/payment hedefi: **100/100** ve HMS + Garanti Sanal POS dış bilgileri gelmeden NO-GO

Yayın öncesi tek komut:

```bash
npm run release:verify
```

Bu komut runtime dependency audit, `publish:verify`, lokal `launch:smoke`,
monkey/chaos stres testleri ve non-strict JSON commercial launch audit'i tek
sırada çalıştırır. `launch:audit:strict` ve `domain:verify:strict`, dış kanıtlar
hazır olana kadar ayrı kırmızı kapı olarak tutulur. `publish:verify` içinde lint, typecheck, unit, production build,
tüm TR/EN public rota smoke, security, prestige/mobile, a11y ve publish target
envanteri kalır.
Deploy sonrası canlı yüzey için hızlı doğrulama:

```bash
npm run launch:smoke:live
```

Bu komut public rotaları, ana ekran hero videosunu, düğün/organizasyon medyasını,
iletişim konumunu ve görünür medya kırıklarını canlı URL üzerinde tekrar kontrol eder.

Vercel env/deploy/log kontrolü için Vercel CLI oturumu (`vercel login`) veya
Vercel panel erişimi gerekir.

### Railway (legacy)

Kökteki `railway.json` eski Railway dağıtımından kalmadır; aktif hedef Vercel'dir.

## Klasör Haritası

```
src/app/             # App Router sayfaları + API route'ları
src/components/      # UI bileşenleri (client/server)
src/lib/             # Yardımcılar: free-apis, security, metadata, ai/, env
src/data/            # Statik içerik (odalar)
src/dictionaries/    # i18n sözlükleri (tr.json, en.json)
payload/             # Payload CMS koleksiyonları (Rooms, Media, Leads vb.)
agent/               # Growth-engine skill'leri ve otomasyon scriptleri
scripts/             # Seed, SEO audit, optimizasyon scriptleri
tests/               # Vitest unit + Playwright e2e (tests/e2e/)
public/              # Statik varlıklar (görseller, fontlar)
```

## Sayfalar

| Rota | İçerik |
| --- | --- |
| `/` | Ana sayfa (hero, dönüşüm bölümleri) |
| `/rezervasyon` | Rezervasyon (HMS embed veya WhatsApp fallback) |
| `/iletisim` | İletişim, harita, lead formu |
| `/odalar` ve `/odalar/[slug]` | Oda listesi ve detayları |
| `/gastronomi` | Restoran ve mutfak deneyimi |
| `/menu` | Restoran menüsü |
| `/hikayemiz` | Konağın ve köyün hikayesi |
| `/organizasyonlar` | Düğün ve etkinlik paketleri |
| `/misafir-rehberi` | Konaklama öncesi/sırası rehber |
| `/odeme` | Ödeme bilgilendirme |
| `/kvkk`, `/gizlilik-politikasi`, `/mesafeli-satis-sozlesmesi` | Yasal sayfalar |
| `/admin` | Payload CMS yönetim paneli |

API uç noktaları: `/api/health`, `/api/local-pulse`, `/api/lead`, `/api/llm-context`, `/api/webhook/hotelrunner`, `/llms.txt`.

`/api/health` uptime monitorleri için cache'siz JSON döner; secret, ödeme anahtarı
veya private env değeri yayınlamaz.

## Demo / Mock Yüzeyler (ÖNEMLİ)

Aşağıdaki yüzeyler **gerçek değildir**; yeni geliştiriciler canlı sanmasın diye burada listelenir
(detaylı analiz: `AUDIT.md`):

| Yüzey | Durum |
| --- | --- |
| `/api/checkout` + rezervasyon sihirbazı | **Tahsilat YAPMAZ ve kart bilgisi İSTEMEZ.** Akış bir ön-rezervasyon talebi kaydeder; ödeme **Garanti BBVA Sanal POS** 3D Secure sayfasında ayrı adımda alınacak (karar + entegrasyon planı: `docs/odeme-karari.md`). PAN bu uygulamaya asla girmez. |
| `/api/swarm` | Deterministik advisory endpoint'tir. İzinli task tiplerini doğrular, payload sanitize eder, alt ajan önerileri döndürür; fiyat, ödeme, paid media veya booking action **çalıştırmaz**. |
| `/api/v1/availability` | `B2B_PARTNER_PUBLIC_KEY` env tanımlı değilse **404** döner (varsayılan kapalı). Partner anahtarı olsa bile canlı inventory kaynağı yoksa **503 manual_required** döner; statik demo cevapları yalnız `B2B_ALLOW_STATIC_AVAILABILITY=true` ile production dışında çalışır. İstekler `x-partner-id`, `x-request-timestamp` ve `x-b2b-signature` ister; imza `timestamp.body` kanonik metni üzerinden ECDSA/SHA-256 ile doğrulanır ve replay engellenir. |
| `/admin/growth` | Payload admin rolü zorunludur; metrikler simülasyondur. |

## CI

`.github/workflows/ci.yml`: her push/PR'da **release gate manifest → audit → lint → typecheck → vitest(unit) → build → launch smoke → Playwright e2e/security/a11y → Lighthouse CI**.
Kırmızı pipeline'da merge etmeyin. `lib/env.ts` `CI=true` iken zorunlu secret kontrolünü atlar;
bu sayede CI build'i secret'sız çalışır.

## Deploy

Birincil hedef **Vercel**'dir (env değişkenleri Vercel panelinden yönetilir).
`railway.json` alternatif/legacy hedef olarak durur; aktif kullanılmıyorsa silinebilir.

## Rollback (acil geri dönüş)

Yayında kritik hata görülürse sıralama:

1. **Vercel instant rollback** (saniyeler içinde): Vercel panel → Deployments →
   son sağlıklı deployment → "… → Promote to Production". Kod değişikliği gerektirmez.
2. **Git revert** (kalıcı düzeltme): `git revert <kötü-commit-sha> && git push origin main`
   — CI yeşilse Vercel otomatik yeniden yayınlar. `git reset --hard` + force push KULLANMAYIN
   (paylaşılan main geçmişini bozar).
3. **Webhook/ödeme tarafı şüphesi**: önce `NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` env'ini
   boşaltmak embed'i devre dışı bırakır (site WhatsApp + talep formu fallback'ine döner) —
   tam rollback'ten daha az yıkıcı bir ilk müdahaledir.

Rollback sonrası: `docs/launch-readiness.md` go-live protokolündeki smoke adımlarını
(ana sayfa, `/rezervasyon`, `/api/health`) tekrar koşun.
