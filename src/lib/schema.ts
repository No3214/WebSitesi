import { env } from "@/lib/env.server";
import { absoluteUrl } from "./utils";
import { ReputationData } from "./ai/reputation-intelligence";

/**
 * Hotel Schema (SEO & Reputation Integrated)
 * Similar to Exely/Professional OTA widgets.
 * Provides AggregateRating and Curated Good Reviews to Google.
 */
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
      "ratingValue": ReputationData.overall.score,
      "reviewCount": ReputationData.overall.reviewCount,
      "bestRating": "10"
    },
    review: ReputationData.featuredReviews.map(rev => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": rev.author },
      "datePublished": rev.date,
      "reviewBody": rev.content,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": rev.rating,
        "bestRating": rev.platform === "Booking.com" ? "10" : "5"
      }
    })),
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Tarihi Taş Mimari (Horasan Harcı)", value: true },
      { "@type": "LocationFeatureSpecification", name: "İnci Hanım Güvencesinde Antakya & Ege Mutfağı", value: true },
      { "@type": "LocationFeatureSpecification", name: "500 Yıllık Taş Dibek Kahvesi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Yavaş Yaşam (Slow Living) Deneyimi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Evcil Hayvan Dostu", value: true },
    ],
    award: [
      "Foça'nın En Otantik Butik Oteli",
      "Geleneksel Antakya Mutfağı Miras Koruyucusu"
    ],
    hasMenu: absoluteUrl("/restoran"),
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
