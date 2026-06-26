"use client";

import { useEffect } from "react";

import { wireCtaTracking } from "@/lib/cta-tracking";

/**
 * Site genelindeki [data-event] CTA tıklamalarını GA4 + Meta dönüşüm
 * event'lerine bağlayan tek-sefer delege listener'ı kurar. Render'a karışmaz.
 */
export function CtaEventBridge() {
  useEffect(() => wireCtaTracking(), []);
  return null;
}
