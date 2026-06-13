import { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { ContactClient } from "@/components/contact-client";
import { getDictionary } from "@/lib/dictionary";
import { KOZBEYLI_COORDS } from "@/lib/free-apis";
import { PHONE_E164 } from "@/lib/contact";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "İletişim & Ulaşım Yol Tarifi",
  description:
    "Kozbeyli Konağı'na ulaşın: Kozbeyli Köyü Küme Evler No:188, Foça / İzmir. Telefon, WhatsApp concierge, e-posta ve yol tarifi. İzmir Adnan Menderes Havalimanı'na 55 dakika.",
  keywords: ["kozbeyli konağı iletişim", "kozbeyli köyü ulaşım", "foça otel telefon", "kozbeyli yol tarifi"],
  alternates: { canonical: "/iletisim" },
};

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
      streetAddress: "Kozbeyli Köyü Küme Evler No:188",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    url: absoluteUrl("/iletisim"),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader variant="overlay" />
      <PageHero
        eyebrow="İLETİŞİM"
        title="Konağa Ulaşın"
        text="Telefon, WhatsApp concierge ve yol tarifi — sorularınız için aynı gün dönüş yapıyoruz."
      />
      <main className="section" style={{ paddingTop: 56 }}>
        <ContactClient initialDict={initialDict} initialLocale="tr" />
      </main>
    </>
  );
}
