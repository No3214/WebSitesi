# Reklam Paketi ↔ Web Sitesi Eşleştirmesi (kozbeyli-ads-claude-starter-v3)

Bu doküman, yüklenen reklam başlangıç paketini sitenin MEVCUT tracking durumuyla
eşleştirir. Özet: sitenin ölçüm tarafı büyük ölçüde HAZIR; paketteki website
tracking dosyaları siteye KOPYALANMADI çünkü site zaten eşdeğer (çoğu yerde daha
sağlam) implementasyona sahip. Paketin asıl değeri reklam-operasyon katmanında
(guardrails, MCP, RSA/kreatif) ve doğrulama adımlarında.

## 1) Kimlikler — BAĞLI (Wave 2, `.env.production`)
| Kimlik | Paket değeri | Sitedeki durum |
|---|---|---|
| GA4 | `G-V3R66C3MEF` | bağlı (`NEXT_PUBLIC_GA4_MEASUREMENT_ID`) |
| Google Ads | `AW-800024713` | bağlı (`NEXT_PUBLIC_GOOGLE_ADS_ID`) |
| Meta Pixel | `1781546559309505` | bağlı (`NEXT_PUBLIC_META_PIXEL_ID`) |
| GTM | KCG6B4MJ / MSL2FLF5 (belirsiz) | `GTM-KCG6B4MJ` bağlı (aşağıya bak) |

Not: Public ID'ler `.env.production`'da (secret değil). Vercel env override önceliklidir.
Sunucu sırları (GA4_API_SECRET, ad-account token'ları) kodda DEĞİL, yalnız Vercel env.

## 2) Tracking — site zaten karşılıyor
- **Consent Mode v2 + GTM + Meta Pixel:** `src/components/tracking-scripts.tsx` (onay-bağlı).
- **Standart olaylar:** `src/lib/gtm.ts` → `view_item`/`begin_checkout`/`generate_lead`
  + Meta `ViewContent`/`InitiateCheckout`/`Lead`. (Paketteki `events.ts` ile aynı amaç.)
- **Purchase — SUNUCU TARAFLI (daha sağlam):** `src/lib/ga4-server.ts` `sendGa4Purchase`
  GA4 Measurement Protocol ile `transaction_id`+`value`+`currency` gönderir; HMS/iyzico
  webhook'undan beslenir. Bu, paketin önerdiği istemci-taraflı `hmshotel.net` onay sayfası
  snippet'ine göre üstündür: üçüncü-parti onay sayfasına kod enjekte etmeyi GEREKTİRMEZ ve
  çapraz-alan linker'a bağımlı değildir.
- **CSP:** `next.config.ts` connect-src zaten `hmshotel.net`, `google-analytics`,
  `connect.facebook.net`, `facebook.com`, googleads/doubleclick içerir.

## 3) Açık boşluklar (reklam optimizasyonu için)
1. **Meta Purchase eventi henüz ateşlemiyor.** GA4 purchase sunucu-taraflı var; Meta
   tarafı için ya HMS webhook'undan **Meta CAPI** (sunucu-taraflı, event_id ile dedup)
   ya da onay sayfasında istemci Pixel Purchase gerekir. Tercih: CAPI (çapraz-alan dışı).
2. **GTM konteyner doğrulaması.** Site artık `GTM-KCG6B4MJ` ateşler. GA4/Ads/Pixel
   etiketlerinin O konteynerde tanımlı olduğundan emin olun (Tag Assistant, paket docs/02).
   Aksi halde GTM dolu olduğu için doğrudan gtag bastırılır ve GA4/Ads sessiz kalır.
   Alternatif: Vercel'de `NEXT_PUBLIC_GTM_ID=""` → kod doğrudan gtag'e düşer (anında ateşler).

## 4) TEK kritik manuel adım (reklamdan ÖNCE)
**Test rezervasyonu** yapıp `{slug}.hmshotel.net` onay sayfasının / HMS webhook'unun
gerçek `transaction_id` + `value` + `currency` ürettiğini doğrulayın (paket docs/01).
- Üretiyorsa: `sendGa4Purchase` zaten devrede → GA4 purchase çalışır.
- Üretmiyorsa: **offline conversion import** (Google) + Meta offline/CAPI'ye geçilir.

## 5) Reklam-operasyon katmanı (paketin asıl katkısı) — GÜVENLİK
- `scripts/guardrails.py`, MCP yazma kapısı (`ADS_WRITES_ENABLED=false` varsayılan),
  bütçe sınırları, RSA/kreatif varlıkları: bunlar **kampanya yürütme** içindir, site kodu değil.
- **Yapılmayacaklar (bu oturumda):** Meta/Google reklam **yazma** MCP'lerini bağlamak,
  herhangi bir token/secret/refresh-token'ı sohbete veya repoya yazmak. Eksik kimlikler
  (Meta `act_...`, Google 10 hane, dev token) yalnız yerel `.env`'e (git-ignored) girilir.
- Meta resmî MCP (`mcp.facebook.com/ads`, okuma+yazma) ve Google resmî MCP (okuma) —
  bağlanırsa kullanıcı kendi OAuth'u ile bağlar; ajan token görmez.

## Sonuç
Web sitesi reklamlara ölçüm açısından hazır (ID'ler bağlı, olaylar + sunucu-taraflı
purchase + consent + CSP mevcut). Reklam açmadan önce yalnız **test rezervasyonu** ile
HMS purchase sinyali doğrulanmalı; istenirse Meta CAPI purchase eklenir (ayrı wave).
