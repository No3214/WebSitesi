import { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoomDetailClient } from "@/components/room-detail-client";
import { RoomViewTracker } from "@/components/room-view-tracker";
import { rooms as fallbackRooms } from "@/data/rooms";
import { localizeRoom, type RoomLocale } from "@/data/rooms-i18n";
import { absoluteUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return fallbackRooms.map((room) => ({ slug: room.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseRoom = fallbackRooms.find((item) => item.slug === slug);
  if (!baseRoom) return {};

  const room = localizeRoom(baseRoom, "tr");

  return {
    title: `${room.title} | Lüks Konaklama`,
    description: `${room.title}: ${room.short}. Kozbeyli Köyü'nde restore edilmiş taş mimari içinde sakin bir oda deneyimi.`,
    alternates: { canonical: `/odalar/${slug}` },
    openGraph: {
      images: [absoluteUrl(room.images[0])],
      title: `${room.title} | Kozbeyli Konağı`,
      url: absoluteUrl(`/odalar/${slug}`),
    },
  };
}

export async function RoomDetailPageContent({
  params,
  locale = "tr",
}: Props & { locale?: RoomLocale }) {
  const { slug } = await params;
  const baseRoom = fallbackRooms.find((item) => item.slug === slug);
  if (!baseRoom) notFound();

  const room = localizeRoom(baseRoom, locale);
  const localePrefix = locale === "en" ? "/en" : "";
  const roomPath = `${localePrefix}/odalar/${room.slug}`;
  const roomsPath = `${localePrefix}/odalar`;

  const roomJsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    inLanguage: locale,
    name: room.title,
    description: room.short,
    image: room.images.map((image) => absoluteUrl(image)),
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: parseInt(room.capacity, 10) || 2,
      unitText: locale === "tr" ? "kişi" : "guests",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: parseInt(room.size, 10) || undefined,
      unitCode: "MTK",
    },
    amenityFeature: room.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
    containedInPlace: {
      "@type": "Hotel",
      name: "Kozbeyli Konağı Taş Otel & Restaurant",
      url: absoluteUrl(localePrefix || "/"),
    },
    url: absoluteUrl(roomPath),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "tr" ? "Ana Sayfa" : "Home",
        item: absoluteUrl(localePrefix || "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "tr" ? "Odalar" : "Rooms",
        item: absoluteUrl(roomsPath),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: room.title,
        item: absoluteUrl(roomPath),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roomJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RoomViewTracker slug={room.slug} title={room.title} />
      <RoomDetailClient slug={slug} />
    </>
  );
}

export default async function RoomDetailPage({ params }: Props) {
  return <RoomDetailPageContent params={params} locale="tr" />;
}
