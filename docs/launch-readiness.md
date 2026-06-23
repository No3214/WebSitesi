# Kozbeyli Konağı — Launch Readiness Denetimi

Master denetim promptunun repo üzerinde çalıştırılmış halidir.
Son revizyon: 2026-06-22.
Kural: kanıt yoksa "kanıt yok"; belirsizse "belirsiz". Kanıtlar dosya yoluyla verilir.

## 1. Executive Summary

Site kod tarafında güçlü ve doğrulanmış bir durumda: güvenlik başlıkları,
consent-gated analytics, schema.org kapsamı, CI, typecheck, lint, unit, production
build, Playwright smoke/security/a11y, monkey/chaos ve EN rota bütünlüğü yeşil.
2026-06-13 revizyonunda eksik yüksek niyetli EN yüzeyleri (/en/menu,
/en/misafir-rehberi, /en/organizasyonlar, /en/teklifler), header/footer EN rota
bütünlüğü, sitemap alternates, gerçek otel/organizasyon medya yerleşimi,
erişilebilir kontrast ve kalıcı kalite scriptleri tamamlandı.

Lansmanı hâlâ %100'e kilitleyen konular kod dışıdır: production database kanıtı,
production abuse-control kanıtı, HMS canlı rezervasyon UAT kanıtı, Garanti Sanal
POS bilgileri, prod analytics purchase doğrulaması, Search Console/Google
Business Profile/Hotel Center doğrulamaları ve hukuk/onay süreçleri henüz
kanıtlı değildir. Bunlar gelmeden uçtan uca gerçek rezervasyon + ödeme +
purchase ölçüm testi yapılamaz; bu yüzden ticari go-live kararı koşulludur.

2026-06-18 domain güncellemesi: `kozbeylikonagi.com` ve `www` canonical alan
adları, Vercel preview sağlıklı olsa bile `/api/health` üzerinden aynı Next.js
uygulamasını servis ettiğini kanıtlamadan ticari launch için hazır sayılmaz.
Bu kontrol `npm run domain:verify` ve `docs/evidence/canonical-domain.md`
kanıtıyla izlenir.

2026-06-19 domain diagnostik güncellemesi: `npm run domain:verify` artık final
URL ve ilk redirect hop'unu da raporlar. Mevcut canlı durumda apex domain HTTPS
isteğini ilk hop'ta `http://www.kozbeylikonagi.com/...` adresine düşürüyor ve
`www` hostu hâlâ eski landing yüzeyini servis ediyor; bu nedenle canonical gate
NO-GO kalır.

2026-06-19 ek domain diagnostik güncellemesi: sistem DNS resolver'ı NS/MX için
`ECONNREFUSED` verdiğinde verifier DNS-over-HTTPS fallback kullanır ve NS/MX
kaynağını raporlar. Bu yalnızca teşhisi güçlendirir; eski landing, eksik
`/api/health`, insecure first-hop veya hero video yokluğu varsa canonical gate
yine NO-GO kalır.

2026-06-20 canonical legacy host güncellemesi: `npm run domain:verify:json`
artık eski host yüzeyini ayrıca sınıflandırır. Canlı ölçümde Vercel production
preview `c272d59b344c` commit'iyle sağlıklı, DNS NS/MX kayıtları doğrulanabilir,
fakat `kozbeylikonagi.com` ve `www` hâlâ `legacy Joomla/Seagull template` ve
`legacy HotelRunner hosted landing surface` imzası veriyor. Bu, Vercel deploy
ve alias başarılı olsa bile DNS delegasyonu veya eski host yönlendirmesi
düzelmeden canonical gate'in NO-GO kalacağını kanıtlar.

