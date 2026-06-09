import { Metadata } from "next";
import { notFound } from "next/navigation";
import { rooms as fallbackRooms } from "@/data/rooms";
import { RoomDetailClient } from "@/components/room-detail-client";
import { absoluteUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

// Oda verisi lokal (rooms.ts) — sayfalar build'de statik üretilir,
// bilinmeyen slug'lar dynamicParams=false ile otomatik 404 olur.
export function generateStaticParams() {
  return fallbackRooms.map((room) => ({ slug: room.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = fallbackRooms.find((item) => item.slug === slug);
  if (!room) return {};

  return {
    title: `${room.title} | Lüks Konaklama | Kozbeyli Konağı`,
    description: `${room.title}: ${room.short}. Kozbeyli Köyü'nde aslına uygun restore edilmiş taş mimari içinde sükunet dolu bir oda deneyimi.`,
    openGraph: {
      images: [absoluteUrl(room.images[0])],
      title: `${room.title} - Kozbeyli Konağı`,
    },
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const roomExists = fallbackRooms.some((item) => item.slug === slug);
  if (!roomExists) notFound();

  return <RoomDetailClient slug={slug} />;
}
