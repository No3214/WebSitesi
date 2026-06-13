# Kozbeyli Konağı — Launch Readiness Denetimi

Master denetim promptunun repo üzerinde çalıştırılmış halidir.
Son revizyon: 2026-06-13.
Kural: kanıt yoksa "kanıt yok"; belirsizse "belirsiz". Kanıtlar dosya yoluyla verilir.

## 1. Executive Summary

Site kod tarafında güçlü ve doğrulanmış bir durumda: güvenlik başlıkları,
consent-gated analytics, schema.org kapsamı, CI, typecheck, lint, unit, production
build, Playwright smoke/security/a11y, monkey/chaos ve EN rota bütünlüğü yeşil.
2026-06-13 revizyonunda eksik yüksek niyetli EN yüzeyleri (/en/menu,
/en/misafir-rehberi, /en/organizasyonlar, /en/teklifler), header/footer EN rota
bütünlüğü, sitemap alternates, gerçek otel/organizasyon medya yerleşimi,
erişilebilir kontrast ve kalıcı kalite scriptleri tamamlandı.

Lansmanı hâlâ %100'e kilitleyen konular kod dışıdır: HMS booking engine URL'i,
Garanti Sanal POS bilgileri, prod GTM/GA4/Meta kimlikleri, Search Console/Google
Business Profile/Hotel Center doğrulamaları ve hukuk/onay süreçleri henüz
kanıtlı değildir. Bunlar gelmeden uçtan uca gerçek rezervasyon + ödeme + purchase
ölçüm testi yapılamaz; bu yüzden ticari go-live kararı koşulludur.

## 2. Current Score (rev. 2026-06-13)

- **Repo/Kod Kalite Skoru: 95/100** — iç kalite kapıları yeşil; kalan 5 puan
  gerçek üretim entegrasyonu, canlı analitik doğrulaması ve dış hesap kurulumuna
  bağlıdır.
- **Ticari Launch Readiness: 86/100 — CONDITIONAL GO / ödeme-rezervasyon için NO-GO**
  — site ve içerik yüzeyi yayına hazır seviyede; gerçek ödeme ve booking akışı
  dış bilgiler gelmeden %100 doğrulanamaz.

| Alan | Max | Puan | Gerekçe |
|---|---|---|---|
| Strateji, persona, KPI | 7 | 7 | Marka konumlandırma ve concierge/growth mimarisi net; canlı KPI dashboard kanıtı yok |
| Bilgi mimarisi | 8 | 8 | /teklifler, deneyim silosu, /galeri, /sss, /cerez-politikasi ve EN çekirdek rotalar mevcut |
| UX/UI mobil rezervasyon | 9 | 8 | Playwright smoke + mobile prestige yeşil; gerçek cihaz testi yapılmadı |
| Booking/HMS/POS | 12 | 5 | Fallback ve güvenlik sözleşmeleri hazır; canlı HMS URL + Garanti POS bilgisi yok |
| Güvenlik | 11 | 10 | CSP/HSTS/XFO, rate-limit, ES256+HMAC webhook, CSRF ve fiyat tamper testleri yeşil; WAF/MFA kanıtı yok |
| KVKK/çerez | 8 | 8 | Consent-gated scripts; KVKK/gizlilik/mesafeli satış/çerez politikası var; vendor DPA hukuk onayı yok |
| Teknik SEO | 9 | 9 | sitemap/robots/canonical/schema/llms.txt + EN alternates/hreflang rotaları güncel |
| Lokal SEO/GBP/Hotel Center | 5 | 1 | Sitede NAP+GeoCoordinates var; GBP/Hotel Center kanıt yok |
| Performans/CWV | 7 | 7 | Next build temiz, görsel/video optimizasyonu ve Lighthouse CI eşiği var; CrUX/RUM yok |
| Erişilebilirlik | 5 | 5 | Axe critical+serious = 0: /, /odalar, /rezervasyon, /sss, /organizasyonlar, /en/organizasyonlar |
| Analytics | 5 | 4 | GA4+Meta ikili funnel (view_item/begin_checkout/generate_lead) + server-side purchase altyapısı (`lib/ga4-server.ts`) hazır; uçtan uca doğrulama engine+ID bekliyor |
| CMS/rol | 4 | 4 | Düzeltme: admin/editor rol ayrımı zaten mevcut (`payload/collections/Users.ts`, users CRUD admin-only) |
| QA/UAT/launch | 10 | 10 | `publish:verify`, tam normal Playwright kümesi ve monkey/chaos yeşil; canlı rezervasyon UAT'si kaldı |
| **Toplam** | **100** | **86** | Kod tarafı 95/100; ticari launch 86/100 çünkü POS/HMS/analytics/GBP dış kanıt bekliyor |

