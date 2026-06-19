import { NextResponse } from 'next/server';
import { LLMContextGenerator } from '@/lib/ai/llm-context-generator';
import { rateLimit } from '@/lib/rate-limit';

const LIMIT = 5;
const WINDOW = 60 * 1000;

function normalizeIp(ip: string) {
  const raw = ip.split(',')[0]?.trim() || 'anonymous';
  return raw.startsWith('::ffff:') ? raw.replace('::ffff:', '') : raw;
}

async function checkRateLimit(ip: string): Promise<boolean> {
  const result = await rateLimit(`llm-context:${normalizeIp(ip)}`, LIMIT, WINDOW);
  return result.allowed;
}

/**
 * LLM-Native Context API Endpoint
 * Optimized for travel-focused LLMs (Perplexity, Gemini, OpenAI Search).
 * Provides the "Soul" of the property in a high-density JSON format.
 */
export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      { error: 'RATE_LIMIT_EXCEEDED' },
      { status: 429 },
    );
  }

  const context = LLMContextGenerator.getCoreContext();
  
  return NextResponse.json(context, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
      'X-AI-Search-Ready': 'true',
      'X-Content-Policy': 'evidence-gated'
    }
  });
}
