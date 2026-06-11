import type { Metadata } from "next";
import Page from "@/app/hikayemiz/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Story & Living Museum",
  description:
    "500-year-old registered stone architecture, the secrets of Horasan mortar and the restoration of a family legacy. Discover our Living Museum philosophy.",
  alternates: { canonical: "/en/hikayemiz" },
  openGraph: {
    url: absoluteUrl("/en/hikayemiz"),
    title: "Our Story & Living Museum | Kozbeyli Konağı",
    description:
      "Five centuries of registered stone architecture and the restoration story of a family legacy.",
  },
};

export default Page;
