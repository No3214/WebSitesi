"use client";

import { useEffect } from "react";

import { gsap } from "gsap";

/**
 * Reduced-motion farkindali GSAP koreografi yardimcisi.
 *
 * setup({ full }) iki kez cagrilabilir:
 *  - full = true  -> `prefers-reduced-motion: no-preference` (parallax/scrub/scrub serbest)
 *  - full = false -> `prefers-reduced-motion: reduce` (sadece opacity fade kurgula)
 *
 * `gsap.matchMedia()` kullanilir; revert() ile tum kurulum temizlenir.
 * Yalniz "use client" sinematik bilesenlerde kullan.
 */
export function useCinematic(
  setup: (ctx: { full: boolean }) => void,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      setup({ full: true });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      setup({ full: false });
    });
    return () => {
      mm.revert();
    };
    // deps cagiranin sorumlulugunda; setup kasitli olarak dependency degil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
