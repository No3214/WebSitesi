import type { Metadata } from "next";
import Page from "@/app/gastronomi/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dining & Stone Oven",
  description:
    "Traditional stone-oven flavours of Kozbeyli Village, Antakya-Aegean cuisine and a generous village breakfast. Gourmet dining within historic texture.",
  alternates: { canonical: "/en/gastronomi" },
  openGraph: {
    url: absoluteUrl("/en/gastronomi"),
    title: "Dining & Aegean-Antakya Cuisine | Kozbeyli Konağı",
    description:
      "Where Antakya and Aegean cuisines meet in Foça. Stone-oven flavours and freshly ground dibek coffee.",
  },
};

export default Page;
