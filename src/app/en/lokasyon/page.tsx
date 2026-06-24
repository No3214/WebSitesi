import type { Metadata } from "next";

import { LocationPageContent } from "@/components/location-page-content";
import { ADDRESS_EN } from "@/lib/contact";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Location & Directions",
  description: `Verified address for Kozbeyli Konağı: ${ADDRESS_EN}. Live directions, phone and transfer planning links.`,
  alternates: {
    canonical: "/en/location",
    languages: {
      tr: "/lokasyon",
      en: "/en/location",
    },
  },
  openGraph: {
    title: "Location & Directions | Kozbeyli Konağı",
    description: "Verified Kozbeyli Konağı address and live route links.",
    url: absoluteUrl("/en/location"),
  },
};

export default function EnglishLocationPage() {
  return <LocationPageContent locale="en" />;
}
