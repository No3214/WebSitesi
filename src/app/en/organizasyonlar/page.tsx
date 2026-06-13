import type { Metadata } from "next";

import { OrganizationsClient } from "@/components/organizations-client";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Weddings & Private Events",
  description:
    "Curated boutique weddings, private celebrations and corporate gatherings in the registered stone courtyard of Kozbeyli Konağı, Foça.",
  alternates: { canonical: "/en/organizasyonlar" },
  openGraph: {
    url: absoluteUrl("/en/organizasyonlar"),
    title: "Weddings & Private Events | Kozbeyli Konağı",
    description:
      "A historic stone setting in Foça for refined weddings, private celebrations and corporate off-sites.",
  },
};

export default function EnglishOrganizationsPage() {
  return <OrganizationsClient locale="en" />;
}
