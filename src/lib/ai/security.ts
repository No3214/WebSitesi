import { NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limit';

const LIMIT = 5;
const WINDOW = 60 * 1000;

function normalizeIp(ip: string) {
  const raw = ip.split(',')[0]?.trim() || 'anonymous';
  return raw.startsWith('::ffff:') ? raw.replace('::ffff:', '') : raw;
}

/**
 * Audit T4: yerel Map kaldırıldı — paylaşımlı lib/rate-limit backend'i
 * kullanılır (Upstash varsa lambda'lar arası ortak; yoksa in-memory).
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `chat:${normalizeIp(ip)}`;
  const result = await rateLimit(key, LIMIT, WINDOW);
  return result.allowed;
}

export function rateLimitResponse() {
  return NextResponse.json(
    {
      role: 'assistant',
      content:
        'Çok hızlı soru soruyorsunuz. Konağımızın sükunetine uygun olarak, lütfen bir dakika sonra tekrar deneyin.',
      meta: { error: 'RATE_LIMIT_EXCEEDED' },
    },
    { status: 429 },
  );
}
