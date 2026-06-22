import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoomDetailClient } from "@/components/room-detail-client";
import { RoomViewTracker } from "@/components/room-view-tracker";
import { getLocalizedRoom, rooms } from "@/data/rooms";
import { absoluteUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return rooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseRoom = rooms.find((r) => r.slug === slug);
  if (!baseRoom) return {};
  const room = getLocalizedRoom(baseRoom, "en");

  return {
    title: `${room.title} | Accommodation`,
    description: room.short,
    alternates: { canonical: `/en/odalar/${slug}` },
    openGraph: {
      images: [absoluteUrl(room.images[0])],
      title: `${room.title} - Kozbeyli Konağı`,
      description: room.short,
    },
  };
}

export default async function EnglishRoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const baseRoom = rooms.find((item) => item.slug === slug);
  if (!baseRoom) notFound();
  const room = getLocalizedRoom(baseRoom, "en");

  const roomJsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.title,
    description: room.short,
    image: room.images.map((img) => absoluteUrl(img)),
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: parseInt(room.capacity, 10) || 2,
      unitText: "guests",
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
      name: "Kozbeyli Konağı Stone Hotel & Restaurant",
      url: absoluteUrl("/en"),
    },
    url: absoluteUrl(`/en/odalar/${room.slug}`),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en") },
      { "@type": "ListItem", position: 2, name: "Rooms", item: absoluteUrl("/en/odalar") },
      { "@type": "ListItem", position: 3, name: room.title, item: absoluteUrl(`/en/odalar/${room.slug}`) },
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
