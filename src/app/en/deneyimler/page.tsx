import type { Metadata } from "next";
import { ExperiencesPageContent } from "@/components/experiences-page-content";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Curated guides to Kozbeyli Village, Foça and Aegean gastronomy: stone architecture, coastal routes and the dibek coffee ritual, all from the mansion.",
  alternates: { canonical: "/en/experiences" },
  openGraph: {
    url: absoluteUrl("/en/experiences"),
    title: "Experiences | Kozbeyli Konağı",
    description:
      "Set out from the mansion with curated guides to Kozbeyli, Foça and Aegean gastronomy.",
    images: [
      {
        url: absoluteUrl("/images/galeri/tas-cephe.jpg"),
        alt: "Stone facade of Kozbeyli Konağı",
      },
    ],
  },
};

export default function EnglishExperiencesPage() {
  return <ExperiencesPageContent locale="en" />;
}
