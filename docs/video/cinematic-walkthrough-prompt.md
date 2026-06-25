# Kozbeyli Konağı — Sinematik Walkthrough Video Promptu (Videographer Akışı)

> Amaç: "fotoğrafların birbirine geçmesi" hissini bırakıp, profesyonel bir
> videografın gimbal'la mekânda **kesintisiz yürüdüğü** uzamsal-sürekli bir tur.

## ÖNEMLİ — Teknik gerçek (dürüst not)
Şu an odaların tanıtım videoları ffmpeg ile **gerçek fotoğraflardan** üretilen
crossfade slideshow'lar (halüsinasyon yok, sadık). Tek karelerden gerçek bir
"yürüyüş" sürekliliği **üretilemez**; bunun için image/text-to-video bir model
gerekir (Google Veo 3, Kling 1.6, Runway Gen-3, Luma). Bu modeller mekânı
**kısmen uydurur** (duvar/mobilya morph riski) — yani "sadece gerçek foto,
sıfır halüsinasyon" şartıyla tam walkthrough arasında bir denge var.

İki yol:
- **A) Sadık (önerilen, güvenli):** ffmpeg Ken Burns — yön-tutarlı yavaş
  push-in + kapı/eşik üzerinde match-cut. Gerçek foto, sıfır uydurma.
- **B) Sinematik AI walkthrough:** aşağıdaki prompt'u Veo/Kling'e ver; daha
  etkileyici ama bir miktar uydurma kabul edilir. Referans foto besle.

---

## Ana Prompt (EN — modele yapıştır)

```
Create a premium cinematic real-estate walkthrough of a historic Aegean stone
boutique hotel (Ottoman stone house, olive groves, warm ivory interiors) with
strong spatial continuity. The camera must feel like a professional videographer
physically walking through the property. Begin with a slow exterior establishing
shot of the stone facade, then smoothly push forward toward the entrance and
naturally pass through the doorway into the interior. Continue through the rooms
in a logical architectural sequence; every space physically connected to the
previous one. Realistic depth, natural parallax, foreground movement, accurate
room proportions.

Camera: smooth gimbal and slow dolly; wide-angle 20-24mm architectural lens;
straight vertical lines, no lens distortion; eye-level height; slow controlled
forward motion; subtle cinematic pans and gentle orbits; stable professional
real-estate videography; natural acceleration/deceleration; realistic motion
blur; 24 fps.

Transitions created through physical camera movement, not slideshow effects.
Use doorways, stone arches, columns, curtains, olive branches and furniture as
natural transition points; the camera may briefly pass behind a wall or dark
foreground object and reveal the next connected room. Seamless doorway
transitions, foreground-occlusion transitions, subtle match cuts, continuous
push-in. One uninterrupted journey.

Lighting: natural Aegean daylight mixed with warm interior lighting, balanced
exposure, realistic window highlights, premium hospitality atmosphere, soft
shadows, high dynamic range, elegant inviting mood.

Quality: ultra-realistic, cinematic, sophisticated luxury property film,
professional architectural videography, realistic stone/wood/textile textures,
accurate perspective, clean composition, 4K detail. Immersive, spacious, calm,
elegant. Must NOT look like separate photographs animated independently.
```

## Negatif Prompt

```
No slideshow effect, no random crossfades, no teleporting between rooms, no
sudden scene changes, no disconnected architecture, no morphing walls, no
bending furniture, no fisheye distortion, no shaky handheld, no fast zooms, no
whip pans, no excessive speed ramps, no floating/drone-like indoor movement, no
artificial 3D look, no surreal motion, no duplicated furniture, no changing
decoration, no warped doors, no flickering lights, no unstable windows, no
people appearing suddenly, no text, no logos.
```

## Geçiş vurgusu (ek komut)

```
Prioritize spatially motivated transitions. The camera always travels toward the
next location rather than cutting randomly. Hide each transition with
architectural elements: enter through doors, move past stone walls, slide behind
columns, pass close to furniture, or fill the frame briefly with a foreground
object before revealing the next room. Preserve direction of movement and camera
height between every shot.
```

## Kozbeyli sahne dizisi (her biri 4-6 sn, bağlantılı)
Her sahnenin SON karesi, sonraki sahnenin İLK karesiyle aynı hareket yönünde.

1. Taş cephe + zeytinlik → giriş kapısına yavaş yaklaşma
2. Ahşap kapıdan geçiş → taş antre (foreground: kapı pervazı occlusion)
3. Antre → salon/oturma (kemerin altından geçiş)
4. Salon → restoran / kahvaltı terası (perde geçişi)
5. Koridor → oda (kapı match-cut)
6. Oda → balkon / deniz-zeytinlik manzarası (pencereye push-in)
7. Detay çekimleri (dibek kahvesi, taş doku, reçel) → çatı terası genel kapanış

> Üretim sonrası: 24fps, hafif film grain, sıcak LUT (amber/zeytin),
> 15-20 sn final. Marka rengi: zeytin #505D4B, antik altın #C4A265.