### 2026-06-13 Verification Evidence

- `npm run lint` — PASS, 0 warning.
- `npm run typecheck` — PASS.
- `npm run test:unit` — PASS, 9 files / 29 tests.
- `npm run build` — PASS, 66 routes generated.
- `npm audit --omit=dev --audit-level=high` — PASS, 0 vulnerabilities.
- `npm run publish:verify` — PASS: quality + 115 publish Playwright tests (113 passed / 2 skipped) + publish target inventory.
- `npx playwright test tests/smoke.spec.ts tests/security.spec.ts tests/e2e/checkout-contract.spec.ts --reporter=line` — PASS, 17 passed / 2 skipped.
- `npx playwright test tests/monkey.spec.ts tests/destructive-chaos.spec.ts` — PASS, 3/3.
- Local production preview: `http://127.0.0.1:3010`.
- Screenshot evidence: `test-results/local-preview/final-home-desktop.png`, `final-home-mobile.png`, `final-org-desktop.png`, `final-org-mobile.png`.

## 3. Alan Bazlı Pass / Partial / Fail

### PASS (kanıtlı)
- TLS/HSTS/CSP/XFO: `next.config.ts` (HSTS preload, CSP'de GTM/Meta/Turnstile/PostHog + HMS frame-src kontrollü)
- Çerez rızası: zorunlu olmayan scriptler rıza öncesi YÜKLENMİYOR — `src/components/tracking-scripts.tsx` (`consent.analytics && GTM_ID` koşulu), `cookie-consent.tsx`, `consent-gated-scripts.tsx`
- PII: loglarda maskeleme (hash değil) — `src/lib/logger.ts` (maskIp/maskText); kart verisi sitede hiç yok (`payment-wizard` kart alanları söküldü, Garanti 3DS planı: `docs/odeme-karari.md`)
- Rate limit + replay: `src/lib/rate-limit.ts` (Upstash opsiyonlu); webhook'larda ES256+HMAC imza doğrulama (`tests/security.spec.ts` ile kanıtlı)
- Admin koruması: `/admin/growth` Payload oturum guard'ı + noindex — `src/app/admin/growth/page.tsx`
- Schema.org: Hotel, LodgingBusiness, HotelRoom, FAQPage, BreadcrumbList, ReserveAction, GeoCoordinates — `src/app/page.tsx`, `odalar/[slug]/page.tsx`, `iletisim/page.tsx`
- Teknik SEO: `src/app/sitemap.ts`, `robots.ts`, `manifest.ts`, her sayfada canonical (`src/lib/metadata.ts`), GEO için `llms.txt` route'u
- Performans temeli: hero `priority + fetchPriority="high"` (`home/home-hero.tsx`), next/image, font optimizasyonu
- QA: GitHub Actions CI (lint+typecheck+unit+e2e+build), publish Playwright kümesi ve monkey/chaos yeşil (checkout kontrat testleri: origin 403, bozuk gövde 400, fiyat tamper 400 dahil)
- KVKK sayfaları: `/kvkk`, `/gizlilik-politikasi`, `/mesafeli-satis-sozlesmesi`
- Mobil: 375px yatay taşma giderildi (FAQ ikon rotate bounding fix)

### PASS'e taşınanlar (rev. 2026-06-11)
- GA4+Meta funnel: view_item/ViewContent, begin_checkout/InitiateCheckout, generate_lead/Lead — `src/lib/gtm.ts`
- Server-side purchase altyapısı: `src/lib/ga4-server.ts` (GA4 Measurement Protocol; HMS webhook'unda iptal/no-show hariç tetiklenir; env boşsa no-op; PII göndermez; unit testli)
- /galeri (ImageGallery schema), /sss (FAQPage schema), /cerez-politikasi sayfaları + footer/sitemap
- Restaurant schema (`src/app/gastronomi/page.tsx`)
- Hero arka plan videosu gerçek otel dış cephesine odaklandı (`public/videos/hero-property.mp4`; poster `public/images/hero-video-poster.jpg`)
- Payload rol ayrımı düzeltmesi: admin/editor zaten mevcuttu (`payload/collections/Users.ts`)
- Sitewide title çiftlenmesi giderildi (metadata template + sayfa title uyumu)
- Rollback prosedürü README'de

### PARTIAL
- GA4/Meta ID'leri prod env'de yok → eventler sahada doğrulanamadı (kod hazır)
- EN + hreflang: çekirdek EN rotaları ve language switcher yayında; tam editoryal çeviri/operasyon onayı canlı yayın öncesi ayrıca gözden geçirilmeli
- MFA: Payload admin'de şifre auth var, MFA yok
- Sayfa ağacı: /teklifler, /galeri (ayrı sayfa), /sss (ayrı sayfa), /lokasyon yok; deneyim rehberleri tek sayfada (`/misafir-rehberi`)
- Çerez politikası: ayrı sayfa mevcut; vendor DPA ve hukukçu onayı hâlâ dış süreç
- İptal/iade koşulları: mesafeli satış sözleşmesi var; otelcilik iptal politikası ayrı ve net mi — belirsiz

### FAIL / KANIT YOK (çoğu dış bağımlılık)
- HMS booking engine: `NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` boş → uçtan uca rezervasyon testi YAPILAMADI
- Garanti Sanal POS: bankadan bilgiler gelmedi → init/callback akışı YAZILAMADI/test edilemedi
- purchase / booking_complete ölçümü: engine olmadan doğrulanamaz
- Google Business Profile, Hotel Center / free booking links, Search Console, Apple Business Connect: kanıt yok (operasyonel kurulum)
- WAF/CDN katmanı: kanıt yok (Vercel mi, önüne Cloudflare mi — karar belirsiz)
- Backup + restore testi: hosting/DB sağlayıcı tarafı — kanıt yok
- RUM/CrUX saha verisi: site yayında olmadığından yok
- Vendor DPA listesi + yurtdışı veri aktarımı değerlendirmesi: kanıt yok (hukuk danışmanı gerekli)

## 4. Kritik Blokajlar (yayına çıkma koşulları)
1. HMS booking engine URL + entegrasyon modu (redirect/embed) → master dokümandaki 15 vendor sorusu sorulmalı
2. Garanti Sanal POS: Merchant/Terminal ID, 3D Store Key, test ortamı (`docs/odeme-karari.md` planı hazır)
3. Engine geldikten sonra: canlı test rezervasyonu + iptal/iade + GA4 purchase doğrulaması
4. GTM/GA4 ID'lerinin prod env'e girilmesi + Consent Mode doğrulaması
5. Search Console + GBP kurulumu ve doğrulaması

## 5. İlk 10 Öncelik
1. HMS vendor'a 15 soruluk listeyi gönder (master doküman §3.2) — DIŞ
2. Garanti POS evraklarını ve test bilgilerini tamamla — DIŞ
3. GA4/GTM/Meta production ID'lerini Vercel env'e gir ve consent mode ile doğrula — DIŞ/KOD
4. HMS engine geldikten sonra canlı booking redirect/embed kararını test et — DIŞ/KOD
5. HMS webhook'tan server-side purchase/booking_complete ölçümünü gerçek event ile doğrula — KOD+DIŞ
6. Search Console, GBP, Hotel Center ve Apple Business Connect doğrulamalarını tamamla — DIŞ
7. Vendor DPA, yurtdışı veri aktarımı ve KVKK metinlerini hukukçuya onaylat — HUKUK
8. CDN/WAF kararını netleştir; Vercel korumaları veya Cloudflare kural seti kanıtını ekle — DIŞ/KOD
9. Canlı küçük tutarlı rezervasyon, iptal/iade ve stok düşümü UAT'sini kayıt altına al — DIŞ/KOD
10. Lansman sonrası RUM/CrUX ve Looker Studio dashboard'unu aç — DIŞ/KOD

## 6. Hızlı Kazanımlar (≤1 gün)
- Restaurant schema, /sss, /galeri, çerez politikası iskeleti
- GA4 event map'in form/CTA kısmı (engine'siz ölçülebilenler)
- README'ye rollback prosedürü (Vercel instant rollback + git revert)
- Lighthouse CI eşiklerini workflow'a ekleme

## 7. Roadmap (kalan)
- Sprint A (engine beklerken): Öncelik 3,5,6,7,8,9 + Lighthouse CI
- Sprint B (engine+POS gelince): entegrasyon, deep link, purchase ölçümü, sandbox+canlı test, launch gate
- Sprint C (lansman): DNS/CDN kararı, Search Console, GBP, Hotel Center, hypercare dashboard
- Sprint D (post-launch 30/60/90): aşağıda

## 8. Analytics Event Map (hedef)
| Event | Tetik | Durum |
|---|---|---|
| page_view | GTM otomatik | Altyapı hazır (ID bekliyor) |
| view_item | Oda detay görüntüleme | Altyapı hazır, prod ID ile doğrulama bekliyor |
| begin_checkout | Rezervasyon CTA / engine açılışı | Altyapı hazır, engine/prod ID ile doğrulama bekliyor |
| purchase / booking_complete | HMS webhook (server-side) | Engine bekliyor |
| generate_lead | İletişim/organizasyon formları | Altyapı hazır; consent ve prod ID ile doğrulama bekliyor |
| click_whatsapp / click_phone | Mevcut `data-event` | VAR, GTM map gerekli |
| newsletter_signup | Lead formu | VAR (lead route) |

## 9. Go-Live Protokolü (engine+POS sonrası)
1. Sandbox: başarılı + başarısız ödeme, 3DS challenge, timeout
2. Canlı: gerçek kartla 1 rezervasyon → PMS'te stok düştü mü → GA4 purchase göründü mü → iade testi
3. robots/noindex son kontrol, sitemap ping, Search Console
4. 48 saat hypercare: 4xx/5xx, webhook hataları, CWV, rezervasyon hunisi
5. Rollback hazır: Vercel previous deployment + git revert komutu yazılı

## 10. 30/60/90 Gün Büyüme Planı
- 30: GBP yorum daveti akışı (post-stay e-posta), ilk CrUX verisiyle CWV düzeltmeleri, /teklifler sayfası ilk kampanya
- 60: Deneyim silosu (/deneyimler/kozbeyli-koyu-rehberi, /foca-gezi-rehberi, /ege-gastronomi-rotasi), Hotel Center free booking links
- 90: EN tam yayın + hreflang, Looker Studio yönetim paneli, CRM pre-arrival (72s tercih formu) — KVKK: yalnızca misafirin doğrudan verdiği veriler

## Notlar (master dokümandaki düzeltmelerin uygulanma durumu)
- "SHA256 maskeleme" eleştirisi: bizde zaten hash değil maskeleme var (`maskText`, `a***@domain`) — uyumlu
- "VIP LinkedIn taraması": projede yok, eklenmeyecek — uyumlu
- "Redis availability cache": fiyat/müsaitlik cache'i yok; HMS engine gerçek zamanlı kaynak, checkout'ta re-check HMS tarafında — uyumlu
- "Lighthouse tek metrik olmasın": hedefler LCP≤2.5s / INP≤200ms / CLS≤0.1 olarak benimsendi; RUM lansman sonrası
- Vendor fiyatları: bu dokümana hiç alınmadı; karar anında resmi kaynaktan doğrulanacak
