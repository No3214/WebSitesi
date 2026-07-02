"use client";

import { useEffect, useRef, useState } from "react";

/** prefers-reduced-motion tercihini canlı izler (SSR-güvenli). */
export function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Sessiz tanıtım videoları için "görünüme girince oynat, çıkınca duraklat"
 * davranışı. OWNER KARARI (2026-07-02): oda videoları görünür kontrol tuşu
 * olmadan otomatik oynar.
 *
 * Korunan güvenlik/erişilebilirlik hatları:
 * - `prefers-reduced-motion: reduce` → otomatik oynatma YAPILMAZ (poster kalır).
 * - Data Saver (`navigator.connection.saveData`) → otomatik oynatma YAPILMAZ.
 * - Video görünümden çıkınca duraklar (bant genişliği + pil).
 * - `togglePlayback` tıklama/klavye ile duraklatma imkânı verir (WCAG 2.2.2
 *   pause mekanizması — görünür buton şart değildir).
 * - `autoplay` HTML attribute'u KULLANILMAZ; oynatma yalnız gözlemciyle
 *   tetiklenir, böylece ilk viewport'ta ağ isteği oluşmaz (preload="none"/
 *   "metadata" ile birlikte).
 */
export function useAutoplayInView(enabled: boolean, threshold = 0.35) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const userPausedRef = useRef(false);
  const reduced = useReducedMotionPreference();
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    setSaveData(Boolean(conn?.saveData));
  }, []);

  const autoplayAllowed = enabled && !reduced && !saveData;

  useEffect(() => {
    const video = ref.current;
    if (!video || !autoplayAllowed) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          if (userPausedRef.current) return;
          video.defaultMuted = true;
          video.muted = true;
          void video.play().catch(() => {
            /* otomatik oynatma engellenirse poster kalır; hata fırlatılmaz */
          });
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: [0, threshold] },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [autoplayAllowed, threshold]);

  const togglePlayback = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.defaultMuted = true;
      video.muted = true;
      void video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  return { ref, togglePlayback, autoplayAllowed };
}
