import { MetadataRoute } from 'next';
import { rooms } from '@/data/rooms';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.kozbeylikonagi.com';

  const staticPages = [
    '',
    '/odalar',
    '/menu',
    '/organizasyonlar',
    '/kvkk',
    '/mesafeli-satis-sozlesmesi',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const roomPages = rooms.map((room) => ({
    url: `${baseUrl}/odalar/${room.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...roomPages];
}
