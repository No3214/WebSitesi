import { NextResponse } from 'next/server';

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

const LIMIT = 5;
const WINDOW = 60 * 1000;

function normalizeIp(ip: string) {
  const raw = ip.split(',')[0]?.trim() || 'anonymous';
  return raw.startsWith('::ffff:') ? raw.replace('::ffff:', '') : raw;
}

function cleanupExpired(now: number) {
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  cleanupExpired(now);

  const key = normalizeIp(ip);
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW });
    return true;
  }

  if (entry.count >= LIMIT) {
    return false;
  }

  entry.count += 1;
  rateLimitMap.set(key, entry);
  return true;
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
