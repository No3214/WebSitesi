# search_local_seo Gate Runbook — GSC + GBP + Free Booking Links

Amaç: health'teki son "kolay" gate'i kapatmak ve Google yüzeylerinde direct
booking altyapısını açmak. Hazırlanma: 2026-07-02, canlı problarla.
Strateji katmanı: `docs/local-seo-google-business-plan.md` + kozbeyli-growth
skill (`references/gbp-local.md`). Bu dosya yalnız YÜRÜTME adımlarıdır.

## Gate'in kod tanımı (kanıt)

`src/lib/production-readiness.ts`:

```ts
{ id: "search_local_seo", requiredEnv: ["GOOGLE_SITE_VERIFICATION"] }
```

Tek koşul: Vercel Production'da anlamlı (placeholder olmayan)
`GOOGLE_SITE_VERIFICATION` değeri. 2026-07-02 canlı probu: meta etiketi YOK →
gate bloklu. Diğer teknik ön koşullar HAZIR: robots.txt sağlıklı (admin/api
disallow, OAI-SearchBot allow), sitemap.xml 55 URL, Hotel+FAQ schema canlı.

## Kanonik NAP (tek doğruluk kaynağı — canlı schema'dan, 2026-07-02)

Her platformda (GBP, TripAdvisor, OTA'lar, dizinler) BİREBİR bu değerler:

| Alan | Değer |
| --- | --- |
| Ad | Kozbeyli Konağı Taş Otel & Restaurant |
| Adres | Kozbeyli Köyü Küme Evler No:188, Foça, İzmir 35680 |
| Telefon | +90 532 234 26 86 |
| Web | https://www.kozbeylikonagi.com |

## ADIM 1 — GSC doğrulama + sitemap (15 dk, bugün) — Yunuscan

1. https://search.google.com/search-console → "URL öneki" →
   `https://www.kozbeylikonagi.com`
2. Doğrulama yöntemi: **HTML etiketi** → `content="..."` değerini kopyala
   (yalnız değer, tırnaksız).
3. Vercel → kozbeyli-konagi → Settings → Environment Variables →
   `GOOGLE_SITE_VERIFICATION` = değer, Environment: **Production** → Save →
   **Redeploy** (Deployments → son main → Redeploy).
4. Deploy READY sonrası GSC'de "Doğrula".
5. GSC → Sitemaps → `https://www.kozbeylikonagi.com/sitemap.xml` gönder.

Doğrulama:

```powershell
(Invoke-WebRequest https://www.kozbeylikonagi.com).Content -match 'google-site-verification'
(Invoke-RestMethod https://www.kozbeylikonagi.com/api/health).readiness.runtimeConfiguration.blockedGates
# beklenen: search_local_seo listede YOK
```

## ADIM 2 — GBP sahiplenme (başvuru bugün; Google onayı gün/hafta) — Yunuscan

1. https://business.google.com → işletme ara: "Kozbeyli Konağı" — mevcut
   kayıt varsa **sahiplen**, yoksa oluştur.
2. Kategori: birincil **Otel**; ikincil **Restoran**. NAP yukarıdaki tabloyla
   birebir; web sitesi `https://www.kozbeylikonagi.com` (utm'siz).
3. Doğrulama yöntemi çıkarsa (video/telefon/posta) hemen başlat — kritik yol.
4. Onay sonrası ilk 48 saat: 20+ gerçek fotoğraf (dış cephe, avlu, odalar,
   kahvaltı; `docs/design/media-usage-inventory.md` envanterinden), çalışma
   saatleri, özellikler (ücretsiz otopark/wifi/kahvaltı), Rezervasyon linki =
   HMS booking engine URL'i.
5. Haftalık ritim: kozbeyli-growth `references/gbp-local.md` (haftada ~30 dk:
   1 post + foto + yorum yanıtları). Yorum akışı:
   `docs/reviews-orchestration-README.md` (hedef: 90 günde +30).

## ADIM 3 — Free Booking Links (GBP onayı sonrası İLK iş) — Yunuscan + Claude

Gereksinim: GBP + gerçek zamanlı fiyat/uygunluk feed'i gönderen connectivity
partner. Bizim aday: **HMS Otel** (mevcut booking engine).

1. HMS paneli → entegrasyonlar/kanallar → "Google", "Google Hotel Ads",
   "Hotel Center" veya "Free Booking Links" ara.
   - VARSA: aktive et, otel eşleştirmesini (GBP kaydıyla) onayla.
   - Panelde YOKSA: HMS destek talebi aç — şablon: "Google Hotel Center
     connectivity partner mısınız? kozbeylikonagi.com için Free Booking
     Links fiyat feed'i açmak istiyoruz. Değilseniz ARI feed'i hangi partner
     üzerinden verebiliriz?" Partner listesi:
     https://developers.google.com/hotels/connectivity-partners
2. Feed açılınca Google otel modülünde site linki "Resmi site" etiketiyle
   çıkar — tıklama başı ücret yok. Kontrol: Google'da "Kozbeyli Konağı" ara →
   otel modülü → fiyat listesinde kozbeylikonagi.com satırı.
3. Feed doğrulandıktan sonra (ayrı karar): Hotel Ads/metasearch bütçesi —
   kozbeyli-growth `references/google-ads.md`.

## Sorumluluk ve sınırlar

Hesap açma/credential girme işlemleri owner'da (kozbeyli-growth guardrail).
Claude: prob, doğrulama komutları, feed sonrası canlı kontrol, GSC kapsam
raporu yorumlama. Env değeri sırdır; `.env` dosyasına yazılmaz, yalnız Vercel.

## Kapanış ölçütü

`/api/health` → `blockedGates` içinde `search_local_seo` yok + GSC'de sitemap
"Başarılı" + GBP "Yayında" + otel modülünde "Resmi site" linki görünür.
