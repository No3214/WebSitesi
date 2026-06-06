# Kozbeyli Konağı — Tur 4 (Autopilot): Regresyon Ağı + Zengin Sonuçlar + 404

Önceki tur: 754ead7 (gerçek görseller, posterler, favicon/manifest).

## Wave 1 (paralel)

### T1 — Site geneli e2e smoke + API kontrat testi
- id: T1
- depends_on: []
- location: tests/e2e/site-smoke.spec.ts (yeni)
- description: Playwright: /, /odalar, /gastronomi, /menu, /organizasyonlar, /misafir-rehberi, /hikayemiz sayfaları 200 + ana başlık görünür; /odalar/standart-oda detayı açılır; /rezervasyon'da HMS URL boşken WhatsApp fallback butonu görünür; request.get("/api/local-pulse") → 200 + JSON'da generatedAt alanı string.
- validation: dosya mevcut; ≥9 test; mevcut e2e stiliyle uyumlu (PW_BASE_URL deseni).
- status: pending
- log:

### T2 — FAQPage JSON-LD (zengin sonuç)
- id: T2
- depends_on: []
- location: src/data/faqs.ts (yeni), src/components/home-client.tsx, src/app/page.tsx
- description: home-client'taki faqs dizisini src/data/faqs.ts'e çıkar (TR+EN aynen), home-client oradan import etsin (davranış birebir). src/app/page.tsx'e TR içerikle FAQPage JSON-LD script'i ekle (mainEntity: Question/acceptedAnswer).
- validation: page.tsx'te "FAQPage" geçer; home-client'ta lokal faqs tanımı kalmaz, '@/data/faqs' import edilir; build kırılmaz (sözdizimi tutarlı).
- status: pending
- log:

### T3 — Markalı 404 sayfası
- id: T3
- depends_on: []
- location: src/app/not-found.tsx
- description: Mevcut not-found'u oku; marka diliyle (taş konak/Ege tonunda, başlık + kısa metin TR) yeniden tasarla: SiteHeader + section + "Aradığınız sayfa taşınmış olabilir" + /  /odalar  /rezervasyon  /iletisim butonları. Layout footer'ı zaten global; footer EKLEME.
- validation: not-found.tsx'te "/rezervasyon" linki var, "SiteFooter" geçmez.
- status: pending
- log:

## Wave 2

### T4 — Gate: lint sıfır + vitest + build + e2e (genişlemiş) + push
- id: T4
- depends_on: [T1, T2, T3]
- description: npm run lint → warning'leri makul şekilde sıfırla (tracking-scripts img için gerekçeli eslint-disable); vitest unit; build EXIT:0; temiz next start + tüm tests/e2e; commit'ler + push.
- validation: lint EXIT:0; vitest PASS; BUILD_EXIT:0; PW 0 failed; push main -> main.
- status: pending
- log:

## Coverage
- "devam" → T1 (regresyon ağı), T2 (SEO zengin sonuç), T3 (404 UX), T4 (kalite kapısı + yayın).
