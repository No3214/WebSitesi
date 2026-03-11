import { notFound } from "next/navigation";
import { rooms as fallbackRooms } from "@/data/rooms";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { absoluteUrl } from "@/lib/utils";
import { getPayloadClient } from "@/lib/payload";

type Props = {
  params: Promise<{ slug: string }>;
};

async function findRoom(slug: string) {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "rooms",
      where: {
        slug: { equals: slug }
      },
      limit: 1
    });

    const doc = result.docs[0];

    if (doc) {
      return {
        slug: doc.slug,
        title: doc.title,
        short: doc.short,
        capacity: doc.capacity,
        size: doc.size,
        view: doc.view,
        images:
          doc.images?.map((row: any) => row.image?.url).filter(Boolean) || ["/logo.svg"]
      };
    }
  } catch {}

  return fallbackRooms.find((item) => item.slug === slug) || null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const room = await findRoom(slug);

  if (!room) {
    return { title: "Oda bulunamadı" };
  }

  return {
    title: room.title,
    description: room.short,
    alternates: {
      canonical: `/odalar/${room.slug}`
    },
    openGraph: {
      title: `${room.title} | Kozbeyli Konağı`,
      description: room.short,
      url: absoluteUrl(`/odalar/${room.slug}`),
      images: [absoluteUrl(room.images[0])]
    }
  };
}

export async function generateStaticParams() {
  return fallbackRooms.map((room) => ({ slug: room.slug }));
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = await findRoom(slug);

  if (!room) notFound();

  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container">
          <SectionTitle eyebrow="Oda Detayı" title={room.title} text={room.short} />

          <div className="detail-grid">
            <div>
              <img className="detail-main-image" src={room.images[0]} alt={room.title} />
            </div>

            <div className="detail-box">
              <h3>Genel Özellikler</h3>
              <ul>
                <li><span>Kapasite</span> <span>{room.capacity}</span></li>
                <li><span>Alan</span> <span>{room.size}</span></li>
                <li><span>Manzara</span> <span>{room.view}</span></li>
                <li><span>Kahvaltı</span> <span>Zengin Serpme Kahvaltı Dahil</span></li>
              </ul>

              <a className="button primary" href="/#rezervasyon" style={{ width: '100%' }}>
                Müsaitlik ve Rezervasyon
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
