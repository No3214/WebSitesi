# Kozbeyli Konağı — Tur 7 (Swarm): Kalan Uzman Bulguları Topluca

Önceki tur: b69e5a1 (SSR sözlük, exit-intent, OG, AI sertleştirme, fail-closed origin).

## Wave 1 (paralel — kapsamlar ayrık)

### T1 — WhatsApp tek kaynak (numara tutarsızlığı KRİTİK)
- location: src/lib/contact.ts (yeni), src/components/floating-contact.tsx, src/components/contact-client.tsx, src/components/whatsapp-bridge.tsx, src/components/hotel-runner-embed.tsx
- description: E1 bulgusu — kodda 905322342686 ve 905322521010 karışık. lib/contact.ts: NEXT_PUBLIC_WHATSAPP_URL tabanlı getWhatsAppHref(message) helper. Sayılan bileşenler helper'ı kullansın; hardcoded wa.me kalmasın. (hms-booking-embed T2'nin dosyası — DOKUNMA.)
- validation: bu 4 bileşende "wa.me/90" hardcoded YOK; lib/contact.ts'te NEXT_PUBLIC_WHATSAPP_URL geçer.
- status: pending

### T2 — Oda → rezervasyon bağlam taşıma (CRO)
- location: src/components/room-detail-client.tsx, src/app/rezervasyon/page.tsx, src/components/reservation-client.tsx, src/components/hms-booking-embed.tsx
- description: Oda detayındaki CTA /rezervasyon?oda=<slug>'a gitsin. rezervasyon/page.tsx (server) searchParams.oda'yı okuyup rooms'tan başlığı bulsun → ReservationClient'a roomTitle/roomSlug prop. ReservationClient: başlık altında "Seçiminiz: <oda>" rozeti + HMSBookingEmbed'e roomSlug geç. HMSBookingEmbed: bookingUrl'e &room=<slug> ekle (URL doluyken), WhatsApp fallback mesajına oda adını ekle.
- validation: room-detail'de "?oda=" var; rezervasyon page'de searchParams okunur; embed'de roomSlug prop işlenir.
- status: pending

### T3 — CSP script/connect-src + yanlış hreflang temizliği
- location: next.config.ts, src/lib/metadata.ts
- description: ÖNCE Read: src/components/tracking-scripts.tsx + analytics-provider.tsx + consent-gated-scripts.tsx (hangi host'lar yükleniyor). CSP'ye ekle: script-src 'self' 'unsafe-inline' + tespit edilen host'lar (googletagmanager, google-analytics, connect.facebook.net, challenges.cloudflare.com, *.posthog.com vb.); connect-src 'self' + analytics beacon host'ları; default-src EKLEME (diğer direktifler serbest kalsın — kademeli sıkılaştırma). metadata.ts: var olmayan /en rotasına hreflang veren languages bloğunu kaldır (E3 bulgusu — yanlış sinyal).
- validation: next.config'de "script-src" var; metadata.ts'te "en-US" hreflang YOK.
- status: pending

### T4 — Webhook rezervasyon dedupe
- location: src/services/booking.ts
- description: E2 bulgusu — aynı imzalı gövde farklı x-message-uid ile tekrar gönderilince mükerrer lead oluşur. processHotelRunnerWebhook: organization-leads'e create etmeden önce source == `hotelrunner:${res.id}` kaydı var mı find; varsa create atla (status 200, duplicate:true notu). any tiplerini koru (payload tipleri ayrı iş).
- validation: booking.ts'te create öncesi source find kontrolü var.
- status: pending

### T5 — e2e: CSP ihlal nöbetçisi + parametreli rezervasyon
- location: tests/e2e/site-smoke.spec.ts
- description: (1) Smoke döngüsündeki her sayfa için page.on("console") ile "Content Security Policy" içeren error mesajlarını topla; varsa fail (CSP regresyon nöbetçisi). (2) Yeni test: /rezervasyon?oda=standart-bahce-manzarali-oda → sayfa yüklenir + WhatsApp linki görünür.
- validation: spec'te "Content Security Policy" yakalayıcı + "?oda=" testi var; toplam test ≥14.
- status: pending

## Wave 2 — T6 Gate
- vitest + build EXIT:0 + e2e tümü + push. Konsolda CSP ihlali = T3'e geri besleme.
- status: pending

## Coverage
- Numara tutarsızlığı (E1-KRİTİK op.) → T1; CRO funnel → T2; CSP+hreflang (E2/E3) → T3; replay/mükerrer (E2) → T4; regresyon ağı → T5; yayın güvencesi → T6.
