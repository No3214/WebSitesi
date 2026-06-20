"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { 
  Volume2, VolumeX, Sliders, X, 
  Bird, Flame, Droplet, Check
} from "lucide-react";

type RitualType = "morning" | "evening" | "ritual";

/**
 * Atmospheric Immersion Component
 * Handles the Aegean light rituals and cinematic sense of place.
 * Includes 'Liquid Gold' (Olive Oil) and 'Mansion Rhythms'.
 */
export const AtmosphericImmersion = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [activeRitual, setActiveRitual] = useState<RitualType>("morning");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const rituals = useMemo(() => ({
    morning: {
      id: "morning" as RitualType,
      title: "Kozbeyli Sabahı",
      description: "Köyün uyanışı, taze kuş sesleri ve taş duvarlara düşen ilk güneş ışığı.",
      sound: "https://assets.mixkit.co/sfx/preview/mixkit-forest-bird-chirping-with-wind-1216.mp3",
      video: "/images/odalar/superrior-oda-deniz-manzarali/2.jpg",
      icon: Bird
    },
    evening: {
      id: "evening" as RitualType,
      title: "Konakta Akşam",
      description: "Avluda yanan ateş, gaz lambasının sıcaklığı ve Kozbeyli'nin beş asırlık sessizliği.",
      sound: "https://assets.mixkit.co/sfx/preview/mixkit-crackling-fireplace-754.mp3",
      video: "/images/odalar/3-kisilik-oda/2.jpg",
      icon: Flame
    },
    ritual: {
      id: "ritual" as RitualType,
      title: "Sıvı Altın Ritüeli",
      description: "Bahçemizden süzülen el değmemiş zeytinyağının, taş kaselere dökülen o yoğun dokusu.",
      sound: "https://assets.mixkit.co/sfx/preview/mixkit-water-pour-into-glass-3037.mp3",
      video: "/images/hero.jpg",
      icon: Droplet
    }
  }), []);

  const current = rituals[activeRitual];

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    // Initial ritual based on time
    const hour = new Date().getHours();
    setActiveRitual(hour >= 6 && hour < 18 ? "morning" : "evening");
  }, []);

  // Sync state to HTML5 Audio Element
  useEffect(() => {
    if (!isMounted) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(current.sound);
      audioRef.current.loop = true;
    } else {
      // Smoothly crossfade sound source
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = current.sound;
      if (wasPlaying && !isMuted) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }

    audioRef.current.volume = isMuted ? 0 : volume;
  }, [activeRitual, isMounted, current.sound, isMuted, volume]);

  // Sync volume adjustments
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      setIsMuted(false);
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      setIsMuted(true);
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const selectRitual = useCallback((type: RitualType) => {
    if (activeRitual === type || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveRitual(type);
    
    if (audioRef.current && !isMuted) {
      audioRef.current.src = rituals[type].sound;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);
  }, [activeRitual, isTransitioning, isMuted, rituals]);

  // Scroll-based ritual trigger (Chaos Guarded)
  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      if (isTransitioning || isOpen) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      
      if (scrollPercent > 0.45 && scrollPercent < 0.55 && activeRitual !== "ritual") {
        selectRitual("ritual");
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransitioning, selectRitual, activeRitual, isOpen, isMounted]);

  if (!isMounted) return null;

  return (
    <>
      <style>{`
        @keyframes custom-soundwave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .soundwave-bar {
          width: 2px;
          background-color: var(--gold);
          border-radius: 2px;
          display: inline-block;
        }
        .soundwave-bar.animating {
          animation: custom-soundwave 1s ease-in-out infinite;
        }
        .soundwave-bar:nth-child(2).animating { animation-delay: 0.15s; }
        .soundwave-bar:nth-child(3).animating { animation-delay: 0.3s; }
        .soundwave-bar:nth-child(4).animating { animation-delay: 0.45s; }
      `}</style>

      {/* Atmospheric Background Image Layer */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRitual}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${current.video})` }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Control Trigger & Menu Panel */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-3 pointer-events-auto">
        
        {/* Customizer Sidebar/Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-[#fffcf6]/95 backdrop-blur-xl border border-[rgba(61,74,59,0.14)] rounded-2xl p-6 w-[320px] shadow-2xl text-[var(--olive)] flex flex-col gap-5"
              style={{ boxShadow: "0 20px 50px rgba(68, 53, 31, 0.14)" }}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[rgba(61,74,59,0.1)] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders size={15} className="text-gold" />
                  <span className="serif text-[0.95rem] tracking-wider uppercase font-semibold text-[var(--olive)]">Atmosfer Paneli</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[var(--muted)] hover:text-[var(--olive)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Ritual Selector Cards */}
              <div className="flex flex-col gap-2.5">
                {(Object.keys(rituals) as RitualType[]).map((key) => {
                  const item = rituals[key];
                  const Icon = item.icon;
                  const isSelected = activeRitual === key;

                  return (
                    <button
                      key={key}
                      onClick={() => selectRitual(key)}
                      className={`text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                        isSelected 
                          ? "bg-gold/10 border-gold/40 text-[var(--olive)]"
                          : "bg-white/60 border-[rgba(61,74,59,0.1)] text-[var(--muted)] hover:bg-white"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-gold/20 text-gold" : "bg-[rgba(61,74,59,0.06)] text-[var(--muted)]"}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="serif text-[0.85rem] font-medium tracking-wide">{item.title}</span>
                          {isSelected && <Check size={12} className="text-gold" />}
                        </div>
                        <p className="text-[0.7rem] text-[var(--muted)] leading-normal mt-1">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Volume & Audio Controls */}
              <div className="bg-white/70 border border-[rgba(61,74,59,0.1)] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[0.75rem] text-[var(--muted)] uppercase tracking-widest">
                  <span>Ses Düzeyi</span>
                  <span>{isMuted ? "Sessiz" : `${Math.round(volume * 100)}%`}</span>
                </div>
                
                <div className="flex items-center gap-3.5">
                  <button 
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>

                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="flex-1 h-1 bg-[rgba(61,74,59,0.16)] rounded-lg appearance-none cursor-pointer accent-gold"
                    style={{
                      accentColor: "var(--gold)"
                    }}
                  />
                </div>
              </div>

              {/* Bottom Brand Slogan */}
              <div className="text-center text-[0.65rem] text-[var(--muted)] tracking-widest uppercase">
                Beş Asırlık Köy Dokusunda Yavaş Rota
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Quick Action Row */}
        <div className="flex items-center gap-2">
          
          {/* Active Sound Indicator Pill */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsOpen(!isOpen)}
            className="bg-[#fffcf6]/92 backdrop-blur-md px-4 py-2.5 rounded-full border border-[rgba(61,74,59,0.14)] text-[10px] text-[var(--olive)] uppercase tracking-[0.2em] flex items-center gap-2.5 cursor-pointer hover:bg-white hover:border-gold/40 transition-all shadow-xl"
          >
            {/* Animated Soundwave lines */}
            <div className="flex items-center gap-0.5 h-4 w-4">
              <span className={`soundwave-bar ${!isMuted && isPlaying ? "animating" : ""}`} style={{ height: "6px" }} />
              <span className={`soundwave-bar ${!isMuted && isPlaying ? "animating" : ""}`} style={{ height: "12px" }} />
              <span className={`soundwave-bar ${!isMuted && isPlaying ? "animating" : ""}`} style={{ height: "8px" }} />
              <span className={`soundwave-bar ${!isMuted && isPlaying ? "animating" : ""}`} style={{ height: "10px" }} />
            </div>
            <span className="text-[var(--olive)] font-medium">{current.title}</span>
          </motion.div>

          {/* Quick Toggle Mute/Play Button */}
          <button 
            onClick={togglePlay}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all group shadow-xl border relative ${
              isMuted 
                ? "bg-[#fffcf6]/92 border-[rgba(61,74,59,0.14)] text-[var(--olive)] hover:text-gold"
                : "bg-gold text-black border-gold hover:bg-white hover:text-black"
            }`}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: 0,
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              borderWidth: 0,
            }}>{isMuted ? "SESİ AÇ" : "SESİ SİS"}</span>
          </button>

          {/* Panel Open/Close Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all group shadow-xl border ${
              isOpen 
                ? "bg-gold text-black border-gold" 
                : "bg-[#fffcf6]/92 border-[rgba(61,74,59,0.14)] text-[var(--olive)] hover:border-gold/40 hover:text-gold"
            }`}
          >
            <Sliders size={15} />
          </button>

        </div>
      </div>
    </>
  );
};
