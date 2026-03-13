"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Play, Pause } from "lucide-react";

/**
 * Audio Guide Component
 * Provides AI-generated (simulated) audio narration for the brand history.
 */
export const AudioGuide = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Real implementation would use TTS API or pre-recorded CDN assets
    console.log("[AudioGuide] Toggled audio narration");
  };

  return (
    <div className="flex items-center gap-4 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-full px-6">
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center hover:scale-105 transition-transform"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
      </button>
      
      <div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Sesli Rehber</div>
        <div className="text-white text-sm font-serif italic">Konağın Sesini Dinleyin</div>
      </div>

      <div className="flex items-center gap-1 h-4 ml-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div 
            key={i}
            animate={isPlaying ? { height: [4, 16, 4] } : { height: 4 }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
            className="w-0.5 bg-gold/50 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};
