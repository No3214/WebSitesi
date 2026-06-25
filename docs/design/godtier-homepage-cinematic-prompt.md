# KOZBEYLİ KONAĞI — GOD-TIER ANA SAYFA SİNEMATİK YÜKSELTME PROMPTU (FINAL, repo-grounded)

> Bu, `No3214/WebSitesi` ana sayfasını "premium template"ten "award-tier sinematik"e
> taşıyan tek brief'tir. Repo gerçeğine ve 2026 güncel araç durumuna göre düzeltilmiştir.
> Kullanım: `agentic-core:planner` ile `plan.md` üret → `swarm` ile dalga dalga uygula →
> her dalga sonunda `validator` kapısı. Booking/ödeme akışlarını KIRMADAN.

---

## 0) REPO GERÇEĞİ İLE DÜZELTMELER (önceki taslaktaki yanlışlar)

1. **Hero ZATEN video.** `src/components/home/home-hero.tsx` masaüstü `hero.mp4` (15.78s) +
   mobil `hero-mobile.mp4` + LCP posteri + `matchMedia("(max-width: 767px)")` kullanıyor.
   "Statik poster → video" PREMİSİ YANLIŞ. Görev: mevcut video hero'yu CİLALAMAK
   (SplitText başlık reveal, çok düşük opacity grain/aurora overlay, hafif parallax) — değiştirmek değil.
   **GUARDRAIL:** `tests/media-curation.test.ts` hero kaynaklarını pinler; hero'ya dokunursan
   `HERO_VIDEO_SRC="/videos/hero.mp4"`, `HERO_MOBILE_VIDEO_SRC`, `data-desktop/mobile-src`,
   `matchMedia` string'leri ve `src/data/media-manifest.ts` hash'leri korunmalı/güncellenmeli.
2. **Veri katmanı Supabase DEĞİL.** Payload CMS 3 + `@payloadcms/db-postgres` (Postgres).
   Supabase yalnız `supabase:verify` güvenlik-hazırlık script'lerinde referanslı.
3. **Lisans istisnası.** GSAP artık ücretsiz/ticari (Webflow, Nisan 2025) ama lisansı OSI-MIT
   DEĞİL ("GreenSock Standard License", ücretsiz). Kural: client bundle'a sadece
   **MIT/Apache/ISC + GSAP'ın ücretsiz standart lisansı** girsin. AGPL/GPL kesinlikle hayır.
4. **Mevcut motion primitive'leri kullan.** `src/components/animations.tsx`: FadeIn,
   StaggerContainer, RevealLines, Parallax, MagneticLink, TiltCard + `src/lib/motion.ts`
   token sistemi zaten var. Aynı iş için ikinci motion runtime ekleme; bu primitive'leri genişlet.

---

## 1) DEĞİŞTİRİLEMEZ KISITLAR (hard constraints)

1. **Booking/ödeme dokunulmaz:** HMS handoff (`NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL`),
   `/api/checkout`, `/api/webhook/*`, Garanti Sanal POS, WhatsApp fallback davranışı değişmez.
   Sadece görsel/animasyon katmanı.
2. **Lisans hijyeni** (madde 0.3). Yeni dependency eklerken `package.json`'a lisans notu yaz.
3. **21st.dev Magic MCP KULLANMA** — doğrulanmış: yamalanmamış prompt-injection açığı,
   ~3 aydır commit yok, advisory 55 gün yanıtsız. React Bits'i shadcn CLI ile kur, kaynağı repoya indir.
4. **`prefers-reduced-motion` zorunlu** (WCAG 2.3.3). Reduced-motion açıkken parallax/scrub/
   scramble/autoplay kapanır, sadece opacity fade kalır. `useReducedMotion` + `gsap.matchMedia`.
5. **Performans bütçesi kutsal.** `lighthouserc.json` + CI yeşil. Mobile Lighthouse ≥ 90,
   LCP < 2.5s, CLS < 0.1, INP < 200ms. Hero posteri ilk boyada hazır; animasyon LCP'yi geciktirmez.
6. **Marka kilidi.** Zeytin `#505D4B`, Antik Altın `#C4A265`, Fildişi `#F8F5F0` (theme `#fbf6eb`).
   Font: Playfair Display, Cormorant Garamond, Raleway. Yeni renk/font icat etme; tondan derinlik türet.
