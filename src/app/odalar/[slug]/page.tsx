import { Metadata } from "next";
import { notFound } from "next/navigation";
import { rooms as fallbackRooms } from "@/data/rooms";
import { RoomDetailClient } from "@/components/room-detail-client";
import { RoomViewTracker } from "@/components/room-view-tracker";
import { absoluteUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

// Oda verisi lokal (rooms.ts); bilinen sayfalar build'de statik üretilir,
// bilinmeyen slug'lar sayfa seviyesinde notFound() ile sessiz 404 olur.
export function generateStaticParams() {
  return fallbackRooms.map((room) => ({ slug: room.slug }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = fallbackRooms.find((item) => item.slug === slug);
  if (!room) return {};

  return {
    title: `${room.title} | Lüks Konaklama`,
    description: `${room.title}: ${room.short}. Kozbeyli Köyü'nde aslına uygun restore edilmiş taş mimari içinde sükunet dolu bir oda deneyimi.`,
    openGraph: {
      images: [absoluteUrl(room.images[0])],
      title: `${room.title} - Kozbeyli Konağı`,
    },
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = fallbackRooms.find((item) => item.slug === slug);
  if (!room) notFound();

  // Zengin sonuçlar: HotelRoom + BreadcrumbList
  const roomJsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.title,
    description: room.short,
    image: room.images.map((img) => absoluteUrl(img)),
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: parseInt(room.capacity, 10) || 2,
      unitText: "kişi",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: parseInt(room.size, 10) || undefined,
      unitCode: "MTK",
    },
    amenityFeature: room.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    containedInPlace: {
      "@type": "Hotel",
      name: "Kozbeyli Konağı Taş Otel & Restaurant",
      url: absoluteUrl("/"),
    },
    url: absoluteUrl(`/odalar/${room.slug}`),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Odalar", item: absoluteUrl("/odalar") },
      { "@type": "ListItem", position: 3, name: room.title, item: absoluteUrl(`/odalar/${room.slug}`) },
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
      <RoomDetailClient slug={slug} initialLocale="tr" />
    </>
  );
}
