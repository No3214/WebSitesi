"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CalendarClock, MessageCircle } from "lucide-react";

import { SectionTitle } from "@/components/section-title";
import { HMSBookingEmbed } from "@/components/hms-booking-embed";
import { WeatherRibbon } from "@/components/weather-ribbon";
import { getDictionary } from "@/lib/dictionary";

// Keys not present in the dictionary Reservation section — component-level fallback.
const FALLBACK = {
  tr: {
    exploreRooms: "Odaları İncele",
    guestGuide: "Misafir Rehberi",
    contact: "İletişim",
  },
  en: {
    exploreRooms: "Explore Rooms",
    guestGuide: "Guest Guide",
    contact: "Contact",
  },
};

export function ReservationClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(null);
  const [locale, setLocale] = useState<'tr' | 'en'>('tr');

  useEffect(() => {
    const currentLocale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    setLocale(currentLocale as 'tr' | 'en');
    getDictionary(currentLocale as 'tr' | 'en').then(setDict);
  }, []);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Reservation;
  const f = FALLBACK[locale];

  const trustItems = [
    {
      icon: BadgeCheck,
      title: t.bestPrice,
      text: t.bestPriceText,
    },
    {
      icon: CalendarClock,
      title: t.flexibleCancel,
      text: t.flexibleCancelText,
    },
    {
      icon: MessageCircle,
      title: t.whatsapp,
      text: t.whatsappText,
    },
  ];

  return (
    <div className="container" style={{ maxWidth: 980 }}>
      <SectionTitle eyebrow={t.eyebrow} title={t.title} text={t.text} />

      <WeatherRibbon />

      <HMSBookingEmbed />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
          marginTop: 34,
        }}
      >
        {trustItems.map((item) => (
          <div key={item.title} className="detail-box" style={{ padding: 22 }}>
            <item.icon size={22} aria-hidden style={{ marginBottom: 10 }} />
            <h3 className="serif" style={{ fontSize: "1.05rem", marginBottom: 8 }}>
              {item.title}
            </h3>
            <p className="muted" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
        <Link href="/odalar" className="button secondary">
          {f.exploreRooms}
        </Link>
        <Link href="/misafir-rehberi" className="button secondary">
          {f.guestGuide}
        </Link>
        <Link href="/iletisim" className="button secondary">
          {f.contact}
        </Link>
      </div>
    </div>
  );
}
