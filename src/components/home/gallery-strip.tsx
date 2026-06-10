"use client";

import Image from "next/image";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

const galleryShots = [
  { src: "/images/hero.jpg", caption: { tr: "Taş Avlu", en: "Stone Courtyard" } },
  { src: "/videos/kahvalti-poster.jpg", caption: { tr: "Serpme Kahvaltı", en: "Village Breakfast" } },
  { src: "/images/odalar/superrior-oda-deniz-manzarali/2.jpg", caption: { tr: "Superior Oda", en: "Superior Room" } },
  { src: "/videos/mihlama-poster.jpg", caption: { tr: "Ocak Başı", en: "By the Hearth" } },
  { src: "/images/odalar/standart-deniz-manzarali-oda/3.jpg", caption: { tr: "Ege Manzarası", en: "Aegean View" } },
  { src: "/images/odalar/aile-odasi-4-kisilik/2.jpg", caption: { tr: "Aile Odası", en: "Family Room" } },
  { src: "/images/odalar/balkonlu-aile-odasi-4-kisilik/3.jpg", caption: { tr: "Balkon Detayı", en: "Balcony Detail" } },
  { src: "/images/odalar/superrior-3-kisilik-oda-deniz-manzarali/4.jpg", caption: { tr: "Taş Doku", en: "Stone Texture" } },
];

export function GalleryStrip({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section section-alt" id="galeri" style={{ paddingBottom: 64 }}>
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "KONAKTAN KARELER" : "FRAMES FROM THE MANSION"}
            title={locale === "tr" ? "Taşın ve Işığın Günlüğü" : "A Journal of Stone and Light"}
          />
        </FadeIn>
      </div>
      <FadeIn delay={0.1}>
        <div className="container" style={{ width: "min(1400px, 100%)" }}>
          <div
            className="gallery-strip"
            aria-label={locale === "tr" ? "Konak fotoğraf galerisi" : "Mansion photo gallery"}
          >
            {galleryShots.map((shot, i) => (
              <figure key={i} className="gallery-item" style={{ margin: 0 }}>
                <Image
                  src={shot.src}
                  alt={shot.caption[locale]}
                  fill
                  sizes="(max-width: 640px) 70vw, 400px"
                  className="object-cover"
                  loading="lazy"
                />
                <figcaption>{shot.caption[locale]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
