import { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { ReservationClient } from "@/components/reservation-client";
import { getDictionary } from "@/lib/dictionary";
import { rooms } from "@/data/rooms";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rezervasyon | Doğrudan Concierge",
  description:
    "Kozbeyli Konağı'nda taş oda konaklamanız için doğrudan concierge talebi oluşturun; müsaitlik, oda tercihi ve güvenli ödeme adımı ekibimiz tarafından teyit edilir.",
  keywords: [
    "kozbeyli konağı rezervasyon",
    "foça butik otel rezervasyon",
    "kozbeyli köyü konaklama",
    "taş otel izmir rezervasyon",
  ],
  alternates: { canonical: "/rezervasyon" },
};

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ oda?: string }>;
}) {
  const { oda } = await searchParams;
  const selectedRoom = oda ? rooms.find((room) => room.slug === oda) : undefined;
  const initialDict = await getDictionary("tr");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Kozbeyli Konağı Rezervasyon",
    description: "Kozbeyli Konağı taş butik otel için canlı müsaitlik ve direkt rezervasyon sayfası.",
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/rezervasyon"),
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
      <SiteHeader variant="overlay" />
      <PageHero
        eyebrow="REZERVASYON"
        title="Yerinizi Ayırtın"
        text="Müsaitlik, oda tercihi ve güvenli ödeme adımı için talebinizi doğrudan konak ekibimize iletin."
      />
      <main className="section" style={{ paddingTop: 56 }}>
        <ReservationClient
          initialDict={initialDict}
          initialLocale="tr"
          roomSlug={oda}
          roomTitle={selectedRoom?.title}
        />
      </main>
    </>
  );
}
