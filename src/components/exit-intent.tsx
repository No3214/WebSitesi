"use client";

import { useEffect, useState } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";
import { publicEnv } from "@/lib/public-env";

const COPY = {
  tr: {
    dialogLabel: "Direkt rezervasyon teklifi",
    closeLabel: "Rezervasyon teklifini kapat",
    panelTitle: "Direkt Rezervasyon",
    panelSubtitle: "Web Sitemize Özel Ayrıcalıklar",
    title: "Gitmeden Önce Keşfedin!",
    bodyPrefix: "Kozbeyli Konağı web sitemiz üzerinden resmi HMS rezervasyon ekranına geçebilir,",
    bodyStrong: "WhatsApp destek",
    bodySuffix: "ile oda ve tarih seçeneklerini netleştirebilirsiniz.",
    badge: "DİREKT REZERVASYON AYRICALIĞI",
    badgeValue: "Resmi Direkt Rezervasyon",
    cta: "REZERVASYON YAP",
  },
  en: {
    dialogLabel: "Direct booking offer",
    closeLabel: "Close booking offer",
    panelTitle: "Direct Booking",
    panelSubtitle: "Website Guest Support",
    title: "Before You Leave",
    bodyPrefix: "Open the official HMS reservation screen from our website and use personal",
    bodyStrong: "WhatsApp support",
    bodySuffix: "to confirm room and date options.",
    badge: "DIRECT BOOKING SUPPORT",
    badgeValue: "Official Direct Reservation",
    cta: "BOOK NOW",
  },
} as const;

export const ExitIntent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const pathname = usePathname();

  const locale = pathname?.startsWith("/en") ? "en" : "tr";
  const copy = COPY[locale];
  const target = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL);

  useEffect(() => {
    if (hasShown) return;

    // Frequency cap: show at most once per browser session
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem("exitIntentShown") === "1";
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) — fall back to in-memory flag
    }
    if (alreadyShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves the top of the viewport (intent to close/change tab)
      if (e.clientY <= 0) {
        setIsVisible(true);
        setHasShown(true);
        try {
          sessionStorage.setItem("exitIntentShown", "1");
        } catch {
          // ignore storage errors
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[rgba(61,74,59,0.38)] backdrop-blur-sm exit-intent-backdrop">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl exit-intent-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={copy.dialogLabel}
      >
        <button
          onClick={() => setIsVisible(false)}
          aria-label={copy.closeLabel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X size={20} className="text-zinc-400" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 exit-intent-offer-panel p-8 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
              <Gift className="text-gold w-8 h-8" />
            </div>
            <h3 className="serif text-2xl mb-2">{copy.panelTitle}</h3>
            <p className="text-xs text-[var(--muted)]">{copy.panelSubtitle}</p>
          </div>

          <div className="md:w-3/5 p-8">
            <h2 className="serif text-2xl text-zinc-900 mb-4">{copy.title}</h2>
            <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
              {copy.bodyPrefix} <strong>{copy.bodyStrong}</strong> {copy.bodySuffix}
            </p>

            <div className="bg-zinc-50 border border-gold/20 rounded-lg p-4 mb-6 text-center">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">{copy.badge}</span>
              <span className="text-xl font-bold text-gold tracking-widest">{copy.badgeValue}</span>
            </div>

            <a
              href={target}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium-solid w-full flex items-center justify-center gap-2 group"
            >
              {copy.cta}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .exit-intent-backdrop {
          animation: exitIntentBackdropIn 180ms ease-out both;
        }
        .exit-intent-dialog {
          animation: exitIntentDialogIn 220ms ease-out both;
        }
        .btn-premium-solid {
          background: var(--olive, #3d4a3b);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        .btn-premium-solid:hover {
          background: var(--gold, #b3925c);
          transform: translateY(-2px);
        }
        .exit-intent-offer-panel {
          background:
            radial-gradient(260px 180px at 80% 0%, rgba(179, 146, 92, 0.18), transparent 62%),
            linear-gradient(180deg, #fbf7ed 0%, #f2ecdf 100%);
          color: var(--olive, #3d4a3b);
          border-right: 1px solid rgba(61, 74, 59, 0.1);
        }
        .text-gold {
          color: var(--gold, #b3925c);
        }
        .bg-gold\/20 {
          background-color: rgba(179, 146, 92, 0.2);
        }
        .border-gold\/20 {
          border-color: rgba(179, 146, 92, 0.2);
        }
        @keyframes exitIntentBackdropIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes exitIntentDialogIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
