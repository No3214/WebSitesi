"use client";

import { sanitizeJsonLd } from "@/lib/security";
import { SiteHeader } from "@/components/site-header";
import { StoryHero, StorySegment } from "@/components/storytelling";
import { absoluteUrl } from "@/lib/utils";

type Locale = "tr" | "en";

const gastronomyCopy = {
  tr: {
    url: "/gastronomi",
    heroTitle: "Gastronomi Mirası",
    heroSubtitle: "ANTAKYA'DAN EGE'YE BİR LEZZET KÖPRÜSÜ",
    cuisine: ["Ege Mutfağı", "Antakya Mutfağı", "Türk Kahvaltısı"],
    segments: [
      {
        title: "İnci Hanım'ın Mutfağı",
        content:
          "Kozbeyli Konağı'nın mutfağı, sadece bir yemek alanı değil; İnci Hanım'ın Antakya kökenli aile mirası ile Ege'nin kadim topraklarını birleştiren bir 'Gastronomi Laboratuvarı'dır.",
        side: "left" as const,
      },
      {
        title: "Orijinal Taş Dibek",
        content:
          "180 yıllık orijinal taş dibekte her gün taze olarak elde dövülen Dibek Kahvesi, Kozbeyli'nin en karakteristik sabah ritüellerinden biridir.",
        side: "right" as const,
      },
      {
        title: "Farm-to-Table Kahvaltı",
        content:
          "Serpme köy kahvaltımız, Kozbeyli'nin asırlık zeytin ağaçlarından ve İnci Hanım'ın geleneksel reçel tariflerinden süzülen tam organik bir döngüdür.",
        side: "left" as const,
      },
    ],
    liveTitle: "Mutfaktan Canlı Kareler",
    liveText:
      "Serpme köy kahvaltısı, taş ateşinde mıhlama ve şefin akşam tabağı — Kozbeyli mutfağının gerçek hali.",
    videos: ["Serpme Köy Kahvaltısı", "Taş Ateşinde Mıhlama", "Şefin İmzası"],
  },
  en: {
    url: "/en/gastronomi",
    heroTitle: "Culinary Heritage",
    heroSubtitle: "A BRIDGE OF FLAVOUR FROM ANTAKYA TO THE AEGEAN",
    cuisine: ["Aegean Cuisine", "Antakya Cuisine", "Turkish Breakfast"],
    segments: [
      {
        title: "Inci Hanim's Kitchen",
        content:
          "The kitchen at Kozbeyli Konağı is more than a dining room. It brings Inci Hanim's Antakya family heritage together with the Aegean's ancient produce in a curated culinary experience.",
        side: "left" as const,
      },
      {
        title: "Original Stone Dibek",
        content:
          "Fresh dibek coffee is still ground by hand in the original stone mortar, keeping one of Kozbeyli's oldest morning rituals alive for guests.",
        side: "right" as const,
      },
      {
        title: "Farm-to-Table Breakfast",
        content:
          "Our village breakfast follows a complete local cycle, from century-old olive trees to house-made preserves and warm stone-oven flavours.",
        side: "left" as const,
      },
    ],
    liveTitle: "Live Frames from the Kitchen",
    liveText:
      "Village breakfast, mıhlama over stone fire and the chef's evening plate — real moments from the Kozbeyli kitchen.",
    videos: ["Village Breakfast Table", "Stone-Fire Mıhlama", "Chef's Signature"],
  },
};

export function GastronomyPageContent({ locale = "tr" }: { locale?: Locale }) {
  const copy = gastronomyCopy[locale];
  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Kozbeyli Konağı Restaurant",
    url: absoluteUrl(copy.url),
    image: absoluteUrl("/videos/kahvalti-poster.jpg"),
    servesCuisine: copy.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kozbeyli Köyü",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    parentOrganization: {
      "@type": "LodgingBusiness",
      name: "Kozbeyli Konağı",
      url: absoluteUrl("/"),
    },
    hasMenu: absoluteUrl(locale === "en" ? "/en/menu" : "/menu"),
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(restaurantJsonLd) }}
      />
      <SiteHeader variant="overlay" />

      <StoryHero title={copy.heroTitle} subtitle={copy.heroSubtitle} />

      {copy.segments.map((segment) => (
        <StorySegment
          key={segment.title}
          title={segment.title}
          content={segment.content}
          side={segment.side}
        />
      ))}

      <section style={{ padding: "72px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <h2
          style={{
            color: "#f5f1e8",
            fontSize: "1.8rem",
            textAlign: "center",
            marginBottom: 12,
            fontFamily: "var(--font-serif, serif)",
          }}
        >
          {copy.liveTitle}
        </h2>
        <p style={{ color: "rgba(245,241,232,0.7)", textAlign: "center", marginBottom: 40 }}>
          {copy.liveText}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
          {[
            { poster: "/videos/kahvalti-poster.jpg", src: "/videos/kahvalti.mp4", event: "video_play_kahvalti" },
            { poster: "/videos/mihlama-poster.jpg", src: "/videos/mihlama.mp4", event: "video_play_mihlama" },
            { poster: "/videos/chef-poster.jpg", src: "/videos/chef.mp4", event: "video_play_chef" },
          ].map((video, index) => (
            <figure key={video.src} style={{ margin: 0 }}>
              <video
                controls
                preload="none"
                playsInline
                poster={video.poster}
                style={{ width: "100%", borderRadius: 16, display: "block", background: "#111" }}
                data-event={video.event}
              >
                <source src={video.src} type="video/mp4" />
              </video>
              <figcaption
                style={{
                  color: "rgba(245,241,232,0.6)",
                  fontSize: "0.9rem",
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                {copy.videos[index]}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
