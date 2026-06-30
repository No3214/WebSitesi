import type { Metadata } from "next";

import { OrganizationsClient } from "@/components/organizations-client";
import { altLanguagesEn, enOpenGraph } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Weddings & Private Events",
  description:
    "Curated boutique weddings, private celebrations and corporate gatherings in the registered stone courtyard of Kozbeyli Konağı, Foça.",
  alternates: altLanguagesEn("/organizasyonlar", "/en/events"),
  openGraph: enOpenGraph({
    url: absoluteUrl("/en/events"),
    title: "Weddings & Private Events | Kozbeyli Konağı",
    description:
      "A historic stone setting in Foça for refined weddings, private celebrations and corporate off-sites.",
    images: [
      {
        url: absoluteUrl("/images/organizasyonlar/butik-dugun.jpg"),
        alt: "Boutique wedding atmosphere in the stone courtyard of Kozbeyli Konağı",
      },
    ],
  }),
  twitter: {
    card: "summary_large_image",
    title: "Kozbeyli Konağı Weddings & Private Events",
    description:
      "Curated weddings, private celebrations and corporate off-sites in a registered stone setting.",
    images: [absoluteUrl("/images/organizasyonlar/butik-dugun.jpg")],
  },
};

export default function EnglishEventsPage() {
  return <OrganizationsClient locale="en" />;
}
