"use client";

import { Children, useEffect, useRef, useState } from "react";
import type { AnchorHTMLAttributes, CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";

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
  children: ReactNode;
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
  stagger = 0.1,
  className,
}: {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotionPreference();
  const { ref, inView } = useElementInView<HTMLDivElement>();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className} data-stagger-state={inView ? "visible" : "hidden"}>
      {Children.toArray(children).map((child, index) => (
        <div
          key={index}
          className="stagger-item"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translate3d(0, 0, 0)" : "translate3d(0, 18px, 0)",
            transition: `opacity 0.8s var(--ease-lux) ${delay + index * stagger}s, transform 0.8s var(--ease-lux) ${delay + index * stagger}s`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
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
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion) return;

    const distance = Math.max(-24, Math.min(24, offset));
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const y = Math.max(-1, Math.min(1, progress)) * -distance;
      node.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [offset, reduceMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
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
  const reduceMotion = useReducedMotionPreference();
  const { ref, inView } = useElementInView<HTMLDivElement>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible = reduceMotion || (trigger === "mount" ? mounted : inView);

  return (
    <div ref={ref} className="reveal-lines">
      <Tag className={className} aria-label={lines.join(" ")}>
        {lines.map((line, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{ display: "block", overflow: "hidden", padding: "0.08em 0" }}
          >
            <span
              style={{
                display: "block",
                opacity: visible ? 1 : 0,
                transform: visible ? "translate3d(0, 0, 0)" : "translate3d(0, 105%, 0)",
                transition: `opacity 0.75s var(--ease-lux) ${delay + i * 0.08}s, transform 0.9s var(--ease-lux) ${delay + i * 0.08}s`,
              }}
            >
              {line}
            </span>
          </span>
        ))}
      </Tag>
    </div>
  );
}

export function MagneticLink({
  children,
  className,
  maxOffset = 6,
  onPointerMove,
  onPointerLeave,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  maxOffset?: number;
}) {
  const reduceMotion = useReducedMotionPreference();
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const move = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    onPointerMove?.(event);
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    const limit = Math.max(0, Math.min(8, maxOffset));
    setOffset({ x: dx * limit, y: dy * limit });
  };

  const leave = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    onPointerLeave?.(event);
    setOffset({ x: 0, y: 0 });
  };

  const innerStyle: CSSProperties = reduceMotion
    ? {}
    : {
        transform: `translate3d(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px, 0)`,
      };

  return (
    <a
      {...props}
      ref={ref}
      className={className ? `${className} magnetic-link` : "magnetic-link"}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <span className="magnetic-link-inner" style={innerStyle}>
        {children}
      </span>
    </a>
  );
}
