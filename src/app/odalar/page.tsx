"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { rooms as fallbackRooms } from "@/data/rooms";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";

export default function RoomsPage() {
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    const locale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    getDictionary(locale).then(setDict);
  }, []);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Rooms;

  return (
    <>
      <SiteHeader />
      <main className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <FadeIn>
            <SectionTitle
              eyebrow={t.eyebrow}
              title={t.title}
              text={t.text}
            />
          </FadeIn>

          <StaggerContainer delay={0.2}>
            <div className="card-grid">
              {fallbackRooms.map((room, index) => (
                <FadeIn key={room.slug}>
                  <Link href={`/odalar/${room.slug}`} className="card">
                    <div style={{ position: 'relative', height: '350px' }}>
                      <Image 
                        src={room.images[0]} 
                        alt={room.title} 
                        fill 
                        className="object-cover"
                        priority={index < 3}
                      />
                    </div>
                    <div className="card-body">
                      <span className="meta">{room.capacity} · {room.view}</span>
                      <h3>{room.title}</h3>
                      <p>{room.short}</p>
                      <span className="button secondary" style={{ width: '100%', padding: '10px' }}>{t.detail}</span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
