"use client";

import { useEffect, useRef } from "react";
import { trackScrollDepth } from "@/lib/analytics";

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%) for GA4.
 * Fires each milestone only once per page load.
 */
export function useScrollDepth() {
  const fired = useRef(new Set<number>());

  useEffect(() => {
    fired.current.clear();
    const page = window.location.pathname;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((scrollTop / docHeight) * 100);
      const milestones = [25, 50, 75, 100] as const;

      for (const m of milestones) {
        if (percent >= m && !fired.current.has(m)) {
          fired.current.add(m);
          trackScrollDepth(m, page);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}
