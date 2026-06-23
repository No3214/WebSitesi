import type { Metadata } from "next";

import { EnglishLegalPage } from "@/components/english-legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy, data security and website data-processing information for Kozbeyli Konağı guests.",
  alternates: { canonical: "/en/gizlilik-politikasi" },
  robots: { index: true, follow: true },
};

export default function EnglishPrivacyPolicyPage() {
  return (
    <EnglishLegalPage
      eyebrow="PRIVACY"
      title="Privacy Policy"
      intro="How guest privacy and website data security are handled."
      officialDocumentKey="privacy"
      sections={[
        {
          title: "1. Privacy Commitment",
          body: [
            "Kozbeyli Konağı respects guest privacy and treats website data with care. Data collected through the website is used for guest communication, reservation support and site operation.",
          ],
        },
        {
          title: "2. Cookies",
          body: [
            "The website uses necessary cookies for core functionality. Analytics and marketing cookies are used only according to your consent preferences.",
          ],
        },
        {
          title: "3. Data Security",
          body: [
            "This website does not request, process or store payment card numbers or CVV values. When online payment infrastructure is enabled, payment is completed through an authorized bank or payment provider using secure payment steps.",
          ],
        },
        {
          title: "4. Contact",
          body: [
            "For privacy questions, requests or clarification, contact info@kozbeylikonagi.com. The official Turkish privacy text remains the controlling document.",
          ],
        },
      ]}
    />
  );
}
