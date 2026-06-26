import { sanitizeJsonLd } from "@/lib/security";
import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { ContactClient } from "@/components/contact-client";
import { getDictionary } from "@/lib/dictionary";
import { KOZBEYLI_COORDS } from "@/lib/free-apis";
import { PHONE_E164 } from "@/lib/contact";
import { absoluteUrl } from "@/lib/utils";

type ContactLocale = "tr" | "en";

const EMAIL = "info@kozbeylikonagi.com";

const contactCopy = {
  tr: {
    eyebrow: "İLETİŞİM",
    title: "Konağa Ulaşın",
    text: "Telefon, WhatsApp destek ve yol tarifi — sorularınız için aynı gün dönüş yapıyoruz.",
    url: "/iletisim",
  },
  en: {
    eyebrow: "CONTACT",
    title: "Contact the Mansion",
    text: "Phone, WhatsApp support and directions — our team replies to guest questions the same day.",
    url: "/en/contact",
  },
} as const;

export async function ContactPageContent({ locale = "tr" }: { locale?: ContactLocale }) {
  const initialDict = await getDictionary(locale);
  const { lat, lng } = KOZBEYLI_COORDS;
  const copy = contactCopy[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Kozbeyli Konağı",
    telephone: PHONE_E164,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kozbeyli Köyü Küme Evler No:188",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    url: absoluteUrl(copy.url),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} />
      <SiteHeader variant="solid" />
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        text={copy.text}
      />
      <main className="section" style={{ paddingTop: 56 }}>
        <ContactClient initialDict={initialDict} initialLocale={locale} />
      </main>
    </>
  );
}
