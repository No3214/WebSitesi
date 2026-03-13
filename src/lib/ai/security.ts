import { NextResponse } from 'next/server';

// Traditional simple rate limiting (in-memory for demo, should use Redis/Upstash in full prod)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const LIMIT = 5; // 5 requests
const WINDOW = 60 * 1000; // 1 minute window

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > WINDOW) {
    userData.count = 1;
    userData.lastReset = now;
    rateLimitMap.set(ip, userData);
    return true;
  }

  if (userData.count >= LIMIT) {
    return false;
  }

  userData.count++;
  rateLimitMap.set(ip, userData);
  return true;
}

export function rateLimitResponse() {
  return NextResponse.json(
    { 
      role: 'assistant', 
      content: 'Çok hızlı soru soruyorsunuz. Konağımızın sükunetine uygun olarak, lütfen bir dakika sonra tekrar deneyin.',
      meta: { error: 'RATE_LIMIT_EXCEEDED' }
    },
    { status: 429 }
  );
}
