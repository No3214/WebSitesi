"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { FadeIn } from "@/components/animations";
import { useDictionary } from "@/hooks/use-dictionary";
import { SiteHeader } from "@/components/site-header";
import { whatsappLink } from "@/lib/constants";
import { RoomCard } from "@/components/room-card";
import { ImageLightbox } from "@/components/image-lightbox";
import { rooms as allRooms, localizeRoom } from "@/data/rooms";

const t = {
  tr: {
    home: "Ana Sayfa",
    rooms: "Odalar",
    badge: "MÜHÜRLÜ TAŞ KONAK",
    size: "Büyüklük",
    capacity: "Kapasite",
    view: "Manzara",
    experience: "Oda Deneyimi",
    bookingAdvantage: "DİREKT REZERVASYON AVANTAJI",
    perNight: "/ gece · serpme kahvaltı dahil",
    callForPrice: "Fiyat İçin Arayınız",
    bookCta: "EN İYİ FİYATLA YERİNİZİ AYIRIN",
    whatsappCta: "WhatsApp ile Bilgi Alın",
    otherRooms: "Diğer Odalarımız",
  },
  en: {
    home: "Home",
    rooms: "Rooms",
    badge: "SEALED STONE MANSION",
    size: "Size",
    capacity: "Capacity",
    view: "View",
    experience: "Room Experience",
    bookingAdvantage: "DIRECT BOOKING ADVANTAGE",
    perNight: "/ night · spread breakfast included",
    callForPrice: "Call for Price",
    bookCta: "BOOK AT THE BEST PRICE",
    whatsappCta: "Inquire via WhatsApp",
    otherRooms: "Our Other Rooms",
  },
} as const;

export function RoomDetailClient({ slug }: { slug: string }) {
  const { dict, locale } = useDictionary();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const rawRoom = allRooms.find((item) => item.slug === slug);

  if (!rawRoom) notFound();
  if (!dict) return (
    <div className="loading-screen">
      <div className="container" style={{ paddingTop: '120px' }}>
        <div className="skeleton skeleton-text-short" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '80px' }}>
          <div className="skeleton" style={{ height: '650px' }} />
          <div>
            <div className="skeleton skeleton-text" />
            <div className="skeleton" style={{ height: '40px', width: '80%', marginBottom: '16px' }} />
            <div className="skeleton" style={{ height: '120px', marginBottom: '24px' }} />
            <div className="skeleton" style={{ height: '200px' }} />
          </div>
        </div>
      </div>
    </div>
  );

  const room = localizeRoom(rawRoom, locale);
  const labels = t[locale];
  const otherRooms = allRooms.filter((r) => r.slug !== slug).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '32px', fontSize: '0.82rem', color: '#999' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: '#999' }}>{labels.home}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/odalar" style={{ color: '#999' }}>{labels.rooms}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--olive)' }}>{room.title}</span>
          </nav>
          <div className="detail-layout">
            <FadeIn direction="left">
              <div className="detail-media">
                 <div className="main-image-wrapper" onClick={() => setLightboxIndex(0)} style={{ cursor: 'zoom-in' }}>
                    <Image
                      src={rawRoom.images[0]}
                      alt={room.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1200px) 100vw, 55vw"
                    />
                 </div>
                 <div className="image-strip">
                   {rawRoom.images.map((img, i) => (
                     <div
                       key={i}
                       className="strip-item hover-scale"
                       role="button"
                       tabIndex={0}
                       aria-label={`${room.title} ${i + 1}`}
                       onClick={() => setLightboxIndex(i)}
                       onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxIndex(i); } }}
                     >
                       <Image src={img} alt={`${room.title} ${i + 1}`} fill className="object-cover" sizes="120px" />
                     </div>
                   ))}
                 </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="detail-content">
                <div className="premium-badge">{labels.badge}</div>
                <h1 className="serif h1-premium">{room.title}</h1>
                <p className="description-premium">{room.description}</p>

                <div className="specs-row">
                  <div className="spec-card">
                    <div className="spec-icon">📏</div>
                    <span className="spec-label">{labels.size}</span>
                    <span className="spec-value">{rawRoom.size}</span>
                  </div>
                  <div className="spec-card">
                    <div className="spec-icon">👥</div>
                    <span className="spec-label">{labels.capacity}</span>
                    <span className="spec-value">{room.capacity}</span>
                  </div>
                  <div className="spec-card">
                    <div className="spec-icon">🪟</div>
                    <span className="spec-label">{labels.view}</span>
                    <span className="spec-value">{room.view}</span>
                  </div>
                </div>

                <div className="amenities-grid-premium">
                  <h3 className="serif text-xl mb-4">{labels.experience}</h3>
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
                    <span className="price-eyebrow">{labels.bookingAdvantage}</span>
                    {rawRoom.price ? (
                      <>
                        <span className="price-main">₺{rawRoom.price.toLocaleString('tr-TR')}</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px' }}>{labels.perNight}</span>
                      </>
                    ) : (
                      <span className="price-main">{labels.callForPrice}</span>
                    )}
                  </div>
                  <Link href="/#rezervasyon" className="button premium-cta full">
                    {labels.bookCta}
                  </Link>
                  <a
                    href={whatsappLink(
                      locale === "tr"
                        ? `Merhaba, ${room.title} hakkında bilgi almak istiyorum.`
                        : `Hello, I would like to inquire about the ${room.title}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-cta"
                  >
                    💬 {labels.whatsappCta}
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Other Rooms */}
          {otherRooms.length > 0 && (
            <div style={{ marginTop: '80px' }}>
              <h2 className="serif" style={{ fontSize: '1.8rem', color: 'var(--olive)', marginBottom: '32px' }}>{labels.otherRooms}</h2>
              <div className="card-grid">
                {otherRooms.map((r) => {
                  const lr = localizeRoom(r, locale);
                  return (
                    <RoomCard
                      key={r.slug}
                      slug={r.slug}
                      title={lr.title}
                      capacity={lr.capacity}
                      view={lr.view}
                      size={r.size}
                      image={r.images[0]}
                      locale={locale}
                      compact
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={rawRoom.images}
          initialIndex={lightboxIndex}
          alt={room.title}
          onClose={() => setLightboxIndex(null)}
        />
      )}

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
          background: var(--soft);
          padding: 24px;
          border-radius: 0;
          text-align: center;
          border: 1px solid var(--border);
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
          background: var(--olive);
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

        .whatsapp-cta {
          display: block;
          text-align: center;
          margin-top: 12px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: rgba(255,255,255,0.85);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .whatsapp-cta:hover {
          background: rgba(37, 211, 102, 0.15);
          border-color: #25d366;
          color: #25d366;
          opacity: 1;
        }

        @media (max-width: 1200px) {
          .detail-layout { grid-template-columns: 1fr; gap: 40px; }
          .main-image-wrapper { height: 450px; }
          .h1-premium { font-size: 3rem; }
        }

        @media (max-width: 768px) {
          .h1-premium { font-size: 2rem; }
          .description-premium { font-size: 1rem; }
        }
      `}</style>
    </>
  );
}
