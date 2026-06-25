"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

type CinematicSplitTextProps = {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

/**
 * Stone & Light sinematik baslik reveal (GSAP SplitText — ucretsiz/ticari).
 *
 * - Metin server'da render edilir; SplitText hydrate sonrasi gelistirir
 *   (erisilebilirlik + LCP korunur, metin her zaman DOM'da ve okunur).
 * - `prefers-reduced-motion: reduce` ACIKKEN hicbir animasyon kurulmaz;
 *   metin oldugu gibi gorunur (gsap.matchMedia).
 * - Mount aninda kelime-kelime mask reveal (yPercent 120 -> 0, power3.out).
 * - LCP-kritik hero icin DEGIL; bolum basliklari icin tasarlandi.
 */
export function CinematicSplitText({
  children,
  className,
  as = "h2",
}: CinematicSplitTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = new SplitText(el, { type: "words" });
        const tween = gsap.from(split.words, {
          yPercent: 120,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
        });
        return () => {
          tween.kill();
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={{ overflow: "hidden" }}>
      {children}
    </Tag>
  );
}

export default CinematicSplitText;
