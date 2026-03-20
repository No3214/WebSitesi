import { Metadata } from "next";
import { HistoryClient } from "@/components/history-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Beyaz Saray'dan Kozbeyli'ye: Tarihimiz | Kozbeyli Konağı",
  description: "500 yıllık tescilli taş mimari, Horasan harcı sırları ve bir aile mirasının restorasyon hikayesi. Kozbeyli Konağı'nın 'Living Museum' felsefesini keşfedin.",
  keywords: ["kozbeyli tarihi", "horasan harcı nedir", "restorasyon projeleri izmir", "osmanlı sivil mimari", "taş konak tarihi"],
  alternates: { canonical: "/hikayemiz" },
  openGraph: {
    title: "Beyaz Saray'dan Kozbeyli'ye: Tarihimiz",
    description: "500 yıllık tescilli taş mimari, Horasan harcı sırları ve bir aile mirasının restorasyon hikayesi.",
    url: "/hikayemiz",
    type: "website",
    images: [{ url: "/images/rooms/bahce-1.jpeg", width: 1200, height: 630, alt: "Kozbeyli Konağı tarihi taş yapı" }],
  },
};

export default function HistoryPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "Hikayemiz" },
      ])} />
      <HistoryClient />
    </>
  );
}
