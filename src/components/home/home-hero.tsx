"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { FadeIn, RevealLines } from "@/components/animations";

type Props = { locale: "tr" | "en"; eyebrow: string };

/**
 * Hero arka plan videosu — LCP'ye dokunmadan:
 * - LCP elemanı her zaman poster görselidir (priority + preload); video sayfa
 *   "load" olduktan sonra yüklenir ve oynamaya başlayınca üstüne fade-in olur.
 * - Data Saver ve reduced-motion'da hiç yüklenmez; mobilde ise Emergent
 *   önizlemesindeki gibi sessiz/playsInline arka plan reel'i devreye girer.
 */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && !conn?.saveData) {
      setShouldRender(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldRender) return;
    const start = () => {
      const video = videoRef.current;
      if (!video) return;
      video.src = "/videos/hero-property.mp4";
      video.play().catch(() => {
        /* autoplay engellendiyse poster görseliyle devam */
      });
    };

    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <video
      ref={videoRef}
      className={`hero-video ${playing ? "playing" : ""}`}
      muted
      loop
      playsInline
      preload="none"
      poster="/images/hero-video-poster.jpg"
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
  );
}

export function HomeHero({ locale, eyebrow }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero grain">
      <motion.div
        initial={reduceMotion ? false : { scale: 1.12 }}
        animate={reduceMotion ? undefined : { scale: 1 }}
        transition={reduceMotion ? undefined : { duration: 9, ease: "easeOut" }}
        className="hero-media"
      >
        <Image
          src="/images/hero-video-poster.jpg"
          alt={locale === "tr" ? "Kozbeyli Konağı taş cephesi ve Ege manzarası" : "Kozbeyli Konağı stone facade and Aegean view"}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          fetchPriority="high"
          quality={82}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        />
        <HeroVideo />
      </motion.div>

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "140px 0 120px" }}>
        <FadeIn direction="down">
          <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
            {eyebrow}
          </span>
        </FadeIn>

        <RevealLines
          as="h1"
          trigger="mount"
          lines={
            locale === "tr"
              ? ["Tarihin Kalbinde", "Zarif Bir Ege Kaçamağı"]
              : ["In the Heart of History", "An Elegant Aegean Escape"]
          }
        />

        <FadeIn delay={0.35}>
          <p className="hero-text">
            {locale === "tr"
              ? "500 yıllık tescilli taş mimarinin içinde, Foça'ya 12 dakika; kişiselleştirilmiş hizmet ve rafine bir sükunet."
              : "Within 500-year-old registered stone architecture, 12 minutes from Foça; personalized service and refined serenity."}
          </p>
        </FadeIn>

        <FadeIn delay={0.5} direction="up">
          <div className="hero-actions">
            <Link href="/rezervasyon" className="button gold">
              {locale === "tr" ? "Hemen Rezervasyon" : "Book Now"}
            </Link>
            <Link href="/organizasyonlar" className="button ghost-light">
              {locale === "tr" ? "Davet & Etkinlik Planla" : "Plan an Event"}
            </Link>
          </div>
          <div className="hero-divider" aria-hidden />
        </FadeIn>
      </div>

      <div className="scroll-cue" aria-hidden>
        <span>{locale === "tr" ? "Keşfet" : "Explore"}</span>
        <span className="line" />
      </div>
    </section>
  );
}
