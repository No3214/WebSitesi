"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { rooms as fallbackRooms } from "@/data/rooms";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check } from "lucide-react";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";

type Props = {
  params: { slug: string };
};

export default function RoomDetailPage({ params }: Props) {
  const [dict, setDict] = useState<any>(null);
  const room = fallbackRooms.find((item) => item.slug === params.slug);

  useEffect(() => {
    const locale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    getDictionary(locale).then(setDict);
  }, []);

  if (!room) notFound();
  if (!dict) return <div className="loading-screen" />;

  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: '150px' }}>
        <div className="container">
          <div className="detail-layout">
            <FadeIn direction="left">
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
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="detail-content">
                <span className="eyebrow" style={{ color: 'var(--gold)' }}>RAFINE KONAKLAMA</span>
                <h1 className="serif" style={{ fontSize: '3rem', margin: '12px 0 24px' }}>{room.title}</h1>
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
                        <Check size={16} color="var(--olive)" />
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
            </FadeIn>
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
          border-radius: 8px;
          overflow: hidden;
        }

        .image-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .strip-item {
          position: relative;
          height: 120px;
          border-radius: 4px;
          overflow: hidden;
        }

        .description-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #444;
          margin-bottom: 40px;
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
          font-weight: 600;
          color: var(--text);
        }

        .amenities-section h3 {
          font-size: 1.5rem;
          margin-bottom: 24px;
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
          gap: 10px;
          font-size: 0.95rem;
          color: #555;
        }

        .action-box {
          background: #fdfaf6;
          padding: 32px;
          border: 1px solid #eee;
          border-radius: 8px;
        }

        .price-info {
          margin-bottom: 24px;
        }

        .price-label {
          display: block;
          font-size: 0.8rem;
          color: #888;
          margin-bottom: 4px;
        }

        .price-value {
          font-size: 1.5rem;
          font-family: var(--serif);
          color: var(--olive);
        }

        .button.full {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .detail-layout {
            grid-template-columns: 1fr;
          }
          .main-image-wrapper {
            height: 450px;
          }
        }
      `}</style>

      <SiteFooter />
    </>
  );
}
