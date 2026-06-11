import { Metadata } from "next";
import { HistoryClient } from "@/components/history-client";

import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tarihimiz & Living Museum",
  description: "500 yıllık tescilli taş mimari, Horasan harcı sırları ve bir aile mirasının restorasyon hikayesi. Kozbeyli Konağı'nın 'Living Museum' felsefesini keşfedin.",
  keywords: [
    "kozbeyli tarihi",
    "horasan harcı nedir",
    "restorasyon projeleri izmir",
    "osmanlı sivil mimari",
    "taş konak tarihi",
    "living museum foca"
  ],
  alternates: { canonical: "/hikayemiz" },
  openGraph: {
    title: "Tarihimiz & Living Museum | Kozbeyli Konağı",
    description: "500 yıllık tescilli taş mimari ve bir aile mirasının restorasyon hikayesi.",
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
    description: "500 yıllık tescilli Osmanlı taş mimarisi ve restorasyon hikayesi.",
    images: [absoluteUrl("/images/odalar/standart-oda/1.jpg")],
  }
};

export default function HistoryPage() {
  return <HistoryClient />;
}