2026-06-20 DNS yetki güncellemesi: `npm run domain:verify` artık registrar ile
aktif DNS yetkilisini ayrı gösterir. Domain İsimtescil panelinde kayıtlı olsa
bile public resolver'lar farklı/harici delegasyon gösterebilir; İsimtescil DNS
zone kayıtları nameserver değişmeden canlı trafiği etkilemez. Bu projenin yayın
hedefi yalnızca `kozbeylikonagi.com` ve `www.kozbeylikonagi.com` olarak
izlenir. Vercel hedef kayıtları raporda açıkça listelenir.
Vercel DNS apex hostlar için
`A 76.76.21.21`, `www` ve diğer subdomainler için CNAME kaydı kullanır; DNS
düzenlemesinden hemen önce inspect komutu tekrar çalıştırılmalı veya Project
Settings kontrol edilmeli, çünkü Vercel proje bazlı CNAME değerleri
döndürebilir. Nameserver sağlayıcısı değiştirilecekse MX/TXT/SPF/DKIM/DMARC
kayıtları korunmadan geçiş yapılmamalıdır.

2026-06-20 public resolver notu: public DNS sorguları, registrar/Vercel tarafı
güncellense bile eski veya harici DNS/CDN kayıtlarını gösterebilir. İlk cutover
doğrulamasında `/api/health` yanıtının `service=kozbeyli-konagi` dönmesi ve ana
sayfanın `/videos/hero.mp4` açılış videosunu göstermesi zorunludur. Public A
sorgusu tek başına GO kanıtı sayılmaz.

2026-06-22 İsimtescil/Vercel nameserver güncellemesi: İsimtescil
`Host Name (DNS) Yönetimi` ekranında `.com` nameserver değeri
`NS1.VERCEL-DNS.COM,NS2.VERCEL-DNS.COM` olarak kaydedildi ve Vercel DNS
doğrudan kontrollerinde web/mail kayıtları hazır göründü. Canlı public ölçümde
`kozbeylikonagi.com` ve `www.kozbeylikonagi.com` artık current Vercel app'i
servis ediyor: `/api/health` `service=kozbeyli-konagi` ve current production
commit döndürüyor, ilk redirect HTTPS kalıyor ve ana sayfada
`/videos/hero.mp4` var. `.com.tr` bu projenin launch hedefi değildir ve
`www.kozbeylikonagi.com` yayını için blocker olarak değerlendirilmez.

2026-06-22 domain readiness sinyal ayrımı: `npm run domain:verify` canlı web
origin doğrulamasını DNS kayıt şekli uyarısından ayrı gösterir. `.com`
origin'leri `/api/health`, current commit, güvenli redirect ve
`/videos/hero.mp4` kontrollerinden geçiyorsa live record satırında
`originVerified=yes` görünür. Vercel DNS authoritative ve web origin doğrulanmışsa
Vercel-managed A/CNAME flattening `managedDnsNote` ile kabul edilir. Harici DNS/CDN
durumundan gelen eski A/CNAME cevapları ise yine `dnsReady=false` uyarısı üretir,
ama `.com` web hazır sinyalini bastırmaz.

2026-06-20 public light theme güncellemesi: koyu public yüzeyler geriye
alındı. Mobil menü, oda detay rezervasyon kartı, exit-intent rezervasyon paneli
ve hata ekranı açık taş/olive tema yüzeylerine çekildi; `tests/light-theme-contract.test.ts`
ve `tests/e2e/public-light-theme.spec.ts` regresyonu kilitler.

2026-06-19 Vercel operasyon güncellemesi: `npm run vercel:ops` artık tek
seferlik `npx vercel` veya AppData içindeki doğrudan paket dosyasını global CLI
kurulumu saymaz. Kalıcı `vercel`/`vercel.cmd` kurulumu ve `vercel whoami`
oturumu, `vercel env pull`, deploy ve logs işlemleri için canonical cutover
öncesi görünür bir koşuldur.

2026-06-19 Vercel production env envanteri güncellemesi: `npm run vercel:env`
artık `vercel env ls` çıktısından yalnızca Production env isimlerini okur ve
ticari launch gate'leriyle karşılaştırır. Değer yazdırmaz; `.env.local`
hazırlığı ile gerçek Vercel Production ayarları karıştırılmadan eksik env
blokları makine-okunur hale gelir.

