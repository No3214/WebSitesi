import type { Metadata } from "next";
import { HistoryClient } from "@/components/history-client";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Story & Living Museum",
  description:
    "A 19th-century registered stone mansion within Kozbeyli's five-century village texture, the secrets of Horasan mortar and the restoration of a family legacy.",
  alternates: { canonical: "/en/our-story" },
  openGraph: {
    url: absoluteUrl("/en/our-story"),
    title: "Our Story & Living Museum | Kozbeyli Konağı",
    description:
      "Kozbeyli's five-century village texture and the restoration story of a 19th-century registered stone mansion.",
  },
};

export default function EnglishHistoryPage() {
  return <HistoryClient locale="en" />;
}
