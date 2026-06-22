"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getRouteLocale(pathname: string | null): "tr" | "en" {
  return pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "tr";
}

export function DocumentLocaleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const locale = getRouteLocale(pathname ?? "/");
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;

    if (locale === "en") {
      document.cookie = "NEXT_LOCALE=en; path=/; max-age=31536000";
    }
  }, [pathname]);

  return null;
}
