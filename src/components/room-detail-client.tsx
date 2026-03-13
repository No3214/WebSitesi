"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { FadeIn } from "@/components/animations";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import { SiteHeader } from "@/components/site-header";
import { rooms as fallbackRooms } from "@/data/rooms";

export function RoomDetailClient({ slug }: { slug: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(null);
  const room = fallbackRooms.find((item) => item.slug === slug);

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
                    {room.video ? (
                      <video 
                        src={room.video} 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        className="object-cover absolute inset-0 w-full h-full"
                      />
                    ) : (
                      <Image 
                        src={room.images[0]} 
                        alt={room.title} 
                        fill 
                        className="object-cover"
                        priority
                      />
                    )}
                 </div>
                 <div className="image-strip">
                   {room.images.map((img, i) => (
                     <div key={i} className="strip-item hover-scale">
                       <Image src={img} alt={`${room.title} view ${i}`} fill className="object-cover" />
                     </div>
                   ))}
                 </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="detail-content">
                <div className="premium-badge">MÜHÜRLÜ TAŞ KONAK</div>
                <h1 className="serif h1-premium">{room.title}</h1>
                <p className="description-premium">{room.description}</p>

                <div className="specs-row">
                  <div className="spec-card">
                    <div className="spec-icon">📏</div>
                    <span className="spec-label">Büyüklük</span>
                    <span className="spec-value">{room.size}</span>
                  </div>
                  <div className="spec-card">
                    <div className="spec-icon">👥</div>
                    <span className="spec-label">Kapasite</span>
                    <span className="spec-value">{room.capacity}</span>
                  </div>
                  <div className="spec-card">
                    <div className="spec-icon">🪟</div>
                    <span className="spec-label">Manzara</span>
                    <span className="spec-value">{room.view}</span>
                  </div>
                </div>

                <div className="amenities-grid-premium">
                  <h3 className="serif text-xl mb-4">Oda Deneyimi</h3>
                  <div className="amenities-list">
                    {room.amenities.map((item, i) => (
                      <div key={i} className="amenity-item-premium">
                        <Check size={14} className="text-gold" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="booking-card-premium">
                  <div className="price-stack">
                    <span className="price-eyebrow">DİREKT REZERVASYON AVANTAJI</span>
                    <span className="price-main">Lütfen Tarih Seçiniz</span>
                  </div>
                  <Link href="/#rezervasyon" className="button premium-cta full">
                    EN İYİ FİYATLA YERİNİZİ AYIRIN
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <style jsx>{`
        .detail-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 80px;
          align-items: start;
        }

        .main-image-wrapper {
          position: relative;
          height: 650px;
          margin-bottom: 24px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.25);
        }

        .image-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .strip-item {
          position: relative;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover { transform: scale(1.05); }

        .premium-badge {
          display: inline-block;
          background: var(--gold);
          color: white;
          padding: 4px 12px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          border-radius: 40px;
          margin-bottom: 16px;
        }

        .h1-premium {
          font-size: 4rem;
          line-height: 1;
          margin-bottom: 24px;
          color: var(--text);
        }

        .description-premium {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 48px;
        }

        .specs-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }

        .spec-card {
          background: #fdfaf6;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #f1ece1;
        }

        .spec-icon { font-size: 1.5rem; margin-bottom: 12px; }
        .spec-label { display: block; font-size: 0.7rem; text-transform: uppercase; color: #999; margin-bottom: 4px; }
        .spec-value { font-weight: 700; color: var(--text); }

        .amenities-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 48px;
        }

        .amenity-item-premium {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #666;
        }

        .booking-card-premium {
          background: var(--zinc-900);
          color: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.3);
        }

        .price-stack { margin-bottom: 24px; }
        .price-eyebrow { display: block; font-size: 0.7rem; color: var(--gold); margin-bottom: 4px; }
        .price-main { font-size: 1.8rem; font-family: var(--serif); }

        .premium-cta {
          background: var(--white);
          color: var(--black);
          width: 100%;
          justify-content: center;
          font-weight: 700;
          height: 60px;
        }
        .premium-cta:hover { background: var(--gold); color: white; }

        @media (max-width: 1200px) {
          .detail-layout { grid-template-columns: 1fr; gap: 40px; }
          .main-image-wrapper { height: 450px; }
          .h1-premium { font-size: 3rem; }
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
    </>
  );
}
