import { Metadata } from "next";
import { ContactClient } from "./contact-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Kozbeyli Konağı'na ulaşın. Foça Kozbeyli köyünde butik otel rezervasyonu, restoran bilgileri, yol tarifi ve iletişim detayları. Telefon: 0532 234 26 86.",
  alternates: { canonical: "/iletisim" },
  openGraph: {
    images: [
      {
        url: absoluteUrl("/images/rooms/bahce-3.jpeg"),
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı - İletişim ve Ulaşım",
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "İletişim" },
      ])} />
      <ContactClient />
    </>
  );
}
