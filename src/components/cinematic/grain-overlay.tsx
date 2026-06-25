import styles from "./grain-overlay.module.css";

/**
 * Dekoratif sicak grain/aurora dokusu (saf CSS, sifir JS).
 * Markaya uyarli (amber/zeytin/fildizi), cok dusuk opacity.
 * pointer-events yok + aria-hidden: erisilebilirligi ve etkilesimi bozmaz.
 * reduced-motion'da statik. Konumlandirmak icin `position: relative` bir kapsayicida kullan.
 */
export function GrainOverlay({ className }: { className?: string }) {
  return (
    <div aria-hidden className={[styles.grain, className].filter(Boolean).join(" ")} />
  );
}

export default GrainOverlay;
