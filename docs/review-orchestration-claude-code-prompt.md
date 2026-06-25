# Claude Code Final Prompt — Kozbeyli Konağı Review Orchestration Layer

> Bu dosyanın **"=== PROMPT BAŞLANGICI ==="** ile **"=== PROMPT SONU ==="** arasındaki
> bloğunu olduğu gibi kopyalayıp Claude Code'a yapıştır. Repo'ya özel gerçek değerler
> (domain, geo, telefon, stack, mevcut dosyalar, test disiplini) gömülüdür; ChatGPT
> taslağındaki yer-tutucular gerçek verilerle dolduruldu.

=== PROMPT BAŞLANGICI ===

# GÖREV: Kozbeyli Konağı için Tam Yorum Orkestrasyon Katmanı (Review Orchestration Layer)

Sen kıdemli bir full-stack geliştiricisin. Bu repoda (No3214/WebSitesi) otelin birden
fazla platformdaki misafir yorumlarını toplayan, normalize eden, modere eden ve sitede
GÖRÜNÜR sosyal kanıt olarak sunan tam bir yorum orkestrasyon katmanı kuracaksın.

## 0. BU REPONUN GERÇEKLERİ (varsayım yapma, bunlara uy)

- **Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Payload CMS v3
  (`@payloadcms/db-postgres` — Postgres adapter). Tailwind 4 + CSS modülleri + global CSS.
- **Canlı domain:** `https://kozbeylikonagi.com` (ve `www.`). Vercel'de deploy; her push
  otomatik build alır.
- **Bu repo TEST-GATED:** `tests/**/*.test.ts` (vitest "unit" projesi) şu an **447 test, hepsi yeşil**.
  Ekleyeceğin HER yeni collection/endpoint/widget için **kontrat testi** yaz; mevcut
  testleri kırma; `npx tsc --noEmit` temiz kalmalı; suite yeşil kalmalı (447+). Doğrulama:
  `npx tsc --noEmit -p tsconfig.json && npx vitest run --project unit`.
- **Mevcut JSON-LD ZATEN VAR ve Google-güvenli:** `src/lib/schema.ts` içindeki `hotelSchema()`
  `Hotel`/`LodgingBusiness` şemasını `amenityFeature` ile üretir ve **bilinçli olarak
  `aggregateRating`/`review` İÇERMEZ** (self-serving review yasağı). Yeni şema YARATMA;
  gerekiyorsa yalnız `sameAs` dizisini genişlet. `aggregateRating`'i üçüncü-taraf puanlarla
  ASLA doldurma. (Test: `tests/schema.test.ts`, `tests/trust-claims.test.ts` korur — bozma.)
- **CSP katıdır:** `next.config.ts` içinde `frame-src`/`connect-src`/`script-src` allowlist'i
  dar tutulur. Üçüncü-taraf JS (örn. Tripadvisor widget) veya yeni API alanı eklersen ilgili
  CSP direktifini güncelle VE `tests/production-contracts.test.ts` + `scripts/security-headers-readiness.mjs`
  içindeki CSP string kontratlarını birlikte güncelle (yoksa test kırılır). Geniş `https:`/`blob:` AÇMA.
- **Consent/KVKK altyapısı var:** `src/components/tracking-scripts.tsx` + `src/lib/consent.ts`
  onay-bağlı script yüklemesi yapar. Üçüncü-taraf JS yükleyen herhangi bir review widget'ı
  consent state'e saygı göstermeli.
- **Public env deseni:** Tarayıcıya açık ayarlar `src/lib/public-env.ts` üzerinden okunur
  (`process.env.NEXT_PUBLIC_*?.trim() || ""`). Sunucu sırları `src/lib/env.ts` (zod şema) +
  Vercel env; ASLA `public-env.ts`'e veya repoya yazılmaz. Bu deseni kullan.
- **Marka token'ları (globals.css):** zeytin `--olive #3d4a3b` / `--olive-deep #2c3729`,
  altın `--gold #b3925c` (marka altını C4A265 ailesi), fildişi `--ivory #faf9f6`. Fontlar:
  başlık Playfair Display / Cormorant Garamond, gövde Raleway. "Golden hour / taş konak"
  estetiği — sıcak, sakin, lüks.
