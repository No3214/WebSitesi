"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import Lenis from "lenis";

/**
 * Stone & Light yumusak kaydirma saglayicisi (Lenis, MIT).
 *
 * - `prefers-reduced-motion: reduce` ACIKKEN Lenis hic baslamaz; native scroll korunur
 *   (WCAG 2.3.3). Boylece scroll-snap/anchor/scroll-restoration bozulmaz.
 * - GSAP ScrollTrigger yukluyse dinamik olarak senkronlanir (lenis scroll -> ST.update).
 * - SSR guvenli: yalniz client'ta, effect icinde calisir. Temiz teardown.
 *
 * Not: bilincli olarak GLOBAL mount edilmedi. Sinematik koreografi isteyen
 * sayfada/agacta sarmalayici olarak kullanilir; booking/forma dokunmaz.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let detach: (() => void) | undefined;
    import("gsap/ScrollTrigger")
      .then((mod) => {
        const ST = (mod as { ScrollTrigger?: { update: () => void } }).ScrollTrigger;
        if (!ST) return;
        const onScroll = () => ST.update();
        lenis.on("scroll", onScroll);
        detach = () => lenis.off("scroll", onScroll);
      })
      .catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      detach?.();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

export default SmoothScrollProvider;
