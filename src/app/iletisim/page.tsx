import { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { ContactClient } from "@/components/contact-client";
import { getDictionary } from "@/lib/dictionary";
import { KOZBEYLI_COORDS } from "@/lib/free-apis";

export const metadata: Metadata = {
  title: "İletişim & Ulaşım",
  description:
    "Kozbeyli Konağı'na ulaşın: Kozbeyli Köyü, Foça / İzmir. Telefon, WhatsApp concierge, e-posta ve yol tarifi. İzmir Adnan Menderes Havalimanı'na 55 dakika.",
  keywords: ["kozbeyli konağı iletişim", "kozbeyli köyü ulaşım", "foça otel telefon", "kozbeyli yol tarifi"],
  alternates: { canonical: "/iletisim" },
};

const PHONE_E164 = "+905322342686";
const EMAIL = "info@kozbeylikonagi.com";

export default async function ContactPage() {
  const initialDict = await getDictionary("tr");
  const { lat, lng } = KOZBEYLI_COORDS;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Kozbeyli Konağı",
    telephone: PHONE_E164,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kozbeyli Köyü",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    url: "https://www.kozbeylikonagi.com/iletisim",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="section">
        <ContactClient initialDict={initialDict} initialLocale="tr" />
      </main>
    </>
  );
}
