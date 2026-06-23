"use client";

import { usePathname } from "next/navigation";

function isEnPath(pathname: string | null): boolean {
  return pathname === "/en" || pathname?.startsWith("/en/") || false;
}

export function SkipLink() {
  const englishPath = isEnPath(usePathname());

  return (
    <a href="#icerik" className="skip-link">
      {englishPath ? "Skip to content" : "İçeriğe atla"}
    </a>
  );
}
