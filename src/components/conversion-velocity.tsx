"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Eye, MapPin } from "lucide-react";

const events = [
  { id: 1, message: "Şu anda 3 misafir Odalar sayfamızı inceliyor.", icon: Users },
  { id: 2, message: "Bir misafir Taş Oda için rezervasyon adımlarında.", icon: Eye },
  { id: 3, message: "İzmir'den bir ziyaretçi Dibek Kahvesi ritüelini keşfetti.", icon: MapPin },
  { id: 4, message: "Son 24 saatte 12 doğrudan rezervasyon sorgusu alındı.", icon: Users }
];

/**
 * Conversion Velocity Engine (Live Status Toasts)
 * Low-friction social proof to drive booking intent.
 */
export const ConversionVelocity = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
      setIndex((prev) => (prev + 1) % events.length);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const Event = events[index];

  return (
    <div className="fixed bottom-24 left-6 z-[60] pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-zinc-200 p-3 pr-5 rounded-xl shadow-2xl shadow-black/5"
          >
            <div className="bg-gold/10 p-2 rounded-lg">
              <Event.icon size={16} className="text-gold" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Canlı Akış</span>
              <p className="text-xs text-zinc-800 font-medium leading-tight max-w-[180px]">
                {Event.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
