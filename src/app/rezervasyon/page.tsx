import { sanitizeJsonLd } from "@/lib/security";
import { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { ReservationClient } from "@/components/reservation-client";
import { getDictionary } from "@/lib/dictionary";
import { rooms } from "@/data/rooms";
import { absoluteUrl } from "@/lib/utils";

type ReservationLocale = "tr" | "en";
type ReservationPageProps = {
  searchParams: Promise<{ oda?: string }>;
};

const reservationCopy = {
  tr: {
    eyebrow: "REZERVASYON",
    title: "Yerinizi Ayırtın",
    text: "Müsaitlik, oda tercihi ve güvenli ödeme adımı için talebinizi doğrudan konak ekibimize iletin.",
    schemaName: "Kozbeyli Konağı Rezervasyon",
    schemaDescription: "Kozbeyli Konağı taş butik otel için canlı müsaitlik ve direkt rezervasyon sayfası.",
    urlTemplate: "/rezervasyon",
  },
  en: {
    eyebrow: "RESERVATION",
    title: "Reserve Your Stay",
    text: "Send your availability, room preference and secure payment request directly to our team.",
    schemaName: "Kozbeyli Konağı Reservation",
    schemaDescription: "Direct availability and reservation request page for Kozbeyli Konağı stone boutique hotel.",
    urlTemplate: "/en/rezervasyon",
  },
} as const;

export const metadata: Metadata = {
  title: "Rezervasyon | Doğrudan Rezervasyon",
  description:
    "Kozbeyli Konağı'nda taş oda konaklamanız için doğrudan rezervasyon talebi oluşturun; müsaitlik, oda tercihi ve güvenli ödeme adımı ekibimiz tarafından teyit edilir.",
  keywords: [
    "kozbeyli konağı rezervasyon",
    "foça butik otel rezervasyon",
    "kozbeyli köyü konaklama",
    "taş otel izmir rezervasyon",
  ],
  alternates: { canonical: "/rezervasyon" },
};

export async function ReservationPageContent({
  searchParams,
  locale = "tr",
}: ReservationPageProps & {
  locale?: ReservationLocale;
}) {
  const { oda } = await searchParams;
  const selectedRoom = oda ? rooms.find((room) => room.slug === oda) : undefined;
  const initialDict = await getDictionary(locale);
  const copy = reservationCopy[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: copy.schemaName,
    description: copy.schemaDescription,
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl(copy.urlTemplate),
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} />
      <SiteHeader variant="overlay" />
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        text={copy.text}
      />
      <main className="section" style={{ paddingTop: 56 }}>
        <ReservationClient
          initialDict={initialDict}
          initialLocale={locale}
          roomSlug={oda}
          roomTitle={selectedRoom?.title}
        />
      </main>
    </>
  );
}

export default async function ReservationPage(props: ReservationPageProps) {
  return <ReservationPageContent {...props} locale="tr" />;
}
