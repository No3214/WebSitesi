# Stone & Light Editorial — Gerçeğe Oturtulmuş + Yükseltilmiş Spec

> Bu doküman, dışarıdan gelen "Temizlenmiş UI/UX Dönüşüm Planı"nın (Gemini kaynaklı)
> **mevcut repo gerçeğine göre denetlenmiş, düzeltilmiş ve 2025-2026 tekniğiyle
> yükseltilmiş** hâlidir. Amaç: planın iyi fikirlerini korumak, ama zaten yapılmış
> işi yeniden yazmamak ve kanıtsız/riskli adımları elemek.
>
> Statü: canlı site %100 yeşil (tsc temiz, 552+ unit test, Lighthouse 85+). Her
> değişiklik test + gate + canlı doğrulama ile korunur. Marka: sofistike, "asla ucuz
> değil". Sıfır halüsinasyon: `content/kozbeyli-facts.md` tek doğruluk kaynağı.

---

## 1. Ground-truth — plan iddiaları vs repo gerçeği

Plan, varsayılan bir başlangıç durumuna göre yazılmış. Repo ise 86+ görevle ilerledi.
Aşağıdaki eşleme, planın her "boşluk" iddiasını kanıta bağlar.

| Plan bölümü / iddia | Repo gerçeği | Durum |
|---|---|---|
| §4.1 `animations.tsx` primitive'leri "no-op" | `StaggerContainer` gerçek stagger, `Parallax` rAF+distance, `RevealLines` `translate3d(0,105%)` mask reveal, reduced-motion + IO fallback hepsi mevcut | **Zaten yapılmış** |
| §8.5 / §9 `TiltCard` + `MagneticLink` yok | İkisi de `animations.tsx`'te tanımlı **ve** `home-hero.tsx` + `MotionPrimitives.stories.tsx`'te kullanımda | **Zaten yapılmış** |
| §13/§14 gallery lightbox yok | `src/components/gallery-lightbox.tsx` mevcut | **Zaten var** |
| §5.2 surface tokenları eklenecek | `--surface-paper/-stone/-sun`, `--line-soft/-gold` globals.css'te mevcut (satır 69: "Stone & Light editorial surfaces") | **Zaten var** |
| §7 motion tokenları | `--ease-lux`, `--ease-editorial`, `--motion-fast/base/slow` mevcut; `--motion-cinematic` eksikti | **Kısmen → tamamlandı** |
| §5.3 radius ölçeği | Yalnız `--radius-editorial: 2px` vardı; tam ölçek yoktu | **Missing → eklendi** |
| §14 room-detail spec ikonları emoji | 📏/👥/🪟 emoji idi | **Missing → inline SVG'ye çevrildi** |
| §14 `unoptimized` "kaldır" | 120px strip thumbnail'ları + ana görsel | **Kasıtlı KORUNUR — aşağıya bak** |

**Sonuç:** Planın Wave 0-1'inin çoğu (primitive'ler, motion/surface token'ları,
magnetic/tilt, lightbox) fiilen tamamlanmış. Gerçek kalan boşluklar küçük ve nokta
atışı: emoji ikonlar, radius ölçeği, `--motion-cinematic`.

---

## 2. 2025-2026 teknik yükseltmeler (araştırma bulguları)

Planın seçimleri güncel best-practice ile doğrulandı; birkaç noktada daha iyi/
framework'süz yol var.

### 2.1 `unoptimized` KALDIRILMAZ (planın §14'ünü düzeltir)
Next/Vercel dokümantasyonu: <10KB görseller, ikon/thumbnail, SVG, GIF için
`unoptimized` **önerilen** yoldur (dönüşüm/cache maliyeti yok). Ayrıca Vercel ücretsiz
katmanı **1000 optimize görsel/ay** ile sınırlı; aşımda ücret. Room-detail 120px
strip'leri tam da bu kategoride. Dolayısıyla "gerekçeli audit" sonucu: **KORU** —
kaldırmak owner'a maliyet çıkarır (planın §2'sinde yasaklanan "gereksiz maliyet").

