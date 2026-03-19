"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components/section-title";
import { rooms as fallbackRooms } from "@/data/rooms";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import { SiteHeader } from "@/components/site-header";

export function RoomsClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    <div style={{ position: 'relative', height: '350px', overflow: 'hidden' }}>
                      <Image
                        src={room.images[0]}
                        alt={room.title}
                        fill
                        className="object-cover"
                        priority={index < 3}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <span style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', backdropFilter: 'blur(4px)' }}>
                        {room.size}
                      </span>
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
    </>
  );
}
