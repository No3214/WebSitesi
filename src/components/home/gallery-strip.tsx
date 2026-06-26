"use client";

import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { galleryShots } from "@/data/gallery";

function filmstripRhythm(index: number) {
  if (index === 0) return "gallery-item gallery-item-hero";
  if (index % 5 === 1 || index % 5 === 4) return "gallery-item gallery-item-portrait";
  if (index % 5 === 3) return "gallery-item gallery-item-wide";
  return "gallery-item";
}

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
            role="region"
            tabIndex={0}
            aria-label={locale === "tr" ? "Konak fotoğraf galerisi" : "Mansion photo gallery"}
          >
            {galleryShots.map((shot, i) => (
              <figure
                key={shot.src}
                className={filmstripRhythm(i)}
                style={{ margin: 0 }}
                tabIndex={0}
                aria-label={shot.caption[locale]}
              >
                <Image
                  src={shot.src}
                  alt={shot.caption[locale]}
                  fill
                  sizes="(max-width: 640px) 70vw, 400px"
                  className="object-cover"
                  loading="lazy"
                  unoptimized
                />
                <figcaption>{shot.caption[locale]}</figcaption>
              </figure>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <Link className="button secondary sm" href={locale === "en" ? "/en/gallery" : "/galeri"} data-event="gallery_view_all">
              {locale === "tr" ? "Tüm Galeriyi Gör" : "View Full Gallery"}
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
