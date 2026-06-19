"use client";

import Image from "next/image";
import Link from "next/link";

import { FadeIn, StaggerContainer } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { rooms } from "@/data/rooms";
import { localizeRooms } from "@/data/rooms-i18n";

type Props = { locale: "tr" | "en"; eyebrow: string };

export function RoomsShowcase({ locale, eyebrow }: Props) {
  const localePrefix = locale === "en" ? "/en" : "";
  const displayedRooms = localizeRooms(rooms, locale).slice(0, 6);

  return (
    <section className="section" id="konaklama" style={{ paddingTop: 0 }}>
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={eyebrow}
            title={locale === "tr" ? "Sükunet ve Konfor" : "Serenity & Comfort"}
            text={
              locale === "tr"
                ? "Her detayı özenle tasarlanmış, ruhu olan odalarımızda tarihin dokusunu hissedin."
                : "Feel the texture of history in rooms shaped for a calm, considered stay."
            }
          />
        </FadeIn>
        <StaggerContainer delay={0.15}>
          <div className="card-grid">
            {displayedRooms.map((room) => (
              <FadeIn key={room.slug}>
                <Link href={`${localePrefix}/odalar/${room.slug}`} className="card">
                  <div className="card-media">
                    <Image
                      src={room.images[0]}
                      alt={room.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="card-body">
                    <span className="meta">
                      {room.capacity} · {room.view}
                    </span>
                    <h3>{room.title}</h3>
                    <p>{room.short}</p>
                    <span className="card-link">
                      {locale === "tr" ? "Odayı İncele" : "View Room"}
                      <span className="arrow" aria-hidden>
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </StaggerContainer>
        <FadeIn delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Link href={`${localePrefix}/odalar`} className="button secondary">
              {locale === "tr" ? "Tüm Odaları Gör" : "View All Rooms"}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
