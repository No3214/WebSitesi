import type { Metadata } from "next";
import { HomePageContent } from "@/app/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kozbeyli Konağı | Historic Stone Hotel & Restaurant in Foça",
  description:
    "A 19th-century registered stone mansion within Kozbeyli's five-century village texture. Antakya and Aegean cuisine, personalised hospitality, and Horasan mortar heritage.",
  alternates: { canonical: "/en" },
  openGraph: {
    url: absoluteUrl("/en"),
    title: "Kozbeyli Konağı | Historic Stone Hotel & Restaurant in Foça",
    description:
      "A 19th-century registered stone mansion within Kozbeyli's five-century village texture. Antakya and Aegean cuisine, personalised hospitality, and Horasan mortar heritage.",
  },
};

export default function EnglishHomePage() {
  return <HomePageContent locale="en" />;
}
