"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { FadeIn } from "@/components/animations";

type Props = { locale: "tr" | "en"; eyebrow: string };

const HERO_VIDEO_SRC = "/videos/hero-property.mp4";

/**
 * Hero arka plan videosu — LCP'ye dokunmadan:
 * - LCP elemanı her zaman poster görselidir (priority + preload); video sayfa
 *   yüklendikten ve ana metrikler sakinleştikten sonra video üstüne fade-in olur.
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
    if (reduceMotion || conn?.saveData) return;

    let idleHandle: number | null = null;
    let loadDelay: number | null = null;

    const revealVideo = () => {
      idleHandle = null;
      setShouldRender(true);
    };

    const scheduleVideo = () => {
      loadDelay = window.setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idleHandle = window.requestIdleCallback(revealVideo, { timeout: 2500 });
          return;
        }

        revealVideo();
      }, 3200);
    };

    if (document.readyState === "complete") {
      scheduleVideo();
    } else {
      window.addEventListener("load", scheduleVideo, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleVideo);
      if (loadDelay !== null) window.clearTimeout(loadDelay);
      if (idleHandle !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    let cancelled = false;
    const timers: number[] = [];

    const start = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) return;

      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
      } catch {
        /* autoplay engellendiyse poster görseliyle devam */
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void start();
    };

    void start();
    timers.push(window.setTimeout(start, 600), window.setTimeout(start, 1800));
    window.addEventListener("focus", start);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pointerdown", start, { once: true });

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("focus", start);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointerdown", start);
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <video
      ref={videoRef}
      className={`hero-video ${playing ? "playing" : ""}`}
      src={HERO_VIDEO_SRC}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster="/images/hero-video-poster.jpg"
      aria-hidden
      tabIndex={-1}
      onCanPlay={() => void videoRef.current?.play().catch(() => {})}
      onPlaying={() => setPlaying(true)}
      onTimeUpdate={(event) => {
        if (event.currentTarget.currentTime > 0) setPlaying(true);
      }}
    />
  );
}

export function HomeHero({ locale, eyebrow }: Props) {
  const heroLines =
    locale === "tr"
      ? ["Tarihin Kalbinde", "Zarif Bir Ege Kaçamağı"]
      : ["In the Heart of History", "An Elegant Aegean Escape"];

  return (
    <section className="hero grain">
      <div className="hero-media">
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
      </div>

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "140px 0 120px" }}>
        <FadeIn direction="down">
          <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
            {eyebrow}
          </span>
        </FadeIn>

        <h1 aria-label={heroLines.join(" ")}>
          {heroLines.map((line) => (
            <span key={line} aria-hidden="true" style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </h1>

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
