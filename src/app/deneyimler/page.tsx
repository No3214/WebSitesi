import { Metadata } from "next";
import { ExperiencesClient } from "./experiences-client";

export const metadata: Metadata = {
  title: "Deneyimler",
  description:
    "Kozbeyli Konağı'nda şarap tadımı, gastronomi atölyesi, zeytinyağı hasadı ve Ege keşif turları. Foça'da unutulmaz deneyimler.",
  alternates: { canonical: "/deneyimler" },
};

export default function ExperiencesPage() {
  return <ExperiencesClient />;
}
