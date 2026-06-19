"use client";

import Image from "next/image";
import Link from "next/link";
import { rooms as fallbackRooms } from "@/data/rooms";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";
import { publicEnv } from "@/lib/public-env";

type RoomsClientProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialDict?: any;
  initialLocale?: "tr" | "en";
};

export function RoomsClient({ initialDict, initialLocale = "tr" }: RoomsClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(initialDict ?? null);
  const [locale, setLocale] = useState<"tr" | "en">(initialLocale);
  const pathname = usePathname();

  useEffect(() => {
    const current = pathname === "/en" || Boolean(pathname?.startsWith("/en/")) ? "en" : "tr";
    setLocale(current);
    if (current === initialLocale && initialDict) return;
    getDictionary(current).then(setDict);
  }, [initialDict, initialLocale, pathname]);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Rooms;
  const bookingHref = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL);

  return (
    <>
      <SiteHeader variant="solid" />
      <PageHero eyebrow={t.eyebrow} title={t.title} text={t.text} tone="light" />

      <main className="section rooms-catalog-section" id="icerik-odalar">
        <div className="container">
          <StaggerContainer delay={0.1}>
            <div className="card-grid">
              {fallbackRooms.map((room, index) => (
                <FadeIn key={room.slug}>
                  <Link href={`${locale === "en" ? "/en" : ""}/odalar/${room.slug}`} className="card room-card">
                    <div className="card-media">
                      <Image
                        src={room.images[0]}
                        alt={room.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        priority={index < 3}
                      />
                    </div>
                    <div className="card-body">
                      <span className="meta">
                        {room.size} · {room.capacity} · {room.view}
                      </span>
                      <h3>{room.title}</h3>
                      <p>{room.short}</p>
                      <span className="card-link">
                        {t.detail}
                        <span className="arrow" aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </StaggerContainer>

          <FadeIn delay={0.15}>
            <div style={{ textAlign: "center", marginTop: 64 }}>
              <p style={{ color: "var(--muted)", marginBottom: 20 }}>
                {locale === "tr"
                  ? "Hangi odanın size uygun olduğundan emin değil misiniz? Misafir ilişkileri ekibimiz yardımcı olsun."
                  : "Not sure which room suits you best? Let our guest relations team help."}
              </p>
              <a
                href={bookingHref}
                className="button gold"
                target="_blank"
                rel="noopener noreferrer"
                data-event="booking_engine_open"
              >
                {locale === "tr" ? "Müsaitlik Sorgula" : "Check Availability"}
              </a>
            </div>
          </FadeIn>
        </div>
      </main>
    </>
  );
}
