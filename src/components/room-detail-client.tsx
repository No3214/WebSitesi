"use client";

import Image from "next/image";
import { notFound, usePathname } from "next/navigation";
import { Check, Eye, Ruler, UsersRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { FadeIn } from "@/components/animations";
import { SiteHeader } from "@/components/site-header";
import { WeatherRibbon } from "@/components/weather-ribbon";
import { rooms as fallbackRooms } from "@/data/rooms";
import { localizeRoom } from "@/data/rooms-i18n";
import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";
import { publicEnv } from "@/lib/public-env";

const UI_COPY = {
  tr: {
    badge: "KOZBEYLİ’DE TARİHİ KONAKLAMA",
    gallery: "Oda fotoğrafları",
    image: "fotoğraf",
    size: "Büyüklük",
    capacity: "Kapasite",
    view: "Manzara",
    amenities: "Oda özellikleri",
    bookingEyebrow: "DİREKT REZERVASYON",
    bookingTitle: "Tarihlerinizi seçin",
    bookingText: "Müsaitlik ve güncel konaklama koşulları resmi rezervasyon ekranında gösterilir.",
    bookingCta: "Müsaitliği Kontrol Et",
  },
  en: {
    badge: "A HISTORIC STAY IN KOZBEYLI",
    gallery: "Room photographs",
    image: "photograph",
    size: "Size",
    capacity: "Capacity",
    view: "View",
    amenities: "Room features",
    bookingEyebrow: "DIRECT BOOKING",
    bookingTitle: "Select your dates",
    bookingText: "Availability and current stay conditions are shown in the official booking screen.",
    bookingCta: "Check Availability",
  },
} as const;

export function RoomDetailClient({ slug }: { slug: string }) {
  const [activeImg, setActiveImg] = useState(0);
  const pathname = usePathname();
  const locale = pathname === "/en" || Boolean(pathname?.startsWith("/en/")) ? "en" : "tr";
  const baseRoom = fallbackRooms.find((item) => item.slug === slug);

  if (!baseRoom) notFound();

  const room = localizeRoom(baseRoom, locale);
  const copy = UI_COPY[locale];
  const bookingHref = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL, {
    roomSlug: slug,
  });

  const specs = [
    { label: copy.size, value: room.size, Icon: Ruler },
    { label: copy.capacity, value: room.capacity, Icon: UsersRound },
    { label: copy.view, value: room.view, Icon: Eye },
  ];

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="room-detail-page">
        <div className="container">
          <div className="detail-layout">
            <FadeIn direction="left">
              <div className="detail-media">
                <div className="main-image-wrapper">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={activeImg}
                      initial={{ opacity: 0, scale: 1.025 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <Image
                        src={room.images[activeImg] ?? room.images[0]}
                        alt={`${room.title} — ${copy.image} ${activeImg + 1}`}
                        fill
                        sizes="(max-width: 1200px) 100vw, 58vw"
                        className="object-cover"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                  <span className="image-counter" aria-hidden>
                    {String(activeImg + 1).padStart(2, "0")} / {String(room.images.length).padStart(2, "0")}
                  </span>
                </div>

                {room.images.length > 1 && (
                  <div className="image-strip" role="group" aria-label={copy.gallery}>
                    {room.images.map((img, index) => (
                      <button
                        type="button"
                        key={img}
                        className={`strip-item ${index === activeImg ? "active" : ""}`}
                        onClick={() => setActiveImg(index)}
                        aria-label={`${room.title} — ${copy.image} ${index + 1}`}
                        aria-pressed={index === activeImg}
                      >
                        <Image src={img} alt="" fill sizes="120px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.15}>
              <article className="detail-content" aria-labelledby="room-title">
                <div className="room-kicker">
                  <span className="kicker-line" aria-hidden />
                  <span>{copy.badge}</span>
                </div>

                <h1 id="room-title" className="room-title">
                  {room.title}
                </h1>
                <p className="room-description">{room.description}</p>

                <div className="specs-row" role="list">
                  {specs.map(({ label, value, Icon }) => (
                    <div className="spec-item" role="listitem" key={label}>
                      <Icon className="spec-icon" size={20} strokeWidth={1.5} aria-hidden />
                      <span className="spec-label">{label}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>

                <section className="amenities-section" aria-labelledby="amenities-title">
                  <h2 id="amenities-title">{copy.amenities}</h2>
                  <div className="amenities-list">
                    {room.amenities.map((item) => (
                      <div key={item} className="amenity-item">
                        <Check size={15} strokeWidth={1.8} aria-hidden />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <WeatherRibbon locale={locale} />

                <aside className="booking-panel" aria-label={copy.bookingEyebrow}>
                  <span className="booking-eyebrow">{copy.bookingEyebrow}</span>
                  <h2>{copy.bookingTitle}</h2>
                  <p>{copy.bookingText}</p>
                  <a
                    href={bookingHref}
                    className="button gold booking-action"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event="booking_engine_open"
                  >
                    {copy.bookingCta}
                  </a>
                </aside>
              </article>
            </FadeIn>
          </div>
        </div>
      </main>

      <style jsx>{`
        .room-detail-page {
          padding: clamp(132px, 12vw, 176px) 0 clamp(80px, 10vw, 132px);
          background:
            radial-gradient(900px 380px at 92% 4%, rgba(179, 146, 92, 0.1), transparent 62%),
            var(--ivory);
        }

        .detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.14fr) minmax(360px, 0.86fr);
          gap: clamp(48px, 7vw, 96px);
          align-items: start;
        }

        .detail-media {
          position: sticky;
          top: 116px;
        }

        .main-image-wrapper {
          position: relative;
          height: min(72vh, 720px);
          min-height: 540px;
          overflow: hidden;
          background: var(--stone-warm);
          box-shadow: 0 26px 70px rgba(20, 22, 26, 0.14);
        }

        .image-strip {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(86px, 1fr);
          gap: 10px;
          margin-top: 12px;
          overflow-x: auto;
          padding: 2px 2px 8px;
          scrollbar-width: thin;
        }

        .strip-item {
          position: relative;
          aspect-ratio: 4 / 3;
          min-width: 86px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid transparent;
          padding: 0;
          background: var(--stone-warm);
          opacity: 0.58;
          transition:
            opacity 0.35s var(--ease-lux),
            border-color 0.35s var(--ease-lux),
            transform 0.35s var(--ease-lux);
        }

        .strip-item:hover,
        .strip-item:focus-visible,
        .strip-item.active {
          opacity: 1;
          border-color: var(--gold);
        }

        .strip-item:hover {
          transform: translateY(-2px);
        }

        .image-counter {
          position: absolute;
          right: 18px;
          bottom: 18px;
          z-index: 2;
          padding: 8px 12px;
          background: rgba(20, 22, 26, 0.58);
          color: var(--ivory);
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .detail-content {
          padding-top: clamp(4px, 1vw, 18px);
        }

        .room-kicker {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
          color: var(--gold-text);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .kicker-line {
          width: 38px;
          height: 1px;
          background: var(--gold);
        }

        .room-title {
          margin: 0;
          max-width: 680px;
          color: var(--ink);
          font-family: var(--serif);
          font-size: clamp(2.7rem, 5vw, 4.8rem);
          font-weight: 400;
          line-height: 0.98;
          letter-spacing: -0.035em;
          text-wrap: balance;
        }

        .room-description {
          margin: 32px 0 0;
          max-width: 680px;
          color: var(--muted);
          font-size: clamp(1rem, 1.2vw, 1.12rem);
          line-height: 1.9;
        }

        .specs-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-top: 44px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .spec-item {
          display: grid;
          grid-template-columns: auto 1fr;
          column-gap: 10px;
          row-gap: 5px;
          align-items: center;
          padding: 24px 20px;
          border-right: 1px solid var(--border);
        }

        .spec-item:first-child {
          padding-left: 0;
        }

        .spec-item:last-child {
          padding-right: 0;
          border-right: 0;
        }

        .spec-icon {
          grid-row: 1 / span 2;
          color: var(--gold-text);
        }

        .spec-label {
          color: var(--muted);
          font-size: 0.63rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .spec-value {
          color: var(--ink);
          font-family: var(--serif);
          font-size: 1rem;
          line-height: 1.25;
        }

        .amenities-section {
          margin-top: 42px;
        }

        .amenities-section h2 {
          margin: 0 0 20px;
          color: var(--ink);
          font-family: var(--serif);
          font-size: 1.5rem;
          font-weight: 400;
        }

        .amenities-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 22px;
        }

        .amenity-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .amenity-item :global(svg) {
          flex: 0 0 auto;
          margin-top: 3px;
          color: var(--gold-text);
        }

        .booking-panel {
          margin-top: 28px;
          padding: clamp(30px, 4vw, 46px);
          border-top: 2px solid var(--gold);
          background:
            radial-gradient(460px 220px at 90% -20%, rgba(207, 179, 137, 0.2), transparent 62%),
            var(--olive-deep);
          color: var(--ivory);
          box-shadow: 0 28px 64px rgba(20, 22, 26, 0.16);
        }

        .booking-eyebrow {
          display: block;
          margin-bottom: 12px;
          color: var(--gold-soft);
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .booking-panel h2 {
          margin: 0;
          color: var(--ivory);
          font-family: var(--serif);
          font-size: clamp(1.8rem, 3vw, 2.45rem);
          font-weight: 400;
        }

        .booking-panel p {
          margin: 14px 0 24px;
          color: rgba(250, 249, 246, 0.72);
          font-size: 0.92rem;
          line-height: 1.7;
        }

        .booking-action {
          width: 100%;
        }

        @media (max-width: 1200px) {
          .detail-layout {
            grid-template-columns: 1fr;
          }

          .detail-media {
            position: static;
          }

          .main-image-wrapper {
            height: min(76vh, 760px);
          }

          .detail-content {
            max-width: 820px;
          }
        }

        @media (max-width: 720px) {
          .room-detail-page {
            padding-top: 112px;
          }

          .main-image-wrapper {
            height: 58svh;
            min-height: 380px;
          }

          .room-title {
            font-size: clamp(2.45rem, 13vw, 3.65rem);
          }

          .room-description {
            margin-top: 24px;
            line-height: 1.78;
          }

          .specs-row {
            grid-template-columns: 1fr;
            margin-top: 34px;
          }

          .spec-item,
          .spec-item:first-child,
          .spec-item:last-child {
            padding: 17px 0;
            border-right: 0;
            border-bottom: 1px solid var(--border);
          }

          .spec-item:last-child {
            border-bottom: 0;
          }

          .amenities-list {
            grid-template-columns: 1fr;
          }

          .booking-panel {
            margin-inline: -4px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .strip-item {
            transition: none;
          }

          .strip-item:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
