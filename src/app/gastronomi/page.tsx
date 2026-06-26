import { Metadata } from "next";

import { GastronomyPageContent } from "@/components/gastronomy-page-content";
import { altLanguages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gastronomi & Taş Fırın",
  description:
    "Kozbeyli Köyü'nün geleneksel taş fırın lezzetleri, inci hanım mutfağı ve egeye özgü serpme kahvaltı deneyimi. Tarihi dokuda gurme lezzetler.",
  keywords: [
    "kozbeyli köy kahvaltısı",
    "kozbeyli dibek kahvesi",
    "foça gurme restoran",
    "ege mutfağı akşam yemeği",
    "inci hanım mutfağı",
    "taş fırın lezzetleri",
    "özgün gastronomi deneyimi",
    "foça butik otel kahvaltı",
    "ege yöresel lezzetler",
  ],
  alternates: altLanguages("/gastronomi", "/en/dining"),
  openGraph: {
    title: "Gastronomi & Ege-Antakya Mutfağı | Kozbeyli Konağı",
    description:
      "Foça'da Antakya ve Ege mutfağının buluşma noktası. Taş fırında pişen lezzetler ve taze çekilmiş dibek kahvesi.",
    url: absoluteUrl("/gastronomi"),
    images: [
      {
        url: absoluteUrl("/videos/kahvalti-poster.jpg"),
        alt: "Kozbeyli Konağı'nda serpme köy kahvaltısı sofrası",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gastronomi & Antakya Mutfağı | Kozbeyli Konağı",
    description: "Foça'da Antakya ve Ege lezzetlerinin en otantik buluşması.",
    images: [absoluteUrl("/videos/kahvalti-poster.jpg")],
  },
};

export default function GastronomyPage() {
  return <GastronomyPageContent />;
}
