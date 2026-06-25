# Yorum Orkestrasyon Katmanı — Operasyon Rehberi

Kozbeyli Konağı çoklu-kaynak yorum sistemi. Toplama + normalize + moderasyon +
güvenli gösterim. Google-güvenli ve KVKK-uyumlu.

## Kaynak davranışı (2026 doğrulaması)
| Kaynak | Yöntem | Public'te |
|---|---|---|
| Google Business Profile | OTOMATİK (OAuth2, kendi işletmen) | puan + metin + atıf |
| Booking.com | MANUEL (onaysız metin yasak) | yalnız puan + link |
| ETS Tur / Jolly / Hotels.com | MANUEL (public API yok) | puan + (ops.) kısa metin + link |
| Tripadvisor | OPSİYONEL (lisans + metin gizleme) | puan + link |
| First-party (konaklama-doğrulamalı) | kendi form | tam yorum + puan |

Otomatik senkronu olan **tek kaynak Google**'dır. Diğerleri Payload admin'den elle eklenir.

## 1) DB migration (yeni collection'lar)
Yeni Payload collection'ları (review-sources, review-items, review-publication-rules,
review-moderation-events) Postgres tabloları gerektirir. Deploy sonrası bir kez:
```
# prod migration disiplinine gore:
npx payload migrate
# veya dev push modunda Payload tablolari otomatik olusturur
```
`npx payload generate:types` repo'da çalıştırıldı (payload-types.ts güncel).

## 2) Örnek veriyle başlat (opsiyonel)
```
npx tsx scripts/seed-reviews.ts
```
Her kaynak tipinden örnek bir kaynak + birkaç `pending` örnek yorum ekler.
Buradaki metinler "örnek"tir; gerçek-dışı iddia içermez.

## 3) Moderasyon akışı
- Yeni yorumlar `status=pending` gelir (otomatik yayın YOK).
- Payload admin'de review-items: `publish` (yayınla) / `hide` / `flag` / `unflag`.
- Her aksiyon review-moderation-events'e audit kaydı yazar.
- Yayın durumu değişince public widget cache'i (`revalidateTag("reviews")`) tazelenir.
- Programatik: `POST /api/review-moderation/{id}` (Authorization: Bearer REVIEWS_ADMIN_TOKEN),
  body `{ "action": "publish" }`.

## 4) Google senkronu (erişim onayı gerektirir)
1. 60+ gündür doğrulanmış bir Google Business Profile.
2. GCP projesi + Business Profile API erişim BAŞVURUSU (yeni kota başlangıçta 0).
   Web sitesi domain'i başvuru e-posta domain'iyle eşleşmeli. Onay birkaç gün–hafta.
3. OAuth 2.0 (API key DEĞİL). Şu env'leri Vercel'e gir (repoya/sohbete YAZMA):
   `GOOGLE_BUSINESS_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN`, `GOOGLE_BUSINESS_ACCOUNT_ID`,
   `GOOGLE_BUSINESS_LOCATION_ID`.
4. `CRON_SECRET` gir → gece cron (`vercel.json` → `/api/cron/sync-google`, 03:00) çalışır.
   Manuel: `POST /api/review-refresh/google` (Authorization: Bearer REVIEWS_ADMIN_TOKEN).
5. Konfigüre değilken adapter **no-op** (yorum çekmez, siteyi etkilemez).
6. v4 reviews endpoint imzası resmi dokümandan doğrulanmalı; kod modülerdir ve hata
   olursa gracefully boş döner.

## 5) Booking metni / Tripadvisor metni (varsayılan KAPALI)
- Booking yorum METNİ ancak **yazılı partner onayı** varsa: `NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL=true`.
  Onay yoksa Booking için yalnız puan rozeti + link (varsayılan).
- Tripadvisor metni ancak içerik lisansıyla (harici JS + robots-bloklu yol + Ollie logo/atıf).

## 6) JSON-LD (Google-güvenli)
- `src/lib/schema.ts` `hotelSchema()`: `Hotel` + `BreadcrumbList`; `sameAs` env'den
  (`BRAND_PROFILE_URLS`, virgülle ayrık gerçek profil URL'leri).
- **Üçüncü-taraf puanları yıldız/yorum yapısal verisi olarak İŞARETLENMEZ** (Google
  self-serving review politikası → manuel ceza riski). Yalnız kendi first-party
  doğrulanmış yorumların için ayrı yapısal veri düşünülebilir; yıldız garanti değil.

## 7) KVKK / GDPR
- Yazar adı maskelenir (`maskAuthor`: "Ayşe K."); fotoğraf saklanmaz.
- Silme/düzeltme: admin'de yorumu `hidden` + gerçek silme; audit kaydı.
- Gizlilik metnine bir satır eklenmeli: üçüncü taraf kamuya açık değerlendirmeler
  kaynağına atıfla ve minimum kişisel veriyle gösterilir.

## API uçları
- `GET /api/review-summary` — kaynak bazında + genel ortalama (public, cache).
- `GET /api/review-cards?limit=6` — yayındaki kartlar (public, displayPolicy uygulanır).
- `POST /api/review-refresh/google` — admin yenileme (Bearer REVIEWS_ADMIN_TOKEN).
- `POST /api/review-moderation/{id}` — moderasyon (Bearer REVIEWS_ADMIN_TOKEN).
- `GET  /api/review-health` — kaynak sync durumu (Bearer REVIEWS_ADMIN_TOKEN).
- `GET  /api/cron/sync-google` — Vercel Cron (Bearer CRON_SECRET).
