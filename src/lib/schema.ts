import { absoluteUrl } from "./utils";

export function hotelSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Hotel", "LodgingBusiness"],
    name: "Kozbeyli Konağı Taş Otel",
    url: absoluteUrl("/"),
    telephone: "+90 532 234 26 86",
    email: "info@kozbeylikonagi.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      addressCountry: "TR"
    },
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Restaurant",
        value: true
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Breakfast",
        value: true
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Event Space",
        value: true
      }
    ]
  };
}
