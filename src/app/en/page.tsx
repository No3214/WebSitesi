import type { Metadata } from "next";
import Page from "@/app/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kozbeyli Konağı | Historic Stone Hotel & Restaurant in Foça",
  description:
    "500-year-old registered stone architecture in Kozbeyli, Foça. Antakya and Aegean cuisine, personalised hospitality, and serenity woven with Horasan mortar.",
  alternates: { canonical: "/en" },
  openGraph: {
    url: absoluteUrl("/en"),
    title: "Kozbeyli Konağı | Historic Stone Hotel & Restaurant in Foça",
    description:
      "500-year-old registered stone architecture in Kozbeyli, Foça. Antakya and Aegean cuisine, personalised hospitality, and serenity woven with Horasan mortar.",
  },
};

export default Page;
