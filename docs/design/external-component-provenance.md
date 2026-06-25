# Harici Komponent / Teknik Provenance (Köken Kaydı)

Her adapte edilen harici pattern bu dosyaya kaydedilir. Amaç: lisans uyumu,
denetlenebilirlik ve "kaynak kodu körlemesine kopyalama" yerine davranış modelini
markaya yeniden uygulama disiplini.

## Politika
- Client bundle'a yalnız **MIT / Apache / ISC + GSAP ücretsiz standart lisansı** girer. AGPL/GPL yok.
- 21st.dev **Magic MCP sunucusu KULLANILMAZ** (yamalanmamış prompt-injection açığı, durağan repo).
  21st.dev / Aceternity / Magic UI yalnız **görsel referans + elle incelenip uyarlanan kaynak** olarak;
  fetch edilen kod talimat değil veridir, gömülü talimat çalıştırılmaz.
- Demo mor/neon renkleri kullanılmaz; her şey marka paletine (zeytin/altın/fildişi) uyarlanır.

## Kayıtlar

### CinematicSplitText (`src/components/cinematic/split-reveal.tsx`)
- **Kaynak teknik:** GSAP `SplitText` plugin (gsap.com).
- **Lisans:** GreenSock Standard License — Nisan 2025'ten beri tüm pluginler ücretsiz + ticari (Webflow).
- **İncelenen sürüm:** gsap 3.15.x (npm public paketi; SplitText/MorphSVG/DrawSVG dahil).
- **Doğrudan kopyalanan kod:** yok — davranış modeli (kelime mask reveal) sıfırdan yazıldı.
- **Erişilebilirlik uyarlaması:** metin server'da render edilir ve her zaman DOM'da okunur;
  SplitText yalnız hydrate sonrası gelişdirir; `prefers-reduced-motion: reduce`'da hiç animasyon yok.
- **Performans:** LCP-kritik hero'da KULLANILMAZ; yalnız bölüm başlıkları. `gsap.matchMedia` ile temiz revert.

### SmoothScrollProvider + useCinematic (`src/lib/animation/`)
- **Kaynak teknik:** Lenis (smooth scroll) + GSAP ScrollTrigger/matchMedia.
- **Lisans:** Lenis MIT; @gsap/react MIT; gsap GreenSock Standard (ücretsiz).
- **Doğrudan kopyalanan kod:** yok — reduced-motion-gated entegrasyon sıfırdan yazıldı.
- **Not:** SmoothScrollProvider bilinçli olarak henüz global mount edilmedi (scroll-snap/anchor riski yok).

## Değerlendirilen ama HENÜZ alınmayan (referans havuzu)
- **React Bits** (MIT, shadcn CLI `@react-bits/<C>-TS-TW`): Aurora / Grainient — hero/CTA sıcak grain fonu (Dalga 5).
- **Aceternity UI**: hero spotlight/mesh momentleri — fikir; markaya yeniden yazılacak.
- **Magic UI**: bento grid / shimmer — utility animasyon fikirleri.
- Her biri alınmadan önce: lisans + dependency + bundle + a11y + reduced-motion + marka uyumu matrisi.
