type WaveDividerProps = {
  /** Dalga dolgu rengi (CSS değişkeni veya renk). Varsayılan: sıcak taş tonu. */
  fill?: string;
  /** Piksel yüksekliği (CLS-güvenli sabit yükseklik). */
  height?: number;
  className?: string;
};

/**
 * Haikei tarzı, bağımlılıksız dekoratif SVG dalga ayırıcı.
 * STATİK SVG — sıfır JS, sıfır sürekli perf/pil maliyeti; `aria-hidden`
 * (dekoratif). Sabit yükseklik CLS'i korur. Section geçişlerinde organik
 * bir eğri kenar sağlar; marka sıcak-taş paletiyle uyumludur.
 */
export function WaveDivider({ fill = "var(--stone-warm)", height = 44, className }: WaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={className ? `wave-divider ${className}` : "wave-divider"}
      style={{ height }}
    >
      <svg
        viewBox="0 0 1440 44"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        focusable="false"
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <path d="M0,0 H1440 V20 C1180,44 1000,4 720,16 C440,28 260,44 0,22 Z" fill={fill} />
      </svg>
    </div>
  );
}
