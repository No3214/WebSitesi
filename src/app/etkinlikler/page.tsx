import { Metadata } from "next";
import { EventsClient } from "./events-client";

export const metadata: Metadata = {
  title: "Etkinlikler & Canlı Müzik",
  description:
    "Kozbeyli Konağı'nda canlı müzik akşamları, şarap tadımı, gastronomi etkinlikleri ve sezonluk programlar. Foça'da kültür ve eğlence.",
  alternates: { canonical: "/etkinlikler" },
};

export default function EventsPage() {
  return <EventsClient />;
}
