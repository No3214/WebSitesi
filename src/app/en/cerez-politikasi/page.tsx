import type { Metadata } from "next";

import { EnglishLegalPage } from "@/components/english-legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie categories, consent choices and preference management for the Kozbeyli Konağı website.",
  alternates: { canonical: "/en/cerez-politikasi" },
  robots: { index: true, follow: true },
};

export default function EnglishCookiePolicyPage() {
  return (
    <EnglishLegalPage
      eyebrow="COOKIE NOTICE"
      title="Cookie Policy"
      intro="How we use necessary, analytics and marketing cookies on this website."
      officialDocumentKey="cookies"
      showCookiePreferences
      sections={[
        {
          title: "1. What Are Cookies?",
          body: [
            "Cookies are small text files stored by your browser when you visit a website. Kozbeyli Konağı uses cookies to operate the site, remember preferences and, with your consent, measure visits and marketing performance.",
          ],
        },
        {
          title: "2. Cookie Categories We Use",
          body: [
            "Non-essential cookies are not activated unless you give consent. Your consent preference is stored in your browser and can be changed later.",
          ],
          bullets: [
            "Necessary cookies: language preference, cookie consent record and security checks needed for the site to function.",
            "Analytics cookies: site performance, visit and conversion measurement used to improve the guest experience.",
            "Marketing cookies: advertising performance and remarketing measurement when marketing consent is enabled.",
          ],
        },
        {
          title: "3. Service Providers",
          body: [
            "The website may use hosting and content delivery services, the hotel booking engine, payment infrastructure, analytics and performance tools, marketing pixels and bot-protection services. A current vendor list can be reviewed through the official Turkish privacy and cookie documents.",
          ],
        },
        {
          title: "4. Managing Your Preferences",
          body: [
            "You can choose or change optional cookie preferences through the cookie banner, this page or the cookie preferences control in the site footer. Refusing optional cookies does not block the core site experience.",
          ],
        },
        {
          title: "5. Personal Data",
          body: [
            "For details on personal data processing, please review the KVKK Notice and Privacy Policy. You can also contact info@kozbeylikonagi.com for privacy questions.",
          ],
        },
      ]}
    />
  );
}
