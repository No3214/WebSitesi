# Kozbeyli Konağı — Serena Onboarding

## Proje Özeti
Premium taş otel & restoran web sitesi (Kozbeyli Köyü, Foça/Ege). Çok dilli (TR ana, EN katmanı), dönüşüm odaklı vitrin + lead toplama. Rezervasyon motoru dışarıda (HMS). İçerik statik (`src/data/*.ts`), Payload sadece admin için.

## Teknoloji Yığını
- Next.js 15 (App Router, RSC) + React 19
- Payload CMS 3 + Postgres (`@payloadcms/db-postgres`) — yalnız `/admin` ve `/api`
- Tailwind v4 (@layer theme/base/components/utilities) + styled-jsx
- framer-motion, lucide-react
- Test: Vitest (unit), Playwright (e2e + @axe-core a11y)
- CI: GitHub Actions + Lighthouse CI (lighthouserc.json)
- Analytics: GA4 client funnel (lib/gtm.ts) + server purchase (lib/ga4-server.ts) + Meta Pixel
- Video kompozisyon: Remotion 4 (`video/` klasörü)
- Deploy: Vercel (uygulama) + Cloudflare (DNS/SSL/WAF/CDN) önünde; ağır medya için R2

## Önemli Komutlar (Windows / npm)
- `npm run build` — prod build (makinede NODE_ENV=production kalıcı; install'da --include=dev)
- `npm run test:unit` — Vitest unit (vitest 'unit' projesi)
- `npx playwright test` — e2e + a11y (tests/*.spec.ts; a11y yorgun makinede timeout 90s/goto 60s)
- `npm run lint`, `npm run typecheck`
- `npm run launch:smoke` / `launch:smoke:live` — yayın dumanı testi
- Remotion render: `npx remotion render video/index.ts Tanitim public/videos/tanitim.mp4 --codec h264`

## Konvansiyonlar
- TR ana dil; EN sayfaları `src/app/en/*` ince re-export sarmalayıcıları + kendi metadata
- hreflang HTML merge'i ezdiği için sitemap yöntemiyle veriliyor (src/app/sitemap.ts)
- Gece paleti: SunsetMode bileşeni 18:00-06:00 :root değişkenlerini styled-jsx ile eziyor → a11y testleri gece koşar, kontrast değişkenleri gece paletinde de tanımlı olmalı
- Marka dili: "Cheap/Budget/Basic" YASAK; "Authentic/Curation/Historic Texture/Aegean Hospitality" tercih (.claude/CLAUDE.md)
- Hero video: `/videos/hero.mp4` (şömineli reel); poster LCP elemanı, video fade-in

## Ortam Tuzakları (KRİTİK)
- OneDrive senkron GECİKMESİ: bash mount ile Windows kopyası farklı görünebilir; her kritik yazımdan sonra Windows tarafında doğrula
- OneDrive TRUNCATION: Türkçe karakterli dosyalarda Write/Edit kesilebilir; yazım sonrası satır/byte doğrula
- OneDrive'da toplu `sed -i` YASAK (dosya keser) → git checkout + tekrar
- Sandbox bash'te git kimliği YOK → push'u Windows üzerinden yap
- `memory/` ve build çıktıları gitignore'da

## Görev Tamamlama Kontrol Listesi
1. `npm run build` EXIT 0
2. `npm run test:unit` tüm testler PASS
3. İlgili e2e/a11y spec PASS (a11y: critical+serious = 0)
4. Windows kopyası senkron doğrulandı (satır/içerik)
5. commit + push (Windows tarafından), working tree temiz
