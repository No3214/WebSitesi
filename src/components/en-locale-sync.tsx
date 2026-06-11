"use client";

import { useEffect } from "react";

/**
 * /en segmenti altında NEXT_LOCALE çerezini "en" olarak sabitler.
 * İçerik dili client bileşenlerde bu çerezden çözüldüğü için
 * sonraki gezinmelerde ağaç otomatik olarak İngilizce okunur.
 * Bilinçli olarak yalnızca çerez yazar — render'a karışmaz, null döner.
 */
export function EnLocaleSync() {
  useEffect(() => {
    document.cookie = "NEXT_LOCALE=en; path=/; max-age=31536000";
  }, []);

  return null;
}