- **Logger:** `console.*` yerine `src/lib/logger.ts` `logEvent(...)` kullan (route'larda zorunlu).
- **Gerçek tesis verileri:** İsim "Kozbeyli Konağı"; adres "Kozbeyli Köyü Küme Evler No:188,
  Foça / İzmir, TR"; geo `lat 38.713943, lng 26.896018`; telefon `+90 532 234 26 86`;
  rezervasyon motoru ayrı alan: `https://kozbeyli-konagi.hmshotel.net` (HMS — booking iframe değil,
  yeni sekmede açılır). Bunları yer-tutucu BIRAKMA; gerçek değerleri kullan.

## ÖNCE OKU, SONRA KOD YAZMA
1. Şu dosyaları incele: `payload.config.ts`, mevcut collection'lar, `package.json`
   (Payload v3 + Next 15 sürümleri), `src/lib/schema.ts`, `src/lib/public-env.ts`,
   `src/lib/env.ts`, `next.config.ts` (CSP), `src/app/globals.css` (marka token'ları),
   `tests/production-contracts.test.ts` (kontrat deseni).
2. Payload v3 GÜNCEL resmi dokümanına göre çalış (Collections, Globals, custom endpoints,
   hooks `beforeChange`/`afterChange`, access control, admin custom views). Mevcut config'e
   UYUMLU ekle, mimariyi bozma.
3. Next.js 15 Route Handler deseni (`app/api/.../route.ts`, `export async function GET/POST`),
   cache için `revalidateTag` + uygun ISR.
4. Bir API'nin güncel imzasından emin değilsen VARSAYIM yapma; o noktayı işaretle ve resmi
   dokümana göre en güncel haliyle yaz.

**Kod yazmadan önce kuracağın yapının kısa planını sun; onaylayınca uygula. Plan,
hangi yeni dosyaların ekleneceğini + hangi kontrat testlerinin yazılacağını içermeli.**

---

## 1. AMAÇ VE SINIRLAR (YANLIŞ KURMA)

### Gerçek amaç
Bu sistem "yıldızlı yorumları siteye basıp Google'da yükselmek" İÇİN DEĞİLDİR. Google,
işletmenin KENDİ sitesinde başka platformlardan (Booking, Tripadvisor) topladığı puanları
`Review`/`AggregateRating` yapısal verisi olarak işaretlemesini YASAKLAR ("self-serving
review"). Gerçek kazanım: görünür sosyal kanıt → güven, daha yüksek dönüşüm + direkt
rezervasyon, daha yüksek CTR, marka aramalarında resmi sitenin güçlenmesi (entity netliği).

### Kesin yasaklar
- ❌ Üçüncü-taraf (Booking/Tripadvisor/OTA) puanlarını `AggregateRating` JSON-LD'ye koyma.
- ❌ Tripadvisor yorum metnini sayfa HTML/JS kaynağına gömme (politikası: metin source'da
  görünmemeli, harici JS ile yüklenmeli, o fetch robots.txt ile bloklu, logo/atıf zorunlu,
  location ID dışında attribute cache/store edilmez).
- ❌ Booking.com yorum METNİNİ public sayfada gösterme (yazılı partner onayı yoksa).
  Onay durumunu `NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL` flag'i ile kontrol et (varsayılan `false`);
  flag kapalıyken Booking için yalnız "puan rozeti + kaynağa link".
- ❌ Google Maps/Places yorum içeriğini süresiz cache'leme (Place ID istisna).
- ❌ Sadece yüksek puanları gösterip kötüleri tamamen gizleyerek manipülatif görünüm.
  Filtreleme yapılırsa "Öne çıkan / seçilmiş yorumlar" etiketi koy.

---

## 2. HEDEF MİMARİ — Kaynak-Adaptör (source-adapter) deseni

**A) API tabanlı:** Google Business Profile (otelin KENDİ doğrulanmış işletmesi — meşru yol).
OAuth 2.0; güncel endpoint/scope'u resmi dokümandan doğrula (tarihsel: Business Profile API'leri,
reviews pageSize ~50). Atıf zorunlu, yasadışı cache yok.

**B) Manuel/admin girişli:** ETS Tur, Jolly, Tatilbudur, HotelsCombined — public review API'si
YOK. Admin panelden elle: kaynak, puan, (opsiyonel) kısa metin, tarih, kaynağa link. Booking
(onay yoksa) pratikte buraya yakın: puan + link.

**C) First-party (konaklama-doğrulamalı):** kendi formunla topladığın doğrulanmış yorumlar.
Senin içeriğin; tam kontrol. (İstersen yalnız BUNLAR için schema.org `Review` düşünülebilir;
yine Google yıldızı garanti değil.)

Akış: `Adapters → Normalization → Moderation → Public Internal API → (Homepage widget + Booking
banner) ; Admin Dashboard (Payload) ← moderasyon`.

---

## 3. KAYNAK BAZLI DAVRANIŞ (bu tabloyu uygula)

