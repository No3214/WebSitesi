import { absoluteUrl } from "@/lib/utils";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Server component that renders JSON-LD structured data.
 * Use in page.tsx files for SEO.
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}

/**
 * Generate BreadcrumbList schema for any page.
 */
export function breadcrumbSchema(
  items: Array<{ name: string; url?: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: absoluteUrl(item.url) } : {}),
    })),
  };
}

/**
 * Generate Event schema for weddings/events page.
 */
export function eventSchema(event: {
  name: string;
  description: string;
  location?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: "Kozbeyli Konağı",
    description: event.description,
    url: absoluteUrl("/organizasyonlar"),
    image: event.image ? absoluteUrl(event.image) : absoluteUrl("/images/rooms/aile-1.jpeg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kozbeyli Küme Evleri No:188",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      postalCode: "35680",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 38.7275,
      longitude: 26.7456,
    },
    maximumAttendeeCapacity: 60,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Tarihi Taş Avlu", value: true },
      { "@type": "LocationFeatureSpecification", name: "Açık Hava Alanı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Catering Hizmeti", value: true },
      { "@type": "LocationFeatureSpecification", name: "Konaklama İmkanı", value: true },
    ],
  };
}

/**
 * Generate Menu schema for restaurant menu page.
 */
export function menuSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Kozbeyli Konağı Restoran Menüsü",
    description: "Ege & Antakya mutfağı, serpme köy kahvaltısı ve mevsimsel lezzetler.",
    url: absoluteUrl("/menu"),
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: "Serpme Köy Kahvaltısı",
        description: "Organik köy ürünleri, sucuklu yumurta, pişi ve 180 yıllık dibek kahvesi",
      },
      {
        "@type": "MenuSection",
        name: "Ege Mutfağı",
        description: "Zeytinyağlılar, ot yemekleri ve taze deniz ürünleri",
      },
      {
        "@type": "MenuSection",
        name: "Antakya Mutfağı",
        description: "İnci Hanım'ın özel reçeteleri, künefe ve sac kavurma",
      },
    ],
    inLanguage: "tr",
    mainEntity: {
      "@type": "Restaurant",
      name: "Kozbeyli Konağı Restoran",
      url: absoluteUrl("/gastronomi"),
      servesCuisine: ["Ege Mutfağı", "Antakya Mutfağı", "Türk Mutfağı"],
    },
  };
}
