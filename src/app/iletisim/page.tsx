import { Metadata } from "next";
import { ContactClient } from "./contact-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "İletişim & Ulaşım | Kozbeyli Konağı",
  description:
    "Kozbeyli Konağı'na ulaşın. Foça Kozbeyli köyünde butik otel rezervasyonu, restoran bilgileri, yol tarifi ve iletişim detayları. Telefon: 0532 234 26 86.",
  keywords: [
    "kozbeyli konağı iletişim",
    "foça otel telefon",
    "kozbeyli konağı adres",
    "foça butik otel rezervasyon",
    "kozbeyli konağı yol tarifi",
    "foça konaklama iletişim",
  ],
  alternates: { canonical: "/iletisim" },
  openGraph: {
    title: "İletişim & Ulaşım | Kozbeyli Konağı",
    description: "Rezervasyon, restoran ve ulaşım bilgileri. Telefon: 0532 234 26 86.",
    images: [
      {
        url: absoluteUrl("/images/rooms/bahce-3.jpeg"),
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı - İletişim ve Ulaşım",
      },
    ],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Kozbeyli Konağı",
  description: "Foça Kozbeyli köyünde 500 yıllık taş mimaride butik otel ve restoran.",
  url: absoluteUrl("/"),
  telephone: "+905322342686",
  email: "info@kozbeylikonagi.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kozbeyli Küme Evleri No:188",
    addressLocality: "Foça",
    addressRegion: "İzmir",
    postalCode: "35680",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 38.7275,
    longitude: 26.7456,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:30",
    closes: "23:00",
  },
  sameAs: [
    "https://www.instagram.com/kozbeylikonagi/",
  ],
  image: absoluteUrl("/images/rooms/bahce-3.jpeg"),
  priceRange: "₺₺₺",
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[
        breadcrumbSchema([
          { name: "Ana Sayfa", url: "/" },
          { name: "İletişim" },
        ]),
        localBusinessSchema,
      ]} />
      <ContactClient />
    </>
  );
}