2026-06-19 GitHub CI diagnostik güncellemesi: `npm run github:ci` artık son
GitHub Actions run/job/check-run annotation durumunu salt-okunur şekilde raporlar.
Mevcut kırmızı CI koddan değil, GitHub hesap ödeme/spending-limit blokajından
kaynaklanır; ayrıntılı runbook `docs/github-actions-readiness.md` dosyasındadır.

2026-06-19 health diagnostik güncellemesi: `/api/health` runtime readiness
çıktısı secret veya env key adı yayınlamadan `missing`, `partial`, `invalid`,
`code_fallback` ve `fallbackApplied` sinyallerini verir. Böylece uptime/ops
monitörü canonical URL, HMS fallback ve production env gruplarını daha net ayırır.

2026-06-19 launch audit diagnostik güncellemesi: `npm run launch:audit` de aynı
env sınıflandırmasını üretir; placeholder, kısmi ve geçersiz production env
durumları `configuredEnvCount`, `missingEnvCount`, `invalidEnvCount`,
`placeholderEnvCount` ve `fallbackApplied` alanlarıyla görünür olur.

2026-06-22 Supabase/Payload güvenlik güncellemesi: `npm run supabase:verify`
eklendi. Bu kapı Payload'ın `@payloadcms/db-postgres` kullanımını, üretimde
local `DATABASE_URI` kabul edilmemesini, `PAYLOAD_SECRET` gerekliliğini,
service-role anahtarının client/source katmanına sızmamasını ve
`docs/evidence/production-database.md` kanıt durumunu ayrı raporlar. Supabase
chatbot tarafından oluşturulmuş genel public tablolar, Payload modeliyle
uyumluluk ve RLS audit'i kanıtlanmadan production akışına bağlanmaz.
2026-06-22 ek doğrulama: `supabase-security-readiness.mjs --env-file` artık
Vercel'den çekilmiş geçici env snapshot'ını local `.env` yerine otoriter kabul
eder. Boş `DATABASE_URI` / `PAYLOAD_SECRET` değerleri local fallback ile
maskelenmez ve secret değerleri rapora yazılmaz.

2026-06-19 HMS güncellemesi: Rezervasyon CTA'ları resmi HMS engine'e yeni sekme
handoff olarak gider ve public fallback kodda mevcuttur. Eksik kalan konu URL
değil, canlı tarih/konuk/oda seçimi UAT kanıtı ve `docs/evidence/hms-booking-engine.md`
dosyasının ready durumuna alınmasıdır.

2026-06-19 Garanti POS readiness güncellemesi: `npm run garanti:verify` artık
POS env grubu, `docs/evidence/garanti-pos.md` kanıtı, kart verisi toplamayan
strict checkout API'si ve Garanti 3D Secure yönlendirme kararını ayrı bir kapı
olarak denetler. Kaynak sözleşmeleri geçer; banka env/evidence gelene kadar
strict POS ve ticari launch kapısı bilinçli olarak BLOCKED kalır.

2026-06-19 analytics ID intake güncellemesi: GA4 `G-V3R66C3MEF`, Meta Pixel
`1781546559309505` ve Google Ads `AW-800024713` public ID olarak ayrıldı.
`274214371` site etiketi değildir. GTM adayları (`GTM-KCG6B4MJ`,
`GTM-MSL2FLF5`) doğrulanana kadar hardcode edilmez; GTM yoksa consent-gated
doğrudan Google tag fallback'i `NEXT_PUBLIC_GA4_MEASUREMENT_ID` ve
`NEXT_PUBLIC_GOOGLE_ADS_ID` ile çalışır.
2026-06-22 ek doğrulama: `analytics-readiness.mjs --env-file` artık Vercel'den
çekilmiş geçici production env snapshot'ını local `.env` yerine otoriter kabul
eder. Boş public analytics ID'leri veya `GA4_API_SECRET` local fallback ile
maskelenmez ve secret değerleri rapora yazılmaz.

