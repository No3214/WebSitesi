"use client";

import { useEffect } from "react";

/**
 * /en segmenti altında:
 *  1) <html lang> niteliğini "en" yapar (a11y + SEO; kök layout "tr" basar,
 *     EN sayfalarda dil doğru raporlanmalı). Segmentten çıkınca "tr"ye döner.
 *  2) NEXT_LOCALE çerezini "en" sabitler (client bileşenler dili çerezden çözer).
 * Render'a karışmaz, null döner.
 */
export function EnLocaleSync() {
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.getAttribute("lang") || "tr";
    html.setAttribute("lang", "en");
    document.cookie = "NEXT_LOCALE=en; path=/; max-age=31536000";
    return () => {
      html.setAttribute("lang", prev);
    };
  }, []);

  return null;
}
