"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

interface StorySegmentProps {
  title: string;
  content: string;
  image?: string;
  side?: "left" | "right";
}

export const StorySegment = ({ title, content, image, side = "left" }: StorySegmentProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const x = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [side === "left" ? -50 : 50, 0, 0, side === "left" ? -50 : 50]);

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, x }}
      className={`flex flex-col ${side === "left" ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12 py-24 px-6 max-w-7xl mx-auto`}
    >
      <div className="flex-1 space-y-6">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
          {title}
        </h2>
        <div className="h-1 w-20 bg-zinc-800" />
        <p className="text-zinc-400 text-lg leading-relaxed font-serif italic">
          {content}
        </p>
      </div>
      
      {image && (
        <div className="flex-1 relative aspect-square w-full rounded-3xl overflow-hidden border border-zinc-800 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
        </div>
      )}
    </motion.div>
  );
};

export const StoryHero = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.5)_0%,rgba(0,0,0,1)_100%)] opacity-50" />
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter z-10"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-zinc-500 font-mono tracking-widest text-xs mt-6 z-10"
      >
        {subtitle}
      </motion.p>
    </div>
  );
};
