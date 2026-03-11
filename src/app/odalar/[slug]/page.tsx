import Image from "next/image";
import { notFound } from "next/navigation";
import { rooms as fallbackRooms } from "@/data/rooms";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl } from "@/lib/utils";
import { getPayloadClient } from "@/lib/payload";
import { roomSchema } from "@/lib/schema";
import { Check } from "lucide-react";

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
        description: doc.description || doc.short,
        capacity: doc.capacity,
        size: doc.size,
        view: doc.view,
        amenities: doc.amenities || [],
        images:
          doc.images?.map((row: any) => row.image?.url).filter(Boolean) || ["/logo.svg"]
      };
    }
  } catch {}

  const fb = fallbackRooms.find((item) => item.slug === slug);
  return fb ? { ...fb } : null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const room = await findRoom(slug);

  if (!room) {
    return { title: "Oda bulunamadı" };
  }

  return {
    title: `${room.title} | Kozbeyli Konağı Luxury Hotel`,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roomSchema(room)) }}
      />
      <main className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="detail-layout">
            <div className="detail-media">
               <div className="main-image-wrapper">
                  <Image 
                    src={room.images[0]} 
                    alt={room.title} 
                    fill 
                    className="object-cover"
                    priority
                  />
               </div>
               <div className="image-strip">
                 {room.images.slice(1, 4).map((img, i) => (
                   <div key={i} className="strip-item">
                     <Image src={img} alt={`${room.title} view ${i}`} fill className="object-cover" />
                   </div>
                 ))}
               </div>
            </div>

            <div className="detail-content">
              <span className="eyebrow">RAFINE KONAKLAMA</span>
              <h1 className="serif">{room.title}</h1>
              <p className="description-text">{room.description}</p>

              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Kapasite</span>
                  <span className="spec-value">{room.capacity}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Büyüklük</span>
                  <span className="spec-value">{room.size}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Manzara</span>
                  <span className="spec-value">{room.view}</span>
                </div>
              </div>

              <div className="amenities-section">
                <h3 className="serif">Oda Olanakları</h3>
                <div className="amenities-list">
                  {room.amenities.map((item, i) => (
                    <div key={i} className="amenity-item">
                      <Check size={16} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="action-box">
                <div className="price-info">
                  <span className="price-label">Gecelik Başlayan Fiyatlar</span>
                  <span className="price-value">Lütfen Tarih Seçiniz</span>
                </div>
                <a href="/#rezervasyon" className="button primary full">
                  ONLINE REZERVASYON YAPIN
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .detail-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: start;
        }

        .main-image-wrapper {
          position: relative;
          height: 600px;
          margin-bottom: 20px;
        }

        .image-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .strip-item {
          position: relative;
          height: 120px;
        }

        .description-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #444;
          margin: 24px 0 40px;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 24px 0;
          margin-bottom: 40px;
        }

        .spec-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--gold);
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }

        .spec-value {
          font-weight: 500;
        }

        .amenities-section h3 {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }

        .amenities-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 24px;
          margin-bottom: 60px;
        }

        .amenity-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #666;
        }

        .action-box {
          background: var(--soft);
          padding: 32px;
          border-radius: 4px;
        }

        .price-info {
          margin-bottom: 20px;
        }

        .price-label {
          display: block;
          font-size: 0.8rem;
          color: #888;
        }

        .price-value {
          font-size: 1.25rem;
          font-family: var(--serif);
          color: var(--olive);
        }

        .button.full {
          width: 100%;
        }

        @media (max-width: 1024px) {
          .detail-layout {
            grid-template-columns: 1fr;
          }
          .main-image-wrapper {
            height: 400px;
          }
        }
      `}</style>

      <SiteFooter />
    </>
  );
}
