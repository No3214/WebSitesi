import { Metadata } from "next";
import { notFound } from "next/navigation";
import { rooms as fallbackRooms } from "@/data/rooms";
import { RoomDetailClient } from "@/components/room-detail-client";
import { roomSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return fallbackRooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = fallbackRooms.find((item) => item.slug === slug);
  if (!room) return {};

  return {
    title: `${room.title} | Lüks Konaklama`,
    description: `${room.title}: ${room.short} ${room.size}, ${room.capacity}. Kozbeyli Köyü'nde aslına uygun restore edilmiş taş mimari.`,
    alternates: {
      canonical: `/odalar/${slug}`,
    },
    openGraph: {
      images: room.images.slice(0, 3).map((img) => ({
        url: absoluteUrl(img),
        width: 1200,
        height: 630,
        alt: `${room.title} - Kozbeyli Konağı`,
      })),
      title: `${room.title} - Kozbeyli Konağı`,
      type: "website",
    },
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = fallbackRooms.find((item) => item.slug === slug);
  if (!room) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roomSchema(room)) }}
      />
      <RoomDetailClient slug={slug} />
    </>
  );
}
