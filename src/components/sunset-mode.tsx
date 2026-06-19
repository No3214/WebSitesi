"use client";

import { useEffect, useState } from "react";
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
      {isSunset ? (
        <div className="sunset-mode-overlay fixed inset-0 pointer-events-none z-[0]" aria-hidden="true" />
      ) : null}
      
      {/* Visual Indicator/Toggle in Corner (Optional Premium Touch) */}
      <div className="fixed top-24 right-8 z-[100] hidden lg:block" aria-hidden="true">
        <div className="sunset-mode-indicator">
           <div className={`p-1.5 rounded-full transition-colors ${!isSunset ? "bg-gold text-white" : "text-stone-500"}`}>
             <Sun size={14} />
           </div>
           <div className={`p-1.5 rounded-full transition-colors ${isSunset ? "bg-[#fff5df] text-gold" : "text-stone-700"}`}>
             <Moon size={14} />
           </div>
        </div>
      </div>

      <style jsx global>{`
        .sunset-mode-overlay {
          background:
            linear-gradient(180deg, rgba(209, 154, 85, 0.035), rgba(255, 246, 225, 0.055));
          animation: sunsetOverlayIn 260ms ease-out both;
        }
        .sunset-mode-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 999px;
          border: 1px solid rgba(61, 74, 59, 0.12);
          background: rgba(255, 252, 246, 0.72);
          padding: 0.5rem;
          box-shadow: 0 18px 46px rgba(61, 48, 31, 0.12);
          backdrop-filter: blur(14px) saturate(1.25);
          -webkit-backdrop-filter: blur(14px) saturate(1.25);
        }
        @keyframes sunsetOverlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        ${isSunset ? `
          :root {
            --soft: #efe7d9;
            --white: #fffaf2;
            --ivory: #fbf6eb;
            --text: #211d18;
            --border: rgba(82, 68, 48, 0.14);
            --olive: #354632;
            --olive-deep: #263322;
            --gold: #8f611e;
            --gold-text: #6d4611;
            --muted: #5d554b;
            --stone-warm: #e8ddca;
          }
          .cookie-content p { color: #5d554b !important; }
          body {
            background-color: #fbf6eb;
            color: #211d18;
          }
        ` : ""}
      `}</style>
    </>
  );
};
