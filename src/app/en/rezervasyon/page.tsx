import type { Metadata } from "next";
import Page from "@/app/rezervasyon/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reservation",
  description:
    "Send a direct concierge request for your stone room stay at Kozbeyli Konağı; availability, room preferences and secure payment steps are confirmed by our team.",
  alternates: { canonical: "/en/rezervasyon" },
  openGraph: {
    url: absoluteUrl("/en/rezervasyon"),
    title: "Reservation | Kozbeyli Konağı",
    description:
      "Direct concierge support for availability, room preferences and secure payment confirmation.",
  },
};

export default Page;
