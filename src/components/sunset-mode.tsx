"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

type ManualSunsetMode = "day" | "sunset" | null;

export const SunsetMode = () => {
  const pathname = usePathname();
  const [autoIsSunset, setAutoIsSunset] = useState(false);
  const [manualMode, setManualMode] = useState<ManualSunsetMode>(null);
  const [mounted, setMounted] = useState(false);
  const isSunset = manualMode ? manualMode === "sunset" : autoIsSunset;
  const englishPath = pathname === "/en" || pathname?.startsWith("/en/");
  const labels = englishPath
    ? {
        group: "Appearance mode",
        day: "Switch to morning view",
        sunset: "Switch to evening view",
        dayTitle: "Morning view",
        sunsetTitle: "Evening view",
      }
    : {
        group: "Görünüm modu",
        day: "Sabah görünümünü aç",
        sunset: "Akşam görünümünü aç",
        dayTitle: "Sabah görünümü",
        sunsetTitle: "Akşam görünümü",
      };

  useEffect(() => {
    setMounted(true);

    // Gercek gun batimi saati (/api/local-pulse) gelmezse saat bazli fallback kullanilir.
    let sunTimes: { sunrise: number; sunset: number } | null = null;

    const checkTime = () => {
      if (sunTimes) {
        const now = Date.now();
        setAutoIsSunset(now >= sunTimes.sunset || now < sunTimes.sunrise);
      } else {
        const hour = new Date().getHours();
        // Fallback: 18:00 - 06:00
        setAutoIsSunset(hour >= 18 || hour < 6);
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

      <div className="fixed top-24 right-8 z-[100] hidden lg:block">
        <div
          className="sunset-mode-indicator"
          data-testid="sunset-mode-indicator"
          data-mode={isSunset ? "sunset" : "day"}
          aria-label={labels.group}
          lang={englishPath ? "en" : "tr"}
        >
          <button
            type="button"
            className={`sunset-mode-button transition-colors ${!isSunset ? "is-active is-day" : ""}`}
            data-testid="sunset-day-toggle"
            aria-label={labels.day}
            aria-pressed={!isSunset}
            onClick={() => setManualMode("day")}
            title={labels.dayTitle}
          >
            <Sun size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`sunset-mode-button transition-colors ${isSunset ? "is-active is-sunset" : ""}`}
            data-testid="sunset-night-toggle"
            aria-label={labels.sunset}
            aria-pressed={isSunset}
            onClick={() => setManualMode("sunset")}
            title={labels.sunsetTitle}
          >
            <Moon size={14} aria-hidden="true" />
          </button>
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
        .sunset-mode-button {
          display: grid;
          width: 1.8rem;
          height: 1.8rem;
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #4b5563;
          cursor: pointer;
        }
        .sunset-mode-button:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 3px;
        }
        .sunset-mode-button.is-day {
          background: var(--gold);
          color: #ffffff;
        }
        .sunset-mode-button.is-sunset {
          background: #fff5df;
          color: var(--gold);
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
