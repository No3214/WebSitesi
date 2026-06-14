import type { Metadata } from "next";
import { ReservationPageContent } from "@/app/rezervasyon/page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reservation",
  description:
    "Send a direct reservation request for your stone room stay at Kozbeyli Konağı; availability, room preferences and secure payment steps are confirmed by our team.",
  alternates: { canonical: "/en/rezervasyon" },
  openGraph: {
    url: absoluteUrl("/en/rezervasyon"),
    title: "Reservation | Kozbeyli Konağı",
    description:
      "Direct reservation support for availability, room preferences and secure payment confirmation.",
  },
};

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ oda?: string }>;
}) {
  return <ReservationPageContent searchParams={searchParams} locale="en" />;
}