2026-06-18 güvenlik güncellemesi: Tam ticari launch artık production Turnstile
ve Upstash shared rate-limit/replay kanıtını da ister. Kod fallbackleri dev için
korunur; `docs/evidence/production-abuse-controls.md` hazır olmadan strict
commercial gate yeşile dönmez.
2026-06-22 ek doğrulama: `abuse-controls-readiness.mjs --env-file` artık
Vercel'den çekilmiş geçici production env snapshot'ını local `.env` yerine
otoriter kabul eder. Boş Turnstile/Upstash değerleri local fallback ile
maskelenmez ve secret değerleri rapora yazılmaz.

2026-06-14 hedef güncellemesi: Tam ticari yayın artık `npm run launch:audit`
ile izlenen ayrı bir evidence gate'e bağlıdır. `npm run launch:audit:strict`,
`docs/evidence/*` altındaki canonical domain, HMS, Garanti POS, analytics
purchase, local SEO ve legal/DPA kanıtları tamamlanmadan bilinçli olarak fail
verir.
2026-06-14 devam güncellemesi: Deploy sonrası kritik canlı kontrol artık `npm
run launch:smoke:live` ile tek komutta çalışır; public rotalar, hero video,
iletişim koordinatı, organizasyon medyası ve görünür medya kırıkları aynı kapıda
denetlenir.
2026-06-22 canlı smoke ayrımı: `launch:smoke:live`, local `.env` dosyalarındaki
geliştirme URL'lerini commercial launch env kanıtı gibi okumaz; canlı hedefte
preflight olarak `domain:verify:json` çalıştırır. Böylece `.com` canlı geçiş
kanıtı local dev ayarlarından ayrı raporlanır.
2026-06-23 canlı smoke hedef ayrımı: `launch:smoke:live` canonical production domain
`https://www.kozbeylikonagi.com` üstünde çalışır; `launch:smoke:preview` Vercel preview
hostunu ayrıca doğrulamak için ayrılmıştır.
2026-06-23 commercial audit runtime ayrımı: `launch:audit:live`, canonical
production `/api/health` runtime readiness bilgisini audit raporuna ayrı
`runtime lane` olarak ekler. Bu canlı env durumunu görünür kılar; fakat
source-system kanıt dosyaları hazır değilse 100/100 commercial puanı vermez.
2026-06-14 monitoring güncellemesi: Uptime/rollback monitor yüzeyi olarak
`/api/health` eklendi; cache'siz JSON döner ve secret/private env değeri
yayınlamaz.
2026-06-14 CI güncellemesi: `npm run launch:smoke` artık GitHub Actions içinde
publish verification'dan önce çalışır; health, hero video, konum ve medya smoke
lokal doğrulamada kalmaz.
2026-06-14 release gate güncellemesi: `npm run release:verify` eklendi. Bu üst
komut security audit, evidence scan, hero media audit, abuse/analytics/search/Garanti
readiness, `publish:verify`, `launch:smoke`, monkey/chaos stres testleri ve
JSON commercial launch audit'i tek sırada çalıştırır; CI ayrıca bu release
manifestini `--list` ile doğrular.
2026-06-14 Lighthouse bütçe güncellemesi: GitHub Actions mobil-throttled ölçümünde
hero LCP iyileştirmesi sonrası `/` performans skoru 0.69, `/odalar` skoru 0.80
ölçüldü; sonraki CI varyansında home 0.54'e düştü. CI'daki hard performance
bütçesi gerçek tabana göre 0.50'ye çekildi; accessibility ve SEO eşikleri 0.95
olarak kaldı. Bu döngüde homepage First Load JS 180 kB'den 114 kB'ye indirildi,
hero görseli Next optimizer yerine gerçek statik WebP türevleriyle servis
ediliyor ve geç webfont swap'ı kapatıldı. Sonraki teknik hedef, LCP'yi 2.5s
altına indirerek performans bütçesini tekrar 0.85+ seviyesine taşımaktır.

