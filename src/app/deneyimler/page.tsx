import { Metadata } from "next";
import { ExperiencesClient } from "./experiences-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Deneyimler | Kozbeyli Konağı",
  description:
    "Kozbeyli Konağı'nda şarap tadımı, gastronomi atölyesi, zeytinyağı hasadı ve Ege keşif turları. Foça'da unutulmaz deneyimler.",
  keywords: ["şarap tadımı foça", "zeytinyağı hasadı izmir", "gastronomi atölyesi", "ege keşif turu"],
  alternates: { canonical: "/deneyimler" },
  openGraph: {
    title: "Deneyimler | Kozbeyli Konağı",
    description: "Şarap tadımı, gastronomi atölyesi, zeytinyağı hasadı ve Ege keşif turları.",
    url: "/deneyimler",
    type: "website",
    images: [{ url: "/images/rooms/bahce-3.jpeg", width: 1200, height: 630, alt: "Kozbeyli Konağı deneyimler" }],
  },
};

export default function ExperiencesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "Deneyimler" },
      ])} />
      <ExperiencesClient />
    </>
  );
}
