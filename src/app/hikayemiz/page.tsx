import { Metadata } from "next";
import { HistoryClient } from "@/components/history-client";

import { altLanguages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tarihimiz & Living Museum",
  description: "Beş asırlık Kozbeyli köy dokusu içinde 19. yüzyıl tescilli taş konak, Horasan harcı sırları ve bir aile mirasının restorasyon hikayesi.",
  keywords: [
    "kozbeyli tarihi",
    "horasan harcı nedir",
    "restorasyon projeleri izmir",
    "osmanlı sivil mimari",
    "taş konak tarihi",
    "living museum foca"
  ],
  alternates: altLanguages("/hikayemiz", "/en/our-story"),
  openGraph: {
    title: "Tarihimiz & Living Museum | Kozbeyli Konağı",
    description: "Beş asırlık Kozbeyli köy dokusu ve 19. yüzyıl tescilli taş konağın restorasyon hikayesi.",
    url: absoluteUrl("/hikayemiz"),
    images: [
      {
        url: absoluteUrl("/images/odalar/standart-oda/1.jpg"),
        alt: "Kozbeyli Konağı'nın tarihi taş duvarlı odası",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozbeyli Konağı Tarihi",
    description: "19. yüzyıl tescilli Osmanlı taş konağı ve restorasyon hikayesi.",
    images: [absoluteUrl("/images/odalar/standart-oda/1.jpg")],
  }
};

export default function HistoryPage() {
  return <HistoryClient />;
}
