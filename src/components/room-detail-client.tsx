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

  const otherRooms = fallbackRooms.filter((r) => r.slug !== slug).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '32px', fontSize: '0.82rem', color: '#999' }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: '#999' }}>Ana Sayfa</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/odalar" style={{ color: '#999' }}>Odalar</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--olive)' }}>{room.title}</span>
          </nav>
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
                      sizes="(max-width: 1200px) 100vw, 55vw"
                    />
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
                    {room.price ? (
                      <>
                        <span className="price-main">₺{room.price.toLocaleString('tr-TR')}</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px' }}>/ gece · serpme kahvaltı dahil</span>
                      </>
                    ) : (
                      <span className="price-main">Fiyat İçin Arayınız</span>
                    )}
                  </div>
                  <Link href="/#rezervasyon" className="button premium-cta full">
                    EN İYİ FİYATLA YERİNİZİ AYIRIN
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Other Rooms */}
          {otherRooms.length > 0 && (
            <div style={{ marginTop: '80px' }}>
              <h2 className="serif" style={{ fontSize: '1.8rem', color: 'var(--olive)', marginBottom: '32px' }}>Diğer Odalarımız</h2>
              <div className="card-grid">
                {otherRooms.map((r) => (
                  <Link key={r.slug} href={`/odalar/${r.slug}`} className="card">
                    <div style={{ position: 'relative', height: '220px' }}>
                      <Image src={r.images[0]} alt={r.title} fill className="object-cover" sizes="33vw" />
                      <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600 }}>{r.size}</span>
                    </div>
                    <div className="card-body" style={{ padding: '20px' }}>
                      <span className="meta">{r.capacity} · {r.view}</span>
                      <h3 style={{ fontSize: '1.1rem' }}>{r.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
