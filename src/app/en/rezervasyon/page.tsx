import type { Metadata } from "next";
import Page from "@/app/rezervasyon/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reservation",
  description:
    "Book your stone room directly at Kozbeyli Konağı: best rate guarantee, flexible cancellation and WhatsApp concierge support with live availability.",
  alternates: { canonical: "/en/rezervasyon" },
  openGraph: {
    url: absoluteUrl("/en/rezervasyon"),
    title: "Reservation | Kozbeyli Konağı",
    description:
      "Book directly with best rate guarantee, flexible cancellation and WhatsApp concierge support.",
  },
};

export default Page;
