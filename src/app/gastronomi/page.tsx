import { Metadata } from "next";
import { GastronomyClient } from "./gastronomy-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

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
  openGraph: {
    title: "Gastronomi & Antakya Mutfağı | Kozbeyli Konağı",
    description:
      "Foça'da Antakya ve Ege mutfağının buluşma noktası. 500 yıllık taş dibek kahvesi ve İnci Hanım'ın imza reçeteleriyle gurme bir lezzet serüveni.",
    images: [
      {
        url: "/images/rooms/bahce-2.jpeg",
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı Restoran",
      },
    ],
  },
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Kozbeyli Konağı Restoran",
  description: "Antakya ve Ege mutfağının buluşma noktası. İnci Hanım'ın imza reçeteleri ve 180 yıllık taş dibek kahvesi.",
  url: "https://www.kozbeylikonagi.com/gastronomi",
  telephone: "+905322342686",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kozbeyli Küme Evleri No:188",
    addressLocality: "Foça",
    addressRegion: "İzmir",
    postalCode: "35680",
    addressCountry: "TR",
  },
  servesCuisine: ["Antakya Mutfağı", "Ege Mutfağı", "Türk Mutfağı"],
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "08:30", closes: "23:00" },
  ],
  priceRange: "₺₺₺",
};

export default function GastronomyPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", url: "/" },
            { name: "Gastronomi" },
          ]),
          restaurantSchema,
        ]}
      />
      <GastronomyClient />
    </>
  );
}