7. **İçerik/SEO/i18n bütünlüğü.** TR/EN metinler, structured data (`src/lib/schema.ts`),
   `src/dictionaries/` bozulmaz. EN ile TR eş davranış. Kanıtsız iddia eklenmez
   (`tests/trust-claims.test.ts` guard'ı aktif).
8. **Server Component disiplini.** GSAP/Lenis/R3F sadece `"use client"`. Booking CTA'ları
   SSR'da görünür/tıklanabilir (JS yüklenmese bile).

---

## 2) ANİMASYON MİMARİSİ (doğru iş → doğru araç)

- **Framer Motion (var):** UI mikro-etkileşim, AnimatePresence, hover/tap, shared layout.
- **GSAP + ScrollTrigger (kur, ücretsiz):** sinematik scroll — pin/scrub/parallax/koreografi.
  `@gsap/react` `useGSAP` + `gsap.matchMedia`. Core ~23KB + ScrollTrigger ~7KB, tree-shake.
- **GSAP SplitText (kur, ücretsiz):** display başlık reveal (kelime/karakter stagger).
- **Lenis (kur, MIT):** smooth scroll inertia; `lenis.on('scroll', ScrollTrigger.update)`. Reduced-motion'da kapalı.
- **React Bits (MIT, shadcn CLI, seçici):** sadece statement arka plan — Aurora/Grainient
  (amber/zeytin tonu, çok düşük opacity, hero/CTA fonu). Demo mor/neon renklerini kullanma.
  Kur: `npx shadcn@latest add @react-bits/<Component>-TS-TW`, kaynağı repoda tut, marka rengine prop'la.
- **R3F (opsiyonel, TEK imza anı):** yalnız bütçe izin verirse + LCP'yi bozmuyorsa (örn. zeytin dalı/dibek).
  Ağırsa hiç ekleme — performans her zaman kazanır. `next/dynamic` ile code-split.
- **Alternatif statement kaynakları (referans):** Aceternity (hero gösteri), Magic UI (utility anim).
  Bunları da paket kurmadan, fikir/kaynak olarak; her component için lisans+a11y+bundle matrisi.

---

## 3) DALGA PLANI (her dalga: implement → test → reduced-motion → Lighthouse → push)

- **Dalga 1 — Medya (animasyonsuz, en yüksek ROI):** Drive'dan eksik türevleri ekle
  (akşam yemeği videosu → gastronomi; düğün foto → /organizasyonlar; oda mini-loop → kart hover).
  Her video 3 türev (1080p H.264 MP4 + WebM/VP9 + 1280 poster.webp), `preload="metadata"`,
  `playsInline muted`, autoplay yalnız viewport + reduced-motion kapalı. `media:hero` + `media:playback:live` kırılmaz.
- **Dalga 2 — Altyapı:** Lenis + GSAP + ScrollTrigger + SplitText kur, `gsap.matchMedia`
  reduced-motion iskeleti, `next/dynamic` code-split. Görsel değişiklik minimal.
- **Dalga 3 — Hero cila + scroll reveal:** SplitText başlık (stagger 0.08s, power3.out, <1s),
  hero hafif parallax (1.05→1.0 scale, PIN YOK — CTA hızlı erişilebilir), bölüm reveal koreografisi.
- **Dalga 4 — Galeri + micro-interactions:** galeri masonry reveal / shared-layout lightbox
  (`layoutId`), oda kart hover (zoom + 2. görsel crossfade), paket numara parallax, hover state'leri.
- **Dalga 5 — Statement katman (opsiyonel):** React Bits aurora/grain (amber) + zarif imleç;
  bütçe izin verirse tek R3F imza anı.
- **Dalga 6 — Cila + doğrulama:** tipografi modüler ölçek (1.25/1.333), renk derinliği (2-3 ton),
  8px spacing ritmi, tam doğrulama paketi + Lighthouse + gerçek cihaz.

---

## 4) DOĞRULAMA (definition of done — hepsi yeşil)

```
npm run lint && npm run typecheck && npm run test:unit && npm run build
npm run launch:smoke
npm run media:hero
npm run media:playback:live   # deploy sonrası
npm run live:verify
```
Manuel: Lighthouse mobile ≥ 90 / LCP < 2.5s / CLS < 0.1 · reduced-motion'da scrub/parallax durdu
sadece fade kaldı · Booking CTA + WhatsApp JS'siz tıklanabilir · EN == TR animasyon davranışı ·
gerçek mobil cihazda 60fps · Garanti POS/webhook regresyonsuz.

**Teslim:** küçük gözden geçirilebilir PR'lar (dalga başına commit), her PR'da before/after
GIF + Lighthouse before/after + eklenen dependency lisans notu. Production deploy'u Vercel otomatik
yapar; görsel doğrulamayı Vercel production URL'sinden al (lokal dev OneDrive `.next` sorunu flaky).

---

## 5) ARAŞTIRMA KAYNAKLARI (2026 güncel, doğrulanmış)

- **React Bits** — reactbits.dev · github.com/DavidHDev/react-bits — MIT, 110+ animasyonlu
  component, shadcn CLI (`@react-bits/<C>-TS-TW`), React 19/Next 15, Server Component metin animasyonu. (Önerilen.)
- **GSAP** — gsap.com — Nisan 2025'ten beri TÜM pluginler (ScrollTrigger, SplitText, MorphSVG,
  DrawSVG) ücretsiz + ticari. SplitText yeniden yazıldı (~%50 küçük). `@gsap/react` `useGSAP`.
- **Lenis** — lenis.darkroom.engineering — MIT smooth scroll, GSAP ile senkron.
- **Motion** — motion.dev — Framer Motion'un devamı; UI/layout/gesture standardı (zaten kullanımda).
- **Aceternity UI** — ui.aceternity.com — hero gösteri momentleri (3D kart, spotlight, mesh) —
  fikir kaynağı; markaya göre yeniden yaz, mor/neon alma.
- **Magic UI** — magicui.design — utility animasyon (shimmer, marquee, bento), aktif bakım, light/dark.
- **21st.dev Magic MCP** — KAÇIN: yamalanmamış prompt-injection açığı, durağan repo (2026 ortası).

> Kaynaklar: webflow.com/blog/gsap-becomes-free, css-tricks.com (GSAP free), github.com/DavidHDev/react-bits,
> reactbits.dev, pkgpulse.com (react-bits vs Aceternity vs Magic UI 2026), MCP prompt-injection advisory'leri.
