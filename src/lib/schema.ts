import { env } from "@/lib/env";
import { absoluteUrl } from "./utils";
import { ReputationData } from "./ai/reputation-intelligence";

/**
 * Hotel Schema (SEO & Reputation Integrated)
 */
export function hotelSchema() {
  const base = {
    "@context": "https://schema.org",
    "@type": ["Hotel", "LodgingBusiness", "Restaurant"],
    name: "Kozbeyli Konağı Taş Otel & Restaurant",
    description:
      "Foça'nın tarihi Kozbeyli köyünde, 500+ yıllık Osmanlı konağında butik otel ve Ege-Antakya mutfağı restoran deneyimi. 16 oda, panoramik Foça Körfezi manzarası.",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    image: [
      absoluteUrl("/img/hero-main.jpg"),
      absoluteUrl("/img/stone-room.jpg"),
      absoluteUrl("/img/breakfast-spread.jpg"),
    ],
    telephone: "+90-232-826-11-12",
    email: "info@kozbeylikonagi.com",
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
    numberOfRooms: 16,
    checkinTime: "14:00",
    checkoutTime: "12:00",
    priceRange: "₺₺₺",
    currenciesAccepted: "TRY",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    servesCuisine: ["Ege Mutfağı", "Antakya Mutfağı", "Türk Mutfağı"],
    starRating: {
      "@type": "Rating",
      ratingValue: "5",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ReputationData.overall.score,
      reviewCount: ReputationData.overall.reviewCount,
      bestRating: "10",
    },
    review: ReputationData.featuredReviews.map((rev) => ({
      "@type": "Review",
      author: { "@type": "Person", name: rev.author },
      datePublished: rev.date,
      reviewBody: rev.content,
      reviewRating: {
        "@type": "Rating",
        ratingValue: rev.rating,
        bestRating: rev.platform === "Booking.com" ? "10" : "5",
      },
    })),
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "500+ Yıllık Osmanlı Taş Konağı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ege & Antakya Mutfağı Restoranı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Foça Körfezi Panoramik Manzara", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ücretsiz Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ücretsiz Otopark", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ücretsiz Bebek Yatağı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Evcil Hayvan Dostu", value: true },
      { "@type": "LocationFeatureSpecification", name: "Serpme Kahvaltı Dahil", value: true },
    ],
    petsAllowed: true,
    hasMap: "https://maps.app.goo.gl/DXMWQg8aJHt3KNcTA",
    hasMenu: absoluteUrl("/menu"),
    ...(env.GOOGLE_MAPS_URL ? { hasMap: env.GOOGLE_MAPS_URL } : {}),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Odalar", item: absoluteUrl("/odalar") },
    ],
  };

  return [base, breadcrumbs];
}
