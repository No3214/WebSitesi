import type { MetadataRoute } from "next";
import { rooms } from "@/data/rooms";
import { siteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/odalar", "/menu", "/organizasyonlar"].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: new Date()
  }));

  const roomPages = rooms.map((room) => ({
    url: `${siteUrl}/odalar/${room.slug}`,
    lastModified: new Date()
  }));

  return [...staticPages, ...roomPages];
}
