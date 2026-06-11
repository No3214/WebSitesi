import type { Metadata } from "next";
import { rooms } from "@/data/rooms";
import Page, { generateStaticParams } from "@/app/odalar/[slug]/page";

export { generateStaticParams };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = rooms.find((r) => r.slug === slug);
  if (!room) return {};

  return {
    title: `${room.title} | Accommodation`,
    description: `${room.short}`,
    alternates: { canonical: `/en/odalar/${slug}` },
  };
}

export default Page;
