import type { Metadata } from "next";
import { FaqPageContent } from "@/components/faq-page-content";
import { altLanguagesEn } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Check-in hours, families, event bookings and stay details. Answers to the most frequently asked questions about Kozbeyli Konağı.",
  alternates: altLanguagesEn("/sss", "/en/faq"),
  openGraph: {
    url: absoluteUrl("/en/faq"),
    title: "Frequently Asked Questions | Kozbeyli Konağı",
    description: "Everything you may wish to know about your stay and reservations.",
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı — Frequently asked questions",
      },
    ],
  },
};

export default function EnglishFaqPage() {
  return <FaqPageContent locale="en" />;
}
