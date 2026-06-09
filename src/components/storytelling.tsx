"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const EASE_LUX = [0.16, 1, 0.3, 1] as const;

interface StorySegmentProps {
  title: string;
  content: string;
  image?: string;
  side?: "left" | "right";
}

/**
 * Scroll'a bağlı editoryal hikaye bloğu — marka dili:
 * Playfair serif başlık, gold ayraç, ivory metin, çerçeveli görsel.
 */
export const StorySegment = ({ title, content, image, side = "left" }: StorySegmentProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0, 1, 1, 0.35]);
  const x = useTransform(
    scrollYProgress,
    [0, 0.22, 0.78, 1],
    [side === "left" ? -40 : 40, 0, 0, side === "left" ? -24 : 24]
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity, x }}
      className={`flex flex-col ${side === "left" ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12 py-20 px-6 max-w-7xl mx-auto`}
    >
      <div className="flex-1">
        <span
          className="eyebrow"
          style={{ color: "var(--gold)", fontSize: "0.68rem", letterSpacing: "0.3em" }}
        >
          KOZBEYLİ KONAĞI
        </span>
        <h2
          className="serif"
          style={{
            fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)",
            color: "var(--ivory)",
            lineHeight: 1.15,
            margin: "0 0 20px",
            textWrap: "balance",
          }}
        >
          {title}
        </h2>
        <div
          aria-hidden
          style={{
            height: 1,
            width: 72,
            background: "linear-gradient(90deg, var(--gold), transparent)",
            marginBottom: 24,
          }}
        />
        <p
          style={{
            color: "rgba(250, 249, 246, 0.72)",
            fontSize: "1.08rem",
            lineHeight: 1.9,
            margin: 0,
          }}
        >
          {content}
        </p>
      </div>

      {image && (
        <div className="flex-1 relative aspect-square w-full overflow-hidden shadow-2xl group">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 14,
              border: "1px solid rgba(250, 249, 246, 0.3)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

/**
 * Hikaye sayfaları için sinematik giriş — ink zemin, gold ışıma, serif başlık.
 */
export const StoryHero = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <div
      className="grain"
      style={{
        minHeight: "72vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "140px 24px 80px",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(1100px 480px at 75% -10%, rgba(179, 146, 92, 0.16), transparent 60%), radial-gradient(800px 400px at 10% 110%, rgba(46, 93, 107, 0.16), transparent 55%), var(--ink)",
      }}
    >
      <motion.span
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_LUX }}
        className="eyebrow"
        style={{ position: "relative", zIndex: 2 }}
      >
        {subtitle}
      </motion.span>
      <span style={{ display: "block", overflow: "hidden", position: "relative", zIndex: 2 }}>
        <motion.h1
          initial={{ y: "108%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: EASE_LUX }}
          className="serif"
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5.6rem)",
            color: "var(--ivory)",
            margin: 0,
            lineHeight: 1.08,
            textWrap: "balance",
          }}
        >
          {title}
        </motion.h1>
      </span>
      <motion.div
        aria-hidden
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.9, delay: 0.6, ease: EASE_LUX }}
        style={{
          width: 1,
          height: 64,
          marginTop: 40,
          transformOrigin: "top",
          background: "linear-gradient(180deg, var(--gold), transparent)",
          position: "relative",
          zIndex: 2,
        }}
      />
    </div>
  );
};
