# Kozbeyli Konağı — Kapsamlı Yol Haritası (2026-07)

Hazırlanma: 2026-07-01. Rev. v1.1 (aynı gün): tasarım/hareket araştırması (§3.5),
AEO platform ayrışması (§3.2), cüzdan ödemeleri (Faz 1.7) ve FAZ V görsel dönüşüm
eklendi. Yöntem: web-reach skill (canlı site probu, Jina Reader fetch, HN/GitHub
probu) + Tavily/WebSearch araştırması + repo/health kanıtları. Kural: kanıt yoksa
"kanıt yok".

---

## 1. Yönetici Özeti

Site **canlıda**: `https://www.kozbeylikonagi.com` Vercel üzerinden yeni Next.js
uygulamasını servis ediyor (title doğrulandı), apex `308 → https://www` ile temiz
yönleniyor. Haziran ortasındaki "canonical gate NO-GO" durumu **çözülmüş**.

`/api/health` readiness kanıtı (2026-07-01T20:03Z):

- **Tamamlanan gate'ler (3):** `canonical_domain`, `production_database`, `hms_booking_engine`
- **Bloklu gate'ler (4):** `production_abuse_controls` (4 env eksik), `garanti_pos`
  (5 env eksik), `analytics_purchase`, `search_local_seo`

Tek cümlelik hedef: **4 bloklu gate'i kapatıp uçtan uca gerçek rezervasyon + ödeme +
purchase ölçümünü kanıtlamak; ardından dönüşüm ve AEO/GEO ile direct booking payını
büyütmek.** Kod tarafında büyük iş kalmadı; kalan işlerin çoğu operasyonel/kod-dışı.

---

## 2. Kanıtlı Mevcut Durum

### 2.1 Canlı ortam (bugün probe edildi)
| Kontrol | Sonuç | Kanıt |
| --- | --- | --- |
| Apex redirect | `https://kozbeylikonagi.com` → 308 → `https://www.../` | curl, `server: Vercel`, `x-vercel-id: fra1::...` |
| Ana sayfa | Yeni uygulama, `<title>Kozbeyli Konağı | Foça Taş Butik Otel & Restoran</title>` | curl |
| Health | `status: ok`, runtime nodejs | `GET /api/health` |
| Readiness | `blocked` — 4 gate eksik | health JSON `readiness.runtimeConfiguration` |

### 2.2 Kod tabanı olgunluğu (repo kanıtları)
- Next.js 15 + Payload 3 + Supabase + Tailwind 4; TR/EN i18n (44 URL, 32 hreflang),
  sitemap, schema.org (hotel + FAQ 23 Q&A + numberOfRooms + turizm lisansı).
- Test altyapısı: unit/e2e/a11y/monkey/chaos/stress + Lighthouse CI + brand:verify.
- Güvenlik: CSP baseline, webhook HMAC + ES256, consent-gated analytics (GTM, Meta
  Pixel, PostHog EU).
- AEO: 22 test sorgulu AI görünürlük ölçüm sistemi + baseline (`docs/aeo-ai-visibility-tracking.md`).
- Son commit'ler: CTA wave divider, AEO genişletme, payment error alert, CSP.

### 2.3 Bloklu gate detayı (health JSON)
| Gate | Eksik | Ne gerekiyor |
| --- | --- | --- |
| `production_abuse_controls` | 4/4 env eksik | Rate-limit/abuse env'leri (Upstash veya eşdeğeri) Vercel prod'a |
| `garanti_pos` | 5/5 env eksik | `GARANTI_MERCHANT_ID`, `TERMINAL_ID`, `PROVISION_USER`, `3D_STORE_KEY`, `POS_MODE` — banka başvurusu kullanıcıda |
| `analytics_purchase` | doğrulanmadı | Prod'da gerçek purchase event'inin GTM/PostHog'da görünmesi |
| `search_local_seo` | doğrulanmadı | GSC doğrulama + GBP + Hotel Center |

---

## 3. Araştırma Bulguları (2026 sinyalleri, kaynaklı)

