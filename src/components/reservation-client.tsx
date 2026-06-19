"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, CalendarClock, MessageCircle } from "lucide-react";

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

type ReservationClientProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialDict?: any;
  initialLocale?: "tr" | "en";
  roomSlug?: string;
  roomTitle?: string;
};

export function ReservationClient({
  initialDict,
  initialLocale = "tr",
  roomSlug,
  roomTitle,
}: ReservationClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(initialDict ?? null);
  const [locale, setLocale] = useState<"tr" | "en">(initialLocale);
  const pathname = usePathname();

  useEffect(() => {
    const currentLocale = pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "tr";
    if (currentLocale === initialLocale && initialDict) {
      setLocale(currentLocale);
      setDict(initialDict);
      return;
    }

    setLocale(currentLocale);
    getDictionary(currentLocale).then(setDict);
  }, [initialDict, initialLocale, pathname]);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Reservation;
  const f = FALLBACK[locale];
  const localePrefix = locale === "en" ? "/en" : "";
  const selectedLabel = locale === "tr" ? "Seçiminiz:" : "Your choice:";
  const supportLinks = [
    { href: `${localePrefix}/odalar`, label: f.exploreRooms },
    { href: `${localePrefix}/misafir-rehberi`, label: f.guestGuide },
    { href: `${localePrefix}/iletisim`, label: f.contact },
  ];

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
      {roomTitle ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            marginBottom: 20,
            background: "var(--white)",
            border: "1px solid var(--gold)",
            borderRadius: 40,
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <BadgeCheck size={16} aria-hidden style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: "0.9rem", color: "var(--text)" }}>
            {selectedLabel} <strong>{roomTitle}</strong>
          </span>
        </div>
      ) : null}

      <WeatherRibbon locale={locale} />

      <HMSBookingEmbed locale={locale} roomSlug={roomSlug} roomLabel={roomTitle} />

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
            <item.icon size={22} aria-hidden style={{ marginBottom: 10, color: "var(--gold)" }} />
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
        {supportLinks.map((link) => (
          <Link key={link.href} href={link.href} className="button secondary">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
