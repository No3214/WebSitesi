import { Metadata } from "next";

import { ContactPageContent } from "@/components/contact-page-content";

export const metadata: Metadata = {
  title: "İletişim & Ulaşım Yol Tarifi",
  description:
    "Kozbeyli Konağı'na ulaşın: Kozbeyli Köyü Küme Evler No:188, Foça / İzmir. Telefon, WhatsApp destek, e-posta ve canlı yol tarifi.",
  keywords: ["kozbeyli konağı iletişim", "kozbeyli köyü ulaşım", "foça otel telefon", "kozbeyli yol tarifi"],
  alternates: { canonical: "/iletisim" },
};

export default async function ContactPage() {
  return <ContactPageContent locale="tr" />;
}
