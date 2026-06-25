/* eslint-disable @next/next/no-img-element -- The full gallery serves approved public assets directly to avoid image optimizer contention during heavy parallel release checks. */
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { galleryExtended } from "@/data/gallery";
import { absoluteUrl } from "@/lib/utils";

type GalleryLocale = "tr" | "en";

const galleryCopy: Record<GalleryLocale, {
  eyebrow: string;
  title: string;
  text: string;
  schemaName: string;
  schemaUrl: string;
}> = {
  tr: {
    eyebrow: "KONAKTAN KARELER",
    title: "Taşın ve Işığın Günlüğü",
    text: "Andezit taş duvarlar, sabah güneşiyle uyanan avlu ve Ege'nin sofra kültürü. Konağın gündelik ritmini fotoğraflarla gezin.",
    schemaName: "Kozbeyli Konağı Galeri",
    schemaUrl: "/galeri",
  },
  en: {
    eyebrow: "FRAMES FROM THE MANSION",
    title: "A Journal of Stone and Light",
    text: "Andesite stone walls, a courtyard waking to the morning sun and the table culture of the Aegean. Explore the mansion's daily rhythm through photographs.",
    schemaName: "Kozbeyli Konağı Gallery",
    schemaUrl: "/en/gallery",
  },
};

export function GalleryPageContent({ locale = "tr" }: { locale?: GalleryLocale }) {
  const copy = galleryCopy[locale];
  const eagerImageSources = new Set(["/images/galeri/tas-firin-pide.jpg"]);
  const imageGalleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: copy.schemaName,
    url: absoluteUrl(copy.schemaUrl),
    image: galleryExtended.map((shot) => absoluteUrl(shot.src)),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGalleryJsonLd) }}
      />
      <SiteHeader />
      <main>
        <PageHero eyebrow={copy.eyebrow} title={copy.title} text={copy.text} revealTitle />

        <section className="section">
          <div className="container" style={{ width: "min(1400px, 100%)" }}>
            <FadeIn>
              <div className="gallery-grid">
                {galleryExtended.map((shot, i) => (
                  <figure key={shot.src} className="gallery-grid-item" style={{ margin: 0 }}>
                    <img
                      src={shot.src}
                      alt={shot.caption[locale]}
                      className="object-cover"
                      loading={i < 4 || eagerImageSources.has(shot.src) ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={i < 4 || eagerImageSources.has(shot.src) ? "high" : "auto"}
                    />
                    <figcaption>{shot.caption[locale]}</figcaption>
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
