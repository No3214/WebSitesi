# Kozbeyli Konağı — Tur 5 (L99): Uzman Heyeti Denetimi + Uygulama

Önceki tur: e9ee65d (e2e 13/13, oda detayları SSG, FAQPage, 404).

## Wave 1 (paralel — read-only uzman denetimleri)
- E1 CRO/Otel dönüşüm uzmanı: booking funnel, CTA hiyerarşisi, güven sinyalleri, mobil akış
- E2 Güvenlik denetçisi: headers, webhook, API yüzeyi, secrets, ECC entegrasyon noktaları
- E3 SEO/Performans denetçisi: metadata, schema, görsel boyutları, LCP, sitemap/robots
- E4 Mimari/kod kalitesi: client/server sınırları, env kullanımı, hata yönetimi, tip güvenliği
Çıktı: önem sıralı bulgular (KRİTİK/YÜKSEK/ORTA) + dosya işaretli öneriler.

## Wave 2 (konsolidasyon → hedefli uygulama, dosya kapsamları ayrık)
- Uzman bulgularından KRİTİK+YÜKSEK olanlar worker'lara dağıtılır (bu dosyaya işlenecek).
- Sabit görev W2-ECC: webhook route'una opsiyonel ES256 doğrulama (HMS_WEBHOOK_ES256_PUBLIC_KEY env'i doluysa verifyEs256Signature zorunlu) + .env.example güncelleme.
- status: pending

## Wave 3 — Gate
- vitest + build EXIT:0 + e2e 13/13 + push.
- status: pending

## Coverage
- "uzman görüşleriyle değerlendir" → E1-E4
- "her açıdan geliştir" → Wave 2 uygulamaları
- "ECC kullan" → W2-ECC (webhook ES256 canlı entegrasyon)
- "test et" → Wave 3 gate + mevcut 13 e2e
