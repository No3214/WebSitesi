import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { ReservationClient } from "@/components/reservation-client";
import { getDictionary } from "@/lib/dictionary";
import { getLocalizedRoom, rooms } from "@/data/rooms";
import { absoluteUrl } from "@/lib/utils";

type ReservationLocale = "tr" | "en";

export type ReservationPageContentProps = {
  searchParams: Promise<{ oda?: string }>;
  locale?: ReservationLocale;
};

const reservationCopy = {
  tr: {
    eyebrow: "REZERVASYON",
    title: "Rezervasyon",
    text: "Tarih, kişi sayısı ve oda seçimi resmi HMS rezervasyon ekranında açılır; ekibimiz WhatsApp ve telefon desteğiyle yanınızda kalır.",
    schemaName: "Kozbeyli Konağı Rezervasyon",
    schemaDescription: "Kozbeyli Konağı taş butik otel için canlı müsaitlik ve direkt rezervasyon sayfası.",
    urlTemplate: "/rezervasyon",
  },
  en: {
    eyebrow: "RESERVATION",
    title: "Booking",
    text: "Dates, guests and room selection open in the official HMS booking screen; our team remains available by WhatsApp and phone.",
    schemaName: "Kozbeyli Konağı Reservation",
    schemaDescription: "Direct availability and reservation request page for Kozbeyli Konağı stone boutique hotel.",
    urlTemplate: "/en/rezervasyon",
  },
} as const;

export async function ReservationPageContent({
  searchParams,
  locale = "tr",
}: ReservationPageContentProps) {
  const { oda } = await searchParams;
  const selectedBaseRoom = oda ? rooms.find((room) => room.slug === oda) : undefined;
  const selectedRoom = selectedBaseRoom ? getLocalizedRoom(selectedBaseRoom, locale) : undefined;
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader variant="solid" />
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
