"use client";

import Link from "next/link";
import Image from "next/image";

import { FadeIn, StaggerContainer } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { getLocalizedRooms } from "@/data/rooms";

type Props = { locale: "tr" | "en"; eyebrow: string };

export function RoomsShowcase({ locale, eyebrow }: Props) {
  const localizedRooms = getLocalizedRooms(locale);

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
        <StaggerContainer delay={0.15}>
          <div className="card-grid">
            {localizedRooms.slice(0, 6).map((room) => (
              <FadeIn key={room.slug}>
                <Link href={`${locale === "en" ? "/en" : ""}/odalar/${room.slug}`} className="card">
                  <div className="card-media">
                    <Image
                      src={room.images[0]}
                      alt={room.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      unoptimized
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
                      <span className="arrow" aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </StaggerContainer>
        <FadeIn delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Link href={locale === "en" ? "/en/odalar" : "/odalar"} className="button secondary">
              {locale === "tr" ? "Tüm Odaları Gör" : "View All Rooms"}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
