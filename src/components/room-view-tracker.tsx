"use client";

import { useEffect } from "react";

import { trackViewItem } from "@/lib/gtm";

/**
 * GA4 view_item: oda detay sayfası görüntülendiğinde dataLayer'a yazar.
 * Görsel çıktı üretmez; server component olan oda sayfasına eklenir.
 */
export function RoomViewTracker({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    trackViewItem({ slug, title });
  }, [slug, title]);

  return null;
}
