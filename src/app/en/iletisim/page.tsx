import type { Metadata } from "next";
import { ContactPageContent } from "@/app/iletisim/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact & Directions",
  description:
    "Reach Kozbeyli Konağı at Kozbeyli Village Küme Evler No:188, Foça / Izmir. Phone, WhatsApp support, e-mail and live directions.",
  alternates: { canonical: "/en/iletisim" },
  openGraph: {
    url: absoluteUrl("/en/iletisim"),
    title: "Contact & Directions | Kozbeyli Konağı",
    description:
      "Kozbeyli Village Küme Evler No:188, Foça / Izmir. Phone, WhatsApp support, e-mail and directions to the mansion.",
  },
};

export default function EnglishContactPage() {
  return <ContactPageContent locale="en" />;
}
