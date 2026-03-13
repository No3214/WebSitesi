"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Atmospheric Immersion Component
 * Handles the "Midnight Luxury" rituals and cinematic sense of place.
 * Includes 'Liquid Gold' (Olive Oil) and 'Mansion Rhythms'.
 */
export const AtmosphericImmersion = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [activeRitual, setActiveRitual] = useState<"morning" | "evening" | "ritual" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const triggerRitual = useCallback((type: "morning" | "evening" | "ritual") => {
    if (activeRitual === type || isTransitioning) return;
    
    setIsTransitioning(true);
    // Chaos Guard: Force a minimum 2s separation between rituals
    setActiveRitual(type);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000);
  }, [activeRitual, isTransitioning]);

  useEffect(() => {
    // Initial ritual based on time
    const hour = new Date().getHours();
    setActiveRitual(hour >= 6 && hour < 18 ? "morning" : "evening");

    // Scroll-based ritual trigger (Chaos Guarded)
    const handleScroll = () => {
      if (isTransitioning) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      
      if (scrollPercent > 0.4 && scrollPercent < 0.6) {
        triggerRitual("ritual");
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransitioning, triggerRitual]);

  const rituals = {
    morning: {
      title: "Kozbeyli Sabahı",
      description: "Köyün uyanışı, taze kuş sesleri ve taş duvarlara düşen ilk güneş ışığı.",
      sound: "https://assets.mixkit.co/sfx/preview/mixkit-forest-bird-chirping-with-wind-1216.mp3",
      video: "https://images.unsplash.com/photo-1518173946687-a4c8a483592e?auto=format&fit=crop&w=1920&q=80"
    },
    evening: {
      title: "Konakta Akşam",
      description: "Avluda yanan ateş, gaz lambasının sıcaklığı ve 500 yıllık sessizliğin huzuru.",
      sound: "https://assets.mixkit.co/sfx/preview/mixkit-crackling-fireplace-754.mp3",
      video: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
    },
    ritual: {
      title: "Sıvı Altın Ritüeli",
      description: "Bahçemizden süzülen el değmemiş zeytinyağının, taş kaselere dökülen o yoğun dokusu.",
      sound: "https://assets.mixkit.co/sfx/preview/mixkit-water-pour-into-glass-3037.mp3",
      video: "https://images.unsplash.com/photo-1474979266404-7eaacbadb8c5?auto=format&fit=crop&w=1920&q=80"
    }
  };

  const current = activeRitual ? rituals[activeRitual] : null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={activeRitual}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${current.video})` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 right-10 pointer-events-auto flex items-center gap-4">
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] text-ivory/50 uppercase tracking-[0.2em]"
        >
          {current?.title}
        </motion.div>
        
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all group shadow-lg"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-3 py-1 rounded text-[9px] whitespace-nowrap border border-white/5">
            {isMuted ? "SESİ AÇ" : "SESİ SİS"}
          </span>
        </button>

        {!isMuted && current && (
           <audio autoPlay loop src={current.sound} />
        )}
      </div>

      {/* RITUAL TRIGGER HOTSPOT (Invisible) */}
      <div 
        className="absolute top-1/2 left-10 w-2 h-2 cursor-help pointer-events-auto"
        onMouseEnter={() => setActiveRitual("ritual")}
        onMouseLeave={() => {
           const hour = new Date().getHours();
           setActiveRitual(hour >= 6 && hour < 18 ? "morning" : "evening");
        }}
      />
    </div>
  );
};
