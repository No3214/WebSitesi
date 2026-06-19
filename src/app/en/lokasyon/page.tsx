import type { Metadata } from "next";

import { LocationPageContent } from "@/components/location-page-content";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Location & Directions",
  description:
    "Verified address for Kozbeyli Konağı: Kozbeyli Village Küme Evler No:188, Foça / İzmir. Live directions, phone and transfer planning links.",
  alternates: {
    canonical: "/en/lokasyon",
    languages: {
      tr: "/lokasyon",
      en: "/en/lokasyon",
    },
  },
  openGraph: {
    title: "Location & Directions | Kozbeyli Konağı",
    description: "Verified Kozbeyli Konağı address and live route links.",
    url: absoluteUrl("/en/lokasyon"),
  },
};

export default function EnglishLocationPage() {
  return <LocationPageContent locale="en" />;
}
