import type { Metadata } from "next";

import { MenuBook } from "@/components/menu-book";
import { SiteHeader } from "@/components/site-header";
import { englishMenuSections } from "@/data/menu-en";
import { altLanguagesEn } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Restaurant Menu | Stone Oven & Village Breakfast",
  description:
    "Kozbeyli Konağı restaurant menu: curated village breakfast, Antakya mezes, wood-fired stone oven flavours, künefe and dibek coffee.",
  alternates: altLanguagesEn("/menu", "/en/menu"),
  openGraph: {
    url: absoluteUrl("/en/menu"),
    title: "Restaurant Menu | Kozbeyli Konağı",
    description:
      "A curated Antakya and Aegean table with village breakfast, stone-oven flavours and dibek coffee.",
    images: [
      {
        url: absoluteUrl("/videos/mihlama-poster.jpg"),
        alt: "Mıhlama prepared over stone fire at Kozbeyli Konağı",
      },
    ],
  },
};

export default function EnglishMenuPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <MenuBook
        sections={englishMenuSections}
        title="Kozbeyli Konağı"
        subtitle="Restaurant Menu"
        note="Within the five-century village texture of Kozbeyli, Antakya family recipes meet Aegean olive oil, herbs, stone-oven warmth and carefully selected wine pairings. Menu items, availability and prices may change seasonally; our team confirms the current details before service."
        signature="Chef Yunuscan Oruk"
        ctaTitle="Planning a Private Dinner?"
        ctaText="For celebrations, group dining and wine tasting requests, our guest relations team can curate the evening with you."
        ctaHref="/en/events#teklif"
        ctaLabel="CONTACT GUEST RELATIONS"
        featuredLabel="Mansion Selection"
        bundleLabel="Curated Selection"
        indexLabel="Menu categories"
        itemCountLabel="items"
        signalLanguage="en"
        allergenNotes={[
          "(G) Gluten",
          "(D) Dairy",
          "(N) Nuts",
          "(E) Egg",
          "(SE) Sesame",
          "(F) Fish",
          "Please inform our service team about dietary preferences.",
          "Calorie values are estimates and may vary by portion size.",
        ]}
      />
    </>
  );
}
