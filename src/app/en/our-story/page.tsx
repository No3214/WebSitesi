import type { Metadata } from "next";

import { HistoryClient } from "@/components/history-client";
import { altLanguagesEn } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Story & Living Museum",
  description:
    "A 19th-century registered stone mansion within Kozbeyli's five-century village texture, the secrets of Horasan mortar and the restoration of a family legacy.",
  alternates: altLanguagesEn("/hikayemiz", "/en/our-story"),
  openGraph: {
    url: absoluteUrl("/en/our-story"),
    title: "Our Story & Living Museum | Kozbeyli Konağı",
    description:
      "Kozbeyli's five-century village texture and the restoration story of a 19th-century registered stone mansion.",
    images: [
      {
        url: absoluteUrl("/images/odalar/standart-oda/1.jpg"),
        alt: "Historic stone-walled room at Kozbeyli Konağı",
      },
    ],
  },
};

export default function EnglishOurStoryPage() {
  return <HistoryClient locale="en" />;
}
