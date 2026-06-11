/**
 * Kozbeyli Konağı kapı amblemi — markanın taş kemerli çift kanatlı kapısı.
 * `currentColor` kullanır: bulunduğu yerin text rengini alır (overlay header'da
 * ivory, solid'de olive, footer'da gold). Kaynak: public/logo-mark.svg ile aynı.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 150"
      width={size}
      height={(size * 150) / 120}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 56 A42 42 0 0 1 102 56" />
      <path d="M23 56 A37 37 0 0 1 97 56" />
      <path d="M48 56 A12 12 0 0 1 72 56" />
      <path d="M60 44 L60 19" />
      <path d="M55.4 44.9 L45.6 21.8" />
      <path d="M51.5 47.5 L34 31" />
      <path d="M48.6 51.4 L26 41.5" />
      <path d="M64.6 44.9 L74.4 21.8" />
      <path d="M68.5 47.5 L86 31" />
      <path d="M71.4 51.4 L94 41.5" />
      <path d="M18 56 H102" />
      <path d="M18 60 H102" />
      <path d="M18 60 V138 H102 V60" />
      <path d="M60 60 V138" />
      <rect x="27" y="68" width="26" height="56" rx="1.5" />
      <rect x="30.5" y="71.5" width="19" height="49" rx="1" />
      <path d="M40 71.5 V120.5" />
      <path d="M30.5 88 H49.5" />
      <path d="M30.5 104 H49.5" />
      <rect x="67" y="68" width="26" height="56" rx="1.5" />
      <rect x="70.5" y="71.5" width="19" height="49" rx="1" />
      <path d="M80 71.5 V120.5" />
      <path d="M70.5 88 H89.5" />
      <path d="M70.5 104 H89.5" />
      <circle cx="56.6" cy="95" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="63.4" cy="95" r="1.7" fill="currentColor" stroke="none" />
      <path d="M18 72 H27 M18 84 H27 M18 97 H27 M18 110 H27 M18 123 H27" />
      <path d="M22.5 60 V72 M22.5 84 V97 M22.5 110 V123 M22.5 130 V138" />
      <path d="M18 130 H27" />
      <path d="M93 72 H102 M93 84 H102 M93 97 H102 M93 110 H102 M93 123 H102" />
      <path d="M97.5 72 V84 M97.5 97 V110 M97.5 123 V130" />
      <path d="M93 130 H102" />
      <path d="M53 76 H67 M53 86 H67 M53 106 H67 M53 116 H67 M53 128 H67" />
      <path d="M27 124 H53 M67 124 H93" />
      <path d="M34 124 V138 M47 131 V138 M73 131 V138 M86 124 V138" />
      <path d="M27 131 H53 M67 131 H93" />
    </svg>
  );
}
