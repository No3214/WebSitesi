"use client";

import { SectionTitle } from "@/components/section-title";
import { rooms as allRooms, roomSummary, localizeRoom } from "@/data/rooms";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { useDictionary } from "@/hooks/use-dictionary";
import { SiteHeader } from "@/components/site-header";
import { RoomCard } from "@/components/room-card";

const summaryLabel = { tr: "Toplam Oda", en: "Total Rooms" } as const;

export function RoomsClient() {
  const { dict, locale } = useDictionary();

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
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>{summaryLabel[locale]}</span>
              </div>
              {roomSummary.types.map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--soft)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--olive)', display: 'block' }}>{item.count}</span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>{locale === "en" ? item.typeEn : item.type}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <StaggerContainer delay={0.2}>
            <div className="card-grid">
              {allRooms.map((room, index) => {
                const r = localizeRoom(room, locale);
                return (
                  <FadeIn key={room.slug}>
                    <RoomCard
                      slug={room.slug}
                      title={r.title}
                      short={r.short}
                      capacity={r.capacity}
                      view={r.view}
                      size={room.size}
                      image={room.images[0]}
                      price={room.price}
                      locale={locale}
                      detailLabel={t.detail}
                      priority={index < 3}
                    />
                  </FadeIn>
                );
              })}
            </div>
          </StaggerContainer>
        </div>
      </main>
    </>
  );
}
