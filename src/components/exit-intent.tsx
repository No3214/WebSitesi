"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight } from "lucide-react";

export const ExitIntent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves the top of the viewport (intent to close/change tab)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
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
              <h3 className="serif text-2xl mb-2">Özel Teklif</h3>
              <p className="text-xs text-zinc-400">Sadece Direkt Rezervasyonlarda</p>
            </div>

            <div className="md:w-3/5 p-8">
              <h2 className="serif text-2xl text-zinc-900 mb-4">Gitmeden Önce Keşfedin!</h2>
              <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
                Kozbeyli Konağı web sitemiz üzerinden yapacağınız direkt rezervasyonlarda 
                <strong> %10 İndirim</strong> ve <strong>Hoşgeldin Kokteyli</strong> sizi bekliyor.
              </p>
              
              <div className="bg-zinc-50 border border-gold/20 rounded-lg p-4 mb-6 text-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">PROMO KODU</span>
                <span className="text-xl font-bold text-gold tracking-widest">DIREKT10</span>
              </div>

              <a 
                href="https://kozbeyli-konagi-1.hotelrunner.com/bv3/search"
                className="btn-premium-solid w-full flex items-center justify-center gap-2 group"
              >
                HEMEN KULLAN
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
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
          background: #c5a059;
          transform: translateY(-2px);
        }
        .text-gold {
          color: #c5a059;
        }
        .bg-gold\/20 {
          background-color: rgba(197, 160, 89, 0.2);
        }
        .border-gold\/20 {
          border-color: rgba(197, 160, 89, 0.2);
        }
      `}</style>
    </AnimatePresence>
  );
};
