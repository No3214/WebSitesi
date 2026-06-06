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
| `NEXT_PUBLIC_HOTELRUNNER_SLUG` | HotelRunner widget/entegrasyon kimliği | HotelRunner paneli > hesap slug'ı |
| `HOTELRUNNER_WEBHOOK_SECRET` | HotelRunner webhook imza doğrulama sırrı | HotelRunner webhook ayarlarında tanımlanan secret |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID | GTM paneli (`GTM-XXXXXXX`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta (Facebook) Pixel kimliği | Meta Events Manager |
| `GOOGLE_SITE_VERIFICATION` | Search Console site doğrulama meta etiketi | Google Search Console > Ownership verification |
| `FACEBOOK_DOMAIN_VERIFICATION` | Meta alan adı doğrulama etiketi | Meta Business Manager > Brand Safety > Domains |
| `GOOGLE_MAPS_URL` | İşletmenin Google Haritalar linki | Google Maps > Paylaş > Bağlantıyı kopyala |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile bot koruması (istemci) | Cloudflare Dashboard > Turnstile > Site key |
| `TURNSTILE_SECRET_KEY` | Turnstile sunucu tarafı doğrulama anahtarı | Cloudflare Dashboard > Turnstile > Secret key |
| `AI_PROVIDER` | AI Concierge sağlayıcısı (`none` = kapalı) | Manuel; `none` bırakılırsa kurallı fallback çalışır |
| `AI_API_KEY` | AI sağlayıcı API anahtarı | OpenAI uyumlu sağlayıcının panelinden |
| `AI_BASE_URL` | AI API uç noktası | Varsayılan `https://api.openai.com/v1`; uyumlu proxy de olabilir |
| `AI_MODEL` | Kullanılacak model adı | Sağlayıcı dokümantasyonu (varsayılan `gpt-4o-mini`) |
| `AI_TIMEOUT_MS` | AI isteği zaman aşımı (ms) | Manuel (varsayılan `12000`) |
| `AI_MAX_OUTPUT_TOKENS` | AI yanıtı için maksimum token | Manuel (varsayılan `500`) |
| `AI_TEMPERATURE` | AI yanıt yaratıcılık katsayısı | Manuel (varsayılan `0.4`) |

Not: `NEXT_PUBLIC_` öneki olan değişkenler tarayıcıya açılır; sır içeren değerleri bu önekle tanımlamayın.

## Komutlar

```bash
npm run dev                      # Geliştirme sunucusu (port 3000)
npm run build                    # Üretim derlemesi
npm run start                    # Üretim sunucusu (port 3000)
npm run lint                     # ESLint
npm run payload:types            # Payload tip üretimi (payload-types.ts)
npm run seed                     # Örnek içerik tohumlama (scripts/seed.mjs)
npm run storybook                # Storybook (port 6006)
```

### Testler

```bash
npx vitest run --project unit    # Unit testler (free-apis, sitemap, güvenlik vb.)
npx playwright test              # E2E testler (lokal sunucuya karşı)

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
- **Timing-safe webhook**: HotelRunner webhook'u (`src/app/api/webhook/hotelrunner/route.ts`) imzayı sabit zamanlı karşılaştırma ile doğrular; zamanlama saldırılarına kapalıdır.
- **ECC imza doğrulama**: `src/lib/security.ts` içindeki `verifyEs256Signature`, ES256 (ECDSA, NIST P-256 + SHA-256) imzalarını SPKI PEM public key ile doğrular; gelecekteki imzalı entegrasyonlar için hazırdır.
- **Bot koruması**: Form uç noktaları Cloudflare Turnstile ile korunabilir (env anahtarları girildiğinde aktifleşir).

## Deploy

### Vercel (önerilen)

1. Repoyu Vercel'e bağla (framework otomatik Next.js algılanır).
2. Yukarıdaki tablodaki tüm env değişkenlerini Vercel panelinden (Project > Settings > Environment Variables) gir.
3. `DATABASE_URI` için Supabase connection pooler adresini kullan.
4. Deploy sonrası `NEXT_PUBLIC_SITE_URL` değerini canlı alan adıyla güncelle.

`NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` boşken de site sorunsuz yayınlanır; rezervasyon CTA'ları WhatsApp'a yönlenir.

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

API uç noktaları: `/api/local-pulse`, `/api/chat`, `/api/lead`, `/api/llm-context`, `/api/webhook/hotelrunner`, `/llms.txt`.
