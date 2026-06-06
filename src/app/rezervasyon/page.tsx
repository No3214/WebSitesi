import { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { ReservationClient } from "@/components/reservation-client";

export const metadata: Metadata = {
  title: "Rezervasyon | En İyi Fiyat Garantisi",
  description:
    "Kozbeyli Konağı'nda taş oda rezervasyonunuzu direkt yapın: en iyi fiyat garantisi, esnek iptal ve WhatsApp concierge desteği. Canlı müsaitlik için rezervasyon motorumuzu kullanın.",
  keywords: [
    "kozbeyli konağı rezervasyon",
    "foça butik otel rezervasyon",
    "kozbeyli köyü konaklama",
    "taş otel izmir rezervasyon",
  ],
  alternates: { canonical: "/rezervasyon" },
};

export default function ReservationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Kozbeyli Konağı Rezervasyon",
    description: "Kozbeyli Konağı taş butik otel için canlı müsaitlik ve direkt rezervasyon sayfası.",
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.kozbeylikonagi.com/rezervasyon",
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
      object: {
        "@type": "LodgingBusiness",
        name: "Kozbeyli Konağı",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Foça",
          addressRegion: "İzmir",
          streetAddress: "Kozbeyli Köyü",
          addressCountry: "TR",
        },
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="section">
        <ReservationClient />
      </main>
    </>
  );
}
