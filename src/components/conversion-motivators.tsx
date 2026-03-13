"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Eye, TrendingUp } from "lucide-react";

/**
 * Exely-inspired Conversion Motivators
 * Purpose: Provide social proof and scarcity indicators to boost direct bookings.
 */

const Gift = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>
);

export function ConversionMotivators() {
  const [activeMotivator, setActiveMotivator] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  const motivators = [
    {
      icon: <Eye className="w-4 h-4 text-emerald-400" />,
      text: "Şu an 12 kişi bu odayı inceliyor",
    },
    {
      icon: <Users className="w-4 h-4 text-blue-400" />,
      text: "Son 24 saatte 5 rezervasyon yapıldı",
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-orange-400" />,
      text: "Bu tarihlerde yoğun talep var (%92 dolu)",
    },
    {
      icon: <Gift className="w-4 h-4 text-gold" />,
      text: "Direkt rezervasyonda Hoşgeldin İçeceği ücretsiz!",
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      text: "En İyi Fiyat Garantisi: Web sitemize özel %10 indirim",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 5000);
    const interval = setInterval(() => {
      setActiveMotivator((prev) => (prev + 1) % motivators.length);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [motivators.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-6 z-40 hidden md:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMotivator}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-800/50 p-3 rounded-xl shadow-2xl"
        >
          <div className="p-1.5 bg-zinc-800 rounded-lg shadow-inner">
            {motivators[activeMotivator].icon}
          </div>
          <span className="text-sm font-medium text-zinc-200 tracking-tight">
            {motivators[activeMotivator].text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
