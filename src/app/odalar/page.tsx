import { Metadata } from "next";
import { RoomsClient } from "@/components/rooms-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lüks Taş Odalar & Konaklama | Kozbeyli Konağı",
  description: "Kozbeyli Konağı'nın Horasan harcıyla restore edilmiş, yüksek tavanlı ve nefes alan taş odaları. Foça'da sükunet dolu, lüks butik konaklama deneyimi.",
  keywords: ["kozbeyli taş odalar", "foça lüks konaklama", "izmir butik otel odaları", "restore edilmiş konak", "huzurlu tatil odaları"],
  alternates: { canonical: "/odalar" },
  openGraph: {
    images: [
      {
        url: absoluteUrl("/images/rooms/deniz-1.jpeg"),
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı - Deniz Manzaralı Lüks Taş Oda",
      },
    ],
  },
};

export default function RoomsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "Odalar" },
      ])} />
      <RoomsClient />
    </>
  );
}
