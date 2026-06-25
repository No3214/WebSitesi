# Review Orkestrasyon — Canlı Doğrulama (2026-06)

Commit: `467d12c` (Wave 5). Vercel production: **READY**
(dpl_CuVHwNpox88A71P3hZoiq7LZ9zw8).

## Otomatik kapılar
- `tsc --noEmit`: **TSC_OK**
- `vitest run --project unit`: **478 passed / 478** (81 test dosyası)

## Canlı (www.kozbeylikonagi.com)
| Kontrol | Sonuç |
|---|---|
| `GET /api/review-summary` | `{ overall: { average: 0, count: 0 }, bySource: {} }` — graceful boş |
| `GET /api/review-cards?limit=6` | `{ cards: [] }` — graceful boş |
| `POST /api/review-refresh/google` (auth'suz) | tarayıcı eklentisi "sensitive key" bloğu; fail-closed bearer kontrat testiyle kanıtlı |
| Ana sayfa console | hata yok |
| Rezervasyon sayfası console | hata yok |
| ReviewSummary (ana sayfa) | count=0 → hiçbir şey render etmez (tasarım gereği) |
| ReviewBanner (rezervasyon) | count=0 → hiçbir şey render etmez |

## Yorum
Henüz yayında yorum yok (yeni Payload collection'ları prod DB'de migrate edilince
+ admin'den/Google senkronundan yorum geldikçe widget'lar otomatik dolar). Boş
durumda kaynak HTML'de üçüncü-taraf yorum METNİ bulunmaz → yasal-güvenli.
Rezervasyon butonu fildişi yazı + zengin altın gradient ile doğrulandı.

## Sıradaki operasyon adımı (kullanıcı tarafı)
1. Prod DB migration: `npx payload migrate` (yeni 4 collection).
2. (Ops.) `npx tsx scripts/seed-reviews.ts` örnek veriyle test.
3. Google erişimi onaylanınca OAuth env'leri + `CRON_SECRET` Vercel'e gir.
