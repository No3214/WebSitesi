"use client";

import { motion } from "framer-motion";
import { ReputationData } from "@/lib/ai/reputation-intelligence";
import { ExternalLink, Star } from "lucide-react";

/**
 * Reputation Ribbon (Social Proof UI)
 * Similar to Exely/Revinate widgets but lightweight and SEO-integrated.
 */
export const ReputationRibbon = () => {
  return (
    <div className="w-full bg-[#fbf7ed]/95 backdrop-blur-xl border-y border-[rgba(61,74,59,0.12)] py-4 overflow-hidden shadow-[0_10px_34px_rgba(68,53,31,0.08)]">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-4">
            <div className="serif text-2xl text-gold font-bold">{ReputationData.overall.score}</div>
            <div className="flex flex-col">
              <span className="text-[var(--olive)] text-[10px] uppercase font-bold tracking-tighter">Genel Puan</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={8} className="fill-gold text-gold" />
                ))}
              </div>
            </div>
          </div>

          {ReputationData.platforms.map((plat, i) => (
            <motion.a
              key={i}
              href={plat.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              className="flex items-center gap-3 group"
            >
              <div className="h-8 w-[1px] bg-[rgba(61,74,59,0.16)]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest group-hover:text-gold transition-colors">
                    {plat.name}
                  </span>
                  <ExternalLink size={8} className="text-[var(--gold-text)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[var(--olive)] font-serif text-sm">
                  {plat.score} <span className="text-[var(--muted)] text-xs">/ {plat.maxScore}</span>
                </div>
              </div>
            </motion.a>
          ))}
          
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-8 w-[1px] bg-[rgba(61,74,59,0.16)]" />
            <div className="text-[var(--muted)] text-[10px] uppercase tracking-widest max-w-[150px] leading-tight italic">
              &quot;Kültürel Miras ve Gastronominin En Yüksek Puanlı Adresi&quot;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
