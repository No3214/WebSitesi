"use client";

import { useEffect, useState } from "react";
import { X, Gift, ArrowRight } from "lucide-react";

import { publicEnv } from "@/lib/public-env";

export const ExitIntent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const target = publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL || "/rezervasyon";

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm exit-intent-backdrop">
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl exit-intent-dialog">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X size={20} className="text-zinc-400" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 bg-zinc-900 p-8 flex flex-col justify-center items-center text-center text-white">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
              <Gift className="text-gold w-8 h-8" />
            </div>
            <h3 className="serif text-2xl mb-2">Direkt Rezervasyon</h3>
            <p className="text-xs text-zinc-400">Web Sitemize Özel Ayrıcalıklar</p>
          </div>

          <div className="md:w-3/5 p-8">
            <h2 className="serif text-2xl text-zinc-900 mb-4">Gitmeden Önce Keşfedin!</h2>
            <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
              Kozbeyli Konağı web sitemiz üzerinden yapacağınız direkt rezervasyonlarda
              <strong> En İyi Fiyat Garantisi</strong> ve kişisel <strong>WhatsApp destek</strong> hizmeti sizi bekliyor.
            </p>

            <div className="bg-zinc-50 border border-gold/20 rounded-lg p-4 mb-6 text-center">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">DİREKT REZERVASYON AYRICALIĞI</span>
              <span className="text-xl font-bold text-gold tracking-widest">En İyi Fiyat Garantisi</span>
            </div>

            <a
              href={target}
              className="btn-premium-solid w-full flex items-center justify-center gap-2 group"
            >
              REZERVASYON YAP
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
          background: #18181b;
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
