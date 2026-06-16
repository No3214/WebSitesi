"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = { locale: "tr" | "en"; eyebrow: string };

const HERO_VIDEO_SRC = "/videos/hero.mp4";
const HERO_VIDEO_IDLE_DELAY_MS = 1500;

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
      }, HERO_VIDEO_IDLE_DELAY_MS);
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
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/hero-video-poster.jpg"
      aria-hidden
      tabIndex={-1}
      onLoadedData={() => void videoRef.current?.play().catch(() => {})}
      onCanPlay={() => void videoRef.current?.play().catch(() => {})}
      onPlaying={() => setPlaying(true)}
      onTimeUpdate={(event) => {
        if (event.currentTarget.currentTime > 0) setPlaying(true);
      }}
    >
      <source src={HERO_VIDEO_SRC} type="video/mp4" />
    </video>
  );
}

export function HomeHero({ locale, eyebrow }: Props) {
  const heroLines =
    locale === "tr"
      ? ["Tarihin Kalbinde", "Zarif Bir Ege Kaçamağı"]
      : ["In the Heart of History", "An Elegant Aegean Escape"];
  const reservationHref = locale === "en" ? "/en/rezervasyon" : "/rezervasyon";
  const eventsHref = locale === "en" ? "/en/organizasyonlar" : "/organizasyonlar";

  return (
    <section className="hero grain">
      <div className="hero-media">
        <picture>
          <source
            type="image/webp"
            srcSet="/images/hero-video-poster-640.webp 640w, /images/hero-video-poster-960.webp 960w, /images/hero-video-poster-1280.webp 1280w, /images/hero-video-poster-1440.webp 1440w"
            sizes="100vw"
          />
          <img
            src="/images/hero-video-poster-1280.webp"
            srcSet="/images/hero-video-poster-640.webp 640w, /images/hero-video-poster-960.webp 960w, /images/hero-video-poster-1280.webp 1280w, /images/hero-video-poster-1440.webp 1440w"
            sizes="100vw"
            width={1440}
            height={2560}
            className="hero-poster object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            alt={locale === "tr" ? "Kozbeyli Konağı taş cephesi ve Ege manzarası" : "Kozbeyli Konağı stone facade and Aegean view"}
          />
        </picture>
        <HeroVideo />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "140px 0 120px" }}>
        <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
          {eyebrow}
        </span>

        <h1 aria-label={heroLines.join(" ")}>
          {heroLines.map((line) => (
            <span key={line} aria-hidden="true" style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </h1>

        <p className="hero-text">
          {locale === "tr"
            ? "500 yıllık tescilli taş mimarinin içinde, Foça'ya 12 dakika; kişiselleştirilmiş hizmet ve rafine bir sükunet."
            : "Within 500-year-old registered stone architecture, 12 minutes from Foça; personalized service and refined serenity."}
        </p>

        <div className="hero-actions">
          <Link href={reservationHref} className="button gold">
            {locale === "tr" ? "Hemen Rezervasyon" : "Book Now"}
          </Link>
          <Link href={eventsHref} className="button ghost-light">
            {locale === "tr" ? "Davet & Etkinlik Planla" : "Plan an Event"}
          </Link>
        </div>
        <div className="hero-divider" aria-hidden />
      </div>

      <div className="scroll-cue" aria-hidden>
        <span>{locale === "tr" ? "Keşfet" : "Explore"}</span>
        <span className="line" />
      </div>
    </section>
  );
}