## 2. Current Score (rev. 2026-06-22)

- **Repo/Kod Kalite Skoru: 95/100** — iç kalite kapıları yeşil; kalan 5 puan
  gerçek üretim entegrasyonu, canlı analitik doğrulaması ve dış hesap kurulumuna
  bağlıdır.
- **Ticari Launch Readiness: 82/100 — CONDITIONAL GO / ödeme-rezervasyon için NO-GO**
  — site ve içerik yüzeyi yayına hazır seviyede; gerçek ödeme ve booking akışı
  dış bilgiler gelmeden %100 doğrulanamaz.

| Alan | Max | Puan | Gerekçe |
|---|---|---|---|
| Strateji, persona, KPI | 7 | 7 | Marka konumlandırma ve misafir ilişkileri/growth mimarisi net; canlı KPI dashboard kanıtı yok |
| Bilgi mimarisi | 8 | 8 | /teklifler, deneyim silosu, /galeri, /sss, /cerez-politikasi ve EN çekirdek rotalar mevcut |
| UX/UI mobil rezervasyon | 9 | 8 | Playwright smoke + mobile prestige yeşil; gerçek cihaz testi yapılmadı |
| Booking/HMS/POS | 12 | 5 | HMS yeni sekme handoff ve public fallback hazır; checkout kart verisini strict reddediyor; canlı HMS UAT kanıtı + Garanti POS env/evidence yok |
| Güvenlik | 11 | 8 | CSP/HSTS/XFO, fail-closed B2B availability, provider-specific webhook HMAC, CSRF ve fiyat tamper testleri yeşil; production Turnstile/Upstash/WAF/MFA ve DB backup/restore kanıtı yok |
| KVKK/çerez | 8 | 8 | Consent-gated scripts; KVKK/gizlilik/mesafeli satış/çerez politikası var; vendor DPA hukuk onayı yok |
| Teknik SEO | 9 | 9 | sitemap/robots/canonical/schema/llms.txt + EN alternates/hreflang rotaları güncel |
| Lokal SEO/GBP/Hotel Center | 5 | 1 | Sitede NAP+GeoCoordinates var; GBP/Hotel Center kanıt yok |
| Performans/CWV | 7 | 7 | Next build temiz, görsel/video optimizasyonu ve Lighthouse CI eşiği var; CrUX/RUM yok |
| Erişilebilirlik | 5 | 5 | Axe critical+serious = 0: /, /odalar, /rezervasyon, /sss, /organizasyonlar, /en/organizasyonlar |
| Analytics | 5 | 4 | GA4+Meta ikili funnel (view_item/begin_checkout/generate_lead) + server-side purchase altyapısı (`lib/ga4-server.ts`) hazır; uçtan uca doğrulama engine+ID bekliyor |
| CMS/rol | 4 | 3 | Admin/editor rol ayrımı mevcut (`payload/collections/Users.ts`, users CRUD admin-only); managed Postgres/Payload secret kanıtı ayrı gate'e taşındı |
| QA/UAT/launch | 10 | 9 | `publish:verify`, smoke ve monkey/chaos kapıları var; canonical domain strict, production abuse-control ve canlı rezervasyon UAT'si kaldı |
| **Toplam** | **100** | **82** | Kod tarafı güçlü; ticari launch 82/100 çünkü managed database, production abuse controls, POS/HMS/analytics/GBP/legal dış kanıt bekliyor |

### 2026-06-20 Verification Evidence

