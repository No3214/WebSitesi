import { Metadata } from "next";
import { EventsClient } from "./events-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Etkinlikler & Canlı Müzik | Kozbeyli Konağı",
  description:
    "Kozbeyli Konağı'nda canlı müzik akşamları, şarap tadımı, gastronomi etkinlikleri ve sezonluk programlar. Foça'da kültür ve eğlence.",
  keywords: ["foça etkinlik", "canlı müzik izmir", "şarap tadımı foça", "kozbeyli konağı etkinlikler"],
  alternates: { canonical: "/etkinlikler" },
  openGraph: {
    title: "Etkinlikler & Canlı Müzik | Kozbeyli Konağı",
    description: "Canlı müzik akşamları, şarap tadımı, gastronomi etkinlikleri ve sezonluk programlar.",
    url: "/etkinlikler",
    type: "website",
    images: [{ url: "/images/rooms/bahce-2.jpeg", width: 1200, height: 630, alt: "Kozbeyli Konağı etkinlik alanı" }],
  },
};

export default function EventsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", url: "/" },
            { name: "Etkinlikler & Canlı Müzik" },
          ]),
        ]}
      />
      <EventsClient />
    </>
  );
}
