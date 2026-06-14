"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MapPin, Calendar } from "lucide-react";
import { getPhoneHref, MAPS_URL } from "@/lib/contact";

export const MobileActionBar = () => {
  const pathname = usePathname();
  const englishPath = pathname === "/en" || pathname?.startsWith("/en/");
  const labels = englishPath
    ? {
        phone: "Call",
        map: "Location",
        booking: "Booking",
        phoneAria: "Call by phone",
        mapAria: "View on map",
        bookingHref: "/en/rezervasyon",
      }
    : {
        phone: "ARA",
        map: "KONUM",
        booking: "REZERVASYON",
        phoneAria: "Telefonla ara",
        mapAria: "Haritada görüntüle",
        bookingHref: "/rezervasyon",
      };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[90] md:hidden"
      data-testid="mobile-action-bar"
      lang={englishPath ? "en" : "tr"}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="bg-white/85 backdrop-blur-xl border-t border-zinc-200 px-6 py-3 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
        <a href={getPhoneHref()} className="flex flex-col items-center gap-1 group" aria-label={labels.phoneAria}>
          <div className="p-2 rounded-full group-active:bg-zinc-100 transition-colors">
            <Phone size={20} className="text-zinc-600" />
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{labels.phone}</span>
        </a>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group"
          aria-label={labels.mapAria}
        >
          <div className="p-2 rounded-full group-active:bg-zinc-100 transition-colors">
            <MapPin size={20} className="text-zinc-600" />
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{labels.map}</span>
        </a>

        <Link
          href={labels.bookingHref}
          className="bg-gold text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-gold/20 active:scale-95 transition-transform"
        >
          <Calendar size={18} />
          <span className="text-xs font-bold uppercase tracking-wide">{labels.booking}</span>
        </Link>
      </div>
    </div>
  );
};
