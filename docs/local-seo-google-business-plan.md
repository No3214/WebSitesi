# Local SEO + Google Business — Aksiyon Planı

Hedef: "kozbeyli", "kozbeyli konağı", "Foça taş otel", "Foça konaklama" gibi
aramalarda ve Google Haritalar'da üst sıralar.

## Dürüst çerçeve (önce bunu oku)
Hiçbir teknik kurulum Google'da "her zaman 1." sırayı GARANTİ edemez — sıralama
Google'ın kontrolümüz dışındaki sinyallerine bağlıdır (yakınlık/proximity,
işletme prominansı, yorum hacmi/kalitesi, rakipler, geçmiş). Yapabileceğimiz:
**kontrol edilebilir tüm sinyalleri en üst düzeye çıkarmak.** Kendi marka adın
("kozbeyli konağı") için 1. sıra, GBP doğrulanıp site indekslenince yüksek
olasılıkla elde edilir; jenerik rekabetçi terimlerde ("Foça otel") sıralama
süreklidir ve yorum + otorite ile zamanla yükselir.

## A) Kodda HAZIR olanlar (readiness: source contracts PASS)
- LocalBusiness/Hotel yapısal verisi: NAP + PostalAddress + GeoCoordinates +
  harita bağlamı (`src/lib/schema.ts`).
- Sitemap: canonical + hreflang (TR/EN) + lokasyon + Foça rehber + oda rotaları.
- robots: public tarama açık, sitemap'e işaret; `/admin` + `/api` hariç.
- Truthfulness: üçüncü-taraf yıldız/yorum/ödül iddiası YOK (Google self-serving
  cezasından kaçınır). `sameAs` yalnız gerçek profil URL'leriyle (env).

## B) Hemen yapılacaklar (repo/operasyon)
1. **Google Search Console**: domain'i doğrula. `GOOGLE_SITE_VERIFICATION`
   token'ını Vercel env'e gir (kod zaten token varsa meta tag basıyor). Sitemap'i
   (`/sitemap.xml`) gönder.
2. **Bing Webmaster Tools**: ekle + sitemap gönder (Bing/ChatGPT görünürlüğü).
3. `BRAND_PROFILE_URLS` env: gerçek GBP (Maps CID), Instagram, Booking, Tripadvisor
   URL'lerini virgülle gir → `sameAs` entity netliği.

## C) Google Business Profile (GBP) — en kritik local sinyal
1. **Sahiplen + doğrula** (kart/posta/telefon/video). Doğrulama olmadan harita
   sıralaması olmaz.
2. **NAP tutarlılığı**: İsim/Adres/Telefon GBP ↔ site ↔ tüm dizinlerde BİREBİR
   aynı olsun. Sitedeki resmî NAP:
   - İsim: Kozbeyli Konağı Taş Otel & Restaurant
   - Adres: Kozbeyli Köyü Küme Evler No:188, Foça, İzmir 35680
   - Tel: +90 532 234 26 86
   (Bunlar GBP ile birebir eşleşmeli; farklıysa düzelt.)
3. **Doğru kategoriler**: birincil "Otel"; ek "Restoran", "Düğün mekanı",
   "Tatil köyü/konaklama". Birincil kategori sıralamada güçlü etkendir.
4. **Hizmet alanı + öznitelikler**: otopark, kahvaltı dahil, evcil dostu (site
   ile tutarlı), ücretsiz Wi-Fi vb. — yalnız GERÇEK olanlar.
5. **Fotoğraf/video**: yüksek kaliteli, coğrafi etiketli, düzenli ekleme (dış
   cephe, odalar, kahvaltı, bahçe). Sitedeki görsellerle uyumlu.
6. **Rezervasyon linki**: GBP "Randevu/Rezervasyon" alanına resmi rezervasyon
   URL'si (`/rezervasyon`).
7. **GBP Posts**: düzenli (etkinlik/teklif/sezon) — aktiflik sinyali.
8. **Q&A**: sık soruları kendin sor-yanıtla (sitedeki /sss ile uyumlu).

## D) Yorum stratejisi (yasal + Google-güvenli)
- Gerçek misafirlerden Google yorumu iste (QR/e-posta/checkout sonrası). Yorum
  hacmi + tazeliği + yanıtlama harita sıralamasında güçlü etkendir.
- Tüm yorumlara (olumlu/olumsuz) profesyonel yanıt ver.
- Üçüncü-taraf yorum yıldızını sitende AggregateRating olarak İŞARETLEME (mevcut
  kod buna uyuyor). Repo'daki review-orchestration katmanı kendi Google
  yorumlarını (OAuth) çekip gösterebilir; kurulum: `docs/reviews-orchestration-README.md`.

## E) Off-site / otorite
- Yerel dizinler (Tripadvisor, Booking, Foça turizm, yerel rehberler) NAP tutarlı.
- Kaliteli geri bağlantılar: yerel basın, gezi blogları, "Foça gezilecek yerler"
  içerikleri.
- Sosyal sinyaller: Instagram/Facebook aktif + siteye + GBP'ye bağlı.

## F) Teknik takip
- Core Web Vitals'i Search Console'da izle (Next.js + Vercel iyi durumda).
- "kozbeyli" / "kozbeyli konağı" / "Foça taş otel" için konuma duyarlı manuel
  takip (incognito + farklı konumlar) — rank takip aracı opsiyonel.
- Indeksleme: Search Console'da `/`, `/rezervasyon`, `/odalar`, `/hikayemiz`,
  `/iletisim` indekslendi mi kontrol.

## Ölçüt
- Marka aramalarında ("kozbeyli konağı") 1. sıra + GBP knowledge panel.
- Haritada "Foça otel/konaklama" için ilk yerel pakette görünürlük (yorum +
  prominans arttıkça yükselir).
> Tekrar: jenerik rekabetçi terimlerde sabit "1." vaadi gerçekçi değildir;
> bu plan kontrol edilebilir sinyalleri en üst düzeye çıkarır.