### 3.1 Direct booking ekonomisi
- Bağımsız otellerde OTA payı 2025'te **%63.4**'e çıktı (Cloudbeds, 90M rezervasyon,
  180 ülke); OTA iptal oranı **%21.8** vs direct **%10.6**. Komisyon %15-30 vs direct
  edinim maliyeti %2-5; direct misafir LTV'si ~**%60 daha yüksek**.
- Otel sitesi CVR benchmark 2026: ortalama **%2.2-3.9**, iyi optimize butik oteller
  **%5+**. %4+ "güçlü" kabul ediliyor.
- Billboard etkisi canlı: OTA'da bulup **%18**'i direkt sitede rezervasyona dönüyor
  (3.3 puan artış). Direct kanalların 2030'da OTA'ları geçmesi öngörülüyor.
- Mobil: araştırmanın %75+'ı mobilde; kazananlar **≤3 adımlı checkout + dijital
  cüzdan + minimum form alanı** kullanıyor.

### 3.2 AEO / GEO (AI görünürlüğü)
- Gezginler ChatGPT/Gemini/Perplexity/Claude/Copilot'a soruyor; AI "10 mavi link"
  değil **kısa shortlist** dönüyor. Shortlist'e girme faktörleri: entity netliği,
  FAQ + structured data, güvenilir seyahat sitelerinden bahisler (mentions), tutarlı
  NAP, tarif edilebilir "hikaye".
- Butik oteller için fırsat: alan eşitleniyor; özgün anlatı (taş ev, Kozbeyli köyü,
  Antakya mutfağı) AI sistemlerine makine-okur formatta verilirse bağımsız otel zincire
  karşı avantajlı. Projedeki 22-sorgu baseline bu yüzden değerli — kadanslı ölçüme dön.
