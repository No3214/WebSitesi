import type { Metadata } from "next";
import Page from "@/app/deneyimler/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Curated guides to Kozbeyli Village, Foça and Aegean gastronomy: stone architecture, coastal routes and the dibek coffee ritual, all from the mansion.",
  alternates: { canonical: "/en/deneyimler" },
  openGraph: {
    url: absoluteUrl("/en/deneyimler"),
    title: "Experiences | Kozbeyli Konağı",
    description:
      "Set out from the mansion with curated guides to Kozbeyli, Foça and Aegean gastronomy.",
  },
};

export default Page;
