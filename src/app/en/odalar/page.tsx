import type { Metadata } from "next";
import Page from "@/app/odalar/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Rooms",
  description:
    "High-ceilinged stone rooms restored with Horasan mortar at Kozbeyli Konağı. A serene, secluded boutique stay amid historic architecture in Foça.",
  alternates: { canonical: "/en/odalar" },
  openGraph: {
    url: absoluteUrl("/en/odalar"),
    title: "Our Rooms | Kozbeyli Konağı",
    description:
      "High-ceilinged stone rooms restored with Horasan mortar. A serene, secluded boutique stay amid historic architecture in Foça.",
  },
};

export default Page;
