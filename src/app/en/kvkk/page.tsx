import type { Metadata } from "next";

import { EnglishLegalPage } from "@/components/english-legal-page";

export const metadata: Metadata = {
  title: "KVKK Notice",
  description:
    "Informational English KVKK notice for Kozbeyli Konağı guests and website users.",
  alternates: { canonical: "/en/kvkk" },
  robots: { index: true, follow: true },
};

export default function EnglishKvkkPage() {
  return (
    <EnglishLegalPage
      eyebrow="PERSONAL DATA"
      title="KVKK Notice"
      intro="An English information page about personal data processing under Turkish privacy law."
      officialDocumentKey="kvkk"
      sections={[
        {
          title: "1. Data Controller",
          body: [
            "Under the Turkish Personal Data Protection Law No. 6698, personal data may be processed by Kozbeyli Konağı Boutique Hotel and Restaurant as data controller within the scope described in the official Turkish notice.",
          ],
        },
        {
          title: "2. Processing Purposes",
          body: ["Personal data may be processed for the following purposes:"],
          bullets: [
            "Providing accommodation and reservation services.",
            "Meeting legal identity-notification obligations.",
            "Measuring guest satisfaction and improving service quality.",
            "Maintaining property security through security cameras.",
            "Managing finance, accounting and operational records.",
          ],
        },
        {
          title: "3. Processed Data Categories",
          body: [
            "Processed data may include identity, contact, reservation, invoicing, vehicle plate and on-property camera records. The website does not collect payment card numbers or CVV values.",
          ],
        },
        {
          title: "4. Transfers",
          body: [
            "Personal data may be transferred to authorized public institutions where legally required and to service providers such as payment, booking or channel-management partners where needed for service delivery.",
          ],
        },
        {
          title: "5. Your Rights",
          body: [
            "You may contact info@kozbeylikonagi.com to exercise rights recognized under KVKK Article 11, including requests for information, correction, deletion or objection where applicable.",
          ],
        },
      ]}
    />
  );
}