| Kaynak | Çekim | Public'te ne gösterilir | Kısıt |
|---|---|---|---|
| Google Business Profile | API (OAuth, kendi işletmen) | Puan + metin + atıf | "Google" atfı, süresiz cache yok |
| Booking.com | Onay yoksa manuel | Varsayılan: yalnız puan rozeti + link; metin SADECE `BOOKING_PUBLIC_APPROVAL=true` | "internal use only" — onaysız metin basma |
| Tripadvisor | Lisanslıysa client-JS, değilse manuel puan+link | Puan + link | source'a metin gömme, logo/atıf, location ID dışı cache yok |
| ETS Tur / Jolly / Tatilbudur / HotelsCombined | Manuel | Puan + (ops.) kısa metin + link | Public API yok; elle, doğrulanmış |
| First-party | Kendi form | Tam yorum + puan, "Misafir değerlendirmesi" | KVKK: ad maskele, rıza al |

---

## 4. VERİ MODELİ (Payload v3 Collections — slug kebab-case)

**`review-sources`**: `name`(text), `type`(select: api|manual|first-party), `sourceUrl`(text),
`iconKey`(text), `isActive`(checkbox), `displayPolicy`(select: full-text|score-and-link|score-only),
`lastSyncAt`(date, readonly), `lastSyncStatus`(text, readonly).

**`review-items`**: `source`(relationship→review-sources), `externalId`(text, dedup),
`rating`(number 1-5 normalize), `reviewBody`(textarea, sanitize, gizlenebilir),
`authorDisplay`(text, maskelenmiş "Ayşe K."), `datePublished`(date), `lang`(text),
`status`(select: pending|published|hidden|flagged), `isFeatured`(checkbox), `pulledAt`(date, readonly).

**`review-publication-rules`** (Global olabilir): `autoPublishThreshold`(number),
`requireManualReview`(checkbox), `featuredLabelText`(text).

**`review-moderation-events`** (audit log): `reviewItem`(relationship), `action`(select:
publish|hide|flag|unflag|source-mismatch), `reason`(text), `actor`(relationship→users), `createdAt`(date).

Hooks: `review-items` `beforeChange` → reviewBody sanitize (HTML/script/link strip → düz metin),
authorDisplay maskele; `afterChange` → status değişince `revalidateTag('reviews')`.
Access control: review-items + moderation yalnız admin/editör; public yalnız `published`.

---

## 5. PUBLIC İÇ API (Next.js Route Handlers) — vendor API'lerini front-end'e AÇMA

`app/api/...`:
- `GET  /api/review-summary` → kaynak bazında aggregate özet (ad, ortalama puan metni, sayı, link, displayPolicy)
- `GET  /api/review-cards?limit=6` → yalnız `published` yorum kartları
- `POST /api/review-refresh/[source]` → admin/manuel yenileme (auth korumalı)
- `POST /api/review-moderation/[id]` → hide/show/flag (auth korumalı, moderation-event yazar)
- `GET  /api/review-health` → kaynak sync/quota/hata durumu (admin)

Tüm public uçlar yalnız `published` + `displayPolicy`'ye uygun alanları döner (Booking
`score-and-link` ise `reviewBody` DÖNDÜRME). Cache: summary/cards `revalidateTag('reviews')`;
moderation/refresh sonrası invalidate. `console.*` değil `logEvent` kullan.

---

## 6. NORMALIZATION + SANITIZATION
Puanları 1-5'e normalize (Booking 10'luk → 5'lik). `reviewBody` düz metin (script/link/markup
temizle). `authorDisplay` tam ad saklama → "İsim S." maskele. `externalId` ile dedup.

## 7. FALLBACK (API çökerse)
Statik "kaynak rozetleri + link" göster; son sync durumunu admin'de göster. ❌ Lisanssız
cache'lenmiş üçüncü-taraf metnini HTML'e basma. Gerekirse yalnız first-party göster.

---

## 8. FRONT-END WIDGET'LARI (marka kimliği + bu reponun desenleri)
- Marka token'larını KULLAN (globals.css: `--olive`, `--gold`, `--ivory`; Playfair/Cormorant/Raleway).
  Yeni renk uydurma; mevcut değişkenlere bağlan.
- **SEO için server component tercih et** (görünür içerik SSR). Üçüncü-taraf JS yükleyen kısım
  varsa "use client" + consent-gated.
- **Widget 1 — `ReviewSummary` (ana sayfa):** kaynak bazında ortalama puan, toplam sayı, kaynak
  rozetleri, "kaynağa git" linkleri (`rel="nofollow noopener noreferrer"`, `target="_blank"`).
  full-text kaynaklarda (Google, first-party) öne çıkan kısa alıntılar.
