import type { Metadata } from "next";
import { ReservationPageContent } from "@/components/reservation-page-content";
import { altLanguagesEn } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reservation",
  description:
    "Send a direct reservation request for your stone room stay at Kozbeyli Konağı; availability, room preferences and secure payment steps are confirmed by our team.",
  alternates: altLanguagesEn("/rezervasyon", "/en/booking"),
  openGraph: {
    url: absoluteUrl("/en/booking"),
    title: "Reservation | Kozbeyli Konağı",
    description:
      "Direct reservation support for availability, room preferences and secure payment confirmation.",
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı — Reservation and stay booking",
      },
    ],
  },
};

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ oda?: string }>;
}) {
  return <ReservationPageContent searchParams={searchParams} locale="en" />;
}