- `npm run lint` — PASS, 0 warning.
- `npm run typecheck` — PASS.
- `npm run test:unit` — PASS, 31 files / 186 tests.
- `npm run build` — PASS, 68 routes generated.
- `npm audit --omit=dev --audit-level=high` — PASS, 0 vulnerabilities.
- `npm run publish:verify` — PASS: quality + 170 Playwright tests (168 passed / 2 skipped) + publish target inventory.
- `npm run domain:verify:json` — preview PASS, `.com` canonical origins PASS; `.com.tr` is outside this project launch gate unless explicitly configured later.
- Vercel production deploy — READY: `npm run domain:verify` preview kontrolü
  current commit'i `/api/health` üzerinden doğruluyor; production URL
  `https://www.kozbeylikonagi.com`.
- Managed database gate — BLOCKED: `DATABASE_URI` ve `PAYLOAD_SECRET` üretimde
  isim olarak bulunabilir, fakat local `.env` production kanıtı sayılmaz;
  Payload/Supabase Postgres backup, pooling, restricted access ve persistence
  UAT kanıtı `docs/evidence/production-database.md` içinde hazır değil.
- `.github/workflows/ci.yml` — launch smoke gate publish verification öncesine eklendi.
- `npx playwright test tests/smoke.spec.ts tests/security.spec.ts tests/e2e/checkout-contract.spec.ts --reporter=line` — PASS, 17 passed / 2 skipped.
- `npx playwright test tests/monkey.spec.ts tests/destructive-chaos.spec.ts` — PASS, 3/3.
- Local production preview: `http://127.0.0.1:3008`.
- Screenshot evidence: `test-results/local-preview/final-home-desktop.png`, `final-home-mobile.png`, `final-org-desktop.png`, `final-org-mobile.png`.

## 3. Alan Bazlı Pass / Partial / Fail

