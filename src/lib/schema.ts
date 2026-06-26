import { operationalPolicies } from "@/data/operational-policies";
import { env } from "@/lib/env";
import { KOZBEYLI_COORDS } from "@/lib/free-apis";
import { absoluteUrl } from "./utils";

/**
 * Hotel Schema.
 *
 * Rating/review structured data is intentionally omitted until there is a
 * dated, verifiable source that can be audited independently.
 */
export function hotelSchema() {
  const base = {
    "@context": "https://schema.org",
    "@type": ["Hotel", "LodgingBusiness", "Restaurant"],
    name: "Kozbeyli Konağı Taş Otel & Restaurant",
    description:
      "Foça'nın tarihi Kozbeyli köyünde, beş asırlık taş doku içinde 19. yüzyıl tescilli konak mirasını modern konforla buluşturan butik otel ve gurme restoran deneyimi.",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    image: [
      absoluteUrl("/images/hero.jpg"),
      absoluteUrl("/images/odalar/standart-deniz-manzarali-oda/1.jpg"),
      absoluteUrl("/videos/kahvalti-poster.jpg")
    ],
    telephone: "+905322342686",
    email: "info@kozbeylikonagi.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kozbeyli Köyü Küme Evler No:188",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      postalCode: "35680",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: KOZBEYLI_COORDS.lat,
      longitude: KOZBEYLI_COORDS.lng,
    },
    checkinTime: "14:00",
    checkoutTime: "12:00",
    petsAllowed: true,
    priceRange: "₺₺₺",
    servesCuisine: "Aegean, Turkish, Breakfast, Antakya",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Tarihi Taş Mimari (Horasan Harcı)", value: true },
      { "@type": "LocationFeatureSpecification", name: "İnci Hanım Güvencesinde Antakya & Ege Mutfağı", value: true },
      { "@type": "LocationFeatureSpecification", name: "180 Yıllık Taş Dibek Kahvesi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Yavaş Yaşam (Slow Living) Deneyimi", value: true },
      { "@type": "LocationFeatureSpecification", name: operationalPolicies.tr.pets, value: true },
      { "@type": "LocationFeatureSpecification", name: "Açık otopark alanı ve varış yönlendirmesi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Kahvaltı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Klima", value: true },
    ],
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.kozbeylikonagi.com/rezervasyon",
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
    },
    hasMenu: absoluteUrl("/menu"),
    ...(env.GOOGLE_MAPS_URL ? { hasMap: env.GOOGLE_MAPS_URL } : {}),
    // sameAs: yalniz env'de gercek profil URL'leri verilmisse (uydurma URL yok).
    // Entity netligi icindir; ucuncu-taraf yildiz/yorum yapisal verisi ASLA
    // eklenmez (Google self-serving review politikasi → manuel ceza riski).
    ...(() => {
      // Dogrulanmis kanonik profil (kozbeyli-facts.md SSOT) her zaman dahil;
      // ek profiller env'den (BRAND_PROFILE_URLS) gelir. Uydurma URL yok —
      // Facebook ground-truth'ta dogrulanmadigi icin eklenmez.
      const verified = ["https://www.instagram.com/kozbeylikonagi/"];
      const fromEnv = (env.BRAND_PROFILE_URLS || "")
        .split(",")
        .map((u) => u.trim())
        .filter((u) => /^https?:\/\//i.test(u));
      const urls = Array.from(new Set([...verified, ...fromEnv]));
      return urls.length ? { sameAs: urls } : {};
    })(),
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