### 2.2 Sayfa geçişleri (§15): View Transitions API tercih edilmeli
- Same-document VT artık **Baseline** (Chrome 111+, Safari 18+, Firefox 144+).
- Cross-document (MPA) VT: Chrome 126+, Safari 18.2+, Firefox yolda.
- Öneri: JS/framer geçiş yerine, `@view-transition` + `@supports` ile
  **progressive enhancement**; desteklemeyen motorda anında (fade'siz) düşer.
  Next App Router `loading.tsx` + mevcut LoadingBar korunur, route gecikmesi yok.
- Bu tur uygulanmadı (canlı sitede regresyon riski > kazanç); ayrı dalga.

### 2.3 Reveal/parallax (§8): CSS scroll-driven animations ile hafiflet
- `animation-timeline: view()` / `scroll()` — Chrome 115+, Safari 18+; Firefox flag.
- Best-practice: `@supports (animation-timeline: view())` ile ana-thread'siz reveal;
  mevcut IntersectionObserver JS yolu **fallback** olarak kalır.
- Mevcut JS yolu doğru ve güvenli; CSS SDA bir perf yükseltmesi (opsiyonel dalga).

### 2.4 Tipografi (§6): `text-wrap: balance/pretty`
- Başlıklarda `text-wrap: balance`, uzun gövdede `text-wrap: pretty` — Baseline'a
  yakın, güvenli progressive enhancement. TR uzun başlıklar için özellikle değerli.

---

## 3. Korunan güçlü parçalar (yeniden yazma)

Palet (olive/gold/ivory/stone/azure/ink), Playfair+Inter tipografi, tam-ekran gerçek
video hero + poster, header overlay→solid, `prefers-reduced-motion`, framer-motion.
Yeni font / GSAP / Lenis / R3F / Spline / carousel kütüphanesi **eklenmez**.

---

## 4. Düzeltilmiş dalga planı (gerçeğe göre)

- **Wave 1 (token + primitive):** primitive'ler ✓ zaten; token boşlukları (radius
  ölçeği, `--motion-cinematic`) ✓ bu turda kapatıldı.
- **Wave 2 (hero + CTA polish):** başlık line-reveal + hafif ambient scale + tek imza
  detay; soft-magnetic yalnız birincil rezervasyon CTA'sı (hitbox sabit, touch/reduced
  pasif). *MagneticLink zaten hero'da; polish + sınır denetimi kaldı.*
- **Wave 3 (editorial room mosaic):** eşit grid → kontrollü asimetri; featured oda
  config/CMS ile; oynatma yalnız gerçek video varsa.
- **Wave 4 (gastronomi + galeri):** editorial split + native scroll-snap filmstrip;
  lightbox zaten var → a11y/klavye cilası.
- **Wave 5 (room-detail viewer):** swipe/drag + tam-ekran; emoji ✓ kaldırıldı; spec
  kartları radius token'ına ✓ bağlandı; `unoptimized` korunur.
- **Wave 6 (story/spatial):** yalnız `/hikayemiz`, CSS `TiltCard`, gerçek asset; 3D
  (R3F) ayrı onay.
- **Wave 7 (page transitions):** §2.2 — View Transitions API + `@supports`.

---

## 5. Acceptance budgets (değişmez)

Core route'ta: yeni WebGL/smooth-scroll/carousel/font yok, yeni autoplay yok, hero LCP
gerilemez, CLS ≤ baseline, klavye erişimi + reduced-motion geçer. Motion sınırları:
magnetic ≤6px, tilt ≤4°, parallax ≤24px, scale ≤1.05, route geçişi ≤240ms.

---

## 6. Bu turda uygulananlar (kanıt)

1. **room-detail spec ikonları:** 📏/👥/🪟 emoji → bağımlılıksız, `aria-hidden`,
   `currentColor` inline SVG. "Manzara" ikonu marka **kemer** motifiyle uyumlu.
2. **Tasarım token temeli:** tam radius ölçeği (`--radius-xs…pill`) + `--motion-cinematic`;
   `--radius-md` gerçek tüketiciye (spec-card) bağlandı (dead-token değil).
3. **Kilit testi:** `tests/design-stone-light.test.ts` — emoji yokluğu + SVG varlığı +
   token varlığı + `unoptimized` kasıtlı korunumu.
4. **Düzeltmeler belgelendi:** `unoptimized` korunur (maliyet); primitive'ler/lightbox
   zaten mevcut (yeniden yazılmadı).

Gate: tsc temiz + 552+ unit yeşil + Lighthouse 85+ korunur; commit + push + canlı doğrulama.
