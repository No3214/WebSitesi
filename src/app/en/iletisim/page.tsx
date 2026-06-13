import type { Metadata } from "next";
import Page from "@/app/iletisim/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact & Directions",
  description:
    "Reach Kozbeyli Konağı at Kozbeyli Village Küme Evler No:188, Foça / Izmir. Phone, WhatsApp concierge, e-mail and directions — 55 minutes from Izmir Adnan Menderes Airport.",
  alternates: { canonical: "/en/iletisim" },
  openGraph: {
    url: absoluteUrl("/en/iletisim"),
    title: "Contact & Directions | Kozbeyli Konağı",
    description:
      "Kozbeyli Village Küme Evler No:188, Foça / Izmir. Phone, WhatsApp concierge, e-mail and directions to the mansion.",
  },
};

export default Page;
