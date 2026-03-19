import { MetadataRoute } from "next";
import { rooms } from "@/data/rooms";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kozbeylikonagi.com";

  const staticPages = [
    { route: "", priority: 1, changeFrequency: "weekly" as const },
    { route: "/odalar", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/gastronomi", priority: 0.8, changeFrequency: "weekly" as const },
    { route: "/menu", priority: 0.7, changeFrequency: "weekly" as const },
    { route: "/hikayemiz", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/organizasyonlar", priority: 0.8, changeFrequency: "weekly" as const },
    { route: "/deneyimler", priority: 0.7, changeFrequency: "weekly" as const },
    { route: "/etkinlikler", priority: 0.7, changeFrequency: "weekly" as const },
    { route: "/galeri", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/iletisim", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/dugun-organizasyon", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/kurumsal", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/sss", priority: 0.5, changeFrequency: "monthly" as const },
    { route: "/misafir-rehberi", priority: 0.5, changeFrequency: "monthly" as const },
    { route: "/kvkk", priority: 0.2, changeFrequency: "yearly" as const },
    { route: "/gizlilik-politikasi", priority: 0.2, changeFrequency: "yearly" as const },
    { route: "/mesafeli-satis-sozlesmesi", priority: 0.2, changeFrequency: "yearly" as const },
    { route: "/cerez-politikasi", priority: 0.2, changeFrequency: "yearly" as const },
    { route: "/kullanim-sartlari", priority: 0.2, changeFrequency: "yearly" as const },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const roomPages = rooms.map((room) => ({
    url: `${baseUrl}/odalar/${room.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...roomPages];
}
