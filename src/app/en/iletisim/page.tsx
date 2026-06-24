import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact-page-content";
import { ADDRESS_EN } from "@/lib/contact";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact & Directions",
  description: `Reach Kozbeyli Konağı at ${ADDRESS_EN}. Phone, WhatsApp support, e-mail and live directions.`,
  alternates: { canonical: "/en/contact" },
  openGraph: {
    url: absoluteUrl("/en/contact"),
    title: "Contact & Directions | Kozbeyli Konağı",
    description: `${ADDRESS_EN}. Phone, WhatsApp support, e-mail and directions to the mansion.`,
  },
};

export default function EnglishContactPage() {
  return <ContactPageContent locale="en" />;
}
