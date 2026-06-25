// Kozbeyli Konağı — Stone & Light Motion Design System
//
// Tek kaynak motion token'lari. Amac: animasyon sure/easing/sinir degerlerinin
// tum bilesenlerde tutarli olmasi ve "her bolum ayni FadeIn" yerine anlamli,
// olculu hareket. Degerler master prompt'taki motion sistemiyle uyumludur ve
// tests/motion-tokens.test.ts ile pinlenir (regresyon korumasi).
//
// Ilkeler: transform + opacity oncelikli, layout shift yok, mobilde azaltilmis
// hareket, reduced-motion tam destek, CTA gecikmesi yok.

/** Animasyon sureleri (ms). */
export const MOTION_DURATION = {
  micro: 160,
  fast: 240,
  standard: 520,
  editorialReveal: 820,
  routeTransition: 360,
} as const;

/** Stagger gecikmesi (ms). */
export const MOTION_STAGGER_MS = 90;

/** Easing egrileri. Giris yumusak ease-out, cikis hizli ease-in. */
export const MOTION_EASING = {
  enter: "cubic-bezier(0.22, 1, 0.36, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  hover: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/** Hareket siniri kapilari (premium algiyi korur — abartiya kacma). */
export const MOTION_CAPS = {
  parallaxTravelPx: 24,
  hoverScale: 1.015,
  cardTiltDeg: 3,
  magneticOffsetPx: 6,
} as const;

export type MotionDurationToken = keyof typeof MOTION_DURATION;

/** ms degerini saniyelik CSS string'e cevirir (orn. 520 -> "0.52s"). */
export function ms(value: number): string {
  return `${value / 1000}s`;
}
