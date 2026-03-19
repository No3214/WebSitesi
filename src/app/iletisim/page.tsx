import { Metadata } from "next";
import { ContactClient } from "./contact-client";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Kozbeyli Konağı'na ulaşın. Foça Kozbeyli köyünde butik otel rezervasyon, restoran bilgi ve yol tarifi.",
  alternates: { canonical: "/iletisim" },
};

export default function ContactPage() {
  return <ContactClient />;
}
