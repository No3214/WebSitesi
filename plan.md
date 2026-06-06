# Kozbeyli Konağı — Tur 3 (Autopilot): Görsel Sahiplik + PWA + Posterler

Önceki tur: 3b7ab61 (i18n, CTA birleştirme, OG, README, ECC testleri, e2e 2/2).

## Wave 1 (paralel)

### T1 — Unsplash bağımlılığını gerçek fotoğraflarla değiştir
- id: T1
- depends_on: []
- location: src/components/atmospheric-immersion.tsx, src/components/heritage-archive.tsx, src/components/history-client.tsx, src/components/living-museum-map.tsx, src/components/organizations-client.tsx, src/data/rooms.ts
- description: images.unsplash.com URL'lerini public/images/odalar altındaki gerçek fotoğraflarla değiştir (önce klasörleri listele, bağlama uygun seç; rooms.ts'te gerçek foto path'leri zaten varsa yalnız unsplash kalıntılarını değiştir). next.config.ts remotePatterns'a dokunma.
- validation: src altında grep "unsplash" → 0 sonuç; değiştirilen path'lerin dosyaları public altında mevcut.
- status: pending
- log:

### T2 — Video posterleri (ffmpeg) + gastronomi entegrasyonu
- id: T2
- depends_on: []
- location: public/videos/kahvalti-poster.jpg, public/videos/mihlama-poster.jpg, src/app/gastronomi/page.tsx
- description: Sandbox ffmpeg ile her videodan temsil karesi (~2sn) jpg poster üret (kalite -q:v 3, genişlik 1280); gastronomi sayfasındaki iki <video>'ya poster attribute ekle.
- validation: iki poster dosyası >20KB; gastronomi page.tsx'te poster="/videos/..." iki kez geçer.
- status: pending
- log:

### T3 — Favicon + PWA manifest
- id: T3
- depends_on: []
- location: src/app/icon.svg, src/app/manifest.ts
- description: public/logo.svg'yi src/app/icon.svg olarak kopyala (Next App Router otomatik favicon). src/app/manifest.ts: MetadataRoute.Manifest — name "Kozbeyli Konağı", short_name, description, start_url "/", display "standalone", background_color "#faf8f4", theme_color "#6b725c", icons [icon.svg any]. 
- validation: iki dosya mevcut; manifest.ts default export MetadataRoute.Manifest döner.
- status: pending
- log:

## Wave 2

### T4 — Gate: pull --rebase + build + e2e + push
- id: T4
- depends_on: [T1, T2, T3]
- description: Windows: git pull --rebase; npm run build EXIT:0; temiz next start + playwright e2e 2/2; görev commit'leri + push.
- validation: BUILD_EXIT:0; PW 0 failed; push main -> main.
- status: pending
- log:

## Coverage
- "devam geliştir" → T1 (marka görsel sahipliği + dış bağımlılık sıfırlama), T2 (gastronomi UX), T3 (favicon/PWA eksiği), T4 (yayın güvencesi).
