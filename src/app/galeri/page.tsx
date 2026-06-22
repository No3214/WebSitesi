/* eslint-disable @next/next/no-img-element -- The full gallery serves approved public assets directly to avoid image optimizer contention during heavy parallel release checks. */
import { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { galleryExtended } from "@/data/gallery";
import { absoluteUrl } from "@/lib/utils";
import { sanitizeJsonLd } from "@/lib/security";

export const metadata: Metadata = {
  title: "Galeri | Taş, Işık ve Sofra Kareleri",
  description:
    "Kozbeyli Konağı'nın taş avlusu, tarihi odaları, Ege manzaraları ve serpme kahvaltı sofralarından kareler. Beş asırlık Kozbeyli köy dokusunu fotoğraflarla keşfedin.",
  alternates: { canonical: "/galeri" },
  openGraph: {
    title: "Galeri | Kozbeyli Konağı",
    description: "Taş avlu, tarihi odalar ve Ege sofralarından kareler.",
    url: absoluteUrl("/galeri"),
    images: [{ url: absoluteUrl("/images/hero.jpg"), alt: "Kozbeyli Konağı taş avlusu" }],
  },
};

export default function GalleryPage() {
  const imageGalleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Kozbeyli Konağı Galeri",
    url: absoluteUrl("/galeri"),
    image: galleryExtended.map((shot) => absoluteUrl(shot.src)),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(imageGalleryJsonLd) }}
      />
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="KONAKTAN KARELER"
          title="Taşın ve Işığın Günlüğü"
          text="Andezit taş duvarlar, sabah güneşiyle uyanan avlu ve Ege'nin sofra kültürü. Konağın gündelik ritmini fotoğraflarla gezin."
        />

        <section className="section">
          <div className="container" style={{ width: "min(1400px, 100%)" }}>
            <FadeIn>
              <div className="gallery-grid">
                {galleryExtended.map((shot, i) => (
                  <figure key={shot.src} className="gallery-grid-item" style={{ margin: 0 }}>
                    <img
                      src={shot.src}
                      alt={shot.caption.tr}
                      className="object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={i === 0 ? "high" : "auto"}
                    />
                    <figcaption>{shot.caption.tr}</figcaption>
                  </figure>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
