import { Metadata } from "next";

import { FaqPageContent } from "@/components/faq-page-content";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Check-in saatleri, aileler, organizasyon rezervasyonları ve konaklama detayları. Kozbeyli Konağı hakkında en çok sorulan soruların yanıtları.",
  alternates: { canonical: "/sss" },
  openGraph: {
    title: "Sık Sorulan Sorular | Kozbeyli Konağı",
    description: "Konaklama ve rezervasyon hakkında merak edilenler.",
    url: absoluteUrl("/sss"),
  },
};

export default function FaqPage() {
  return <FaqPageContent />;
}
