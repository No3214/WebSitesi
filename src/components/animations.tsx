"use client";

import { useEffect, useRef, useState } from "react";

function useReducedMotionPreference() {
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

function useElementInView<T extends Element>(rootMargin = "-60px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const reduceMotion = useReducedMotionPreference();
  const { ref, inView } = useElementInView<HTMLDivElement>();
  const directions = {
    up: "translate3d(0, 24px, 0)",
    down: "translate3d(0, -24px, 0)",
    left: "translate3d(24px, 0, 0)",
    right: "translate3d(-24px, 0, 0)",
  };

  if (reduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate3d(0, 0, 0)" : directions[direction],
        transition: `opacity 0.9s var(--ease-lux) ${delay}s, transform 0.9s var(--ease-lux) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  void delay;
  return <div>{children}</div>;
}

/** Görünüme girince hedef değere doğru sayan premium sayaç. */
export function Counter({
  to,
  decimals = 0,
  duration = 1.8,
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin: "-40px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      setValue(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("tr-TR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** Scroll'a bağlı yumuşak parallax sarmalayıcı. */
export function Parallax({
  children,
  offset = 60,
  className,
}: {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}) {
  void offset;
  return <div className={className}>{children}</div>;
}

/** Satır satır maske içinden yükselen başlık reveal'ı. */
export function RevealLines({
  lines,
  as: Tag = "h2",
  className,
  delay = 0,
  trigger = "inView",
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  trigger?: "inView" | "mount";
}) {
  void delay;
  void trigger;

  return (
    <Tag className={className} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ display: "block", overflow: "hidden", padding: "0.08em 0" }}
        >
          <span style={{ display: "block" }}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
