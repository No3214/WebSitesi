"use client";

import React from "react";
import Link from "next/link";
import { Phone, MapPin, Calendar } from "lucide-react";

export const MobileActionBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] md:hidden">
      <div className="bg-white/80 backdrop-blur-xl border-t border-zinc-200 px-6 py-3 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        
        <a href="tel:+902326761010" className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-full group-active:bg-zinc-100 transition-colors">
            <Phone size={20} className="text-zinc-600" />
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">ARA</span>
        </a>

        <a 
          href="https://maps.app.goo.gl/..." // Note: Add actual Google Maps link
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-2 rounded-full group-active:bg-zinc-100 transition-colors">
            <MapPin size={20} className="text-zinc-600" />
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">KONUM</span>
        </a>

        <Link 
          href="/#rezervasyon" 
          className="bg-gold text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-gold/20 active:scale-95 transition-transform"
        >
          <Calendar size={18} />
          <span className="text-xs font-bold uppercase tracking-wide">REZERVASYON</span>
        </Link>

      </div>

      <style jsx>{`
        .bg-gold { background-color: #c5a059; }
        .shadow-gold\/20 { box-shadow: 0 10px 15px -3px rgba(197, 160, 89, 0.2); }
      `}</style>
    </div>
  );
};
