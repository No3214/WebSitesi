import { Metadata } from "next";
import { notFound } from "next/navigation";
import { rooms as fallbackRooms } from "@/data/rooms";
import { RoomDetailClient } from "@/components/room-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = fallbackRooms.find((item) => item.slug === slug);
  if (!room) return {};

  return {
    title: `${room.title} | Lüks Konaklama | Kozbeyli Konağı`,
    description: `${room.title}: ${room.short}. Kozbeyli Köyü'nde aslına uygun restore edilmiş taş mimari içinde sükunet dolu bir oda deneyimi.`,
    openGraph: {
      images: [room.images[0]],
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
