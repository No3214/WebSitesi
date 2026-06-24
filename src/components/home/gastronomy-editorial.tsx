"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

type LazyEditorialVideoProps = {
  src: string;
  poster: string;
  label: string;
  playLabel: string;
};

function LazyEditorialVideo({ src, poster, label, playLabel }: LazyEditorialVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [playRequest, setPlayRequest] = useState(0);

  const markPlaybackState = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(
      !video.paused &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.currentTime > 0,
    );
  }, []);

  const start = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      if (
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        (!video.currentSrc && video.networkState === HTMLMediaElement.NETWORK_EMPTY)
      ) {
        video.load();
      }
      await video.play();
      markPlaybackState();
      setPlaybackBlocked(false);
    } catch {
      setIsPlaying(false);
      setPlaybackBlocked(true);
    }
  }, [markPlaybackState]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    setShouldLoad(true);
    setPlayRequest((current) => current + 1);
  }, [isPlaying]);

  useEffect(() => {
    if (playRequest === 0 || !shouldLoad) return;
    void start();
  }, [playRequest, shouldLoad, start]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        poster={poster}
        muted
        loop
        playsInline
        controls={playbackBlocked}
        preload={shouldLoad ? "metadata" : "none"}
        aria-label={label}
        onPlaying={() => {
          markPlaybackState();
          setPlaybackBlocked(false);
        }}
        onLoadedData={markPlaybackState}
        onTimeUpdate={markPlaybackState}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setPlaybackBlocked(true);
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        className="editorial-video-control"
        data-state={isPlaying ? "playing" : playbackBlocked ? "blocked" : "paused"}
        data-testid={`editorial-video-${src.includes("mihlama") ? "mihlama" : "kahvalti"}`}
        aria-label={isPlaying ? label : playLabel}
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause aria-hidden size={22} strokeWidth={2.2} /> : <Play aria-hidden size={22} strokeWidth={2.2} />}
      </button>
    </>
  );
}

export function GastronomyEditorial({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section section-alt gastronomy-editorial-section" id="gastronomi">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "MUTFAĞIN RİTMİ" : "RHYTHM OF THE KITCHEN"}
            title={locale === "tr" ? "Sofrada Yaşayan Miras" : "A Living Heritage at the Table"}
            text={
              locale === "tr"
                ? "Antakya'dan Ege'ye uzanan bir lezzet köprüsü; taş fırından serpme kahvaltıya her an bir tören."
                : "A bridge of flavor from Antakya to the Aegean; every moment a ceremony, from stone oven to breakfast spread."
            }
          />
        </FadeIn>

        <div style={{ display: "grid", gap: "clamp(48px, 7vw, 96px)" }}>
          <FadeIn>
            <div className="editorial">
              <div className="editorial-media">
                <LazyEditorialVideo
                  src="/videos/kahvalti.mp4"
                  poster="/videos/kahvalti-poster.jpg"
                  label={locale === "tr" ? "Serpme köy kahvaltısı videosu" : "Village breakfast video"}
                  playLabel={locale === "tr" ? "Kahvaltı videosunu oynat" : "Play breakfast video"}
                />
                <span className="media-frame" aria-hidden />
              </div>
              <div className="editorial-copy">
                <span className="eyebrow">{locale === "tr" ? "SABAH GÜNEŞİ" : "MORNING SUN"}</span>
                <h3>{locale === "tr" ? "Köy Kahvaltısı Töreni" : "The Village Breakfast Ceremony"}</h3>
                <p>
                  {locale === "tr"
                    ? "Avlunun taş gölgesinde kurulan sofra; köy tereyağı, kahvaltılıklar ve taş fırından yeni çıkmış sıcak ekmekle başlar."
                    : "A table set in the stone shade of the courtyard; it begins with village butter, local delicacies, and warm bread fresh from the stone oven."}
                </p>
                <ul className="editorial-list">
                  <li>{locale === "tr" ? "Yöreden toplanan mevsim ürünleri" : "Seasonal produce from the village"}</li>
                  <li>{locale === "tr" ? "Taş dibekte dövülen kahve ritüeli" : "Coffee ritual in the stone dibek"}</li>
                  <li>{locale === "tr" ? "Konak misafirlerine özel sofra düzeni" : "A table reserved for mansion guests"}</li>
                </ul>
                <Link href="/gastronomi" className="button secondary">
                  {locale === "tr" ? "Gastronomi Hikayesi" : "Gastronomy Story"}
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="editorial reverse">
              <div className="editorial-media">
                <LazyEditorialVideo
                  src="/videos/mihlama.mp4"
                  poster="/videos/mihlama-poster.jpg"
                  label={locale === "tr" ? "Ocakta hazırlanan yöresel lezzet videosu" : "Regional dish on the stove video"}
                  playLabel={locale === "tr" ? "Mıhlama videosunu oynat" : "Play mıhlama video"}
                />
                <span className="media-frame" aria-hidden />
              </div>
              <div className="editorial-copy">
                <span className="eyebrow">{locale === "tr" ? "OCAK BAŞI" : "BY THE HEARTH"}</span>
                <h3>{locale === "tr" ? "İnci Hanım'ın Mutfağı" : "İnci Hanım's Kitchen"}</h3>
                <p>
                  {locale === "tr"
                    ? "Antakya kökenli aile reçeteleri, Ege otlarıyla buluşur. Ocakta ağır ağır pişen her tencere, konağın hafızasından bir sayfadır."
                    : "Family recipes rooted in Antakya meet Aegean herbs. Every pot simmering on the stove is a page from the mansion's memory."}
                </p>
                <ul className="editorial-list">
                  <li>{locale === "tr" ? "Antakya & Ege füzyon menüsü" : "Antakya & Aegean fusion menu"}</li>
                  <li>{locale === "tr" ? "Taş fırında pişen yöresel tarifler" : "Regional recipes from the stone oven"}</li>
                  <li>{locale === "tr" ? "Akşam yemeğinde şef sofrası deneyimi" : "Chef's table experience at dinner"}</li>
                </ul>
                <Link href="/menu" className="button secondary">
                  {locale === "tr" ? "Menüyü Keşfet" : "Explore the Menu"}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
