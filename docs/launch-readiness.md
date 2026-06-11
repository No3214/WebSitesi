# Kozbeyli Konağı — Launch Readiness Denetimi

Master denetim promptunun repo üzerinde çalıştırılmış halidir (2026-06-11).
Kural: kanıt yoksa "kanıt yok"; belirsizse "belirsiz". Kanıtlar dosya yoluyla verilir.

## 1. Executive Summary

Site teknik olarak güçlü bir durumda: güvenlik başlıkları, consent-gated analytics,
schema.org kapsamı, CI + 30 yeşil test, rate-limit/replay koruması ve PII maskeli
loglama üretim kalitesinde. Lansmanı bloke eden şey kod değil, iki dış bağımlılık:
HMS booking engine URL'i ve Garanti Sanal POS bilgileri henüz tedarik edilmedi.
Bunlar gelmeden uçtan uca rezervasyon + ödeme testi yapılamaz; master şartnamenin
ek kuralı gereği karar NO-GO'dur. Kod tarafında kalan işler orta önceliklidir
(GA4 funnel eventleri, Restaurant schema, eksik sayfalar, EN/hreflang).

## 2. Launch Readiness Score: 74/100 — NO-GO (dış bağımlılık blokajı)

| Alan | Max | Puan | Gerekçe |
|---|---|---|---|
| Strateji, persona, KPI | 8 | 6 | Marka konumlandırma net (CLAUDE.md); persona/KPI dokümante değil |
| Bilgi mimarisi | 8 | 6 | Çekirdek sayfalar premium; /teklifler, /galeri, /sss, deneyim silosu eksik |
| UX/UI mobil rezervasyon | 10 | 9 | Suite yeşil; 375px taşma düzeltildi; gerçek cihaz testi yapılmadı |
| Booking/HMS/POS | 14 | 4 | Mimari + webhook güvenliği hazır; engine URL ve POS bilgisi yok → test edilemedi |
| Güvenlik | 12 | 10 | CSP/HSTS/XFO, rate-limit, ES256+HMAC webhook; MFA yok, WAF kanıtsız |
| KVKK/çerez | 10 | 8 | Consent-gated scripts; KVKK/gizlilik/mesafeli satış var; ayrı çerez politikası + vendor DPA listesi yok |
| Teknik SEO | 10 | 8 | sitemap/robots/canonical/schema/llms.txt; hreflang bilinçli kapalı (EN yok) |
| Lokal SEO/GBP/Hotel Center | 6 | 1 | Sitede NAP+GeoCoordinates var; GBP/Hotel Center kanıt yok |
| Performans/CWV | 8 | 6 | Hero preload+fetchPriority, görsel optimizasyon; saha (CrUX/RUM) verisi yok |
| Erişilebilirlik | 5 | 4 | Skip-link, aria, focus state'ler; WCAG 2.2 tam denetimi yapılmadı |
| Analytics | 5 | 2 | Consent-aware GTM altyapısı hazır; funnel + purchase eventleri yok |
| CMS/rol | 4 | 3 | Payload CMS aktif; editor/translator rol ayrımı tanımlanmadı |
| QA/UAT/launch | 10 | 7 | CI 5 aşama + 30 test yeşil; canlı rezervasyon UAT + rollback planı yok |
| **Toplam** | **100** | **74** | 70–79: sınırlı beta olabilir; **ek kural: POS+booking fail → yayına çıkma** |

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
- QA: GitHub Actions CI (lint+typecheck+unit+e2e+build), 30 Playwright testi yeşil (checkout kontrat testleri: origin 403, bozuk gövde 400, fiyat tamper 400 dahil)
- KVKK sayfaları: `/kvkk`, `/gizlilik-politikasi`, `/mesafeli-satis-sozlesmesi`
- Mobil: 375px yatay taşma giderildi (FAQ ikon rotate bounding fix)

### PARTIAL
- GA4 event map: `data-event` tıklama izleri var (phone_click, WhatsApp, HMS engine open) ama view_item / begin_checkout / purchase yok
- EN + hreflang: dictionary + LanguageSwitcher altyapısı hazır; EN rotaları yayında değil, hreflang bilinçli kapalı (`src/lib/metadata.ts:50` notu)
- MFA: Payload admin'de şifre auth var, MFA yok
- Sayfa ağacı: /teklifler, /galeri (ayrı sayfa), /sss (ayrı sayfa), /lokasyon yok; deneyim rehberleri tek sayfada (`/misafir-rehberi`)
- Restaurant schema: gastronomi sayfasında yok (0 eşleşme)
- Çerez politikası: ayrı sayfa yok (gizlilik politikası kapsıyor mu — belirsiz, hukukçu onayı gerekli)
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
2. Garanti POS evraklarını tamamla — DIŞ
3. GA4 funnel eventlerini ekle: view_item (oda detay), begin_checkout (rezervasyon CTA), generate_lead (formlar) — KOD
4. HMS webhook'tan server-side purchase/booking_complete ölçümü (engine gelince) — KOD
5. Restaurant schema (gastronomi) + LocalBusiness tutarlılığı — KOD
6. /sss sayfası (ana sayfa FAQ'su genişletilip ayrı sayfa + FAQPage schema) — KOD
7. /galeri sayfası (mevcut Konaktan Kareler şeridinin tam sayfası) — KOD
8. Çerez politikası ayrı sayfa + vendor (PMS/engine/POS/GTM) listesi — KOD+HUKUK
9. Payload rol ayrımı (admin/editor) + güçlü parola politikası; MFA araştır — KOD
10. EN rotaları + hreflang (klasör bazlı /en) — KOD (büyük iş, lansman sonrası olabilir)

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
| view_item | Oda detay görüntüleme | YOK → eklenecek |
| begin_checkout | Rezervasyon CTA / engine açılışı | Kısmen (`data-event` var, GA4 map yok) |
| purchase / booking_complete | HMS webhook (server-side) | Engine bekliyor |
| generate_lead | İletişim/organizasyon formları | Kısmen |
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
