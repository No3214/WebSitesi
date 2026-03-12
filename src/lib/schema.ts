import { absoluteUrl } from "./utils";

const googleMapsUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL;
const reviewRating = process.env.NEXT_PUBLIC_REVIEW_RATING;
const reviewCount = process.env.NEXT_PUBLIC_REVIEW_COUNT;

export function hotelSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Hotel", "LodgingBusiness", "Restaurant"],
    name: "Kozbeyli Konağı Taş Otel & Restaurant",
    description:
      "Foça'nın tarihi Kozbeyli köyünde, 19. yüzyıl mimarisiyle modern lüksü birleştiren ödüllü taş otel ve restoran.",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    image: [absoluteUrl("/img/hero-main.jpg"), absoluteUrl("/img/stone-room.jpg")],
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
    servesCuisine: "Aegean, Turkish, Breakfast",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Taş Mimari", value: true },
      { "@type": "LocationFeatureSpecification", name: "Geleneksel Serpme Kahvaltı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Zeytin Bahçesi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ücretsiz Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Etkinlik ve Düğün Alanı", value: true },
    ],
    ...(googleMapsUrl ? { hasMap: googleMapsUrl } : {}),
    ...(reviewRating && reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewRating,
            reviewCount,
          },
        }
      : {}),
  };
}
