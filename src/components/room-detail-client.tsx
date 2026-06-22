"use client";

import Image from "next/image";
import { notFound, usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "@/components/animations";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import { SiteHeader } from "@/components/site-header";
import { WeatherRibbon } from "@/components/weather-ribbon";
import { rooms as fallbackRooms } from "@/data/rooms";
import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";
import { publicEnv } from "@/lib/public-env";

export function RoomDetailClient({ slug }: { slug: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(null);
  const [activeImg, setActiveImg] = useState(0);
  const room = fallbackRooms.find((item) => item.slug === slug);
  const pathname = usePathname();
  const bookingHref = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL, {
    roomSlug: slug,
  });

  useEffect(() => {
    const locale = pathname === "/en" || Boolean(pathname?.startsWith("/en/")) ? "en" : "tr";
    getDictionary(locale).then(setDict);
  }, [pathname]);

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
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={activeImg}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ position: "absolute", inset: 0 }}
                      >
                        <Image
                          src={room.images[activeImg] ?? room.images[0]}
                          alt={`${room.title} — görsel ${activeImg + 1}`}
                          fill
                          sizes="(max-width: 1200px) 100vw, 55vw"
                          className="object-cover"
                          priority
                          unoptimized
                        />
                      </motion.div>
                    </AnimatePresence>
                    <span className="image-counter" aria-hidden>
                      {activeImg + 1} / {room.images.length}
                    </span>
                 </div>
                 {room.images.length > 1 && (
                   <div className="image-strip" role="group" aria-label="Oda galerisi">
                     {room.images.map((img, i) => (
                       <button
                         type="button"
                         key={i}
                         className={`strip-item hover-scale ${i === activeImg ? "active" : ""}`}
                         onClick={() => setActiveImg(i)}
                         aria-label={`${room.title} görsel ${i + 1}`}
                         aria-pressed={i === activeImg}
                       >
                         <Image
                           src={img}
                           alt=""
                           fill
                           sizes="120px"
                           className="object-cover"
                           unoptimized
                         />
                       </button>
                     ))}
                   </div>
                 )}
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

                <WeatherRibbon />
                <div className="booking-card-premium">
                  <div className="price-stack">
                    <span className="price-eyebrow">DİREKT REZERVASYON AVANTAJI</span>
                    <span className="price-main">Lütfen Tarih Seçiniz</span>
                  </div>
                  <ul className="room-booking-trust" aria-label="Rezervasyon güven notları">
                    <li>Resmi HMS rezervasyon ekranı</li>
                    <li>Kart bilgisi bu sitede saklanmaz</li>
                    <li>WhatsApp destek açık kalır</li>
                  </ul>
                  <a
                    href={bookingHref}
                    className="button premium-cta full"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event="booking_engine_open"
                  >
                    EN İYİ FİYATLA YERİNİZİ AYIRIN
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
          transition: transform 0.3s ease, outline-color 0.3s ease, opacity 0.3s ease;
          border: none;
          padding: 0;
          background: none;
          outline: 2px solid transparent;
          outline-offset: -2px;
          opacity: 0.75;
        }

        .strip-item.active {
          outline-color: var(--gold);
          opacity: 1;
        }

        .hover-scale:hover { transform: scale(1.05); opacity: 1; }

        .image-counter {
          position: absolute;
          right: 14px;
          bottom: 14px;
          z-index: 2;
          background: rgba(61, 74, 59, 0.72);
          color: var(--ivory);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          padding: 6px 12px;
          border-radius: 40px;
          backdrop-filter: blur(6px);
        }

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
          background:
            radial-gradient(420px 200px at 90% -20%, rgba(179, 146, 92, 0.18), transparent 60%),
            linear-gradient(135deg, rgba(255, 252, 246, 0.98), rgba(241, 234, 220, 0.94)),
            #f7f1e7;
          color: var(--olive, #3d4a3b);
          padding: 40px;
          border-radius: 16px;
          border: 1px solid rgba(61, 74, 59, 0.12);
          box-shadow: 0 24px 70px rgba(68, 53, 31, 0.1);
        }

        .price-stack { margin-bottom: 24px; }
        .price-eyebrow { display: block; font-size: 0.7rem; color: var(--gold); margin-bottom: 4px; }
        .price-main { font-size: 1.8rem; font-family: var(--serif); color: var(--olive, #3d4a3b); }

        .room-booking-trust {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          display: grid;
          gap: 10px;
        }

        .room-booking-trust li {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #4f5a4b;
          font-size: 0.88rem;
          line-height: 1.45;
        }

        .room-booking-trust li::before {
          content: "";
          flex: 0 0 8px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--gold);
          box-shadow: 0 0 0 4px rgba(179, 146, 92, 0.16);
        }

        .premium-cta {
          background: var(--olive, #3d4a3b);
          color: var(--white, #fffdf8);
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
