import type { Metadata } from "next";

import { RoomDetailPageContent, generateStaticParams } from "@/app/odalar/[slug]/page";
import { rooms } from "@/data/rooms";
import { localizeRoom } from "@/data/rooms-i18n";
import { absoluteUrl } from "@/lib/utils";

export { generateStaticParams };

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseRoom = rooms.find((room) => room.slug === slug);
  if (!baseRoom) return {};

  const room = localizeRoom(baseRoom, "en");
  const roomPath = `/en/odalar/${slug}`;

  return {
    title: `${room.title} | Boutique Accommodation`,
    description: `${room.short} Discover a considered stay in the historic stone setting of Kozbeyli Konağı near Foça.`,
    alternates: { canonical: roomPath },
    openGraph: {
      title: `${room.title} | Kozbeyli Konağı`,
      description: room.short,
      url: absoluteUrl(roomPath),
      images: [absoluteUrl(room.images[0])],
    },
  };
}

export default async function EnglishRoomDetailPage({ params }: Props) {
  return <RoomDetailPageContent params={params} locale="en" />;
}
