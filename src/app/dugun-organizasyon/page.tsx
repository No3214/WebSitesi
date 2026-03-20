import { Metadata } from "next";
import { WeddingClient } from "./wedding-client";
import { JsonLd, breadcrumbSchema, eventSchema } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Düğün & Özel Organizasyon",
  description:
    "Kozbeyli Konağı'nda butik düğün, nişan, kına ve özel kutlamalar. 500 yıllık taş avluda 60 kişilik samimi organizasyonlar. Foça'da unutulmaz bir gün.",
  alternates: { canonical: "/dugun-organizasyon" },
  openGraph: {
    images: [
      {
        url: absoluteUrl("/images/rooms/bahce-4.jpeg"),
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı - Düğün & Özel Organizasyon Mekanı",
      },
    ],
  },
};

export default function WeddingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", url: "/" },
            { name: "Düğün & Özel Organizasyon" },
          ]),
          eventSchema({
            name: "Kozbeyli Konağı Düğün & Özel Organizasyon",
            description:
              "Kozbeyli Konağı'nda butik düğün, nişan, kına ve özel kutlamalar. 500 yıllık taş avluda 60 kişilik samimi organizasyonlar.",
          }),
        ]}
      />
      <WeddingClient />
    </>
  );
}
