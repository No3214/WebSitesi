"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export const SunsetMode = () => {
  const [isSunset, setIsSunset] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkTime = () => {
      const hour = new Date().getHours();
      // Sunset mode active between 18:00 and 06:00
      setIsSunset(hour >= 18 || hour < 6);
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {isSunset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[1] mix-blend-multiply bg-[#1a0f00]/10"
          />
        )}
      </AnimatePresence>
      
      {/* Visual Indicator/Toggle in Corner (Optional Premium Touch) */}
      <div className="fixed top-24 right-8 z-[100] hidden lg:block">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-2xl flex items-center gap-2">
           <div className={`p-1.5 rounded-full transition-colors ${!isSunset ? "bg-gold text-white" : "text-zinc-400"}`}>
             <Sun size={14} />
           </div>
           <div className={`p-1.5 rounded-full transition-colors ${isSunset ? "bg-[#1a0f00] text-gold" : "text-zinc-600"}`}>
             <Moon size={14} />
           </div>
        </div>
      </div>

      <style jsx global>{`
        ${isSunset ? `
          :root {
            --soft: #1a1a1a;
            --white: #121212;
            --ivory: #c5a059;
            --text: #e5e5e5;
            --border: rgba(255,255,255,0.1);
          }
          body {
            background-color: #121212;
            color: #e5e5e5;
          }
          .card, .section-alt, .feature-box {
            background-color: #1a1a1a !important;
            border-color: rgba(255,255,255,0.05) !important;
          }
          .header {
            background: rgba(18, 18, 18, 0.9) !important;
            border-bottom-color: rgba(255,255,255,0.05) !important;
          }
          .nav-link { color: #e5e5e5 !important; }
        ` : ""}
      `}</style>
    </>
  );
};
