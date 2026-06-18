"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Info } from "lucide-react";
import Image from "next/image";

type Locale = "tr" | "en";

/**
 * Interactive 'Living Museum' Map
 * An elegant SVG-based exploration of the Konak's heritage points.
 */
const museumCopy = {
  tr: {
    title: "Miras Keşif Haritası",
    instruction: "Sinematik detaylar için noktaların üzerine gelin",
    fallbackAlt: "Miras keşif noktası",
    points: [
    { 
      id: 1, 
      x: 200, 
      y: 150, 
      title: "Taşın Hafızası: Horasan", 
      detail: "19. yüzyıl tescilli taş konağın Horasan harcı, taşların birbiriyle sessizce konuştuğu bir mirastır. Beş asırlık Kozbeyli köy dokusunun içinde çimento girmemiş bu duvarlar, konağın her mevsim nefes almasını sağlar.",
      image: "/images/odalar/standart-deniz-manzarali-oda/2.jpg"
    },
    { 
      id: 2, 
      x: 450, 
      y: 300, 
      title: "Zamanın Tortusu: Dibek", 
      detail: "180 yıllık taş dibek, Kozbeyli'nin en eski tanıklarından biridir. Hala her sabah, İnci Hanım'ın kahve öğütme ritüeliyle uyanır ve o tanıdık sesi avluda yankılatır.",
      image: "/images/odalar/standart-oda/2.jpg"
    },
    { 
      id: 3, 
      x: 300, 
      y: 450, 
      title: "Köyün Gizli Mahzeni", 
      detail: "Eski tüccarların zeytinyağı ve şarap küplerini sakladığı bu serin mahzen, dışarıdaki kavurucu sıcağa rağmen Kozbeyli'nin en serin ve en sessiz köşesidir.",
      image: "/images/odalar/standart-bahce-manzarali-oda/3.jpg"
    },
    { 
      id: 4, 
      x: 100, 
      y: 350, 
      title: "Sıvı Altın: Kozbeyli Zeytinyağı", 
      detail: "Konağımızın bahçesindeki asırlık ağaçlardan süzülen, markalaşmamış ama el değmemiş saflıktaki zeytinyağımız. Toprağın bu cömert hediyesi, soframızın baş tacıdır.",
      image: "/images/odalar/standart-bahce-manzarali-oda/4.jpg"
    }
    ],
  },
  en: {
    title: "Heritage Discovery Map",
    instruction: "Hover over the points for cinematic heritage details",
    fallbackAlt: "Heritage discovery point",
    points: [
      {
        id: 1,
        x: 200,
        y: 150,
        title: "Stone Memory: Horasan",
        detail:
          "The Horasan mortar that has held the mansion together for centuries lets the walls breathe through every season, preserving the building's historic texture without cement.",
        image: "/images/odalar/standart-deniz-manzarali-oda/2.jpg",
      },
      {
        id: 2,
        x: 450,
        y: 300,
        title: "The Stone Dibek",
        detail:
          "The 180-year-old stone dibek is one of Kozbeyli's oldest witnesses. Each morning, the coffee ritual brings its familiar sound back into the courtyard.",
        image: "/images/odalar/standart-oda/2.jpg",
      },
      {
        id: 3,
        x: 300,
        y: 450,
        title: "The Hidden Cellar",
        detail:
          "Once used by merchants for olive oil and wine jars, the cool cellar remains one of the mansion's quietest corners even on warm Aegean days.",
        image: "/images/odalar/standart-bahce-manzarali-oda/3.jpg",
      },
      {
        id: 4,
        x: 100,
        y: 350,
        title: "Liquid Gold: Kozbeyli Olive Oil",
        detail:
          "Oil from the century-old trees in the garden carries the generosity of the soil to the table in its purest form.",
        image: "/images/odalar/standart-bahce-manzarali-oda/4.jpg",
      },
    ],
  },
};

export const LivingMuseumMap = ({ locale = "tr" }: { locale?: Locale }) => {
  const [activePoint, setActivePoint] = useState<null | number>(null);
  const copy = museumCopy[locale];
  const active = copy.points.find((p) => p.id === activePoint);

  return (
    <div
      data-testid="living-museum-map"
      className="relative w-full aspect-video bg-zinc-950 rounded-3xl border border-zinc-900 overflow-hidden group"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 600 600" className="w-full h-full stroke-zinc-700 fill-none" strokeWidth="0.5">
          <path d="M50 50 L550 50 L550 550 L50 550 Z" />
          <path d="M250 50 L250 550 M50 300 L550 300" />
        </svg>
      </div>

      <div className="absolute top-8 left-8 z-10">
        <h3 className="text-ivory font-serif text-2xl">{copy.title}</h3>
        <p className="text-zinc-500 text-sm">{copy.instruction}</p>
      </div>

      <svg viewBox="0 0 600 600" className="w-full h-full relative z-10">
        {copy.points.map((point) => (
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
                src={active?.image || ""}
                alt={active?.title || copy.fallbackAlt}
                fill 
                className="object-cover"
             />
          </div>
          <div className="flex items-center gap-3 text-gold mb-2">
            <Info size={14} />
            <h4 className="font-serif text-sm italic tracking-wide">
              {active?.title}
            </h4>
          </div>
          <p className="text-ivory/70 text-xs leading-relaxed">
            {active?.detail}
          </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
};
