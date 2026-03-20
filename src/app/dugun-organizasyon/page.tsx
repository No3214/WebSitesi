import { Metadata } from "next";
import { WeddingClient } from "./wedding-client";
import { JsonLd, breadcrumbSchema, eventSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Düğün & Özel Organizasyon",
  description:
    "Kozbeyli Konağı'nda butik düğün, nişan, kına ve özel kutlamalar. 500 yıllık taş avluda 60 kişilik samimi organizasyonlar. Foça'da unutulmaz bir gün.",
  alternates: { canonical: "/dugun-organizasyon" },
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
