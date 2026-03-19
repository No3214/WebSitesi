import { Metadata } from "next";
import { GastronomyClient } from "./gastronomy-client";

export const metadata: Metadata = {
  title: "Gastronomi & Antakya Mutfağı | Kozbeyli Konağı",
  description:
    "Foça'da Antakya ve Ege mutfağının buluşma noktası. 500 yıllık taş dibek kahvesi ve İnci Hanım'ın imza reçeteleriyle gurme bir lezzet serüveni.",
  keywords: [
    "antakya mutfağı izmir",
    "dibek kahvesi",
    "kozbeyli restoran",
    "inci hanım mutfağı",
    "gurme ege kahvaltısı",
  ],
  alternates: { canonical: "/gastronomi" },
};

export default function GastronomyPage() {
  return <GastronomyClient />;
}
