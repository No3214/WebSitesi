import { sanitizeJsonLd } from "@/lib/security";
import { Metadata } from "next";
import Image from "next/image";

import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { galleryExtended } from "@/data/gallery";
import { absoluteUrl } from "@/lib/utils";

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
                    <Image
                      src={shot.src}
                      alt={shot.caption.tr}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      loading={i < 3 ? "eager" : "lazy"}
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