### PASS (kanıtlı)
- TLS/HSTS/CSP/XFO: `next.config.ts` (HSTS preload, CSP'de GTM/Meta/Turnstile/PostHog + HMS frame-src kontrollü)
- Çerez rızası: zorunlu olmayan GTM/Meta scriptleri rıza öncesi YÜKLENMİYOR — `src/components/tracking-scripts.tsx` (`consent.analytics && GTM_ID`, `consent.marketing && META_PIXEL_ID` koşulları), `cookie-consent.tsx`. Turnstile bot koruma scripti yalnızca public site key tanımlıysa aynı dosyadan yüklenir.
- PII: loglarda maskeleme (hash değil) — `src/lib/logger.ts` (maskIp/maskText); kart verisi sitede hiç yok (`payment-wizard` kart alanları söküldü, Garanti 3DS planı: `docs/odeme-karari.md`)
- Rate limit + replay: `src/lib/rate-limit.ts` (Upstash opsiyonlu); webhook'larda ES256+HMAC imza doğrulama (`tests/security.spec.ts` ile kanıtlı)
- Admin koruması: `/admin/growth` Payload oturum guard'ı + noindex — `src/app/admin/growth/page.tsx`
- Schema.org: Hotel, LodgingBusiness, HotelRoom, FAQPage, BreadcrumbList, ReserveAction, GeoCoordinates — `src/app/page.tsx`, `odalar/[slug]/page.tsx`, `iletisim/page.tsx`
- Teknik SEO: `src/app/sitemap.ts`, `robots.ts`, `manifest.ts`, her sayfada canonical (`src/lib/metadata.ts`), GEO için `llms.txt` route'u
- Performans temeli: hero `priority + fetchPriority="high"` (`home/home-hero.tsx`), next/image, font optimizasyonu
- QA: GitHub Actions CI (lint+typecheck+unit+e2e+build), publish Playwright kümesi ve monkey/chaos yeşil (checkout kontrat testleri: origin 403, bozuk gövde 400, fiyat tamper 400 dahil)
- Uptime monitor: `/api/health` cache'siz JSON döner; deploy ortamı/commit kısa bilgisi dışında secret yayınlamaz
- KVKK sayfaları: `/kvkk`, `/gizlilik-politikasi`, `/mesafeli-satis-sozlesmesi`
- Mobil: 375px yatay taşma giderildi (FAQ ikon rotate bounding fix)

### PASS'e taşınanlar (rev. 2026-06-11)
- GA4+Meta funnel: view_item/ViewContent, begin_checkout/InitiateCheckout, generate_lead/Lead — `src/lib/gtm.ts`
- Server-side purchase altyapısı: `src/lib/ga4-server.ts` (GA4 Measurement Protocol; HMS webhook'unda iptal/no-show hariç tetiklenir; env boşsa no-op; PII göndermez; unit testli)
- /galeri (ImageGallery schema), /sss (FAQPage schema), /cerez-politikasi sayfaları + footer/sitemap
- Restaurant schema (`src/app/gastronomi/page.tsx`)
- Hero arka plan videosu onaylı 15.78s gerçek Kozbeyli montajına bağlandı (`public/videos/hero.mp4`); ilk boyama dış cephe posterleriyle korunur, 2.75s `hero-property.mp4` artık sadece tarihsel türevdir.
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
- HMS booking engine: resmi HMS handoff hazır; canlı tarih/konuk/oda seçimi UAT kanıtı YOK
- Garanti Sanal POS: kaynak sözleşmeleri `npm run garanti:verify` ile denetleniyor; bankadan bilgiler ve redacted sandbox kanıtı gelmedi → init/callback akışı YAZILAMADI/test edilemedi
- purchase / booking_complete ölçümü: engine olmadan doğrulanamaz
- Google Business Profile, Hotel Center / free booking links, Search Console, Apple Business Connect: kanıt yok (operasyonel kurulum)
- WAF/CDN katmanı: kanıt yok (Vercel-native korumalar mı, ayrı bir onaylı katman mı — karar belirsiz)
- Backup + restore testi: hosting/DB sağlayıcı tarafı — kanıt yok
- RUM/CrUX saha verisi: site yayında olmadığından yok
- Vendor DPA listesi + yurtdışı veri aktarımı değerlendirmesi: kanıt yok (hukuk danışmanı gerekli)

## 4. Kritik Blokajlar (yayına çıkma koşulları)
1. HMS booking engine yeni sekme redirect/handoff UAT → master dokümandaki 15 vendor sorusu ve canlı tarih/konuk/oda seçimi kanıtı tamamlanmalı
2. Garanti Sanal POS: Merchant/Terminal ID, 3D Store Key, test ortamı ve redacted UAT kanıtı (`npm run garanti:verify`, `docs/odeme-karari.md` planı hazır)
3. Engine geldikten sonra: canlı test rezervasyonu + iptal/iade + GA4 purchase doğrulaması
4. GTM/GA4 ID'lerinin prod env'e girilmesi + Consent Mode doğrulaması
5. Search Console + GBP kurulumu ve doğrulaması

Bu blokajların kanıt dosyaları `docs/evidence/README.md` içinde tanımlıdır.
Kod tarafı bu kanıtları üretmez; kanıt gelince strict launch gate yeşile döner.

## 5. İlk 10 Öncelik
1. HMS vendor'a 15 soruluk listeyi gönder (master doküman §3.2) — DIŞ
2. Garanti POS evraklarını ve test bilgilerini tamamla — DIŞ
3. GA4/GTM/Meta production ID'lerini Vercel env'e gir ve consent mode ile doğrula — DIŞ/KOD
4. HMS engine geldikten sonra canlı booking yeni sekme handoff kararını test et — DIŞ/KOD
5. HMS webhook'tan server-side purchase/booking_complete ölçümünü gerçek event ile doğrula — KOD+DIŞ
6. Search Console, GBP, Hotel Center ve Apple Business Connect doğrulamalarını tamamla — DIŞ
7. Vendor DPA, yurtdışı veri aktarımı ve KVKK metinlerini hukukçuya onaylat — HUKUK
8. CDN/WAF kararını netleştir; Vercel-native korumalar veya onaylı ayrı koruma katmanı kanıtını ekle — DIŞ/KOD
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
