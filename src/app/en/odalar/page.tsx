import type { Metadata } from "next";
import { RoomsClient } from "@/components/rooms-client";
import { getDictionary } from "@/lib/dictionary";
import { altLanguagesEn, enOpenGraph } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Rooms",
  description:
    "High-ceilinged stone rooms restored with Horasan mortar at Kozbeyli Konağı. A serene, secluded boutique stay amid historic architecture in Foça.",
  alternates: altLanguagesEn("/odalar", "/en/rooms"),
  openGraph: enOpenGraph({
    url: absoluteUrl("/en/rooms"),
    title: "Our Rooms | Kozbeyli Konağı",
    description:
      "High-ceilinged stone rooms restored with Horasan mortar. A serene, secluded boutique stay amid historic architecture in Foça.",
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı — Stone rooms and boutique stay",
      },
    ],
  }),
};

export default async function EnglishRoomsPage() {
  const dict = await getDictionary("en");
  return <RoomsClient initialDict={dict} initialLocale="en" />;
}