- **Widget 2 — `ReviewBanner` (booking funnel):** kompakt güven bandı: toplam puan + "X misafir
  değerlendirdi" + (lisans uygunsa) 1-2 alıntı. `/api/review-summary` + `/api/review-cards`'tan
  beslenir, graceful fallback (section 7).

## 9. YAPISAL VERİ (JSON-LD) — mevcut hotelSchema'yı KORU
`src/lib/schema.ts` `hotelSchema()` zaten Google-güvenli `Hotel` şeması üretir (aggregateRating
YOK). Yeni şema yaratma; gerekirse yalnız `sameAs`'a gerçek profilleri ekle (Google Maps CID,
Tripadvisor, Booking URL'leri). Üçüncü-taraf puanlarıyla `AggregateRating`/`Review` KULLANMA.
First-party doğrulanmış yorumlar için ayrı `Review` düşünülürse bile Google yıldızı garanti değil.

## 10. KVKK / GDPR
Yazar adı/ülke/foto = kişisel veri, minimum tut. `authorDisplay` maskele. Silme/düzeltme için
admin "yorumu kaldır" + moderation-event. Privacy notice'a satır ekle: "Üçüncü taraf platformlardan
alınan kamuya açık değerlendirmeler, kaynağına atıfla ve minimum kişisel veriyle gösterilir."

---

## 11. TESLİM EDİLECEKLER
1. Payload config eklemeleri (collection'lar + hooks + access control)
2. Next.js Route Handler'lar (section 5'teki 5 uç)
3. Kaynak adaptörleri (Google API + manuel + first-party)
4. Normalization + sanitization yardımcıları
5. React widget'lar (ReviewSummary + ReviewBanner, marka stilli, consent-gated 3P JS)
6. Payload admin moderasyon görünümü (published/pending/hidden/flagged filtre + hide/show/flag)
7. Seed/örnek veri (her kaynak tipinden birkaç örnek)
8. **Kontrat testleri** (bu reponun deseni): yeni collection slug'ları, endpoint sözleşmeleri,
   "üçüncü-taraf puanı aggregateRating'e girmez", "Booking metni onaysız dönmez", "reviewBody
   sanitize edilir" gibi davranışları pinleyen `tests/*.test.ts`. CSP'yi değiştirdiysen ilgili
   kontrat string'lerini güncelle. Suite yeşil + `tsc` temiz kalmalı.
9. `.env.example` güncelle (Google OAuth, `NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL=false` vb.) ve
   public flag'i `src/lib/public-env.ts`'e, sunucu sırlarını `src/lib/env.ts` zod şemasına ekle.
10. Kısa README: "yeni kaynak nasıl eklenir", "moderasyon akışı", "Booking onayı gelince flag nasıl açılır".

## ÇALIŞMA TARZI
- Önce plan sun, onay al, sonra uygula.
- Mevcut kod stilini/mimarisini/test disiplinini koru; bozma.
- API imzasından emin değilsen varsayım yapma, işaretle.
- Her dosyadan sonra kısa açıklama; bitince `tsc` + vitest çalıştır, sonucu raporla.

=== PROMPT SONU ===

## Senin elinle tamamlanacaklar (yalnız sende olan bilgiler)
- JSON-LD `sameAs` için gerçek profil URL'leri: Google Maps CID, Tripadvisor sayfası, Booking
  otel sayfası. (Bunları Claude Code'a plan aşamasında ver.)
- Google Business Profile API erişimi: OAuth client + (gerekirse) Google'ın access-request formu.
- Booking metnini açacaksan partner ekibinden **yazılı onay** — alana kadar `BOOKING_PUBLIC_APPROVAL=false`.
- Tripadvisor metni göstereceksen içerik lisansı/şartları.

## Neden ChatGPT taslağından farklı/daha güçlü
- Yer-tutucular gerçek repo verileriyle dolduruldu (domain `kozbeylikonagi.com`, geo, telefon,
  HMS booking alanı, stack: Payload v3 + Postgres + Next 15 + React 19).
- Mevcut `hotelSchema()`'yı KORU talimatı (yeniden yazdırmaz; zaten Google-güvenli).
- Bu reponun **kontrat-testi disiplini** ve **katı CSP** gereği prompt'a gömüldü → Claude Code
  testleri kırmadan, CSP string kontratlarını birlikte güncelleyerek üretir.
- Consent/KVKK altyapısı (tracking-scripts + consent.ts) ve public-env/env(zod) desenleri
  belirtildi → üçüncü-taraf JS consent-gated, sırlar doğru katmanda.
