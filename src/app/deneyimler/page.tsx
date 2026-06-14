import { Metadata } from "next";

import { ExperiencesPageContent } from "@/components/experiences-page-content";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Deneyimler",
  description:
    "Kozbeyli Köyü, Foça ve Ege gastronomisi üzerine özenle hazırlanmış rehberler: taş mimari, sahil rotaları ve dibek kahvesi ritüeliyle konaktan keşfe çıkın.",
  alternates: { canonical: "/deneyimler" },
  openGraph: {
    title: "Deneyimler | Kozbeyli Konağı",
    description:
      "Kozbeyli, Foça ve Ege gastronomisi rehberleriyle konaktan keşfe çıkın.",
    url: absoluteUrl("/deneyimler"),
    images: [
      {
        url: absoluteUrl("/images/galeri/tas-cephe.jpg"),
        alt: "Kozbeyli Konağı taş cephesi",
      },
    ],
  },
};

export default function ExperiencesPage() {
  return <ExperiencesPageContent />;
}
