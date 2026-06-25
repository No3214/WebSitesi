# Kozbeyli Konağı — 2026 Tasarım / Motion / Araç Taraması

Tarih: 2026-06-25. Amaç: güncel (2026) tasarım-motion trendlerini, projeye uygun
araç/MCP/skill envanterini ve somut sonraki dalgaları kanıt-temelli derlemek.
Bu doc bir araştırma çıktısıdır; uygulama kararları wave'lerde testle korunarak yapılır.

## 1. 2026 Lüks Otel Web Tasarım Trendleri (web taraması)

Bulgular mevcut **"Stone & Light Editorial"** yönünü DOĞRULUYOR:

- **Quiet luxury / restraint**: 2026'da lüks "daha az gürültü, daha az uyaran" demek;
  sıcak bej, derin zeytin, antrasit gibi toprak/muted paletler — sert siyah-beyaz değil.
  → Bizim stone/olive/linen/charcoal token yönümüzle birebir örtüşüyor.
- **Yavaş sinematik hero + ince motion**: Aman ana sayfası yavaş, sinematik açılışla
  "durağan huzur" veriyor. Mikro-etkileşimler (nazik hover, scroll-reveal fade/slide)
  daha taktil ama abartısız. → 15.78s hero montajı + hafif reveal yaklaşımımız doğru.
- **Editoryal storytelling**: The Hoxton/Kimpton tam ekran görsel + konum bazlı anlatı,
  her zaman görünür rezervasyon CTA. → Editoryal akış + sürekli booking CTA hedefimiz doğru.
- **Görsel hiyerarşi + whitespace**: cömert beyaz boşluk, net CTA, güçlü tipografi.

**Karar**: Yön değişmiyor. Ağır WebGL/3D/Lenis/custom-cursor reddi 2026 trendiyle de tutarlı
(trend "daha az uyaran" diyor). Yapılacak: mevcut yönü daha disiplinli motion + View Transitions ile cilalamak.

## 2. Benimsenecek Güncel Teknik: View Transitions API (Next.js 15 / React 19)

- Native, **sıfır-JS**, tarayıcı compositor katmanında çalışır → GPU'da 60fps, layout jank yok.
- Next.js'te `next.config` içinde `viewTransition: true`; React `<ViewTransition>` ile
  route geçişlerinde otomatik. Progressive enhancement: desteklemeyen tarayıcıda normal navigasyon.
- ~%78 küresel destek (Mart 2026; Chromium + Safari 18; Firefox flag arkasında).
- Tuzak: `.map()` içinde statik `name` kullanma (her öğeye `name={"x-"+id}`); root layout'a
  statik `name` verme (boyut snapping).
- **Bizim için**: kısa opacity/crossfade route geçişi — master prompt'un izin verdiği
  "progressive enhancement" maddesiyle uyumlu, yeni dependency YOK. → Wave adayı.

## 3. Bu Ortamda Mevcut, Projeye Yarayan MCP / Skill / Plugin Envanteri

Yeni kurulum gerektirmeyen, bu projeye doğrudan değer katanlar:

- **figma** (figma-generate-design, figma-use): tasarım→kod, design system token üretimi.
- **searchfit-seo / marketing:seo-audit / sanity:seo-aeo-best-practices**: teknik SEO,
  schema markup, AI-visibility (AEO) denetimi — llms.txt/JSON-LD çalışmamızı tamamlar.
- **design plugin** (accessibility-review, design-critique, design-system, ux-copy):
  WCAG 2.2 AA denetimi ve editoryal kopya — Definition of Done a11y kapısıyla örtüşür.
- **cloudinary** (cloudinary-transformations): opsiyonel; biz yerel medya + ffmpeg kullanıyoruz,
  ama responsive/AVIF türevleri için referans.
- **nimble / brightdata / common-room**: rakip (Soleil Mansion, Foça Dome, Varia) ve
  marka-mention araştırması — konumlandırma için.
- **anthropic-skills: docx / pdf / pptx**: işletmeye sunum/rapor üretimi.
- **web-artifacts-builder / canvas-design**: hızlı görsel prototip.

**Bağlı OLMAYAN (not):** Serena (semantik kod gezinme) bu oturumda MCP olarak bağlı değil;
`.serena/` config + memory var ama araç yok. Bağlanırsa büyük refactor dalgalarında hız katar.

**Prompt**: Kanonik master prompt = birleştirilmiş "STONE & LIGHT — CINEMATIC AEGEAN HERITAGE"
(audit→medya→plan→uygulama, kabul kapıları). Tek düzeltme: veri katmanı = Payload 3 + Postgres
(`@payloadcms/db-postgres`), Supabase sadece güvenlik-hazırlık script'lerinde.

## 4. Somut Sonraki Dalgalar (sıra, hepsi testle korunacak)

1. **EditorialLinkUnderline** — TAMAM (Wave 1, c9f1626).
2. **View Transitions API** route crossfade (zero-JS, reduced-motion fallback, progressive enhancement).
3. **Motion token merkezi** (`src/lib/motion.ts`): süre/easing/parallax/tilt sabitleri tek kaynak.
4. **AccessibleRoomGallery** kabul kriterleri (keyboard/swipe/escape/focus-trap/reduced-motion).
5. **HeritageTimeline** (/hikayemiz) — doğrulanmış tarih, hairline, scroll-hijack yok.
6. **a11y + content trust** sürekli denetim (mevcut guard testleri genişlet).

Kaynaklar: mediaboom.com, skift.com, hotelyearbook.com, thisrapt.com (2026 otel tasarım trendleri);
nextjs.org/docs (View Transitions), MDN View Transition API, dev.to (2026 page transitions).
