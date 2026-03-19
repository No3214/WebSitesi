"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components/section-title";
import { rooms as fallbackRooms, roomSummary } from "@/data/rooms";
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <div style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--soft)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--olive)', display: 'block' }}>{roomSummary.total}</span>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>Toplam Oda</span>
              </div>
              {roomSummary.types.map((t, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--soft)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--olive)', display: 'block' }}>{t.count}</span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>{t.type}</span>
                </div>
              ))}
            </div>
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
                      {room.price && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--olive)', fontFamily: 'var(--serif)' }}>₺{room.price.toLocaleString('tr-TR')}</span>
                          <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase' }}>/ gece · kahvaltı dahil</span>
                        </div>
                      )}
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
