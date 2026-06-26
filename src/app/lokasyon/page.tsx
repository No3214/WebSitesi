import type { Metadata } from "next";

import { LocationPageContent } from "@/components/location-page-content";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lokasyon & Yol Tarifi",
  description:
    "Kozbeyli Konağı'nın doğrulanmış adresi: Kozbeyli Köyü Küme Evler No:188, Foça / İzmir. Canlı yol tarifi, telefon ve transfer planlama bağlantıları.",
  alternates: {
    canonical: "/lokasyon",
    languages: {
      tr: "/lokasyon",
      en: "/en/location",
      "x-default": "/lokasyon",
    },
  },
  openGraph: {
    title: "Lokasyon & Yol Tarifi | Kozbeyli Konağı",
    description: "Kozbeyli Konağı'nın doğrulanmış adresi ve canlı yol tarifi bağlantıları.",
    url: absoluteUrl("/lokasyon"),
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı — Konum ve ulaşım",
      },
    ],
  },
};

export default function LocationPage() {
  return <LocationPageContent locale="tr" />;
}
