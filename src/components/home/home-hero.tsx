"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { FadeIn, RevealLines } from "@/components/animations";

type Props = { locale: "tr" | "en"; eyebrow: string };

/**
 * Hero arka plan videosu — LCP'ye dokunmadan:
 * - LCP elemanı her zaman hero.jpg (priority + preload); video sayfa "load"
 *   olduktan sonra yüklenir ve oynamaya başlayınca üstüne fade-in olur.
 * - Dar ekran (<768px) ve Data Saver'da hiç yüklenmez (master şartname:
 *   mobilde poster/fallback). Not: prefers-reduced-motion sitewide ele
 *   alınmadığından (framer-motion animasyonları da bakmıyor) burada tek
 *   başına uygulanmıyor; WCAG turu yapılırken birlikte ele alınacak.
 */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const smallScreen = window.matchMedia("(max-width: 767px)").matches;
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (smallScreen || conn?.saveData) return;

    const start = () => {
      const video = videoRef.current;
      if (!video) return;
      video.src = "/videos/hero.mp4";
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
  }, []);

  return (
    <video
      ref={videoRef}
      className={`hero-video ${playing ? "playing" : ""}`}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
  );
}

export function HomeHero({ locale, eyebrow }: Props) {
  return (
    <section className="hero grain">
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 9, ease: "easeOut" }}
        className="hero-media"
      >
        <Image
          src="/images/hero.jpg"
          alt={locale === "tr" ? "Kozbeyli Konağı taş avlusu" : "Kozbeyli Konağı stone courtyard"}
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
          lines={
            locale === "tr"
              ? ["Taşın Hafızasında", "Zarif Bir Ege Kaçamağı"]
              : ["An Elegant Aegean Escape", "In the Memory of Stone"]
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
