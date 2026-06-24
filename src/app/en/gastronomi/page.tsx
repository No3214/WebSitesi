import type { Metadata } from "next";
import { GastronomyPageContent } from "@/components/gastronomy-page-content";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dining & Stone Oven",
  description:
    "Traditional stone-oven flavours of Kozbeyli Village, Antakya-Aegean cuisine and a generous village breakfast. Gourmet dining within historic texture.",
  alternates: { canonical: "/en/dining" },
  openGraph: {
    url: absoluteUrl("/en/dining"),
    title: "Dining & Aegean-Antakya Cuisine | Kozbeyli Konağı",
    description:
      "Where Antakya and Aegean cuisines meet in Foça. Stone-oven flavours and freshly ground dibek coffee.",
  },
};

export default function EnglishGastronomyPage() {
  return <GastronomyPageContent locale="en" />;
}
