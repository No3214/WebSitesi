import { Metadata } from "next";

import { ReservationPageContent } from "@/components/reservation-page-content";

type ReservationPageProps = {
  searchParams: Promise<{ oda?: string }>;
};

export const metadata: Metadata = {
  title: "Rezervasyon | Kozbeyli Konağı",
  description:
    "Kozbeyli Konağı'nda taş oda konaklamanız için resmi HMS rezervasyon ekranına geçin; WhatsApp ve telefon desteğimiz açık kalır.",
  keywords: [
    "kozbeyli konağı rezervasyon",
    "foça butik otel rezervasyon",
    "kozbeyli köyü konaklama",
    "taş otel izmir rezervasyon",
  ],
  alternates: { canonical: "/rezervasyon" },
};

export default async function ReservationPage(props: ReservationPageProps) {
  return <ReservationPageContent {...props} locale="tr" />;
}
