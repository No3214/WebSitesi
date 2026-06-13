import { MetadataRoute } from 'next';
import { rooms } from '@/data/rooms';

// hreflang (T16): Google alternatifleri HTML, HTTP header VEYA sitemap ile kabul
// eder. Sayfa bazlı metadata.alternates çocukta ezildiğinden (Next merge
// davranışı) hreflang burada, sitemap üzerinden bildirilir. EN karşılığı olan
// rotalar EN_ROUTES'ta; /en sayfaları da ayrı kayıt olarak listelenir.
const EN_ROUTES = new Set([
  '',
  '/odalar',
  '/menu',
  '/gastronomi',
  '/organizasyonlar',
  '/rezervasyon',
  '/iletisim',
  '/sss',
  '/galeri',
  '/hikayemiz',
  '/misafir-rehberi',
  '/deneyimler',
  '/teklifler',
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.kozbeylikonagi.com';

  const withAlternates = (route: string) =>
    EN_ROUTES.has(route)
      ? {
          alternates: {
            languages: {
              tr: `${baseUrl}${route === '' ? '/' : route}`,
              en: `${baseUrl}/en${route}`,
            },
          },
        }
      : {};

  const staticPages = [
    '',
    '/rezervasyon',
    '/odalar',
    '/menu',
    '/gastronomi',
    '/hikayemiz',
    '/organizasyonlar',
    '/deneyim-tasarimcisi',
    '/misafir-rehberi',
    '/deneyimler',
    '/deneyimler/kozbeyli-koyu-rehberi',
    '/deneyimler/foca-gezi-rehberi',
    '/deneyimler/ege-gastronomi-rotasi',
    '/teklifler',
    '/galeri',
    '/sss',
    '/iletisim',
    '/odeme',
    '/kvkk',
    '/gizlilik-politikasi',
    '/cerez-politikasi',
    '/mesafeli-satis-sozlesmesi',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : route === '/rezervasyon' ? 0.9 : 0.8,
    ...withAlternates(route),
  }));

  const enPages = Array.from(EN_ROUTES).map((route) => ({
    url: `${baseUrl}/en${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: {
      languages: {
        tr: `${baseUrl}${route === '' ? '/' : route}`,
        en: `${baseUrl}/en${route}`,
      },
    },
  }));

  const roomPages = rooms.flatMap((room) => [
    {
      url: `${baseUrl}/odalar/${room.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: {
          tr: `${baseUrl}/odalar/${room.slug}`,
          en: `${baseUrl}/en/odalar/${room.slug}`,
        },
      },
    },
    {
      url: `${baseUrl}/en/odalar/${room.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          tr: `${baseUrl}/odalar/${room.slug}`,
          en: `${baseUrl}/en/odalar/${room.slug}`,
        },
      },
    },
  ]);

  return [...staticPages, ...enPages, ...roomPages];
}
