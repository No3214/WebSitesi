import { MetadataRoute } from 'next';
import { rooms } from '@/data/rooms';
import { siteUrl } from '@/lib/utils';

// hreflang (T16): Google alternatifleri HTML, HTTP header VEYA sitemap ile kabul
// eder. Sayfa bazlı metadata.alternates çocukta ezildiğinden (Next merge
// davranışı) hreflang burada, sitemap üzerinden bildirilir.
const EN_ROUTE_BY_TR_ROUTE = {
  '': '/en',
  '/odalar': '/en/rooms',
  '/menu': '/en/menu',
  '/gastronomi': '/en/dining',
  '/organizasyonlar': '/en/events',
  '/rezervasyon': '/en/booking',
  '/iletisim': '/en/contact',
  '/lokasyon': '/en/location',
  '/sss': '/en/faq',
  '/galeri': '/en/gallery',
  '/hikayemiz': '/en/our-story',
  '/misafir-rehberi': '/en/guest-guide',
  '/deneyimler': '/en/experiences',
  '/teklifler': '/en/offers',
  '/kvkk': '/en/kvkk',
  '/gizlilik-politikasi': '/en/gizlilik-politikasi',
  '/cerez-politikasi': '/en/cerez-politikasi',
  '/mesafeli-satis-sozlesmesi': '/en/mesafeli-satis-sozlesmesi',
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;

  const withAlternates = (route: string) => {
    const enRoute = EN_ROUTE_BY_TR_ROUTE[route as keyof typeof EN_ROUTE_BY_TR_ROUTE];
    return enRoute
      ? {
          alternates: {
            languages: {
              tr: `${baseUrl}${route === '' ? '/' : route}`,
              en: `${baseUrl}${enRoute}`,
            },
          },
        }
      : {};
  };

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
    '/lokasyon',
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

  const enPages = Object.entries(EN_ROUTE_BY_TR_ROUTE).map(([route, enRoute]) => ({
    url: `${baseUrl}${enRoute}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: {
      languages: {
        tr: `${baseUrl}${route === '' ? '/' : route}`,
        en: `${baseUrl}${enRoute}`,
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
          en: `${baseUrl}/en/rooms/${room.slug}`,
        },
      },
    },
    {
      url: `${baseUrl}/en/rooms/${room.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          tr: `${baseUrl}/odalar/${room.slug}`,
          en: `${baseUrl}/en/rooms/${room.slug}`,
        },
      },
    },
  ]);

  return [...staticPages, ...enPages, ...roomPages];
}
