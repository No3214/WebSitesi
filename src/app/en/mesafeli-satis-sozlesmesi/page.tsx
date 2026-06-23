import type { Metadata } from "next";

import { EnglishLegalPage } from "@/components/english-legal-page";

export const metadata: Metadata = {
  title: "Distance Sales Agreement",
  description:
    "Informational English distance sales agreement summary for Kozbeyli Konağı reservation services.",
  alternates: { canonical: "/en/mesafeli-satis-sozlesmesi" },
  robots: { index: true, follow: true },
};

export default function EnglishDistanceSalesAgreementPage() {
  return (
    <EnglishLegalPage
      eyebrow="RESERVATION TERMS"
      title="Distance Sales Agreement"
      intro="Information about reservation, payment, cancellation and general stay terms."
      officialDocumentKey="distanceSales"
      sections={[
        {
          title: "1. Parties",
          body: [
            "Seller: Kozbeyli Konağı Boutique Hotel. Buyer: the guest or website user making a reservation request through the website or approved reservation channels.",
          ],
        },
        {
          title: "2. Subject",
          body: [
            "This agreement concerns accommodation reservation services sold or requested electronically and the rights and obligations of the parties under applicable Turkish consumer legislation.",
          ],
        },
        {
          title: "3. Reservation and Payment",
          body: ["The reservation process is completed according to written confirmation shared with the guest."],
          bullets: [
            "A reservation may require full payment or a deposit, depending on the confirmed offer and booking channel.",
            "Room rates include breakfast unless otherwise stated in the confirmed offer.",
            "This website does not store card details; secure payment is handled by the authorized payment infrastructure when enabled.",
          ],
        },
        {
          title: "4. Cancellation and Refund Terms",
          body: [
            "Cancellation, change and refund terms may vary by booking channel, selected offer, payment type, period and stay dates. Current terms are shared in writing before the reservation is confirmed.",
          ],
        },
        {
          title: "5. General Terms",
          body: [
            "Guests are required to present official identity documentation at check-in. Pet acceptance, smoking rules and property standards are explained in the guest guide and written confirmations.",
          ],
        },
      ]}
    />
  );
}
