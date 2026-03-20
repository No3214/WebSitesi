"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/hooks/use-dictionary";

type Stat = {
  value: number;
  suffix: string;
  label: { tr: string; en: string };
  decimals?: number;
};

const stats: Stat[] = [
  { value: 150, suffix: "+", label: { tr: "Yıllık Tarih", en: "Years of History" } },
  { value: 16, suffix: "", label: { tr: "Butik Oda", en: "Boutique Rooms" } },
  { value: 9.2, suffix: "", label: { tr: "Misafir Puanı", en: "Guest Rating" }, decimals: 1 },
  { value: 5000, suffix: "+", label: { tr: "Mutlu Misafir", en: "Happy Guests" } },
];

function AnimatedNumber({ target, suffix, decimals = 0 }: { target: number; suffix: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              if (timer) clearInterval(timer);
              timer = null;
            } else {
              setCount(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [target]);

  return (
    <span ref={ref} className="serif" style={{ fontSize: "3rem", fontWeight: 600, color: "var(--gold)", display: "block", lineHeight: 1 }}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString("tr-TR")}{suffix}
    </span>
  );
}

export function StatsCounter({ locale }: { locale: Locale }) {
  return (
    <div className="stats-grid">
      {stats.map((stat, i) => (
        <div key={i}>
          <AnimatedNumber target={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
          <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#999", marginTop: "8px", display: "block" }}>
            {stat.label[locale]}
          </span>
        </div>
      ))}
      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          text-align: center;
          padding: 60px 0;
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
          }
        }
      `}</style>
    </div>
  );
}