- **Platform ayrışması (2026-07 taraması):** Gemini otel atıflarının ~%52'sini
  marka-sahipli sitelerden alıyor; ChatGPT üçüncü taraf dizin/derleyicileri,
  Perplexity ise ağırlıkla TripAdvisor'ı kaynak gösteriyor. Küresel otel envanterinin
  yalnız ~%16'sı bu üç platformda görünür. Sonuç: site içi AEO tek başına yetmez —
  TripAdvisor/GBP/dizin profillerinin NAP + içerik tutarlılığı Faz 2.3'ün ön koşulu.
  ([ProStay AEO](https://www.prostay.com/blog/ai-search-optimization-for-hotels/),
  [RevPARGenius](https://revpargenius.com/insights/aeo-for-hotels-guide-2026),
  [Hospitality Net](https://www.hospitalitynet.org/news/4132060/hotels-can-win-visibility-with-agent-engine-optimization-aeo))

### 3.3 Google Free Booking Links (ücretsiz metasearch)
- GBP listing + gerçek-zamanlı fiyat/uygunluk gönderen bir connectivity partner
  (HMS/channel manager) yeterli; tıklama başı ücret yok, otel sitesine giden link
  **"Resmi site"** etiketi alıyor. `search_local_seo` gate'i ile birleştirilecek en
  yüksek kaldıraçlı iş.

### 3.5 Tasarım / hareket platform sinyalleri (FAZ V girdisi)
- Butik otelde kazanan görsel dil: dergi/editorial yerleşim, güçlü tipografi,
  yaşam-tarzı fotoğrafçılığı (Hoxton, Casa Cook örnekleri); immersive hikâye ancak
  sürtünmesiz booking ile birlikte kazanıyor.
  ([Mediaboom](https://mediaboom.com/news/hotel-website-design-trends/),
  [Hooray Lab](https://lab.hooray.agency/12-must-follow-hotel-website-design-trends-in-2026/))
- Ödüllü otel siteleri (Awwwards hotel kategorisi) kinetik tipografi + scroll-anlatı
  kullanıyor; core booking route'unda ağır WebGL yok.
  ([Awwwards](https://www.awwwards.com/websites/hotel-booking/))
- Platform olgunlaştı — yeni kütüphane gerekmez: **View Transitions API** same-document
  Baseline 2025 (Firefox 144 ile tüm büyük tarayıcılar); **CSS scroll-driven animations**
  2026'da geniş destek, `@supports` ile progressive enhancement önerisi.
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations),
  [caniuse](https://caniuse.com/mdn-css_properties_animation-timeline_scroll),
  [Firefox 144](https://www.firefox.com/en-US/firefox/144.0/releasenotes/))
- Repo doğrulaması (2026-07-01): `animations.tsx` yardımcıları (Stagger/Parallax/
  RevealLines) ÇALIŞIR durumda; `gastronomy-editorial.tsx` mevcut; `unoptimized`
  yalnız 3 dosyada. Eski "no-op helper" iddiaları güncel değil — görsel sprint
  promptu buna göre düzeltildi (v2).

### 3.4 Rakip seti (Foça/Kozbeyli)
- kucukoteller.com.tr Foça sayfası (Jina Reader ile çekildi) bölgedeki butik seti
  listeliyor; Kozbeyli Konağı obilet, hotels.com, balnet gibi OTA'larda görünüyor.
  Rakiplerin çoğunda zayıf nokta: yavaş site, karmaşık navigasyon, OTA'ya tam bağımlılık
  (Reddit sinyali: bozuk UX güveni hızla düşürüyor — `docs/last30days-hotel-web-signals.md`).
- Aksiyon: OTA listing'leri "billboard" olarak optimize et (fotoğraf/parite), dönüşümü
  siteye çek. Mevcut `docs/ota-listing-master.md` planıyla uyumlu.

---

## 4. Fazlı Yol Haritası

### FAZ 0 — Launch Gate'lerini Kapat (Bu hafta, 1-7 Temmuz)
Hedef: health `readiness.status: ready`; uçtan uca 1 gerçek rezervasyon kanıtı.

| # | İş | Sahip | Kanıt kriteri |
| --- | --- | --- | --- |
| 0.1 | `production_abuse_controls` env'lerini Vercel prod'a ekle | Yunuscan + Claude | health'te gate `ready:true` |
| 0.2 | Garanti Sanal POS bilgilerini al (banka süreci) → 5 env + `production` mode | Yunuscan (banka) | test kartı ile 3D akışı, sonra gerçek düşük tutarlı işlem |
| 0.3 | HMS canlı rezervasyon UAT: gerçek tarih/oda ile booking engine akışı | Yunuscan + Claude | UAT kaydı `docs/evidence/` altına |
| 0.4 | Purchase event prod doğrulaması (GTM preview + PostHog canlı event) | Claude | `analytics_purchase` gate ready |
| 0.5 | GSC doğrulama (`GOOGLE_SITE_VERIFICATION`) + sitemap submit | Claude | GSC'de 44 URL keşfi |
| 0.6 | GBP (Google Business Profile) sahiplenme/doğrulama | Yunuscan (posta/tel) | GBP yayında, NAP tutarlı |
| 0.7 | `npm run domain:verify` + Lighthouse prod koşusu → kanıt dosyaları | Claude | `docs/evidence/` güncel |

Bağımlılık: 0.2 ve 0.6 kullanıcı aksiyonu; banka/Google gecikmesi kritik yol.

### FAZ 1 — Dönüşüm Optimizasyonu (Hafta 2-4, Temmuz)
Hedef: CVR baseline ölç → %2.5+ taban; mobil funnel sürtünmesini düşür.

- 1.1 Rezervasyon funnel'ını PostHog'da adım adım işaretle (view → tarih seçimi →
  oda → ödeme → purchase); drop-off raporu.
- 1.2 Mobil checkout denetimi: adım sayısı ≤3, form alanı minimizasyonu, klavye
  tipleri, hata mesajları (payment error alert zaten eklendi — canlıda doğrula).
- 1.3 Direct-booking teşvik bloğu: "Resmi siteden: ücretsiz erken check-in / köy
  kahvaltısı ikramı / en iyi fiyat garantisi" — OTA parite ihlali yaratmadan perk bazlı.
- 1.4 Güven sinyalleri: gerçek misafir yorumları (Google/OTA'dan derlenmiş, izinli),
  turizm lisans no, güvenli ödeme rozetleri; oda sayfalarına yorum snippet'i.
- 1.5 Fiyat karşılaştırma yaklaşımı: OTA fiyatına karşı "sitede daha iyi koşul"
  mesajı (widget veya statik karşılaştırma).
- 1.6 Görsel performans: gerçek çekim medya optimizasyonu (mevcut media-placement-audit
  planına göre); LCP < 2.5s mobil hedefi Lighthouse CI'da zorunlu kıl.
- 1.7 Dijital cüzdan: Garanti akışında Apple Pay / Google Pay fizibilitesi; hedef
  mobil ödemelerin %30-50'si cüzdanla ([ProStay](https://www.prostay.com/blog/hotel-direct-booking-conversion-2026/)).
  Garanti desteklemiyorsa HMS booking engine'in cüzdan desteği değerlendirilir.
- 1.8 Oda sayfalarına kısa gerçek video (poster'lı, autoplay'siz): video içerik
  dönüşümü %80'e kadar artırabiliyor ([RMS Cloud](https://www.rmscloud.com/blog/improve-your-hotel-booking-conversion-rate));
  medya envanterinden seçilir, FAZ V kurallarına uyar.

### FAZ V (paralel iz) — "Stone & Light Editorial" Görsel Dönüşüm
Hedef: tema/UI/UX/hareket dilinde "god-tier" seviye — yeni bağımlılık eklemeden,
dönüşüm yolunu bozmadan. Uygulama promptu:
`docs/design/codex-visual-transformation-prompt-v2.md` (2026-07-01, araştırma-enjekteli v2).

- V.1 Wave 0-3 — **TAMAMLANDI (2026-07-02, HEAD `8a45c11`):** token tabanı +
  primitifler + hero reveal zaten mevcuttu (2026-06-24 dalgası, drift kaydı
  `docs/design/visual-baseline.md` R1); bu oturumda radius/motion-cinematic
  tokenları + SVG spec ikonları gate'lenip commit'lendi (`4b8c8d6`) ve featured
  oda seçimi veriye bağlandı (`getShowcaseRooms`, 12/12 test, brand:verify READY).
  Kalan tek Wave 0 kalemi: canlı screenshot matrisi (R4 protokolü).
- V.2 Wave 4-5: gastronomi split rafinesi (mevcut `gastronomy-editorial.tsx` üzerine),
  native filmstrip galeri + erişilebilir lightbox, room detail premium media viewer
  (swipe/klavye/fullscreen, emoji spec'ler kalkar, `unoptimized` audit'i).
- V.3 Wave 6-7: story rail pilotu (maks 2-3 sahne, scroll-lock yok) + CSS TiltCard
  spatial pilotu; sayfa geçişleri native View Transitions API ile (`@supports`
  korumalı, 180-240ms).
- V.4 Wave 8: Playwright visual regression (360/768/1440, reduced-motion determinizmi)
  + performans kilidi (LCP gerilemez, CLS ≤ baseline, INP < 200ms).
- Kesin sınırlar: GSAP/Lenis/R3F/carousel kütüphanesi yok; custom cursor yok; core
  route'ta WebGL yok; 3D yalnız gerçek asset ile `/hikayemiz` pilotu; tüm hareketler
  reduced-motion'a saygılı.
- Gate: her wave sonunda `typecheck + test:unit + brand:verify` yeşil; before/after
  screenshot kanıtı `docs/design/` altına.

### FAZ 2 — AEO/GEO + Yerel Görünürlük (Ay 2-3, Ağustos-Eylül)
Hedef: 22-sorgu AI görünürlük skorunda ölçülebilir artış; Google yüzeylerinde tam kapsama.

- 2.1 AI görünürlük ölçümünü aylık kadansa bağla (`docs/aeo-ai-visibility-tracking.md`
  şablonuyla); skor trendini `docs/evidence/` altında tut.
- 2.2 Hotel Center + Free Booking Links: HMS/channel manager üzerinden fiyat feed'i
  bağla → "Resmi site" etiketi. (Gate 0.6 GBP'ye bağımlı.)
- 2.3 Entity/mention inşası: kucukoteller.com.tr profili güncelle/iyileştir, yerel
  gastronomi-seyahat bloglarından bahis, Foça/İzmir destinasyon içeriklerine katkı.
- 2.4 İçerik otoritesi: mevcut rehberleri (misafir rehberi, Ege rotası, gastronomi)
  soru-cevap formatında genişlet; her rehbere FAQ schema; "Kozbeyli'de ne yapılır",
  "Foça'da nerede kalınır" niyetli sayfalar.
- 2.5 Yorum orkestrasyonu: `docs/reviews-orchestration-README.md` akışını canlıya al
  (check-out sonrası Google yorumu isteme); hedef GBP'de ilk 90 günde +30 yorum.
- 2.6 Instagram entegrasyonu: `docs/instagram-integration-readiness.md` planını uygula
  (UGC + gerçek medya, AI shortlist'lerin beslendiği sosyal kanıt).

### FAZ 3 — Büyüme ve Gelir Çeşitlendirme (Ay 3-6, Eylül-Aralık)
Hedef: direct pay hedefi %40+; sezon dışı doluluk ve etkinlik geliri.

- 3.1 Ücretli kanal: `docs/ads/` planına göre Google Hotel Ads + marka koruma search
  kampanyası (önce Free Links verisiyle CPA modeli).
- 3.2 E-posta/CRM: rezervasyon sonrası misafir profili (Payload'da), sezon kampanyaları,
  tekrar misafir kuponu — direct LTV %60 avantajını işlet.
- 3.3 Etkinlik/düğün segmenti: organizasyon sayfalarına lead formu + teklif akışı;
  yüksek marjlı segment için ayrı funnel ölçümü.
- 3.4 Sezonluk içerik takvimi: kış Ege/köy konseptleri, gastronomi hafta sonları;
  restoran tarafı için ayrı yerel SEO (restoran GBP kategorisi).
- 3.5 B2B/partner: `B2B_PARTNER_PUBLIC_KEY` altyapısı hazır — acente/partner
  availability endpoint'ini seçili partnerlere aç.
- 3.6 Çeyreklik teknik bakım: bağımlılık güncellemeleri, güvenlik denetimi
  (`security:audit`), chaos/stress koşuları, yedeklilik tatbikatı.

---

## 5. KPI Hedefleri

| KPI | Baseline (ölçülecek) | 90 gün | 180 gün |
| --- | --- | --- | --- |
| Site CVR (rezervasyon/ziyaret) | Faz 1.1'de ölç | %2.5 | %4.0 (butik high-performer bandı) |
| Direct booking payı | HMS raporundan | %30 | %40+ |
| İptal oranı (direct) | HMS | ≤%12 | ≤%10.6 (sektör direct ortalaması) |
| AI görünürlük skoru (22 sorgu) | Mevcut baseline | +%25 | +%50 |
| GBP yorum sayısı | Mevcut | +30 | +75 |
| LCP mobil (canlı) | Lighthouse prod | <2.5s | <2.0s |
| INP (canlı, PostHog RUM) | Faz 1.1'de ölç | <200ms | <200ms |
| Visual regression suite | FAZ V Wave 8'de kurulur | yeşil | yeşil |

---

## 6. Riskler ve Bağımlılıklar

1. **Garanti POS başvurusu (kritik yol):** bankaya bağlı; gecikirse Faz 0 uzar.
   Azaltma: HMS booking engine + WhatsApp fallback zaten canlı — POS'suz da rezervasyon
   alınabilir, ödeme tahsilatı HMS/karşılama anında yapılır.
2. **GBP doğrulama süresi:** posta kartı/video doğrulama haftalar alabilir. Azaltma:
   hemen başlat (0.6), Free Booking Links'i doğrulama sonrası bağla.
3. **Rate parity:** direct perk'ler OTA sözleşmelerini ihlal etmemeli — fiyat değil
   koşul/ikram bazlı avantaj ver.
4. **Tek kişilik operasyon:** yorum isteme, içerik, Instagram sürdürülebilirliği.
   Azaltma: şablonlaştır + zamanlanmış görevlerle (scheduled tasks) haftalık kontrol.
5. **AI arama volatilitesi:** AEO sinyalleri hızlı değişiyor; aylık ölçüm kadansı
   trendi görünür kılar, tek seferlik optimizasyona güvenme.

---

## 7. Haftalık Ritim ve Doğrulama Komutları

Her Pazartesi (mevcut "Kozbeyli haftalik kontrol" oturumuyla birleştirilebilir):

```bash
curl -s https://www.kozbeylikonagi.com/api/health | jq .readiness.runtimeConfiguration.status
npm run domain:verify
npm run typecheck && npm run test:unit
npm run brand:verify
```

Aylık: Lighthouse prod, AI görünürlük 22-sorgu koşusu, GBP/GSC raporu, HMS
direct-vs-OTA dağılımı.

---

## 8. Kaynaklar

- Canlı kanıtlar: `GET https://www.kozbeylikonagi.com/api/health` (2026-07-01),
  curl redirect zinciri, `docs/launch-readiness.md`, `memory/progress.md`
- [Hotel Website Conversion Rate Benchmarks 2026 — Book Better Direct](https://bookbetterdirect.com/hotel-website-conversion-rate-benchmarks-2026-direct-booking-vs-otas)
- [Hotel Conversion Rate Benchmarks & Boosting Tips 2026 — RoomStay](https://www.roomstay.io/blog/optimising-hotel-average-conversion-rate)
- [Best Direct Booking Engine 2026 / Cloudbeds State of Independent Hotels verileri](https://mehulfanawala.com/blog/best-hotel-direct-booking-engine-2026)
- [Hotel Direct Booking vs OTA — RateGain](https://rategain.com/blog/hotel-direct-booking-vs-ota)
- [Direct Booking Strategy for Boutique Hotels 2026 — Travel2Fit](https://travel2fit.com/the-ultimate-direct-booking-strategy-for-boutique-hotels-2026)
- [2026 Hotel Marketing Guide (AEO/GEO) — RateGain](https://rategain.com/blog/guide-to-hotel-marketing)
- [AI Search for Tourism Marketing — Percepture (2026-06-29)](https://percepture.com/travel-tourism-insights/ai-search-for-tourism-marketing)
- [How AI Is Changing Hotel Search — GuestRevu](https://blog.guestrevu.com/ai-hotel-search)
- [About hotel free booking links — Google Hotel Center Help](https://support.google.com/hotelprices/answer/10472393?hl=en)
- [Google Free Hotel Booking Links — Cloudbeds](https://www.cloudbeds.com/articles/googles-free-hotel-booking-links/)
- [Foça Butik Otelleri — kucukoteller.com.tr](https://www.kucukoteller.com.tr/foca-otelleri) (Jina Reader ile çekildi)
- Tasarım/platform (v1.1 eki): [Mediaboom Hotel Design Trends 2026](https://mediaboom.com/news/hotel-website-design-trends/) ·
  [Hooray Lab 12 Trends](https://lab.hooray.agency/12-must-follow-hotel-website-design-trends-in-2026/) ·
  [ThisRapt Hospitality Web Trends](https://www.thisrapt.com/hotel-growth-marketing/web-design-trends-for-hospitality-brands-2026/) ·
  [Awwwards hotel-booking](https://www.awwwards.com/websites/hotel-booking/) ·
  [MDN Scroll-driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) ·
  [caniuse animation-timeline](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) ·
  [Chrome scroll-triggered](https://developer.chrome.com/blog/scroll-triggered-animations) ·
  [Firefox 144 View Transitions](https://www.firefox.com/en-US/firefox/144.0/releasenotes/) ·
  [DesigningIT Hotel CRO](https://www.designingit.com/blog/hotel-website-conversion-rate-optimisation/) ·
  [Obvlo 8 Strategies](https://www.obvlo.com/blog/8-strategies-hotels-are-using-to-increase-direct-bookings-in-2026)
