import { Metadata } from "next";
import { CorporateClient } from "./corporate-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Kurumsal Etkinlikler & Retreat | Kozbeyli Konağı",
  description:
    "Kozbeyli Konağı'nda kurumsal toplantı, team building, off-site retreat ve workshop organizasyonları. Foça'da doğayla iç içe kurumsal etkinlik.",
  keywords: ["kurumsal etkinlik foça", "team building izmir", "off-site retreat", "workshop mekanı izmir"],
  alternates: { canonical: "/kurumsal" },
  openGraph: {
    title: "Kurumsal Etkinlikler & Retreat | Kozbeyli Konağı",
    description: "Kurumsal toplantı, team building, off-site retreat ve workshop organizasyonları.",
    url: "/kurumsal",
    type: "website",
    images: [{ url: "/images/rooms/aile-1.jpeg", width: 1200, height: 630, alt: "Kozbeyli Konağı kurumsal etkinlik" }],
  },
};

export default function CorporatePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "Kurumsal" },
      ])} />
      <CorporateClient />
    </>
  );
}
