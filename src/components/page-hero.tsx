"use client";

import { useEffect, useRef } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text?: string;
  tone?: "dark" | "light";
  /** Opt-in: basligi GSAP SplitText ile kelime-kelime reveal et. */
  revealTitle?: boolean;
};

/**
 * İç sayfalar için ortak sinematik giriş bandı.
 * Varsayılan açık taş/ivory zemin oda kataloğuyla aynı okuma ritmini korur.
 * `revealTitle` verildiğinde baslik GSAP SplitText ile sinematik acilir:
 *  - h1 metni HER ZAMAN server'da render edilir (SEO + LCP korunur).
 *  - gsap yalniz opt-in sayfada RUNTIME'da lazy yuklenir (diger sayfalari sismez).
 *  - `prefers-reduced-motion: reduce` aciksa hicbir animasyon kurulmaz.
 */
export function PageHero({
  eyebrow,
  title,
  text,
  tone = "light",
  revealTitle = false,
}: PageHeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!revealTitle) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = titleRef.current;
    if (!el) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/SplitText"),
      ]);
      if (cancelled || !el) return;
      gsap.registerPlugin(SplitText);
      const split = new SplitText(el, { type: "words" });
      const tween = gsap.from(split.words, {
        yPercent: 120,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
      });
      cleanup = () => {
        tween.kill();
        split.revert();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [revealTitle]);

  return (
    <section className={`page-hero ${tone === "light" ? "page-hero-light" : "section-dark"} grain`}>
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <span className="eyebrow">{eyebrow}</span>
        <h1 ref={titleRef} style={revealTitle ? { overflow: "hidden" } : undefined}>
          {title}
        </h1>
        {text ? <p>{text}</p> : null}
      </div>
    </section>
  );
}
