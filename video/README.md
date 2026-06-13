# Remotion — Kozbeyli Konağı Tanıtım Kompoziti

30 saniyelik dikey (1080x1920, 30fps) tanıtım videosu: drone açılışı → şefin
tabağı → gün batımı → şömine → logo bitiş kartı. Kaynak klipler `public/videos/`
altındaki mevcut mp4'lerdir (`staticFile` kökü = proje `public/` klasörü).

Not: klasör adı `video/` — `remotion/` adı, tsconfig `baseUrl: "."` ile paket
adıyla çakışıp bare `"remotion"` importlarını bu klasöre çözdürüyordu.

## Render

```bash
npx remotion render video/index.ts Tanitim public/videos/tanitim.mp4 --codec h264
```

Önizleme stüdyosu:

```bash
npx remotion studio video/index.ts
```

## Notlar

- Gerekli paketler kökte kurulu: `remotion`, `@remotion/cli`, `@remotion/renderer` (devDependencies).
- `OffthreadVideo.startFrom` birimi kompozisyon frame'idir (30fps): `startFrom={165}` ≈ kaynak videonun 5.5sn'si.
- Çıktı `public/videos/tanitim.mp4` — siteye koymadan önce boyutu kontrol edin (gerekirse ffmpeg CRF 27).
