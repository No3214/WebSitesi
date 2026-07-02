"use client";

import Link from "next/link";
import Image from "next/image";

import { FadeIn, StaggerContainer } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { getShowcaseRooms } from "@/data/rooms";

type Props = { locale: "tr" | "en"; eyebrow: string };

export function RoomsShowcase({ locale, eyebrow }: Props) {
  const showcaseRooms = getShowcaseRooms(locale);

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
                : "Feel the texture of history in our soulfully designed rooms."
            }
          />
        </FadeIn>
        <StaggerContainer className="room-mosaic" delay={0.12} stagger={0.08}>
          {showcaseRooms.map((room, index) => (
            <Link
              key={room.slug}
              href={`${locale === "en" ? "/en/rooms" : "/odalar"}/${room.slug}`}
              className={`room-mosaic-card${index === 0 ? " room-mosaic-featured" : ""}${index === 3 ? " room-mosaic-wide" : ""}`}
            >
              <div className="room-mosaic-media">
                <Image
                  src={room.images[0]}
                  alt={room.title}
                  fill
                  sizes={
                    index === 0
                      ? "(max-width: 760px) 100vw, 56vw"
                      : "(max-width: 760px) 100vw, (max-width: 1180px) 44vw, 22vw"
                  }
                  className="object-cover"
                  priority={index === 0}
                  unoptimized
                />
              </div>
              <div className="room-mosaic-copy">
                <span className="room-mosaic-meta">
                  {room.size} · {room.capacity} · {room.view}
                </span>
                <h3>{room.title}</h3>
                <p>{room.short}</p>
                <span className="card-link">
                  {locale === "tr" ? "Odayı İncele" : "View Room"}
                  <span className="arrow" aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </StaggerContainer>
        <FadeIn delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Link href={locale === "en" ? "/en/rooms" : "/odalar"} className="button secondary">
              {locale === "tr" ? "Tüm Odaları Gör" : "View All Rooms"}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
