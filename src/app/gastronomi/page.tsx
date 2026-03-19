import { Metadata } from "next";
import { GastronomyClient } from "./gastronomy-client";

export const metadata: Metadata = {
  title: "Gastronomi & Antakya Mutfağı | Kozbeyli Konağı",
  description:
    "Foça'da Antakya ve Ege mutfağının buluşma noktası. 500 yıllık taş dibek kahvesi ve İnci Hanım'ın imza reçeteleriyle gurme bir lezzet serüveni.",
  keywords: [
    "antakya mutfağı izmir",
    "dibek kahvesi",
    "kozbeyli restoran",
    "inci hanım mutfağı",
    "gurme ege kahvaltısı",
  ],
  alternates: { canonical: "/gastronomi" },
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Kozbeyli Konağı Restoran",
  description: "Antakya ve Ege mutfağının buluşma noktası. İnci Hanım'ın imza reçeteleri ve 180 yıllık taş dibek kahvesi.",
  url: "https://www.kozbeylikonagi.com/gastronomi",
  telephone: "+90-232-676-10-10",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kozbeyli Köyü İç Yolu",
    addressLocality: "Foça",
    addressRegion: "İzmir",
    postalCode: "35680",
    addressCountry: "TR",
  },
  servesCuisine: ["Antakya Mutfağı", "Ege Mutfağı", "Türk Mutfağı"],
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "08:00", closes: "22:00" },
  ],
  priceRange: "₺₺₺",
};

export default function GastronomyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <GastronomyClient />
    </>
  );
}
