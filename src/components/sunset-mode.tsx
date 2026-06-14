"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export const SunsetMode = () => {
  const [isSunset, setIsSunset] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Gerçek gün batımı saati (sunrise-sunset.org → /api/local-pulse, ücretsiz)
    let sunTimes: { sunrise: number; sunset: number } | null = null;

    const checkTime = () => {
      if (sunTimes) {
        const now = Date.now();
        setIsSunset(now >= sunTimes.sunset || now < sunTimes.sunrise);
      } else {
        const hour = new Date().getHours();
        // Fallback: 18:00 - 06:00
        setIsSunset(hour >= 18 || hour < 6);
      }
    };

    fetch("/api/local-pulse")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.sun?.sunset && data?.sun?.sunrise) {
          sunTimes = {
            sunrise: new Date(data.sun.sunrise).getTime(),
            sunset: new Date(data.sun.sunset).getTime(),
          };
          checkTime();
        }
      })
      .catch(() => {});

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {isSunset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[0] bg-[#1a0f00]/5"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      
      {/* Visual Indicator/Toggle in Corner (Optional Premium Touch) */}
      <div className="fixed top-24 right-8 z-[100] hidden lg:block">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-2xl flex items-center gap-2">
           <div className={`p-1.5 rounded-full transition-colors ${!isSunset ? "bg-gold text-white" : "text-zinc-400"}`}>
             <Sun size={14} />
           </div>
           <div className={`p-1.5 rounded-full transition-colors ${isSunset ? "bg-[#1a0f00] text-gold" : "text-zinc-600"}`}>
             <Moon size={14} />
           </div>
        </div>
      </div>

      <style jsx global>{`
        ${isSunset ? `
          :root {
            --soft: #1a1a1a;
            --white: #121212;
            --ivory: #c5a059;
            --text: #e5e5e5;
            --border: rgba(255,255,255,0.1);
            /* a11y (T18): gece paletinde metin degiskenleri de acilmali —
               koyu kartta koyu olive/muted 4.5:1 altinda kaliyordu */
            --olive: #cfd8cc;
            --olive-deep: #e3e8e0;
            --gold: #c7a15f;
            --gold-text: #d8b66f;
            --muted: #b3afa6;
            --stone-warm: #242424;
          }
          .cookie-content p { color: #cfcdc8 !important; }
          body {
            background-color: #121212;
            color: #e5e5e5;
          }
          .card, .section-alt, .feature-box {
            background-color: #1a1a1a !important;
            border-color: rgba(255,255,255,0.05) !important;
          }
          .card .card-body h3,
          .card .card-link {
            color: #f4efe6 !important;
          }
          .card .card-body p {
            color: #d7d1c7 !important;
          }
          .card .card-body .meta {
            color: #e0bf7a !important;
          }
          .header {
            background: rgba(18, 18, 18, 0.9) !important;
            border-bottom-color: rgba(255,255,255,0.05) !important;
          }
          .nav-link { color: #e5e5e5 !important; }
        ` : ""}
      `}</style>
    </>
  );
};
