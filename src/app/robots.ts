import { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/utils';

// Yasal AI arama/alıntı botları açıkça davet edilir (görünürlük niyet beyanı +
// ileride daraltma kolaylığı). Wildcard zaten kapsar; bu yalnız açık beyandır.
const AI_BOTS = [
  "OAI-SearchBot", "ChatGPT-User", "GPTBot",
  "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Bingbot",
  // Applebot = Apple arama/Siri/Spotlight (arama crawler'ı); Applebot-Extended
  // yalnız Apple Intelligence eğitim kontrolü. Arama görünürlüğü için ikisi de davetli.
  "Applebot", "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: ['/admin', '/api'] })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
