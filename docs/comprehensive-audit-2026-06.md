# Kapsamlı Proje Denetimi — 2026-06 (A→Z)

Kapsam: kod kalitesi, güvenlik, route güvenliği, secrets, SEO, a11y, içerik
doğruluğu, tip güvenliği, hata yönetimi, Vercel + Supabase kurulumu, admin.
Yöntem: iki bağımsız keşif ajanı + canlı prod yoklama + Supabase/Vercel MCP +
repo'nun kendi `*:verify` readiness script'leri. Yalnız KANITLANAN bulgular.

## Karar
Mühendislik kalitesi yüksek. **Tek gerçek blocker:** Payload CMS şeması prod
veritabanına kurulmamış → admin paneli fonksiyonel değil. Düzeltildi (aşağıda).
Yanlış-pozitif bir "env.ts truncated" iddiası doğrulandı ve REDDEDİLDİ (dosya
102 satır, eksiksiz; tsc + 478 test + Vercel READY zaten kanıt).

## 1. Admin / Veritabanı (BLOCKER → düzeltildi)
- Kanıt: `GET /api/users` ve `/api/payload-preferences` → **HTTP 500**; `/admin`
  → 200 ama `admin:verify` canlı kontrolü `live_payload_admin_dependency_ready`
  **FAIL** ("controlled dependency-unavailable screen"). Supabase `WebSitesi`
  DB'sinde Payload tabloları YOK (yalnız ilgisiz 4 tablo var), `migrations: []`.
- Kök neden: `@payloadcms/db-postgres` prod'da `push` varsayılan KAPALI; migration
  çalıştırılmamış → şema hiç oluşmamış. Admin kodu bunu zarifçe yakalayıp kontrollü
  "bağımlılık yok" ekranı gösteriyor (çökme yok — iyi tasarım).
- Düzeltme: `payload.config.ts` → `push: true` + `migrationDir`. İlk boot'ta tüm
  collection tabloları oluşur. DB'de Payload verisi olmadığı için güvenli.
- Detay + RLS/anon-REST güvenliği: `docs/supabase-vercel-setup.md`.

## 2. Güvenlik başlıkları / CSP — TEMİZ
`next.config.ts`: CSP (prod'da `unsafe-eval` yok), X-Frame-Options SAMEORIGIN,
X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin,
Permissions-Policy (camera/mic/geo kapalı), HSTS 2y preload. Wildcard yok.

## 3. Route güvenliği — TEMİZ (16 route)
Yazma/hassas uçların hepsi korumalı: checkout (rate-limit + same-origin + Zod,
kart alanı reddi), lead (rate-limit + Turnstile), webhook/iyzico + webhook/
hotelrunner (HMAC/ES256 imza + replay), v1/availability (ECC imza + replay +
timestamp), review-refresh/moderation/health (Bearer REVIEWS_ADMIN_TOKEN, fail-
closed), cron/sync-google (Bearer CRON_SECRET). Public uçlar (summary/cards/
health/local-pulse) hassas veri sızdırmıyor.

## 4. Secrets — TEMİZ
`process.env` yalnız `env.ts`/`public-env.ts` + config'te. NEXT_PUBLIC_* yalnız
public ID. Sunucu sırrı "use client" dosyalarında yok. Hardcoded token yok.

## 5. SEO — GÜÇLÜ (kod tarafı)
robots `/admin` + `/api` disallow + sitemap işaret. sitemap: canonical + hreflang
(TR/EN) + lokasyon + Foça rehber rotaları + oda rotaları. LocalBusiness yapısal
veri NAP + adres + koordinat + harita içeriyor; üçüncü-taraf yıldız/yorum/ödül
İDDİASI YOK (truthfulness PASS). Operasyonel boşluk: `GOOGLE_SITE_VERIFICATION`
env + GBP/Search Console (repo dışı). Plan: `docs/local-seo-google-business-plan.md`.

## 6. Erişilebilirlik — 1 düzeltme
`/en/*` sayfalarda `<html lang>` "tr" kalıyordu (kök layout). `EnLocaleSync`
artık `document.documentElement.lang="en"` yapıp segmentten çıkınca "tr"ye
döndürüyor. Diğer a11y iyi: skip-link, alt metinleri, aria-label'lar, label'lar.

## 7. İçerik doğruluğu — İNCELE (yasal)
Tarihsel iddialar tutarlı ve marka-tarafından sağlanmış: "19. yüzyıl tescilli",
"1870–1891", "beş asırlık köy dokusu", "2012 restorasyonu", "Horasan harcı /
andezit". Bunlar uydurma DEĞİL (marka context'inden); yine de resmî tescil/
restorasyon kayıtlarıyla bir kez insan-doğrulaması önerilir. Sahte yorum/yıldız/
ödül YOK. Fiyat garantisi/sağlık iddiası YOK. Yorumlar dinamik API'den (sabit
sahte metin yok).

## 8. Tip güvenliği / hata yönetimi — GÜÇLÜ
`any` kullanımları yalnız Payload/Next entegrasyon kalıplarında ve belgeli.
Client fetch'lerin hepsi try/catch veya `.catch` ile graceful. Riskli `!` yok.

## 9. Bağımlılıklar — TEMİZ
Next 15.5, React 19, Payload 3.85, TS 5.7, Node 24. Remotion devDep. Terk edilmiş/
çift state lib yok.

## Uygulanan düzeltmeler (bu tur)
1. Payload `push:true` + `migrationDir` → admin şeması kurulur.
2. `EnLocaleSync` → `/en` için `<html lang=en>`.
3. Supabase advisor bulguları + güvenli remediation → `docs/supabase-vercel-setup.md`.
4. Local SEO/GBP aksiyon planı → `docs/local-seo-google-business-plan.md`.

## Kasıtlı olarak DOKUNULMAYAN (güvenlik gereği)
Supabase `public` şemasındaki ilgisiz 4 tablonun (organizations/…/restaurants)
RLS policy ve fonksiyonları: web sitesine ait değil, boş, ayrı bir auth modeli +
gizli bir mantık hatası içeriyor (`me.organization_id = me.organization_id`).
Sahibi olmadığımız güvenlik mantığını kör değiştirmek yerine kesin SQL ile
raporlandı (bkz. supabase-vercel-setup.md). "Sistem patlamasın" ilkesi.
