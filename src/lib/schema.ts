import { env } from "@/lib/env";
import { absoluteUrl } from "./utils";

export function hotelSchema() {
  const base = {
    "@context": "https://schema.org",
    "@type": ["Hotel", "LodgingBusiness", "Restaurant"],
    name: "Kozbeyli Konağı Taş Otel & Restaurant",
    description:
      "Foça'nın tarihi Kozbeyli köyünde, 500 yıllık taş mimariyle modern lüksü buluşturan butik otel ve gurme restoran deneyimi.",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    image: [
      absoluteUrl("/img/hero-main.jpg"),
      absoluteUrl("/img/stone-room.jpg"),
      absoluteUrl("/img/breakfast-spread.jpg")
    ],
    telephone: "+90 532 234 26 86",
    email: "info@kozbeylikonagi.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kozbeyli Köyü İç Yolu",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      postalCode: "35680",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 38.7456,
      longitude: 26.9632,
    },
    priceRange: "₺₺₺",
    servesCuisine: "Aegean, Turkish, Breakfast, Antakya",
    starRating: {
      "@type": "Rating",
      "ratingValue": "5"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "124"
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Tarihi Taş Mimari", value: true },
      { "@type": "LocationFeatureSpecification", name: "Organik Serpme Kahvaltı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Zeytinlik & Bahçe", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ücretsiz Otopark", value: true },
      { "@type": "LocationFeatureSpecification", name: "Evcil Hayvan Dostu", value: true },
    ],
    ...(env.GOOGLE_MAPS_URL ? { hasMap: env.GOOGLE_MAPS_URL } : {}),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Odalar",
        "item": absoluteUrl("/odalar")
      }
    ]
  };

  return [base, breadcrumbs];
}
