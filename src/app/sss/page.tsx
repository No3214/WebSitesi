import { Metadata } from "next";

import { FaqPageContent } from "@/components/faq-page-content";
import { altLanguages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Check-in saatleri, aileler, organizasyon rezervasyonları ve konaklama detayları. Kozbeyli Konağı hakkında en çok sorulan soruların yanıtları.",
  alternates: altLanguages("/sss", "/en/faq"),
  openGraph: {
    title: "Sık Sorulan Sorular | Kozbeyli Konağı",
    description: "Konaklama ve rezervasyon hakkında merak edilenler.",
    url: absoluteUrl("/sss"),
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı — Sıkça sorulan sorular",
      },
    ],
  },
};

export default function FaqPage() {
  return <FaqPageContent />;
}
