"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Info } from "lucide-react";
import Image from "next/image";

/**
 * Interactive 'Living Museum' Map
 * An elegant SVG-based exploration of the Konak's heritage points.
 */
export const LivingMuseumMap = () => {
  const [activePoint, setActivePoint] = useState<null | number>(null);

  const heritagePoints = [
    { 
      id: 1, 
      x: 200, 
      y: 150, 
      title: "Taşın Hafızası: Horasan", 
      detail: "500 yıldır bu konağı ayakta tutan Horasan harcı, taşların birbiriyle sessizce konuştuğu bir mirastır. Çimento girmemiş bu duvarlar, konağın her mevsim nefes almasını sağlar.",
      image: "https://images.unsplash.com/photo-1518173946687-a4c8a483592e?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 2, 
      x: 450, 
      y: 300, 
      title: "Zamanın Tortusu: Dibek", 
      detail: "180 yıllık taş dibek, Kozbeyli'nin en eski tanıklarından biridir. Hala her sabah, İnci Hanım'ın kahve öğütme ritüeliyle uyanır ve o tanıdık sesi avluda yankılatır.",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 3, 
      x: 300, 
      y: 450, 
      title: "Köyün Gizli Mahzeni", 
      detail: "Eski tüccarların zeytinyağı ve şarap küplerini sakladığı bu serin mahzen, dışarıdaki kavurucu sıcağa rağmen Kozbeyli'nin en serin ve en sessiz köşesidir.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 4, 
      x: 100, 
      y: 350, 
      title: "Sıvı Altın: Kozbeyli Zeytinyağı", 
      detail: "Konağımızın bahçesindeki asırlık ağaçlardan süzülen, markalaşmamış ama el değmemiş saflıktaki zeytinyağımız. Toprağın bu cömert hediyesi, soframızın baş tacıdır.",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbadb8c5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="relative w-full aspect-video bg-zinc-950 rounded-3xl border border-zinc-900 overflow-hidden group">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 600 600" className="w-full h-full stroke-zinc-700 fill-none" strokeWidth="0.5">
          <path d="M50 50 L550 50 L550 550 L50 550 Z" />
          <path d="M250 50 L250 550 M50 300 L550 300" />
        </svg>
      </div>

      <div className="absolute top-8 left-8 z-10">
        <h3 className="text-ivory font-serif text-2xl">Miras Keşif Haritası</h3>
        <p className="text-zinc-500 text-sm">Sinematik detaylar için noktaların üzerine gelin</p>
      </div>

      <svg viewBox="0 0 600 600" className="w-full h-full relative z-10">
        {heritagePoints.map((point) => (
          <g 
            key={point.id} 
            className="cursor-pointer"
            onMouseEnter={() => setActivePoint(point.id)}
            onMouseLeave={() => setActivePoint(null)}
          >
            <motion.circle 
              cx={point.x} 
              cy={point.y} 
              r="15" 
              fill="var(--gold)"
              className="opacity-20"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="6" 
              fill="var(--gold)"
              className="drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
            />
          </g>
        ))}
      </svg>

      <AnimatePresence>
        {activePoint && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="absolute top-8 right-8 w-80 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl z-20 shadow-2xl pointer-events-none"
          >
          <div className="relative h-40 w-full mb-4 rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
             <Image 
                src={heritagePoints.find(p => p.id === activePoint)?.image || ""} 
                alt="Discovery" 
                fill 
                className="object-cover"
             />
          </div>
          <div className="flex items-center gap-3 text-gold mb-2">
            <Info size={14} />
            <h4 className="font-serif text-sm italic tracking-wide">
              {heritagePoints.find(p => p.id === activePoint)?.title}
            </h4>
          </div>
          <p className="text-ivory/70 text-xs leading-relaxed">
            {heritagePoints.find(p => p.id === activePoint)?.detail}
          </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
};
